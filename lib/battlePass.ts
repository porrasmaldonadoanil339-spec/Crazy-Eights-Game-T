export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  rewardType: "coins" | "item" | "title" | "avatar";
  rewardValue: string | number;
  rewardLabel: string;
  icon: string;
  iconColor: string;
}

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  { tier: 1, xpRequired: 0,    rewardType: "title",  rewardValue: "title_novice",  rewardLabel: "Título: Novato",       icon: "person",        iconColor: "#95A5A6" },
  { tier: 2, xpRequired: 100,  rewardType: "coins",  rewardValue: 20,              rewardLabel: "20 Monedas",           icon: "cash",          iconColor: "#F1C40F" },
  { tier: 3, xpRequired: 250,  rewardType: "item",   rewardValue: "back_crimson",  rewardLabel: "Dorso: Carmesí",       icon: "card",          iconColor: "#C0392B" },
  { tier: 4, xpRequired: 450,  rewardType: "coins",  rewardValue: 35,              rewardLabel: "35 Monedas",           icon: "cash",          iconColor: "#F1C40F" },
  { tier: 5, xpRequired: 700,  rewardType: "avatar", rewardValue: "avatar_wizard", rewardLabel: "Avatar: Mago",         icon: "sparkles",      iconColor: "#9B59B6" },
  { tier: 6, xpRequired: 1000, rewardType: "coins",  rewardValue: 60,              rewardLabel: "60 Monedas",           icon: "cash",          iconColor: "#F1C40F" },
  { tier: 7, xpRequired: 1400, rewardType: "item",   rewardValue: "back_emerald",  rewardLabel: "Dorso: Esmeralda",     icon: "card",          iconColor: "#0E6655" },
  { tier: 8, xpRequired: 1900, rewardType: "title",  rewardValue: "title_pro",     rewardLabel: "Título: Profesional",  icon: "ribbon",        iconColor: "#2196F3" },
  { tier: 9, xpRequired: 2500, rewardType: "coins",  rewardValue: 100,             rewardLabel: "100 Monedas",          icon: "cash",          iconColor: "#F1C40F" },
  { tier: 10, xpRequired: 3200, rewardType: "avatar", rewardValue: "avatar_dragon","rewardLabel": "Avatar: Dragón",     icon: "flame",         iconColor: "#E67E22" },
];

export const XP_FOR_LEVEL = (level: number) => Math.floor(50 * Math.pow(level, 1.5));

export function getPlayerLevel(totalXp: number): number {
  let level = 1;
  while (XP_FOR_LEVEL(level + 1) <= totalXp) level++;
  return level;
}

export function getXpProgress(totalXp: number): { current: number; needed: number; level: number } {
  const level = getPlayerLevel(totalXp);
  const currentLevelXp = XP_FOR_LEVEL(level);
  const nextLevelXp = XP_FOR_LEVEL(level + 1);
  return {
    current: totalXp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    level,
  };
}

export function getCurrentBattlePassTier(totalXp: number): number {
  let tier = 0;
  for (const t of BATTLE_PASS_TIERS) {
    if (totalXp >= t.xpRequired) tier = t.tier;
  }
  return tier;
}
