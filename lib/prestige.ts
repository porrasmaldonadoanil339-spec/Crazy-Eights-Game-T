import { RANKS, DIVISIONS, getLocalizedRankInfo, type RankedProfile } from "./ranked";

export interface PrestigeSourceFields {
  level: number;
  wins: number;
  name?: string;
  rank?: number;
  division?: number;
  winRate?: number;
}

export interface PrestigeFields {
  winRate: number;
  totalGames: number;
  bestStreak: number;
  achievementsUnlocked: number;
  rankName: string;
  topRankName: string;
}

function hashName(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Task #120 — single source of truth for derived prestige metrics shown in
 * PlayerProfileModal for non-self players. Pure deterministic mapping from
 * canonical player fields (level, wins, name, current rank/division) so every
 * screen renders identical values for the same player. No per-screen drift.
 */
export function buildPrestigeFields(src: PrestigeSourceFields, lang: string = "es"): PrestigeFields {
  const seed = hashName(src.name ?? "anon") ^ (src.level * 7919) ^ (src.wins * 31337);
  const r1 = ((seed * 9301 + 49297) % 233280) / 233280;
  const r2 = ((seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

  const winRate = src.winRate ?? Math.min(92, 30 + Math.floor(src.level * 0.5) + Math.floor(r1 * 10));
  const totalGames = Math.max(src.wins, Math.round(src.wins / Math.max(0.2, winRate / 100)));
  const bestStreak = 3 + Math.floor(r2 * 22);
  const achievementsUnlocked = Math.min(981, 25 + src.level * 4 + Math.floor(r1 * 60));

  const rank = src.rank ?? 0;
  const division = src.division ?? 0;
  const rp: RankedProfile = {
    rank, division, stars: 0, maxStars: 5, totalWins: 0, totalLosses: 0,
  };
  const info = getLocalizedRankInfo(rp, lang);
  const rankName = info.displayName;

  // Top rank reached for non-self players: derived from level milestones —
  // every 8 levels of progression unlocks one rank tier above their current.
  const topRankIdx = Math.min(RANKS.length - 1, rank + Math.max(0, Math.floor(src.level / 8)));
  const topDivIdx = Math.min(DIVISIONS.length - 1, division);
  const topInfo = getLocalizedRankInfo(
    { rank: topRankIdx, division: topDivIdx, stars: 0, maxStars: 5, totalWins: 0, totalLosses: 0 },
    lang,
  );

  return {
    winRate,
    totalGames,
    bestStreak,
    achievementsUnlocked,
    rankName,
    topRankName: topInfo.displayName,
  };
}
