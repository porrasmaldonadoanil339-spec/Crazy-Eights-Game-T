import React, { useEffect, useRef, useState } from "react";
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
import { PlayingCard } from "@/components/PlayingCard";
import type { Card } from "@/lib/gameEngine";
import { playSound } from "@/lib/sounds";

const { width: SW, height: SH } = Dimensions.get("window");
const PILE_CARD_W = 52;
const PILE_CARD_H = 76;
const SHUFFLE_COUNT = 6;
const FAN_CARD_W = 62;
const FAN_CARD_H = 90;

// ─── Card back mini-render ─────────────────────────────────────────────────────
function CardBackFace({
  width,
  height,
  backColors,
  backAccent,
}: {
  width: number;
  height: number;
  backColors: [string, string, string];
  backAccent: string;
}) {
  return (
    <LinearGradient
      colors={backColors}
      style={{ width, height, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: backAccent + "55" }}
    >
      <View style={{ width: width * 0.55, height: height * 0.55, borderRadius: 4, borderWidth: 1, borderColor: backAccent + "44", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 10, height: 10, backgroundColor: backAccent + "66", transform: [{ rotate: "45deg" }], borderRadius: 2 }} />
      </View>
    </LinearGradient>
  );
}

// ─── Phase 1: Shuffle ─────────────────────────────────────────────────────────
interface ShuffleCardProps {
  index: number;
  isLast: boolean;
  onShuffleDone: () => void;
  backColors: [string, string, string];
  backAccent: string;
}

function ShuffleCard({ index, isLast, onShuffleDone, backColors, backAccent }: ShuffleCardProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotate = useSharedValue((index - SHUFFLE_COUNT / 2) * 8);

  useEffect(() => {
    const startDelay = index * 80;
    const randomX = (Math.random() - 0.5) * 120;
    const randomY = (Math.random() - 0.5) * 80;

    x.value = withDelay(startDelay, withSequence(
      withTiming(randomX, { duration: 250, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
    ));
    y.value = withDelay(startDelay, withSequence(
      withTiming(randomY, { duration: 250, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
    ));
    rotate.value = withDelay(startDelay, withSequence(
      withTiming((Math.random() - 0.5) * 40, { duration: 250 }),
      withTiming((index - SHUFFLE_COUNT / 2) * 5, { duration: 250 })
    ));

    if (isLast) {
      setTimeout(() => onShuffleDone(), SHUFFLE_COUNT * 80 + 600);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.pileCard, style]}>
      <CardBackFace width={PILE_CARD_W} height={PILE_CARD_H} backColors={backColors} backAccent={backAccent} />
    </Animated.View>
  );
}

// ─── Phase 2: Deal (face-down fly-out) ───────────────────────────────────────
interface DealCardProps {
  index: number;
  totalCards: number;
  target: "player" | "ai";
  dealIndex: number;
  backColors: [string, string, string];
  backAccent: string;
}

function DealCard({ index, totalCards, target, dealIndex, backColors, backAccent }: DealCardProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = dealIndex * 160;
    const targetX = (index - totalCards / 2) * (PILE_CARD_W * 0.75);
    const targetY = target === "player" ? SH * 0.25 : -SH * 0.25;
    const finalRotate = (index - totalCards / 2) * 5;

    setTimeout(() => { playSound("card_deal").catch(() => {}); }, delay);

    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 14 }));
    x.value = withDelay(delay, withSpring(targetX, { damping: 16, stiffness: 120 }));
    y.value = withDelay(delay, withSpring(targetY, { damping: 16, stiffness: 120 }));
    rotate.value = withDelay(delay, withSpring(finalRotate, { damping: 14 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.pileCard, style]}>
      <CardBackFace width={PILE_CARD_W} height={PILE_CARD_H} backColors={backColors} backAccent={backAccent} />
    </Animated.View>
  );
}

// ─── Phase 3: Flip reveal ────────────────────────────────────────────────────
interface FlipCardProps {
  card: Card;
  index: number;
  totalCards: number;
  flipDelay: number;
  backColors: [string, string, string];
  backAccent: string;
  onLastFlipped?: () => void;
}

function FlipCard({ card, index, totalCards, flipDelay, backColors, backAccent, onLastFlipped }: FlipCardProps) {
  const scaleX = useSharedValue(1);
  const [showFront, setShowFront] = useState(false);
  const liftY = useSharedValue(0);
  const didFlip = useRef(false);

  const N = totalCards;
  const MAX_ANGLE = Math.min(24, N * 2.8);
  const xStep = N <= 4 ? FAN_CARD_W * 0.72 : N <= 7 ? FAN_CARD_W * 0.60 : N <= 10 ? FAN_CARD_W * 0.48 : FAN_CARD_W * 0.38;
  const totalWidth = FAN_CARD_W + (N - 1) * xStep;
  const startX = Math.max(8, (SW - totalWidth) / 2);
  const centerI = (N - 1) / 2;
  const t = N <= 1 ? 0 : (index - centerI) / Math.max(1, centerI);
  const angle = t * MAX_ANGLE;
  const arcY = Math.abs(t) * 16;
  const x = startX + index * xStep;

  useEffect(() => {
    const HALF = 140;
    liftY.value = withDelay(flipDelay, withSpring(-12, { damping: 12 }));
    scaleX.value = withDelay(flipDelay, withSequence(
      withTiming(0, { duration: HALF, easing: Easing.in(Easing.quad) }),
      withTiming(1, { duration: HALF, easing: Easing.out(Easing.quad) })
    ));
    setTimeout(() => {
      setShowFront(true);
      if (!didFlip.current) {
        didFlip.current = true;
        playSound("card_flip").catch(() => {});
        if (onLastFlipped) {
          setTimeout(onLastFlipped, HALF + 50);
        }
      }
    }, flipDelay + HALF);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }, { translateY: liftY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          bottom: arcY,
          zIndex: index + 1,
          transform: [{ rotate: `${angle}deg` }],
        },
        animStyle,
      ]}
    >
      {showFront ? (
        <PlayingCard card={card} size="md" />
      ) : (
        <CardBackFace width={FAN_CARD_W} height={FAN_CARD_H} backColors={backColors} backAccent={backAccent} />
      )}
    </Animated.View>
  );
}

// ─── AI placeholder (face-down cards at top) ──────────────────────────────────
function AiHandPlaceholder({
  count,
  backColors,
  backAccent,
}: {
  count: number;
  backColors: [string, string, string];
  backAccent: string;
}) {
  const N = Math.min(count, 12);
  const W = 38;
  const H = 55;
  const OVERLAP = W * 0.65;
  const totalWidth = W + (N - 1) * (W - OVERLAP);
  const startX = (SW - totalWidth) / 2;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: H + 20, alignItems: "center" }}>
      <View style={{ width: totalWidth, height: H + 20, position: "relative" }}>
        {Array.from({ length: N }).map((_, i) => {
          const centerI = (N - 1) / 2;
          const t = N <= 1 ? 0 : (i - centerI) / Math.max(1, centerI);
          const angle = t * 15;
          const arcY = Math.abs(t) * 6;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: i * (W - OVERLAP),
                top: arcY + 10,
                zIndex: i + 1,
                transform: [{ rotate: `${angle}deg` }],
              }}
            >
              <CardBackFace width={W} height={H} backColors={backColors} backAccent={backAccent} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Flip reveal phase wrapper ────────────────────────────────────────────────
interface FlipPhaseProps {
  playerCards: Card[];
  cardsPerPlayer: number;
  backColors: [string, string, string];
  backAccent: string;
  onDone: () => void;
}

function FlipPhase({ playerCards, cardsPerPlayer, backColors, backAccent, onDone }: FlipPhaseProps) {
  const STAGGER = 120;
  const N = playerCards.length;
  const doneCalled = useRef(false);

  const handleLastFlip = () => {
    if (doneCalled.current) return;
    doneCalled.current = true;
    setTimeout(onDone, 900);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* AI cards face-down at top */}
      <AiHandPlaceholder count={cardsPerPlayer} backColors={backColors} backAccent={backAccent} />

      {/* Player cards fan at bottom - flip reveal */}
      <View style={{ position: "absolute", bottom: 20, left: 0, right: 0, height: FAN_CARD_H + 40 }}>
        {playerCards.map((card, i) => (
          <FlipCard
            key={card.id}
            card={card}
            index={i}
            totalCards={N}
            flipDelay={i * STAGGER}
            backColors={backColors}
            backAccent={backAccent}
            onLastFlipped={i === N - 1 ? handleLastFlip : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main DealAnimation export ────────────────────────────────────────────────
type Phase = "shuffle" | "deal" | "flip" | "done";

interface DealAnimationProps {
  cardsPerPlayer: number;
  playerCards: Card[];
  onComplete: () => void;
  backColors?: [string, string, string];
  backAccent?: string;
}

export function DealAnimation({
  cardsPerPlayer,
  playerCards,
  onComplete,
  backColors = ["#1E4080", "#0e2248", "#0a1832"],
  backAccent = Colors.gold,
}: DealAnimationProps) {
  const [phase, setPhase] = useState<Phase>("shuffle");
  const overlayOpacity = useSharedValue(1);
  const calledRef = useRef(false);

  useEffect(() => {
    playSound("shuffle").catch(() => {});
  }, []);

  const handleShuffleDone = () => setPhase("deal");

  const handleDealDone = () => setPhase("flip");

  const handleFlipDone = () => {
    if (calledRef.current) return;
    calledRef.current = true;
    overlayOpacity.value = withTiming(0, { duration: 500 }, () => {
      runOnJS(onComplete)();
    });
  };

  // Compute total deal time and auto-advance
  useEffect(() => {
    if (phase !== "deal") return;
    const totalDealMs = (cardsPerPlayer * 2 - 1) * 160 + 600;
    const timer = setTimeout(handleDealDone, totalDealMs);
    return () => clearTimeout(timer);
  }, [phase]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  const dealItems: { target: "player" | "ai"; index: number; dealIndex: number }[] = [];
  for (let i = 0; i < cardsPerPlayer; i++) {
    dealItems.push({ target: "ai", index: i, dealIndex: i * 2 });
    dealItems.push({ target: "player", index: i, dealIndex: i * 2 + 1 });
  }

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <View style={styles.center}>
        {phase === "shuffle" &&
          Array.from({ length: SHUFFLE_COUNT }).map((_, i) => (
            <ShuffleCard
              key={i}
              index={i}
              isLast={i === SHUFFLE_COUNT - 1}
              onShuffleDone={handleShuffleDone}
              backColors={backColors}
              backAccent={backAccent}
            />
          ))}
        {phase === "deal" &&
          dealItems.map((item) => (
            <DealCard
              key={`${item.target}-${item.index}`}
              index={item.index}
              totalCards={cardsPerPlayer}
              target={item.target}
              dealIndex={item.dealIndex}
              backColors={backColors}
              backAccent={backAccent}
            />
          ))}
      </View>

      {phase === "flip" && (
        <FlipPhase
          playerCards={playerCards}
          cardsPerPlayer={cardsPerPlayer}
          backColors={backColors}
          backAccent={backAccent}
          onDone={handleFlipDone}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.92)",
    zIndex: 999,
  },
  center: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -PILE_CARD_W / 2 }, { translateY: -PILE_CARD_H / 2 }],
  },
  pileCard: {
    position: "absolute",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
