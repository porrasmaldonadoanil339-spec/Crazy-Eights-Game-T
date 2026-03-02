export type AchievementId =
  | "first_win"
  | "win_5"
  | "win_25"
  | "win_100"
  | "lightning_king"
  | "tournament_champ"
  | "coop_hero"
  | "challenge_master"
  | "eight_wizard"
  | "eight_10"
  | "perfect_hand"
  | "comeback_king"
  | "speed_demon"
  | "collector_50"
  | "collector_500"
  | "daily_streak_3"
  | "daily_streak_7"
  | "all_modes";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  target: number;
  coinsReward: number;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    title: "Primera Victoria",
    description: "Gana tu primera partida.",
    icon: "star",
    iconColor: "#FFD700",
    target: 1,
    coinsReward: 20,
    xpReward: 50,
    rarity: "common",
  },
  {
    id: "win_5",
    title: "Jugador Experimentado",
    description: "Gana 5 partidas.",
    icon: "star-half",
    iconColor: "#FFD700",
    target: 5,
    coinsReward: 30,
    xpReward: 80,
    rarity: "common",
  },
  {
    id: "win_25",
    title: "Maestro de Cartas",
    description: "Gana 25 partidas.",
    icon: "ribbon",
    iconColor: "#C0C0C0",
    target: 25,
    coinsReward: 75,
    xpReward: 200,
    rarity: "rare",
  },
  {
    id: "win_100",
    title: "Leyenda",
    description: "Gana 100 partidas.",
    icon: "trophy",
    iconColor: "#D4AF37",
    target: 100,
    coinsReward: 250,
    xpReward: 500,
    rarity: "legendary",
  },
  {
    id: "lightning_king",
    title: "Rey Relámpago",
    description: "Gana 10 partidas en modo Relámpago.",
    icon: "flash",
    iconColor: "#FFD700",
    target: 10,
    coinsReward: 50,
    xpReward: 120,
    rarity: "rare",
  },
  {
    id: "tournament_champ",
    title: "Campeón",
    description: "Gana 3 torneos.",
    icon: "medal",
    iconColor: "#E67E22",
    target: 3,
    coinsReward: 100,
    xpReward: 300,
    rarity: "epic",
  },
  {
    id: "coop_hero",
    title: "Héroe Cooperativo",
    description: "Gana 5 partidas en modo Cooperativo.",
    icon: "people",
    iconColor: "#27AE60",
    target: 5,
    coinsReward: 60,
    xpReward: 150,
    rarity: "rare",
  },
  {
    id: "challenge_master",
    title: "Maestro de Desafíos",
    description: "Completa 10 desafíos.",
    icon: "checkbox",
    iconColor: "#9B59B6",
    target: 10,
    coinsReward: 80,
    xpReward: 200,
    rarity: "epic",
  },
  {
    id: "eight_wizard",
    title: "Mago del 8",
    description: "Juega un 8 Loco para ganar la partida.",
    icon: "diamond",
    iconColor: "#1A8FC1",
    target: 1,
    coinsReward: 25,
    xpReward: 60,
    rarity: "rare",
  },
  {
    id: "eight_10",
    title: "Locomoción",
    description: "Juega 10 ochos locos en total.",
    icon: "infinite",
    iconColor: "#9B59B6",
    target: 10,
    coinsReward: 40,
    xpReward: 100,
    rarity: "rare",
  },
  {
    id: "perfect_hand",
    title: "Mano Perfecta",
    description: "Gana una partida sin haber robado ninguna carta.",
    icon: "sparkles",
    iconColor: "#FFD700",
    target: 1,
    coinsReward: 50,
    xpReward: 130,
    rarity: "epic",
  },
  {
    id: "comeback_king",
    title: "Rey del Comeback",
    description: "Gana una partida teniendo 10+ cartas en mano.",
    icon: "arrow-up-circle",
    iconColor: "#E74C3C",
    target: 1,
    coinsReward: 40,
    xpReward: 110,
    rarity: "epic",
  },
  {
    id: "speed_demon",
    title: "Demonio Veloz",
    description: "Gana en modo Relámpago en menos de 2 minutos.",
    icon: "speedometer",
    iconColor: "#E74C3C",
    target: 1,
    coinsReward: 35,
    xpReward: 90,
    rarity: "rare",
  },
  {
    id: "collector_50",
    title: "Ahorrador",
    description: "Acumula 50 monedas.",
    icon: "cash",
    iconColor: "#F1C40F",
    target: 50,
    coinsReward: 10,
    xpReward: 30,
    rarity: "common",
  },
  {
    id: "collector_500",
    title: "Rico Rico",
    description: "Acumula 500 monedas.",
    icon: "wallet",
    iconColor: "#D4AF37",
    target: 500,
    coinsReward: 50,
    xpReward: 150,
    rarity: "epic",
  },
  {
    id: "daily_streak_3",
    title: "Constante",
    description: "Juega 3 días seguidos.",
    icon: "calendar",
    iconColor: "#1A8FC1",
    target: 3,
    coinsReward: 20,
    xpReward: 50,
    rarity: "common",
  },
  {
    id: "daily_streak_7",
    title: "Adicto al Juego",
    description: "Juega 7 días seguidos.",
    icon: "flame",
    iconColor: "#E67E22",
    target: 7,
    coinsReward: 60,
    xpReward: 160,
    rarity: "rare",
  },
  {
    id: "all_modes",
    title: "Todoterreno",
    description: "Gana una partida en cada modo de juego.",
    icon: "grid",
    iconColor: "#9B59B6",
    target: 6,
    coinsReward: 150,
    xpReward: 400,
    rarity: "legendary",
  },
];

export const RARITY_COLORS = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

export function getAchievementById(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
