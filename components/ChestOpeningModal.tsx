import { CoinIcon } from "@/components/CoinIcon";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CHEST_CONFIG, ChestType, ChestReward } from "@/lib/chestSystem";

const { width: W, height: H } = Dimensions.get("window");

interface Props {
  visible: boolean;
  chestType: ChestType;
  reward: ChestReward | null;
  onClose: () => void;
}

interface Particle {
  x: SharedValue<number>;
  y: SharedValue<number>;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
  color: string;
}

const PARTICLE_COLORS = [
  "#FFD700", "#FFA500", "#FF6B6B", "#A855F7",
  "#4A9AE8", "#4CAF50", "#FF69B4", "#00BCD4",
];

const NUM_PARTICLES = 18;

const RARITY_CONFIG = {
  common:    { shakeAmp: 7,  scalePeak: 1.25, flashDur: 80,  flashOut: 350, particleDist: 100, scaleDown: 0.75, flashColor: "#FFFFFF", glowPulses: 3, lidAngle: -28 },
  rare:      { shakeAmp: 11, scalePeak: 1.40, flashDur: 100, flashOut: 420, particleDist: 130, scaleDown: 0.72, flashColor: "#88CCFF", glowPulses: 4, lidAngle: -35 },
  epic:      { shakeAmp: 15, scalePeak: 1.60, flashDur: 130, flashOut: 500, particleDist: 160, scaleDown: 0.68, flashColor: "#CC88FF", glowPulses: 5, lidAngle: -42 },
  legendary: { shakeAmp: 20, scalePeak: 1.90, flashDur: 180, flashOut: 600, particleDist: 200, scaleDown: 0.65, flashColor: "#FFE566", glowPulses: 7, lidAngle: -50 },
};

type Phase = "idle" | "shaking" | "opening" | "showing" | "done";

export default function ChestOpeningModal({ visible, chestType, reward, onClose }: Props) {
  const config = CHEST_CONFIG[chestType];
  const rc = RARITY_CONFIG[chestType] ?? RARITY_CONFIG.common;
  const [phase, setPhase] = useState<Phase>("idle");
  const [flashColor, setFlashColor] = useState("#FFFFFF");

  const bgOpacity = useSharedValue(0);
  const chestScale = useSharedValue(0.5);
  const chestOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const lidRotate = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const rewardScale = useSharedValue(0);
  const rewardOpacity = useSharedValue(0);
  const glowRadius = useSharedValue(0);
  const tapHintOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  const particles = useRef<Particle[]>(
    Array.from({ length: NUM_PARTICLES }, () => ({
      x: useSharedValue(0),
      y: useSharedValue(0),
      opacity: useSharedValue(0),
      scale: useSharedValue(0),
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      setPhase("idle");
      bgOpacity.value = withTiming(1, { duration: 300 });
      chestScale.value = withSpring(1, { damping: 8, stiffness: 120 });
      chestOpacity.value = withTiming(1, { duration: 300 });
      tapHintOpacity.value = withDelay(800, withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ), -1, true
      ));
    } else {
      bgOpacity.value = withTiming(0, { duration: 200 });
      chestOpacity.value = withTiming(0, { duration: 200 });
      rewardOpacity.value = withTiming(0, { duration: 200 });
      tapHintOpacity.value = withTiming(0, { duration: 200 });
      setPhase("idle");
    }
  }, [visible]);

  function handleTap() {
    if (phase === "idle") {
      setPhase("shaking");
      tapHintOpacity.value = withTiming(0, { duration: 200 });
      const a = rc.shakeAmp;
      const a2 = Math.round(a * 0.8);
      const a3 = Math.round(a * 0.6);

      shakeX.value = withSequence(
        withTiming(-a, { duration: 55 }),
        withTiming(a, { duration: 55 }),
        withTiming(-a2, { duration: 55 }),
        withTiming(a2, { duration: 55 }),
        withTiming(-a3, { duration: 55 }),
        withTiming(a3, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
      shakeY.value = withSequence(
        withTiming(4, { duration: 85 }),
        withTiming(-4, { duration: 85 }),
        withTiming(2, { duration: 85 }),
        withTiming(0, { duration: 85 })
      );

      glowRadius.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280 }),
          withTiming(0.5, { duration: 280 })
        ), rc.glowPulses, true
      );

      setTimeout(() => startOpening(), 550);
    } else if (phase === "showing") {
      doClose();
    }
  }

  function startOpening() {
    setPhase("opening");
    setFlashColor(rc.flashColor);
    shakeX.value = withTiming(0, { duration: 100 });
    shakeY.value = withTiming(0, { duration: 100 });

    chestScale.value = withSequence(
      withSpring(rc.scalePeak, { damping: 3, stiffness: 220 }),
      withSpring(rc.scaleDown, { damping: 6 })
    );

    lidRotate.value = withSequence(
      withDelay(100, withSpring(rc.lidAngle, { damping: 5, stiffness: 100 }))
    );

    flashOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: rc.flashDur })),
      withTiming(0, { duration: rc.flashOut })
    );

    if (chestType === "legendary") {
      flashOpacity.value = withSequence(
        withDelay(300, withTiming(1, { duration: 120 })),
        withTiming(0, { duration: 200 }),
        withDelay(200, withTiming(0.7, { duration: 80 })),
        withTiming(0, { duration: 400 })
      );
    }

    ringScale.value = withDelay(300,
      withSequence(withTiming(3, { duration: 600, easing: Easing.out(Easing.quad) }), withTiming(3, { duration: 100 }))
    );
    ringOpacity.value = withDelay(300,
      withSequence(withTiming(0.9, { duration: 80 }), withTiming(0, { duration: 500 }))
    );

    particles.forEach((p, i) => {
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const spread = chestType === "legendary" ? 60 : chestType === "epic" ? 45 : chestType === "rare" ? 35 : 25;
      const dist = rc.particleDist + Math.random() * spread;
      p.x.value = 0;
      p.y.value = 0;
      p.opacity.value = 0;
      p.scale.value = 0;

      const pScale = chestType === "legendary" ? 1.8 : chestType === "epic" ? 1.5 : 1.2;
      p.opacity.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(350, withTiming(0, { duration: 350 }))
        )
      );
      p.scale.value = withDelay(300, withSpring(pScale, { damping: 5 }));
      p.x.value = withDelay(300,
        withTiming(Math.cos(angle) * dist, { duration: 700, easing: Easing.out(Easing.quad) })
      );
      p.y.value = withDelay(300,
        withTiming(Math.sin(angle) * dist - 25, { duration: 700, easing: Easing.out(Easing.quad) })
      );
    });

    const openDelay = chestType === "legendary" ? 800 : 700;
    setTimeout(() => {
      setPhase("showing");
      rewardScale.value = withSpring(1, { damping: 7, stiffness: 150 });
      rewardOpacity.value = withTiming(1, { duration: 200 });
      chestScale.value = withTiming(rc.scaleDown * 0.9, { duration: 300 });
    }, openDelay);
  }

  function doClose() {
    bgOpacity.value = withTiming(0, { duration: 300 });
    rewardOpacity.value = withTiming(0, { duration: 200 });
    chestOpacity.value = withTiming(0, { duration: 200 });
    setPhase("done");
    setTimeout(onClose, 300);
  }

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const chestStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: chestScale.value },
      { translateX: shakeX.value },
      { translateY: shakeY.value },
    ],
    opacity: chestOpacity.value,
  }));

  const lidStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${lidRotate.value}deg` },
      { translateY: interpolate(lidRotate.value, [0, -50], [0, -24], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(glowRadius.value, [0, 1], [0.7, 1.5], Extrapolation.CLAMP) }],
    opacity: interpolate(glowRadius.value, [0, 1], [0.2, 0.8], Extrapolation.CLAMP),
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const rewardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
    opacity: rewardOpacity.value,
  }));

  const tapStyle = useAnimatedStyle(() => ({
    opacity: tapHintOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  if (!visible) return null;

  const chestIcon = chestType === "legendary" ? "star" :
    chestType === "epic" ? "diamond" :
    chestType === "rare" ? "cube-outline" : "cube";

  return (
    <Animated.View style={[styles.overlay, bgStyle]}>
      <TouchableOpacity style={styles.touchArea} activeOpacity={1} onPress={handleTap}>
        <LinearGradient
          colors={[...config.bgColors]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[styles.flash, flashStyle, { backgroundColor: flashColor }]} />

        <View style={styles.container}>
          <Text style={[styles.chestTitle, { color: config.glowColor }]}>
            {config.name}
          </Text>

          <View style={styles.chestArea}>
            <Animated.View style={[styles.glowRing, { borderColor: config.glowColor }, glowStyle]} />
            <Animated.View style={[styles.burstRing, { borderColor: config.glowColor }, ringStyle]} />

            <Animated.View style={chestStyle}>
              <View style={[styles.chestBody, { borderColor: config.borderColor }]}>
                <LinearGradient
                  colors={[config.color + "DD", config.color + "88", config.color + "55"]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={styles.chestBodyGrad}
                >
                  {/* Wood plank lines on body */}
                  <View style={[styles.plankLine, { top: 52, backgroundColor: "rgba(0,0,0,0.28)" }]} />
                  <View style={[styles.plankLine, { top: 78, backgroundColor: "rgba(0,0,0,0.22)" }]} />
                  <View style={[styles.plankLine, { top: 96, backgroundColor: "rgba(0,0,0,0.18)" }]} />
                  {/* Vertical metal bands */}
                  <View style={[styles.metalBand, { left: 18, backgroundColor: config.glowColor + "55" }]} />
                  <View style={[styles.metalBand, { right: 18, backgroundColor: config.glowColor + "55" }]} />

                  <Animated.View style={[styles.chestLidArea, lidStyle]}>
                    <LinearGradient
                      colors={[config.glowColor + "DD", config.color + "BB", config.color + "88"]}
                      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      style={styles.chestLid}
                    >
                      {/* Lid wood detail */}
                      <View style={[styles.lidEdge, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
                      {/* Hinges */}
                      <View style={[styles.hinge, { left: 12, backgroundColor: config.glowColor }]} />
                      <View style={[styles.hinge, { right: 12, backgroundColor: config.glowColor }]} />
                    </LinearGradient>
                  </Animated.View>

                  {/* Lock plate with gem */}
                  <View style={[styles.chestLock, { backgroundColor: "rgba(0,0,0,0.45)", borderColor: config.glowColor + "AA" }]}>
                    <LinearGradient
                      colors={[config.glowColor, config.glowColor + "CC", config.color]}
                      style={styles.lockGem}
                    >
                      <View style={styles.lockGemHighlight} />
                    </LinearGradient>
                    <View style={[styles.lockKeyhole, { backgroundColor: "rgba(0,0,0,0.55)" }]} />
                  </View>

                  <View style={styles.chestStripe}>
                    <View style={[styles.stripeLine, { backgroundColor: config.glowColor + "AA" }]} />
                  </View>
                  {/* Bottom corner studs */}
                  <View style={[styles.stud, { bottom: 8, left: 8, backgroundColor: config.glowColor + "BB" }]} />
                  <View style={[styles.stud, { bottom: 8, right: 8, backgroundColor: config.glowColor + "BB" }]} />
                </LinearGradient>
              </View>
            </Animated.View>

            {particles.map((p, i) => (
              <ParticleView key={i} particle={p} />
            ))}
          </View>

          {phase === "showing" && reward && (
            <Animated.View style={[styles.rewardBox, rewardStyle]}>
              <RewardDisplay reward={reward} config={config} chestType={chestType} />
            </Animated.View>
          )}

          <Animated.View style={[styles.tapHint, tapStyle]}>
            {phase !== "showing" ? (
              <Text style={[styles.tapText, { color: config.glowColor + "CC" }]}>
                Toca para abrir
              </Text>
            ) : (
              <Text style={[styles.tapText, { color: config.glowColor + "CC" }]}>
                Toca para continuar
              </Text>
            )}
          </Animated.View>

          {phase === "showing" && (
            <Animated.View style={[styles.tapHint, rewardStyle]}>
              <Text style={[styles.tapText, { color: config.glowColor + "CC" }]}>
                Toca para continuar
              </Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ParticleView({ particle }: { particle: Particle }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.x.value },
      { translateY: particle.y.value },
      { scale: particle.scale.value },
    ],
    opacity: particle.opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: particle.color },
        style,
      ]}
    />
  );
}

function RewardDisplay({ reward, config, chestType }: {
  reward: ChestReward;
  config: (typeof CHEST_CONFIG)[ChestType];
  chestType: ChestType;
}) {
  return (
    <View style={styles.rewardInner}>
      <Text style={[styles.rewTitle, { color: config.glowColor }]}>¡Recompensas!</Text>

      <View style={styles.rewardRow}>
        <View style={styles.rewardItem}>
          <View style={[styles.rewardBadge, { backgroundColor: "#D4AF37" + "22", borderColor: "#D4AF37" }]}>
            <CoinIcon size={28} color="#D4AF37" />
          </View>
          <Text style={styles.rewardValue}>+{reward.coins}</Text>
          <Text style={styles.rewardLabel}>Monedas</Text>
        </View>

        <View style={styles.rewardItem}>
          <View style={[styles.rewardBadge, { backgroundColor: "#4A9AE8" + "22", borderColor: "#4A9AE8" }]}>
            <Ionicons name="flash" size={28} color="#4A9AE8" />
          </View>
          <Text style={styles.rewardValue}>{reward.xp}</Text>
          <Text style={styles.rewardLabel}>XP</Text>
        </View>

        {reward.item && (
          <View style={styles.rewardItem}>
            <View style={[
              styles.rewardBadge,
              {
                backgroundColor: config.color + "33",
                borderColor: config.glowColor,
              }
            ]}>
              <Ionicons
                name={(reward.item.preview ?? "gift") as any}
                size={26}
                color={reward.item.previewColor ?? config.glowColor}
              />
            </View>
            <Text style={[styles.rewardValue, { fontSize: 10 }]} numberOfLines={1}>
              {reward.item.name}
            </Text>
            <Text style={[styles.rewardLabel, { color: config.glowColor }]}>
              {reward.item.rarity === "legendary" ? "✦ Legendario" :
               reward.item.rarity === "epic" ? "Épico" :
               reward.item.rarity === "rare" ? "Raro" : "Común"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  touchArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  container: {
    width: W,
    height: H,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  chestTitle: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  chestArea: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  burstRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    backgroundColor: "transparent",
  },
  chestBody: {
    width: 140,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  chestBodyGrad: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  chestLidArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    transformOrigin: "top",
  },
  chestLid: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  lidEdge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  hinge: {
    position: "absolute",
    top: 4,
    width: 8,
    height: 6,
    borderRadius: 2,
  },
  plankLine: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 1.5,
    borderRadius: 1,
  },
  metalBand: {
    position: "absolute",
    top: 42,
    bottom: 4,
    width: 4,
    borderRadius: 2,
  },
  stud: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chestLock: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  lockGem: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  lockGemHighlight: {
    position: "absolute",
    top: 4,
    left: 6,
    width: 6,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  lockKeyhole: {
    position: "absolute",
    bottom: 6,
    width: 5,
    height: 7,
    borderRadius: 1,
  },
  chestStripe: {
    position: "absolute",
    bottom: 16,
    left: 8,
    right: 8,
  },
  stripeLine: {
    height: 3,
    borderRadius: 2,
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rewardBox: {
    width: W * 0.85,
  },
  rewardInner: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  rewTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
  },
  rewardRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  rewardItem: {
    alignItems: "center",
    gap: 6,
    minWidth: 70,
  },
  rewardBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  rewardValue: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },
  rewardLabel: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  tapHint: {
    marginTop: 8,
  },
  tapText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    letterSpacing: 0.5,
  },
});
