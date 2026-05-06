// Procedural WAV generator for Task #67 personality SFX.
// Produces 7 distinct mono 16-bit PCM WAV files in assets/sounds/.
// Run with: node scripts/gen-personality-sfx.mjs
import fs from "node:fs";
import path from "node:path";

const SR = 22050;
const OUT_DIR = path.resolve("assets/sounds");

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
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32000), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  console.log("wrote", name, `(${numSamples} samples)`);
}

function make(durSec, fn) {
  const n = Math.floor(durSec * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  return out;
}

const TAU = Math.PI * 2;
const env = (t, dur, atk = 0.01, rel = 0.15) => {
  if (t < atk) return t / atk;
  if (t > dur - rel) return Math.max(0, (dur - t) / rel);
  return 1;
};

// 1) mock_laugh — 4 staccato chirps descending then up
writeWav(make(0.6, (t) => {
  const beats = [0, 0.12, 0.24, 0.38];
  const freqs = [520, 470, 430, 560];
  let s = 0;
  for (let i = 0; i < beats.length; i++) {
    const lt = t - beats[i];
    if (lt >= 0 && lt < 0.1) {
      const e = env(lt, 0.1, 0.005, 0.06);
      s += Math.sin(TAU * freqs[i] * lt) * e * 0.4;
    }
  }
  return s;
}), "mock-laugh.wav");

// 2) applause — filtered noise burst with slow decay
writeWav(make(1.0, (t, i, n) => {
  const e = env(t, 1.0, 0.05, 0.6);
  // pseudo-random noise via interleaved sines
  const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return (noise - 0.5) * 2 * e * 0.45;
}), "applause.wav");

// 3) crowd_gasp — rising pad swell
writeWav(make(0.7, (t) => {
  const e = env(t, 0.7, 0.15, 0.25);
  const f = 200 + t * 250;
  return (Math.sin(TAU * f * t) * 0.3 + Math.sin(TAU * f * 1.5 * t) * 0.15) * e;
}), "crowd-gasp.wav");

// 4) dramatic_drum — three low thumps
writeWav(make(1.1, (t) => {
  const beats = [0, 0.32, 0.7];
  let s = 0;
  for (const b of beats) {
    const lt = t - b;
    if (lt >= 0 && lt < 0.25) {
      const e = Math.exp(-lt * 18);
      const f = 80 + Math.exp(-lt * 30) * 60;
      s += Math.sin(TAU * f * lt) * e * 0.7;
    }
  }
  return s;
}), "dramatic-drum.wav");

// 5) boo — descending vowel-like tone
writeWav(make(0.55, (t) => {
  const e = env(t, 0.55, 0.04, 0.25);
  const f = 220 - t * 110;
  return (Math.sin(TAU * f * t) * 0.4 + Math.sin(TAU * f * 2 * t) * 0.12) * e;
}), "boo.wav");

// 6) cackle — fast triplet ascending squawk
writeWav(make(0.45, (t) => {
  const beats = [0, 0.08, 0.18, 0.3];
  const freqs = [620, 740, 880, 980];
  let s = 0;
  for (let i = 0; i < beats.length; i++) {
    const lt = t - beats[i];
    if (lt >= 0 && lt < 0.07) {
      const e = env(lt, 0.07, 0.003, 0.04);
      s += (Math.sin(TAU * freqs[i] * lt) + Math.sin(TAU * freqs[i] * 1.5 * lt) * 0.4) * e * 0.3;
    }
  }
  return s;
}), "cackle.wav");

// 7) victory_fanfare — three-note rising arpeggio
writeWav(make(1.2, (t) => {
  const beats = [
    { at: 0, f: 523 },   // C5
    { at: 0.18, f: 659 }, // E5
    { at: 0.36, f: 784 }, // G5
    { at: 0.55, f: 1047, dur: 0.55 }, // C6 sustain
  ];
  let s = 0;
  for (const b of beats) {
    const lt = t - b.at;
    const dur = b.dur ?? 0.2;
    if (lt >= 0 && lt < dur) {
      const e = env(lt, dur, 0.01, 0.15);
      s += (Math.sin(TAU * b.f * lt) * 0.35 + Math.sin(TAU * b.f * 2 * lt) * 0.12) * e;
    }
  }
  return s;
}), "victory-fanfare.wav");

console.log("done");
