export type GameModeId =
  | "classic"
  | "lightning"
  | "tournament"
  | "coop"
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
  isNew?: boolean;
  hasDifficulty: boolean;
  timerSeconds?: number;
  hasHints?: boolean;
  teamMode?: boolean;
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
    coinsReward: 15,
    xpReward: 50,
    hasDifficulty: true,
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
    coinsReward: 10,
    xpReward: 30,
    hasDifficulty: true,
    timerSeconds: 10,
  },
  {
    id: "tournament",
    name: "Torneo",
    nameShort: "Torneo",
    description: "Gana 2 de 3 rondas para llevarte el trofeo.",
    cardsPerPlayer: 8,
    icon: "trophy",
    iconLib: "Ionicons",
    color: "#E67E22",
    coinsReward: 40,
    xpReward: 120,
    hasDifficulty: true,
  },
  {
    id: "coop",
    name: "Cooperativo",
    nameShort: "2v2",
    description: "2 vs 2: Tú + Aliado vs 2 rivales. Equipos comparten mazo. Turnos: Tú → Aliado → Rival 1 → Rival 2.",
    cardsPerPlayer: 8,
    icon: "people",
    iconLib: "Ionicons",
    color: "#27AE60",
    coinsReward: 25,
    xpReward: 80,
    hasDifficulty: true,
    teamMode: true,
  },
  {
    id: "challenge",
    name: "Desafíos",
    nameShort: "Desafíos",
    description: "Retos diarios con reglas especiales y recompensas únicas.",
    cardsPerPlayer: 7,
    icon: "ribbon",
    iconLib: "Ionicons",
    color: "#9B59B6",
    coinsReward: 30,
    xpReward: 100,
    hasDifficulty: false,
  },
  {
    id: "practice",
    name: "Práctica",
    nameShort: "Práctica",
    description: "Aprende sin presión. Pistas y sin penalización.",
    cardsPerPlayer: 7,
    icon: "school",
    iconLib: "Ionicons",
    color: "#1A8FC1",
    coinsReward: 5,
    xpReward: 15,
    hasDifficulty: true,
    hasHints: true,
    timerSeconds: 30,
  },
];

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

export function getModeById(id: GameModeId): GameModeConfig {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}

export function getDifficultyById(id: Difficulty): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
