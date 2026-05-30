import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface StarRatingProps {
  /** Number of filled stars. */
  count: number;
  /** Total stars to render. */
  total?: number;
  size?: number;
  /** Filled star color. */
  color?: string;
  /** Empty star color. */
  dimColor?: string;
  gap?: number;
  /** Add a soft glow to filled stars. */
  halo?: boolean;
}

/**
 * Static rating stars — perf-safe (no shared values), suitable for long lists.
 * Renders `total` stars with the first `count` filled.
 */
export function StarRating({
  count,
  total = 4,
  size = 10,
  color = "#D4AF37",
  dimColor = "rgba(255,255,255,0.18)",
  gap = 2,
  halo = true,
}: StarRatingProps) {
  return (
    <View style={{ flexDirection: "row", gap, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < count;
        return (
          <Ionicons
            key={i}
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? color : dimColor}
            style={
              filled && halo
                ? {
                    textShadowColor: color + "AA",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 4,
                  }
                : undefined
            }
          />
        );
      })}
    </View>
  );
}

interface AnimatedStarProps {
  size?: number;
  color?: string;
  /** Stagger delay before the gain pop plays (ms). */
  delay?: number;
}

/**
 * A single star that pops in with a scale spring and a brief gold halo flash —
 * used for key-moment "gain" feedback (level up, rewards). Animated on the UI
 * thread via reanimated.
 */
export function AnimatedStar({ size = 16, color = "#D4AF37", delay = 0 }: AnimatedStarProps) {
  const scale = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.35, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 160 })
      )
    );
    halo.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 160 }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) })
      )
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * 0.8,
    transform: [{ scale: 0.6 + halo.value * 1.4 }],
  }));

  return (
    <View style={{ width: size * 1.7, height: size * 1.7, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
          haloStyle,
        ]}
      />
      <Animated.View style={starStyle}>
        <Ionicons
          name="star"
          size={size}
          color={color}
          style={{
            textShadowColor: color + "AA",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          }}
        />
      </Animated.View>
    </View>
  );
}

export default StarRating;
