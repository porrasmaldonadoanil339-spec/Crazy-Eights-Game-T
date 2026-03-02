export type GameModeId =
  | "classic"
  | "lightning"
  | "tournament"
  | "coop"
  | "challenge"
  | "practice";

export type Difficulty = "easy" | "normal" | "intermediate" | "hard";

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  nameShort: string;
  description: string;
  cardsPerPlayer: number;
  icon: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons";
  color: string;
  coinsReward: number;
  xpReward: number;
  isNew?: boolean;
  hasDifficulty: boolean;
}

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  stars: number;
  aiAccuracy: number;
  xpMultiplier: number;
  coinMultiplier: number;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: "classic",
    name: "Clásico",
    nameShort: "Clásico",
    description: "El juego tradicional con 8 cartas por jugador.",
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
    description: "Partidas rápidas con solo 5 cartas. ¡Velocidad al máximo!",
    cardsPerPlayer: 5,
    icon: "flash",
    iconLib: "Ionicons",
    color: "#FFD700",
    coinsReward: 10,
    xpReward: 30,
    hasDifficulty: true,
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
    description: "Tú + un aliado IA vs 2 CPUs. ¡Trabajo en equipo!",
    cardsPerPlayer: 7,
    icon: "people",
    iconLib: "Ionicons",
    color: "#27AE60",
    coinsReward: 25,
    xpReward: 80,
    isNew: true,
    hasDifficulty: true,
  },
  {
    id: "challenge",
    name: "Desafíos",
    nameShort: "Desafíos",
    description: "Retos especiales diarios y semanales con recompensas únicas.",
    cardsPerPlayer: 7,
    icon: "ribbon",
    iconLib: "Ionicons",
    color: "#9B59B6",
    coinsReward: 30,
    xpReward: 100,
    isNew: true,
    hasDifficulty: false,
  },
  {
    id: "practice",
    name: "Práctica",
    nameShort: "Práctica",
    description: "Aprende sin presión. Pistas ilimitadas y sin penalización.",
    cardsPerPlayer: 7,
    icon: "school",
    iconLib: "Ionicons",
    color: "#1A8FC1",
    coinsReward: 5,
    xpReward: 15,
    hasDifficulty: true,
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
];

export function getModeById(id: GameModeId): GameModeConfig {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}

export function getDifficultyById(id: Difficulty): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
