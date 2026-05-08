// Procedural WAV generator for the OCHO LOCOS logo stinger.
// Short, premium, memorable — a rising shimmer + suit-stab chord, like a
// casino sting. Plays once when the main menu first mounts.
// Output: assets/sounds/logo-stinger.wav
// Run with: node scripts/gen-logo-stinger.mjs
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
    let s = Math.max(-1, Math.min(1, samples[i]));
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

// Total length: 1.4s
const DUR = 1.4;

// Layer 1: rising shimmer sweep (whoosh from 400Hz → 2400Hz over 0.45s)
function shimmer(t) {
  if (t > 0.5) return 0;
  const env = Math.sin((t / 0.5) * Math.PI); // half sine
  const f = 400 + (2400 - 400) * (t / 0.5);
  // Add slight detuned partials for richness
  const a = Math.sin(TAU * f * t);
  const b = Math.sin(TAU * f * 1.5 * t) * 0.4;
  const c = Math.sin(TAU * f * 2.0 * t) * 0.2;
  // White noise sparkle
  const rng = ((Math.sin((t * SR) * 12.9898) * 43758.5453) % 1) - 0.5;
  return (a + b + c) * env * 0.18 + rng * env * 0.08;
}

// Layer 2: golden chord stab at t=0.45s (gold/casino chord — C5 major + 9th)
// Notes: C5 (523), E5 (659), G5 (784), D6 (1175), with low octave (C3 130).
function chord(t) {
  const start = 0.45;
  if (t < start) return 0;
  const lt = t - start;
  if (lt > 0.95) return 0;
  // ADSR-ish envelope: fast attack, slow decay
  const env = lt < 0.04
    ? lt / 0.04
    : Math.pow(0.5, (lt - 0.04) / 0.35);
  const sub = Math.sin(TAU * 130.81 * lt) * 0.55;
  const c5  = Math.sin(TAU * 523.25 * lt) * 0.30;
  const e5  = Math.sin(TAU * 659.25 * lt) * 0.26;
  const g5  = Math.sin(TAU * 783.99 * lt) * 0.22;
  const d6  = Math.sin(TAU * 1174.66 * lt) * 0.14;
  // Slight vibrato
  const vib = 1 + 0.005 * Math.sin(TAU * 5 * lt);
  return (sub + (c5 + e5 + g5 + d6) * vib) * env * 0.35;
}

// Layer 3: low impact thump at t=0.45s (felt, not heard)
function thump(t) {
  const start = 0.45;
  if (t < start) return 0;
  const lt = t - start;
  if (lt > 0.25) return 0;
  const env = Math.pow(0.5, lt / 0.06);
  // Pitched-down sine sweep 90Hz → 50Hz
  const f = 90 - 40 * (lt / 0.25);
  return Math.sin(TAU * f * lt) * env * 0.45;
}

// Layer 4: airy bell tail at t=0.6s
function bellTail(t) {
  const start = 0.6;
  if (t < start) return 0;
  const lt = t - start;
  if (lt > 0.8) return 0;
  const env = Math.pow(0.5, lt / 0.45);
  const a = Math.sin(TAU * 1568 * lt) * 0.18;
  const b = Math.sin(TAU * 2093 * lt) * 0.12;
  const c = Math.sin(TAU * 2637 * lt) * 0.08;
  return (a + b + c) * env * 0.3;
}

const samples = make(DUR, (t) => {
  let s = shimmer(t) + chord(t) + thump(t) + bellTail(t);
  // Master soft-clip
  s = Math.tanh(s * 1.1) * 0.85;
  // Master fade-in 8ms / fade-out 80ms guard
  if (t < 0.008) s *= t / 0.008;
  if (t > DUR - 0.08) s *= Math.max(0, (DUR - t) / 0.08);
  return s;
});

writeWav(samples, "logo-stinger.wav");
