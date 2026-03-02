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
}

const SIZES = {
  sm: { w: 46, h: 68,  rs: 11, ss: 13, corner: 7  },
  md: { w: 64, h: 92,  rs: 15, ss: 18, corner: 9  },
  lg: { w: 82, h: 118, rs: 18, ss: 22, corner: 11 },
};

function CardFront({ card, sobj }: { card: Card; sobj: typeof SIZES.md }) {
  const color = suitColor(card.suit);
  const sym = suitSymbol(card.suit);
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const isEight = card.rank === "8";

  return (
    <LinearGradient
      colors={["#FEFDF4", "#F8F4E6", "#EEE8D0"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: isEight ? Colors.gold + "aa" : "rgba(0,0,0,0.12)" }]}
    >
      {/* Top-left rank + suit */}
      <View style={styles.cornerTL}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color }]}>{card.rank}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs - 2, color }]}>{sym}</Text>
      </View>

      {/* Center display */}
      <View style={styles.cardCenterArea}>
        {isEight ? (
          <LinearGradient
            colors={[color, color + "aa"]}
            style={[styles.eightBadge, { width: sobj.ss + 10, height: sobj.ss + 10, borderRadius: (sobj.ss + 10) / 2 }]}
          >
            <Text style={[styles.eightSym, { fontSize: sobj.ss - 2 }]}>{sym}</Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.centerSuitText, { fontSize: sobj.ss + 4, color }]}>{sym}</Text>
        )}
        {isEight && (
          <Text style={[styles.eightNum, { fontSize: sobj.rs - 1, color }]}>8</Text>
        )}
      </View>

      {/* Bottom-right (mirrored) */}
      <View style={styles.cornerBR}>
        <Text style={[styles.rankTxt, { fontSize: sobj.rs, color, transform: [{ rotate: "180deg" }] }]}>{card.rank}</Text>
        <Text style={[styles.suitTxt, { fontSize: sobj.rs - 2, color, transform: [{ rotate: "180deg" }] }]}>{sym}</Text>
      </View>

      {/* Subtle inner frame */}
      <View style={[styles.innerFrame, { borderRadius: sobj.corner - 2 }]} />
    </LinearGradient>
  );
}

function CardBack({ sobj }: { sobj: typeof SIZES.md }) {
  return (
    <LinearGradient
      colors={["#1E4080", "#0e2248", "#0a1832"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.cardFace, { borderRadius: sobj.corner, borderColor: Colors.gold + "88" }]}
    >
      {/* Diagonal pattern */}
      <View style={styles.backPatternWrap}>
        {[0,1,2,3].map(row => (
          <View key={row} style={styles.backPatternRow}>
            {[0,1,2,3,4].map(col => (
              <Text key={col} style={[styles.backDot, { fontSize: sobj.ss * 0.42 }]}>◆</Text>
            ))}
          </View>
        ))}
      </View>
      {/* Gold center emblem */}
      <View style={styles.backCenterWrap}>
        <View style={[styles.backEmblemCircle, { width: sobj.ss + 6, height: sobj.ss + 6, borderRadius: (sobj.ss + 6) / 2 }]}>
          <Text style={[styles.backEmblemText, { fontSize: sobj.ss - 2 }]}>◆</Text>
        </View>
      </View>
      {/* Gold inner border */}
      <View style={[styles.backInnerBorder, { borderRadius: sobj.corner - 2 }]} />
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

  const shadowEl = isSelected
    ? { shadowColor: Colors.gold, shadowOpacity: 0.95, shadowRadius: 14, elevation: 14 }
    : isPlayable
    ? { shadowColor: "#4ade80", shadowOpacity: 0.7, shadowRadius: 10, elevation: 10 }
    : { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 };

  const inner = (
    <Animated.View style={[{ position: "relative" }, animStyle]}>
      {/* Glow behind card */}
      {(isSelected || isPlayable) && (
        <Animated.View style={[styles.glowAura, {
          width: sobj.w + 10, height: sobj.h + 10,
          borderRadius: sobj.corner + 3,
          top: -5, left: -5,
          backgroundColor: isSelected ? Colors.gold + "33" : "#4ade8022",
          shadowColor: isSelected ? Colors.gold : "#4ade80",
          shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 0,
        }, glowStyle]} />
      )}

      <View style={[styles.cardWrap, { width: sobj.w, height: sobj.h, borderRadius: sobj.corner, ...shadowEl }]}>
        {faceDown ? <CardBack sobj={sobj} /> : <CardFront card={card} sobj={sobj} />}
      </View>

      {/* Playable indicator */}
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
    fontWeight: "900",
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
  eightBadge: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)",
  },
  backPatternWrap: {
    position: "absolute", top: 5, left: 4, right: 4, bottom: 5,
    overflow: "hidden", opacity: 0.18,
    alignItems: "center", justifyContent: "center", gap: 3,
  },
  backPatternRow: { flexDirection: "row", gap: 4 },
  backDot: { color: Colors.gold },
  backCenterWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  backEmblemCircle: {
    backgroundColor: Colors.gold + "22",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.gold + "66",
  },
  backEmblemText: { color: Colors.gold, fontWeight: "900" },
  backInnerBorder: {
    position: "absolute", top: 3, left: 3, right: 3, bottom: 3,
    borderWidth: 1, borderColor: Colors.gold + "55",
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
