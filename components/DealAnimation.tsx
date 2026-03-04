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
import type { Card } from "@/lib/gameEngine";
import { playSound } from "@/lib/sounds";
import { PlayingCard } from "@/components/PlayingCard";

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_W = 52;
const CARD_H = 76;
const FAN_CARD_W = 64;
const FAN_CARD_H = 92;
const DECK_SIZE = 10;
const CX = SW / 2;
const CY = SH / 2;

// ─── Card back mini render ─────────────────────────────────────────────────────
function CardBack({
  width = CARD_W, height = CARD_H,
  backColors, backAccent,
}: {
  width?: number; height?: number;
  backColors: [string, string, string]; backAccent: string;
}) {
  return (
    <LinearGradient
      colors={backColors}
      style={{
        width, height, borderRadius: 8,
        alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: backAccent + "44",
      }}
    >
      <LinearGradient
        colors={[backAccent + "22", "transparent"]}
        style={{ width: width * 0.55, height: height * 0.55, borderRadius: 5,
          borderWidth: 1, borderColor: backAccent + "33",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <View style={{ width: 8, height: 8, backgroundColor: backAccent + "88", borderRadius: 2, transform: [{ rotate: "45deg" }] }} />
      </LinearGradient>
    </LinearGradient>
  );
}

// ─── Phase 1: Riffle Shuffle ───────────────────────────────────────────────────
//
// Shows a deck, splits into two halves (L/R), then riffles them together 2 times.
//
interface RiffleCardProps {
  index: number;
  half: "left" | "right";
  passIndex: number;
  totalPasses: number;
  onLastDone?: () => void;
  backColors: [string, string, string];
  backAccent: string;
}

const HALF = 5; // cards per half
const RIFFLE_PASSES = 2;

function RiffleCard({ index, half, passIndex, totalPasses, onLastDone, backColors, backAccent }: RiffleCardProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(index * -1.5); // stacked offset
  const rotate = useSharedValue(0);
  const zBase = index;

  const isLeft = half === "left";
  const spreadX = isLeft ? -70 : 70;
  const spreadRotate = isLeft ? -12 : 12;

  useEffect(() => {
    const passDelay = passIndex * 900;
    const cardDelay = passDelay + index * 30;

    // Spread apart
    x.value = withDelay(cardDelay, withTiming(spreadX, { duration: 260, easing: Easing.out(Easing.quad) }));
    rotate.value = withDelay(cardDelay, withTiming(spreadRotate, { duration: 260 }));

    // Riffle back together — each card from alternating halves
    const riffleDelay = passDelay + 380 + index * 55;
    x.value = withDelay(riffleDelay,
      withSequence(
        withTiming(spreadX * 0.3, { duration: 180, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 200, easing: Easing.out(Easing.back(1.2)) })
      )
    );
    rotate.value = withDelay(riffleDelay,
      withSequence(
        withTiming(spreadRotate * 0.4, { duration: 180 }),
        withTiming(0, { duration: 200 })
      )
    );

    // Notify when last card of last pass is done
    if (onLastDone && passIndex === totalPasses - 1 && index === HALF - 1) {
      const doneDelay = passDelay + 380 + (HALF - 1) * 55 + 380;
      setTimeout(() => onLastDone(), doneDelay);
    }

    // Play shuffle sound at riffle point
    setTimeout(() => { playSound("shuffle").catch(() => {}); }, passDelay + 350);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.deckCard, style]}>
      <CardBack backColors={backColors} backAccent={backAccent} />
    </Animated.View>
  );
}

function ShufflePhase({
  backColors, backAccent, onDone
}: {
  backColors: [string, string, string]; backAccent: string; onDone: () => void;
}) {
  return (
    <View style={styles.shuffleCenter}>
      {/* Right half (rendered first, below) */}
      {Array.from({ length: HALF }).map((_, i) => (
        Array.from({ length: RIFFLE_PASSES }).map((_, p) => (
          <RiffleCard
            key={`r-${i}-${p}`}
            index={i}
            half="right"
            passIndex={p}
            totalPasses={RIFFLE_PASSES}
            backColors={backColors}
            backAccent={backAccent}
          />
        ))
      ))}
      {/* Left half (rendered last, on top) */}
      {Array.from({ length: HALF }).map((_, i) => (
        Array.from({ length: RIFFLE_PASSES }).map((_, p) => (
          <RiffleCard
            key={`l-${i}-${p}`}
            index={i}
            half="left"
            passIndex={p}
            totalPasses={RIFFLE_PASSES}
            onLastDone={i === HALF - 1 && p === RIFFLE_PASSES - 1 ? onDone : undefined}
            backColors={backColors}
            backAccent={backAccent}
          />
        ))
      ))}
    </View>
  );
}

// ─── Phase 2: Deal ───────────────────────────────────────────────────────────
function DealCard({ index, totalCards, target, dealIndex, backColors, backAccent }: {
  index: number; totalCards: number; target: "player" | "ai";
  dealIndex: number; backColors: [string, string, string]; backAccent: string;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = dealIndex * 140;
    const spreadFactor = Math.min(CARD_W * 0.68, (SW * 0.75) / Math.max(totalCards, 1));
    const targetX = (index - (totalCards - 1) / 2) * spreadFactor;
    const targetY = target === "player" ? SH * 0.28 : -SH * 0.28;
    const finalRotate = (index - (totalCards - 1) / 2) * 4;

    setTimeout(() => { playSound("card_deal").catch(() => {}); }, delay);

    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 130 }));
    x.value = withDelay(delay, withSpring(targetX, { damping: 15, stiffness: 110 }));
    y.value = withDelay(delay, withSpring(targetY, { damping: 15, stiffness: 110 }));
    rotate.value = withDelay(delay, withSpring(finalRotate, { damping: 12 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value }, { translateY: y.value },
      { rotate: `${rotate.value}deg` }, { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.deckCard, style]}>
      <CardBack backColors={backColors} backAccent={backAccent} />
    </Animated.View>
  );
}

// ─── Phase 3: Flip reveal ─────────────────────────────────────────────────────
function FlipCard({ card, index, totalCards, flipDelay, backColors, backAccent, onLastFlipped }: {
  card: Card; index: number; totalCards: number; flipDelay: number;
  backColors: [string, string, string]; backAccent: string; onLastFlipped?: () => void;
}) {
  const scaleX = useSharedValue(1);
  const [showFront, setShowFront] = useState(false);
  const liftY = useSharedValue(0);
  const didFlip = useRef(false);

  const N = totalCards;
  const MAX_ANGLE = Math.min(22, N * 2.5);
  const xStep = N <= 4 ? FAN_CARD_W * 0.78 : N <= 7 ? FAN_CARD_W * 0.65 : N <= 10 ? FAN_CARD_W * 0.52 : FAN_CARD_W * 0.40;
  const totalWidth = FAN_CARD_W + (N - 1) * xStep;
  const startX = Math.max(12, (SW - totalWidth) / 2);
  const centerI = (N - 1) / 2;
  const t = N <= 1 ? 0 : (index - centerI) / Math.max(1, centerI);
  const angle = t * MAX_ANGLE;
  const arcY = Math.abs(t) * 14;
  const x = startX + index * xStep;

  useEffect(() => {
    const HALF_FLIP = 130;
    liftY.value = withDelay(flipDelay, withSpring(-14, { damping: 11 }));
    scaleX.value = withDelay(flipDelay, withSequence(
      withTiming(0, { duration: HALF_FLIP, easing: Easing.in(Easing.quad) }),
      withTiming(1, { duration: HALF_FLIP, easing: Easing.out(Easing.quad) })
    ));
    setTimeout(() => {
      setShowFront(true);
      if (!didFlip.current) {
        didFlip.current = true;
        playSound("card_flip").catch(() => {});
        if (onLastFlipped) setTimeout(onLastFlipped, HALF_FLIP + 50);
      }
    }, flipDelay + HALF_FLIP);
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
        <CardBack width={FAN_CARD_W} height={FAN_CARD_H} backColors={backColors} backAccent={backAccent} />
      )}
    </Animated.View>
  );
}

// ─── AI placeholder at top ────────────────────────────────────────────────────
function AiHandPlaceholder({ count, backColors, backAccent }: {
  count: number; backColors: [string, string, string]; backAccent: string;
}) {
  const N = Math.min(count, 12);
  const W = 40; const H = 58;
  const OVERLAP = W * 0.6;
  const totalWidth = W + (N - 1) * (W - OVERLAP);
  const startX = (SW - totalWidth) / 2;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: H + 24, alignItems: "center" }}>
      <View style={{ width: totalWidth, height: H + 24, position: "relative" }}>
        {Array.from({ length: N }).map((_, i) => {
          const c = (N - 1) / 2;
          const t = N <= 1 ? 0 : (i - c) / Math.max(1, c);
          return (
            <View
              key={i}
              style={{
                position: "absolute", left: i * (W - OVERLAP),
                top: Math.abs(t) * 7 + 10, zIndex: i + 1,
                transform: [{ rotate: `${t * 14}deg` }],
              }}
            >
              <CardBack width={W} height={H} backColors={backColors} backAccent={backAccent} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Table center: deck pile + starter card shown after flip ──────────────────
function TableCenter({ starterCard, backColors, backAccent, visible }: {
  starterCard: Card | null; backColors: [string, string, string]; backAccent: string; visible: boolean;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.75);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 380 });
      scale.value = withSpring(1, { damping: 11, stiffness: 160 });
    }
  }, [visible]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const DW = 44; const DH = 63;
  return (
    <Animated.View style={[style, {
      position: "absolute", top: "33%", left: 0, right: 0,
      alignItems: "center", justifyContent: "center",
      flexDirection: "row", gap: 22,
    }]}>
      {/* Remaining deck */}
      <View style={{ position: "relative", width: DW, height: DH }}>
        {[3, 2, 1, 0].map(off => (
          <View key={off} style={{ position: "absolute", top: -off * 1.5, left: off, zIndex: 4 - off }}>
            <CardBack width={DW} height={DH} backColors={backColors} backAccent={backAccent} />
          </View>
        ))}
      </View>
      {/* Starter card face-up */}
      {starterCard && (
        <View style={{ transform: [{ rotate: "-4deg" }] }}>
          <PlayingCard card={starterCard} size="md" />
        </View>
      )}
    </Animated.View>
  );
}

// ─── Flip phase wrapper ───────────────────────────────────────────────────────
function FlipPhase({ playerCards, cardsPerPlayer, starterCard, backColors, backAccent, onDone }: {
  playerCards: Card[]; cardsPerPlayer: number; starterCard: Card | null;
  backColors: [string, string, string]; backAccent: string; onDone: () => void;
}) {
  const STAGGER = 110;
  const N = playerCards.length;
  const doneCalled = useRef(false);
  const [tableVisible, setTableVisible] = useState(false);

  const handleLastFlip = () => {
    if (doneCalled.current) return;
    doneCalled.current = true;
    // Show table center (deck + starter card) for 1.4s then fade out overlay
    setTableVisible(true);
    setTimeout(onDone, 1400);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <AiHandPlaceholder count={cardsPerPlayer} backColors={backColors} backAccent={backAccent} />
      {/* Deck pile + starter card appear after last card flips */}
      <TableCenter starterCard={starterCard} backColors={backColors} backAccent={backAccent} visible={tableVisible} />
      {/* Fan centered at screen bottom */}
      <View style={{ position: "absolute", bottom: 24, left: 0, right: 0, height: FAN_CARD_H + 48 }}>
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

// ─── Main DealAnimation ───────────────────────────────────────────────────────
type Phase = "shuffle" | "deal" | "flip";

export function DealAnimation({
  cardsPerPlayer, playerCards, starterCard = null, onComplete,
  backColors = ["#1E4080", "#0e2248", "#0a1832"],
  backAccent = Colors.gold,
}: {
  cardsPerPlayer: number; playerCards: Card[]; starterCard?: Card | null; onComplete: () => void;
  backColors?: [string, string, string]; backAccent?: string;
}) {
  const [phase, setPhase] = useState<Phase>("shuffle");
  const overlayOpacity = useSharedValue(1);
  const calledRef = useRef(false);

  const dealItems: { target: "player" | "ai"; index: number; dealIndex: number }[] = [];
  for (let i = 0; i < cardsPerPlayer; i++) {
    dealItems.push({ target: "ai",     index: i, dealIndex: i * 2 });
    dealItems.push({ target: "player", index: i, dealIndex: i * 2 + 1 });
  }

  // Auto-advance from deal → flip
  useEffect(() => {
    if (phase !== "deal") return;
    const totalDealMs = (cardsPerPlayer * 2 - 1) * 140 + 550;
    const t = setTimeout(() => setPhase("flip"), totalDealMs);
    return () => clearTimeout(t);
  }, [phase]);

  const handleFlipDone = () => {
    if (calledRef.current) return;
    calledRef.current = true;
    overlayOpacity.value = withTiming(0, { duration: 500 }, () => {
      runOnJS(onComplete)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      {phase === "shuffle" && (
        <ShufflePhase
          backColors={backColors}
          backAccent={backAccent}
          onDone={() => setPhase("deal")}
        />
      )}

      {phase === "deal" && (
        <View style={styles.deckCenter}>
          {dealItems.map((item) => (
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
      )}

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
    backgroundColor: "rgba(0,0,0,0.94)",
    zIndex: 999,
  },
  shuffleCenter: {
    position: "absolute",
    top: CY - CARD_H / 2,
    left: CX - CARD_W / 2,
    width: CARD_W,
    height: CARD_H,
  },
  deckCenter: {
    position: "absolute",
    top: CY - CARD_H / 2,
    left: CX - CARD_W / 2,
    width: CARD_W,
    height: CARD_H,
  },
  deckCard: {
    position: "absolute",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
