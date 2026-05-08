// Procedural WAV generator for the OCHO LOCOS logo stingers.
// Generates a small library of premium intro stingers the player can pick
// from in Settings (Task #82). Each variant has a distinct sonic identity
// while staying short (~1.2s-1.6s) so it lands in sync with the splash.
// Output: assets/sounds/logo-stinger-<id>.wav (+ legacy logo-stinger.wav)
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

function master(samples, dur) {
  for (let i = 0; i < samples.length; i++) {
    const t = i / SR;
    let s = Math.tanh(samples[i] * 1.1) * 0.85;
    if (t < 0.008) s *= t / 0.008;
    if (t > dur - 0.08) s *= Math.max(0, (dur - t) / 0.08);
    samples[i] = s;
  }
  return samples;
}

// ─── Variant 1: Casino (rising shimmer + golden chord stab) ──────────────────
function genCasino() {
  const DUR = 1.4;
  const shimmer = (t) => {
    if (t > 0.5) return 0;
    const env = Math.sin((t / 0.5) * Math.PI);
    const f = 400 + (2400 - 400) * (t / 0.5);
    const a = Math.sin(TAU * f * t);
    const b = Math.sin(TAU * f * 1.5 * t) * 0.4;
    const c = Math.sin(TAU * f * 2.0 * t) * 0.2;
    const rng = ((Math.sin((t * SR) * 12.9898) * 43758.5453) % 1) - 0.5;
    return (a + b + c) * env * 0.18 + rng * env * 0.08;
  };
  const chord = (t) => {
    const start = 0.45;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 0.95) return 0;
    const env = lt < 0.04 ? lt / 0.04 : Math.pow(0.5, (lt - 0.04) / 0.35);
    const sub = Math.sin(TAU * 130.81 * lt) * 0.55;
    const c5  = Math.sin(TAU * 523.25 * lt) * 0.30;
    const e5  = Math.sin(TAU * 659.25 * lt) * 0.26;
    const g5  = Math.sin(TAU * 783.99 * lt) * 0.22;
    const d6  = Math.sin(TAU * 1174.66 * lt) * 0.14;
    const vib = 1 + 0.005 * Math.sin(TAU * 5 * lt);
    return (sub + (c5 + e5 + g5 + d6) * vib) * env * 0.35;
  };
  const thump = (t) => {
    const start = 0.45;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 0.25) return 0;
    const env = Math.pow(0.5, lt / 0.06);
    const f = 90 - 40 * (lt / 0.25);
    return Math.sin(TAU * f * lt) * env * 0.45;
  };
  const bell = (t) => {
    const start = 0.6;
    if (t < start) return 0;
    const lt = t - start;
    if (lt > 0.8) return 0;
    const env = Math.pow(0.5, lt / 0.45);
    const a = Math.sin(TAU * 1568 * lt) * 0.18;
    const b = Math.sin(TAU * 2093 * lt) * 0.12;
    const c = Math.sin(TAU * 2637 * lt) * 0.08;
    return (a + b + c) * env * 0.3;
  };
  return master(make(DUR, (t) => shimmer(t) + chord(t) + thump(t) + bell(t)), DUR);
}

// ─── Variant 2: Fanfare (bright trumpet-like ascending arpeggio) ─────────────
function genFanfare() {
  const DUR = 1.5;
  // Notes: G4 (392), C5 (523), E5 (659), G5 (784) — ascending major arpeggio
  const notes = [
    { f: 392.00, t0: 0.00, dur: 0.18 },
    { f: 523.25, t0: 0.16, dur: 0.18 },
    { f: 659.25, t0: 0.32, dur: 0.20 },
    { f: 783.99, t0: 0.48, dur: 0.85 },
  ];
  const trumpet = (f, lt) => {
    // Sawtooth-ish via summed harmonics — bright brass character
    const h1 = Math.sin(TAU * f * lt) * 0.55;
    const h2 = Math.sin(TAU * f * 2 * lt) * 0.30;
    const h3 = Math.sin(TAU * f * 3 * lt) * 0.20;
    const h4 = Math.sin(TAU * f * 4 * lt) * 0.12;
    const h5 = Math.sin(TAU * f * 5 * lt) * 0.06;
    return h1 + h2 + h3 + h4 + h5;
  };
  return master(make(DUR, (t) => {
    let s = 0;
    for (const n of notes) {
      if (t < n.t0 || t > n.t0 + n.dur) continue;
      const lt = t - n.t0;
      const env = lt < 0.025
        ? lt / 0.025
        : Math.pow(0.5, (lt - 0.025) / Math.max(0.05, n.dur * 0.5));
      const vib = 1 + 0.006 * Math.sin(TAU * 6 * lt);
      s += trumpet(n.f * vib, lt) * env * 0.18;
    }
    // Sub-bass tonic at the final note for weight
    if (t >= 0.48 && t <= 1.3) {
      const lt = t - 0.48;
      const env = Math.pow(0.5, lt / 0.4);
      s += Math.sin(TAU * 130.81 * lt) * env * 0.4;
    }
    return s;
  }), DUR);
}

// ─── Variant 3: Cinematic (low rumble + dramatic chord swell) ────────────────
function genCinematic() {
  const DUR = 1.6;
  return master(make(DUR, (t) => {
    let s = 0;
    // Sub rumble that builds 0.0 → 0.6s then sustains
    if (t < 0.9) {
      const env = t < 0.6 ? (t / 0.6) : 1.0;
      const rng = ((Math.sin((t * SR) * 7.123) * 43758.5453) % 1) - 0.5;
      s += rng * env * 0.18 * (1 - t / 1.5);
      s += Math.sin(TAU * 55 * t) * env * 0.35;
      s += Math.sin(TAU * 82.4 * t) * env * 0.18;
    }
    // Big minor chord hits at 0.6s and 0.95s — Cm: C3, Eb3, G3, C4
    const hits = [0.6, 0.95];
    for (const start of hits) {
      if (t < start) continue;
      const lt = t - start;
      if (lt > 0.7) continue;
      const env = lt < 0.02 ? lt / 0.02 : Math.pow(0.5, (lt - 0.02) / 0.3);
      const c3  = Math.sin(TAU * 130.81 * lt) * 0.30;
      const eb3 = Math.sin(TAU * 155.56 * lt) * 0.25;
      const g3  = Math.sin(TAU * 196.00 * lt) * 0.22;
      const c4  = Math.sin(TAU * 261.63 * lt) * 0.18;
      // Slight detune for orchestral width
      const wide = Math.sin(TAU * 261.63 * 1.005 * lt) * 0.08;
      s += (c3 + eb3 + g3 + c4 + wide) * env * 0.42;
    }
    return s;
  }), DUR);
}

// ─── Variant 4: Arcade (8-bit pulse melody) ──────────────────────────────────
function genArcade() {
  const DUR = 1.2;
  const pulse = (f, lt, duty = 0.5) => {
    const phase = (f * lt) % 1;
    return phase < duty ? 0.5 : -0.5;
  };
  // C5, E5, G5, C6 ascending blip melody
  const notes = [
    { f: 523.25, t0: 0.00, dur: 0.10 },
    { f: 659.25, t0: 0.10, dur: 0.10 },
    { f: 783.99, t0: 0.20, dur: 0.10 },
    { f: 1046.5, t0: 0.30, dur: 0.30 },
    { f: 1318.5, t0: 0.62, dur: 0.50 },
  ];
  return master(make(DUR, (t) => {
    let s = 0;
    for (const n of notes) {
      if (t < n.t0 || t > n.t0 + n.dur) continue;
      const lt = t - n.t0;
      const env = lt < 0.005
        ? lt / 0.005
        : Math.pow(0.5, (lt - 0.005) / Math.max(0.04, n.dur * 0.4));
      s += pulse(n.f, lt, 0.5) * env * 0.30;
      // Octave-down ghost for fatness
      s += pulse(n.f / 2, lt, 0.25) * env * 0.10;
    }
    // Triangle bass ostinato (C2 / G2)
    if (t < 0.6) {
      const f = (Math.floor(t / 0.15) % 2 === 0) ? 65.41 : 98.00;
      const lt = t % 0.15;
      const env = Math.pow(0.5, lt / 0.08);
      const phase = ((f * t) % 1) * 4 - 2;
      const tri = phase < 0 ? phase + 2 : 2 - phase;
      s += (tri - 1) * env * 0.18;
    }
    // Final noise hit on last note for "victory" punch
    if (t >= 0.62 && t <= 0.78) {
      const lt = t - 0.62;
      const env = Math.pow(0.5, lt / 0.06);
      const rng = ((Math.sin((t * SR) * 9.456) * 43758.5453) % 1) - 0.5;
      s += rng * env * 0.18;
    }
    return s;
  }), DUR);
}

// ─── Variant 5: Elegant (soft bells + airy sparkle) ──────────────────────────
function genElegant() {
  const DUR = 1.6;
  // Bell tones — A5 (880), C#6 (1108), E6 (1318), A6 (1760)
  const bells = [
    { f: 880.00,  t0: 0.00, dur: 1.4 },
    { f: 1108.73, t0: 0.18, dur: 1.2 },
    { f: 1318.51, t0: 0.36, dur: 1.0 },
    { f: 1760.00, t0: 0.54, dur: 0.9 },
  ];
  const bellTone = (f, lt) => {
    // FM-ish bell: carrier + 2 inharmonic partials
    const a = Math.sin(TAU * f * lt);
    const b = Math.sin(TAU * f * 2.76 * lt) * 0.35;
    const c = Math.sin(TAU * f * 5.40 * lt) * 0.18;
    return a * 0.55 + b + c;
  };
  return master(make(DUR, (t) => {
    let s = 0;
    for (const n of bells) {
      if (t < n.t0) continue;
      const lt = t - n.t0;
      if (lt > n.dur) continue;
      const env = Math.pow(0.5, lt / (n.dur * 0.4));
      const attack = lt < 0.015 ? lt / 0.015 : 1;
      s += bellTone(n.f, lt) * env * attack * 0.10;
    }
    // Soft pad: A3 (220) sustain
    if (t < 1.4) {
      const env = (t < 0.2 ? t / 0.2 : 1) * Math.max(0, 1 - (t - 0.6) / 1.0);
      s += Math.sin(TAU * 220 * t) * env * 0.18;
      s += Math.sin(TAU * 329.63 * t) * env * 0.10; // E4 fifth
    }
    // High shimmer noise (filtered-ish via amplitude modulation)
    if (t < 1.0) {
      const env = Math.sin((t / 1.0) * Math.PI) * 0.05;
      const rng = ((Math.sin((t * SR) * 17.13) * 43758.5453) % 1) - 0.5;
      s += rng * env;
    }
    return s;
  }), DUR);
}

const VARIANTS = [
  { id: "casino",    gen: genCasino },
  { id: "fanfare",   gen: genFanfare },
  { id: "cinematic", gen: genCinematic },
  { id: "arcade",    gen: genArcade },
  { id: "elegant",   gen: genElegant },
];

for (const v of VARIANTS) {
  writeWav(v.gen(), `logo-stinger-${v.id}.wav`);
}
// Keep legacy filename in sync with the default (casino) variant so the
// existing require("@/assets/sounds/logo-stinger.wav") in audioManager still
// works as the fallback bundle entry.
writeWav(genCasino(), "logo-stinger.wav");
