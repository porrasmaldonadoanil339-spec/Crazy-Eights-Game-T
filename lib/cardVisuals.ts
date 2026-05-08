import type { Card } from "./gameEngine";

export const SPECIAL_RANKS: ReadonlyArray<string> = ["8", "Joker", "7", "2", "10", "J"];

export const SPECIAL_GLOW_COLORS: Record<string, string> = {
  "8": "rgba(212,175,55,0.55)",
  "Joker": "rgba(155,89,182,0.55)",
  "7": "rgba(231,76,60,0.55)",
  "2": "rgba(46,134,222,0.55)",
  "10": "rgba(0,255,255,0.55)",
  "J": "rgba(241,196,15,0.55)",
};

export const SPECIAL_GLOW_SOLID: Record<string, string> = {
  "8": "#D4AF37",
  "Joker": "#9B59B6",
  "7": "#E74C3C",
  "2": "#2E86DE",
  "10": "#00FFFF",
  "J": "#F1C40F",
};

export function isSpecialRank(rank: unknown): boolean {
  return SPECIAL_RANKS.includes(rank as string);
}

export function suitGlowColor(card: Pick<Card, "suit">, opacity: "rgba" | "solid" = "rgba"): string {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const isBlack = card.suit === "spades" || card.suit === "clubs";
  if (opacity === "solid") {
    return isRed ? "#DC2626" : isBlack ? "#2563EB" : "#D4AF37";
  }
  return isRed ? "rgba(220,38,38,0.55)"
    : isBlack ? "rgba(37,99,235,0.55)"
    : "rgba(212,175,55,0.55)";
}

export function cardGlowColor(card: Pick<Card, "rank" | "suit">, opacity: "rgba" | "solid" = "rgba"): string {
  if (isSpecialRank(card.rank)) {
    return (opacity === "solid" ? SPECIAL_GLOW_SOLID : SPECIAL_GLOW_COLORS)[card.rank as string];
  }
  return suitGlowColor(card, opacity);
}
