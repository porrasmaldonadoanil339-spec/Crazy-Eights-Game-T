import { CoinIcon } from "@/components/CoinIcon";
import { ChipIcon } from "@/components/ChipIcon";
import ChestVisual from "@/components/ChestVisual";
import { Colors } from "@/constants/colors";
import { useProfile, type SurpriseGiftResult } from "@/context/ProfileContext";
import type { ChestType } from "@/lib/chestSystem";
import { t as i18nT, type Lang, type TranslationKey } from "@/lib/i18n";
import { playSound } from "@/lib/sounds";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const CHEST_NAME_KEY: Record<ChestType, TranslationKey> = {
  common: "chestNameCommon", rare: "chestNameRare",
  epic: "chestNameEpic", legendary: "chestNameLegendary",
  magic: "chestNameMagic", giant: "chestNameGiant",
  event: "chestNameEvent", supreme: "chestNameSupreme",
  fichas: "chestNameFichas",
};

const PARTICLE_COLORS = ["#FFD700", "#FFB347", "#FF6B6B", "#A855F7", "#4A9AE8", "#4CAF50"];
const NUM_PARTICLES = 20;

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

interface Props {
  visible: boolean;
  reward: SurpriseGiftResult | null;
  onClose: () => void;
}

export default function SurpriseGiftModal({ visible, reward, onClose }: Props) {
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as Lang;
  const [phase, setPhase] = useState<"opening" | "reveal">("opening");

  const accent = reward?.kind === "fichas" ? "#3498DB" : Colors.gold;

  const bgOp = useSharedValue(0);
  const boxScale = useSharedValue(0);
  const boxOp = useSharedValue(0);
  const boxRot = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const flashOp = useSharedValue(0);
  const prizeScale = useSharedValue(0);
  const prizeOp = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOp = useSharedValue(0);
  const tapOp = useSharedValue(0);

  const particles = useRef<Particle[]>(
    Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      angle: (i / NUM_PARTICLES) * Math.PI * 2,
      dist: 95 + Math.random() * 80,
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
      setPhase("opening");
      bgOp.value = withTiming(1, { duration: 220 });
      boxOp.value = withTiming(1, { duration: 200 });
      boxScale.value = withSpring(1, { damping: 7, stiffness: 140 });

      // Wiggle + shake the mystery box.
      boxRot.value = withDelay(160, withSequence(
        withTiming(-0.07, { duration: 70 }),
        withTiming(0.07, { duration: 70 }),
        withTiming(-0.06, { duration: 70 }),
        withTiming(0.06, { duration: 70 }),
        withTiming(0, { duration: 60 })
      ));
      shakeX.value = withDelay(160, withSequence(
        withTiming(-11, { duration: 55 }),
        withTiming(11, { duration: 55 }),
        withTiming(-9, { duration: 55 }),
        withTiming(9, { duration: 55 }),
        withTiming(-6, { duration: 55 }),
        withTiming(6, { duration: 55 }),
        withTiming(0, { duration: 55 })
      ));

      playSound("chest_open_common").catch(() => {});

      // Pop + flash, then the box shrinks away revealing the prize.
      boxScale.value = withDelay(560, withSequence(
        withSpring(1.28, { damping: 4, stiffness: 220 }),
        withTiming(0.15, { duration: 230 })
      ));
      boxOp.value = withDelay(720, withTiming(0, { duration: 180 }));
      flashOp.value = withDelay(560, withSequence(
        withTiming(1, { duration: 110 }),
        withTiming(0, { duration: 430 })
      ));

      // Reveal at ~780ms.
      ringScale.value = withDelay(780, withSequence(
        withTiming(1.7, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(1.7, { duration: 80 })
      ));
      ringOp.value = withDelay(780, withSequence(
        withTiming(0.85, { duration: 80 }),
        withTiming(0, { duration: 540 })
      ));
      prizeOp.value = withDelay(780, withTiming(1, { duration: 220 }));
      prizeScale.value = withDelay(780, withSpring(1, { damping: 7, stiffness: 150 }));
      tapOp.value = withDelay(1250, withRepeat(
        withSequence(withTiming(1, { duration: 600 }), withTiming(0.4, { duration: 600 })),
        -1, true
      ));

      particles.forEach((p) => {
        p.x.value = 0;
        p.y.value = 0;
        p.opacity.value = 0;
        p.scale.value = 0;
        p.scale.value = withDelay(780 + p.delay, withSpring(1, { damping: 6 }));
        p.opacity.value = withDelay(780 + p.delay, withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(450, withTiming(0, { duration: 350 }))
        ));
        p.x.value = withDelay(780 + p.delay,
          withTiming(Math.cos(p.angle) * p.dist, { duration: 750, easing: Easing.out(Easing.quad) })
        );
        p.y.value = withDelay(780 + p.delay,
          withTiming(Math.sin(p.angle) * p.dist - 30, { duration: 750, easing: Easing.out(Easing.quad) })
        );
      });

      const tmr = setTimeout(() => {
        setPhase("reveal");
        playSound("daily_reward").catch(() => {});
      }, 780);
      return () => clearTimeout(tmr);
    } else {
      bgOp.value = withTiming(0, { duration: 180 });
      tapOp.value = 0;
    }
  }, [visible]);

  function doClose() {
    bgOp.value = withTiming(0, { duration: 220 });
    prizeOp.value = withTiming(0, { duration: 180 });
    setTimeout(onClose, 220);
  }

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOp.value }));
  const boxStyle = useAnimatedStyle(() => ({
    opacity: boxOp.value,
    transform: [
      { translateX: shakeX.value },
      { scale: boxScale.value },
      { rotate: `${boxRot.value}rad` },
    ],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOp.value }));
  const prizeStyle = useAnimatedStyle(() => ({
    opacity: prizeOp.value,
    transform: [{ scale: prizeScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOp.value,
    transform: [{ scale: ringScale.value }],
  }));
  const tapStyle = useAnimatedStyle(() => ({ opacity: tapOp.value }));

  if (!visible) return null;

  const chestName = reward?.kind === "chest" ? i18nT(CHEST_NAME_KEY[reward.chestType], lang) : "";

  return (
    <Animated.View style={[styles.overlay, bgStyle]}>
      <Pressable style={styles.touch} onPress={() => { if (phase === "reveal") doClose(); }}>
        <View style={styles.bgFill} pointerEvents="none" />
        <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

        <Text style={[styles.title, { color: accent, textShadowColor: accent + "88" }]}>
          {i18nT("surpriseGiftTitle", lang)}
        </Text>

        <View style={styles.stage}>
          <Animated.View style={[styles.burstRing, { borderColor: accent }, ringStyle]} pointerEvents="none" />

          {particles.map((p, i) => (
            <ParticleDot key={i} particle={p} />
          ))}

          {/* The mystery box (visible during the opening phase) */}
          <Animated.View style={[styles.boxWrap, boxStyle]} pointerEvents="none">
            <LinearGradient
              colors={[Colors.gold, "#C9961E", "#9A7016"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.box}
            >
              <View style={styles.ribbonV} />
              <View style={styles.ribbonH} />
              <Text style={styles.qmark}>?</Text>
            </LinearGradient>
          </Animated.View>

          {/* The revealed prize */}
          {reward && (
            <Animated.View style={[styles.prizeWrap, prizeStyle]} pointerEvents="none">
              <LinearGradient colors={[accent, accent + "AA"]} style={styles.prizeCircle}>
                {reward.kind === "chest" ? (
                  <ChestVisual type={reward.chestType} size={86} showShadow={false} />
                ) : reward.kind === "fichas" ? (
                  <ChipIcon size={54} color="#06243a" />
                ) : (
                  <CoinIcon size={54} color="#1a0a00" />
                )}
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        {/* Prize label + amount chip */}
        {reward && (
          <Animated.View style={[styles.prizeInfo, prizeStyle]}>
            {reward.kind === "chest" ? (
              <>
                <Text style={styles.prizeName}>{chestName}</Text>
                {reward.queued && (
                  <Text style={styles.queuedNote}>{i18nT("surpriseGiftQueued", lang)}</Text>
                )}
              </>
            ) : (
              <View style={[styles.chip, { backgroundColor: accent + "22", borderColor: accent + "88" }]}>
                {reward.kind === "fichas" ? (
                  <ChipIcon size={20} color={accent} />
                ) : (
                  <CoinIcon size={20} color={accent} />
                )}
                <Text style={[styles.chipVal, { color: accent }]}>
                  +{reward.kind === "fichas" ? reward.fichas : reward.coins}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        <Animated.View style={[styles.tapHint, tapStyle]}>
          <Text style={[styles.tapText, { color: accent + "DD" }]}>{i18nT("chestTapToContinue", lang)}</Text>
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
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 8,
  },
  stage: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  burstRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
  },
  boxWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 118,
    height: 118,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF3C4AA",
    shadowColor: Colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  ribbonV: {
    position: "absolute",
    width: 18,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  ribbonH: {
    position: "absolute",
    height: 18,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  qmark: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 58,
    color: "#1a0a00",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  particle: {
    position: "absolute",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  prizeWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  prizeCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  prizeInfo: {
    marginTop: 10,
    alignItems: "center",
    minHeight: 56,
  },
  prizeName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 19,
    color: "#FFFFFF",
    textAlign: "center",
  },
  queuedNote: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#FFD27F",
    marginTop: 4,
    textAlign: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipVal: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
  },
  tapHint: {
    marginTop: 22,
  },
  tapText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    letterSpacing: 0.8,
  },
});
