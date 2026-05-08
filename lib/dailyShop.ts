import { STORE_ITEMS, StoreItem } from "@/lib/storeItems";

/**
 * Daily Shop free gift = a rotating cosmetic item, distinct from the daily
 * LOGIN reward (coins / chests / XP) which lives in lib/dailyRewards.ts and
 * is claimed via ProfileContext.claimDailyReward + lastDailyRewardDate.
 *
 * The store free gift is claimed via ProfileContext.claimDailyShopFree and
 * is persisted under lastDailyShopFreeDate. The two flows never share state
 * keys nor claim timers, so a player can claim both on the same day.
 */

const RARITY_PRICE_MULT: Record<string, number> = {
  common: 3, rare: 5, epic: 8, legendary: 15,
};

export interface DailyShopItem extends StoreItem {
  finalPrice: number;
  payCurrency: "coins" | "fichas";
}

export function getDailyDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickShuffled<T>(arr: T[], n: number, rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function priceFor(item: StoreItem): { finalPrice: number; payCurrency: "coins" | "fichas" } {
  const r = item.rarity ?? "common";
  if (r === "epic" || r === "legendary") {
    const fichas = r === "legendary" ? 250 : 90;
    return { finalPrice: fichas, payCurrency: "fichas" };
  }
  const mult = RARITY_PRICE_MULT[r] ?? 1;
  const base = item.price > 0 ? item.price : 30;
  return { finalPrice: Math.max(15, Math.round(base * mult)), payCurrency: "coins" };
}

export function getDailyShopItems(
  dateKey: string = getDailyDateKey(),
  excludeIds: string[] = [],
): DailyShopItem[] {
  const exclude = new Set(excludeIds);
  // Task #86 — premium logo stingers are unlock-only (chests / battle pass)
  // and must not appear in the rotating daily shop.
  const eligible = STORE_ITEMS.filter(
    (s) => !s.isDefault && !exclude.has(s.id) && s.category !== "logo_stinger",
  );
  const rnd = mulberry32(hashString("shop:" + dateKey));
  const picked = pickShuffled(eligible, 6, rnd);
  return picked.map((item) => ({ ...item, ...priceFor(item) }));
}

export function getDailyEmotes(
  dateKey: string = getDailyDateKey(),
  count: number = 3,
  excludeIds: string[] = [],
): StoreItem[] {
  const exclude = new Set(excludeIds);
  const eligible = STORE_ITEMS.filter(
    (s) => s.category === "emote" && !s.isDefault && !exclude.has(s.id),
  );
  if (eligible.length <= count) return eligible;
  const rnd = mulberry32(hashString("emotes:" + dateKey));
  return pickShuffled(eligible, count, rnd);
}

export function getDailyFreeItem(dateKey: string = getDailyDateKey()): DailyShopItem {
  // Task #86 — exclude logo stingers from the daily free pick for the same
  // reason as the paid daily shop above.
  const eligible = STORE_ITEMS.filter(
    (s) => !s.isDefault && s.category !== "logo_stinger" &&
      (s.rarity === "common" || s.rarity === "rare")
  );
  const rnd = mulberry32(hashString("free:" + dateKey));
  const picked = pickShuffled(eligible, 1, rnd)[0];
  return { ...picked, finalPrice: 0, payCurrency: "coins" };
}
