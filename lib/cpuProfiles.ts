export interface CpuProfile {
  name: string;
  avatarId: string;
  titleId: string;
  level: number;
  avatarColor: string;
  avatarIcon: string;
}

export const CPU_PROFILES: CpuProfile[] = [
  { name: "CarlosM",    avatarId: "avatar_samurai",   titleId: "title_pro",          level: 14, avatarColor: "#E74C3C", avatarIcon: "cut" },
  { name: "Ana_Flores", avatarId: "avatar_wizard",    titleId: "title_strategist",   level: 21, avatarColor: "#9B59B6", avatarIcon: "sparkles" },
  { name: "xX_Dark",   avatarId: "avatar_ninja",      titleId: "title_phantom",      level: 33, avatarColor: "#1a1a2e", avatarIcon: "eye-off" },
  { name: "Dragón99",   avatarId: "avatar_dragon",    titleId: "title_ace",          level: 27, avatarColor: "#E67E22", avatarIcon: "flame" },
  { name: "LaPiratas",  avatarId: "avatar_pirate",    titleId: "title_hustler",      level: 9,  avatarColor: "#2C3E50", avatarIcon: "skull" },
  { name: "MaestroK",   avatarId: "avatar_knight",    titleId: "title_grandmaster",  level: 42, avatarColor: "#95A5A6", avatarIcon: "shield" },
  { name: "SofiaCG",   avatarId: "avatar_scholar",    titleId: "title_regular",      level: 5,  avatarColor: "#4A90D9", avatarIcon: "book" },
  { name: "El_Fénix",   avatarId: "avatar_phoenix",   titleId: "title_legend",       level: 56, avatarColor: "#D4AF37", avatarIcon: "sunny" },
  { name: "Gladiator_X",avatarId: "avatar_gladiator", titleId: "title_shark",        level: 18, avatarColor: "#C0392B", avatarIcon: "trophy" },
  { name: "CyberAce",   avatarId: "avatar_cyber",     titleId: "title_immortal",     level: 67, avatarColor: "#00D4FF", avatarIcon: "hardware-chip" },
  { name: "MiguelRdz",  avatarId: "avatar_merchant",  titleId: "title_rookie",       level: 3,  avatarColor: "#8B7355", avatarIcon: "bag" },
  { name: "ElSegador",  avatarId: "avatar_reaper",    titleId: "title_god",          level: 88, avatarColor: "#1a0020", avatarIcon: "moon" },
];

export function getRandomCpuProfile(seed?: number): CpuProfile {
  const idx = seed !== undefined
    ? Math.abs(seed) % CPU_PROFILES.length
    : Math.floor(Math.random() * CPU_PROFILES.length);
  return CPU_PROFILES[idx];
}
