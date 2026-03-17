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

type Phase = "idle" | "shaking" | "opening" | "showing" | "done";

export default function ChestOpeningModal({ visible, chestType, reward, onClose }: Props) {
  const config = CHEST_CONFIG[chestType];
  const [phase, setPhase] = useState<Phase>("idle");

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

      shakeX.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      shakeY.value = withSequence(
        withTiming(3, { duration: 90 }),
        withTiming(-3, { duration: 90 }),
        withTiming(2, { duration: 90 }),
        withTiming(0, { duration: 90 })
      );

      glowRadius.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.6, { duration: 300 })
        ), 4, true
      );

      setTimeout(() => startOpening(), 550);
    } else if (phase === "showing") {
      doClose();
    }
  }

  function startOpening() {
    setPhase("opening");
    shakeX.value = withTiming(0, { duration: 100 });
    shakeY.value = withTiming(0, { duration: 100 });

    chestScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 200 }),
      withSpring(0.9, { damping: 6 })
    );

    lidRotate.value = withSequence(
      withDelay(100, withSpring(-35, { damping: 5, stiffness: 100 }))
    );

    flashOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: 80 })),
      withTiming(0, { duration: 400 })
    );

    particles.forEach((p, i) => {
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const dist = 100 + Math.random() * 100;
      p.x.value = 0;
      p.y.value = 0;
      p.opacity.value = 0;
      p.scale.value = 0;

      p.opacity.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(400, withTiming(0, { duration: 300 }))
        )
      );
      p.scale.value = withDelay(300, withSpring(1.2, { damping: 6 }));
      p.x.value = withDelay(300,
        withTiming(Math.cos(angle) * dist, { duration: 700, easing: Easing.out(Easing.quad) })
      );
      p.y.value = withDelay(300,
        withTiming(Math.sin(angle) * dist - 20, { duration: 700, easing: Easing.out(Easing.quad) })
      );
    });

    setTimeout(() => {
      setPhase("showing");
      rewardScale.value = withSpring(1, { damping: 7, stiffness: 150 });
      rewardOpacity.value = withTiming(1, { duration: 200 });
      chestScale.value = withTiming(0.7, { duration: 300 });
    }, 700);
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
      { translateY: interpolate(lidRotate.value, [0, -35], [0, -20], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(glowRadius.value, [0, 1], [0.8, 1.4], Extrapolation.CLAMP) }],
    opacity: interpolate(glowRadius.value, [0, 1], [0.3, 0.7], Extrapolation.CLAMP),
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

        <Animated.View style={[styles.flash, flashStyle]} />

        <View style={styles.container}>
          <Text style={[styles.chestTitle, { color: config.glowColor }]}>
            {config.name}
          </Text>

          <View style={styles.chestArea}>
            <Animated.View style={[styles.glowRing, { borderColor: config.glowColor }, glowStyle]} />

            <Animated.View style={chestStyle}>
              <View style={[styles.chestBody, { borderColor: config.borderColor }]}>
                <LinearGradient
                  colors={[config.color + "CC", config.color + "66"]}
                  style={styles.chestBodyGrad}
                >
                  <Animated.View style={[styles.chestLidArea, lidStyle]}>
                    <LinearGradient
                      colors={[config.glowColor + "BB", config.color + "88"]}
                      style={styles.chestLid}
                    />
                  </Animated.View>

                  <View style={styles.chestLock}>
                    <Ionicons name={chestIcon as any} size={32} color={config.glowColor} />
                  </View>

                  <View style={styles.chestStripe}>
                    <View style={[styles.stripeLine, { backgroundColor: config.glowColor + "88" }]} />
                  </View>
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
            <Ionicons name="logo-bitcoin" size={28} color="#D4AF37" />
          </View>
          <Text style={styles.rewardValue}>{reward.coins}</Text>
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
  },
  chestLock: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
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
