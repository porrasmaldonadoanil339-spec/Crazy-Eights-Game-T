import React, { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";

interface Props {
  cardId: string | undefined;
  isSpecial?: boolean;
  // Optional suit/special tint for the impact glow ring rendered behind the
  // card on each new discard. Pass undefined to disable the glow.
  glowColor?: string;
  children: React.ReactNode;
}

export default function DiscardBouncer({ cardId, isSpecial = false, glowColor, children }: Props) {
  const scale = useSharedValue(1);
  const rot = useSharedValue(0);
  const glowOp = useSharedValue(0);
  const lastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!cardId || cardId === lastIdRef.current) return;
    lastIdRef.current = cardId;
    scale.value = withSequence(
      withTiming(isSpecial ? 1.32 : 1.18, { duration: 90 }),
      withSpring(1, { damping: 6, stiffness: 180 }),
    );
    const amt = isSpecial ? 6 : 3.5;
    const dir = Math.random() > 0.5 ? 1 : -1;
    rot.value = withSequence(
      withTiming(amt * dir, { duration: 90 }),
      withSpring(0, { damping: 8, stiffness: 160 }),
    );
    if (glowColor) {
      glowOp.value = withSequence(
        withTiming(isSpecial ? 1 : 0.85, { duration: 80 }),
        withTiming(0, { duration: isSpecial ? 480 : 340 }),
      );
    }
  }, [cardId, isSpecial, glowColor]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    transform: [{ scale: 1 + glowOp.value * 0.25 }],
  }));

  return (
    <Animated.View style={[style, { position: "relative" }]}>
      {glowColor && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: -10, left: -10, right: -10, bottom: -10,
              borderRadius: 18,
              backgroundColor: glowColor,
              shadowColor: glowColor,
              shadowOpacity: 0.95,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
              elevation: 0,
              zIndex: -1,
            },
            glowStyle,
          ]}
        />
      )}
      {children}
    </Animated.View>
  );
}
