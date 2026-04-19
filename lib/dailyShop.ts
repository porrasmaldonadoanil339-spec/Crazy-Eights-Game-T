import { STORE_ITEMS, StoreItem } from "@/lib/storeItems";

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

export function getDailyShopItems(dateKey: string = getDailyDateKey()): DailyShopItem[] {
  const eligible = STORE_ITEMS.filter((s) => !s.isDefault);
  const rnd = mulberry32(hashString("shop:" + dateKey));
  const picked = pickShuffled(eligible, 6, rnd);
  return picked.map((item) => ({ ...item, ...priceFor(item) }));
}

export function getDailyFreeItem(dateKey: string = getDailyDateKey()): DailyShopItem {
  const eligible = STORE_ITEMS.filter(
    (s) => !s.isDefault && (s.rarity === "common" || s.rarity === "rare")
  );
  const rnd = mulberry32(hashString("free:" + dateKey));
  const picked = pickShuffled(eligible, 1, rnd)[0];
  return { ...picked, finalPrice: 0, payCurrency: "coins" };
}
