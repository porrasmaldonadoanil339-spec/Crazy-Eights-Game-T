// ─── CAMINO DEL JUGADOR (Player Path) ──────────────────────────────────────
// Permanent progression system: 975 levels, XP-based (uses the same totalXp
// that feeds the Battle Pass). Each level grants a reward (coins, chests,
// items or fichas). Never resets.

import type { ChestType } from "./chestSystem";

export interface PlayerPathLevel {
  level: number;
  xpRequired: number; // cumulative xp to reach this level
  reward:
    | { type: "coins"; amount: number }
    | { type: "fichas"; amount: number }
    | { type: "chest"; chestType: ChestType }
    | { type: "item"; itemId: string };
  icon: string;
  iconColor: string;
}

export const MAX_PLAYER_PATH_LEVEL = 975;

// XP curve: gentle so reaching 975 is a true long-term goal but each level is
// achievable. Cumulative XP for level L = round(50 * L^1.55).
// L=1   ~50, L=10  ~1.8k, L=50  ~25k, L=100 ~71k, L=500 ~870k, L=975 ~2.4M
export function xpForPlayerPathLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.round(50 * Math.pow(level, 1.55));
}

export function getPlayerPathLevel(totalXp: number): number {
  // Binary search for the highest level whose xpRequired <= totalXp.
  let lo = 0;
  let hi = MAX_PLAYER_PATH_LEVEL;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (xpForPlayerPathLevel(mid) <= totalXp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function getPlayerPathProgress(totalXp: number): {
  level: number;
  current: number;
  needed: number;
} {
  const level = getPlayerPathLevel(totalXp);
  if (level >= MAX_PLAYER_PATH_LEVEL) {
    return { level: MAX_PLAYER_PATH_LEVEL, current: 0, needed: 0 };
  }
  const start = xpForPlayerPathLevel(level);
  const next = xpForPlayerPathLevel(level + 1);
  return { level, current: totalXp - start, needed: next - start };
}

// Deterministic reward for any level 1..975. Major milestones get better
// rewards. Cycles through coins/fichas/chests/items so progression feels
// varied even at high levels.
export function getPlayerPathReward(level: number): PlayerPathLevel["reward"] {
  if (level <= 0) return { type: "coins", amount: 25 };
  // Massive milestones
  if (level % 100 === 0) return { type: "chest", chestType: "legendary" };
  if (level % 50  === 0) return { type: "chest", chestType: "epic" };
  if (level % 25  === 0) return { type: "chest", chestType: "rare" };
  if (level % 10  === 0) return { type: "chest", chestType: "common" };
  // Fichas every 7
  if (level % 7   === 0) return { type: "fichas", amount: 10 + Math.floor(level / 7) * 2 };
  // Otherwise coins, scaling slowly
  return { type: "coins", amount: 30 + Math.floor(level * 1.5) };
}

export function getPlayerPathLevelData(level: number): PlayerPathLevel {
  const reward = getPlayerPathReward(level);
  let icon = "cash";
  let iconColor = "#F1C40F";
  switch (reward.type) {
    case "fichas":  icon = "diamond";    iconColor = "#3498DB"; break;
    case "chest":
      if (reward.chestType === "legendary") { icon = "star";    iconColor = "#FFD700"; }
      else if (reward.chestType === "epic") { icon = "diamond"; iconColor = "#9B59B6"; }
      else if (reward.chestType === "rare") { icon = "cube";    iconColor = "#4A90D9"; }
      else                                  { icon = "cube";    iconColor = "#95A5A6"; }
      break;
    case "item":    icon = "gift";       iconColor = "#E91E63"; break;
    case "coins":   icon = "cash";       iconColor = "#F1C40F"; break;
  }
  return {
    level,
    xpRequired: xpForPlayerPathLevel(level),
    reward,
    icon,
    iconColor,
  };
}
