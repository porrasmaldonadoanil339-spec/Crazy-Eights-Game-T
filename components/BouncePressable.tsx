import React from "react";
import { Pressable, PressableProps, Platform, ViewStyle, StyleProp, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { usePressFeedback } from "@/hooks/usePressFeedback";

interface BouncePressableProps extends PressableProps {
  scaleTo?: number;
  children?: React.ReactNode;
  inline?: boolean;
  haptic?: boolean;
  /** When true, plays the unified premium feedback (click SFX + haptic +
   *  microglow overlay) on press. Opt-in to avoid doubling sounds in screens
   *  that already trigger their own SFX (cards, store rows, etc.).
   *  Recommended for main menu / modal action buttons. */
  sound?: boolean;
  /** Color of the microglow overlay when `sound` is true. Defaults to a soft
   *  warm gold that reads on most surfaces. */
  glowColor?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  /** When provided, renders a premium gradient background behind the children.
   *  The button `style` should set `borderRadius` + `overflow: "hidden"` so the
   *  gradient clips to the button shape. */
  gradient?: readonly [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

function tapHaptic() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}

export default function BouncePressable({
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  children,
  disabled,
  inline = false,
  haptic = true,
  sound = false,
  glowColor = "rgba(255, 215, 0, 0.35)",
  wrapperStyle,
  gradient,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  ...rest
}: BouncePressableProps) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Unified premium press feedback (sound + haptic + microglow). When `sound`
  // is false we skip the hook entirely so existing call sites get zero
  // behavioural change; when true the haptic is delegated to the hook so we
  // don't double-fire it alongside `tapHaptic()`.
  const premium = usePressFeedback({
    sound: true,
    haptic,
    glow: true,
    intensity: "premium",
  });

  return (
    <Animated.View style={[aStyle, { alignSelf: inline ? "auto" : "stretch" }, wrapperStyle]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(e) => {
          if (!disabled) {
            scale.value = withSpring(scaleTo, { damping: 15, stiffness: 320, mass: 0.4 });
            if (sound) {
              premium.trigger();
            } else if (haptic) {
              tapHaptic();
            }
          }
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 10, stiffness: 260, mass: 0.4 });
          onPressOut?.(e);
        }}
        style={style}
      >
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={gradientStart}
            end={gradientEnd}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        ) : null}
        {children}
        {sound ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: glowColor, borderRadius: 12 },
              premium.glowStyle,
            ]}
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
