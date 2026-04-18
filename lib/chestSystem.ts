import { STORE_ITEMS, StoreItem } from "@/lib/storeItems";

export type ChestType = "common" | "rare" | "epic" | "legendary";

export interface Chest {
  id: string;
  type: ChestType;
  obtainedAt: number;
  source: "win" | "rank_up" | "mission" | "streak" | "achievement" | "daily" | "purchase";
}

export interface ChestReward {
  coins: number;
  xp: number;
  item?: StoreItem;
}

export interface ChestConfig {
  name: string;
  color: string;
  glowColor: string;
  bgColors: [string, string, string];
  borderColor: string;
  coinsRange: [number, number];
  xpRange: [number, number];
  itemChance: number;
  itemRarities: string[];
  winsRequired: number;
}

export const CHEST_CONFIG: Record<ChestType, ChestConfig> = {
  common: {
    name: "Cofre Común",
    color: "#A0724A",
    glowColor: "#C8960A",
    bgColors: ["#3D2B0A", "#5C3E12", "#3D2B0A"],
    borderColor: "#C8960A",
    coinsRange: [15, 30],
    xpRange: [20, 50],
    itemChance: 0.15,
    itemRarities: ["common"],
    winsRequired: 3,
  },
  rare: {
    name: "Cofre Raro",
    color: "#1A6FC4",
    glowColor: "#4A9AE8",
    bgColors: ["#0A1E3D", "#1A3A6A", "#0A1E3D"],
    borderColor: "#4A9AE8",
    coinsRange: [30, 60],
    xpRange: [50, 100],
    itemChance: 0.35,
    itemRarities: ["common", "rare"],
    winsRequired: 7,
  },
  epic: {
    name: "Cofre Épico",
    color: "#7B2FBE",
    glowColor: "#A855F7",
    bgColors: ["#1A0A3D", "#2D1A5C", "#1A0A3D"],
    borderColor: "#A855F7",
    coinsRange: [60, 100],
    xpRange: [100, 200],
    itemChance: 0.55,
    itemRarities: ["common", "rare", "epic"],
    winsRequired: 15,
  },
  legendary: {
    name: "Cofre Legendario",
    color: "#D4AF37",
    glowColor: "#FFD700",
    bgColors: ["#1A1400", "#2A2000", "#1A1400"],
    borderColor: "#D4AF37",
    coinsRange: [100, 200],
    xpRange: [200, 400],
    itemChance: 0.80,
    itemRarities: ["rare", "epic", "legendary"],
    winsRequired: 25,
  },
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateChestId(): string {
  return `chest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createChest(type: ChestType, source: Chest["source"]): Chest {
  return {
    id: generateChestId(),
    type,
    obtainedAt: Date.now(),
    source,
  };
}

export function openChest(chest: Chest, ownedItems: string[]): ChestReward {
  const config = CHEST_CONFIG[chest.type];

  const coins = rand(config.coinsRange[0], config.coinsRange[1]);
  const xp = rand(config.xpRange[0], config.xpRange[1]);

  let item: StoreItem | undefined;

  if (Math.random() < config.itemChance) {
    const eligibleItems = STORE_ITEMS.filter(
      (s) =>
        config.itemRarities.includes(s.rarity ?? "common") &&
        !ownedItems.includes(s.id) &&
        !s.isDefault
    );

    if (eligibleItems.length > 0) {
      const idx = Math.floor(Math.random() * eligibleItems.length);
      item = eligibleItems[idx];
    }
  }

  return { coins, xp, item };
}

export function getChestTypeForStreak(winStreak: number): ChestType | null {
  if (winStreak >= 10) return "legendary";
  if (winStreak >= 7) return "epic";
  if (winStreak >= 5) return "rare";
  if (winStreak >= 3) return "common";
  return null;
}

export function getWinsForNextChest(totalWins: number): { winsLeft: number; chestType: ChestType } {
  const thresholds = [
    { wins: 3, type: "common" as ChestType },
    { wins: 7, type: "rare" as ChestType },
    { wins: 15, type: "epic" as ChestType },
    { wins: 25, type: "legendary" as ChestType },
  ];

  for (const t of thresholds) {
    const progress = totalWins % t.wins;
    if (progress > 0) {
      return { winsLeft: t.wins - progress, chestType: t.type };
    }
  }
  return { winsLeft: 3 - (totalWins % 3), chestType: "common" };
}

export function getChestProgress(totalWins: number): {
  winsLeft: number;
  chestType: ChestType;
  progress: number;
  total: number;
} {
  const CYCLE = 3;
  const progress = totalWins % CYCLE;
  const winsLeft = CYCLE - progress;
  const chestType: ChestType =
    totalWins > 0 && totalWins % 25 === 0
      ? "legendary"
      : totalWins > 0 && totalWins % 15 === 0
      ? "epic"
      : totalWins > 0 && totalWins % 7 === 0
      ? "rare"
      : "common";
  return { winsLeft, chestType, progress, total: CYCLE };
}
