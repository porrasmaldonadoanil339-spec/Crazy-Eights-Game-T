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
  menuMusic: require("@/assets/sounds/menu-music.wav"),
  gameMusic: require("@/assets/sounds/game-music.wav"),
};

type SoundKey = keyof typeof SOUNDS;

let bgPlayer: AudioPlayer | null = null;
let sfxPlayers: Map<SoundKey, AudioPlayer> = new Map();
let currentTrack: "menu" | "game" | null = null;
let isMusicEnabled = true;
let isSfxMuted = false;
let musicVolume = 0.35;
let sfxVolume = 0.85;
let isInitialized = false;

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

export async function startMenuMusic() {
  if (!isMusicEnabled) return;
  if (currentTrack === "menu" && bgPlayer) return;
  await _stopMusicInternal();
  await safe(async () => {
    bgPlayer = createAudioPlayer(SOUNDS.menuMusic);
    bgPlayer.volume = musicVolume;
    bgPlayer.loop = true;
    bgPlayer.play();
    currentTrack = "menu";
  });
}

export async function startGameMusic() {
  if (!isMusicEnabled) return;
  if (currentTrack === "game" && bgPlayer) return;
  await _stopMusicInternal();
  await safe(async () => {
    bgPlayer = createAudioPlayer(SOUNDS.gameMusic);
    bgPlayer.volume = musicVolume;
    bgPlayer.loop = true;
    bgPlayer.play();
    currentTrack = "game";
  });
}

async function _stopMusicInternal() {
  if (!bgPlayer) return;
  await safe(async () => {
    bgPlayer!.pause();
    bgPlayer!.remove();
    bgPlayer = null;
    currentTrack = null;
  });
}

export async function stopMusic() {
  await _stopMusicInternal();
}

export async function pauseMusic() {
  if (!bgPlayer) return;
  await safe(async () => bgPlayer!.pause());
}

export async function resumeMusic() {
  if (!bgPlayer || !isMusicEnabled) return;
  await safe(async () => bgPlayer!.play());
}

export function getCurrentTrack(): "menu" | "game" | null {
  return currentTrack;
}

async function playSfx(key: SoundKey, volume?: number) {
  if (isSfxMuted) return;
  await safe(async () => {
    const player = getOrCreateSfx(key);
    player.volume = volume ?? sfxVolume;
    player.seekTo(0);
    player.play();
  });
}

function haptic(fn: () => Promise<void>) {
  if (Platform.OS !== "web") safe(fn);
}

// ─── Core card sounds ────────────────────────────────────────────────────────

export async function playCardFlip() {
  await playSfx("cardFlip");
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
  // Triple ascending beep — "Crazy Eight!" moment
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
  // Quick swoosh for special cards (2, 3, 7, J, A, 10)
  await playSfx("cardDraw", sfxVolume * 0.9);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playBlockCard() {
  // Thud for block/skip
  await playSfx("button", sfxVolume * 0.8);
  setTimeout(() => playSfx("button", sfxVolume * 0.5).catch(() => {}), 100);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 120);
  });
}

export async function playDrawPenalty() {
  // Rapid card draw sound for penalty draws
  await playSfx("cardDraw");
  setTimeout(() => playSfx("cardDraw", sfxVolume * 0.8).catch(() => {}), 90);
  setTimeout(() => playSfx("cardDraw", sfxVolume * 0.6).catch(() => {}), 180);
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
  });
}

export async function playReverseCard() {
  // Reverse swoosh
  await playSfx("shuffle", sfxVolume * 0.6);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export async function playCountdownBeep() {
  // Countdown tick
  await playSfx("button", sfxVolume * 0.6);
  haptic(() => Haptics.selectionAsync());
}

export async function playMatchStart() {
  // Match starting fanfare
  await playSfx("win", sfxVolume * 0.8);
  setTimeout(() => playSfx("cardFlip", sfxVolume * 0.6).catch(() => {}), 200);
  setTimeout(() => playSfx("wild", sfxVolume * 0.5).catch(() => {}), 400);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
  });
}

export async function playEffectBurst() {
  // Particle effect trigger
  await playSfx("wild", sfxVolume * 0.5);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function playTimerWarning() {
  // Low-time warning tick
  await playSfx("button", sfxVolume * 0.4);
  haptic(() => Haptics.selectionAsync());
}

export async function playJokerPlay() {
  // Joker card played
  await playSfx("wild");
  setTimeout(() => playSfx("wild", sfxVolume * 0.6).catch(() => {}), 150);
  haptic(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

export async function playInactivityWarning() {
  // Warning beep before auto-draw
  await playSfx("button", sfxVolume * 0.5);
  setTimeout(() => playSfx("button", sfxVolume * 0.4).catch(() => {}), 150);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

// ─── New sound events ─────────────────────────────────────────────────────────

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

// ─── Settings ────────────────────────────────────────────────────────────────

export function syncSettings(musicEnabled: boolean, sfxEnabled: boolean) {
  isMusicEnabled = musicEnabled;
  isSfxMuted = !sfxEnabled;
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
}
