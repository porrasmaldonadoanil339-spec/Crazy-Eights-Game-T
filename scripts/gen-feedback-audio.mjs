// Procedural WAV generator for Task #74 feedback audio.
// Produces:
//   assets/sounds/ocho-locos-voice.wav   - synthesized "Ocho Locos" vocal cue
//                                          (formant-based, language-neutral
//                                          since the brand never translates)
//   assets/sounds/casino-ambience.wav    - low, loopable casino ambience pad
//   assets/sounds/click-premium.wav      - short premium UI click
// Run with: node scripts/gen-feedback-audio.mjs
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
  console.log("wrote", name, `(${(numSamples / SR).toFixed(2)}s)`);
}

function make(durSec, fn) {
  const n = Math.floor(durSec * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  return out;
}

const TAU = Math.PI * 2;

// Simple formant synth. Vowels are characterized by 3 formant frequencies (Hz).
// We approximate them with 3 band-limited sines + a sub-harmonic glottal pulse.
const VOWELS = {
  // [F1, F2, F3]
  o: [500, 900, 2400],
  e: [400, 2000, 2600],
  a: [800, 1200, 2500],
};

// Synthesize one syllable: optional consonant burst + vowel formants with a
// pitch contour. dur: total seconds. f0: pitch in Hz. consonant: "ch"|"l"|"k"|null.
function syllable(t, dur, f0, vowel, consonant) {
  const formants = VOWELS[vowel];
  const env = (() => {
    const atk = 0.02, rel = 0.08;
    if (t < atk) return t / atk;
    if (t > dur - rel) return Math.max(0, (dur - t) / rel);
    return 1;
  })();

  let s = 0;

  // Consonant noise burst at the very start of the syllable.
  const cBurst = consonant && t < 0.05;
  if (cBurst) {
    const e = Math.max(0, 1 - t / 0.05);
    const noise = (Math.sin((t * SR) * 12.9898) * 43758.5453) % 1;
    let burstAmp = 0.25;
    if (consonant === "ch") burstAmp = 0.30;
    if (consonant === "l")  burstAmp = 0.10;
    if (consonant === "k")  burstAmp = 0.28;
    s += (noise - 0.5) * 2 * e * burstAmp;
  }

  // Glottal pulse (sub) + formant bands. Slight pitch drop over the syllable
  // gives it a natural spoken cadence.
  const pitch = f0 * (1 - 0.05 * (t / dur));
  // glottal pulse approximation: weighted sum of harmonics
  const glottal = (
    Math.sin(TAU * pitch * t)        * 0.6 +
    Math.sin(TAU * pitch * 2 * t)    * 0.25 +
    Math.sin(TAU * pitch * 3 * t)    * 0.12
  ) * 0.45;

  // Formant resonators approximated by amplitude-shaped sines around each Fn.
  const f1 = Math.sin(TAU * formants[0] * t) * 0.45;
  const f2 = Math.sin(TAU * formants[1] * t) * 0.22;
  const f3 = Math.sin(TAU * formants[2] * t) * 0.10;

  // Modulate formants by glottal envelope so they only sound during voiced part.
  const voiced = (Math.sin(TAU * pitch * t) * 0.5 + 0.5);
  s += (f1 + f2 + f3) * voiced * 0.5 + glottal * 0.5;

  return s * env * 0.55;
}

// Build "O - cho - Lo - cos" — 4 syllables, ~1.0s total.
// Pitch contour: emphatic on first and third syllable.
const SYLLABLES = [
  { start: 0.00, dur: 0.22, f0: 180, vowel: "o", consonant: null },  // O
  { start: 0.22, dur: 0.24, f0: 165, vowel: "o", consonant: "ch" },  // cho
  { start: 0.52, dur: 0.22, f0: 195, vowel: "o", consonant: "l"  },  // Lo
  { start: 0.74, dur: 0.30, f0: 150, vowel: "o", consonant: "k"  },  // cos
];

writeWav(make(1.10, (t) => {
  let s = 0;
  for (const sy of SYLLABLES) {
    if (t >= sy.start && t < sy.start + sy.dur) {
      s += syllable(t - sy.start, sy.dur, sy.f0, sy.vowel, sy.consonant);
    }
  }
  // Soft tail reverb tail simulated by a small late echo
  if (t > 1.0) {
    const tail = (1.10 - t) / 0.10;
    s *= Math.max(0, tail);
  }
  return s;
}), "ocho-locos-voice.wav");

// ─── Casino ambience ─────────────────────────────────────────────────────────
// 8s loopable low-volume pad: distant chip rattle + faint chord drone.
writeWav(make(8.0, (t, i, n) => {
  // Slow chord drone (Cm-ish, very low volume, sits beneath menu music)
  const drone =
    Math.sin(TAU * 110 * t) * 0.05 +     // A2
    Math.sin(TAU * 165 * t) * 0.04 +     // E3
    Math.sin(TAU * 220 * t) * 0.03;      // A3

  // Sparse chip-rattle clicks via deterministic pseudo-noise gating
  const rng = ((i * 9301 + 49297) % 233280) / 233280;
  const tick = rng > 0.997 ? (Math.sin(TAU * 4200 * t) * 0.18 * (1 - (rng - 0.997) / 0.003)) : 0;

  // Loop seam: crossfade first/last 0.2s so it loops cleanly
  const fadeIn  = Math.min(1, t / 0.2);
  const fadeOut = Math.min(1, (8.0 - t) / 0.2);
  return (drone + tick) * Math.min(fadeIn, fadeOut) * 0.55;
}), "casino-ambience.wav");

// ─── Premium UI click ────────────────────────────────────────────────────────
// Short crisp click: high-frequency tick + tiny resonant chime tail.
writeWav(make(0.12, (t) => {
  // initial transient
  const transient = t < 0.008 ? (1 - t / 0.008) : 0;
  const noise = (Math.sin(t * SR * 12.9898) * 43758.5453) % 1;
  const click = (noise - 0.5) * 2 * transient * 0.6;
  // chime tail (5kHz quick decay) gives the "premium" feel
  const tail = Math.sin(TAU * 5200 * t) * Math.exp(-t * 55) * 0.28;
  return click + tail;
}), "click-premium.wav");
