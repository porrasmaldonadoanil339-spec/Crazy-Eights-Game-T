import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import type { Card, Suit } from "@/lib/gameEngine";
import { suitSymbol, suitColor } from "@/lib/gameEngine";

interface PlayingCardProps {
  card: Card;
  onPress?: () => void;
  isPlayable?: boolean;
  isSelected?: boolean;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  backColors?: [string, string, string];
  backAccent?: string;
  backPattern?: "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";
  cardColors?: [string, string, string];
}

const SIZES = {
  sm: { w: 46, h: 68,  rs: 11, ss: 13, corner: 7  },
  md: { w: 64, h: 92,  rs: 15, ss: 18, corner: 9  },
  lg: { w: 82, h: 118, rs: 18, ss: 22, corner: 11 },
};

const DEFAULT_BACK_COLORS: [string, string, string] = ["#1E4080", "#0e2248", "#0a1832"];
const DEFAULT_BACK_ACCENT = Colors.gold;

function hexLuminance(hex: string): number {
  if (!hex || hex.length < 7) return 1;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function CardFront({ card, sobj, cardColors }: { card: Card; sobj: typeof SIZES.md; cardColors?: [string, string, string] }) {
  const isJoker = card.rank === "Joker";
  const isEight = card.rank === "8";
  const isFace = ["J", "Q", "K"].includes(card.rank);

  const customBg = isJoker ? undefined : cardColors?.[0];
  const isDarkCard = customBg ? hexLuminance(customBg) < 0.30 : false;
  const customSuitColor = isJoker ? undefined : isDarkCard ? (cardColors?.[2] ?? "#FFFFFF") : cardColors?.[1];

  const color = isJoker
    ? (card.suit === "spades" || card.suit === "clubs" ? "#1a1a2e" : "#8B0000")
    : (customSuitColor ?? suitColor(card.suit));

  // For dark card designs, rank text (numbers/letters) must be white for readability.
  // Suit symbols keep the accent color for visual identity.
  const rankTextColor = isDarkCard ? "#FFFFFF" : color;
  const sym = isJoker ? "★" : suitSymbol(card.suit);
  const rankDisplay = isJoker ? "★" : card.rank;

  if (isJoker) {
    const jokerColors: [string, string, string] = ["#1a0a2e", "#2d1a4a", "#1a0a2e"];
    return (
      <LinearGradient
        colors={jokerColors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: customSuitColor ?? "#A855F7aa" }]}
      >
        <View style={styles.cornerTL}>
          <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: customSuitColor ?? "#A855F7" }]}>★</Text>
        </View>
        <View style={styles.cardCenterArea}>
          <LinearGradient
            colors={[customSuitColor ?? "#A855F7", "#7C3AED"]}
            style={[styles.eightBadge, { width: sobj.ss + 10, height: sobj.ss + 10, borderRadius: (sobj.ss + 10) / 2 }]}
          >
            <Text style={[styles.eightSym, { fontSize: sobj.ss - 2 }]}>★</Text>
          </LinearGradient>
          <Text style={[styles.eightNum, { fontSize: sobj.rs - 2, color: "#D4AF37" }]}>JOKER</Text>
        </View>
        <View style={styles.cornerBR}>
          <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: customSuitColor ?? "#A855F7", transform: [{ rotate: "180deg" }] }]}>★</Text>
        </View>
        <View style={[styles.innerFrame, { borderRadius: sobj.corner - 2, borderColor: (customSuitColor ?? "#A855F7") + "44" }]} />
      </LinearGradient>
    );
  }

  // Clean white face for default; tinted if custom design
  const faceGradient: [string, string, string] = customBg
    ? isDarkCard
      ? [customBg, (customSuitColor ?? "#FFFFFF") + "22", customBg]
      : [customBg, customBg, customBg]
    : isFace
      ? ["#FFFFFF", "#F8F8FF", "#F5F5FF"]
      : ["#FFFFFF", "#FAFAFA", "#F5F5F5"];

  // On light cards, add strong drop shadow to rank text so it pops
  const rankShadow = isDarkCard
    ? { textShadowColor: "rgba(0,0,0,0.95)", textShadowRadius: 5, textShadowOffset: { width: 0, height: 1 } }
    : { textShadowColor: "rgba(0,0,0,0.08)", textShadowRadius: 1, textShadowOffset: { width: 0, height: 1 } };

  const suitShadow = isDarkCard
    ? { textShadowColor: "rgba(0,0,0,0.9)", textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } }
    : {};

  // Card border: crisp thin outline for clean look
  const cardBorderColor = isEight
    ? (cardColors?.[2] ?? color) + "cc"
    : isFace
      ? color + "40"
      : color + "22";
  const cardBorderWidth = isEight ? 2 : 1;

  return (
    <LinearGradient
      colors={faceGradient}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, {
        borderRadius: sobj.corner,
        borderColor: cardBorderColor,
        borderWidth: cardBorderWidth,
      }]}
    >
      {/* Top-left corner: rank + suit */}
      <View style={styles.cornerTL}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: rankTextColor, fontWeight: "900" }, rankShadow]}>{rankDisplay}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs, color }, suitShadow]}>{sym}</Text>
      </View>

      {/* Center */}
      <View style={styles.cardCenterArea}>
        {isEight ? (
          <>
            <LinearGradient
              colors={[color, isDarkCard ? color + "bb" : color + "dd"]}
              style={[styles.eightBadge, { width: sobj.ss + 14, height: sobj.ss + 14, borderRadius: (sobj.ss + 14) / 2 }]}
            >
              <Text style={[styles.eightSym, { fontSize: sobj.ss + 2 }]}>{sym}</Text>
            </LinearGradient>
            <Text style={[styles.eightNum, { fontSize: sobj.rs + 1, color }]}>8</Text>
          </>
        ) : isFace ? (
          <View style={[styles.faceBadge, { borderColor: color + "55", backgroundColor: color + "0D" }]}>
            <Text style={[styles.faceRankLarge, { color: rankTextColor, fontSize: sobj.ss + 8, fontWeight: "900" }]}>{rankDisplay}</Text>
            <Text style={[styles.faceSuitSmall, { color, fontSize: sobj.rs }]}>{sym}</Text>
          </View>
        ) : (
          <Text style={[styles.centerSuitText, { fontSize: sobj.ss + 8, color }]}>{sym}</Text>
        )}
      </View>

      {/* Bottom-right corner (rotated) */}
      <View style={styles.cornerBR}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: rankTextColor, transform: [{ rotate: "180deg" }], fontWeight: "900" }, rankShadow]}>{rankDisplay}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs, color, transform: [{ rotate: "180deg" }] }, suitShadow]}>{sym}</Text>
      </View>

      {(isEight || isFace) && (
        <View style={[styles.innerFrame, { borderRadius: sobj.corner - 2, borderColor: color + "18" }]} />
      )}
    </LinearGradient>
  );
}

const PATTERN_SYMBOLS: Record<string, string> = {
  diamonds: "◆",
  stars: "★",
  circles: "●",
  crosses: "✚",
  waves: "≋",
  hexagons: "⬡",
};
const PATTERN_CENTER: Record<string, string> = {
  diamonds: "◆",
  stars: "✦",
  circles: "◉",
  crosses: "✛",
  waves: "〰",
  hexagons: "⬢",
};

function CardBack({ sobj, backColors, backAccent, backPattern }: {
  sobj: typeof SIZES.md;
  backColors?: [string, string, string];
  backAccent?: string;
  backPattern?: string;
}) {
  const colors = backColors ?? DEFAULT_BACK_COLORS;
  const accent = backAccent ?? DEFAULT_BACK_ACCENT;
  const pat = backPattern ?? "diamonds";
  const sym = PATTERN_SYMBOLS[pat] ?? "◆";
  const centerSym = PATTERN_CENTER[pat] ?? "◆";
  const isWave = pat === "waves";
  const isCross = pat === "crosses";

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: accent + "88" }]}
    >
      {/* Pattern grid */}
      <View style={styles.backPatternWrap}>
        {[0,1,2,3].map(row => (
          <View key={row} style={[styles.backPatternRow, isWave && { marginLeft: row % 2 === 0 ? 4 : 0 }]}>
            {[0,1,2,3,4].map(col => (
              <Text
                key={col}
                style={[
                  styles.backDot,
                  { fontSize: sobj.ss * (isCross ? 0.38 : isWave ? 0.45 : 0.42), color: accent },
                  (row + col) % 2 === 0 ? { opacity: 0.9 } : { opacity: 0.45 },
                ]}
              >{sym}</Text>
            ))}
          </View>
        ))}
      </View>
      {/* Center emblem */}
      <View style={styles.backCenterWrap}>
        <View style={[styles.backEmblemCircle, {
          width: sobj.ss + 10, height: sobj.ss + 10,
          borderRadius: (sobj.ss + 10) / 2,
          borderColor: accent + "99",
          backgroundColor: accent + "22",
        }]}>
          <Text style={[styles.backEmblemText, { fontSize: sobj.ss, color: accent }]}>{centerSym}</Text>
        </View>
      </View>
      {/* Inner border frame */}
      <View style={[styles.backInnerBorder, { borderRadius: sobj.corner - 2, borderColor: accent + "55" }]} />
    </LinearGradient>
  );
}

export function PlayingCard({
  card,
  onPress,
  isPlayable = false,
  isSelected = false,
  faceDown = false,
  size: sizeKey = "md",
  backColors,
  backAccent,
  backPattern,
  cardColors,
}: PlayingCardProps) {
  const sobj = SIZES[sizeKey];
  const ty = useSharedValue(0);
  const sc = useSharedValue(1);
  const glowOp = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glowPulse = useSharedValue(0.5);
  const wiggle = useSharedValue(0);
  const ringPulse = useSharedValue(0.5);

  useEffect(() => {
    ty.value = withSpring(isSelected ? -16 : 0, { damping: 13 });
    sc.value = withSpring(isSelected ? 1.07 : 1, { damping: 13 });
    glowOp.value = withTiming(isSelected ? 1 : 0, { duration: 180 });
    if (isSelected) {
      wiggle.value = withSequence(
        withTiming(-3.5, { duration: 70 }),
        withTiming(3.5, { duration: 80 }),
        withTiming(-2, { duration: 70 }),
        withTiming(0, { duration: 70 }),
      );
      ringPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.45, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(ringPulse);
      ringPulse.value = withTiming(0.5, { duration: 200 });
      wiggle.value = withTiming(0, { duration: 100 });
    }
  }, [isSelected]);

  useEffect(() => {
    if (isPlayable && !isSelected) {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 550 }),
          withTiming(0, { duration: 550 }),
        ),
        -1,
        false,
      );
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.3, { duration: 700 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(floatY);
      cancelAnimation(glowPulse);
      floatY.value = withTiming(0, { duration: 200 });
      glowPulse.value = withTiming(0.5, { duration: 200 });
    }
  }, [isPlayable, isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: ty.value + (isPlayable && !isSelected ? floatY.value : 0) },
      { scale: sc.value },
      { rotate: `${wiggle.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isPlayable && !isSelected
      ? glowPulse.value * 0.85
      : isSelected
        ? glowOp.value * (0.55 + ringPulse.value * 0.45)
        : 0,
  }));

  const accentGlow = backAccent ?? Colors.gold;
  const shadowEl = isSelected
    ? { shadowColor: accentGlow, shadowOpacity: 0.95, shadowRadius: 14, elevation: 14 }
    : isPlayable
    ? { shadowColor: "#4ade80", shadowOpacity: 0.7, shadowRadius: 10, elevation: 10 }
    : { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 };

  const inner = (
    <Animated.View style={[{ position: "relative" }, animStyle]}>
      {(isSelected || isPlayable) && (
        <Animated.View style={[styles.glowAura, {
          width: sobj.w + 10, height: sobj.h + 10,
          borderRadius: sobj.corner + 3,
          top: -5, left: -5,
          backgroundColor: isSelected ? accentGlow + "33" : "#4ade8022",
          shadowColor: isSelected ? accentGlow : "#4ade80",
          shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 0,
        }, glowStyle]} />
      )}

      <View style={[styles.cardWrap, { width: sobj.w, height: sobj.h, borderRadius: sobj.corner, ...shadowEl }]}>
        {faceDown
          ? <CardBack sobj={sobj} backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
          : <CardFront card={card} sobj={sobj} cardColors={cardColors} />
        }
      </View>

      {isPlayable && !isSelected && (
        <View style={[styles.playableIndicator, { left: sobj.w * 0.2, right: sobj.w * 0.2 }]} />
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => { sc.value = withSpring(0.93, { damping: 14 }); }}
        onPressOut={() => { sc.value = withSpring(isSelected ? 1.07 : 1, { damping: 14 }); }}
        disabled={!onPress}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  cardWrap: {
    overflow: "hidden",
    shadowOffset: { width: 0, height: 3 },
  },
  cardFace: {
    flex: 1,
    borderWidth: 1,
  },
  cornerTL: {
    position: "absolute", top: 3, left: 4,
    alignItems: "center",
  },
  cornerBR: {
    position: "absolute", bottom: 3, right: 4,
    alignItems: "center",
  },
  rankTxt: {
    lineHeight: 17,
    letterSpacing: -0.5,
    fontWeight: "900",
  },
  suitTxt: {
    lineHeight: 14,
    marginTop: -2,
    fontWeight: "700",
  },
  cardCenterArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  centerSuitText: {
    fontWeight: "700",
  },
  faceBadge: {
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 4,
    gap: 2,
  },
  faceRankLarge: {
    fontWeight: "900",
    letterSpacing: -1,
  },
  faceSuitSmall: {
    fontWeight: "700",
  },
  eightBadge: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  eightSym: {
    color: "#fff",
    fontWeight: "900",
  },
  eightNum: {
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 1,
  },
  innerFrame: {
    position: "absolute", top: 2, left: 2, right: 2, bottom: 2,
    borderWidth: 0.5,
  },
  backPatternWrap: {
    position: "absolute", top: 5, left: 4, right: 4, bottom: 5,
    overflow: "hidden", opacity: 0.18,
    alignItems: "center", justifyContent: "center", gap: 3,
  },
  backPatternRow: { flexDirection: "row", gap: 4 },
  backDot: {},
  backCenterWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  backEmblemCircle: {
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  backEmblemText: { fontWeight: "900" },
  backInnerBorder: {
    position: "absolute", top: 3, left: 3, right: 3, bottom: 3,
    borderWidth: 1,
  },
  glowAura: {
    position: "absolute",
    zIndex: -1,
  },
  playableIndicator: {
    position: "absolute", bottom: -6, height: 3, borderRadius: 2,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 5, elevation: 5,
  },
});
