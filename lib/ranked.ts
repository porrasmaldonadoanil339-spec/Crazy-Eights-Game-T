export const RANKS = ["Hierro", "Bronce", "Plata", "Oro", "Platino", "Diamante", "Épico", "Mítico", "Maestro", "Gran Maestro", "Legendario", "Divino"];
export const DIVISIONS = ["V", "IV", "III", "II", "I"];

export interface RankedProfile {
  rank: number; // 0 to 11
  division: number; // 0 to 4
  stars: number;
  maxStars: number;
  totalWins: number;
  totalLosses: number;
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
    icon: "trophy", // Default icon, could be more specific
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
