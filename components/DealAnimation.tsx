import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { playSound } from "@/lib/sounds";

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_W = 52;
const CARD_H = 76;
const CARD_COUNT = 6;

interface DealCardProps {
  index: number;
  totalCards: number;
  target: "player" | "ai";
  dealIndex: number;
  onDone?: () => void;
  backColors: [string, string, string];
  backAccent: string;
}

function DealCard({ index, totalCards, target, dealIndex, onDone, backColors, backAccent }: DealCardProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = dealIndex * 180;
    const targetX = (index - totalCards / 2) * (CARD_W * 0.7);
    const targetY = target === "player" ? SH * 0.28 : -SH * 0.28;
    const finalRotate = (index - totalCards / 2) * 6;

    setTimeout(() => {
      playSound("card_deal").catch(() => {});
    }, delay);

    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 14 }));
    x.value = withDelay(delay, withSpring(targetX, { damping: 16, stiffness: 120 }));
    y.value = withDelay(delay, withSpring(targetY, { damping: 16, stiffness: 120 }));
    rotate.value = withDelay(delay, withSpring(finalRotate, { damping: 14 }));

    if (onDone) {
      const lastDelay = (totalCards * 2 - 1) * 180 + 400;
      setTimeout(() => {
        runOnJS(onDone)();
      }, lastDelay);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.dealCard, style]}>
      <LinearGradient colors={backColors} style={styles.dealCardInner}>
        <View style={[styles.dealCardCorner, { borderColor: backAccent + "55" }]}>
          <View style={[styles.dealCardDiamond, { backgroundColor: backAccent + "88" }]} />
        </View>
        <View style={[styles.dealCardCenter, { borderColor: backAccent + "33" }]}>
          <View style={[styles.dealCardCenterDot, { backgroundColor: backAccent + "44" }]} />
        </View>
        <View style={[styles.dealCardCornerBR, { borderColor: backAccent + "55" }]}>
          <View style={[styles.dealCardDiamond, { backgroundColor: backAccent + "88" }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

interface ShuffleCardProps {
  index: number;
  onShuffleDone: () => void;
  isLast: boolean;
  backColors: [string, string, string];
  backAccent: string;
}

function ShuffleCard({ index, onShuffleDone, isLast, backColors, backAccent }: ShuffleCardProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotate = useSharedValue((index - CARD_COUNT / 2) * 8);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const startDelay = index * 80;
    const randomX = (Math.random() - 0.5) * 120;
    const randomY = (Math.random() - 0.5) * 80;

    x.value = withDelay(
      startDelay,
      withSequence(
        withTiming(randomX, { duration: 250, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
      )
    );
    y.value = withDelay(
      startDelay,
      withSequence(
        withTiming(randomY, { duration: 250, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
      )
    );
    rotate.value = withDelay(
      startDelay,
      withSequence(
        withTiming((Math.random() - 0.5) * 40, { duration: 250 }),
        withTiming((index - CARD_COUNT / 2) * 5, { duration: 250 })
      )
    );

    if (isLast) {
      setTimeout(() => {
        onShuffleDone();
      }, CARD_COUNT * 80 + 600);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.dealCard, style]}>
      <LinearGradient colors={backColors} style={styles.dealCardInner}>
        <View style={[styles.dealCardCenter, { borderColor: backAccent + "33" }]}>
          <View style={[styles.dealCardCenterDot, { backgroundColor: backAccent + "44" }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

interface DealAnimationProps {
  cardsPerPlayer: number;
  onComplete: () => void;
  backColors?: [string, string, string];
  backAccent?: string;
}

export function DealAnimation({
  cardsPerPlayer,
  onComplete,
  backColors = ["#1E4080", "#0e2248", "#0a1832"],
  backAccent = "#D4AF37",
}: DealAnimationProps) {
  const [phase, setPhase] = React.useState<"shuffle" | "deal" | "done">("shuffle");
  const overlayOpacity = useSharedValue(1);
  const calledRef = useRef(false);

  useEffect(() => {
    playSound("shuffle").catch(() => {});
  }, []);

  const handleShuffleDone = () => {
    setPhase("deal");
  };

  const handleDealDone = () => {
    if (calledRef.current) return;
    calledRef.current = true;
    overlayOpacity.value = withDelay(300, withTiming(0, { duration: 500 }, () => {
      runOnJS(onComplete)();
    }));
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const dealItems: { target: "player" | "ai"; index: number; dealIndex: number }[] = [];
  for (let i = 0; i < cardsPerPlayer; i++) {
    dealItems.push({ target: "ai", index: i, dealIndex: i * 2 });
    dealItems.push({ target: "player", index: i, dealIndex: i * 2 + 1 });
  }

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <View style={styles.center}>
        {phase === "shuffle" &&
          Array.from({ length: CARD_COUNT }).map((_, i) => (
            <ShuffleCard
              key={i}
              index={i}
              isLast={i === CARD_COUNT - 1}
              onShuffleDone={handleShuffleDone}
              backColors={backColors}
              backAccent={backAccent}
            />
          ))}
        {phase === "deal" &&
          dealItems.map((item, i) => (
            <DealCard
              key={`${item.target}-${item.index}`}
              index={item.index}
              totalCards={cardsPerPlayer}
              target={item.target}
              dealIndex={item.dealIndex}
              onDone={i === dealItems.length - 1 ? handleDealDone : undefined}
              backColors={backColors}
              backAccent={backAccent}
            />
          ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: CARD_W,
    height: CARD_H,
  },
  dealCard: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.gold + "66",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  dealCardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  dealCardCorner: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dealCardCornerBR: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "180deg" }],
  },
  dealCardDiamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: "45deg" }],
    borderRadius: 1,
  },
  dealCardCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dealCardCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
  },
});
