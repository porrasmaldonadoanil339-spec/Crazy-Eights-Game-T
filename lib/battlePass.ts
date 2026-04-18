import { STORE_ITEMS, localizeItem } from "./storeItems";

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  rewardType: "coins" | "item" | "title" | "avatar" | "frame" | "effect" | "chest";
  rewardValue: string | number;
  rewardLabel: string;
  icon: string;
  iconColor: string;
}

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  // ─── Tiers 1-20: Common & Rare rewards ──────────────────────────────────────
  { tier: 1,  xpRequired: 0,      rewardType: "title",   rewardValue: "title_novice",       rewardLabel: "Título: Novato",              icon: "person",           iconColor: "#95A5A6" },
  { tier: 2,  xpRequired: 100,    rewardType: "coins",   rewardValue: 25,                   rewardLabel: "25 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier: 3,  xpRequired: 250,    rewardType: "item",    rewardValue: "back_crimson",        rewardLabel: "Dorso: Carmesí",              icon: "card",             iconColor: "#C0392B" },
  { tier: 4,  xpRequired: 450,    rewardType: "coins",   rewardValue: 40,                   rewardLabel: "40 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier: 5,  xpRequired: 700,    rewardType: "avatar",  rewardValue: "avatar_wizard",       rewardLabel: "Avatar: Mago",                icon: "sparkles",         iconColor: "#9B59B6" },
  { tier: 6,  xpRequired: 1000,   rewardType: "title",   rewardValue: "title_rookie",        rewardLabel: "Título: Recién Llegado",      icon: "walk",             iconColor: "#95A5A6" },
  { tier: 7,  xpRequired: 1350,   rewardType: "coins",   rewardValue: 60,                   rewardLabel: "60 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier: 8,  xpRequired: 1750,   rewardType: "item",    rewardValue: "back_emerald",        rewardLabel: "Dorso: Esmeralda",            icon: "card",             iconColor: "#0E6655" },
  { tier: 9,  xpRequired: 2200,   rewardType: "title",   rewardValue: "title_pro",           rewardLabel: "Título: Profesional",         icon: "ribbon",           iconColor: "#2196F3" },
  { tier: 10, xpRequired: 2750,   rewardType: "chest",   rewardValue: "common",             rewardLabel: "Cofre Común",                 icon: "cube",             iconColor: "#95A5A6" },
  { tier: 11, xpRequired: 3400,   rewardType: "avatar",  rewardValue: "avatar_samurai",      rewardLabel: "Avatar: Samurái",             icon: "cut",              iconColor: "#E74C3C" },
  { tier: 12, xpRequired: 4200,   rewardType: "item",    rewardValue: "back_gold",           rewardLabel: "Dorso: Oro Real",             icon: "card",             iconColor: "#D4AF37" },
  { tier: 13, xpRequired: 5100,   rewardType: "coins",   rewardValue: 150,                  rewardLabel: "150 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 14, xpRequired: 6100,   rewardType: "title",   rewardValue: "title_strategist",    rewardLabel: "Título: Estratega",           icon: "git-network",      iconColor: "#1A8FC1" },
  { tier: 15, xpRequired: 7300,   rewardType: "avatar",  rewardValue: "avatar_ninja",        rewardLabel: "Avatar: Ninja",               icon: "eye-off",          iconColor: "#2C3E50" },
  { tier: 16, xpRequired: 8600,   rewardType: "item",    rewardValue: "back_midnight",       rewardLabel: "Dorso: Medianoche",           icon: "card",             iconColor: "#C0C0C0" },
  { tier: 17, xpRequired: 10100,  rewardType: "coins",   rewardValue: 200,                  rewardLabel: "200 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 18, xpRequired: 12000,  rewardType: "avatar",  rewardValue: "avatar_dragon",       rewardLabel: "Avatar: Dragón",              icon: "flame",            iconColor: "#E67E22" },
  { tier: 19, xpRequired: 14200,  rewardType: "title",   rewardValue: "title_grandmaster",   rewardLabel: "Título: Gran Maestro",        icon: "medal",            iconColor: "#D4AF37" },
  { tier: 20, xpRequired: 16800,  rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  // ─── Tiers 21-40: Epic rewards ──────────────────────────────────────────────
  { tier: 21, xpRequired: 19800,  rewardType: "coins",   rewardValue: 300,                  rewardLabel: "300 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 22, xpRequired: 23200,  rewardType: "avatar",  rewardValue: "avatar_pirate",       rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 23, xpRequired: 27100,  rewardType: "item",    rewardValue: "back_ruby",           rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 24, xpRequired: 31500,  rewardType: "title",   rewardValue: "title_phantom",       rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 25, xpRequired: 36500,  rewardType: "coins",   rewardValue: 500,                  rewardLabel: "500 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 26, xpRequired: 42000,  rewardType: "item",    rewardValue: "back_obsidian",       rewardLabel: "Dorso: Obsidiana",            icon: "card",             iconColor: "#2D2D2D" },
  { tier: 27, xpRequired: 48200,  rewardType: "avatar",  rewardValue: "avatar_gladiator",    rewardLabel: "Avatar: Gladiador",           icon: "trophy",           iconColor: "#C0392B" },
  { tier: 28, xpRequired: 55200,  rewardType: "title",   rewardValue: "title_ace",           rewardLabel: "Título: El As",               icon: "star",             iconColor: "#E74C3C" },
  { tier: 29, xpRequired: 63000,  rewardType: "item",    rewardValue: "back_arctic",         rewardLabel: "Dorso: Ártico",               icon: "card",             iconColor: "#B8DDEF" },
  { tier: 30, xpRequired: 72000,  rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 31, xpRequired: 82000,  rewardType: "avatar",  rewardValue: "avatar_cyber",        rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 32, xpRequired: 93000,  rewardType: "item",    rewardValue: "back_galaxy",         rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 33, xpRequired: 105000, rewardType: "title",   rewardValue: "title_legend",        rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 34, xpRequired: 118000, rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "¡1500 Monedas!",              icon: "cash",             iconColor: "#FFD700" },
  { tier: 35, xpRequired: 132000, rewardType: "avatar",  rewardValue: "avatar_phoenix",      rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 36, xpRequired: 147000, rewardType: "item",    rewardValue: "back_inferno",        rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 37, xpRequired: 163000, rewardType: "avatar",  rewardValue: "avatar_reaper",       rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 38, xpRequired: 180000, rewardType: "title",   rewardValue: "title_immortal",      rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 39, xpRequired: 200000, rewardType: "avatar",  rewardValue: "avatar_king",         rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 40, xpRequired: 225000, rewardType: "title",   rewardValue: "title_god",           rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  // ─── Tiers 41-60: New epic & legendary rewards ──────────────────────────────
  { tier: 41, xpRequired: 252000, rewardType: "item",    rewardValue: "back_neon",           rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 42, xpRequired: 281000, rewardType: "coins",   rewardValue: 800,                  rewardLabel: "800 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 43, xpRequired: 312000, rewardType: "avatar",  rewardValue: "avatar_titan",        rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 44, xpRequired: 345000, rewardType: "frame",   rewardValue: "frame_neon",          rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 45, xpRequired: 380000, rewardType: "item",    rewardValue: "back_aurora",         rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 46, xpRequired: 420000, rewardType: "title",   rewardValue: "title_invincible",    rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 47, xpRequired: 462000, rewardType: "coins",   rewardValue: 1200,                 rewardLabel: "1200 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 48, xpRequired: 507000, rewardType: "avatar",  rewardValue: "avatar_oracle",       rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 49, xpRequired: 555000, rewardType: "item",    rewardValue: "back_blood",          rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 50, xpRequired: 606000, rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
];

export function getBPRewardLabel(tier: BattlePassTier, lang: "es" | "en" | "pt"): string {
  if (lang === "es") return tier.rewardLabel;

  if (tier.rewardType === "coins") {
    const n = typeof tier.rewardValue === "number" ? tier.rewardValue.toLocaleString() : tier.rewardValue;
    const coinWord = lang === "pt" ? "Moedas" : "Coins";
    const isSpecial = tier.rewardLabel.startsWith("¡");
    return isSpecial ? `${n} ${coinWord}!` : `${n} ${coinWord}`;
  }

  if (tier.rewardType === "chest") {
    const chestNames: Record<string, { en: string; pt: string }> = {
      common:    { en: "Common Chest",    pt: "Cofre Comum"    },
      rare:      { en: "Rare Chest",      pt: "Cofre Raro"     },
      epic:      { en: "Epic Chest",      pt: "Cofre Épico"    },
      legendary: { en: "Legendary Chest", pt: "Cofre Lendário" },
    };
    const v = String(tier.rewardValue);
    return chestNames[v]?.[lang] ?? tier.rewardLabel;
  }

  const prefixMap: Record<string, { en: string; pt: string }> = {
    title:  { en: "Title",  pt: "Título"  },
    item:   { en: "Back",   pt: "Dorso"   },
    avatar: { en: "Avatar", pt: "Avatar"  },
    frame:  { en: "Frame",  pt: "Moldura" },
    effect: { en: "Effect", pt: "Efeito"  },
  };

  const prefix = prefixMap[tier.rewardType];
  if (!prefix) return tier.rewardLabel;

  const parts = tier.rewardLabel.split(": ");
  let namePart = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];

  // If the reward value is an item ID, we can try to localize its name
  const itemId = String(tier.rewardValue);
  const foundItem = STORE_ITEMS.find(i => i.id === itemId);
  if (foundItem) {
    const localizedItem = localizeItem(foundItem, lang);
    namePart = localizedItem.name;
  }

  return `${prefix[lang]}: ${namePart}`;
}

export const XP_FOR_LEVEL = (level: number) => Math.floor(60 * Math.pow(level, 1.5));

export function getPlayerLevel(totalXp: number): number {
  let level = 1;
  while (XP_FOR_LEVEL(level + 1) <= totalXp) level++;
  return Math.min(level, 99);
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

// ─── FREE TRACK ─────────────────────────────────────────────────────────────
// Per spec: free pass should NOT be only coins — must include backs, items,
// emotes and chests (which contain that variety) at meaningful intervals.
export interface FreeReward {
  type: "coins" | "chest";
  coins: number;          // bonus coins (always granted alongside type)
  chestType?: "common" | "rare" | "epic" | "legendary";
  label: string;          // localized in render layer (kept simple here)
  icon: string;
  iconColor: string;
}

export function getFreeReward(tier: number): FreeReward {
  const baseCoins = 25 + tier * 5;
  // Milestone chests (checked in priority order, biggest first)
  if (tier > 0 && tier % 50 === 0) {
    return { type: "chest", chestType: "legendary", coins: baseCoins, label: `Cofre Legendario + ${baseCoins}`, icon: "diamond", iconColor: "#F1C40F" };
  }
  if (tier > 0 && tier % 25 === 0) {
    return { type: "chest", chestType: "epic", coins: baseCoins, label: `Cofre Épico + ${baseCoins}`, icon: "cube", iconColor: "#9B59B6" };
  }
  if (tier > 0 && tier % 10 === 0) {
    return { type: "chest", chestType: "rare", coins: baseCoins, label: `Cofre Raro + ${baseCoins}`, icon: "cube", iconColor: "#3498DB" };
  }
  if (tier > 0 && tier % 5 === 0) {
    return { type: "chest", chestType: "common", coins: baseCoins, label: `Cofre Común + ${baseCoins}`, icon: "cube", iconColor: "#95A5A6" };
  }
  return { type: "coins", coins: baseCoins, label: `${baseCoins} Monedas`, icon: "cash", iconColor: "#F1C40F" };
}
