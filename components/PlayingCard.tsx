import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
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
}

const SIZES = {
  sm: { w: 46, h: 68,  rs: 11, ss: 13, corner: 7  },
  md: { w: 64, h: 92,  rs: 15, ss: 18, corner: 9  },
  lg: { w: 82, h: 118, rs: 18, ss: 22, corner: 11 },
};

const DEFAULT_BACK_COLORS: [string, string, string] = ["#1E4080", "#0e2248", "#0a1832"];
const DEFAULT_BACK_ACCENT = Colors.gold;

function CardFront({ card, sobj }: { card: Card; sobj: typeof SIZES.md }) {
  const isJoker = card.rank === "Joker";
  const isEight = card.rank === "8";
  const isFace = ["J", "Q", "K"].includes(card.rank);
  const color = isJoker
    ? (card.suit === "spades" || card.suit === "clubs" ? "#1a1a2e" : "#8B0000")
    : suitColor(card.suit);
  const sym = isJoker ? "★" : suitSymbol(card.suit);
  const rankDisplay = isJoker ? "★" : card.rank;

  if (isJoker) {
    return (
      <LinearGradient
        colors={["#1a0a2e", "#2d1a4a", "#1a0a2e"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: "#A855F7aa" }]}
      >
        <View style={styles.cornerTL}>
          <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: "#A855F7" }]}>★</Text>
        </View>
        <View style={styles.cardCenterArea}>
          <LinearGradient
            colors={["#A855F7", "#7C3AED"]}
            style={[styles.eightBadge, { width: sobj.ss + 10, height: sobj.ss + 10, borderRadius: (sobj.ss + 10) / 2 }]}
          >
            <Text style={[styles.eightSym, { fontSize: sobj.ss - 2 }]}>★</Text>
          </LinearGradient>
          <Text style={[styles.eightNum, { fontSize: sobj.rs - 2, color: "#D4AF37" }]}>JOKER</Text>
        </View>
        <View style={styles.cornerBR}>
          <Text style={[styles.rankTxt, { fontSize: sobj.rs, color: "#A855F7", transform: [{ rotate: "180deg" }] }]}>★</Text>
        </View>
        <View style={[styles.innerFrame, { borderRadius: sobj.corner - 2, borderColor: "#A855F744" }]} />
      </LinearGradient>
    );
  }

  const faceGradient: [string, string, string] = isFace
    ? ["#FFF8F0", "#F5EDDA", "#EDE0C4"]
    : ["#FEFDF4", "#F8F4E6", "#EEE8D0"];

  return (
    <LinearGradient
      colors={faceGradient}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, {
        borderRadius: sobj.corner,
        borderColor: isEight ? Colors.gold + "bb" : isFace ? color + "33" : "rgba(0,0,0,0.1)",
        borderWidth: isEight || isFace ? 1.5 : 1,
      }]}
    >
      <View style={styles.cornerTL}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color, fontWeight: "900" }]}>{rankDisplay}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs - 2, color }]}>{sym}</Text>
      </View>

      <View style={styles.cardCenterArea}>
        {isEight ? (
          <>
            <LinearGradient
              colors={[color, color + "cc"]}
              style={[styles.eightBadge, { width: sobj.ss + 12, height: sobj.ss + 12, borderRadius: (sobj.ss + 12) / 2 }]}
            >
              <Text style={[styles.eightSym, { fontSize: sobj.ss }]}>{sym}</Text>
            </LinearGradient>
            <Text style={[styles.eightNum, { fontSize: sobj.rs, color }]}>8</Text>
          </>
        ) : isFace ? (
          <View style={[styles.faceBadge, { borderColor: color + "44", backgroundColor: color + "08" }]}>
            <Text style={[styles.faceRankLarge, { color, fontSize: sobj.ss + 6 }]}>{rankDisplay}</Text>
            <Text style={[styles.faceSuitSmall, { color, fontSize: sobj.rs - 2 }]}>{sym}</Text>
          </View>
        ) : (
          <Text style={[styles.centerSuitText, { fontSize: sobj.ss + 6, color }]}>{sym}</Text>
        )}
      </View>

      <View style={styles.cornerBR}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color, transform: [{ rotate: "180deg" }], fontWeight: "900" }]}>{rankDisplay}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs - 2, color, transform: [{ rotate: "180deg" }] }]}>{sym}</Text>
      </View>

      {(isEight || isFace) && (
        <View style={[styles.innerFrame, { borderRadius: sobj.corner - 2, borderColor: color + "20" }]} />
      )}
    </LinearGradient>
  );
}

function CardBack({ sobj, backColors, backAccent }: {
  sobj: typeof SIZES.md;
  backColors?: [string, string, string];
  backAccent?: string;
}) {
  const colors = backColors ?? DEFAULT_BACK_COLORS;
  const accent = backAccent ?? DEFAULT_BACK_ACCENT;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: accent + "88" }]}
    >
      {/* Diagonal dot pattern */}
      <View style={styles.backPatternWrap}>
        {[0,1,2,3].map(row => (
          <View key={row} style={styles.backPatternRow}>
            {[0,1,2,3,4].map(col => (
              <Text key={col} style={[styles.backDot, { fontSize: sobj.ss * 0.42, color: accent }]}>◆</Text>
            ))}
          </View>
        ))}
      </View>
      {/* Center emblem */}
      <View style={styles.backCenterWrap}>
        <View style={[styles.backEmblemCircle, {
          width: sobj.ss + 8, height: sobj.ss + 8,
          borderRadius: (sobj.ss + 8) / 2,
          borderColor: accent + "88",
          backgroundColor: accent + "18",
        }]}>
          <Text style={[styles.backEmblemText, { fontSize: sobj.ss - 1, color: accent }]}>◆</Text>
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
}: PlayingCardProps) {
  const sobj = SIZES[sizeKey];
  const ty = useSharedValue(0);
  const sc = useSharedValue(1);
  const glowOp = useSharedValue(0);

  useEffect(() => {
    ty.value = withSpring(isSelected ? -16 : 0, { damping: 13 });
    sc.value = withSpring(isSelected ? 1.07 : 1, { damping: 13 });
    glowOp.value = withTiming(isSelected ? 1 : 0, { duration: 180 });
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { scale: sc.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOp.value,
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
          ? <CardBack sobj={sobj} backColors={backColors} backAccent={backAccent} />
          : <CardFront card={card} sobj={sobj} />
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
    position: "absolute", top: 4, left: 5,
    alignItems: "center",
  },
  cornerBR: {
    position: "absolute", bottom: 4, right: 5,
    alignItems: "center",
  },
  rankTxt: {
    lineHeight: 16,
    letterSpacing: -0.5,
  },
  suitTxt: {
    lineHeight: 13,
    marginTop: -1,
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
