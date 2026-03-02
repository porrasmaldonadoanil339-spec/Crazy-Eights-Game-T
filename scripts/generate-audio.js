const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BIT_DEPTH = 16;

function createWAV(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8), 28);
  buffer.writeUInt16LE(CHANNELS * (BIT_DEPTH / 8), 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);
  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - ((t - attack) / decay) * (1 - sustain);
  if (t < duration - release) return sustain;
  return sustain * (1 - (t - (duration - release)) / release);
}

// --- Card flip sound: short click + noise ---
function generateCardFlip() {
  const duration = 0.15;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 35);
    const click = Math.sin(2 * Math.PI * 800 * t) * 0.5 * Math.exp(-t * 60);
    const noise = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 25);
    const body = Math.sin(2 * Math.PI * 200 * t) * 0.2 * Math.exp(-t * 15);
    samples[i] = (click + noise + body) * env * 0.8;
  }
  return samples;
}

// --- Card draw: softer swipe ---
function generateCardDraw() {
  const duration = 0.12;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 28);
    const noise = (Math.random() * 2 - 1) * 0.4;
    const swoosh = Math.sin(2 * Math.PI * (300 + t * 800) * t) * 0.2;
    samples[i] = (noise * 0.6 + swoosh) * env * 0.7;
  }
  return samples;
}

// --- Shuffle: rolling noise burst ---
function generateShuffle() {
  const duration = 0.5;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 0.05 ? t / 0.05 : Math.exp(-(t - 0.05) * 5);
    const clicks = Math.floor(t / 0.04) % 2 === 0 ? 1 : 0.3;
    const noise = (Math.random() * 2 - 1) * 0.5;
    const body = Math.sin(2 * Math.PI * 300 * t) * 0.15 * Math.exp(-((t % 0.04) * 30));
    samples[i] = (noise * clicks + body) * env * 0.75;
  }
  return samples;
}

// --- Win: ascending arpeggio (major) ---
function generateWin() {
  const duration = 2.0;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);
  const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0, 1046.5]; // C4 major arpeggio
  const noteLen = 0.18;
  notes.forEach((freq, idx) => {
    const start = idx * noteLen;
    const nSamples = Math.min(Math.round((noteLen + 0.3) * SAMPLE_RATE), n - Math.round(start * SAMPLE_RATE));
    for (let i = 0; i < nSamples; i++) {
      const t = i / SAMPLE_RATE;
      const si = Math.round(start * SAMPLE_RATE) + i;
      if (si >= n) break;
      const env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 3);
      const s = (
        Math.sin(2 * Math.PI * freq * t) * 0.5 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.1
      ) * env * 0.35;
      samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
    }
  });
  return samples;
}

// --- Lose: descending minor chord ---
function generateLose() {
  const duration = 1.5;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);
  const chords = [
    [392.0, 466.2, 587.3],
    [349.2, 415.3, 523.3],
    [293.7, 349.2, 440.0],
  ];
  chords.forEach((chord, ci) => {
    const start = ci * 0.35;
    const nSamples = Math.round(0.5 * SAMPLE_RATE);
    chord.forEach((freq) => {
      for (let i = 0; i < nSamples; i++) {
        const t = i / SAMPLE_RATE;
        const si = Math.round(start * SAMPLE_RATE) + i;
        if (si >= n) break;
        const env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 4);
        const s = Math.sin(2 * Math.PI * freq * t) * 0.2 * env;
        samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
      }
    });
  });
  return samples;
}

// --- Button click: short blip ---
function generateButton() {
  const duration = 0.05;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 80);
    samples[i] = Math.sin(2 * Math.PI * 1200 * t) * env * 0.4;
  }
  return samples;
}

// --- Wild 8 sound: mysterious shimmer ---
function generateWild() {
  const duration = 0.7;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);
  const freqs = [440, 554.4, 659.3, 880];
  freqs.forEach((freq, idx) => {
    const start = idx * 0.12;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      if (t < start) continue;
      const lt = t - start;
      const env = lt < 0.02 ? lt / 0.02 : Math.exp(-(lt - 0.02) * 4);
      const s = Math.sin(2 * Math.PI * freq * lt) * 0.15 * env;
      samples[i] = Math.max(-1, Math.min(1, samples[i] + s));
    }
  });
  return samples;
}

// ─── Jazz Music Helpers ────────────────────────────────────────────────────
// Piano note: attack transient + harmonic decay (piano-like tone)
function makePiano(samples, n, freq, startSec, durSec, gain) {
  const start = Math.round(startSec * SAMPLE_RATE);
  const len   = Math.round(durSec  * SAMPLE_RATE);
  for (let i = 0; i < len; i++) {
    const si = start + i;
    if (si >= n) break;
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.008);
    const decay  = Math.exp(-t * (2.5 / durSec));
    const env    = attack * decay;
    // Rich harmonic content for piano timbre
    const s = (
      Math.sin(2 * Math.PI * freq       * t) * 0.55 +
      Math.sin(2 * Math.PI * freq * 2   * t) * 0.22 +
      Math.sin(2 * Math.PI * freq * 3   * t) * 0.10 +
      Math.sin(2 * Math.PI * freq * 4   * t) * 0.06 +
      Math.sin(2 * Math.PI * freq * 5   * t) * 0.03 +
      Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.04  // sub-harmonic warmth
    ) * env * gain;
    samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
  }
}

// Walking bass note: thumpy pluck
function makeBass(samples, n, freq, startSec, durSec, gain) {
  const start = Math.round(startSec * SAMPLE_RATE);
  const len   = Math.round(durSec  * SAMPLE_RATE);
  for (let i = 0; i < len; i++) {
    const si = start + i;
    if (si >= n) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 5.5);
    const s = (
      Math.sin(2 * Math.PI * freq     * t) * 0.65 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.20 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.08
    ) * env * gain;
    samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
  }
}

// Hi-hat: noise burst (closed hi-hat)
function makeHihat(samples, n, startSec, durSec, gain) {
  const start = Math.round(startSec * SAMPLE_RATE);
  const len   = Math.round(durSec  * SAMPLE_RATE);
  for (let i = 0; i < len; i++) {
    const si = start + i;
    if (si >= n) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 60);
    // High-freq bandpass approximation (noise * high-freq oscillator)
    const noise = (Math.random() * 2 - 1);
    const hf    = Math.sin(2 * Math.PI * 8000 * t) + Math.sin(2 * Math.PI * 10000 * t);
    samples[si] = Math.max(-1, Math.min(1, samples[si] + noise * hf * env * gain * 0.4));
  }
}

// Ride cymbal tick: metallic ping
function makeRide(samples, n, startSec, gain) {
  const start = Math.round(startSec * SAMPLE_RATE);
  const len   = Math.round(0.06 * SAMPLE_RATE);
  for (let i = 0; i < len; i++) {
    const si = start + i;
    if (si >= n) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 35);
    const s = (
      Math.sin(2 * Math.PI * 5000 * t) * 0.5 +
      Math.sin(2 * Math.PI * 7200 * t) * 0.3 +
      (Math.random() * 2 - 1) * 0.2
    ) * env * gain;
    samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
  }
}

// Swing offset: in jazz swing, the "and" of each beat falls at 2/3 of beat
function swingAnd(beatLen) { return beatLen * (2 / 3); }

// ─── Menu Music: Smooth Swing Jazz (88 BPM, 16 bars) ─────────────────────
function generateMenuMusic() {
  const BPM     = 88;
  const beatLen = 60 / BPM;
  const bars    = 16;
  const duration = bars * 4 * beatLen;
  const n       = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);

  // ii-V-I-IV jazz progression (Dm7 | G7 | Cmaj7 | Fmaj7)
  // Each row: [root, 3rd, 5th, 7th, 9th(optional)]
  const chords = [
    // Dm9: D F A C E
    [293.7, 349.2, 440.0, 523.3, 659.3],
    // G13: G B D F A (dominant)
    [392.0, 493.9, 587.3, 698.5, 880.0],
    // Cmaj9: C E G B D
    [261.6, 329.6, 392.0, 493.9, 587.3],
    // Fmaj7: F A C E
    [349.2, 440.0, 523.3, 659.3, 784.0],
  ];

  // Walking bass notes per bar – approach via chromatic half-steps
  // Each bar gets 4 beat notes; chromatic approaches happen on beat 4 (approach to next root)
  const bassRoots = [
    146.8,  // D2 (Dm7)
    196.0,  // G2 (G7)
    130.8,  // C2 (Cmaj7)
    174.6,  // F2 (Fmaj7)
  ];

  // Melody: a relaxed jazz melody over the changes
  // [beat_within_bar, chord_note_index, octave_multiplier, duration_beats]
  const melodySequence = [
    // Bar 0 (Dm7)
    { bar: 0,  beat: 0,      ni: 2, oct: 2, dur: 1.5  },
    { bar: 0,  beat: 2,      ni: 3, oct: 2, dur: 0.67 },
    { bar: 0,  beat: 2.67,   ni: 4, oct: 2, dur: 1.33 },
    // Bar 1 (G7) - land on 3rd
    { bar: 1,  beat: 0,      ni: 1, oct: 2, dur: 2.0  },
    { bar: 1,  beat: 2.33,   ni: 3, oct: 2, dur: 1.67 },
    // Bar 2 (Cmaj7)
    { bar: 2,  beat: 0,      ni: 4, oct: 2, dur: 1.0  },
    { bar: 2,  beat: 1,      ni: 2, oct: 2, dur: 0.67 },
    { bar: 2,  beat: 1.67,   ni: 3, oct: 2, dur: 1.33 },
    { bar: 2,  beat: 3,      ni: 1, oct: 2, dur: 1.0  },
    // Bar 3 (Fmaj7)
    { bar: 3,  beat: 0,      ni: 3, oct: 2, dur: 2.0  },
    { bar: 3,  beat: 2.33,   ni: 1, oct: 2, dur: 1.67 },
    // Bar 4 (Dm7) - second pass, higher register
    { bar: 4,  beat: 0,      ni: 4, oct: 2, dur: 0.67 },
    { bar: 4,  beat: 0.67,   ni: 3, oct: 2, dur: 0.67 },
    { bar: 4,  beat: 1.33,   ni: 2, oct: 2, dur: 1.67 },
    { bar: 4,  beat: 3,      ni: 3, oct: 2, dur: 1.0  },
    // Bar 5 (G7)
    { bar: 5,  beat: 0,      ni: 2, oct: 2, dur: 1.33 },
    { bar: 5,  beat: 1.33,   ni: 0, oct: 2, dur: 2.67 },
    // Bar 6 (Cmaj7)
    { bar: 6,  beat: 0,      ni: 1, oct: 2, dur: 0.67 },
    { bar: 6,  beat: 0.67,   ni: 2, oct: 2, dur: 0.67 },
    { bar: 6,  beat: 1.33,   ni: 3, oct: 2, dur: 1.0  },
    { bar: 6,  beat: 2.33,   ni: 4, oct: 2, dur: 1.67 },
    // Bar 7 (Fmaj7)
    { bar: 7,  beat: 0,      ni: 3, oct: 2, dur: 3.0  },
    { bar: 7,  beat: 3,      ni: 2, oct: 2, dur: 1.0  },
  ];

  for (let bar = 0; bar < bars; bar++) {
    const ci       = bar % chords.length;
    const chord    = chords[ci];
    const bassRoot = bassRoots[ci];
    const nextBass = bassRoots[(ci + 1) % bassRoots.length];
    const barStart = bar * 4 * beatLen;

    // ── Chord comping: stab on beat 2 and beat 4 (backbeat feel) ──
    // Use 3rd, 5th, 7th (rootless voicing — typical jazz piano left hand)
    const compFreqs = [chord[1], chord[2], chord[3]];
    compFreqs.forEach(f => {
      makePiano(samples, n, f, barStart + beatLen,         beatLen * 0.45, 0.055);
      makePiano(samples, n, f, barStart + 3 * beatLen,     beatLen * 0.45, 0.055);
      // Ghost chord on 'and' of 2
      makePiano(samples, n, f, barStart + swingAnd(beatLen) + beatLen, beatLen * 0.3, 0.028);
    });
    // Occasional 9th adds color
    if (chord[4]) {
      makePiano(samples, n, chord[4], barStart + beatLen,     beatLen * 0.35, 0.03);
      makePiano(samples, n, chord[4], barStart + 3 * beatLen, beatLen * 0.35, 0.03);
    }

    // ── Walking bass (4 notes per bar, swing feel on passing tones) ──
    const beatScale = [1, 1.122, 1.189, 1.334]; // scale steps from root
    for (let b = 0; b < 4; b++) {
      let freq;
      if (b === 3) {
        // Beat 4: chromatic approach to next bar's root (half-step below)
        freq = nextBass * (Math.random() > 0.5 ? 0.944 : 1.059);
      } else {
        freq = bassRoot * beatScale[b % beatScale.length];
      }
      makeBass(samples, n, freq, barStart + b * beatLen, beatLen * 0.85, 0.22);
    }

    // ── Percussion: ride + hi-hat swing pattern ──
    for (let b = 0; b < 4; b++) {
      const bTime = barStart + b * beatLen;
      // Ride on every beat
      makeRide(samples, n, bTime, 0.13);
      // Hi-hat on every 8th note (swung: straight on beat, 2/3 on "and")
      makeHihat(samples, n, bTime,                    0.018, 0.07);
      makeHihat(samples, n, bTime + swingAnd(beatLen), 0.022, 0.10);
    }
  }

  // ── Melody notes from sequence (repeat pattern every 8 bars) ──
  melodySequence.forEach(({ bar: mbar, beat, ni, oct, dur }) => {
    for (let rep = 0; rep < Math.floor(bars / 8); rep++) {
      const actualBar  = mbar + rep * 8;
      if (actualBar >= bars) return;
      const ci    = actualBar % chords.length;
      const chord = chords[ci];
      const freq  = chord[Math.min(ni, chord.length - 1)] * oct;
      makePiano(samples, n, freq, actualBar * 4 * beatLen + beat * beatLen, dur * beatLen * 0.92, 0.07);
    }
  });

  // ── Fade in / fade out ──
  const fadeInSamples  = Math.round(0.3 * SAMPLE_RATE);
  const fadeOutSamples = Math.round(1.0 * SAMPLE_RATE);
  for (let i = 0; i < fadeInSamples; i++) samples[i] *= i / fadeInSamples;
  for (let i = 0; i < fadeOutSamples; i++) {
    const idx = n - fadeOutSamples + i;
    if (idx >= 0 && idx < n) samples[idx] *= 1 - i / fadeOutSamples;
  }

  return samples;
}

// ─── Game Music: Up-tempo Jazz (138 BPM, 12 bars, minor feel) ────────────
function generateGameMusic() {
  const BPM     = 138;
  const beatLen = 60 / BPM;
  const bars    = 12;
  const duration = bars * 4 * beatLen;
  const n       = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);

  // Minor jazz: Am7 | D7b9 | Gm7 | C7 (minor ii-V turnaround)
  const chords = [
    // Am7: A C E G
    [220.0, 261.6, 329.6, 392.0, 493.9],
    // D7b9: D F# A C Eb (tension!)
    [293.7, 370.0, 440.0, 523.3, 622.3],
    // Gm7: G Bb D F
    [196.0, 233.1, 293.7, 349.2, 440.0],
    // C13: C E G Bb A (dominant)
    [261.6, 329.6, 392.0, 466.2, 440.0],
  ];

  const bassRoots = [110.0, 146.8, 98.0, 130.8];

  // Punchy game melody (more angular, faster)
  const melodySeq = [
    { bar: 0, beat: 0,    ni: 2, dur: 0.5  },
    { bar: 0, beat: 0.67, ni: 3, dur: 0.33 },
    { bar: 0, beat: 1,    ni: 4, dur: 1.0  },
    { bar: 0, beat: 2,    ni: 3, dur: 0.67 },
    { bar: 0, beat: 2.67, ni: 2, dur: 1.33 },
    { bar: 1, beat: 0,    ni: 1, dur: 0.5  },
    { bar: 1, beat: 0.67, ni: 2, dur: 0.67 },
    { bar: 1, beat: 1.33, ni: 3, dur: 1.67 },
    { bar: 1, beat: 3,    ni: 4, dur: 1.0  },
    { bar: 2, beat: 0,    ni: 2, dur: 1.0  },
    { bar: 2, beat: 1,    ni: 0, dur: 0.67 },
    { bar: 2, beat: 1.67, ni: 1, dur: 1.33 },
    { bar: 2, beat: 3,    ni: 2, dur: 1.0  },
    { bar: 3, beat: 0,    ni: 3, dur: 2.0  },
    { bar: 3, beat: 2.33, ni: 1, dur: 1.67 },
  ];

  for (let bar = 0; bar < bars; bar++) {
    const ci       = bar % chords.length;
    const chord    = chords[ci];
    const bassRoot = bassRoots[ci];
    const nextBass = bassRoots[(ci + 1) % bassRoots.length];
    const barStart = bar * 4 * beatLen;

    // ── Chord stabs on all 4 beats (driving game feel) ──
    const compFreqs = [chord[1], chord[2], chord[3]];
    compFreqs.forEach(f => {
      // Stab every beat, short
      for (let b = 0; b < 4; b++) {
        makePiano(samples, n, f, barStart + b * beatLen, beatLen * 0.3, 0.050);
      }
      // Extra backbeat stab on 'and' of 2 and 4
      makePiano(samples, n, f, barStart + beatLen + swingAnd(beatLen), beatLen * 0.2, 0.030);
      makePiano(samples, n, f, barStart + 3 * beatLen + swingAnd(beatLen), beatLen * 0.2, 0.030);
    });

    // ── Fast walking bass ──
    const scaleSteps = [1, 1.122, 1.260, 0.891]; // tonic, whole, whole, below
    for (let b = 0; b < 4; b++) {
      const freq = b === 3
        ? nextBass * (Math.random() > 0.4 ? 0.944 : 1.059)  // chromatic approach
        : bassRoot * scaleSteps[b];
      makeBass(samples, n, freq, barStart + b * beatLen, beatLen * 0.75, 0.24);
      // Half-beat fills on "and" (swung)
      if (b < 3) {
        makeBass(samples, n, freq * 1.059, barStart + b * beatLen + swingAnd(beatLen), beatLen * 0.25, 0.10);
      }
    }

    // ── Busy swing percussion ──
    for (let b = 0; b < 4; b++) {
      const bTime = barStart + b * beatLen;
      makeRide(samples, n, bTime, 0.18);
      // Hi-hat on every 8th note (swung)
      makeHihat(samples, n, bTime,                     0.015, 0.08);
      makeHihat(samples, n, bTime + swingAnd(beatLen),  0.020, 0.12);
      // Extra hi-hat bursts for energy (16th note subdivisions)
      makeHihat(samples, n, bTime + beatLen * 0.33,     0.012, 0.05);
    }
  }

  // ── Melody ──
  melodySeq.forEach(({ bar: mbar, beat, ni, dur }) => {
    for (let rep = 0; rep < Math.ceil(bars / 4); rep++) {
      const actualBar = mbar + rep * 4;
      if (actualBar >= bars) return;
      const ci    = actualBar % chords.length;
      const chord = chords[ci];
      const freq  = chord[Math.min(ni, chord.length - 1)] * 2; // upper octave for brightness
      makePiano(samples, n, freq, actualBar * 4 * beatLen + beat * beatLen, dur * beatLen * 0.88, 0.068);
    }
  });

  // ── Fade in / fade out ──
  const fadeInSamples  = Math.round(0.2 * SAMPLE_RATE);
  const fadeOutSamples = Math.round(0.8 * SAMPLE_RATE);
  for (let i = 0; i < fadeInSamples; i++) samples[i] *= i / fadeInSamples;
  for (let i = 0; i < fadeOutSamples; i++) {
    const idx = n - fadeOutSamples + i;
    if (idx >= 0 && idx < n) samples[idx] *= 1 - i / fadeOutSamples;
  }

  return samples;
}

const outDir = path.join(__dirname, "../assets/sounds");
fs.mkdirSync(outDir, { recursive: true });

const files = {
  "card-flip.wav": generateCardFlip(),
  "card-draw.wav": generateCardDraw(),
  "shuffle.wav": generateShuffle(),
  "win.wav": generateWin(),
  "lose.wav": generateLose(),
  "button.wav": generateButton(),
  "wild.wav": generateWild(),
  "menu-music.wav": generateMenuMusic(),
  "game-music.wav": generateGameMusic(),
};

for (const [filename, samples] of Object.entries(files)) {
  const outPath = path.join(outDir, filename);
  const buf = createWAV(samples);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${filename}: ${(buf.length / 1024).toFixed(1)}KB`);
}

console.log("All audio files generated!");
