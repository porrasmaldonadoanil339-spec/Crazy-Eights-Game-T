import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  baseOpacity: number;
  duration: number;
  drift: number;
  delay: number;
}

function Particle({ x, y, size, color, baseOpacity, duration, drift, delay }: ParticleProps) {
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-drift, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    tx.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(drift * 0.4, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) }),
          withTiming(-drift * 0.4, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(baseOpacity, { duration: duration * 0.6, easing: Easing.inOut(Easing.sin) }),
          withTiming(baseOpacity * 0.25, { duration: duration * 0.6, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export interface ParticlesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  baseOpacity?: number;
  width?: number;
  height?: number;
  /** Optional fixed seed-ish layout — particles use indexed positions when set. */
  seed?: number;
}

// Soft particles overlay for backgrounds. Animated on the UI thread.
export function Particles({
  count = 14,
  color = "#D4AF37",
  minSize = 2,
  maxSize = 5,
  baseOpacity = 0.35,
  width,
  height,
  seed = 0,
}: ParticlesProps) {
  const W = width ?? SW;
  const H = height ?? SH;

  const particles = useMemo(() => {
    const arr: ParticleProps[] = [];
    for (let i = 0; i < count; i++) {
      const r = (n: number) => {
        const v = Math.sin((i + seed + 1) * (n + 1) * 12.9898) * 43758.5453;
        return v - Math.floor(v);
      };
      const size = minSize + r(1) * (maxSize - minSize);
      arr.push({
        x: r(2) * W,
        y: r(3) * H,
        size,
        color,
        baseOpacity: baseOpacity * (0.6 + r(4) * 0.6),
        duration: 3500 + r(5) * 3500,
        drift: 14 + r(6) * 22,
        delay: Math.floor(r(7) * 1500),
      });
    }
    return arr;
  }, [count, color, minSize, maxSize, baseOpacity, W, H, seed]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}

export default Particles;
