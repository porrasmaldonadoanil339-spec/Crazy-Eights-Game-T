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
  children: React.ReactNode;
}

export default function DiscardBouncer({ cardId, isSpecial = false, children }: Props) {
  const scale = useSharedValue(1);
  const rot = useSharedValue(0);
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
  }, [cardId, isSpecial]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
