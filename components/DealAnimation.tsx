import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
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
import { cardGlowColor } from "@/lib/cardVisuals";

// Dummy face-down card payload — PlayingCard requires a Card object even when
// rendering the back. The fields are unused in faceDown mode.
const FACE_DOWN_DUMMY: Card = { id: "facedown", rank: "A", suit: "spades" };

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_W = 52;
const CARD_H = 76;
const FAN_CARD_W = 64;
const FAN_CARD_H = 92;
const DECK_SIZE = 10;
const CX = SW / 2;
const CY = SH / 2;

// ─── Card back mini render ─────────────────────────────────────────────────────
// Delegates to PlayingCard so the back used during shuffle/deal/flip is
// pixel-identical to the back shown in the player's hand and on the draw pile.
type BackPattern = "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";

function CardBack({
  size = "sm",
  backColors, backAccent, backPattern,
}: {
  size?: "sm" | "md";
  backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern;
}) {
  return (
    <PlayingCard
      card={FACE_DOWN_DUMMY}
      faceDown
      size={size}
      backColors={backColors}
      backAccent={backAccent}
      backPattern={backPattern}
      showEffectBadge={false}
    />
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
  backPattern?: BackPattern;
}

const HALF = 5; // cards per half
const RIFFLE_PASSES = 2;

function RiffleCard({ index, half, passIndex, totalPasses, onLastDone, backColors, backAccent, backPattern }: RiffleCardProps) {
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
      <CardBack size="sm" backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
    </Animated.View>
  );
}

function ShufflePhase({
  backColors, backAccent, backPattern, onDone
}: {
  backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern; onDone: () => void;
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
            backPattern={backPattern}
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
            backPattern={backPattern}
          />
        ))
      ))}
    </View>
  );
}

// ─── Phase 2: Deal ───────────────────────────────────────────────────────────
function DealCard({ index, totalCards, target, dealIndex, backColors, backAccent, backPattern }: {
  index: number; totalCards: number; target: "player" | "ai";
  dealIndex: number; backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern;
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
    // Arc trajectory: lift over a midpoint before settling — gives the card a
    // sense of weight as if dealt by hand.
    const arcSign = target === "player" ? -1 : 1;
    const arcPeak = arcSign * (SH * 0.10 + Math.random() * 18);
    const flightMs = 360;

    setTimeout(() => { playSound("card_deal").catch(() => {}); }, delay);

    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 130 }));
    x.value = withDelay(delay, withSpring(targetX, { damping: 15, stiffness: 110 }));
    // Two-phase Y: rise to arc peak (relative to mid-trajectory), then settle to target.
    const midY = (targetY + arcPeak) / 2;
    y.value = withDelay(delay, withSequence(
      withTiming(midY, { duration: flightMs * 0.55, easing: Easing.out(Easing.quad) }),
      withSpring(targetY, { damping: 14, stiffness: 130 }),
    ));
    // Slight rotational overshoot before settling at finalRotate.
    const spin = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 10);
    rotate.value = withDelay(delay, withSequence(
      withTiming(spin, { duration: flightMs * 0.6, easing: Easing.out(Easing.quad) }),
      withSpring(finalRotate, { damping: 12, stiffness: 140 }),
    ));
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
      <CardBack size="sm" backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
    </Animated.View>
  );
}

// ─── Phase 3: Flip reveal ─────────────────────────────────────────────────────
function FlipCard({ card, index, totalCards, flipDelay, backColors, backAccent, backPattern, cardColors, onLastFlipped }: {
  card: Card; index: number; totalCards: number; flipDelay: number;
  backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern; cardColors?: [string, string, string]; onLastFlipped?: () => void;
}) {
  const scaleX = useSharedValue(1);
  const [showFront, setShowFront] = useState(false);
  const liftY = useSharedValue(0);
  // Snap (extra scale punch) + glow ring fade — fired right when the front
  // becomes visible so the arrival of the card has tactile feedback.
  const snap = useSharedValue(1);
  const glowOp = useSharedValue(0);
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
      // Snap: brief overshoot then settle.
      snap.value = withSequence(
        withTiming(1.08, { duration: 90, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 8, stiffness: 220 }),
      );
      // Glow ring: quick flash that fades out.
      glowOp.value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withTiming(0, { duration: 360 }),
      );
      if (!didFlip.current) {
        didFlip.current = true;
        playSound("card_flip").catch(() => {});
        if (onLastFlipped) setTimeout(onLastFlipped, HALF_FLIP + 50);
      }
    }, flipDelay + HALF_FLIP);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: scaleX.value * snap.value },
      { scaleY: snap.value },
      { translateY: liftY.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    transform: [{ scale: 1 + glowOp.value * 0.18 }],
  }));

  // Suit/special-tinted glow on reveal; before the flip we mirror back accent
  // so the ring matches the back chrome during the swap.
  const glowColor = showFront ? cardGlowColor(card, "solid") : backAccent;

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
      {/* Snap glow ring — sits behind the card, suit/back-accent tinted. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: -6, left: -6, right: -6, bottom: -6,
            borderRadius: 14,
            backgroundColor: glowColor + "55",
            shadowColor: glowColor,
            shadowOpacity: 0.95,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
            elevation: 0,
            zIndex: -1,
          },
          glowStyle,
        ]}
      />
      {showFront ? (
        <PlayingCard card={card} size="md" cardColors={cardColors} />
      ) : (
        <CardBack size="md" backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
      )}
    </Animated.View>
  );
}

// ─── AI placeholder at top ────────────────────────────────────────────────────
function AiHandPlaceholder({ count, backColors, backAccent, backPattern }: {
  count: number; backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern;
}) {
  const N = Math.min(count, 12);
  // Use PlayingCard "sm" intrinsic size (46x68) for consistency with the in-game back.
  const W = 46; const H = 68;
  const OVERLAP = W * 0.6;
  const totalWidth = W + (N - 1) * (W - OVERLAP);

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
              <CardBack size="sm" backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Table center: deck pile + starter card shown after flip ──────────────────
function TableCenter({ starterCard, backColors, backAccent, backPattern, cardColors, visible }: {
  starterCard: Card | null; backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern; cardColors?: [string, string, string]; visible: boolean;
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
  // PlayingCard "sm" intrinsic size used for the deck pile.
  const DW = 46; const DH = 68;
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
            <CardBack size="sm" backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
          </View>
        ))}
      </View>
      {/* Starter card face-up */}
      {starterCard && (
        <View style={{ transform: [{ rotate: "-4deg" }] }}>
          <PlayingCard card={starterCard} size="md" cardColors={cardColors} />
        </View>
      )}
    </Animated.View>
  );
}

// ─── Flip phase wrapper ───────────────────────────────────────────────────────
function FlipPhase({ playerCards, cardsPerPlayer, starterCard, backColors, backAccent, backPattern, cardColors, onDone, numOpponents }: {
  playerCards: Card[]; cardsPerPlayer: number; starterCard: Card | null;
  backColors: [string, string, string]; backAccent: string; backPattern?: BackPattern; cardColors?: [string, string, string]; onDone: () => void;
  numOpponents: number;
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

  // Positions for AI hands based on opponent count
  const aiPositions: Array<object> = numOpponents === 1
    ? [{ position: "absolute" as const, top: 4, left: 0, right: 0, alignItems: "center" as const }]
    : numOpponents === 2
    ? [
        { position: "absolute" as const, top: 4, left: 16 },
        { position: "absolute" as const, top: 4, right: 16 },
      ]
    : [
        { position: "absolute" as const, top: 4, left: 4 },
        { position: "absolute" as const, top: 4, left: 0, right: 0, alignItems: "center" as const },
        { position: "absolute" as const, top: 4, right: 4 },
      ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {aiPositions.map((posStyle, idx) => (
        <View key={idx} style={posStyle as object}>
          <AiHandPlaceholder count={cardsPerPlayer} backColors={backColors} backAccent={backAccent} backPattern={backPattern} />
        </View>
      ))}
      {/* Deck pile + starter card appear after last card flips */}
      <TableCenter starterCard={starterCard} backColors={backColors} backAccent={backAccent} backPattern={backPattern} cardColors={cardColors} visible={tableVisible} />
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
            backPattern={backPattern}
            cardColors={cardColors}
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
  backPattern,
  cardColors,
  numOpponents = 1,
}: {
  cardsPerPlayer: number; playerCards: Card[]; starterCard?: Card | null; onComplete: () => void;
  backColors?: [string, string, string]; backAccent?: string;
  backPattern?: BackPattern;
  cardColors?: [string, string, string];
  numOpponents?: number;
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
    <Animated.View style={[styles.overlay, overlayStyle, { pointerEvents: "none" } as any]}>
      {phase === "shuffle" && (
        <ShufflePhase
          backColors={backColors}
          backAccent={backAccent}
          backPattern={backPattern}
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
              backPattern={backPattern}
            />
          ))}
        </View>
      )}

      {phase === "flip" && (
        <FlipPhase
          playerCards={playerCards}
          cardsPerPlayer={cardsPerPlayer}
          starterCard={starterCard ?? null}
          backColors={backColors}
          backAccent={backAccent}
          backPattern={backPattern}
          cardColors={cardColors}
          onDone={handleFlipDone}
          numOpponents={numOpponents}
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
