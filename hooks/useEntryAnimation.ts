import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

interface Options {
  delay?: number;
  duration?: number;
  fromScale?: number;
  fromTranslateY?: number;
  spring?: boolean;
}

export function useEntryAnimation(opts: Options = {}) {
  const {
    delay = 0,
    duration = 360,
    fromScale = 0.92,
    fromTranslateY = 8,
    spring = false,
  } = opts;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (spring) {
      progress.value = withDelay(
        delay,
        withSpring(1, { damping: 14, stiffness: 180, mass: 0.6 })
      );
    } else {
      progress.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );
    }
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p,
      transform: [
        { scale: fromScale + (1 - fromScale) * p },
        { translateY: fromTranslateY * (1 - p) },
      ],
    };
  });

  return style;
}
