import { STORE_ITEMS, localizeItem } from "./storeItems";

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  rewardType: "coins" | "item" | "title" | "avatar" | "frame" | "effect" | "chest";
  rewardValue: string | number;
  rewardLabel: string;
  icon: string;
  iconColor: string;
  isExclusive?: boolean;
  exclusiveLabel?: { es: string; en: string; pt: string };
}

// ─── SEASONAL EXCLUSIVES ────────────────────────────────────────────────────
// Themed pools of exclusive cosmetics that ONLY appear during a given season's
// battle pass. These IDs are intentionally NOT registered in `storeItems` so
// they cannot be purchased — they are battle-pass-only "limited edition"
// rewards that rotate with the season number.
export interface SeasonExclusive {
  rewardType: "item" | "avatar" | "frame" | "title";
  rewardValue: string;
  rewardLabel: string; // base ES label
  enLabel: string;
  ptLabel: string;
  icon: string;
  iconColor: string;
}

export interface SeasonTheme {
  themeName: string;
  exclusives: SeasonExclusive[]; // at least 2 per season, slotted at tiers 27 & 35
}

export const SEASON_THEMES: SeasonTheme[] = [
  {
    themeName: "Hierro y Fuego",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s1_phoenix_lord",  rewardLabel: "Avatar: Señor Fénix",        enLabel: "Avatar: Phoenix Lord",        ptLabel: "Avatar: Senhor Fênix",       icon: "flame",    iconColor: "#FF4500" },
      { rewardType: "frame",  rewardValue: "exclusive_s1_ember_frame",   rewardLabel: "Marco: Brasa Eterna",        enLabel: "Frame: Eternal Ember",        ptLabel: "Moldura: Brasa Eterna",      icon: "ellipse",  iconColor: "#FF6B00" },
      { rewardType: "title",  rewardValue: "exclusive_s1_iron_burned",   rewardLabel: "Título: Forjado en Fuego",   enLabel: "Title: Forged in Fire",       ptLabel: "Título: Forjado no Fogo",    icon: "ribbon",   iconColor: "#C0392B" },
    ],
  },
  {
    themeName: "Tormenta Eterna",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s2_storm_caller",  rewardLabel: "Avatar: Invocador de Tormentas", enLabel: "Avatar: Storm Caller",     ptLabel: "Avatar: Invocador de Tempestades", icon: "thunderstorm", iconColor: "#4A90E2" },
      { rewardType: "frame",  rewardValue: "exclusive_s2_lightning_frame", rewardLabel: "Marco: Relámpago",         enLabel: "Frame: Lightning",            ptLabel: "Moldura: Relâmpago",         icon: "flash",    iconColor: "#FFD700" },
      { rewardType: "title",  rewardValue: "exclusive_s2_thunderlord",   rewardLabel: "Título: Señor del Trueno",   enLabel: "Title: Thunder Lord",         ptLabel: "Título: Senhor do Trovão",   icon: "ribbon",   iconColor: "#4A90E2" },
    ],
  },
  {
    themeName: "Reino Sombrío",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s3_shadow_walker", rewardLabel: "Avatar: Caminante Sombrío",  enLabel: "Avatar: Shadow Walker",       ptLabel: "Avatar: Andarilho Sombrio",  icon: "moon",     iconColor: "#6A0DAD" },
      { rewardType: "item",   rewardValue: "exclusive_s3_void_back",     rewardLabel: "Dorso: Vacío Profundo",      enLabel: "Back: Deep Void",             ptLabel: "Dorso: Vazio Profundo",      icon: "card",     iconColor: "#1a0020" },
      { rewardType: "title",  rewardValue: "exclusive_s3_nightbringer",  rewardLabel: "Título: Portador de Noche",  enLabel: "Title: Nightbringer",         ptLabel: "Título: Portador da Noite",  icon: "ribbon",   iconColor: "#6A0DAD" },
    ],
  },
  {
    themeName: "Cielos Cósmicos",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s4_starborn",      rewardLabel: "Avatar: Nacido de Estrellas",enLabel: "Avatar: Starborn",            ptLabel: "Avatar: Nascido das Estrelas",icon: "sparkles", iconColor: "#A855F7" },
      { rewardType: "frame",  rewardValue: "exclusive_s4_nebula_frame",  rewardLabel: "Marco: Nebulosa",            enLabel: "Frame: Nebula",               ptLabel: "Moldura: Nebulosa",          icon: "ellipse",  iconColor: "#A855F7" },
      { rewardType: "item",   rewardValue: "exclusive_s4_constellation_back", rewardLabel: "Dorso: Constelación", enLabel: "Back: Constellation",         ptLabel: "Dorso: Constelação",         icon: "card",     iconColor: "#001a40" },
    ],
  },
  {
    themeName: "Bosque Encantado",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s5_druid",         rewardLabel: "Avatar: Druida Ancestral",   enLabel: "Avatar: Ancient Druid",       ptLabel: "Avatar: Druida Ancestral",   icon: "leaf",     iconColor: "#27AE60" },
      { rewardType: "frame",  rewardValue: "exclusive_s5_vine_frame",    rewardLabel: "Marco: Enredadera",          enLabel: "Frame: Vine",                 ptLabel: "Moldura: Trepadeira",        icon: "ellipse",  iconColor: "#27AE60" },
      { rewardType: "title",  rewardValue: "exclusive_s5_woodlands",     rewardLabel: "Título: Guardián del Bosque",enLabel: "Title: Forest Guardian",      ptLabel: "Título: Guardião da Floresta",icon: "ribbon",  iconColor: "#27AE60" },
    ],
  },
  {
    themeName: "Era de Hielo",
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s6_frost_giant",   rewardLabel: "Avatar: Gigante de Hielo",   enLabel: "Avatar: Frost Giant",         ptLabel: "Avatar: Gigante de Gelo",    icon: "snow",     iconColor: "#7FDBFF" },
      { rewardType: "item",   rewardValue: "exclusive_s6_glacier_back",  rewardLabel: "Dorso: Glaciar Eterno",      enLabel: "Back: Eternal Glacier",       ptLabel: "Dorso: Geleira Eterna",      icon: "card",     iconColor: "#B8DDEF" },
      { rewardType: "title",  rewardValue: "exclusive_s6_iceborn",       rewardLabel: "Título: Hijo del Hielo",     enLabel: "Title: Iceborn",              ptLabel: "Título: Filho do Gelo",      icon: "ribbon",   iconColor: "#7FDBFF" },
    ],
  },
];

export function getSeasonTheme(seasonNumber: number): SeasonTheme {
  const idx = ((seasonNumber - 1) % SEASON_THEMES.length + SEASON_THEMES.length) % SEASON_THEMES.length;
  return SEASON_THEMES[idx];
}

// ─── EXCLUSIVE LOOKUP HELPERS ───────────────────────────────────────────────
// Battle-pass-only IDs (prefix `exclusive_s`) are NOT in `STORE_ITEMS`, so the
// inventory and avatar/frame/title/back pickers need to resolve them via
// SEASON_THEMES to display name, icon and a "Limited Edition · Season X" badge.
export type ExclusiveCategory = "card_back" | "avatar" | "frame" | "title";

export interface ResolvedExclusive {
  id: string;
  category: ExclusiveCategory;
  name: string;          // localized, prefix-stripped (e.g. "Phoenix Lord")
  fullLabel: string;     // localized, with prefix ("Avatar: Phoenix Lord")
  icon: string;
  iconColor: string;
  seasonNumber: number;
  themeName: string;
  isExclusive: true;
}

const EXCLUSIVE_CATEGORY_MAP: Record<SeasonExclusive["rewardType"], ExclusiveCategory> = {
  item:   "card_back",
  avatar: "avatar",
  frame:  "frame",
  title:  "title",
};

export function findExclusiveById(id: string, lang: "es" | "en" | "pt" = "es"): ResolvedExclusive | null {
  if (!id || !id.startsWith("exclusive_s")) return null;
  for (let i = 0; i < SEASON_THEMES.length; i++) {
    const theme = SEASON_THEMES[i];
    const ex = theme.exclusives.find(e => e.rewardValue === id);
    if (!ex) continue;
    const fullLabel = lang === "en" ? ex.enLabel : lang === "pt" ? ex.ptLabel : ex.rewardLabel;
    const name = fullLabel.includes(": ")
      ? fullLabel.split(": ").slice(1).join(": ")
      : fullLabel;
    return {
      id,
      category: EXCLUSIVE_CATEGORY_MAP[ex.rewardType],
      name,
      fullLabel,
      icon: ex.icon,
      iconColor: ex.iconColor,
      seasonNumber: i + 1,
      themeName: theme.themeName,
      isExclusive: true,
    };
  }
  return null;
}

export function getOwnedExclusives(
  ownedIds: string[] | undefined,
  category: ExclusiveCategory,
  lang: "es" | "en" | "pt" = "es",
): ResolvedExclusive[] {
  if (!ownedIds || ownedIds.length === 0) return [];
  const out: ResolvedExclusive[] = [];
  for (const id of ownedIds) {
    const ex = findExclusiveById(id, lang);
    if (ex && ex.category === category) out.push(ex);
  }
  return out;
}

// Tier slots in the epic block (21-40) where exclusives are injected.
const EXCLUSIVE_SLOTS = [27, 35];

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  // ─── Tiers 1-20: Common & Rare rewards ──────────────────────────────────────
  { tier:  1, xpRequired: 8     ,      rewardType: "title",   rewardValue: "title_novice",       rewardLabel: "Título: Novato",              icon: "person",           iconColor: "#95A5A6" },
  { tier:  2, xpRequired: 32    ,    rewardType: "coins",   rewardValue: 25,                   rewardLabel: "25 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  3, xpRequired: 72    ,    rewardType: "item",    rewardValue: "back_crimson",        rewardLabel: "Dorso: Carmesí",              icon: "card",             iconColor: "#C0392B" },
  { tier:  4, xpRequired: 128   ,    rewardType: "coins",   rewardValue: 40,                   rewardLabel: "40 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  5, xpRequired: 200   ,    rewardType: "avatar",  rewardValue: "avatar_wizard",       rewardLabel: "Avatar: Mago",                icon: "sparkles",         iconColor: "#9B59B6" },
  { tier:  6, xpRequired: 288   ,   rewardType: "title",   rewardValue: "title_rookie",        rewardLabel: "Título: Recién Llegado",      icon: "walk",             iconColor: "#95A5A6" },
  { tier:  7, xpRequired: 392   ,   rewardType: "coins",   rewardValue: 60,                   rewardLabel: "60 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  8, xpRequired: 512   ,   rewardType: "item",    rewardValue: "back_emerald",        rewardLabel: "Dorso: Esmeralda",            icon: "card",             iconColor: "#0E6655" },
  { tier:  9, xpRequired: 648   ,   rewardType: "title",   rewardValue: "title_pro",           rewardLabel: "Título: Profesional",         icon: "ribbon",           iconColor: "#2196F3" },
  { tier: 10, xpRequired: 800   ,   rewardType: "chest",   rewardValue: "common",             rewardLabel: "Cofre Común",                 icon: "cube",             iconColor: "#95A5A6" },
  { tier: 11, xpRequired: 968   ,   rewardType: "avatar",  rewardValue: "avatar_samurai",      rewardLabel: "Avatar: Samurái",             icon: "cut",              iconColor: "#E74C3C" },
  { tier: 12, xpRequired: 1152  ,   rewardType: "item",    rewardValue: "back_gold",           rewardLabel: "Dorso: Oro Real",             icon: "card",             iconColor: "#D4AF37" },
  { tier: 13, xpRequired: 1352  ,   rewardType: "coins",   rewardValue: 150,                  rewardLabel: "150 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 14, xpRequired: 1568  ,   rewardType: "title",   rewardValue: "title_strategist",    rewardLabel: "Título: Estratega",           icon: "git-network",      iconColor: "#1A8FC1" },
  { tier: 15, xpRequired: 1800  ,   rewardType: "avatar",  rewardValue: "avatar_ninja",        rewardLabel: "Avatar: Ninja",               icon: "eye-off",          iconColor: "#2C3E50" },
  { tier: 16, xpRequired: 2048  ,   rewardType: "item",    rewardValue: "back_midnight",       rewardLabel: "Dorso: Medianoche",           icon: "card",             iconColor: "#C0C0C0" },
  { tier: 17, xpRequired: 2312  ,  rewardType: "coins",   rewardValue: 200,                  rewardLabel: "200 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 18, xpRequired: 2592  ,  rewardType: "avatar",  rewardValue: "avatar_dragon",       rewardLabel: "Avatar: Dragón",              icon: "flame",            iconColor: "#E67E22" },
  { tier: 19, xpRequired: 2888  ,  rewardType: "title",   rewardValue: "title_grandmaster",   rewardLabel: "Título: Gran Maestro",        icon: "medal",            iconColor: "#D4AF37" },
  { tier: 20, xpRequired: 3200  ,  rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  // ─── Tiers 21-40: Epic rewards ──────────────────────────────────────────────
  { tier: 21, xpRequired: 3528  ,  rewardType: "coins",   rewardValue: 300,                  rewardLabel: "300 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 22, xpRequired: 3872  ,  rewardType: "avatar",  rewardValue: "avatar_pirate",       rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 23, xpRequired: 4232  ,  rewardType: "item",    rewardValue: "back_ruby",           rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 24, xpRequired: 4608  ,  rewardType: "title",   rewardValue: "title_phantom",       rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 25, xpRequired: 5000  ,  rewardType: "coins",   rewardValue: 500,                  rewardLabel: "500 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 26, xpRequired: 5408  ,  rewardType: "item",    rewardValue: "back_obsidian",       rewardLabel: "Dorso: Obsidiana",            icon: "card",             iconColor: "#2D2D2D" },
  { tier: 27, xpRequired: 5832  ,  rewardType: "avatar",  rewardValue: "avatar_gladiator",    rewardLabel: "Avatar: Gladiador",           icon: "trophy",           iconColor: "#C0392B" },
  { tier: 28, xpRequired: 6272  ,  rewardType: "title",   rewardValue: "title_ace",           rewardLabel: "Título: El As",               icon: "star",             iconColor: "#E74C3C" },
  { tier: 29, xpRequired: 6728  ,  rewardType: "item",    rewardValue: "back_arctic",         rewardLabel: "Dorso: Ártico",               icon: "card",             iconColor: "#B8DDEF" },
  { tier: 30, xpRequired: 7200  ,  rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 31, xpRequired: 7688  ,  rewardType: "avatar",  rewardValue: "avatar_cyber",        rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 32, xpRequired: 8192  ,  rewardType: "item",    rewardValue: "back_galaxy",         rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 33, xpRequired: 8712  , rewardType: "title",   rewardValue: "title_legend",        rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 34, xpRequired: 9248  , rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "¡1500 Monedas!",              icon: "cash",             iconColor: "#FFD700" },
  { tier: 35, xpRequired: 9800  , rewardType: "avatar",  rewardValue: "avatar_phoenix",      rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 36, xpRequired: 10368 , rewardType: "item",    rewardValue: "back_inferno",        rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 37, xpRequired: 10952 , rewardType: "avatar",  rewardValue: "avatar_reaper",       rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 38, xpRequired: 11552 , rewardType: "title",   rewardValue: "title_immortal",      rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 39, xpRequired: 12168 , rewardType: "avatar",  rewardValue: "avatar_king",         rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 40, xpRequired: 12800 , rewardType: "title",   rewardValue: "title_god",           rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  // ─── Tiers 41-60: New epic & legendary rewards ──────────────────────────────
  { tier: 41, xpRequired: 13448 , rewardType: "item",    rewardValue: "back_neon",           rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 42, xpRequired: 14112 , rewardType: "coins",   rewardValue: 800,                  rewardLabel: "800 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 43, xpRequired: 14792 , rewardType: "avatar",  rewardValue: "avatar_titan",        rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 44, xpRequired: 15488 , rewardType: "frame",   rewardValue: "frame_neon",          rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 45, xpRequired: 16200 , rewardType: "item",    rewardValue: "back_aurora",         rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 46, xpRequired: 16928 , rewardType: "title",   rewardValue: "title_invincible",    rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 47, xpRequired: 17672 , rewardType: "coins",   rewardValue: 1200,                 rewardLabel: "1200 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 48, xpRequired: 18432 , rewardType: "avatar",  rewardValue: "avatar_oracle",       rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 49, xpRequired: 19208 , rewardType: "item",    rewardValue: "back_blood",          rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 50, xpRequired: 20000 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  // ─── Tiers 51-90: extended end-game progression ─────────────────────────────
  { tier: 51, xpRequired: 20808 , rewardType: "coins",   rewardValue: 350,                  rewardLabel: "350 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 52, xpRequired: 21632 , rewardType: "avatar",  rewardValue: "avatar_pirate",      rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 53, xpRequired: 22472 , rewardType: "item",    rewardValue: "back_ruby",          rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 54, xpRequired: 23328 , rewardType: "title",   rewardValue: "title_phantom",      rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 55, xpRequired: 24200 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 56, xpRequired: 25088 , rewardType: "coins",   rewardValue: 400,                  rewardLabel: "400 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 57, xpRequired: 25992 , rewardType: "avatar",  rewardValue: "avatar_cyber",       rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 58, xpRequired: 26912 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 59, xpRequired: 27848 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 60, xpRequired: 28800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 61, xpRequired: 29768 , rewardType: "coins",   rewardValue: 500,                  rewardLabel: "500 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 62, xpRequired: 30752 , rewardType: "title",   rewardValue: "title_legend",       rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 63, xpRequired: 31752 , rewardType: "item",    rewardValue: "back_aurora",        rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 64, xpRequired: 32768 , rewardType: "avatar",  rewardValue: "avatar_titan",       rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 65, xpRequired: 33800 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 66, xpRequired: 34848 , rewardType: "coins",   rewardValue: 600,                  rewardLabel: "600 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 67, xpRequired: 35912 , rewardType: "avatar",  rewardValue: "avatar_oracle",      rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 68, xpRequired: 36992 , rewardType: "item",    rewardValue: "back_blood",         rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 69, xpRequired: 38088 , rewardType: "title",   rewardValue: "title_invincible",   rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 70, xpRequired: 39200 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 71, xpRequired: 40328 , rewardType: "coins",   rewardValue: 700,                  rewardLabel: "700 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 72, xpRequired: 41472 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 73, xpRequired: 42632 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 74, xpRequired: 43808 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 75, xpRequired: 45000 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 76, xpRequired: 46208 , rewardType: "coins",   rewardValue: 900,                  rewardLabel: "900 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 77, xpRequired: 47432 , rewardType: "title",   rewardValue: "title_immortal",     rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 78, xpRequired: 48672 , rewardType: "avatar",  rewardValue: "avatar_reaper",      rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 79, xpRequired: 49928 , rewardType: "item",    rewardValue: "back_neon",          rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 80, xpRequired: 51200 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  { tier: 81, xpRequired: 52488 , rewardType: "coins",   rewardValue: 1000,                 rewardLabel: "1000 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 82, xpRequired: 53792 , rewardType: "avatar",  rewardValue: "avatar_king",        rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 83, xpRequired: 55112 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  { tier: 84, xpRequired: 56448 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 85, xpRequired: 57800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 86, xpRequired: 59168 , rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "1500 Monedas",                icon: "cash",             iconColor: "#FFD700" },
  { tier: 87, xpRequired: 60552 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix Real",          icon: "sunny",            iconColor: "#FFD700" },
  { tier: 88, xpRequired: 61952 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno Final",       icon: "flame",            iconColor: "#FF3300" },
  { tier: 89, xpRequired: 63368 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: Maestro Supremo",     icon: "sparkles",         iconColor: "#FFD700" },
  { tier: 90, xpRequired: 64800 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "¡Cofre Legendario Final!",    icon: "star",             iconColor: "#FFD700" },
];

export function getBPRewardLabel(tier: BattlePassTier, lang: "es" | "en" | "pt"): string {
  if (tier.isExclusive && tier.exclusiveLabel) {
    return tier.exclusiveLabel[lang] ?? tier.exclusiveLabel.es;
  }
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

// ─── SEASONAL ROTATION ──────────────────────────────────────────────────────
// Rotate the cosmetic rewards (item/avatar/frame/title) each season so the
// premium track feels fresh while the XP curve and chest milestones stay
// stable. Coin and chest tiers are NEVER rotated.
function rotatedTier(tier: BattlePassTier, seasonNumber: number): BattlePassTier {
  if (
    tier.rewardType !== "item" &&
    tier.rewardType !== "avatar" &&
    tier.rewardType !== "frame" &&
    tier.rewardType !== "title"
  ) {
    return tier;
  }
  const pool = BATTLE_PASS_TIERS.filter((t) => t.rewardType === tier.rewardType);
  if (pool.length <= 1) return tier;
  const idxInPool = pool.findIndex((t) => t.tier === tier.tier);
  if (idxInPool < 0) return tier;
  const offset = ((seasonNumber - 1) % pool.length + pool.length) % pool.length;
  const replacement = pool[(idxInPool + offset) % pool.length];
  if (replacement.tier === tier.tier) return tier;
  return {
    ...tier,
    rewardValue: replacement.rewardValue,
    rewardLabel: replacement.rewardLabel,
    icon: replacement.icon,
    iconColor: replacement.iconColor,
  };
}

export function getBattlePassTiers(seasonNumber: number): BattlePassTier[] {
  const theme = getSeasonTheme(seasonNumber);
  const rotated = seasonNumber > 1
    ? BATTLE_PASS_TIERS.map((t) => rotatedTier(t, seasonNumber))
    : BATTLE_PASS_TIERS.slice();

  return rotated.map((t) => {
    const slotIdx = EXCLUSIVE_SLOTS.indexOf(t.tier);
    if (slotIdx < 0) return t;
    const exclusive = theme.exclusives[slotIdx % theme.exclusives.length];
    if (!exclusive) return t;
    return {
      ...t,
      rewardType: exclusive.rewardType,
      rewardValue: exclusive.rewardValue,
      rewardLabel: exclusive.rewardLabel,
      icon: exclusive.icon,
      iconColor: exclusive.iconColor,
      isExclusive: true,
      exclusiveLabel: { es: exclusive.rewardLabel, en: exclusive.enLabel, pt: exclusive.ptLabel },
    };
  });
}

export function getSeasonExclusiveIds(seasonNumber: number): string[] {
  return getBattlePassTiers(seasonNumber)
    .filter((t) => t.isExclusive)
    .map((t) => String(t.rewardValue));
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
