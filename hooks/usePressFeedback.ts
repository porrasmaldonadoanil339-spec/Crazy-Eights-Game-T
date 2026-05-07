import { useCallback } from "react";
import { Platform } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { playPremiumClick } from "@/lib/audioManager";

export type PressFeedbackIntensity = "subtle" | "premium" | "heavy";

interface Options {
  intensity?: PressFeedbackIntensity;
  sound?: boolean;
  haptic?: boolean;
  glow?: boolean;
}

// Combined sound + haptic + microglow press feedback. The animated style is
// returned alongside `trigger` so any pressable can wrap a glow-aware view
// without needing its own animation state. Designed to be cheap (one shared
// value, no rerenders) and safe to call from disabled-aware press handlers.
export function usePressFeedback(opts: Options = {}) {
  const {
    intensity = "premium",
    sound = true,
    haptic = true,
    glow = true,
  } = opts;

  const glowValue = useSharedValue(0);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value,
  }));

  const trigger = useCallback(() => {
    if (sound) {
      playPremiumClick().catch(() => {});
    }
    if (haptic && Platform.OS !== "web") {
      const fn =
        intensity === "heavy"
          ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          : intensity === "subtle"
          ? Haptics.selectionAsync()
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fn.catch(() => {});
    }
    if (glow) {
      glowValue.value = withSequence(
        withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 280, easing: Easing.out(Easing.quad) }),
      );
    }
  }, [sound, haptic, glow, intensity, glowValue]);

  return { trigger, glowStyle };
}
