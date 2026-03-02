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

export const Colors = {
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
};

export default { light: { text: Colors.text, background: Colors.background, tint: Colors.gold, tabIconDefault: Colors.textMuted, tabIconSelected: Colors.gold } };
