import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const { width: W, height: H } = Dimensions.get("window");

interface RewardPopupProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  coins?: number;
  xp?: number;
  itemName?: string;
  itemIcon?: string;
  itemColor?: string;
  accent?: string;
  onClose: () => void;
}

interface Particle {
  angle: number;
  dist: number;
  delay: number;
  color: string;
  size: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
}

const PARTICLE_COLORS = ["#FFD700", "#FFB347", "#FF6B6B", "#A855F7", "#4A9AE8", "#4CAF50"];
const NUM_PARTICLES = 22;

export default function RewardPopup({
  visible,
  title = "¡RECOMPENSA OBTENIDA!",
  subtitle,
  coins,
  xp,
  itemName,
  itemIcon,
  itemColor,
  accent = Colors.gold,
  onClose,
}: RewardPopupProps) {
  const bgOp = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const cardOp = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const titlePulse = useSharedValue(1);
  const ringScale = useSharedValue(0);
  const ringOp = useSharedValue(0);
  const tapHintOp = useSharedValue(0);

  const particles = useRef<Particle[]>(
    Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      angle: (i / NUM_PARTICLES) * Math.PI * 2,
      dist: 90 + Math.random() * 80,
      delay: Math.random() * 120,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 5 + Math.random() * 6,
      x: useSharedValue(0),
      y: useSharedValue(0),
      opacity: useSharedValue(0),
      scale: useSharedValue(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      bgOp.value = withTiming(1, { duration: 220 });
      cardOp.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1, { damping: 7, stiffness: 130 });

      titleScale.value = withDelay(120,
        withSequence(
          withSpring(1.18, { damping: 5, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 160 })
        )
      );
      titlePulse.value = withDelay(700,
        withRepeat(
          withSequence(
            withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
          ),
          -1, false
        )
      );

      ringScale.value = withSequence(
        withTiming(1.6, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(1.6, { duration: 100 })
      );
      ringOp.value = withSequence(
        withTiming(0.8, { duration: 80 }),
        withTiming(0, { duration: 520 })
      );

      tapHintOp.value = withDelay(900,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.4, { duration: 600 })
          ), -1, true
        )
      );

      particles.forEach((p) => {
        p.x.value = 0;
        p.y.value = 0;
        p.opacity.value = 0;
        p.scale.value = 0;
        p.scale.value = withDelay(150 + p.delay, withSpring(1, { damping: 6 }));
        p.opacity.value = withDelay(150 + p.delay,
          withSequence(
            withTiming(1, { duration: 100 }),
            withDelay(450, withTiming(0, { duration: 350 }))
          )
        );
        p.x.value = withDelay(150 + p.delay,
          withTiming(Math.cos(p.angle) * p.dist, { duration: 750, easing: Easing.out(Easing.quad) })
        );
        p.y.value = withDelay(150 + p.delay,
          withTiming(Math.sin(p.angle) * p.dist - 30, { duration: 750, easing: Easing.out(Easing.quad) })
        );
      });
    } else {
      bgOp.value = withTiming(0, { duration: 180 });
      cardOp.value = withTiming(0, { duration: 180 });
      cardScale.value = withTiming(0.85, { duration: 180 });
      titlePulse.value = 1;
      tapHintOp.value = 0;
    }
  }, [visible]);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOp.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ scale: cardScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value * titlePulse.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOp.value,
    transform: [{ scale: ringScale.value }],
  }));
  const tapStyle = useAnimatedStyle(() => ({ opacity: tapHintOp.value }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, bgStyle]}>
      <Pressable style={styles.touch} onPress={onClose}>
        <View style={styles.bgFill} pointerEvents="none" />

        <Animated.View style={[styles.card, cardStyle, { borderColor: accent + "AA", shadowColor: accent }]}>
          <LinearGradient
            colors={["#1a1208", "#0e0905", "#1a1208"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Burst ring behind icon */}
          <Animated.View style={[styles.burstRing, { borderColor: accent }, ringStyle]} />

          {/* Particles */}
          {particles.map((p, i) => (
            <ParticleDot key={i} particle={p} />
          ))}

          {/* Title */}
          <Animated.View style={titleStyle}>
            <Text style={[styles.title, { color: accent, textShadowColor: accent + "88" }]}>{title}</Text>
          </Animated.View>
          {!!subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}

          {/* Big icon area */}
          <View style={styles.iconArea}>
            <LinearGradient
              colors={[accent, accent + "AA"]}
              style={styles.iconCircle}
            >
              <Ionicons name={(itemIcon ?? "trophy") as any} size={56} color="#1a0a00" />
            </LinearGradient>
          </View>

          {!!itemName && (
            <Text style={styles.itemName}>{itemName}</Text>
          )}

          {/* Reward chips */}
          {(coins !== undefined || xp !== undefined) && (
            <View style={styles.chips}>
              {coins !== undefined && coins > 0 && (
                <View style={[styles.chip, { backgroundColor: Colors.gold + "22", borderColor: Colors.gold + "88" }]}>
                  <Ionicons name="cash" size={20} color={Colors.gold} />
                  <Text style={[styles.chipVal, { color: Colors.gold }]}>+{coins}</Text>
                </View>
              )}
              {xp !== undefined && xp > 0 && (
                <View style={[styles.chip, { backgroundColor: "#4A9AE822", borderColor: "#4A9AE888" }]}>
                  <Ionicons name="flash" size={20} color="#4A9AE8" />
                  <Text style={[styles.chipVal, { color: "#4A9AE8" }]}>+{xp} XP</Text>
                </View>
              )}
            </View>
          )}

          <Animated.View style={[styles.tapHint, tapStyle]}>
            <Text style={[styles.tapText, { color: accent + "DD" }]}>Toca para continuar</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function ParticleDot({ particle }: { particle: Particle }) {
  const style = useAnimatedStyle(() => ({
    opacity: particle.opacity.value,
    transform: [
      { translateX: particle.x.value },
      { translateY: particle.y.value },
      { scale: particle.scale.value },
    ],
  }));
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          shadowColor: particle.color,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    justifyContent: "center",
    alignItems: "center",
  },
  touch: {
    flex: 1,
    width: W,
    height: H,
    justifyContent: "center",
    alignItems: "center",
  },
  bgFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  card: {
    width: Math.min(W * 0.85, 340),
    borderRadius: 26,
    borderWidth: 2,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    overflow: "hidden",
    shadowOpacity: 0.7,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
  burstRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    top: 110,
  },
  particle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -4,
    marginTop: -4,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#D4AF37CC",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  iconArea: {
    marginTop: 18,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  itemName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 17,
    color: "#FFFFFF",
    marginTop: 4,
    marginBottom: 8,
    textAlign: "center",
  },
  chips: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipVal: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
  },
  tapHint: {
    marginTop: 16,
  },
  tapText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    letterSpacing: 0.8,
  },
});
