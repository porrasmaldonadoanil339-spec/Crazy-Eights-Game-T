import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { playSound } from "@/lib/sounds";

const { width: SW, height: SH } = Dimensions.get("window");
const PARTICLE_COUNT = 18;

function Particle({ index }: { index: number }) {
  const x = useRef(new Animated.Value(SW / 2)).current;
  const y = useRef(new Animated.Value(SH / 2)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0)).current;

  const ICONS = ["♠", "♥", "♦", "♣", "★"];
  const icon = ICONS[index % ICONS.length];
  const colors = [Colors.gold, "#FFD700", "#FFF700", "#FF9D00", "#fff"];
  const color = colors[index % colors.length];

  useEffect(() => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 90 + Math.random() * 130;
    const tx = SW / 2 + Math.cos(angle) * dist;
    const ty = SH / 2 - 40 + Math.sin(angle) * dist;
    const delay = Math.random() * 200;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.spring(sc, { toValue: 1.3, damping: 8, stiffness: 120, useNativeDriver: true }),
        Animated.timing(x, { toValue: tx, duration: 700, useNativeDriver: true }),
        Animated.timing(y, { toValue: ty, duration: 700, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      });
    }, delay);
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: op,
        transform: [{ scale: sc }],
        fontSize: 16,
        color,
        fontWeight: "bold",
      }}
    >
      {icon}
    </Animated.Text>
  );
}

interface LevelUpOverlayProps {
  newLevel: number;
  onDone: () => void;
}

export function LevelUpOverlay({ newLevel, onDone }: LevelUpOverlayProps) {
  const overlayOp = useRef(new Animated.Value(0)).current;
  const cardSc = useRef(new Animated.Value(0.4)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const shineX = useRef(new Animated.Value(-SW)).current;

  useEffect(() => {
    playSound("level_up").catch(() => {});

    Animated.sequence([
      Animated.timing(overlayOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardSc, { toValue: 1, damping: 8, stiffness: 120, useNativeDriver: true }),
        Animated.timing(cardOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, damping: 12, stiffness: 100, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // shine sweep
      Animated.timing(shineX, { toValue: SW * 1.5, duration: 700, useNativeDriver: true }).start();
    });

    const doneTimer = setTimeout(() => {
      Animated.timing(overlayOp, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        onDone();
      });
    }, 3000);

    return () => clearTimeout(doneTimer);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOp, pointerEvents: "none" } as any]}>
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </View>

      <Animated.View style={[styles.card, { transform: [{ scale: cardSc }], opacity: cardOp }]}>
        <LinearGradient
          colors={["#0A1E0A", "#162816", "#0D1E0D"]}
          style={styles.cardGrad}
        >
          {/* Gold glow ring */}
          <View style={styles.glowRing}>
            <LinearGradient
              colors={[Colors.gold, "#FFD700", Colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowRingGrad}
            >
              <View style={styles.levelCircleInner}>
                <Text style={styles.levelNumber}>{newLevel}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Title */}
          <Animated.View style={[{ alignItems: "center", gap: 4 }, { transform: [{ translateY: titleY }] }]}>
            <Text style={styles.levelUpLabel}>NIVEL SUPERADO</Text>
            <Text style={styles.levelUpTitle}>¡NIVEL {newLevel}!</Text>
            <View style={styles.starRow}>
              <Ionicons name="star" size={14} color={Colors.gold} />
              <Ionicons name="star" size={18} color={Colors.gold} />
              <Ionicons name="star" size={14} color={Colors.gold} />
            </View>
          </Animated.View>

          {/* Shine sweep */}
          <Animated.View
            style={[
              styles.shine,
              { transform: [{ translateX: shineX }, { rotate: "20deg" }] },
            ]}
          />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  card: {
    width: 280,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold + "88",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
  },
  cardGrad: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 20,
  },
  glowRing: {
    borderRadius: 52,
    padding: 3,
  },
  glowRingGrad: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  levelCircleInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#0A1E0A",
    alignItems: "center",
    justifyContent: "center",
  },
  levelNumber: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 42,
    color: Colors.gold,
    lineHeight: 46,
  },
  levelUpLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: Colors.gold + "AA",
    letterSpacing: 3,
  },
  levelUpTitle: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 28,
    color: Colors.gold,
    letterSpacing: 1,
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  shine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
