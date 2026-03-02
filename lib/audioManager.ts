import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const SOUNDS = {
  cardFlip: require("@/assets/sounds/card-flip.wav"),
  cardDraw: require("@/assets/sounds/card-draw.wav"),
  shuffle: require("@/assets/sounds/shuffle.wav"),
  win: require("@/assets/sounds/win.wav"),
  lose: require("@/assets/sounds/lose.wav"),
  button: require("@/assets/sounds/button.wav"),
  wild: require("@/assets/sounds/wild.wav"),
  menuMusic: require("@/assets/sounds/menu-music.wav"),
  gameMusic: require("@/assets/sounds/game-music.wav"),
};

type SoundKey = keyof typeof SOUNDS;

let bgPlayer: AudioPlayer | null = null;
let sfxPlayers: Map<SoundKey, AudioPlayer> = new Map();
let isMuted = false;
let musicVolume = 0.35;
let sfxVolume = 0.85;
let isInitialized = false;

async function safe(fn: () => Promise<void>) {
  try { await fn(); } catch {}
}

export async function initAudio() {
  if (isInitialized) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
    });
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
  if (isMuted) return;
  await stopMusic();
  await safe(async () => {
    bgPlayer = createAudioPlayer(SOUNDS.menuMusic);
    bgPlayer.volume = musicVolume;
    bgPlayer.loop = true;
    bgPlayer.play();
  });
}

export async function startGameMusic() {
  if (isMuted) return;
  await stopMusic();
  await safe(async () => {
    bgPlayer = createAudioPlayer(SOUNDS.gameMusic);
    bgPlayer.volume = musicVolume;
    bgPlayer.loop = true;
    bgPlayer.play();
  });
}

export async function stopMusic() {
  if (!bgPlayer) return;
  await safe(async () => {
    bgPlayer!.pause();
    bgPlayer!.remove();
    bgPlayer = null;
  });
}

export async function pauseMusic() {
  if (!bgPlayer) return;
  await safe(async () => bgPlayer!.pause());
}

export async function resumeMusic() {
  if (!bgPlayer || isMuted) return;
  await safe(async () => bgPlayer!.play());
}

async function playSfx(key: SoundKey) {
  if (isMuted) return;
  await safe(async () => {
    const player = getOrCreateSfx(key);
    player.volume = sfxVolume;
    player.seekTo(0);
    player.play();
  });
}

function haptic(fn: () => Promise<void>) {
  if (Platform.OS !== "web") safe(fn);
}

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
  await playSfx("button");
  haptic(() => Haptics.selectionAsync());
}

export async function playError() {
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export async function playAchievement() {
  await playSfx("win");
  haptic(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
  });
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (muted) pauseMusic();
  else resumeMusic();
}

export function getMuted() { return isMuted; }

export function setMusicVolume(vol: number) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (bgPlayer) safe(async () => { bgPlayer!.volume = musicVolume; });
}

export async function cleanupAudio() {
  await stopMusic();
  for (const player of sfxPlayers.values()) {
    try { player.remove(); } catch {}
  }
  sfxPlayers.clear();
}
