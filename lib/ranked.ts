export const RANKS = ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Diamante", "Épico", "Mítico", "Maestro", "Gran Maestro", "Legendario", "Divino"];

// Rank index → i18n key (must match lib/i18n.ts)
export const RANK_I18N_KEYS = [
  "rankHierro", "rankBronce", "rankPlata", "rankOro", "rankPlatino",
  "rankDiamante", "rankÉpico", "rankMítico", "rankMaestro",
  "rankGran Maestro", "rankLegendario", "rankDivino",
] as const;
export const DIVISIONS = ["5", "4", "3", "2", "1"];

export interface RankedProfile {
  rank: number; // 0 to 11
  division: number; // 0 to 4
  stars: number;
  maxStars: number;
  totalWins: number;
  totalLosses: number;
  rankedProfileVersion?: number;
}

export const RANK_COLORS: Record<number, string> = {
  0: "#8B7355", // Hierro
  1: "#CD7F32", // Bronce
  2: "#C0C0C0", // Plata
  3: "#FFD700", // Oro
  4: "#00BFFF", // Platino
  5: "#00FFFF", // Diamante
  6: "#9B59B6", // Épico
  7: "#E74C3C", // Mítico
  8: "#FF6B35", // Maestro
  9: "#FF1744", // Gran Maestro
  10: "#FF9800", // Legendario
  11: "#D4AF37", // Divino
};

export function getRankInfo(rp: RankedProfile) {
  const rankName = RANKS[rp.rank] || "Hierro";
  const divisionName = DIVISIONS[rp.division] || "V";
  const color = RANK_COLORS[rp.rank] || "#8B7355";
  
  return {
    rankName,
    divisionName,
    displayName: `${rankName} ${divisionName}`,
    color,
    icon: RANK_ICONS[rp.rank] || "trophy",
    rank: rp.rank,
  };
}

// Rank icons per tier
export const RANK_ICONS = [
  "shield",          // Hierro 0
  "shield-half",     // Bronce 1
  "shield-checkmark",// Plata 2
  "star",            // Oro 3
  "diamond",         // Platino 4
  "sparkles",        // Diamante 5
  "flash",           // Épico 6
  "skull",           // Mítico 7
  "trophy",          // Maestro 8
  "trophy",          // Gran Maestro 9
  "medal",           // Legendario 10
  "planet",          // Divino 11
];

// Rank name translations for all 22 languages
const RANK_NAMES_LOCALIZED: Record<number, Record<string, string>> = {
  0:  { es:"Hierro",       en:"Iron",         pt:"Ferro",       fr:"Fer",          de:"Eisen",       it:"Ferro",        tr:"Demir",       ru:"Железо",     pl:"Żelazo",    nl:"IJzer",      sv:"Järn",       da:"Jern",      fi:"Rauta",     no:"Jern",       zh:"铁",     ja:"アイアン",     ko:"아이언",     hi:"आयरन",     th:"เหล็ก",    vi:"Sắt",         id:"Besi",      ar:"حديد"    },
  1:  { es:"Bronce",       en:"Bronze",       pt:"Bronze",      fr:"Bronze",       de:"Bronze",      it:"Bronzo",       tr:"Bronz",       ru:"Бронза",     pl:"Brąz",      nl:"Brons",      sv:"Brons",      da:"Bronze",    fi:"Pronssi",   no:"Bronse",     zh:"铜",     ja:"ブロンズ",     ko:"브론즈",     hi:"कांस्य",   th:"บรอนซ์",  vi:"Đồng",        id:"Perunggu",  ar:"برونز"   },
  2:  { es:"Plata",        en:"Silver",       pt:"Prata",       fr:"Argent",       de:"Silber",      it:"Argento",      tr:"Gümüş",       ru:"Серебро",    pl:"Srebro",    nl:"Zilver",     sv:"Silver",     da:"Sølv",      fi:"Hopea",     no:"Sølv",       zh:"银",     ja:"シルバー",     ko:"실버",       hi:"रजत",      th:"เงิน",     vi:"Bạc",         id:"Perak",     ar:"فضة"     },
  3:  { es:"Oro",          en:"Gold",         pt:"Ouro",        fr:"Or",           de:"Gold",        it:"Oro",          tr:"Altın",       ru:"Золото",     pl:"Złoto",     nl:"Goud",       sv:"Guld",       da:"Guld",      fi:"Kulta",     no:"Gull",       zh:"金",     ja:"ゴールド",     ko:"골드",       hi:"स्वर्ण",   th:"ทอง",     vi:"Vàng",        id:"Emas",      ar:"ذهب"     },
  4:  { es:"Platino",      en:"Platinum",     pt:"Platina",     fr:"Platine",      de:"Platin",      it:"Platino",      tr:"Platin",      ru:"Платина",    pl:"Platyna",   nl:"Platina",    sv:"Platina",    da:"Platin",    fi:"Platina",   no:"Platina",    zh:"铂金",   ja:"プラチナ",     ko:"플래티넘",   hi:"प्लेटिनम", th:"แพลตินัม",vi:"Bạch kim",    id:"Platinum",  ar:"بلاتين"  },
  5:  { es:"Diamante",     en:"Diamond",      pt:"Diamante",    fr:"Diamant",      de:"Diamant",     it:"Diamante",     tr:"Elmas",       ru:"Алмаз",      pl:"Diament",   nl:"Diamant",    sv:"Diamant",    da:"Diamant",   fi:"Timantti",  no:"Diamant",    zh:"钻石",   ja:"ダイヤモンド", ko:"다이아몬드", hi:"हीरा",     th:"ไดมอนด์", vi:"Kim cương",   id:"Berlian",   ar:"ماس"     },
  6:  { es:"Épico",        en:"Epic",         pt:"Épico",       fr:"Épique",       de:"Episch",      it:"Epico",        tr:"Epik",        ru:"Эпик",       pl:"Epicki",    nl:"Episch",     sv:"Episk",      da:"Episk",     fi:"Eeppinen",  no:"Episk",      zh:"史诗",   ja:"エピック",     ko:"에픽",       hi:"महाकाव्य", th:"เอปิก",   vi:"Sử thi",      id:"Epik",      ar:"ملحمي"   },
  7:  { es:"Mítico",       en:"Mythic",       pt:"Mítico",      fr:"Mythique",     de:"Mythisch",    it:"Mitico",       tr:"Efsanevi",    ru:"Мифик",      pl:"Mityczny",  nl:"Mythisch",   sv:"Mytisk",     da:"Mytisk",    fi:"Myyttinen", no:"Mytisk",     zh:"神话",   ja:"ミシック",     ko:"미식",       hi:"पौराणिक",  th:"ไมธิก",   vi:"Thần thoại",  id:"Mitos",     ar:"أسطوري"  },
  8:  { es:"Maestro",      en:"Master",       pt:"Mestre",      fr:"Maître",       de:"Meister",     it:"Maestro",      tr:"Usta",        ru:"Мастер",     pl:"Mistrz",    nl:"Meester",    sv:"Mästare",    da:"Mester",    fi:"Mestari",   no:"Mester",     zh:"大师",   ja:"マスター",     ko:"마스터",     hi:"मास्टर",   th:"มาสเตอร์",vi:"Thạc sĩ",     id:"Maestro",   ar:"ماستر"   },
  9:  { es:"Gran Maestro", en:"Grand Master", pt:"Grão-Mestre", fr:"Grand Maître", de:"Großmeister", it:"Gran Maestro", tr:"Büyük Usta",  ru:"Гран-Мастер",pl:"Wlk. Mistrz",nl:"Grootmeester",sv:"Stormästare",da:"Stormester", fi:"Suurmestari",no:"Stormester",  zh:"宗师",   ja:"グランドマスター",ko:"그랜드마스터",hi:"ग्रैंड मास्टर",th:"แกรนด์มาสเตอร์",vi:"Đại sư", id:"Grand Master",ar:"غراند ماستر"},
  10: { es:"Legendario",   en:"Legendary",    pt:"Lendário",    fr:"Légendaire",   de:"Legendär",    it:"Leggendario",  tr:"Efsane",      ru:"Легендарный",pl:"Legendarny", nl:"Legendarisch",sv:"Legendarisk",da:"Legendarisk",fi:"Legendaarinen",no:"Legendarisk",zh:"传奇",  ja:"レジェンダリー",ko:"레전드",   hi:"दंतकथा",   th:"เลเจนด์", vi:"Huyền thoại", id:"Legendaris",ar:"أسطورة"  },
  11: { es:"Divino",       en:"Divine",       pt:"Divino",      fr:"Divin",        de:"Göttlich",    it:"Divino",       tr:"İlahi",       ru:"Божественный",pl:"Boski",     nl:"Goddelijk",  sv:"Gudomlig",   da:"Guddommelig",fi:"Jumalallinen",no:"Guddommelig",zh:"神圣",  ja:"ディバイン",   ko:"디바인",     hi:"दिव्य",    th:"ดิไวน์",  vi:"Thần thánh",  id:"Ilahi",     ar:"إلهي"    },
};

export function getLocalizedRankInfo(rp: RankedProfile, lang: string) {
  const names = RANK_NAMES_LOCALIZED[rp.rank];
  const rankName = (names?.[lang] ?? names?.["es"] ?? RANKS[rp.rank]) || "Hierro";
  const divisionName = DIVISIONS[rp.division] || "V";
  const color = RANK_COLORS[rp.rank] || "#8B7355";
  const icon = RANK_ICONS[rp.rank] || "trophy";
  return {
    rankName,
    divisionName,
    displayName: `${rankName} ${divisionName}`,
    color,
    icon,
    rank: rp.rank,
  };
}

export function addStars(rp: RankedProfile, delta: number): RankedProfile {
  let { rank, division, stars, maxStars, totalWins, totalLosses } = rp;
  
  if (delta > 0) {
    totalWins++;
    stars += delta;
    while (stars >= maxStars) {
      stars -= maxStars;
      division++;
      if (division >= 5) {
        division = 0;
        rank++;
        if (rank >= RANKS.length) {
          rank = RANKS.length - 1;
          division = 4;
          stars = maxStars;
          break;
        }
      }
    }
  } else if (delta < 0) {
    totalLosses++;
    stars += delta;
    while (stars < 0) {
      if (division > 0 || rank > 0) {
        division--;
        if (division < 0) {
          rank--;
          division = 4;
        }
        stars += maxStars;
      } else {
        stars = 0;
        break;
      }
    }
  }

  return {
    ...rp,
    rank,
    division,
    stars,
    maxStars,
    totalWins,
    totalLosses,
  };
}

export function getRankUpRewards(newRank: number): string[] {
  // Return 3 item IDs from store appropriate to new rank
  // Items from lib/storeItems.ts
  if (newRank <= 1) { // Hierro, Bronce
    return ["back_crimson", "title_rookie", "frame_wood"];
  } else if (newRank <= 3) { // Plata, Oro
    return ["back_emerald", "title_regular", "frame_stone"];
  } else if (newRank <= 5) { // Platino, Diamante
    return ["back_gold", "title_pro", "frame_silver"];
  } else if (newRank <= 7) { // Épico, Mítico
    return ["back_ruby", "title_strategist", "frame_gold"];
  } else { // Maestro and above
    return ["back_galaxy", "title_legend_l", "frame_coal"];
  }
}

export function getRankUpBonusCoins(newRank: number): number {
  const bonuses = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 10000];
  return bonuses[newRank] || 500;
}
