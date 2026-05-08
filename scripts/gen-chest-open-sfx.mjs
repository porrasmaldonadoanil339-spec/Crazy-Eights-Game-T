// Procedural WAV generator for Task #83 — unique chest opening SFX per rarity.
// Produces 9 distinct mono 16-bit PCM WAV files in assets/sounds/, one for
// each ChestType. Each waveform layers a creak/lid pop, a rarity-specific
// shimmer/fanfare, and a tail. Higher rarities are longer, brighter, and
// have more harmonic layers / chord stacks so the player feels the
// difference between common and legendary openings.
// Run with: node scripts/gen-chest-open-sfx.mjs
import fs from "node:fs";
import path from "node:path";

const SR = 22050;
const OUT_DIR = path.resolve("assets/sounds");
const TAU = Math.PI * 2;

function writeWav(samples, name) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32000), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  console.log("wrote", name, `(${(numSamples / SR).toFixed(2)}s)`);
}

function make(durSec, fn) {
  const n = Math.floor(durSec * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  return out;
}

const env = (t, dur, atk = 0.01, rel = 0.15) => {
  if (t < 0 || t > dur) return 0;
  if (t < atk) return t / atk;
  if (t > dur - rel) return Math.max(0, (dur - t) / rel);
  return 1;
};

// Pseudo-noise (deterministic) — used for creak / lid pop / sparkle texture.
const noise = (i) => ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) * 2 - 1;

// Lid creak: short rising pitched-noise burst (~80ms)
function creak(t, lt, baseFreq, dur, level) {
  if (lt < 0 || lt > dur) return 0;
  const e = env(lt, dur, 0.005, dur * 0.4);
  const f = baseFreq + lt * baseFreq * 1.4;
  const n = noise(Math.floor(lt * SR));
  return (Math.sin(TAU * f * lt) * 0.55 + n * 0.45) * e * level;
}

// Pop / wood thud
function thump(t, lt, freq, dur, level) {
  if (lt < 0 || lt > dur) return 0;
  const e = Math.exp(-lt * 22);
  const f = freq + Math.exp(-lt * 40) * freq * 0.8;
  return Math.sin(TAU * f * lt) * e * level;
}

// Shimmer: filtered high-noise with quick decay (sparkle particles)
function sparkle(t, lt, dur, level) {
  if (lt < 0 || lt > dur) return 0;
  const e = env(lt, dur, 0.01, dur * 0.6);
  const n = noise(Math.floor(lt * SR * 3.1));
  const tone = Math.sin(TAU * (3000 + Math.sin(lt * 25) * 800) * lt);
  return (n * 0.4 + tone * 0.5) * e * level;
}

// Chord stack — sums sine partials at a list of frequencies
function chord(t, lt, dur, freqs, level, atk = 0.02, rel = 0.4) {
  if (lt < 0 || lt > dur) return 0;
  const e = env(lt, dur, atk, rel);
  let s = 0;
  for (const f of freqs) {
    s += Math.sin(TAU * f * lt) * 0.35 + Math.sin(TAU * f * 2 * lt) * 0.08;
  }
  return (s / freqs.length) * e * level;
}

// 1) common — short wooden creak + low pop
writeWav(make(0.55, (t, i) => {
  let s = 0;
  s += creak(t, t, 380, 0.12, 0.55);
  s += thump(t, t - 0.10, 110, 0.25, 0.7);
  s += sparkle(t, t - 0.14, 0.25, 0.10);
  return s;
}), "chest-open-common.wav");

// 2) rare — creak + brighter chime (perfect 5th)
writeWav(make(0.75, (t, i) => {
  let s = 0;
  s += creak(t, t, 460, 0.14, 0.6);
  s += thump(t, t - 0.10, 140, 0.25, 0.65);
  s += chord(t, t - 0.16, 0.55, [523, 784], 0.45);
  s += sparkle(t, t - 0.18, 0.45, 0.18);
  return s;
}), "chest-open-rare.wav");

// 3) magic — mystical shimmer with detuned chord
writeWav(make(0.95, (t, i) => {
  let s = 0;
  s += creak(t, t, 520, 0.16, 0.55);
  s += thump(t, t - 0.10, 150, 0.28, 0.6);
  s += chord(t, t - 0.18, 0.7, [587, 880, 1175], 0.4, 0.05, 0.5);
  s += sparkle(t, t - 0.20, 0.65, 0.25);
  // bell-like pure tone
  const lt = t - 0.18;
  if (lt >= 0) s += Math.sin(TAU * 1760 * lt) * Math.exp(-lt * 4) * 0.18;
  return s;
}), "chest-open-magic.wav");

// 4) epic — deeper boom + major triad swell
writeWav(make(1.05, (t, i) => {
  let s = 0;
  s += creak(t, t, 540, 0.16, 0.65);
  s += thump(t, t - 0.10, 95, 0.40, 0.85);
  s += chord(t, t - 0.20, 0.80, [523, 659, 784, 1047], 0.55, 0.04, 0.55);
  s += sparkle(t, t - 0.22, 0.70, 0.30);
  return s;
}), "chest-open-epic.wav");

// 5) event — celebratory, bouncy two-note chime stack
writeWav(make(1.0, (t, i) => {
  let s = 0;
  s += creak(t, t, 500, 0.14, 0.6);
  s += thump(t, t - 0.10, 130, 0.30, 0.7);
  s += chord(t, t - 0.18, 0.45, [659, 988], 0.5, 0.02, 0.3);
  s += chord(t, t - 0.40, 0.55, [880, 1319], 0.5, 0.02, 0.4);
  s += sparkle(t, t - 0.20, 0.75, 0.28);
  return s;
}), "chest-open-event.wav");

// 6) fichas — coin-shower (high metallic clinks)
writeWav(make(1.0, (t, i) => {
  let s = 0;
  s += creak(t, t, 430, 0.12, 0.5);
  s += thump(t, t - 0.10, 160, 0.20, 0.55);
  // Multiple coin-clinks at random times
  const clinks = [
    [0.18, 1760], [0.27, 2093], [0.34, 1568], [0.42, 2349],
    [0.51, 1976], [0.60, 2637], [0.69, 1865], [0.78, 2217],
  ];
  for (const [at, f] of clinks) {
    const lt = t - at;
    if (lt >= 0 && lt < 0.18) {
      const e = Math.exp(-lt * 18);
      s += (Math.sin(TAU * f * lt) + Math.sin(TAU * f * 2.01 * lt) * 0.3) * e * 0.18;
    }
  }
  return s;
}), "chest-open-fichas.wav");

// 7) giant — very low boom + wide pad
writeWav(make(1.2, (t, i) => {
  let s = 0;
  s += creak(t, t, 420, 0.20, 0.55);
  s += thump(t, t - 0.12, 65, 0.55, 1.0);
  s += thump(t, t - 0.18, 90, 0.45, 0.7);
  s += chord(t, t - 0.22, 0.95, [392, 523, 659, 784], 0.5, 0.06, 0.6);
  s += sparkle(t, t - 0.25, 0.85, 0.30);
  return s;
}), "chest-open-giant.wav");

// 8) legendary — three-note rising fanfare + sustained sparkle tail
writeWav(make(1.6, (t, i) => {
  let s = 0;
  s += creak(t, t, 600, 0.18, 0.7);
  s += thump(t, t - 0.10, 80, 0.50, 0.95);
  // Rising fanfare C5 - E5 - G5 - C6 sustain
  const beats = [
    { at: 0.20, f: 523, dur: 0.22 },
    { at: 0.36, f: 659, dur: 0.22 },
    { at: 0.52, f: 784, dur: 0.22 },
    { at: 0.70, f: 1047, dur: 0.85 },
  ];
  for (const b of beats) {
    const lt = t - b.at;
    if (lt >= 0 && lt < b.dur) {
      const e = env(lt, b.dur, 0.01, 0.18);
      s += (Math.sin(TAU * b.f * lt) * 0.40 + Math.sin(TAU * b.f * 2 * lt) * 0.14
            + Math.sin(TAU * b.f * 3 * lt) * 0.05) * e;
    }
  }
  s += sparkle(t, t - 0.30, 1.20, 0.35);
  return s * 0.85;
}), "chest-open-legendary.wav");

// 9) supreme — ultimate: deep boom + rising fanfare + gong + long shimmer tail
writeWav(make(2.0, (t, i) => {
  let s = 0;
  s += creak(t, t, 700, 0.20, 0.8);
  s += thump(t, t - 0.10, 55, 0.65, 1.0);
  s += thump(t, t - 0.14, 82, 0.50, 0.7);
  // Major-7 chord stack on impact
  s += chord(t, t - 0.20, 0.45, [261, 392, 523, 659], 0.55, 0.02, 0.35);
  // Rising fanfare leading to high C
  const beats = [
    { at: 0.30, f: 523, dur: 0.20 },
    { at: 0.46, f: 659, dur: 0.20 },
    { at: 0.62, f: 784, dur: 0.20 },
    { at: 0.78, f: 1047, dur: 0.20 },
    { at: 0.94, f: 1319, dur: 1.05 },
  ];
  for (const b of beats) {
    const lt = t - b.at;
    if (lt >= 0 && lt < b.dur) {
      const e = env(lt, b.dur, 0.01, 0.25);
      s += (Math.sin(TAU * b.f * lt) * 0.42 + Math.sin(TAU * b.f * 2 * lt) * 0.16
            + Math.sin(TAU * b.f * 3 * lt) * 0.06) * e;
    }
  }
  // Gong-like shimmer tail
  const lt = t - 0.95;
  if (lt >= 0) {
    const e = Math.exp(-lt * 1.8);
    s += (Math.sin(TAU * 2093 * lt) + Math.sin(TAU * 2637 * lt) * 0.5
          + Math.sin(TAU * 3136 * lt) * 0.3) * e * 0.18;
  }
  s += sparkle(t, t - 0.35, 1.55, 0.40);
  return s * 0.78;
}), "chest-open-supreme.wav");

console.log("done");
