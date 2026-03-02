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

// --- Background music loop: jazz piano pattern (8 bars, 120BPM) ---
function generateMenuMusic() {
  const BPM = 118;
  const beatLen = 60 / BPM;
  const bars = 8;
  const duration = bars * 4 * beatLen;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);

  // Jazz chord progression: Dm7 | G7 | Cmaj7 | Fmaj7 (repeated)
  const progression = [
    // Dm7: D F A C
    [293.7, 349.2, 440.0, 523.3],
    // G7: G B D F
    [392.0, 493.9, 587.3, 698.5],
    // Cmaj7: C E G B
    [261.6, 329.6, 392.0, 493.9],
    // Fmaj7: F A C E
    [349.2, 440.0, 523.3, 659.3],
  ];

  // Bass line (every beat)
  const bassNotes = [293.7 / 2, 392.0 / 2, 261.6 / 2, 349.2 / 2];

  function addNote(freq, startTime, dur, gainVal) {
    const start = Math.round(startTime * SAMPLE_RATE);
    const len = Math.round(dur * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const si = start + i;
      if (si >= n) break;
      const t = i / SAMPLE_RATE;
      const env = t < 0.01 ? t / 0.01 : Math.exp(-(t - 0.01) * (1 / dur) * 3);
      const s = (
        Math.sin(2 * Math.PI * freq * t) * 0.5 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.1
      ) * env * gainVal;
      samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
    }
  }

  for (let bar = 0; bar < bars; bar++) {
    const chordIdx = bar % progression.length;
    const chord = progression[chordIdx];
    const bass = bassNotes[chordIdx];
    const barStart = bar * 4 * beatLen;

    // Chord stabs on beats 1 and 3
    chord.forEach(freq => {
      addNote(freq, barStart, beatLen * 1.8, 0.07);
      addNote(freq, barStart + 2 * beatLen, beatLen * 1.5, 0.06);
    });

    // Bass on every beat
    for (let beat = 0; beat < 4; beat++) {
      const bTime = barStart + beat * beatLen;
      addNote(bass, bTime, beatLen * 0.7, 0.18);
      // Off-beat bass (slight shuffle feel)
      if (beat < 3) addNote(bass * 1.059, bTime + beatLen * 0.67, beatLen * 0.2, 0.08);
    }

    // Melody notes
    const melodyPattern = [
      [0, chord[2]], [0.5, chord[3]], [1, chord[2]], [1.5, chord[1]],
      [2, chord[2]], [2.5, chord[3]], [3, chord[3] * 1.059], [3.5, chord[3]],
    ];
    melodyPattern.forEach(([beat, freq]) => {
      addNote(freq, barStart + beat * beatLen, beatLen * 0.6, 0.06);
    });
  }

  // Fade out last half second
  const fadeStart = Math.round((duration - 0.5) * SAMPLE_RATE);
  for (let i = fadeStart; i < n; i++) {
    samples[i] *= 1 - (i - fadeStart) / (n - fadeStart);
  }

  return samples;
}

// Generate game music (slightly different feel)
function generateGameMusic() {
  const BPM = 124;
  const beatLen = 60 / BPM;
  const bars = 8;
  const duration = bars * 4 * beatLen;
  const n = Math.round(SAMPLE_RATE * duration);
  const samples = new Array(n).fill(0);

  // More tense progression: Am | E7 | Am | Dm
  const progression = [
    [220.0, 261.6, 329.6, 440.0],  // Am
    [164.8, 207.7, 247.0, 329.6],  // E7/2
    [220.0, 261.6, 329.6, 440.0],  // Am
    [146.8, 174.6, 220.0, 293.7],  // Dm
  ];
  const bassNotes = [110.0, 82.4, 110.0, 73.4];

  function addNote(freq, startTime, dur, gainVal) {
    const start = Math.round(startTime * SAMPLE_RATE);
    const len = Math.round(dur * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const si = start + i;
      if (si >= n) break;
      const t = i / SAMPLE_RATE;
      const env = t < 0.005 ? t / 0.005 : Math.exp(-(t - 0.005) * (1 / dur) * 4);
      const s = (
        Math.sin(2 * Math.PI * freq * t) * 0.5 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.2
      ) * env * gainVal;
      samples[si] = Math.max(-1, Math.min(1, samples[si] + s));
    }
  }

  for (let bar = 0; bar < bars; bar++) {
    const chordIdx = bar % progression.length;
    const chord = progression[chordIdx];
    const bass = bassNotes[chordIdx];
    const barStart = bar * 4 * beatLen;

    chord.forEach(freq => {
      addNote(freq, barStart, beatLen * 2, 0.06);
      addNote(freq, barStart + 2 * beatLen, beatLen * 1.8, 0.055);
    });

    for (let beat = 0; beat < 4; beat++) {
      const bTime = barStart + beat * beatLen;
      addNote(bass, bTime, beatLen * 0.6, 0.2);
    }
  }

  // Fade out
  const fadeStart = Math.round((duration - 0.5) * SAMPLE_RATE);
  for (let i = fadeStart; i < n; i++) {
    samples[i] *= 1 - (i - fadeStart) / (n - fadeStart);
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
