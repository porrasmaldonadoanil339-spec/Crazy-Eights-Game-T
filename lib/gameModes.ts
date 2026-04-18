export type GameModeId =
  | "classic"
  | "lightning"
  | "tournament"
  | "challenge"
  | "practice"
  | "ranked";

export type Difficulty = "easy" | "normal" | "intermediate" | "hard" | "expert";

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  nameShort: string;
  description: string;
  cardsPerPlayer: number;
  icon: string;
  iconLib: "Ionicons";
  color: string;
  coinsReward: number;
  xpReward: number;
  xpLoss: number;
  coinsLoss: number;
  isNew?: boolean;
  hasDifficulty: boolean;
  timerSeconds?: number;
  hasHints?: boolean;
  isOnline?: boolean;
}

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  stars: number;
  aiAccuracy: number;
  xpMultiplier: number;
  coinMultiplier: number;
  hasTimer?: boolean;
  timerSeconds?: number;
}

// Modes shown in the main grid (ranked lives in its own top-section card)
export const GAME_MODES: GameModeConfig[] = [
  {
    id: "classic",
    name: "Clásico",
    nameShort: "Clásico",
    description: "Reglas completas: 2, 3, 7, 8, 10, J y Comodín activos.",
    cardsPerPlayer: 8,
    icon: "card-outline",
    iconLib: "Ionicons",
    color: "#D4AF37",
    coinsReward: 10,
    xpReward: 20,
    xpLoss: 10,
    coinsLoss: 0,
    hasDifficulty: false,
    isOnline: true,
  },
  {
    id: "lightning",
    name: "Relámpago",
    nameShort: "Rayo",
    description: "5 cartas, partida rápida. ¡El primero en vaciar gana!",
    cardsPerPlayer: 5,
    icon: "flash",
    iconLib: "Ionicons",
    color: "#FFD700",
    coinsReward: 8,
    xpReward: 15,
    xpLoss: 5,
    coinsLoss: 0,
    hasDifficulty: false,
    timerSeconds: 8,
    isOnline: true,
  },
  {
    id: "tournament",
    name: "Torneo",
    nameShort: "Torneo",
    description: "Gana 2 de 3 rondas frente a oponentes para llevarte el trofeo.",
    cardsPerPlayer: 8,
    icon: "trophy",
    iconLib: "Ionicons",
    color: "#E67E22",
    coinsReward: 30,
    xpReward: 50,
    xpLoss: 20,
    coinsLoss: 0,
    hasDifficulty: false,
    isOnline: true,
  },
  {
    id: "challenge",
    name: "Desafíos",
    nameShort: "Desafíos",
    description: "Retos diarios con reglas especiales y recompensas únicas.",
    cardsPerPlayer: 8,
    icon: "ribbon",
    iconLib: "Ionicons",
    color: "#9B59B6",
    coinsReward: 20,
    xpReward: 30,
    xpLoss: 15,
    coinsLoss: 0,
    hasDifficulty: false,
    isOnline: true,
  },
  {
    id: "practice",
    name: "Práctica",
    nameShort: "Práctica",
    description: "Entrena sin presión. Pistas visuales, sin penalización.",
    cardsPerPlayer: 8,
    icon: "school",
    iconLib: "Ionicons",
    color: "#1A8FC1",
    coinsReward: 0,
    xpReward: 0,
    xpLoss: 0,
    coinsLoss: 0,
    hasDifficulty: true,
    hasHints: true,
    timerSeconds: 30,
  },
];

// Full config for ranked (used in reward calculations; not shown in GAME_MODES grid)
export const RANKED_MODE_CONFIG: GameModeConfig = {
  id: "ranked",
  name: "Clasificatoria",
  nameShort: "Ranked",
  description: "Sube de rango compitiendo en partidas clasificatorias.",
  cardsPerPlayer: 8,
  icon: "trophy",
  iconLib: "Ionicons",
  color: "#D4AF37",
  coinsReward: 20,
  xpReward: 30,
  xpLoss: 10,
  coinsLoss: 0,
  hasDifficulty: false,
  isOnline: true,
};

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: "easy",
    name: "Fácil",
    stars: 1,
    aiAccuracy: 0.4,
    xpMultiplier: 0.8,
    coinMultiplier: 0.8,
  },
  {
    id: "normal",
    name: "Normal",
    stars: 2,
    aiAccuracy: 0.65,
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
  },
  {
    id: "intermediate",
    name: "Intermedio",
    stars: 3,
    aiAccuracy: 0.82,
    xpMultiplier: 1.3,
    coinMultiplier: 1.3,
  },
  {
    id: "hard",
    name: "Difícil",
    stars: 4,
    aiAccuracy: 1.0,
    xpMultiplier: 1.7,
    coinMultiplier: 1.7,
  },
  {
    id: "expert",
    name: "Experto",
    stars: 5,
    aiAccuracy: 1.0,
    xpMultiplier: 2.5,
    coinMultiplier: 2.5,
    hasTimer: true,
    timerSeconds: 8,
  },
];

export function getModeById(id: string): GameModeConfig {
  if (id === "ranked") return RANKED_MODE_CONFIG;
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}

export function getDifficultyById(id: Difficulty): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
