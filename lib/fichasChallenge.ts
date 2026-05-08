import AsyncStorage from "@react-native-async-storage/async-storage";

// Reto de Fichas — premium casino-themed challenge. Three escalating tiers
// per session; each tier completed grants a richer reward, with V3 dropping
// a guaranteed premium chip-themed chest.

export type FichasTier = 1 | 2 | 3;

export interface FichasTierConfig {
  tier: FichasTier;
  title: string;
  desc: string;
  fichasReward: number;
  bonusCoins: number;
  chest?: "common" | "rare" | "epic" | "legendary";
  accentColor: string;
}

export const FICHAS_TIERS: FichasTierConfig[] = [
  {
    tier: 1,
    title: "V1 — Apuesta Inicial",
    desc: "Gana 1 partida y embolsa fichas premium.",
    fichasReward: 25,
    bonusCoins: 0,
    accentColor: "#4A90E2",
  },
  {
    tier: 2,
    title: "V2 — Doble o Nada",
    desc: "Encadena otra victoria y suma un bono de monedas.",
    fichasReward: 50,
    bonusCoins: 100,
    accentColor: "#7B61FF",
  },
  {
    tier: 3,
    title: "V3 — All In",
    desc: "Tercera victoria seguida: cofre premium de fichas garantizado.",
    fichasReward: 100,
    bonusCoins: 250,
    chest: "legendary",
    accentColor: "#A855F7",
  },
];

interface FichasState {
  currentTier: FichasTier;
  winsThisRun: number;
  totalRunsCompleted: number;
  lastResetAt: number;
}

const STORAGE_KEY = "ocho_fichas_challenge_v1";
const RUN_RESET_HOURS = 24;

const DEFAULT_STATE: FichasState = {
  currentTier: 1,
  winsThisRun: 0,
  totalRunsCompleted: 0,
  lastResetAt: 0,
};

export async function getFichasState(): Promise<FichasState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const saved = JSON.parse(raw) as FichasState;
    const ageHours = (Date.now() - saved.lastResetAt) / 3600000;
    // Daily reset — keeps the casino challenge a fresh decision each day.
    if (ageHours >= RUN_RESET_HOURS) {
      return { ...DEFAULT_STATE, totalRunsCompleted: saved.totalRunsCompleted, lastResetAt: Date.now() };
    }
    return saved;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function recordFichasWin(): Promise<{
  state: FichasState;
  tierJustCleared: FichasTierConfig | null;
  runComplete: boolean;
}> {
  const state = await getFichasState();
  const wins = state.winsThisRun + 1;
  const cleared = FICHAS_TIERS.find((t) => t.tier === wins) ?? null;
  const runComplete = wins >= 3;
  const next: FichasState = runComplete
    ? { currentTier: 1, winsThisRun: 0, totalRunsCompleted: state.totalRunsCompleted + 1, lastResetAt: Date.now() }
    : { currentTier: ((wins + 1) as FichasTier), winsThisRun: wins, totalRunsCompleted: state.totalRunsCompleted, lastResetAt: state.lastResetAt || Date.now() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { state: next, tierJustCleared: cleared, runComplete };
}

export async function resetFichasRun(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_STATE, lastResetAt: Date.now() }));
}

export function getTierConfig(tier: FichasTier): FichasTierConfig {
  return FICHAS_TIERS.find((t) => t.tier === tier) ?? FICHAS_TIERS[0];
}
