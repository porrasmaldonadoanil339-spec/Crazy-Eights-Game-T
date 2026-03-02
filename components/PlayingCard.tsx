import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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
  sm: { w: 42, h: 62, rank: 10, suit: 12, corner: 6 },
  md: { w: 58, h: 84, rank: 14, suit: 16, corner: 8 },
  lg: { w: 72, h: 104, rank: 17, suit: 20, corner: 10 },
};

export function PlayingCard({
  card,
  onPress,
  isPlayable = false,
  isSelected = false,
  faceDown = false,
  size = "md",
}: PlayingCardProps) {
  const s = SIZES[size];
  const scale = useSharedValue(1);
  const translateY = useSharedValue(isSelected ? -10 : 0);

  React.useEffect(() => {
    translateY.value = withSpring(isSelected ? -14 : 0, { damping: 15 });
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const color = suitColor(card.suit);
  const sym = suitSymbol(card.suit);

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withSpring(0.94, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  if (faceDown) {
    return (
      <Animated.View style={[styles.card, { width: s.w, height: s.h }, animStyle]}>
        <View style={[styles.cardBack, { borderRadius: s.corner }]}>
          <View style={styles.backPattern}>
            {Array.from({ length: 6 }).map((_, i) =>
              Array.from({ length: 4 }).map((__, j) => (
                <Text
                  key={`${i}-${j}`}
                  style={[styles.backDot, { color: Colors.gold, fontSize: 8 }]}
                >
                  ◆
                </Text>
              ))
            )}
          </View>
          <View style={styles.backBorder} />
        </View>
      </Animated.View>
    );
  }

  const isEight = card.rank === "8";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.card,
          { width: s.w, height: s.h, borderRadius: s.corner },
          isPlayable && styles.cardPlayable,
          isSelected && styles.cardSelected,
          isEight && styles.cardEight,
          animStyle,
        ]}
      >
        <View style={[styles.cardInner, { borderRadius: s.corner - 1 }]}>
          <View style={styles.cardCornerTL}>
            <Text style={[styles.rankText, { fontSize: s.rank, color }]}>
              {card.rank}
            </Text>
            <Text style={[styles.suitCorner, { fontSize: s.rank - 2, color }]}>
              {sym}
            </Text>
          </View>
          <View style={styles.cardCenter}>
            <Text style={[styles.centerSuit, { fontSize: s.suit + 6, color }]}>
              {sym}
            </Text>
            {isEight && (
              <Text style={[styles.eightLabel, { fontSize: s.rank - 2 }]}>
                LOCO
              </Text>
            )}
          </View>
          <View style={styles.cardCornerBR}>
            <Text
              style={[styles.rankText, { fontSize: s.rank, color, transform: [{ rotate: "180deg" }] }]}
            >
              {card.rank}
            </Text>
            <Text
              style={[styles.suitCorner, { fontSize: s.rank - 2, color, transform: [{ rotate: "180deg" }] }]}
            >
              {sym}
            </Text>
          </View>
        </View>
        {isPlayable && <View style={styles.glowOverlay} />}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  cardBack: {
    flex: 1,
    backgroundColor: "#1a3a6a",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  backPattern: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    gap: 2,
  },
  backDot: {
    opacity: 0.4,
  },
  backBorder: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    borderRadius: 4,
  },
  cardInner: {
    flex: 1,
    backgroundColor: Colors.cardWhite,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
  },
  cardPlayable: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  cardSelected: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  cardEight: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  cardCornerTL: {
    position: "absolute",
    top: 3,
    left: 4,
    alignItems: "center",
  },
  cardCornerBR: {
    position: "absolute",
    bottom: 3,
    right: 4,
    alignItems: "center",
  },
  rankText: {
    fontWeight: "900",
    lineHeight: 18,
  },
  suitCorner: {
    lineHeight: 12,
  },
  cardCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerSuit: {
    lineHeight: undefined,
  },
  eightLabel: {
    fontWeight: "900",
    color: Colors.gold,
    letterSpacing: 1,
    marginTop: 2,
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
});
