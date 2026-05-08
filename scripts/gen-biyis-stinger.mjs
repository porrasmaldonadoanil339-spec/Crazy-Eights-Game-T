// Procedural WAV generator for the BIYIS PRIME STUDIOS cinematic logo intro
// stinger (Task #119). Replaces the previous default-voice-only intro with a
// premium, AAA-mobile-style sound: deep sub impact + airy rising whoosh +
// golden orchestral chord swell + bright bell shimmer + soft tail.
// Output: assets/sounds/biyis-stinger.wav (~3.0s).
// Run with: node scripts/gen-biyis-stinger.mjs
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

function master(samples, dur) {
  for (let i = 0; i < samples.length; i++) {
    const t = i / SR;
    let s = Math.tanh(samples[i] * 1.05) * 0.88;
    if (t < 0.012) s *= t / 0.012;
    if (t > dur - 0.30) s *= Math.max(0, (dur - t) / 0.30);
    samples[i] = s;
  }
  return samples;
}

function rng(t, k) {
  const v = Math.sin(t * SR * (12.9898 + k * 0.137)) * 43758.5453;
  return (v - Math.floor(v)) - 0.5;
}

function genBiyisCinematic() {
  const DUR = 3.0;

  const riser = (t) => {
    if (t > 1.10) return 0;
    const p = t / 1.10;
    const env = Math.pow(p, 1.6);
    const f = 200 + (3200 - 200) * Math.pow(p, 1.8);
    const noise = rng(t, 1) * env * 0.22;
    const sweep = Math.sin(TAU * f * t) * env * 0.10;
    const sweep2 = Math.sin(TAU * f * 1.5 * t) * env * 0.06;
    return noise + sweep + sweep2;
  };

  const subDrop = (t) => {
    const start = 1.05;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 1.20) return 0;
    const env = lt < 0.02 ? lt / 0.02 : Math.pow(0.5, lt / 0.55);
    const f = 65 - 25 * Math.min(1, lt / 0.30);
    const sub = Math.sin(TAU * f * lt) * 0.55;
    const harm = Math.sin(TAU * f * 2 * lt) * 0.20;
    const punch = lt < 0.08 ? rng(t, 2) * (1 - lt / 0.08) * 0.35 : 0;
    return (sub + harm + punch) * env * 0.55;
  };

  const chord = (t) => {
    const start = 1.10;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 1.65) return 0;
    const env = lt < 0.06 ? lt / 0.06 : Math.pow(0.5, (lt - 0.06) / 0.85);
    const c3  = Math.sin(TAU * 130.81 * lt) * 0.32;
    const g3  = Math.sin(TAU * 196.00 * lt) * 0.24;
    const c4  = Math.sin(TAU * 261.63 * lt) * 0.22;
    const e4  = Math.sin(TAU * 329.63 * lt) * 0.20;
    const g4  = Math.sin(TAU * 392.00 * lt) * 0.18;
    const c5  = Math.sin(TAU * 523.25 * lt) * 0.15;
    const wide = Math.sin(TAU * 261.63 * 1.004 * lt) * 0.10;
    const vib = 1 + 0.005 * Math.sin(TAU * 4.5 * lt);
    return (c3 + g3 + c4 + e4 + g4 + c5 + wide) * vib * env * 0.42;
  };

  const bells = (t) => {
    const start = 1.25;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 1.40) return 0;
    const env = Math.pow(0.5, lt / 0.55);
    const a = Math.sin(TAU * 1567.98 * lt) * 0.18;
    const b = Math.sin(TAU * 2093.00 * lt) * 0.13;
    const c = Math.sin(TAU * 2637.02 * lt) * 0.09;
    const d = Math.sin(TAU * 3135.96 * lt) * 0.06;
    return (a + b + c + d) * env * 0.30;
  };

  const shimmerTail = (t) => {
    const start = 1.40;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 1.55) return 0;
    const env = Math.sin((lt / 1.55) * Math.PI) * 0.06;
    const noise = rng(t, 3);
    const am = 0.5 + 0.5 * Math.sin(TAU * 7 * lt);
    return noise * env * am;
  };

  return master(make(DUR, (t) =>
    riser(t) + subDrop(t) + chord(t) + bells(t) + shimmerTail(t)
  ), DUR);
}

writeWav(genBiyisCinematic(), "biyis-stinger.wav");
