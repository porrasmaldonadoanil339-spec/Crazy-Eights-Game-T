import { getSeasonThemeName } from "./battlePass";
import type { Lang } from "./i18n";

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

export function getCurrentSeason(lang: Lang = "es"): Season & { daysRemaining: number } {
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
    name: `${getSeasonThemeName(seasonNumber, lang)} · T${seasonNumber}`,
    number: seasonNumber,
    startDate: seasonStart.toISOString(),
    endDate: seasonEnd.toISOString(),
    daysRemaining,
  };
}

export function getSeasonRewardsForRank(rankIdx: number): SeasonReward {
  // Coins per spec; lower ranks add a few collection items, top 6 ranks add a title.
  const rewards: Record<number, SeasonReward> = {
    0:  { rankIdx: 0,  coins: 500,   items: ["frame_wood", "back_crimson"] },                              // Hierro
    1:  { rankIdx: 1,  coins: 1000,  items: ["emote_smile", "back_emerald"] },                             // Bronce
    2:  { rankIdx: 2,  coins: 2000,  items: ["frame_stone", "back_sapphire", "emote_thumbs"] },            // Plata
    3:  { rankIdx: 3,  coins: 3500,  items: ["frame_silver", "back_gold", "emote_fire"] },                 // Oro
    4:  { rankIdx: 4,  coins: 5000,  items: ["frame_gold", "back_ruby", "effect_sparkle"] },               // Platino
    5:  { rankIdx: 5,  coins: 8000,  items: ["frame_diamond", "back_galaxy", "effect_lightning"] },        // Diamante
    6:  { rankIdx: 6,  coins: 12000, items: ["frame_epic", "back_phoenix", "effect_flames"],     title: "Héroe de Temporada" },     // Épico
    7:  { rankIdx: 7,  coins: 12000, items: ["frame_mythic", "back_void", "effect_shadow"],      title: "Mito Viviente" },          // Mítico
    8:  { rankIdx: 8,  coins: 12000, items: ["frame_master", "back_aurora", "effect_aurora"],    title: "Maestro del Ocho" },       // Maestro
    9:  { rankIdx: 9,  coins: 12000, items: ["frame_grand", "back_celestial", "effect_galaxy"],  title: "Gran Estratega" },         // Gran Maestro
    10: { rankIdx: 10, coins: 12000, items: ["frame_legend", "back_dragon", "effect_dragon"],    title: "Leyenda Viva" },           // Legendario
    11: { rankIdx: 11, coins: 12000, items: ["frame_divine", "back_divine", "effect_divine"],    title: "Elegido Divino" },         // Divino
  };
  return rewards[rankIdx] || { rankIdx, coins: 0, items: [] };
}
