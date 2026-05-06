import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const SOUNDS = {
  cardFlip: require("@/assets/sounds/card-flip.wav"),
  cardDraw: require("@/assets/sounds/card-draw.wav"),
  shuffle:  require("@/assets/sounds/shuffle.wav"),
  win:      require("@/assets/sounds/win.wav"),
  lose:     require("@/assets/sounds/lose.wav"),
  button:   require("@/assets/sounds/button.wav"),
  wild:     require("@/assets/sounds/wild.wav"),
  menuMusic: require("@/assets/sounds/menu-music.mp3"),
  gameMusic: require("@/assets/sounds/game-music.mp3"),
  searchMusic: require("@/assets/sounds/search-music.mp3"),
};

type SoundKey = keyof typeof SOUNDS;
type MusicTrack = "menu" | "search" | "game";

let bgPlayer: AudioPlayer | null = null;
let sfxPlayers: Map<SoundKey, AudioPlayer> = new Map();
// Per-track persistent players. Once created, a track player is kept alive so
// its playback position is preserved across menu↔game transitions — switching
// resumes from where the user left off instead of restarting from 0.
const trackPlayers: Map<MusicTrack, AudioPlayer> = new Map();
let currentTrack: MusicTrack | null = null;
let isMusicEnabled = true;
let isSfxMuted = false;
let isHapticEnabled = true;
let isBackgrounded = false;
let musicVolume = 0.35;
let sfxVolume = 0.85;
let isInitialized = false;

// ─── Concurrency lock ─────────────────────────────────────────────────────────
// Ensures only one music transition happens at a time.
// If multiple requests come in during a transition, only the last one is applied.
let transitionInProgress = false;
let pendingTrack: MusicTrack | null = null;
let lastRequestedTrack: MusicTrack | null = null;

async function safe(fn: () => Promise<void>) {
  try { await fn(); } catch {}
}

export async function initAudio() {
  if (isInitialized) return;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    isInitialized = true;
  } catch {}
}

function getOrCreateSfx(key: SoundKey): AudioPlayer {
  if (sfxPlayers.has(key)) return sfxPlayers.get(key)!;
  const player = createAudioPlayer(SOUNDS[key]);
  player.volume = sfxVolume;
  sfxPlayers.set(key, player);
  return player;
}

export async function preloadSounds() {
  await initAudio();
  const keys: SoundKey[] = ["cardFlip", "cardDraw", "shuffle", "button", "wild", "win", "lose"];
  for (const k of keys) {
    try { getOrCreateSfx(k); } catch {}
  }
}

// ─── Core: serialized music transition with crossfade ────────────────────────
const FADE_MS = 380;
const FADE_STEPS = 10;

async function fadeOutCurrent() {
  const player = bgPlayer;
  if (!player) return;
  const startVol = player.volume;
  const stepDur = FADE_MS / FADE_STEPS;
  for (let i = 1; i <= FADE_STEPS; i++) {
    const v = startVol * (1 - i / FADE_STEPS);
    await safe(async () => { player.volume = Math.max(0, v); });
    await new Promise<void>((r) => setTimeout(r, stepDur));
  }
}

async function fadeInCurrent() {
  const player = bgPlayer;
  if (!player) return;
  const targetVol = musicVolume;
  const stepDur = FADE_MS / FADE_STEPS;
  await safe(async () => { player.volume = 0; });
  for (let i = 1; i <= FADE_STEPS; i++) {
    const v = targetVol * (i / FADE_STEPS);
    await safe(async () => { player.volume = Math.min(targetVol, v); });
    await new Promise<void>((r) => setTimeout(r, stepDur));
  }
}

function sourceForTrack(track: MusicTrack) {
  if (track === "menu") return SOUNDS.menuMusic;
  if (track === "search") return SOUNDS.searchMusic;
  return SOUNDS.gameMusic;
}

function getOrCreateTrackPlayer(track: MusicTrack): AudioPlayer | null {
  let p = trackPlayers.get(track) ?? null;
  if (p) return p;
  try {
    p = createAudioPlayer(sourceForTrack(track));
    p.volume = 0;
    p.loop = true;
    trackPlayers.set(track, p);
  } catch { p = null; }
  return p;
}

async function applyMusicTransition(track: MusicTrack) {
  if (currentTrack === track && bgPlayer) return;
  if (!isMusicEnabled) return;

  // True crossfade between persistent per-track players. Old player is paused
  // (NOT destroyed) so its position is preserved; next time we switch back to
  // it, playback resumes seamlessly from where it left off.
  const oldPlayer = bgPlayer;
  const newPlayer = getOrCreateTrackPlayer(track);
  if (newPlayer) {
    await safe(async () => {
      newPlayer.volume = 0;
      newPlayer.play();
    });
    bgPlayer = newPlayer;
    currentTrack = track;
  }
  await Promise.all([
    oldPlayer && oldPlayer !== newPlayer ? fadePlayerTo(oldPlayer, 0) : Promise.resolve(),
    newPlayer ? fadePlayerTo(newPlayer, musicVolume) : Promise.resolve(),
  ]);
  if (oldPlayer && oldPlayer !== newPlayer) {
    await safe(async () => { oldPlayer.pause(); });
  }
}

async function fadePlayerTo(player: any, targetVol: number) {
  const startVol = player.volume ?? 0;
  const stepDur = FADE_MS / FADE_STEPS;
  for (let i = 1; i <= FADE_STEPS; i++) {
    const t = i / FADE_STEPS;
    const v = startVol + (targetVol - startVol) * t;
    await safe(async () => { player.volume = Math.max(0, Math.min(1, v)); });
    await new Promise<void>((r) => setTimeout(r, stepDur));
  }
}

async function requestMusicTrack(track: MusicTrack) {
  // Record the latest desired track
  lastRequestedTrack = track;
  pendingTrack = track;

  // If a transition is already in progress, let it pick up pendingTrack when done
  if (transitionInProgress) return;

  transitionInProgress = true;
  try {
    // Keep processing until there's no more pending request
    while (pendingTrack !== null) {
      const target = pendingTrack;
      pendingTrack = null;
      await applyMusicTransition(target);
    }
  } finally {
    transitionInProgress = false;
  }
}

export async function startMenuMusic() {
  await requestMusicTrack("menu");
}

export async function startGameMusic() {
  await requestMusicTrack("game");
}

export async function startSearchMusic() {
  await requestMusicTrack("search");
}

async function _stopMusicInternal() {
  const player = bgPlayer;
  bgPlayer = null;
  currentTrack = null;
  if (!player) return;
  // Pause but DO NOT remove — we want to preserve playback position so
  // resuming the track later continues from the same point.
  await safe(async () => { player.pause(); });
}

export async function stopMusic() {
  pendingTrack = null; // Cancel any pending transition
  await _stopMusicInternal();
}

export async function resumeCurrentMusic() {
  if (!isMusicEnabled || !lastRequestedTrack) return;
  if (bgPlayer) return; // Already playing
  const track = lastRequestedTrack;
  await requestMusicTrack(track);
}

export async function pauseMusic() {
  if (!bgPlayer) return;
  await safe(async () => bgPlayer!.pause());
}

export async function resumeMusic() {
  if (!bgPlayer || !isMusicEnabled) return;
  await safe(async () => bgPlayer!.play());
}

export function getCurrentTrack(): MusicTrack | null {
  return currentTrack;
}

async function playSfx(key: SoundKey, volume?: number) {
  if (isSfxMuted) return;
  if (isBackgrounded) return;
  await safe(async () => {
    const player = getOrCreateSfx(key);
    player.volume = volume ?? sfxVolume;
    player.seekTo(0);
    player.play();
  });
}

export async function setAppBackgrounded(backgrounded: boolean) {
  isBackgrounded = backgrounded;
  if (backgrounded) {
    // Hard-stop every SFX player too so card sounds never bleed into the home screen
    for (const player of sfxPlayers.values()) {
      await safe(async () => { player.pause(); });
    }
  }
}

function haptic(fn: () => Promise<void>) {
  if (Platform.OS !== "web" && isHapticEnabled) safe(fn);
}

// ─── Core card sounds ────────────────────────────────────────────────────────

export async function playCardFlip() {
  const volume = sfxVolume * (0.8 + Math.random() * 0.2);
  await playSfx("cardFlip", volume);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function playCardDraw() {
  await playSfx("cardDraw");
  haptic(() => Haptics.selectionAsync());
}

export async function playCardWild() {
  await playSfx("wild");
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playShuffle() {
  await playSfx("shuffle");
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

export async function playWin() {
  await playSfx("win");
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export async function playLose() {
  await playSfx("lose");
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

export async function playButton() {
  await playSfx("button", sfxVolume * 0.7);
  haptic(() => Haptics.selectionAsync());
}

export async function playSpeedTick() {
  await playSfx("button", sfxVolume * 0.45);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function playError() {
  await playSfx("button", sfxVolume * 0.5);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export async function playAchievement() {
  await playSfx("win", sfxVolume * 0.9);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

// ─── UI interaction sounds ───────────────────────────────────────────────────

export async function playTabSwitch() {
  await playSfx("button", sfxVolume * 0.5);
  haptic(() => Haptics.selectionAsync());
}

export async function playSelect() {
  await playSfx("cardFlip", sfxVolume * 0.6);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function playEquip() {
  await playSfx("cardDraw", sfxVolume * 0.8);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playMenuOpen() {
  await playSfx("shuffle", sfxVolume * 0.4);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// ─── Reward & progression sounds ─────────────────────────────────────────────

export async function playCoinEarn() {
  await playSfx("wild", sfxVolume * 0.6);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export async function playStreak() {
  await playSfx("win", sfxVolume * 0.7);
  setTimeout(() => playSfx("button", sfxVolume * 0.5).catch(() => {}), 180);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 120);
  });
}

export async function playDailyReward() {
  await playSfx("win");
  setTimeout(() => playSfx("wild", sfxVolume * 0.5).catch(() => {}), 250);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
  });
}

export async function playLevelUp() {
  await playSfx("win");
  setTimeout(() => playSfx("win", sfxVolume * 0.6).catch(() => {}), 300);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
  });
}

// ─── Game event sounds ────────────────────────────────────────────────────────

export async function playOcho() {
  await playSfx("wild");
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.7).catch(() => {}), 120);
  setTimeout(() => playSfx("win", sfxVolume * 0.5).catch(() => {}), 250);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 130);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 260);
  });
}

export async function playSpecialCard() {
  await playSfx("cardDraw", sfxVolume * 0.9);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playBlockCard() {
  await playSfx("button", sfxVolume * 0.8);
  setTimeout(() => playSfx("button", sfxVolume * 0.5).catch(() => {}), 100);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 120);
  });
}

export async function playDrawPenalty() {
  await playSfx("cardDraw");
  setTimeout(() => playSfx("cardDraw", sfxVolume * 0.8).catch(() => {}), 90);
  setTimeout(() => playSfx("cardDraw", sfxVolume * 0.6).catch(() => {}), 180);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
  });
}

export async function playReverseCard() {
  await playSfx("shuffle", sfxVolume * 0.6);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playCountdownBeep() {
  await playSfx("button", sfxVolume * 0.6);
  haptic(() => Haptics.selectionAsync());
}

export async function playMatchStart() {
  await playSfx("win", sfxVolume * 0.8);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.6).catch(() => {}), 200);
  setTimeout(() => playSfx("wild", sfxVolume * 0.5).catch(() => {}), 400);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
  });
}

export async function playEffectBurst() {
  await playSfx("wild", sfxVolume * 0.5);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function playTimerWarning() {
  await playSfx("button", sfxVolume * 0.4);
  haptic(() => Haptics.selectionAsync());
}

export async function playJokerPlay() {
  await playSfx("wild");
  setTimeout(() => playSfx("wild", sfxVolume * 0.6).catch(() => {}), 150);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

export async function playInactivityWarning() {
  await playSfx("button", sfxVolume * 0.5);
  setTimeout(() => playSfx("button", sfxVolume * 0.4).catch(() => {}), 150);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

// ─── New sound events ─────────────────────────────────────────────────────────

// Chest opening sounds — different layered combos so each rarity feels distinct.
export async function playChestOpen(rarity: "common" | "rare" | "epic" | "legendary" | "event" | "fichas") {
  if (rarity === "common") {
    await playSfx("shuffle", sfxVolume * 0.7);
    setTimeout(() => playSfx("cardDraw", sfxVolume * 0.6).catch(() => {}), 220);
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    return;
  }
  if (rarity === "rare") {
    await playSfx("shuffle", sfxVolume * 0.8);
    setTimeout(() => playSfx("wild", sfxVolume * 0.6).catch(() => {}), 200);
    setTimeout(() => playSfx("win", sfxVolume * 0.5).catch(() => {}), 420);
    haptic(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    });
    return;
  }
  if (rarity === "epic") {
    await playSfx("wild", sfxVolume * 0.9);
    setTimeout(() => playSfx("shuffle", sfxVolume * 0.7).catch(() => {}), 180);
    setTimeout(() => playSfx("win", sfxVolume * 0.7).catch(() => {}), 420);
    haptic(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 250);
    });
    return;
  }
  if (rarity === "legendary") {
    await playSfx("wild", sfxVolume);
    setTimeout(() => playSfx("wild", sfxVolume * 0.8).catch(() => {}), 150);
    setTimeout(() => playSfx("shuffle", sfxVolume * 0.8).catch(() => {}), 280);
    setTimeout(() => playSfx("win", sfxVolume).catch(() => {}), 480);
    setTimeout(() => playSfx("win", sfxVolume * 0.6).catch(() => {}), 720);
    haptic(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 450);
    });
    return;
  }
  if (rarity === "event") {
    await playSfx("wild", sfxVolume * 0.85);
    setTimeout(() => playSfx("cardDraw", sfxVolume * 0.7).catch(() => {}), 180);
    setTimeout(() => playSfx("win", sfxVolume * 0.7).catch(() => {}), 380);
    haptic(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 220);
    });
    return;
  }
  // fichas
  await playSfx("cardDraw", sfxVolume * 0.7);
  setTimeout(() => playSfx("wild", sfxVolume * 0.5).catch(() => {}), 140);
  setTimeout(() => playSfx("win", sfxVolume * 0.5).catch(() => {}), 280);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// Reward claim sound — for path/road/battle-pass tier claims.
export async function playRewardClaim() {
  await playSfx("win", sfxVolume * 0.85);
  setTimeout(() => playSfx("wild", sfxVolume * 0.5).catch(() => {}), 180);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

export async function playLastCard() {
  await playSfx("wild", sfxVolume * 0.95);
  setTimeout(() => playSfx("win", sfxVolume * 0.5).catch(() => {}), 140);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 120);
  });
}

export async function playCombo() {
  await playSfx("wild", sfxVolume * 0.8);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.7).catch(() => {}), 100);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playFriendRequest() {
  await playSfx("button", sfxVolume * 0.8);
  setTimeout(() => playSfx("button", sfxVolume * 0.6).catch(() => {}), 120);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export async function playInviteAccepted() {
  await playSfx("win", sfxVolume * 0.85);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

export async function playDealCard() {
  await playSfx("cardFlip", sfxVolume * (0.5 + Math.random() * 0.3));
  haptic(() => Haptics.selectionAsync());
}

export async function playTension() {
  await playSfx("button", sfxVolume * 0.45);
  haptic(() => Haptics.selectionAsync());
}

// ─── Personality SFX combos ──────────────────────────────────────────────────

export async function playMockLaugh() {
  await playSfx("button", sfxVolume * 0.55);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.45).catch(() => {}), 90);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.55).catch(() => {}), 200);
  setTimeout(() => playSfx("button", sfxVolume * 0.45).catch(() => {}), 330);
}

export async function playApplause() {
  await playSfx("shuffle", sfxVolume * 0.6);
  setTimeout(() => playSfx("shuffle", sfxVolume * 0.55).catch(() => {}), 180);
  setTimeout(() => playSfx("win", sfxVolume * 0.7).catch(() => {}), 320);
}

export async function playCrowdGasp() {
  await playSfx("wild", sfxVolume * 0.45);
  setTimeout(() => playSfx("cardDraw", sfxVolume * 0.4).catch(() => {}), 130);
}

export async function playDramaticDrum() {
  await playSfx("button", sfxVolume * 0.7);
  setTimeout(() => playSfx("button", sfxVolume * 0.7).catch(() => {}), 280);
  setTimeout(() => playSfx("button", sfxVolume * 0.85).catch(() => {}), 600);
  setTimeout(() => playSfx("wild", sfxVolume * 0.6).catch(() => {}), 880);
}

export async function playBoo() {
  await playSfx("lose", sfxVolume * 0.55);
  setTimeout(() => playSfx("button", sfxVolume * 0.4).catch(() => {}), 220);
}

export async function playCackle() {
  await playSfx("wild", sfxVolume * 0.5);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.5).catch(() => {}), 90);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.6).catch(() => {}), 180);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.7).catch(() => {}), 280);
}

export async function playVictoryFanfare() {
  await playSfx("win", sfxVolume);
  setTimeout(() => playSfx("wild", sfxVolume * 0.7).catch(() => {}), 220);
  setTimeout(() => playSfx("win", sfxVolume * 0.8).catch(() => {}), 480);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function syncSettings(musicEnabled: boolean, sfxEnabled: boolean, vibrationEnabled?: boolean) {
  isMusicEnabled = musicEnabled;
  isSfxMuted = !sfxEnabled;
  if (vibrationEnabled !== undefined) isHapticEnabled = vibrationEnabled;
  if (!musicEnabled && bgPlayer) {
    pauseMusic().catch(() => {});
  } else if (musicEnabled && bgPlayer) {
    resumeMusic().catch(() => {});
  }
}

export function getMuted() { return isSfxMuted; }
export function getMusicEnabled() { return isMusicEnabled; }

export function setMusicVolume(vol: number) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (bgPlayer) safe(async () => { bgPlayer!.volume = musicVolume; });
}

export function setSfxVolume(vol: number) {
  sfxVolume = Math.max(0, Math.min(1, vol));
}

export async function cleanupAudio() {
  await _stopMusicInternal();
  for (const player of sfxPlayers.values()) {
    try { player.remove(); } catch {}
  }
  sfxPlayers.clear();
  for (const player of trackPlayers.values()) {
    try { player.pause(); player.remove(); } catch {}
  }
  trackPlayers.clear();
}
