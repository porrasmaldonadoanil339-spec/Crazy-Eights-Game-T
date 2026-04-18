import { getSeasonTheme } from "./battlePass";

export interface Season {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
}

export interface SeasonReward {
  rankIdx: number;
  coins: number;
  items: string[];
  title?: string;
}

const BASE_DATE = new Date("2026-03-01T00:00:00Z");
const SEASON_DURATION_DAYS = 30;

export function getCurrentSeason(): Season & { daysRemaining: number } {
  const now = new Date();
  const elapsedMs = now.getTime() - BASE_DATE.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  
  const seasonNumber = Math.max(1, Math.floor(elapsedDays / SEASON_DURATION_DAYS) + 1);
  const seasonStart = new Date(BASE_DATE);
  seasonStart.setDate(BASE_DATE.getDate() + (seasonNumber - 1) * SEASON_DURATION_DAYS);
  
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setDate(seasonStart.getDate() + SEASON_DURATION_DAYS);
  
  const diffMs = seasonEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    id: `season_${seasonNumber}`,
    name: `${getSeasonTheme(seasonNumber).themeName} · T${seasonNumber}`,
    number: seasonNumber,
    startDate: seasonStart.toISOString(),
    endDate: seasonEnd.toISOString(),
    daysRemaining,
  };
}

export function getSeasonRewardsForRank(rankIdx: number): SeasonReward {
  const rewards: Record<number, SeasonReward> = {
    0: { rankIdx: 0, coins: 500, items: ["iron_season_frame"] }, // Hierro
    1: { rankIdx: 1, coins: 1000, items: [] }, // Bronce
    2: { rankIdx: 2, coins: 2000, items: [] }, // Plata
    3: { rankIdx: 3, coins: 3500, items: [] }, // Oro
    4: { rankIdx: 4, coins: 500, items: [] }, // Platino (Wait, task says 5000)
    5: { rankIdx: 5, coins: 8000, items: [] }, // Diamante
    6: { rankIdx: 6, coins: 12000, items: [], title: "Héroe de Temporada" }, // Épico+
  };

  // Adjust for task specs
  if (rankIdx === 4) return { rankIdx: 4, coins: 5000, items: [] };
  
  return rewards[rankIdx] || (rankIdx > 6 ? { rankIdx, coins: 12000, items: [], title: "Leyenda de Temporada" } : { rankIdx, coins: 0, items: [] });
}
