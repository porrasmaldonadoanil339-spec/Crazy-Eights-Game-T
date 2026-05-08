// Procedural rival generator — produces 100,000+ unique, deterministic profiles
// Each index 0-99999 always returns the same profile (deterministic by design)

export interface RivalProfile {
  name: string;
  avatarId: string;
  titleId: string;
  level: number;
  avatarColor: string;
  avatarIcon: string;
  photoUrl?: string;
}

// ─── Name pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Carlos","Ana","Miguel","Sofia","Diego","Valentina","Luis","Camila","Andrés","Isabela",
  "Mateo","Luciana","Santiago","Daniela","Sebastián","Gabriela","Alejandro","Paula","Gabriel","Natalia",
  "José","María","Ricardo","Carolina","Fernando","Marcela","Eduardo","Alejandra","Javier","Valeria",
  "Roberto","Lorena","Víctor","Melissa","Raúl","Paola","Jorge","Claudia","Héctor","Fernanda",
  "Sergio","Patricia","Marco","Jessica","Arturo","Liliana","Pablo","Verónica","Óscar","Diana",
  "Emilio","Elena","Rodrigo","Mariana","Felipe","Laura","César","Stephanie","Manuel","Monica",
  "René","Adriana","Ernesto","Susana","Guillermo","Karina","Ignacio","Fabiola","Ramón","Graciela",
  "Alberto","Rocío","Xavier","Norma","Edmundo","Beatriz","Adolfo","Silvia","Gonzalo","Olga",
  "Enrique","Rosa","Alfredo","Carmen","Mauricio","Miriam","Agustín","Esperanza","Esteban","Angélica",
  "Hugo","Inés","Ivan","Marisol","Rubén","Pilar","Tomás","Gloria","Rafael","Consuelo",
  "Alex","Kim","Sam","Chris","Jordan","Taylor","Morgan","Casey","Riley","Avery",
  "Juan","Pedro","Antonio","Francisco","Nicolás","Martín","Julián","Ezequiel","Lucas","Thiago",
];

const LAST_PARTS = [
  "Mx","Co","Ar","Pe","Ve","Cl","Bo","Ec","Uy","Py",
  "123","456","789","007","666","777","888","999","100","200",
  "Pro","Top","Ace","King","God","Gg","Vip","Max","Ultra","Neo",
  "XD","X","Z","Q","W","V","JR","SR","II","III",
  "Gamer","Play","Dark","Fire","Ice","Flash","Storm","Nova","Star","Wolf",
  "_xX","Xx_","xXx","_","__","_Pro","_GG","_Top","_Max","_Ace",
  "1K","2K","5K","10K","99","77","55","33","11","22",
  "Loco","Fresa","Crack","Libre","Pica","Rayo","Bala","Trueno","Titan","Comet",
  "RD","BZ","GT","RS","XT","HD","FX","VX","NX","ZX",
  "Flores","Gómez","López","García","Martínez","Rodríguez","Pérez","Sánchez","Torres","Ramírez",
  "Herrera","Díaz","Vargas","Castro","Reyes","Cruz","Ortiz","Morales","Gutiérrez","Jiménez",
  "Moreno","Ramos","Álvarez","Romero","Ruiz","Blanco","Domínguez","Serrano","Navarro","Vega",
  "Molina","Delgado","Suárez","Muñoz","Iglesias","Aguilar","Cano","Lara","Núñez","Cabrera",
  "Parra","Fuentes","Guerrero","Medina","Castillo","Soto","Ríos","Peña","Escobar","Mendoza",
  "Valdez","Silva","Rojas","Contreras","Figueroa","Salinas","León","Mendez","Vásquez","Cortez",
  "Zamora","Acosta","Pacheco","Fuentes","Carrillo","Sandoval","Bravo","Ibáñez","Montes","Solano",
  "Moya","Palacios","Cárdenas","Zapata","Barrios","Arenas","Trujillo","Paredes","Vera","Tapia",
  "Arias","Cordero","Salazar","Camacho","Campos","Espinoza","Cuevas","Ochoa","Estrada","Ávila",
  "Zúñiga","Cisneros","Bernal","Palomino","Beltrán","Bustos","Monroy","Quintero","Miranda","Villanueva",
];

// Separators and formatting patterns for name style variety
const NAME_STYLES = [
  (f: string, l: string) => `${f}${l}`,
  (f: string, l: string) => `${f}_${l}`,
  (f: string, l: string) => `${f}.${l}`,
  (f: string, l: string) => `${f}${l.toLowerCase()}`,
  (f: string, l: string) => `${f.toLowerCase()}${l}`,
  (f: string, l: string) => `El_${f}${l}`,
  (f: string, l: string) => `La_${f}${l}`,
  (f: string, l: string) => `${f}${l}_${["MX","CO","AR","PE","VE","CL","EC","BO"][Math.abs(f.length + l.length) % 8]}`,
  (f: string, l: string) => `Pro_${f}${l}`,
  (f: string, l: string) => `xX_${f}_Xx`,
];

// ─── Avatar pools ─────────────────────────────────────────────────────────────
const AVATAR_IDS = [
  "avatar_samurai","avatar_wizard","avatar_dragon","avatar_knight","avatar_scholar",
  "avatar_phoenix","avatar_gladiator","avatar_cyber","avatar_merchant","avatar_reaper",
  "avatar_princess","avatar_ninja","avatar_pirate","avatar_king","avatar_jester",
  "avatar_emperor","avatar_sheriff","avatar_viking","avatar_monk","avatar_assassin",
];

const TITLE_IDS = [
  "title_rookie","title_regular","title_pro","title_ace","title_strategist",
  "title_shark","title_hustler","title_queen","title_legend","title_grandmaster",
  "title_immortal","title_god","title_phantom","title_joker","title_eternal",
];

const AVATAR_ICONS: readonly string[] = [
  "flame","shield","star","trophy","skull","heart","flash","eye","cut","moon",
  "rocket","diamond","sunny","cloud","thunderstorm","bug","leaf","water","snow","musical-notes",
  "game-controller","hardware-chip","book","bag","ribbon","medal","fish","paw","beer","pizza",
];

const AVATAR_COLORS = [
  "#E74C3C","#9B59B6","#E67E22","#95A5A6","#4A90D9","#D4AF37","#C0392B","#00D4FF",
  "#8B7355","#1a0020","#E91E8C","#1a1a2e","#2C3E50","#27AE60","#AD1457","#00BCD4",
  "#FF5722","#FF6F00","#3498DB","#1ABC9C","#F39C12","#8E44AD","#16A085","#E74C3C",
];

// ─── Seeded deterministic hash ─────────────────────────────────────────────────
function hash(n: number): number {
  let x = n ^ 0xDEADBEEF;
  x = ((x >>> 16) ^ x) * 0x45D9F3B | 0;
  x = ((x >>> 16) ^ x) * 0x45D9F3B | 0;
  x = (x >>> 16) ^ x;
  return Math.abs(x);
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[hash(seed) % arr.length];
}

// ─── Generate a single rival from index 0-99999 ───────────────────────────────
export function generateRival(index: number): RivalProfile {
  const h = hash(index * 7919 + 1);
  const h2 = hash(index * 6271 + 3);
  const h3 = hash(index * 5381 + 7);
  const h4 = hash(index * 4481 + 11);
  const h5 = hash(index * 3571 + 13);

  const firstName = FIRST_NAMES[h % FIRST_NAMES.length];
  const lastPart = LAST_PARTS[h2 % LAST_PARTS.length];
  const styleFn = NAME_STYLES[h3 % NAME_STYLES.length];
  const name = styleFn(firstName, lastPart).slice(0, 16);

  // Level: spread across 1-99 in a realistic distribution (most players mid-range)
  // Use bell-curve-like distribution centered at 35
  const raw = (h4 % 100);
  const level = raw < 5 ? 1 + (h4 % 5)
    : raw < 20 ? 5 + (h4 % 20)
    : raw < 50 ? 20 + (h4 % 30)
    : raw < 80 ? 45 + (h4 % 30)
    : raw < 95 ? 70 + (h4 % 20)
    : 90 + (h4 % 10);

  const avatarId = pick(AVATAR_IDS, h);
  const titleId = pick(TITLE_IDS, h2);
  const avatarColor = pick(AVATAR_COLORS, h3);
  const avatarIcon = pick(AVATAR_ICONS, h4) as string;

  // Use pravatar.cc (img 1-99 available)
  const imgNum = (h5 % 99) + 1;
  const photoUrl = `https://i.pravatar.cc/80?img=${imgNum}`;

  return { name, avatarId, titleId, level, avatarColor, avatarIcon, photoUrl };
}

// ─── Session-level memory of rivals already shown today ─────────────────────
// Avoids repeating the same rival within the same session/day. Cleared when the
// app process restarts, but combined with the per-second startOffset this gives
// near-zero repeat probability over a single play day.
const _sessionUsedRivals = new Set<number>();
const _sessionDayKey = new Date().toDateString();

function getSessionExcludes(): Set<number> {
  // Reset if the day rolled over while the app was open
  if (new Date().toDateString() !== _sessionDayKey) {
    _sessionUsedRivals.clear();
  }
  return _sessionUsedRivals;
}

// ─── Pick N rivals near a given player level, no repeats ─────────────────────
// Task #125 — also dedupes by displayed name and avatarId within the batch so
// matchmaking never shows two rivals that look or read alike (a common
// immersion break). The session-wide name/avatar memory is bounded so longer
// sessions still find candidates.
const _sessionUsedNames = new Set<string>();
const _sessionUsedAvatars = new Set<string>();

export function pickRivals(
  n: number,
  playerLevel: number,
  excludeIndices?: Set<number>
): RivalProfile[] {
  const results: RivalProfile[] = [];
  const resultIndices: number[] = [];
  const sessionUsed = getSessionExcludes();
  const used = new Set<number>([...sessionUsed, ...(excludeIndices ?? [])]);
  // Per-batch dedupe: within a single matchmaking call we never repeat a
  // name or avatar even if the session-wide memory is empty.
  const batchNames = new Set<string>();
  const batchAvatars = new Set<string>();

  // Build a candidate range centered on player level
  // Search in expanding windows until we have enough
  const TOTAL = 100000;
  let attempts = 0;
  let windowSize = 5000;

  // Start from a random offset based on current time to avoid same rivals every game
  const startOffset = Math.floor(Date.now() / 1000) % TOTAL;

  while (results.length < n && attempts < TOTAL) {
    const idx = (startOffset + attempts * 997) % TOTAL; // 997 is prime for good spread
    if (!used.has(idx)) {
      const rival = generateRival(idx);
      // Level filter: within ±15 of player level
      const levelDiff = Math.abs(rival.level - playerLevel);
      const maxDiff = Math.min(15, 10 + Math.floor(results.length * 3)); // expand if needed
      const nameKey = rival.name.toLowerCase();
      const dupName = batchNames.has(nameKey) || _sessionUsedNames.has(nameKey);
      const dupAvatar = batchAvatars.has(rival.avatarId) || _sessionUsedAvatars.has(rival.avatarId);
      if (levelDiff <= maxDiff && !dupName && !dupAvatar) {
        used.add(idx);
        batchNames.add(nameKey);
        batchAvatars.add(rival.avatarId);
        results.push(rival);
        resultIndices.push(idx);
      }
    }
    attempts++;
    if (attempts > windowSize && results.length < n) {
      windowSize += 5000; // expand search window
    }
  }

  // If still not enough (edge case), relax the level filter but keep BOTH
  // the per-batch and the session-wide name/avatar dedupe so matchmaking
  // never repeats a face the player has already seen this session.
  attempts = 0;
  while (results.length < n && attempts < TOTAL) {
    const idx = (startOffset + attempts * 1009) % TOTAL;
    if (!used.has(idx)) {
      const rival = generateRival(idx);
      const nameKey = rival.name.toLowerCase();
      const dupName = batchNames.has(nameKey) || _sessionUsedNames.has(nameKey);
      const dupAvatar = batchAvatars.has(rival.avatarId) || _sessionUsedAvatars.has(rival.avatarId);
      if (!dupName && !dupAvatar) {
        used.add(idx);
        batchNames.add(nameKey);
        batchAvatars.add(rival.avatarId);
        results.push(rival);
        resultIndices.push(idx);
      }
    }
    attempts++;
  }

  // Last-resort fallback: only the per-batch dedupe is still enforced (so a
  // single matchmaking call never shows the same face twice). Session-wide
  // dedupe is dropped here because at this point we've exhausted both the
  // 100k-rival pool and the session memory — extremely rare and worth a
  // duplicate over leaving an empty seat at the table.
  attempts = 0;
  while (results.length < n && attempts < TOTAL) {
    const idx = (startOffset + attempts * 1013) % TOTAL;
    if (!used.has(idx)) {
      const rival = generateRival(idx);
      const nameKey = rival.name.toLowerCase();
      if (!batchNames.has(nameKey) && !batchAvatars.has(rival.avatarId)) {
        used.add(idx);
        batchNames.add(nameKey);
        batchAvatars.add(rival.avatarId);
        results.push(rival);
        resultIndices.push(idx);
      }
    }
    attempts++;
  }

  // Remember these rivals so we never re-issue them this session/day
  results.forEach((r, i) => {
    _sessionUsedNames.add(r.name.toLowerCase());
    _sessionUsedAvatars.add(r.avatarId);
    markRivalUsed(r, resultIndices[i]);
  });
  // Bound the session-wide name/avatar memory — at ~600 entries it auto-trims
  // so very long sessions can still find candidates.
  if (_sessionUsedNames.size > 600) {
    const drop = _sessionUsedNames.values().next().value;
    if (drop !== undefined) _sessionUsedNames.delete(drop);
  }
  if (_sessionUsedAvatars.size > AVATAR_IDS.length - 2) {
    // Avatars pool is small; once nearly exhausted, clear so future picks
    // can succeed without falling back to undeduped rivals.
    _sessionUsedAvatars.clear();
  }
  // Cache the parallel index list keyed by the result array so the
  // pickRivalsWithIndices wrapper can recover it without typing escapes.
  _lastBatchIndices.set(results, resultIndices);
  return results;
}

// Map result-array → its parallel index list. WeakMap so GC reclaims entries
// once the caller drops the result reference; no need for manual cleanup.
const _lastBatchIndices = new WeakMap<RivalProfile[], number[]>();

export interface RivalPickResult {
  rivals: RivalProfile[];
  indices: number[];
}

// Variant that returns parallel arrays of rivals + indices so a caller can
// pass the indices through router params and rebuild the identical profiles
// on another screen via generateRival(idx). Used by ranked matchmaking to
// guarantee the rival shown in the lobby is the rival faced in the match.
export function pickRivalsWithIndices(
  n: number,
  playerLevel: number,
  excludeIndices?: Set<number>,
): RivalPickResult {
  const rivals = pickRivals(n, playerLevel, excludeIndices);
  const indices = _lastBatchIndices.get(rivals) ?? [];
  return { rivals, indices };
}

// Track rivals after they're actually used (called by callers when a match starts)
export function markRivalUsed(rival: RivalProfile, knownIndex?: number) {
  if (typeof knownIndex === "number") {
    _sessionUsedRivals.add(knownIndex);
  } else {
    // Fallback fingerprint when the index isn't known (legacy callers).
    let h = 0;
    for (let i = 0; i < rival.name.length; i++) h = (h * 31 + rival.name.charCodeAt(i)) >>> 0;
    _sessionUsedRivals.add(h % 100000);
  }
  // Cap memory so the set doesn't grow unbounded across very long sessions
  if (_sessionUsedRivals.size > 500) {
    const first = _sessionUsedRivals.values().next().value;
    if (first !== undefined) _sessionUsedRivals.delete(first);
  }
}

// ─── Convert to CpuProfile shape (for backward compatibility) ─────────────────
export function rivalToCpuProfile(r: RivalProfile) {
  return {
    name: r.name,
    avatarId: r.avatarId,
    titleId: r.titleId,
    level: r.level,
    avatarColor: r.avatarColor,
    avatarIcon: r.avatarIcon,
    photoUrl: r.photoUrl,
  };
}

// ─── Pick N rivals as CpuProfile objects ─────────────────────────────────────
export function pickRivalProfiles(n: number, playerLevel = 1): ReturnType<typeof rivalToCpuProfile>[] {
  const rivals = pickRivals(n, playerLevel);
  return rivals.map(rivalToCpuProfile);
}

// Variant that also returns the rival pool indices, so a caller (e.g. the
// ranked matchmaking lobby) can pass them via router params and have the
// game screen rebuild the exact same CpuProfile objects via generateRival.
export function pickRivalProfilesWithIndices(
  n: number,
  playerLevel = 1,
): { profiles: ReturnType<typeof rivalToCpuProfile>[]; indices: number[] } {
  const { rivals, indices } = pickRivalsWithIndices(n, playerLevel);
  return { profiles: rivals.map(rivalToCpuProfile), indices };
}
