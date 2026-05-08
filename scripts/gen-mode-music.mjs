// Procedural per-mode music loops for Task #113.
//
// Generates one short (~6s) seamlessly-loopable WAV per gameplay mode so
// each mode has a genuinely distinct musical identity (not just a colour
// tint). Asset budget is intentionally tiny — these are warm pad/arpeggio
// beds layered under SFX, not full songs.
//
// Output: assets/sounds/game-music-<mode>.wav for:
//   practice / classic / lightning / tournament / challenge / ranked / coop
// Run with: node scripts/gen-mode-music.mjs
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

// Master with seamless loop crossfade (last 60ms folded into first 60ms).
function masterLoop(samples) {
  const n = samples.length;
  const xfade = Math.floor(SR * 0.06);
  for (let i = 0; i < n; i++) samples[i] = Math.tanh(samples[i] * 1.05) * 0.8;
  for (let i = 0; i < xfade; i++) {
    const a = i / xfade;
    samples[i] = samples[i] * a + samples[n - xfade + i] * (1 - a);
  }
  for (let i = n - xfade; i < n; i++) samples[i] = samples[i] * 0;
  return samples;
}

// Helper: sine partial.
const sin = (f, t, ph = 0) => Math.sin(TAU * f * t + ph);

// ─── practice — calm warm pad in C major ──────────────────────────────────────
function genPractice() {
  const DUR = 6.0;
  const root = 130.81; // C3
  return masterLoop(make(DUR, (t) => {
    const slow = 1 + 0.04 * sin(0.3, t);
    const pad =
      sin(root, t) * 0.18 * slow +
      sin(root * 1.5, t) * 0.10 +
      sin(root * 2, t) * 0.08 +
      sin(root * 2.5, t) * 0.05;
    const air = sin(660, t, sin(0.7, t)) * 0.02;
    return pad + air;
  }));
}

// ─── classic — warm casino lounge groove (E minor) ────────────────────────────
function genClassic() {
  const DUR = 6.4;
  const bass = (t) => sin(82.41, t) * 0.22 + sin(82.41 * 2, t) * 0.05;
  const chord = (t) => {
    const beat = (t * 2) % 1;
    const env = Math.pow(0.5, beat / 0.45);
    return (sin(329.63, t) + sin(392, t) * 0.85 + sin(493.88, t) * 0.7) * 0.08 * env;
  };
  const hat = (t) => {
    const beat = ((t * 4) % 1);
    if (beat > 0.04) return 0;
    const rng = ((Math.sin((t * SR) * 17.21) * 43758.5453) % 1) - 0.5;
    return rng * 0.05 * (1 - beat / 0.04);
  };
  return masterLoop(make(DUR, (t) => bass(t) + chord(t) + hat(t)));
}

// ─── lightning — fast pulsing arpeggio + driving sub ──────────────────────────
function genLightning() {
  const DUR = 4.8;
  const notes = [261.63, 329.63, 392, 523.25]; // C E G C
  const arp = (t) => {
    const idx = Math.floor((t * 8) % notes.length);
    const beat = (t * 8) % 1;
    const env = Math.pow(0.5, beat / 0.18);
    return sin(notes[idx], t) * 0.18 * env;
  };
  const sub = (t) => {
    const beat = (t * 4) % 1;
    const env = Math.pow(0.5, beat / 0.20);
    return sin(65.41, t) * 0.30 * env;
  };
  const tick = (t) => {
    const beat = (t * 8) % 1;
    if (beat > 0.02) return 0;
    return sin(2200, t) * 0.06 * (1 - beat / 0.02);
  };
  return masterLoop(make(DUR, (t) => arp(t) + sub(t) + tick(t)));
}

// ─── tournament — dramatic orchestral swell with timpani ──────────────────────
function genTournament() {
  const DUR = 7.2;
  const swell = (t) => {
    const env = 0.5 + 0.5 * Math.sin(TAU * (t / DUR) - Math.PI / 2);
    return (sin(146.83, t) + sin(220, t) * 0.7 + sin(293.66, t) * 0.5) * 0.10 * env;
  };
  const horn = (t) => {
    const start = 1.6;
    if (t < start) return 0;
    const lt = (t - start) % 3.6;
    if (lt > 1.4) return 0;
    const env = lt < 0.1 ? lt / 0.1 : Math.pow(0.5, (lt - 0.1) / 0.9);
    return (sin(174.61, t) + sin(261.63, t) * 0.8 + sin(349.23, t) * 0.5) * 0.10 * env;
  };
  const timp = (t) => {
    const beat = (t * 2) % 1;
    if (beat > 0.06) return 0;
    const env = Math.pow(0.5, beat / 0.04);
    return sin(73, t) * 0.35 * env;
  };
  return masterLoop(make(DUR, (t) => swell(t) + horn(t) + timp(t)));
}

// ─── challenge — playful syncopated marimba in F major ────────────────────────
function genChallenge() {
  const DUR = 5.4;
  const notes = [349.23, 440, 523.25, 698.46, 523.25, 440]; // F A C F C A
  const marimba = (t) => {
    const idx = Math.floor((t * 6) % notes.length);
    const beat = (t * 6) % 1;
    const env = Math.pow(0.5, beat / 0.22);
    const f = notes[idx];
    return (sin(f, t) + sin(f * 2, t) * 0.35 + sin(f * 4, t) * 0.10) * 0.14 * env;
  };
  const bass = (t) => sin(87.31, t) * 0.12 + sin(87.31 * 1.5, t) * 0.04;
  return masterLoop(make(DUR, (t) => marimba(t) + bass(t)));
}

// ─── ranked — cold competitive synth pad in A minor ───────────────────────────
function genRanked() {
  const DUR = 6.6;
  const root = 110;
  const pad = (t) => (
    sin(root, t) * 0.16 +
    sin(root * 1.5, t) * 0.10 +
    sin(root * 1.78, t) * 0.06 +  // detuned
    sin(root * 3, t) * 0.05
  );
  const blip = (t) => {
    const beat = (t * 2) % 1;
    if (beat > 0.04) return 0;
    return sin(880, t) * 0.06 * (1 - beat / 0.04);
  };
  const sweep = (t) => sin(root * 0.5, t, sin(0.4, t) * 2) * 0.05;
  return masterLoop(make(DUR, (t) => pad(t) + blip(t) + sweep(t)));
}

// ─── coop — bright friendly major-7 vamp ──────────────────────────────────────
function genCoop() {
  const DUR = 6.0;
  const bass = (t) => {
    const beat = (t * 2) % 1;
    const env = Math.pow(0.5, beat / 0.45);
    return sin(98, t) * 0.18 * env;
  };
  const chord = (t) => {
    const stab = (t * 2) % 1;
    const env = stab < 0.5 ? Math.pow(0.5, stab / 0.35) : 0;
    return (sin(293.66, t) + sin(369.99, t) + sin(440, t) + sin(554.37, t)) * 0.05 * env;
  };
  const lead = (t) => sin(739.99, t, sin(0.6, t)) * 0.04;
  return masterLoop(make(DUR, (t) => bass(t) + chord(t) + lead(t)));
}

const VARIANTS = {
  "game-music-practice.wav":   genPractice,
  "game-music-classic.wav":    genClassic,
  "game-music-lightning.wav":  genLightning,
  "game-music-tournament.wav": genTournament,
  "game-music-challenge.wav":  genChallenge,
  "game-music-ranked.wav":     genRanked,
  "game-music-coop.wav":       genCoop,
};

for (const [name, fn] of Object.entries(VARIANTS)) {
  writeWav(fn(), name);
}
console.log("done.");
