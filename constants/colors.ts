const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5D473";
const FELT_GREEN = "#0a1a0f";
const FELT_MID = "#112615";
const FELT_SURFACE = "#173020";
const FELT_CARD = "#1d3a28";
const RED_CARD = "#C0392B";
const BLACK_CARD = "#1a1a1a";
const WHITE_CARD = "#F8F5EE";
const ACCENT_BLUE = "#1a6ba0";

export const DarkColors = {
  background: FELT_GREEN,
  surface: FELT_SURFACE,
  card: FELT_CARD,
  cardWhite: WHITE_CARD,
  gold: GOLD,
  goldLight: GOLD_LIGHT,
  red: RED_CARD,
  black: BLACK_CARD,
  text: "#EEE8D5",
  textMuted: "rgba(238,232,213,0.5)",
  textDim: "rgba(238,232,213,0.25)",
  border: "rgba(212,175,55,0.25)",
  borderStrong: "rgba(212,175,55,0.5)",
  felt: FELT_MID,
  blue: ACCENT_BLUE,
  success: "#27ae60",
  overlay: "rgba(0,0,0,0.7)",
  isDark: true,
};

export const LightColors = {
  background: "#e8f5e2",
  surface: "#d0e8c8",
  card: "#c4ddb8",
  cardWhite: "#FFFFFF",
  gold: "#A07800",
  goldLight: "#C8A000",
  red: "#B02020",
  black: "#1a1a1a",
  text: "#0d2b0d",
  textMuted: "rgba(13,43,13,0.55)",
  textDim: "rgba(13,43,13,0.30)",
  border: "rgba(120,80,0,0.22)",
  borderStrong: "rgba(120,80,0,0.45)",
  felt: "#c8ddbf",
  blue: "#1558a0",
  success: "#1e8040",
  overlay: "rgba(0,0,0,0.5)",
  isDark: false,
};

export const Colors = DarkColors;

export type ThemeColors = typeof DarkColors;

// ─── Shadow tokens ───────────────────────────────────────────────────────────
// Normalised elevation styles so cards, modals and CTAs share consistent
// depth. Always spread these into a style object — never override individual
// fields. RN's `shadow*` props are deprecated on web but the equivalent
// `boxShadow` mapping is handled by RN Web internally for these tokens.
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  gold: {
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
  goldDeep: {
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export type ShadowToken = keyof typeof Shadows;

export default { light: { text: DarkColors.text, background: DarkColors.background, tint: DarkColors.gold, tabIconDefault: DarkColors.textMuted, tabIconSelected: DarkColors.gold } };
