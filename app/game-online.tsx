import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform, useWindowDimensions, Image, ActivityIndicator, Alert, AppState,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  withSpring, withDelay, Easing, FadeIn, FadeOut, FadeInDown, SlideInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { useGameBackHandler } from "@/hooks/useGameBackHandler";
import { t, Lang } from "@/lib/i18n";
import { PlayingCard } from "@/components/PlayingCard";
import { cardGlowColor, isSpecialRank } from "@/lib/cardVisuals";
import { DealAnimation } from "@/components/DealAnimation";
import {
  MultiGameState, Card, Suit,
  initMultiGame, multiCanPlay, multiPlayCard, multiDraw, multiChooseSuit, multiConfirmTurn,
  cpuPlayMulti, suitName, suitSymbol, suitColor, multiGetTopCard,
} from "@/lib/multiplayerEngine";
import { useProfile } from "@/context/ProfileContext";
import {
  playCardFlip, playCardDraw, playButton, playVictory, playDefeat, playChestOpen, playOchoLocosVoice,
  playSpeedTick, stopMusic, startGameMusicForMode, syncSettings
} from "@/lib/audioManager";
import { CardPlayEffect } from "@/components/CardPlayEffect";
import { EmotePanel, EmoteBubble, EMOTES, type Emote } from "@/components/EmotePanel";
import { getCurrentWeeklyEvent } from "@/lib/events";
import { multiApplyRandomShuffle } from "@/lib/multiplayerEngine";
import { getEventConfig, getEventName, getEventShortName, getEventDesc } from "@/lib/eventModes";
import { CARD_BACKS, AVATARS, getTableDesignById, getCardDesignById } from "@/lib/storeItems";
import { getModeById } from "@/lib/gameModes";
import ChestOpeningModal from "@/components/ChestOpeningModal";
import { ChestType, ChestReward } from "@/lib/chestSystem";
import { CPU_PROFILES, type CpuProfile } from "@/lib/cpuProfiles";
import { generateRival, rivalToCpuProfile } from "@/lib/rivalGenerator";
import { playSound } from "@/lib/sounds";
import { getSocket, ensureDisconnected } from "@/lib/onlineSocket";
import { addStars, getRankInfo, RANKS, DIVISIONS } from "@/lib/ranked";
import { updateChallengeProgress } from "@/lib/challenges";
import BouncePressable from "@/components/BouncePressable";
import DiscardBouncer from "@/components/DiscardBouncer";

function getActiveEvent(level: number) {
  if (level < 5) return null;
  return getCurrentWeeklyEvent().event;
}

// Dummy face-down card payload — PlayingCard requires a Card object even when
// rendering the back. Fields are unused in faceDown mode.
const DRAW_PILE_DUMMY = { id: "draw-pile", rank: "A" as const, suit: "spades" as const };

interface ServerGameState {
  discardTop: Card;
  drawPileSize: number;
  currentPlayerIndex: number;
  currentSuit: Suit;
  phase: MultiGameState["phase"];
  winnerIndex: number | null;
  playerNames: string[];
  handSizes: number[];
  message: string;
  direction: 1 | -1;
  pendingDraw: number;
  pendingDrawType: "two" | "seven" | null;
  jActive: boolean;
  jSuit: Suit | null;
  myHand: Card[];
  myPlayerIndex: number;
  eventId?: string | null;
}

const DUMMY_CARD: Card = { id: "xx", rank: "2", suit: "hearts" };

function buildLocalState(srv: ServerGameState): MultiGameState {
  if (!srv.playerNames || !srv.handSizes) {
    throw new Error("buildLocalState: missing playerNames or handSizes in server state");
  }
  const n = srv.playerNames.length;
  const myPidx = srv.myPlayerIndex ?? 0;
  const hands: Card[][] = [];
  for (let i = 0; i < n; i++) {
    if (i === myPidx) {
      hands.push([...srv.myHand]);
    } else {
      hands.push(Array(srv.handSizes[i] ?? 0).fill(DUMMY_CARD));
    }
  }
  const localCurrPidx = (srv.currentPlayerIndex - myPidx + n) % n;
  const rotatedNames = Array.from({ length: n }, (_, i) => srv.playerNames[(i + myPidx) % n]);
  const rotatedHands = Array.from({ length: n }, (_, i) => hands[(i + myPidx) % n]);
  const rotatedHandSizes = Array.from({ length: n }, (_, i) => srv.handSizes[(i + myPidx) % n] ?? 0);

  let rotatedWinner: number | null = null;
  if (srv.winnerIndex !== null && srv.winnerIndex !== undefined) {
    rotatedWinner = (srv.winnerIndex - myPidx + n) % n;
  }

  return {
    hands: rotatedHands,
    drawPile: Array(srv.drawPileSize).fill(DUMMY_CARD),
    discardPile: [srv.discardTop],
    currentSuit: srv.currentSuit,
    currentPlayerIndex: localCurrPidx,
    playerCount: n,
    playerNames: rotatedNames,
    phase: srv.phase,
    winnerIndex: rotatedWinner,
    message: srv.message,
    direction: srv.direction,
    turnId: Date.now(),
    pendingDraw: srv.pendingDraw,
    pendingDrawType: srv.pendingDrawType,
    pendingDrawSuit: null,
    jActive: srv.jActive,
    jSuit: srv.jSuit,
    eventId: srv.eventId ?? null,
  };
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function cpuRankFromLevel(level: number): number {
  if (level <= 10) return 0;
  if (level <= 20) return 1;
  if (level <= 30) return 2;
  if (level <= 40) return 3;
  if (level <= 50) return 4;
  if (level <= 60) return 5;
  if (level <= 70) return 6;
  if (level <= 80) return 7;
  if (level <= 90) return 8;
  if (level <= 95) return 9;
  if (level <= 99) return 10;
  return 11;
}

function pickCpuProfiles(
  count: number,
  playerLevel: number,
  opts?: { rankedRank?: number },
): CpuProfile[] {
  // Casual / non-ranked: original ±15 level window around player
  if (opts?.rankedRank === undefined) {
    const range = 15;
    let candidates = CPU_PROFILES.filter(p => Math.abs(p.level - playerLevel) <= range);
    if (candidates.length < count) {
      const wideRange = 30;
      candidates = CPU_PROFILES.filter(p => Math.abs(p.level - playerLevel) <= wideRange);
    }
    const shuffled = [...(candidates.length >= count ? candidates : CPU_PROFILES)].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Ranked: progressive difficulty curve by player rank.
  // Target average CPU level scales with rank (Bronce ~15, Oro ~35, Diamante ~55, Mítico+ 75+).
  const playerRank = Math.max(0, Math.min(11, opts.rankedRank));
  const targetLevel = Math.max(1, playerRank * 10 + 5);

  // Strict ±1 rank filter (matchmaking justo: nunca un Bronce vs Diamante)
  let candidates = CPU_PROFILES.filter(p => Math.abs(cpuRankFromLevel(p.level) - playerRank) <= 1);

  // Fallback: ±2 rangos si el pool quedó muy chico
  if (candidates.length < count) {
    candidates = CPU_PROFILES.filter(p => Math.abs(cpuRankFromLevel(p.level) - playerRank) <= 2);
  }
  // Último fallback: cualquier CPU
  if (candidates.length < count) {
    candidates = CPU_PROFILES;
  }

  // Bias hacia el targetLevel: ordenar por cercanía y muestrear de los más cercanos
  const sorted = [...candidates].sort((a, b) => Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel));
  const pool = sorted.slice(0, Math.max(count * 3, count + 4));
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

function wrFromLevel(level: number) {
  return Math.round(Math.min(88, 35 + level * 0.75));
}

const PLAYER_COLORS = ["#D4AF37", "#27AE60", "#E74C3C", "#9B59B6"];


// ─── Lobby screen ─────────────────────────────────────────────────────────
function LobbySpinner() {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return <Animated.Text style={[lobbyStyles.spinner, style]}>⟳</Animated.Text>;
}

function LobbyScreen({
  playerCount, humanName, cpuProfiles, joinedCount, phase, countdown,
}: {
  playerCount: number;
  humanName: string;
  cpuProfiles: CpuProfile[];
  joinedCount: number;
  phase: "searching" | "found" | "countdown";
  countdown: number;
}) {
  const T = useT();
  const { profile, level: humanLevel } = useProfile();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (phase === "found" || phase === "countdown") {
      pulse.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 400 }), withTiming(1, { duration: 400 })), -1
      );
    }
  }, [phase]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const modeParam = useLocalSearchParams<{ mode?: string }>().mode || "classic";
  const modeName = T(`mode${modeParam.charAt(0).toUpperCase() + modeParam.slice(1)}` as any);

  return (
    <View style={lobbyStyles.container}>
      <LinearGradient colors={["#020810", "#041530", "#02080f"]} style={lobbyStyles.bg} />

      <View style={lobbyStyles.content}>
        <View style={lobbyStyles.header}>
          <Text style={lobbyStyles.modeLabel}>{modeName.toUpperCase()}</Text>
        </View>

        {phase === "searching" && (
          <>
            <LobbySpinner />
            <Text style={lobbyStyles.searchLabel}>{T("searchingWorld").toUpperCase()}</Text>
            <Text style={lobbyStyles.searchSub}>{joinedCount + 1}/{playerCount} {T("players")}</Text>
          </>
        )}
        {phase === "found" && (
          <Animated.Text style={[lobbyStyles.foundLabel, pulseStyle]}>{T("matchFound")}</Animated.Text>
        )}
        {phase === "countdown" && (
          <View style={lobbyStyles.countdownWrap}>
            <Text style={lobbyStyles.countdownLabel}>{T("startsIn")}</Text>
            <Animated.Text style={[lobbyStyles.countdown, pulseStyle]}>{countdown}</Animated.Text>
          </View>
        )}

        {/* Player slots */}
        <View style={lobbyStyles.slots}>
          {/* Human player (always joined) */}
          <Animated.View entering={FadeInDown.duration(400)} style={lobbyStyles.slot}>
            <View style={[lobbyStyles.slotAvatar, { borderColor: Colors.gold }]}>
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <Ionicons name={(AVATARS.find(a => a.id === profile.avatarId)?.preview ?? "person") as any} size={20} color={Colors.gold} />
              )}
            </View>
            <View style={lobbyStyles.slotInfo}>
              <Text style={[lobbyStyles.slotName, { color: Colors.gold }]}>{humanName}</Text>
              <Text style={lobbyStyles.slotSub}>{T("level")} {humanLevel} · {T("you")}</Text>
            </View>
            <View style={lobbyStyles.onlineDot} />
          </Animated.View>

          {/* CPU slots */}
          {cpuProfiles.slice(0, joinedCount).map((cpu, i) => {
            const slotColor = cpu.avatarColor;
            return (
              <Animated.View
                key={cpu.name}
                entering={FadeInDown.delay(100 + i * 80).duration(500)}
                style={lobbyStyles.slot}
              >
                <View style={[lobbyStyles.slotAvatar, { borderColor: slotColor }]}>
                  {cpu.photoUrl ? (
                    <Image
                      source={{ uri: cpu.photoUrl }}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                  ) : (
                    <Ionicons name={cpu.avatarIcon as any} size={20} color={slotColor} />
                  )}
                </View>
                <View style={lobbyStyles.slotInfo}>
                  <Text style={[lobbyStyles.slotName, { color: slotColor }]}>{cpu.name}</Text>
                  <Text style={lobbyStyles.slotSub}>{T("level")} {cpu.level} · {wrFromLevel(cpu.level)}% WR</Text>
                </View>
                <View style={[lobbyStyles.onlineDot, { backgroundColor: "#2ecc71" }]} />
              </Animated.View>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, playerCount - 1 - joinedCount) }).map((_, i) => (
            <View key={`empty-${i}`} style={[lobbyStyles.slot, { opacity: 0.3 }]}>
              <View style={[lobbyStyles.slotAvatar, { borderColor: Colors.border }]}>
                <LobbySpinner />
              </View>
              <View style={lobbyStyles.slotInfo}>
                <Text style={lobbyStyles.slotName}>{T("searchingOnline")}</Text>
                <Text style={lobbyStyles.slotSub}>{T("connecting")}</Text>
              </View>
              <View style={[lobbyStyles.onlineDot, { backgroundColor: "#888" }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const lobbyStyles = StyleSheet.create({
  container: { flex: 1 },
  bg: StyleSheet.absoluteFillObject,
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 24 },
  header: { position: "absolute", top: 60, alignItems: "center" },
  modeLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 4 },
  spinner: { fontSize: 52, color: "#4A90E2", fontFamily: "Nunito_800ExtraBold" },
  searchLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#4A90E2", letterSpacing: 3 },
  searchSub: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textDim },
  foundLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 2, textAlign: "center" },
  countdownWrap: { alignItems: "center", gap: 4 },
  countdownLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted, letterSpacing: 3 },
  countdown: { fontFamily: "Nunito_800ExtraBold", fontSize: 72, color: Colors.gold },
  slots: { width: "100%", gap: 10 },
  slot: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  slotAvatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  slotFlag: { fontSize: 22 },
  slotInfo: { flex: 1, gap: 2 },
  slotName: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.text },
  slotSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2ecc71" },
  teamTag: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1,
  },
  teamTagText: { fontFamily: "Nunito_800ExtraBold", fontSize: 10, letterSpacing: 1 },
});

// ─── Small face-down card ────────────────────────────────────────────────
function FaceDownMini({ angle = 0, backColors, backAccent }: {
  angle?: number;
  backColors?: [string, string, string];
  backAccent?: string;
}) {
  const colors = backColors ?? ["#1E4080", "#0e2248", "#0a1832"] as [string, string, string];
  const accent = backAccent ?? "#D4AF37";
  return (
    <View style={[gameStyles.faceDownMini, { transform: [{ rotate: `${angle}deg` }] }]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill}>
        <Text style={[gameStyles.faceDownDot, { color: accent }]}>◆</Text>
      </LinearGradient>
    </View>
  );
}


// ─── CPU opponent zone ────────────────────────────────────────────────────
const CpuZone = memo(function CpuZone({ handCount, profile, color, isThinking, isCurrent, side, isSkipped, backColors, backAccent }: {
  handCount: number; profile: CpuProfile; color: string;
  isThinking: boolean; isCurrent: boolean; side?: "left" | "right";
  isSkipped?: boolean;
  backColors?: [string, string, string]; backAccent?: string;
}) {
  const glow = useSharedValue(0);
  const zoneOpacity = useSharedValue(1);
  useEffect(() => {
    if (isCurrent) {
      glow.value = withRepeat(withSequence(
        withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })
      ), -1);
    } else {
      glow.value = 0;
    }
    zoneOpacity.value = withTiming(isCurrent ? 1 : 0.55, { duration: 300 });
  }, [isCurrent]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.5,
  }));
  const zoneStyle = useAnimatedStyle(() => ({ opacity: zoneOpacity.value }));

  const maxCards = Math.min(handCount, side ? 5 : 7);

  return (
    <Animated.View style={[side ? [gameStyles.sideZone, side === "right" && gameStyles.sideZoneRight] : gameStyles.topZone, zoneStyle]}>
      {/* Avatar */}
      <View style={gameStyles.cpuAvatarRow}>
        <Animated.View style={[gameStyles.cpuAvatarRing, { borderColor: color }, isCurrent && glowStyle]}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} />
          ) : (
            <Ionicons name={profile.avatarIcon as any} size={14} color={color} />
          )}
        </Animated.View>
        <View style={{ gap: 1 }}>
          <Text style={[gameStyles.cpuName, { color }]} numberOfLines={1}>{profile.name}</Text>
          <Text style={gameStyles.cpuLevel}>Nv.{profile.level}</Text>
        </View>
        <View style={gameStyles.onlineDot} />
      </View>

      {/* Cards */}
      <View style={side ? gameStyles.sideCardFan : gameStyles.topCardFan}>
        {Array.from({ length: maxCards }).map((_, i) => (
          <View key={i} style={{
            marginLeft: side ? 0 : i === 0 ? 0 : -28,
            marginTop: side ? (i === 0 ? 0 : -42) : 0,
            zIndex: i,
            transform: side
              ? [{ rotate: `${side === "left" ? 90 : -90}deg` }]
              : [{ rotate: `${(i - maxCards / 2) * 4}deg` }],
          }}>
            <FaceDownMini backColors={backColors} backAccent={backAccent} />
          </View>
        ))}
      </View>


      {/* Thinking indicator */}
      {isThinking && <Text style={gameStyles.thinkingText}>...</Text>}
      {isSkipped && <Text style={gameStyles.skipText}>⊗ SKIP</Text>}

      {/* Card count */}
      <View style={[gameStyles.cpuCountBadge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
        <Text style={[gameStyles.cpuCountText, { color }]}>{handCount}</Text>
      </View>
    </Animated.View>
  );
});

// ─── Direction arrow ─────────────────────────────────────────────────────
function DirectionArrow({ direction }: { direction: 1 | -1 }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(
      withTiming(direction === 1 ? 360 : -360, { duration: 4000, easing: Easing.linear }),
      -1,
    );
  }, [direction]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return <Animated.Text style={[gameStyles.dirArrow, style]}>{direction === 1 ? "↻" : "↺"}</Animated.Text>;
}

// Returns the most common suit in the hand (ties broken in SUITS declaration
// order). Falls back to a random suit only when the hand is empty.
function pickDefaultSuit(hand: Card[]): Suit {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  if (!hand || hand.length === 0) {
    return suits[Math.floor(Math.random() * suits.length)];
  }
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of hand) {
    if (c && c.suit && c.suit in counts) counts[c.suit]++;
  }
  let best: Suit = suits[0];
  let bestN = -1;
  for (const s of suits) {
    if (counts[s] > bestN) { bestN = counts[s]; best = s; }
  }
  if (bestN <= 0) return suits[Math.floor(Math.random() * suits.length)];
  return best;
}

// ─── Suit picker ──────────────────────────────────────────────────────────
// Visible 5-second countdown for competitive matches (ranked + online).
// On expiry, the picker auto-selects the suit the player holds the most of
// (ties broken in suit declaration order); only falls back to a random suit
// if the hand is empty (e.g. instant-win edge case).
function SuitPicker({ onChoose, hand }: { onChoose: (s: Suit) => void; hand: Card[] }) {
  const T = useT();
  const [countdown, setCountdown] = useState(5);
  const cdAnim = useSharedValue(1);
  const firedRef = useRef(false);
  const handRef = useRef(hand);
  // Keep the latest hand visible to the timer callback without resetting it.
  useEffect(() => { handRef.current = hand; }, [hand]);

  useEffect(() => {
    setCountdown(5);
    cdAnim.value = 1;
    firedRef.current = false;
    const interval = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        cdAnim.value = withSequence(
          withTiming(1.4, { duration: 120 }),
          withTiming(1, { duration: 200 }),
        );
        if (next <= 0) {
          clearInterval(interval);
          if (!firedRef.current) {
            firedRef.current = true;
            onChoose(pickDefaultSuit(handRef.current));
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cdStyle = useAnimatedStyle(() => ({ transform: [{ scale: cdAnim.value }] }));
  const cdColor = countdown <= 2 ? "#E74C3C" : countdown <= 3 ? "#F39C12" : "#27AE60";

  const handlePick = (s: Suit) => {
    if (firedRef.current) return;
    firedRef.current = true;
    onChoose(s);
  };

  return (
    <View style={gameStyles.suitOverlay}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text style={gameStyles.suitTitle}>{T("chooseSuit")}</Text>
        <Animated.Text
          style={[
            {
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 26,
              minWidth: 28,
              textAlign: "center",
              color: cdColor,
              fontVariant: ["tabular-nums"],
            },
            cdStyle,
          ]}
        >
          {countdown}
        </Animated.Text>
      </View>
      <View style={gameStyles.suitGrid}>
        {SUITS.map(s => (
          <BouncePressable key={s} inline onPress={() => handlePick(s)} style={gameStyles.suitBtn}>
            <Text style={[gameStyles.suitSym, { color: suitColor(s) }]}>{suitSymbol(s)}</Text>
            <Text style={gameStyles.suitLbl}>{suitName(s)}</Text>
          </BouncePressable>
        ))}
      </View>
    </View>
  );
}

// ─── Win/Lose overlay ────────────────────────────────────────────────────
// ─── Mini confetti for result overlay ────────────────────────────────────────
const CONFETTI_COLORS_OL = ["#D4AF37","#FFD700","#E74C3C","#27AE60","#9B59B6","#00D4FF","#FF6F00","#FFFFFF","#E91E8C","#3498DB"];
const CONFETTI_SYMS_OL = ["♠","♥","♦","♣","★","●","■","▲"];
function OLConfettiPiece({ idx, SW: screenW, SH: screenH }: { idx: number; SW: number; SH: number }) {
  const seed = idx * 41 + 23;
  const startX = (seed * 131) % screenW;
  const startY = useSharedValue(-20 - (seed % 60));
  const x = useSharedValue(startX);
  const op = useSharedValue(0);
  const rot = useSharedValue(0);
  const sc = useSharedValue(0.7 + (seed % 5) * 0.08);
  const color = CONFETTI_COLORS_OL[seed % CONFETTI_COLORS_OL.length];
  const sym = CONFETTI_SYMS_OL[seed % CONFETTI_SYMS_OL.length];
  const size = 10 + (seed % 3) * 5;
  const duration = 1200 + (seed % 700);
  const wobble = 18 + (seed % 28);
  const delay = seed % 350;

  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 180 }));
    startY.value = withDelay(delay, withTiming(screenH + 50, { duration: duration, easing: Easing.in(Easing.quad) }));
    x.value = withDelay(delay, withSequence(
      withTiming(startX + wobble, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
      withTiming(startX - wobble / 2, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
    ));
    rot.value = withDelay(delay, withTiming((seed % 2 === 0 ? 1 : -1) * 720, { duration: duration }));
  }, []);
  const style = useAnimatedStyle(() => ({
    position: "absolute", left: x.value, top: startY.value, opacity: op.value,
    transform: [{ rotate: `${rot.value}deg` }, { scale: sc.value }],
  }));
  return <Animated.Text style={[style, { fontSize: size, color }]}>{sym}</Animated.Text>;
}
function OLWinConfetti({ SW: screenW, SH: screenH }: { SW: number; SH: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
      {Array.from({ length: 36 }).map((_, i) => (
        <OLConfettiPiece key={i} idx={i} SW={screenW} SH={screenH} />
      ))}
    </View>
  );
}

function ResultOverlay({ isWin, winnerName, winnerColor, onClose, onPlayAgain }: {
  isWin: boolean; winnerName: string; winnerColor: string; onClose: () => void; onPlayAgain: () => void;
}) {
  const T = useT();
  const { width: SW, height: SH } = useWindowDimensions();
  const sc = useSharedValue(2.0);
  const op = useSharedValue(0);
  const flash = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const btnOp = useSharedValue(0);
  const accentColor = isWin ? Colors.gold : Colors.red;

  useEffect(() => {
    flash.value = withSequence(
      withTiming(isWin ? 0.7 : 0.5, { duration: 90 }),
      withTiming(0, { duration: 300 }),
    );
    sc.value = withSpring(1, { damping: 5, stiffness: 170, mass: 0.8 });
    op.value = withTiming(1, { duration: 150 });
    iconScale.value = withDelay(150, withSpring(1, { damping: 5, stiffness: 220 }));
    btnOp.value = withDelay(500, withTiming(1, { duration: 400 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }], opacity: op.value }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOp.value }));

  return (
    <View style={gameStyles.resultOverlay}>
      <LinearGradient
        colors={isWin ? ["#041a04", "#062206", "#041408"] : ["#1a0404", "#220606", "#180404"]}
        style={StyleSheet.absoluteFill}
      />
      {isWin && <OLWinConfetti SW={SW} SH={SH} />}
      <Animated.View style={[StyleSheet.absoluteFill, flashStyle, { backgroundColor: accentColor, pointerEvents: "none" } as any]} />

      <Animated.View style={iconStyle}>
        <Ionicons name={isWin ? "trophy" : "close-circle"} size={80} color={accentColor} />
      </Animated.View>
      <Animated.Text style={[gameStyles.resultTitle, { color: accentColor }, titleStyle]}>
        {isWin ? T("youWon") : T("defeat")}
      </Animated.Text>
      {!isWin && (
        <Text style={[gameStyles.resultSub, { color: winnerColor }]}>{winnerName} {T("wonSuffix")}</Text>
      )}
      <Animated.View style={[{ width: "100%", alignItems: "center", gap: 12 }, btnStyle]}>
        <BouncePressable style={gameStyles.resultBtn} onPress={onPlayAgain}>
          <LinearGradient colors={[Colors.gold, "#A07800"]} style={gameStyles.resultBtnGrad}>
            <Ionicons name="refresh" size={16} color="#1a0a00" />
            <Text style={gameStyles.resultBtnText}>{T("playAgain")}</Text>
          </LinearGradient>
        </BouncePressable>
        <BouncePressable style={[gameStyles.resultBtn, { marginTop: 0 }]} onPress={onClose}>
          <LinearGradient colors={["#333", "#222"]} style={gameStyles.resultBtnGrad}>
            <Text style={[gameStyles.resultBtnText, { color: "#ccc" }]}>{T("returnMenu")}</Text>
          </LinearGradient>
        </BouncePressable>
      </Animated.View>
    </View>
  );
}

// ─── Rival abandoned overlay ──────────────────────────────────────────────
function RivalAbandonedOverlay({ rivalName, onClaim, onPlayAgain }: {
  rivalName: string; onClaim: () => void; onPlayAgain: () => void;
}) {
  const T = useT();
  const sc = useSharedValue(0.8);
  const op = useSharedValue(0);
  useEffect(() => {
    sc.value = withSpring(1, { damping: 12 });
    op.value = withTiming(1, { duration: 350 });
  }, []);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }], opacity: op.value }));
  return (
    <View style={raStyles.overlay}>
      <Animated.View style={[raStyles.card, aStyle]}>
        <LinearGradient colors={["#041A04", "#062206", "#041A04"]} style={raStyles.grad}>
          <View style={raStyles.iconWrap}>
            <Ionicons name="exit" size={44} color="#E74C3C" />
          </View>
          <Text style={raStyles.rivalTxt}>{rivalName}</Text>
          <Text style={raStyles.mainTitle}>{T("rivalAbandoned")}</Text>
          <Text style={raStyles.autoVic}>{T("autoVictory")}</Text>
          <Text style={raStyles.sub}>{T("rivalAbandonedSub")}</Text>
          <View style={raStyles.trophyRow}>
            {[0, 1, 2].map(i => (
              <Ionicons key={i} name="trophy" size={26} color={Colors.gold} />
            ))}
          </View>
          <BouncePressable onPress={onClaim} style={raStyles.claimBtn}>
            <LinearGradient colors={[Colors.gold, "#A07800"]} style={raStyles.claimGrad}>
              <Ionicons name="checkmark-circle" size={18} color="#1a0a00" />
              <Text style={raStyles.claimTxt}>{T("autoVictory")}</Text>
            </LinearGradient>
          </BouncePressable>
          <BouncePressable onPress={onPlayAgain} style={raStyles.againBtn}>
            <Text style={raStyles.againTxt}>{T("playAgain")}</Text>
          </BouncePressable>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
const raStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", zIndex: 200 },
  card: { width: 300, borderRadius: 24, overflow: "hidden", borderWidth: 2, borderColor: Colors.gold + "44" },
  grad: { padding: 28, alignItems: "center", gap: 10 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#E74C3C22", borderWidth: 2, borderColor: "#E74C3C44", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  rivalTxt: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 },
  mainTitle: { fontFamily: "Nunito_700Bold", fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  autoVic: { fontFamily: "Nunito_800ExtraBold", fontSize: 26, color: Colors.gold, textAlign: "center" },
  sub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" },
  trophyRow: { flexDirection: "row", gap: 12, marginVertical: 4 },
  claimBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 4 },
  claimGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  claimTxt: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#1a0a00" },
  againBtn: { paddingVertical: 10 },
  againTxt: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "rgba(255,255,255,0.45)" },
});

// ─── Ranked promotion / demotion overlay ──────────────────────────────────
function OLPromotionStar({ idx }: { idx: number }) {
  const sc = useSharedValue(0);
  const rot = useSharedValue(-30);
  useEffect(() => {
    setTimeout(() => {
      sc.value = withSpring(1, { damping: 4, stiffness: 250 });
      rot.value = withSpring(0, { damping: 8 });
    }, 500 + idx * 150);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }, { rotate: `${rot.value}deg` }] }));
  return <Animated.View style={style}><Ionicons name="star" size={26} color={Colors.gold} /></Animated.View>;
}

function RankedResultOverlay({ type, onDone }: { type: "promotion" | "demotion"; onDone: () => void }) {
  const T = useT();
  const { width: SW, height: SH } = useWindowDimensions();
  const sc = useSharedValue(0.4);
  const op = useSharedValue(0);
  const iconBounce = useSharedValue(0);
  const flash = useSharedValue(0);
  const isPromo = type === "promotion";
  const accentColor = isPromo ? Colors.gold : "#E74C3C";

  useEffect(() => {
    flash.value = withSequence(
      withTiming(isPromo ? 0.6 : 0.4, { duration: 100 }),
      withTiming(0, { duration: 350 }),
    );
    sc.value = withSpring(1, { damping: isPromo ? 5 : 10, stiffness: 160 });
    op.value = withTiming(1, { duration: 250 });
    iconBounce.value = withDelay(200, withSpring(1, { damping: 5, stiffness: 200 }));
    const t = setTimeout(onDone, isPromo ? 4000 : 3000);
    return () => clearTimeout(t);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }], opacity: op.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconBounce.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.88)", alignItems: "center", justifyContent: "center", zIndex: 250 } as any}>
      {isPromo && <OLWinConfetti SW={SW} SH={SH} />}
      <Animated.View style={[StyleSheet.absoluteFill, flashStyle, { backgroundColor: accentColor, pointerEvents: "none" } as any]} />
      <Animated.View style={[{
        width: 310, borderRadius: 24, overflow: "hidden",
        borderWidth: isPromo ? 2.5 : 2, borderColor: accentColor + "66",
        shadowColor: accentColor, shadowRadius: isPromo ? 28 : 10, shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 0 }, elevation: 20,
      }, animStyle]}>
        <LinearGradient
          colors={isPromo ? ["#1A1400", "#2A2000", "#1A1400"] : ["#1A0000", "#280000", "#1A0000"]}
          style={{ padding: 32, alignItems: "center", gap: 14 } as any}
        >
          <Animated.View style={iconStyle}>
            <Ionicons name={isPromo ? "arrow-up-circle" : "arrow-down-circle"} size={64} color={accentColor} />
          </Animated.View>
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 28, color: accentColor, textAlign: "center" }}>
            {isPromo ? (T("rankPromoted" as any) || "¡Subiste de rango!") : (T("rankDemoted" as any) || "Bajaste de rango")}
          </Text>
          <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 18 }}>
            {isPromo ? (T("rankPromotedSub" as any) || "¡Sigue así!") : (T("rankDemotedSub" as any) || "Puedes recuperarte")}
          </Text>
          {isPromo ? (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              {[0, 1, 2, 3, 4].map(i => <OLPromotionStar key={i} idx={i} />)}
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              {[0, 1, 2, 3, 4].map(i => <Ionicons key={i} name="star-outline" size={22} color="#E74C3C55" />)}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function OnlineGameScreen() {
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const params = useLocalSearchParams<{ count?: string; rivalName?: string; code?: string; pidx?: string; mode?: string; skipLobby?: string; names?: string; rivalIndices?: string }>();
  const { profile, level: playerLevel, addXp, updateRanked, recordRankedAbandon, recordGameResult, updateAchievementProgress, addChestToInventory, openChestFromInventory, chestInventory, chestInventoryLimit } = useProfile();
  const T = useT();

  const isOnline = !!params.code;
  const skipLobby = params.skipLobby === "true";
  const onlineCode = params.code ?? "";
  const serverPidx = parseInt(params.pidx ?? "0", 10);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const cardBack = CARD_BACKS.find(b => b.id === profile.cardBackId) ?? CARD_BACKS[0];
  const backColors = (cardBack.backColors ?? ["#1E4080", "#0e2248", "#0a1832"]) as [string, string, string];
  const backAccent = cardBack.backAccent ?? "#D4AF37";
  const backPattern = (cardBack.backPattern ?? "diamonds") as "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";
  const cardDesign = getCardDesignById(profile.cardDesignId ?? "face_default");
  const cardColors = cardDesign.isDefault ? undefined : (cardDesign.backColors ?? undefined) as [string, string, string] | undefined;

  const tableDesign = getTableDesignById(profile.tableDesignId ?? "table_casino");
  const tableBg = tableDesign.backColors?.[0] ?? "#041008";
  const tableAccent = tableDesign.backColors?.[1] ?? "#061510";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;
  const headerH = 50;
  const zoneH = SH - topPad - botPad - headerH;
  const tableW = Math.min(SW * 0.72, 290);
  const tableH = tableW * 0.62;
  const tableCenterY = zoneH * 0.44;

  const playerCount = Math.min(4, Math.max(2, parseInt(params.count ?? "3", 10)));
  const modeParam = params.mode || "classic";

  const [currentCpuProfiles, setCurrentCpuProfiles] = useState<CpuProfile[]>(() => {
    // Task #125 — when matchmaking already picked specific rivals (ranked
    // lobby, online direct-search), it forwards their indices via params so
    // we can rebuild the *exact same* CpuProfile objects here. Guarantees
    // the avatar/name/level shown in the matchmaking reveal is the avatar
    // faced in the actual game.
    const indicesParam = params.rivalIndices;
    let profiles: CpuProfile[];
    if (indicesParam) {
      const indices = indicesParam
        .split(",")
        .map(s => parseInt(s, 10))
        .filter(n => Number.isFinite(n) && n >= 0);
      if (indices.length >= playerCount - 1) {
        profiles = indices
          .slice(0, playerCount - 1)
          .map(i => rivalToCpuProfile(generateRival(i)));
      } else {
        profiles = pickCpuProfiles(
          playerCount - 1,
          playerLevel || 1,
          modeParam === "ranked" ? { rankedRank: profile.rankedProfile.rank } : undefined,
        );
      }
    } else {
      profiles = pickCpuProfiles(
        playerCount - 1,
        playerLevel || 1,
        modeParam === "ranked" ? { rankedRank: profile.rankedProfile.rank } : undefined,
      );
    }
    if (params.names) {
      params.names.split(",").forEach((name, i) => {
        if (name.trim() && profiles[i]) {
          profiles[i] = { ...profiles[i], name: name.trim() };
        }
      });
    } else if (params.rivalName && profiles.length > 0) {
      profiles[0] = { ...profiles[0], name: params.rivalName };
    }
    return profiles;
  });
  const humanName = profile.name || T("you");

  // All player names: human is index 0, CPUs are 1..n
  const allNames = [humanName, ...currentCpuProfiles.map(c => c.name)];

  // Lobby state — online/skipLobby games start directly in "dealing" phase
  const [lobbyPhase, setLobbyPhase] = useState<"searching" | "found" | "countdown" | "dealing" | "game" | "result">(
    (isOnline || skipLobby) ? "dealing" : "searching"
  );
  const [joinedCount, setJoinedCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [rivalAbandoned, setRivalAbandoned] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  // Task #125 — guard so a single match can only register one abandono no
  // matter how many paths trip it (exit modal, app background, disconnect).
  const rankedAbandonRecordedRef = useRef(false);
  const [disconnectedPlayerMsg, setDisconnectedPlayerMsg] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "reconnecting" | "reconnected">("connected");

  // Intercept Android hardware back button → show confirm modal instead of
  // leaving silently. Shared logic with single-player and local multi.
  useGameBackHandler({ visible: showExitModal, setVisible: setShowExitModal });

  // ─── In-game menu ────────────────────────────────────────────────────────
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [menuCountdown, setMenuCountdown] = useState(10);
  const menuCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [inGameMusicEnabled, setInGameMusicEnabled] = useState(true);
  const [inGameSfxEnabled, setInGameSfxEnabled] = useState(profile.sfxEnabled ?? true);
  const [muteCpuEmotes, setMuteCpuEmotes] = useState(false);
  const [rankedPromotion, setRankedPromotion] = useState<"promotion" | "demotion" | null>(null);
  const [showChestModal, setShowChestModal] = useState(false);
  const [pendingChestType, setPendingChestType] = useState<ChestType | null>(null);
  const [chestModalReward, setChestModalReward] = useState<ChestReward | null>(null);
  const rankedUpdatedRef = useRef(false);
  const resultRecordedRef = useRef(false);

  // ─── Emote system ─────────────────────────────────────────────────────────
  const [playerEmote, setPlayerEmote] = useState<Emote | null>(null);
  const [cpuEmote, setCpuEmote] = useState<Emote | null>(null);
  const [lastPlayerEmoteTime, setLastPlayerEmoteTime] = useState(0);
  const cpuEmoteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Visual effects (card play, last card banner, floating label) ─────────
  const [showEffect, setShowEffect] = useState(false);
  const [showLastCardBanner, setShowLastCardBanner] = useState(false);
  const [floatingLabel, setFloatingLabel] = useState<string | null>(null);
  const [floatingLabelColor, setFloatingLabelColor] = useState("#FFFFFF");
  const floatAnim = useSharedValue(0);
  const floatLabelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(floatAnim.value, { duration: 200 }),
    transform: [{ translateY: withSpring(floatAnim.value === 1 ? -20 : 0) }],
  }));

  const showFloatLabel = (text: string, color: string) => {
    setFloatingLabel(text);
    setFloatingLabelColor(color);
    floatAnim.value = 1;
    setTimeout(() => { floatAnim.value = 0; setTimeout(() => setFloatingLabel(null), 300); }, 1200);
  };
  const prevHandCount = useRef<number>(7);
  const prevPendingDraw = useRef(0);

  // Game state
  const [gameState, setGameState] = useState<MultiGameState | null>(null);

  // Task #125 — abandono ranked also fires when the player backgrounds /
  // kills the app or loses connection mid-match. Mirrors the exit-modal
  // path: -1 star, counts as a loss, escalates the matchmaking cooldown.
  // Single-fire per match via rankedAbandonRecordedRef.
  const recordRankedAbandonRef = useRef(recordRankedAbandon);
  useEffect(() => { recordRankedAbandonRef.current = recordRankedAbandon; }, [recordRankedAbandon]);
  useEffect(() => {
    if (modeParam !== "ranked") return;
    const tryRecordAbandon = () => {
      if (rankedAbandonRecordedRef.current) return;
      const inProgress = gameState
        && (gameState.phase === "playing" || gameState.phase === "choosing_suit")
        && !rivalAbandoned
        && lobbyPhase === "game";
      if (!inProgress) return;
      rankedAbandonRecordedRef.current = true;
      try { recordRankedAbandonRef.current(); } catch {}
      // Defensive: lock the end-of-match ranked update so if the player
      // returns and the game still resolves naturally (or any code path
      // reaches the result effect), no second star delta is applied.
      rankedUpdatedRef.current = true;
      // NOTE: deliberately NOT setting rivalAbandoned=true — that flag
      // drives the "rival abandoned" overlay UX, which is wrong wording
      // for a self-abandon. The rankedAbandonRecordedRef + rankedUpdatedRef
      // guards already prevent any double-penalty.
    };
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive") tryRecordAbandon();
    });
    let socket: ReturnType<typeof getSocket> | null = null;
    if (isOnline) {
      try {
        socket = getSocket();
        socket.on("disconnect", tryRecordAbandon);
      } catch {}
    }
    return () => {
      sub.remove();
      if (socket) {
        try { socket.off("disconnect", tryRecordAbandon); } catch {}
      }
    };
  }, [modeParam, gameState, lobbyPhase, rivalAbandoned, isOnline]);
  // Daily-challenge counters scoped to the local player's actions only.
  // These mirror `cardsPlayedThisGame` / `eightsPlayedThisGame` from the
  // single-player session in context/GameContext.tsx.
  const cardsPlayedRef = useRef(0);
  const eightsPlayedRef = useRef(0);
  const cardsDrawnRef = useRef(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const cpuThinking = useRef(false);
  const [showYourTurnFlash, setShowYourTurnFlash] = useState(false);
  const prevPlayerIdxRef = useRef(-1);
  const [inactivityProgress, setInactivityProgress] = useState(1);
  const [showInactivityBar, setShowInactivityBar] = useState(false);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActionTime = useRef(Date.now());
  const [showEventBanner, setShowEventBanner] = useState(false);
  const eventBannerShownRef = useRef(false);
  const [eventShuffleFlash, setEventShuffleFlash] = useState(false);

  // ─── Last card banner & floating pendingDraw label ───────────────────────
  useEffect(() => {
    if (!gameState) return;
    const count = gameState.hands[0]?.length ?? 7;
    if (count === 1 && prevHandCount.current > 1) {
      setShowLastCardBanner(true);
      playSound("last_card").catch(() => {});
      setTimeout(() => setShowLastCardBanner(false), 2200);
    }
    prevHandCount.current = count;
  }, [gameState?.hands]);

  useEffect(() => {
    if (!gameState) return;
    const pd = gameState.pendingDraw ?? 0;
    if (pd > prevPendingDraw.current && gameState.currentPlayerIndex === 0) {
      showFloatLabel(`+${pd}`, "#E74C3C");
    }
    prevPendingDraw.current = pd;
  }, [gameState?.pendingDraw]);

  // ─── "YOUR TURN" flash — triggers when turn rotates to the local player ──
  useEffect(() => {
    if (!gameState || lobbyPhase !== "game") return;
    const curr = gameState.currentPlayerIndex;
    if (curr === 0 && prevPlayerIdxRef.current !== 0 && prevPlayerIdxRef.current !== -1) {
      setShowYourTurnFlash(true);
      const t = setTimeout(() => setShowYourTurnFlash(false), 1200);
      prevPlayerIdxRef.current = 0;
      return () => clearTimeout(t);
    }
    prevPlayerIdxRef.current = curr;
  }, [gameState?.currentPlayerIndex, lobbyPhase]);

  // ─── Online WebSocket setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline) return;

    const s = getSocket();
    socketRef.current = s;

    s.off("game_state");
    s.off("game_over");
    s.off("player_left");
    s.off("player_disconnected");
    s.off("disconnect");
    s.off("connect");
    s.off("reconnect");

    // Surface socket disconnect / reconnect to the player so they're not stuck
    // staring at a frozen board with no feedback.
    s.on("disconnect", () => {
      setConnectionStatus("reconnecting");
    });
    const handleConnected = () => {
      setConnectionStatus(prev => (prev === "reconnecting" ? "reconnected" : "connected"));
      setTimeout(() => {
        setConnectionStatus(curr => (curr === "reconnected" ? "connected" : curr));
      }, 1800);
    };
    s.on("connect", handleConnected);
    s.on("reconnect", handleConnected);

    s.on("game_state", (srv: ServerGameState) => {
      try {
        const local = buildLocalState(srv);
        setGameState(local);
        setLobbyPhase(prev => (prev === "dealing" || prev === "game") ? "game" : prev);
        if (local.phase === "game_over") {
          setLobbyPhase("result");
          stopMusic().catch(() => {});
          // Player index 0 is always "me" after rotation in buildLocalState.
          const iWon = local.winnerIndex === 0;
          // Task #124 — end-of-match result cues shared with offline modes.
          if (iWon) playVictory().catch(() => {});
          else playDefeat().catch(() => {});
        }
      } catch {
      }
    });

    s.on("game_over", () => {
      setLobbyPhase("result");
    });

    s.on("player_left", () => {
      setRivalAbandoned(true);
    });

    // Player left during an active game — converted to bot on server side,
    // game continues. Show a brief notification to remaining players.
    s.on("player_disconnected", ({ playerName }: { playerName: string; playerIndex: number }) => {
      const msg = `${playerName} salió → Rival (IA)`;
      setDisconnectedPlayerMsg(msg);
      setTimeout(() => setDisconnectedPlayerMsg(null), 3500);
    });

    return () => {
      s.off("game_state");
      s.off("game_over");
      s.off("player_left");
      s.off("player_disconnected");
      s.off("disconnect");
      s.off("connect");
      s.off("reconnect");
    };
  }, [isOnline]);

  // ─── Skip-lobby: initialize game immediately for ranked (pre-lobbied) games ──
  // Music is owned by app/_layout.tsx AudioManager (game-online is in
  // GAME_MUSIC_ROUTES), so we don't touch music here.
  useEffect(() => {
    if (!skipLobby) return;
    const gs = initMultiGame(allNames, 8, modeParam === "ranked" ? null : (getActiveEvent(playerLevel)?.id ?? null));
    gs.phase = "playing";
    setGameState(gs);
  }, [skipLobby]);

  // ─── Stop music + result cue when local game ends (online socket path handles its own) ──
  const localResultCueFiredRef = useRef(false);
  useEffect(() => {
    if (isOnline) return;
    if (!gameState || gameState.phase !== "game_over") return;
    stopMusic().catch(() => {});
    // Task #124 — fire victory/defeat for the local fallback path so result
    // cues play in every mode, not just the socket-driven online path. Guard
    // with a ref so it only fires once per match.
    if (gameState.winnerIndex !== null && !localResultCueFiredRef.current) {
      localResultCueFiredRef.current = true;
      if (gameState.winnerIndex === 0) {
        playVictory().catch(() => {});
      } else {
        playDefeat().catch(() => {});
      }
    }
  }, [gameState?.phase, gameState?.winnerIndex, isOnline]);

  // ─── Ranked star update when game ends ───────────────────────────────────
  useEffect(() => {
    if (modeParam !== "ranked") return;
    if (!gameState || gameState.phase !== "game_over") return;
    if (gameState.winnerIndex === null) return;
    if (rankedUpdatedRef.current) return;
    rankedUpdatedRef.current = true;
    const isWin = gameState.winnerIndex === 0;
    updateRanked(isWin ? 1 : -1);
    setRankedPromotion(isWin ? "promotion" : "demotion");
    // Task #74 — distinct ranked-victory voice cue (separate from the rank-up
    // cue fired by ProfileContext.updateRanked). Plays on every ranked win
    // even when the win doesn't trigger a promotion. Gated by voiceFxEnabled.
    if (isWin) {
      setTimeout(() => { playOchoLocosVoice().catch(() => {}); }, 250);
    }
  }, [gameState?.phase, gameState?.winnerIndex, modeParam]);

  // ─── Record game result (XP + coins) when game ends ───────────────────────
  useEffect(() => {
    if (!gameState || gameState.phase !== "game_over") return;
    if (gameState.winnerIndex === null) return;
    if (resultRecordedRef.current) return;
    resultRecordedRef.current = true;
    const isWin = gameState.winnerIndex === 0;
    const mode = (modeParam || "classic") as any;
    const mc = getModeById(mode);
    // Loss floor: recordGameResult deducts xpLoss=10 internally for non-practice
    // losses, so we add +10 above the floor to guarantee net >= 10 XP shown to the player.
    const xp = isWin ? mc.xpReward : Math.max(mc.xpLoss, 10) + (mode !== "practice" ? 10 : 0);
    const coins = isWin ? mc.coinsReward : Math.max(mc.coinsLoss, 5);
    const evId = gameState.eventId ?? null;
    recordGameResult({ won: isWin, mode, difficulty: "normal", coinsEarned: coins, xpEarned: xp, eightsPlayed: eightsPlayedRef.current, cardsDrawn: cardsDrawnRef.current, isPerfect: false, isComeback: false, gameDurationMs: 60000, eventId: evId });
    // Daily challenge progress (event-aware) — mirrors single-player
    // behaviour in app/game.tsx so daily challenges advance from online
    // matches as well, both on win and loss.
    if (isWin) {
      updateChallengeProgress("wins", 1, mode, false, evId);
    }
    updateChallengeProgress("play_mode", 1, mode, false, evId);
    updateChallengeProgress("cards_played", cardsPlayedRef.current, mode, false, evId);
    updateChallengeProgress("specials", eightsPlayedRef.current, mode, false, evId);
    if (isWin && evId) {
      updateAchievementProgress("event_any_win", 1);
      if (evId === "speed")    updateAchievementProgress("event_speed_win", 1);
      if (evId === "random")   updateAchievementProgress("event_random_win", 1);
      if (evId === "double")   updateAchievementProgress("event_double_win", 1);
      if (evId === "survival") updateAchievementProgress("event_survival_win", 1);
      const priorWinsForEvent = (profile.stats.winsByEvent ?? {})[evId] ?? 0;
      if (priorWinsForEvent === 0) {
        updateAchievementProgress("event_versatile", 1);
      }
    }
    if (isWin) {
      const newTotalWins = profile.stats.totalWins + 1;
      let chestType: ChestType | null = null;
      if (newTotalWins % 25 === 0) chestType = "legendary";
      else if (newTotalWins % 15 === 0) chestType = "epic";
      else if (newTotalWins % 7 === 0) chestType = "rare";
      else if (newTotalWins % 3 === 0) chestType = "common";
      if (chestType) {
        const result = addChestToInventory(chestType, "win");
        if (result.added) {
          setPendingChestType(chestType);
        } else {
          const lang: Lang = (profile.language ?? "es") as Lang;
          Alert.alert(
            t("chestInventoryFullTitle", lang),
            t(result.queued ? "chestQueuedWinMsg" : "chestLostWinMsg", lang),
            [{ text: t("gotItBtn", lang) }]
          );
        }
      }
    }
  }, [gameState?.phase, gameState?.winnerIndex]);

  // ─── Lobby sequence (local/simulated only — skip when real online socket or pre-lobbied) ──
  useEffect(() => {
    if (isOnline || skipLobby) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 1200;

    playSound("searching").catch(() => {});

    for (let i = 0; i < playerCount - 1; i++) {
      const d = delay + Math.random() * 2000;
      timers.push(setTimeout(() => setJoinedCount(prev => prev + 1), d));
      delay = d + 1500 + Math.random() * 1000;
    }

    const searchTime = 6000 + Math.random() * 6000;
    const finalSearchDelay = Math.max(delay, searchTime);

    timers.push(setTimeout(() => {
      setLobbyPhase("found");
    }, finalSearchDelay));
    
    let currentDelay = finalSearchDelay + 800;
    timers.push(setTimeout(() => setLobbyPhase("countdown"), currentDelay));
    currentDelay += 400;

    for (let c = 3; c >= 1; c--) {
      const cVal = c;
      timers.push(setTimeout(() => setCountdown(cVal), currentDelay));
      currentDelay += 1000;
    }

    timers.push(setTimeout(() => {
      const gs = initMultiGame(allNames, 8, modeParam === "ranked" ? null : (getActiveEvent(playerLevel)?.id ?? null));
      gs.phase = "playing"; // Online starts directly, no pass_device for human
      setGameState(gs);
      setLobbyPhase("dealing");
    }, currentDelay));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleDealingComplete = useCallback(() => {
    setLobbyPhase("game");
    // Music handled by app/_layout.tsx AudioManager (game-online is a game route).
  }, []);

  // ─── In-game menu handlers ────────────────────────────────────────────────
  function openGameMenu() {
    setShowGameMenu(true);
    setMenuCountdown(10);
    if (menuCountdownRef.current) clearInterval(menuCountdownRef.current);
    menuCountdownRef.current = setInterval(() => {
      setMenuCountdown(c => {
        if (c <= 1) {
          clearInterval(menuCountdownRef.current!);
          menuCountdownRef.current = null;
          setShowGameMenu(false);
          return 10;
        }
        return c - 1;
      });
    }, 1000);
  }

  function closeGameMenu() {
    setShowGameMenu(false);
    if (menuCountdownRef.current) { clearInterval(menuCountdownRef.current); menuCountdownRef.current = null; }
    setMenuCountdown(10);
  }

  // ─── Rival abandoned: ~8% chance a CPU rival "disconnects" 10-25s into game ──
  // Only applies to simulated (non-socket) games — real online games handle
  // disconnections via the server's player_disconnected / player_left events.
  useEffect(() => {
    if (isOnline) return;
    if (lobbyPhase !== "game" || rivalAbandoned) return;
    if (Math.random() > 0.08) return; // 8% chance per simulated game
    const delay = 10000 + Math.random() * 15000; // 10-25 seconds in
    const t = setTimeout(() => {
      if (lobbyPhase === "game") setRivalAbandoned(true);
    }, delay);
    return () => clearTimeout(t);
  }, [lobbyPhase, isOnline]);

  // ─── CPU auto-play ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameState || lobbyPhase !== "game") return;
    if (gameState.phase === "game_over") return;
    const pidx = gameState.currentPlayerIndex;

    if (gameState.phase === "pass_device") {
      // Auto-confirm pass_device for ALL players in online mode (no physical device passing)
      const t = setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.phase !== "pass_device") return prev;
          return multiConfirmTurn(prev);
        });
      }, 280);
      return () => clearTimeout(t);
    }

    if (pidx === 0) return; // Human's turn for non-pass_device phases

    if (gameState.phase === "choosing_suit") {
      // CPU picks the suit it has the most of in its hand
      const cpuHand = gameState.hands[pidx] ?? [];
      const counts: Record<string, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
      for (const card of cpuHand) {
        if (card.suit && card.suit in counts) counts[card.suit]++;
      }
      const sorted = (Object.entries(counts) as [Suit, number][]).sort(([, a], [, b]) => b - a);
      const bestSuit = sorted[0]?.[0] ?? "spades";
      const t = setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.currentPlayerIndex !== pidx) return prev;
          return multiChooseSuit(prev, bestSuit as Suit);
        });
      }, 320);
      return () => clearTimeout(t);
    }

    if (gameState.phase === "playing" && !cpuThinking.current) {
      cpuThinking.current = true;
      const delay = 800 + Math.random() * 700;
      const t = setTimeout(() => {
        cpuThinking.current = false;
        setGameState(prev => {
          if (!prev || prev.currentPlayerIndex !== pidx) return prev;
          const acted = prev.currentPlayerIndex;
          // Ranked progressive difficulty: easy for ranks 0-2 (Bronce/Plata),
          // normal for 3-7, hard for 8+ (Diamante+).
          const r = profile.rankedProfile?.rank ?? 0;
          const diff = modeParam === "ranked"
            ? (r <= 2 ? "easy" : r >= 8 ? "hard" : "normal")
            : "normal";
          return cpuPlayMulti(prev, diff);
        });
      }, delay);
      return () => {
        clearTimeout(t);
        cpuThinking.current = false;
      };
    }
  }, [gameState?.turnId, gameState?.phase, lobbyPhase]);

  // ─── Inactivity timer (auto-draw after 30s idle; bar appears at 20s warning) ──
  // Speed event shortens this to a 5s per-turn timer that's always visible.
  // Source of truth is the authoritative gameState.eventId from the server
  // (or from offline initMultiGame) — never the client's level-gated lobby view.
  const onlineEventConfig = React.useMemo(
    () => getEventConfig(gameState?.eventId ?? null),
    [gameState?.eventId],
  );

  // Event mode intro banner — show once when the match begins (after dealing)
  useEffect(() => {
    if (lobbyPhase !== "game") return;
    if (!onlineEventConfig) return;
    if (eventBannerShownRef.current) return;
    eventBannerShownRef.current = true;
    setShowEventBanner(true);
    const t = setTimeout(() => setShowEventBanner(false), 3200);
    return () => clearTimeout(t);
  }, [lobbyPhase, onlineEventConfig]);
  const INACTIVITY_TIMEOUT = onlineEventConfig?.turnSeconds ?? 30;
  const INACTIVITY_SHOW_DELAY = onlineEventConfig?.turnSeconds ? 0 : 20;
  const speedLastTickSecRef = useRef<number>(-1);
  useEffect(() => {
    const isActive =
      gameState?.phase === "playing" &&
      gameState?.currentPlayerIndex === 0 &&
      lobbyPhase === "game";
    const isSpeedEvent = !!onlineEventConfig?.turnSeconds;

    if (isActive) {
      lastActionTime.current = Date.now();
      setShowInactivityBar(false);
      setInactivityProgress(1);
      speedLastTickSecRef.current = -1;
      if (inactivityRef.current) clearInterval(inactivityRef.current);
      inactivityRef.current = setInterval(() => {
        const elapsed = (Date.now() - lastActionTime.current) / 1000;
        const prog = Math.max(0, 1 - elapsed / INACTIVITY_TIMEOUT);
        setInactivityProgress(prog);
        if (elapsed >= INACTIVITY_SHOW_DELAY) {
          setShowInactivityBar(true);
        }
        if (isSpeedEvent) {
          const secsLeft = Math.ceil(prog * INACTIVITY_TIMEOUT);
          if ((secsLeft === 2 || secsLeft === 1) && secsLeft !== speedLastTickSecRef.current) {
            speedLastTickSecRef.current = secsLeft;
            playSpeedTick().catch(() => {});
          }
        }
        if (prog <= 0 && inactivityRef.current) {
          clearInterval(inactivityRef.current);
          inactivityRef.current = null;
          setShowInactivityBar(false);
          if (isOnline) {
            // Online rooms are server-authoritative — emit to the server so
            // the turn timeout (e.g. Speed event) is enforced consistently
            // for every client. The server will reject if it's not our turn.
            socketRef.current?.emit("draw_card");
          } else {
            setGameState(prev => {
              if (!prev || prev.phase !== "playing" || prev.currentPlayerIndex !== 0) return prev;
              return multiDraw(prev);
            });
          }
          setSelectedCard(null);
        }
      }, 100);
    } else {
      if (inactivityRef.current) {
        clearInterval(inactivityRef.current);
        inactivityRef.current = null;
      }
      setInactivityProgress(1);
      setShowInactivityBar(false);
    }
    return () => {
      if (inactivityRef.current) {
        clearInterval(inactivityRef.current);
        inactivityRef.current = null;
      }
    };
  }, [gameState?.currentPlayerIndex, gameState?.phase, lobbyPhase, gameState?.turnId, INACTIVITY_TIMEOUT, INACTIVITY_SHOW_DELAY]);

  // ─── "Cartas Aleatorias" event (offline): shuffle active suit every 4 turns ──
  // Online matches handle this on the server; see the suit-change detector
  // below for the online flash trigger.
  const lastShuffleTurnRef = useRef<number>(-1);
  useEffect(() => {
    if (isOnline) return;
    if (!gameState) return;
    if (gameState.eventId !== "random") return;
    if (gameState.phase !== "playing" && gameState.phase !== "pass_device") return;
    if (gameState.pendingDraw > 0) return;
    const tid = gameState.turnId ?? 0;
    if (tid === 0 || tid % 4 !== 0) return;
    if (lastShuffleTurnRef.current === tid) return;
    lastShuffleTurnRef.current = tid;
    setGameState(prev => (prev ? multiApplyRandomShuffle(prev) : prev));
    setEventShuffleFlash(true);
    const t = setTimeout(() => setEventShuffleFlash(false), 1200);
    return () => clearTimeout(t);
  }, [gameState?.turnId, gameState?.phase, gameState?.pendingDraw, gameState?.eventId, isOnline]);

  // ─── "Cartas Aleatorias" event (online): detect server-applied shuffles ────
  // multiApplyRandomShuffle changes currentSuit WITHOUT advancing turnId,
  // while every other suit change (8s, jokers, normal plays) bumps turnId.
  // So a same-turn suit change under the random event is a server shuffle.
  const prevSuitRef = useRef<Suit | null>(null);
  const prevTurnIdForSuitRef = useRef<number>(-1);
  useEffect(() => {
    if (!gameState) {
      prevSuitRef.current = null;
      prevTurnIdForSuitRef.current = -1;
      return;
    }
    const tid = gameState.turnId ?? 0;
    const suit = gameState.currentSuit;
    const prevSuit = prevSuitRef.current;
    const prevTid = prevTurnIdForSuitRef.current;
    prevSuitRef.current = suit;
    prevTurnIdForSuitRef.current = tid;
    if (!isOnline) return;
    if (gameState.eventId !== "random") return;
    if (prevSuit === null) return;
    if (prevSuit === suit) return;
    if (prevTid !== tid) return;
    setEventShuffleFlash(true);
    const t = setTimeout(() => setEventShuffleFlash(false), 1200);
    return () => clearTimeout(t);
  }, [gameState?.currentSuit, gameState?.turnId, gameState?.eventId, isOnline]);

  // ─── CPU emote timer (random emotes every 20-60s during gameplay) ─────────
  useEffect(() => {
    if (lobbyPhase !== "game" || gameState?.phase !== "playing") {
      if (cpuEmoteTimerRef.current) { clearInterval(cpuEmoteTimerRef.current); cpuEmoteTimerRef.current = null; }
      return;
    }
    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 40000;
      cpuEmoteTimerRef.current = setTimeout(() => {
        if (!muteCpuEmotes) {
          const emote = EMOTES[Math.floor(Math.random() * EMOTES.length)];
          setCpuEmote(emote);
          setTimeout(() => setCpuEmote(null), 2800);
        }
        scheduleNext();
      }, delay) as any;
    };
    scheduleNext();
    return () => { if (cpuEmoteTimerRef.current) { clearTimeout(cpuEmoteTimerRef.current); cpuEmoteTimerRef.current = null; } };
  }, [lobbyPhase, gameState?.phase, muteCpuEmotes]);

  const handleSendEmote = useCallback((emote: Emote) => {
    const now = Date.now();
    setLastPlayerEmoteTime(now);
    setPlayerEmote(emote);
    setTimeout(() => setPlayerEmote(null), 2800);
  }, []);

  // ─── Player card interactions ────────────────────────────────────────────
  const isPlaying = gameState?.phase === "playing" && gameState?.currentPlayerIndex === 0;
  const currentHand = gameState?.hands[0] ?? [];
  const topCard = gameState ? multiGetTopCard(gameState) : null;

  const handleCardPress = useCallback((card: Card) => {
    if (!gameState || !isPlaying) return;
    if (!multiCanPlay(card, gameState)) { playCardFlip().catch(() => {}); return; }
    if (isOnline) {
      if (selectedCard?.id === card.id) {
        lastActionTime.current = Date.now();
        setShowInactivityBar(false);
        playCardFlip().catch(() => {});
        cardsPlayedRef.current += 1;
        if (card.rank === "8") eightsPlayedRef.current += 1;
        socketRef.current?.emit("play_card", { card });
        if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
          setShowEffect(true);
        }
        if (card.rank === "2") showFloatLabel("+2", "#E74C3C");
        else if (card.rank === "3") showFloatLabel("+3", "#E74C3C");
        else if (card.rank === "A") showFloatLabel("+1", "#9B59B6");
        else if (card.rank === "Joker") showFloatLabel("+4", "#9B59B6");
        setSelectedCard(null);
      } else {
        setSelectedCard(card);
      }
      return;
    }
    if (selectedCard?.id === card.id) {
      lastActionTime.current = Date.now();
      setShowInactivityBar(false);
      playCardFlip().catch(() => {});
      cardsPlayedRef.current += 1;
      if (card.rank === "8") eightsPlayedRef.current += 1;
      if (card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0)) {
        setGameState(multiPlayCard(gameState, card));
        if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
          setShowEffect(true);
        }
        return;
      }
      setGameState(multiPlayCard(gameState, card));
      setSelectedCard(null);
      if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
        setShowEffect(true);
      }
      // Special card floating labels (Ocho Locos ranks)
      if (card.rank === "2") showFloatLabel("+2", "#E74C3C");
      else if (card.rank === "3") showFloatLabel("+3", "#E74C3C");
      else if (card.rank === "A") showFloatLabel("+1", "#9B59B6");
      else if (card.rank === "Joker") showFloatLabel("+4", "#9B59B6");
    } else {
      setSelectedCard(card);
    }
  }, [gameState, isPlaying, selectedCard, isOnline]);

  const handleChooseSuit = useCallback((suit: Suit) => {
    if (!gameState) return;
    playCardFlip().catch(() => {});
    if (isOnline) {
      socketRef.current?.emit("choose_suit", { suit });
      if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
        setShowEffect(true);
      }
      setSelectedCard(null);
      return;
    }
    setGameState(multiChooseSuit(gameState, suit));
    setSelectedCard(null);
  }, [gameState, isOnline]);

  // Draw-to-hand feedback: snap + accent glow on the draw pile when a card is
  // pulled, mirroring the deal-flip arrival feedback for visual consistency.
  const drawFlash = useSharedValue(0);
  const drawScale = useSharedValue(1);
  const drawFlashStyle = useAnimatedStyle(() => ({
    opacity: drawFlash.value,
    transform: [{ scale: 1 + drawFlash.value * 0.18 }],
  }));
  const drawScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: drawScale.value }],
  }));

  const handleDraw = useCallback(() => {
    if (!gameState || !isPlaying) return;
    lastActionTime.current = Date.now();
    playCardDraw().catch(() => {});
    cardsDrawnRef.current += 1;
    drawScale.value = withSequence(
      withTiming(1.10, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 220 }),
    );
    drawFlash.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(0, { duration: 360 }),
    );
    if (isOnline) {
      socketRef.current?.emit("draw_card");
      setSelectedCard(null);
      return;
    }
    setGameState(multiDraw(gameState));
    setSelectedCard(null);
  }, [gameState, isPlaying, isOnline]);

  // ─── Play again with fresh opponent ─────────────────────────────────────
  const handlePlayAgain = React.useCallback(() => {
    if (isOnline) {
      ensureDisconnected();
      router.replace("/online-lobby");
      return;
    }
    if (modeParam === "ranked") {
      router.replace("/ranked-lobby");
      return;
    }
    const newProfiles = pickCpuProfiles(
      playerCount - 1,
      playerLevel || 1,
      modeParam === "ranked" ? { rankedRank: profile.rankedProfile.rank } : undefined,
    );
    setCurrentCpuProfiles(newProfiles);
    const newNames = [humanName, ...newProfiles.map(c => c.name)];
    // Clasificatoria is event-free: events are competitive distortions.
    const newEventId = modeParam === "ranked" ? null : (getActiveEvent(playerLevel)?.id ?? null);
    const gs = initMultiGame(newNames, 8, newEventId);
    gs.phase = "playing";
    setGameState(gs);
    setSelectedCard(null);
    cpuThinking.current = false;
    cardsPlayedRef.current = 0;
    eightsPlayedRef.current = 0;
    cardsDrawnRef.current = 0;
    resultRecordedRef.current = false;
    rankedUpdatedRef.current = false;
    localResultCueFiredRef.current = false;
    // Replay stays on /game-online, so the route-driven AudioManager doesn't
    // re-trigger. Game-over stopped the music, so explicitly restart it here
    // (user-initiated action — comparable to the in-game music toggle).
    // Routed through startGameMusicForMode so online matches share the same
    // per-mode track-routing pipeline as offline games.
    startGameMusicForMode("online").catch(() => {});
    // Re-arm the event intro banner so it appears for the new match too.
    eventBannerShownRef.current = false;
    if (newEventId) {
      eventBannerShownRef.current = true;
      setShowEventBanner(true);
      setTimeout(() => setShowEventBanner(false), 3200);
    }
  }, [playerCount, humanName, isOnline, modeParam, playerLevel, profile.rankedProfile.rank]);

  // ─── CPU zones (opponents around table) ──────────────────────────────────
  const cpuZonePositions = React.useMemo(() => {
    if (playerCount === 2) {
      return [{ idx: 1, pos: "top" as const }];
    }
    if (playerCount === 3) {
      return [
        { idx: 1, pos: "topLeft" as const },
        { idx: 2, pos: "topRight" as const },
      ];
    }
    return [
      { idx: 1, pos: "right" as const },
      { idx: 2, pos: "top" as const },
      { idx: 3, pos: "left" as const },
    ];
  }, [playerCount, modeParam]);

  const posStyles: Record<string, object> = {
    top: { position: "absolute" as const, top: 4, left: 0, right: 0, alignItems: "center" as const },
    topLeft: { position: "absolute" as const, top: 4, left: 8 },
    topRight: { position: "absolute" as const, top: 4, right: 8 },
    left: { position: "absolute" as const, top: tableCenterY - 80, left: 4 },
    right: { position: "absolute" as const, top: tableCenterY - 80, right: 4 },
    partnerRight: { position: "absolute" as const, bottom: 148, right: 8 },
  };

  // Show lobby
  if (lobbyPhase !== "game" && lobbyPhase !== "result") {
    if (lobbyPhase === "dealing") {
      if (isOnline && !gameState) {
        return (
          <View style={{ flex: 1, backgroundColor: "#020810", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <LinearGradient colors={["#020810", "#041530"]} style={StyleSheet.absoluteFill} />
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(212,175,55,0.1)", borderWidth: 1, borderColor: Colors.gold + "44", alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={Colors.gold} />
            </View>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: Colors.gold, letterSpacing: 4 }}>
              CARGANDO PARTIDA
            </Text>
          </View>
        );
      }
      if (gameState) {
        return (
          <View style={{ flex: 1, backgroundColor: "#020810" }}>
            <DealAnimation
              cardsPerPlayer={7}
              playerCards={gameState.hands[0]}
              starterCard={multiGetTopCard(gameState)}
              onComplete={handleDealingComplete}
              backColors={backColors}
              backAccent={backAccent}
              backPattern={backPattern}
              cardColors={cardColors}
              numOpponents={playerCount - 1}
            />
          </View>
        );
      }
    }

    if (!isOnline) {
      return (
        <LobbyScreen
          playerCount={playerCount}
          humanName={humanName}
          cpuProfiles={currentCpuProfiles}
          joinedCount={joinedCount}
          phase={lobbyPhase as "searching" | "found" | "countdown"}
          countdown={countdown}
        />
      );
    }
  }

  const gs = gameState!;
  const topSuitColor = suitColor(gs.currentSuit);
  const playableCount = isPlaying ? currentHand.filter(c => multiCanPlay(c, gs)).length : 0;

  const modePillColor = modeParam === "ranked" ? Colors.gold : "#2ecc71";
  const modePillLabel = modeParam === "ranked" ? "RANKED" : "ONLINE";

  const activeCpuIdx = gs.currentPlayerIndex > 0 ? gs.currentPlayerIndex - 1 : null;
  const activeCpuProfile = activeCpuIdx !== null ? (currentCpuProfiles[activeCpuIdx] ?? null) : null;

  return (
    <View style={[gameStyles.container, { paddingTop: topPad, backgroundColor: tableBg }]}>
      <LinearGradient
        colors={[tableBg, tableAccent, tableBg] as any}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle grid texture */}
      <View style={[gameStyles.gridOverlay, { pointerEvents: "none" } as any]} />

      {/* Header */}
      <View style={[gameStyles.header, { height: headerH }]}>
        <BouncePressable inline onPress={() => { playButton().catch(() => {}); setShowExitModal(true); }} style={gameStyles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={Colors.gold} />
        </BouncePressable>
        <View style={gameStyles.headerMid}>
          <View style={[gameStyles.onlinePill, { backgroundColor: modePillColor + "22", borderColor: modePillColor + "44" }]}>
            <View style={[gameStyles.onlinePillDot, { backgroundColor: modePillColor }]} />
            <Text style={[gameStyles.onlinePillText, { color: modePillColor }]}>{modePillLabel}</Text>
          </View>
          <Text style={gameStyles.headerTitle}>{playerCount} {T("players")}</Text>
          {onlineEventConfig && (
            <View style={[gameStyles.eventPill, { borderColor: onlineEventConfig.color + "66", backgroundColor: onlineEventConfig.color + "18" }]}>
              <Ionicons name={onlineEventConfig.icon as any} size={10} color={onlineEventConfig.color} />
              <Text style={[gameStyles.eventPillText, { color: onlineEventConfig.color }]} numberOfLines={1}>
                {T("eventLabel")} · {getEventShortName(onlineEventConfig.id, T).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={gameStyles.deckBadge}>
            <Ionicons name="layers-outline" size={12} color={Colors.textDim} />
            <Text style={gameStyles.deckCount}>{gs.drawPile.length}</Text>
          </View>
          <BouncePressable
            inline
            onPress={() => { playButton().catch(() => {}); openGameMenu(); }}
            style={gameStyles.menuHamburger}
            hitSlop={8}
          >
            <View style={gameStyles.hamLine} />
            <View style={[gameStyles.hamLine, { width: 14 }]} />
            <View style={gameStyles.hamLine} />
          </BouncePressable>
        </View>
      </View>

      {/* Random suit shuffle flash */}
      {eventShuffleFlash && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[gameStyles.shuffleFlashBanner, { pointerEvents: "none" } as any]}>
          <Ionicons name="shuffle" size={20} color="#9B59B6" />
          <Text style={gameStyles.shuffleFlashText}>{T("eventRandomShuffleBanner")}</Text>
        </Animated.View>
      )}

      {/* Event intro banner */}
      {showEventBanner && onlineEventConfig && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[gameStyles.eventBanner, { pointerEvents: "none" } as any]}>
          <LinearGradient colors={[onlineEventConfig.color, "#000"] as any} style={gameStyles.eventBannerInner}>
            <View style={gameStyles.eventBannerRow}>
              <Ionicons name={onlineEventConfig.icon as any} size={18} color="#fff" />
              <Text style={gameStyles.eventBannerTitle} numberOfLines={1}>
                {T("eventLabel")} · {getEventName(onlineEventConfig.id, T).toUpperCase()}
              </Text>
            </View>
            <Text style={gameStyles.eventBannerDesc} numberOfLines={2}>{getEventDesc(onlineEventConfig.id, T)}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Game zone */}
      <View style={[gameStyles.gameZone, { height: zoneH, paddingBottom: botPad }]}>

        {/* ─── Oval table ─── */}
        <View style={[gameStyles.tableOval, {
          width: tableW, height: tableH,
          left: SW / 2 - tableW / 2,
          top: tableCenterY - tableH / 2,
          borderRadius: tableH / 2,
          borderColor: tableAccent + "55",
          shadowColor: tableAccent,
        }]}>
          <LinearGradient
            colors={[tableAccent + "cc", tableBg + "ee", tableAccent + "88"] as any}
            style={[StyleSheet.absoluteFill, { borderRadius: tableH / 2 }]}
          />
          <View style={[gameStyles.tableInnerRing, { borderRadius: (tableH - 14) / 2 }]} />
          <View style={gameStyles.tableContent}>
            {/* Draw pile — uses PlayingCard faceDown so the deck visual matches
                the in-hand back exactly. */}
            <BouncePressable inline onPress={handleDraw} disabled={!isPlaying} style={gameStyles.drawPileBtn}>
              <Animated.View style={[gameStyles.drawPileStack, drawScaleStyle]}>
                {/* Draw flash glow — pulses with backAccent on each draw. */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    {
                      position: "absolute",
                      top: -8, left: -8, right: -8, bottom: -8,
                      borderRadius: 14,
                      backgroundColor: backAccent + "55",
                      shadowColor: backAccent,
                      shadowOpacity: 0.95,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 0 },
                      zIndex: -1,
                    },
                    drawFlashStyle,
                  ]}
                />
                {[2, 1, 0].map(i => (
                  <View key={i} style={[gameStyles.drawCardAbs, { top: -i * 1.5, left: i * 1.5, zIndex: 3 - i }]}>
                    <PlayingCard
                      card={DRAW_PILE_DUMMY}
                      faceDown
                      size="md"
                      backColors={backColors}
                      backAccent={backAccent}
                      backPattern={backPattern}
                      showEffectBadge={false}
                    />
                  </View>
                ))}
              </Animated.View>
              {isPlaying && (
                <View style={[gameStyles.drawLabel, { backgroundColor: gs.pendingDraw > 0 ? Colors.red : backAccent }]}>
                  <Text style={gameStyles.drawLabelText}>
                    {gs.pendingDraw > 0 ? `+${gs.pendingDraw}` : T("drawCard")}
                  </Text>
                </View>
              )}
            </BouncePressable>

            <View style={gameStyles.dirArrowWrap}>
              <DirectionArrow direction={gs.direction} />
              <Text style={[gameStyles.suitOnTable, { color: topSuitColor }]}>{suitSymbol(gs.currentSuit)}</Text>
            </View>

            {/* Discard pile */}
            <View style={gameStyles.discardPileWrap}>
              {topCard && (
                <DiscardBouncer
                  cardId={topCard.id}
                  isSpecial={isSpecialRank(topCard.rank)}
                  glowColor={cardGlowColor(topCard)}
                >
                  <PlayingCard card={topCard} size="lg" cardColors={cardColors} />
                </DiscardBouncer>
              )}
            </View>
          </View>
        </View>

        {/* ─── CPU opponents ─── */}
        {cpuZonePositions.map(cp => {
          const cpu = currentCpuProfiles[cp.idx - 1];
          const handCount = gs.hands[cp.idx]?.length ?? 0;
          const isCurrent = gs.currentPlayerIndex === cp.idx;
          const isSkipped = gs.lastSkipped === cp.idx;
          const side = cp.pos === "left" ? "left" : cp.pos === "right" ? "right" : undefined;
          const cpuColor = PLAYER_COLORS[cp.idx % PLAYER_COLORS.length];
          return (
            <View key={cp.idx} style={posStyles[cp.pos]}>
              <CpuZone
                handCount={handCount}
                profile={cpu}
                color={cpuColor}
                isThinking={isCurrent && gs.phase === "playing"}
                isCurrent={isCurrent}
                side={side as "left" | "right" | undefined}
                isSkipped={isSkipped}
                backColors={backColors}
                backAccent={backAccent}
              />
            </View>
          );
        })}


        {/* ─── Human player hand (arc fan layout) ─── */}
        <View style={[gameStyles.playerZone, { bottom: 0 }]}>
          {/* Player label bar */}
          <View style={gameStyles.playerLabel}>
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={[gameStyles.humanAvatar, { borderRadius: 14 }]} />
            ) : (
              <View style={gameStyles.humanAvatar}>
                <Ionicons name="person" size={14} color={Colors.gold} />
              </View>
            )}
            <Text style={gameStyles.playerName} numberOfLines={1}>
              {humanName} · {currentHand.length} {T("cards")}
            </Text>
            {isPlaying && playableCount > 0 && (
              <View style={gameStyles.playableBadge}>
                <Text style={gameStyles.playableText}>{playableCount} {T("playableCountPlural")}</Text>
              </View>
            )}
            {!isPlaying && gs.currentPlayerIndex !== 0 && (
              <View style={gameStyles.waitingBadge}>
                <Text style={gameStyles.waitingText}>{T("waiting")}</Text>
              </View>
            )}
          </View>

          {/* Selected card hint */}
          {selectedCard && isPlaying && (
            <Text style={gameStyles.selectedHint}>
              {(selectedCard.rank === "8" || (selectedCard.rank === "Joker" && gs.pendingDraw === 0))
                ? T("tapAgainChooseSuit")
                : T("tapAgainPlay")}
            </Text>
          )}

          {/* Inactivity countdown bar — appears after 20s idle, shows remaining 10s */}
          {isPlaying && showInactivityBar && (
            <View style={gameStyles.inactivityBar}>
              <View
                style={[
                  gameStyles.inactivityFill,
                  {
                    width: `${Math.round(inactivityProgress * 100)}%` as any,
                    backgroundColor:
                      inactivityProgress > 0.5
                        ? "#D4AF37"
                        : inactivityProgress > 0.25
                        ? "#FF8C00"
                        : "#FF3B30",
                  },
                ]}
              />
              <Text style={{
                position: "absolute", right: 6, top: 2,
                fontFamily: "Nunito_800ExtraBold", fontSize: 10,
                color: inactivityProgress > 0.5 ? Colors.gold : inactivityProgress > 0.25 ? "#FF9500" : "#FF3B30",
              }}>
                {Math.ceil(inactivityProgress * INACTIVITY_TIMEOUT)}s
              </Text>
            </View>
          )}

          {/* Arc fan hand — wrapped in horizontal ScrollView for large hands */}
          {(() => {
            const N = currentHand.length;
            if (N === 0) return null;
            const CARD_W = 62;
            const CARD_H = 90;
            // Reduce angle when many cards so it doesn't block horizontal swipe.
            const MAX_ANGLE = N <= 7 ? Math.min(20, N * 2.4) : Math.min(10, N * 1.2);
            const MAX_ARC = N <= 7 ? 16 : 8;
            // Generous spacing so each card has its own touch target; scroll handles overflow.
            const xStep = N <= 4 ? CARD_W * 0.78 : N <= 7 ? CARD_W * 0.66 : CARD_W * 0.58;
            const totalWidth = CARD_W + (N - 1) * xStep + 16;
            const fitsOnScreen = totalWidth <= SW - 16;
            // +28 accounts for selected lift (translateY: -8), shadow, and card highlight glow.
            const containerH = CARD_H + MAX_ARC + 28;

            const Hand = (
              <View style={{ height: containerH, width: Math.max(totalWidth, SW), position: "relative" }}>
                {currentHand.map((card, i) => {
                  const centerI = (N - 1) / 2;
                  const t = N <= 1 ? 0 : (i - centerI) / Math.max(1, centerI);
                  const angle = t * MAX_ANGLE;
                  const arcY = Math.abs(t) * MAX_ARC;
                  const baseStart = fitsOnScreen ? Math.max(8, (SW - totalWidth) / 2) : 8;
                  const x = baseStart + i * xStep;
                  const playable = isPlaying && multiCanPlay(card, gs);
                  const selected = selectedCard?.id === card.id;
                  return (
                    <View
                      key={card.id}
                      style={{
                        position: "absolute",
                        left: x,
                        bottom: arcY,
                        zIndex: selected ? 100 : i + 1,
                        transform: [{ rotate: `${angle}deg` }, { translateY: selected ? -8 : 0 }],
                      }}
                    >
                      <PlayingCard
                        card={card}
                        onPress={() => handleCardPress(card)}
                        isPlayable={playable}
                        isSelected={selected}
                        size="md"
                        cardColors={cardColors}
                        backColors={backColors}
                        backAccent={backAccent}
                      />
                    </View>
                  );
                })}
              </View>
            );

            if (fitsOnScreen) return Hand;
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="normal"
                bounces
                alwaysBounceHorizontal
                overScrollMode="always"
                keyboardShouldPersistTaps="always"
                style={{ width: "100%", height: containerH }}
                contentContainerStyle={{ minWidth: SW }}
              >
                {Hand}
              </ScrollView>
            );
          })()}
        </View>

        {/* Message bar — sits above the player hand zone */}
        <Animated.View
          key={`msg-${gs.message}`}
          entering={FadeIn.duration(180)}
          style={[gameStyles.messageBubble, { bottom: 168 }]}
        >
          <Text style={gameStyles.messageText} numberOfLines={1}>{gs.message}</Text>
        </Animated.View>

        {/* CPU emote bubble — top center */}
        <View style={{ position: "absolute", top: tableCenterY - 110, left: 0, right: 0, alignItems: "center", pointerEvents: "none" } as any}>
          <EmoteBubble emote={cpuEmote} side="cpu" muted={muteCpuEmotes} lang={profile.language ?? "es"} />
        </View>

        {/* Player emote bubble — above hand */}
        <View style={{ position: "absolute", bottom: 185, left: 0, right: 0, alignItems: "center", pointerEvents: "none" } as any}>
          <EmoteBubble emote={playerEmote} side="player" lang={profile.language ?? "es"} />
        </View>

        {/* Emote panel button — bottom right */}
        {lobbyPhase === "game" && gs.phase === "playing" && (
          <View style={{ position: "absolute", bottom: 175, right: 12 }}>
            <EmotePanel onSendEmote={handleSendEmote} lastEmoteTime={lastPlayerEmoteTime} />
          </View>
        )}

      </View>

      {/* Suit picker */}
      {gs.phase === "choosing_suit" && selectedCard && gs.currentPlayerIndex === 0 && (
        <View style={StyleSheet.absoluteFill}>
          <SuitPicker onChoose={handleChooseSuit} hand={gs.hands[0] ?? []} />
        </View>
      )}

      {/* Result overlay — wait for ranked animation to complete first */}
      {gs.phase === "game_over" && gs.winnerIndex !== null && !rivalAbandoned && !rankedPromotion && (
        <ResultOverlay
          isWin={gs.winnerIndex === 0}
          winnerName={gs.playerNames?.[gs.winnerIndex] ?? allNames[gs.winnerIndex]}
          winnerColor={PLAYER_COLORS[gs.winnerIndex % PLAYER_COLORS.length]}
          onClose={() => { playButton().catch(() => {}); router.back(); }}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {pendingChestType && gs?.phase === "game_over" && !showChestModal && (
        <BouncePressable
          inline
          wrapperStyle={{ position: "absolute", bottom: 160, alignSelf: "center", zIndex: 200 }}
          onPress={() => {
            const latestChest = (chestInventory ?? []).slice().reverse().find(c => c.type === pendingChestType);
            if (latestChest) {
              playChestOpen(latestChest.type as any).catch(() => {});
              const rw = openChestFromInventory(latestChest.id);
              setChestModalReward(rw);
              setShowChestModal(true);
            }
          }}
        >
          <LinearGradient
            colors={["#D4AF37", "#A07800"]}
            style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, flexDirection: "row", alignItems: "center", gap: 8, shadowColor: "#D4AF37", shadowOpacity: 0.9, shadowRadius: 16, elevation: 20 }}
          >
            <Ionicons name="gift" size={22} color="#1a0a00" />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#1a0a00", textTransform: "uppercase", letterSpacing: 1 }}>Open Chest</Text>
          </LinearGradient>
        </BouncePressable>
      )}

      <ChestOpeningModal
        visible={showChestModal}
        chestType={pendingChestType ?? "common"}
        reward={chestModalReward}
        onClose={() => { setShowChestModal(false); setChestModalReward(null); setPendingChestType(null); }}
      />

      {/* Rival abandoned overlay */}
      {rivalAbandoned && (
        <RivalAbandonedOverlay
          rivalName={currentCpuProfiles[0]?.name ?? "Rival"}
          onClaim={() => { playVictory().catch(() => {}); router.back(); }}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* ─── Visual Effects ─── */}
      {showEffect && (
        <CardPlayEffect
          effectId={profile.selectedEffect ?? "effect_none"}
          originX={SW * 0.55}
          originY={SH * 0.42}
          onDone={() => setShowEffect(false)}
        />
      )}

      {floatingLabel && (
        <Animated.View
          style={[{
            position: "absolute", bottom: "35%", left: 0, right: 0,
            alignItems: "center", zIndex: 500, pointerEvents: "none" as any,
          }, floatLabelStyle]}
        >
          <View style={{ backgroundColor: floatingLabelColor + "EE", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 8, shadowColor: floatingLabelColor, shadowOpacity: 0.8, shadowRadius: 12, elevation: 10 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 28, color: "#fff", textShadowColor: "rgba(0,0,0,0.4)", textShadowRadius: 4 }}>
              {floatingLabel}
            </Text>
          </View>
        </Animated.View>
      )}

      {showLastCardBanner && (
        <Animated.View
          entering={SlideInDown.duration(300)}
          style={{
            position: "absolute", top: topPad + 60, left: 20, right: 20,
            alignItems: "center", zIndex: 500, pointerEvents: "none" as any,
          }}
        >
          <LinearGradient colors={[Colors.gold, "#A07800"]} style={{ borderRadius: 14, paddingHorizontal: 28, paddingVertical: 10 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: "#1a0a00", letterSpacing: 2 }}>
              ¡ÚLTIMA CARTA!
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* ─── "YOUR TURN" flash banner ─── */}
      {showYourTurnFlash && (
        <Animated.View
          entering={FadeIn.duration(100)}
          style={{
            position: "absolute", bottom: "40%", left: 0, right: 0,
            alignItems: "center", zIndex: 520, pointerEvents: "none" as any,
          }}
        >
          <View style={{
            backgroundColor: Colors.gold + "EE", borderRadius: 12,
            paddingHorizontal: 24, paddingVertical: 7,
          }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#1a0a00", letterSpacing: 3 }}>
              ¡TU TURNO!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ─── Local socket reconnecting / reconnected toast ─── */}
      {isOnline && connectionStatus !== "connected" && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{
            position: "absolute", top: topPad + 10, left: 20, right: 20,
            alignItems: "center", zIndex: 610, pointerEvents: "none" as any,
          }}
        >
          <View style={{
            backgroundColor: "rgba(15,15,25,0.92)", borderRadius: 10,
            paddingHorizontal: 16, paddingVertical: 8,
            borderWidth: 1,
            borderColor: connectionStatus === "reconnected" ? "rgba(46,204,113,0.45)" : "rgba(255,200,0,0.45)",
            flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons
              name={connectionStatus === "reconnected" ? "wifi" : "sync"}
              size={14}
              color={connectionStatus === "reconnected" ? "#2ECC71" : "#FFC800"}
            />
            <Text style={{
              fontFamily: "Nunito_700Bold", fontSize: 12,
              color: connectionStatus === "reconnected" ? "#2ECC71" : "#FFC800",
            }}>
              {connectionStatus === "reconnected"
                ? (T("reconnected" as any) || "¡Conectado!")
                : (T("reconnecting" as any) || "Reconectando…")}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ─── Player disconnected toast (game continues with bot) ─── */}
      {disconnectedPlayerMsg && (
        <Animated.View
          entering={SlideInDown.duration(250)}
          style={{
            position: "absolute", top: topPad + 10, left: 20, right: 20,
            alignItems: "center", zIndex: 600, pointerEvents: "none" as any,
          }}
        >
          <View style={{
            backgroundColor: "rgba(15,15,25,0.92)", borderRadius: 10,
            paddingHorizontal: 16, paddingVertical: 8,
            borderWidth: 1, borderColor: "rgba(255,140,0,0.35)",
            flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons name="warning-outline" size={14} color="#FF8C00" />
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 12, color: "#FF8C00" }}>
              {disconnectedPlayerMsg}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ─── In-Game Menu Modal ─── */}
      {showGameMenu && (
        <Pressable style={[StyleSheet.absoluteFill, gameStyles.gameMenuOverlay]} onPress={closeGameMenu}>
          <Pressable style={gameStyles.gameMenuCard} onPress={() => {}}>
            <Text style={gameStyles.gameMenuTitle}>
              {T("menu" as any) || "Menú"}
            </Text>
            <Text style={gameStyles.gameMenuCountdownTxt}>
              {profile.language === "en"
                ? `Returning in ${menuCountdown}s…`
                : `Regresando en ${menuCountdown}s…`}
            </Text>

            {/* Emotes toggle */}
            <BouncePressable
              style={gameStyles.gameMenuRow}
              onPress={() => { setMuteCpuEmotes(m => !m); playButton().catch(() => {}); }}
            >
              <View style={gameStyles.gameMenuRowLeft}>
                <Ionicons name={muteCpuEmotes ? "chatbubble-ellipses-outline" : "chatbubble-ellipses"} size={20} color={muteCpuEmotes ? Colors.textDim : Colors.gold} />
                <Text style={gameStyles.gameMenuRowTxt}>
                  {profile.language === "en" ? "Emotes" : "Emotes"}
                </Text>
              </View>
              <View style={[gameStyles.gameMenuToggle, { backgroundColor: muteCpuEmotes ? "#E74C3C" : "#27AE60" }]}>
                <Text style={gameStyles.gameMenuToggleTxt}>{muteCpuEmotes ? "OFF" : "ON"}</Text>
              </View>
            </BouncePressable>

            {/* SFX toggle */}
            <BouncePressable
              style={gameStyles.gameMenuRow}
              onPress={() => {
                const next = !inGameSfxEnabled;
                setInGameSfxEnabled(next);
                syncSettings(inGameMusicEnabled, next);
                playButton().catch(() => {});
              }}
            >
              <View style={gameStyles.gameMenuRowLeft}>
                <Ionicons name={inGameSfxEnabled ? "volume-high" : "volume-mute"} size={20} color={inGameSfxEnabled ? Colors.gold : Colors.textDim} />
                <Text style={gameStyles.gameMenuRowTxt}>
                  {profile.language === "en" ? "Sound effects" : "Efectos de sonido"}
                </Text>
              </View>
              <View style={[gameStyles.gameMenuToggle, { backgroundColor: inGameSfxEnabled ? "#27AE60" : "#E74C3C" }]}>
                <Text style={gameStyles.gameMenuToggleTxt}>{inGameSfxEnabled ? "ON" : "OFF"}</Text>
              </View>
            </BouncePressable>

            {/* Music toggle */}
            <BouncePressable
              style={gameStyles.gameMenuRow}
              onPress={() => {
                playButton().catch(() => {});
                if (inGameMusicEnabled) {
                  stopMusic().catch(() => {});
                  setInGameMusicEnabled(false);
                  syncSettings(false, inGameSfxEnabled);
                } else {
                  startGameMusicForMode("online").catch(() => {});
                  setInGameMusicEnabled(true);
                  syncSettings(true, inGameSfxEnabled);
                }
              }}
            >
              <View style={gameStyles.gameMenuRowLeft}>
                <Ionicons
                  name={inGameMusicEnabled ? "musical-notes" : "musical-notes-outline"}
                  size={20}
                  color={inGameMusicEnabled ? Colors.gold : Colors.textDim}
                />
                <Text style={gameStyles.gameMenuRowTxt}>
                  {profile.language === "en" ? "Music" : "Música"}
                </Text>
              </View>
              <View style={[gameStyles.gameMenuToggle, { backgroundColor: inGameMusicEnabled ? "#27AE60" : "#E74C3C" }]}>
                <Text style={gameStyles.gameMenuToggleTxt}>{inGameMusicEnabled ? "ON" : "OFF"}</Text>
              </View>
            </BouncePressable>

            <View style={gameStyles.gameMenuDivider} />

            {/* Exit game */}
            <BouncePressable
              style={[gameStyles.gameMenuRow, { opacity: 0.85 }]}
              onPress={() => {
                closeGameMenu();
                playButton().catch(() => {});
                setShowExitModal(true);
              }}
            >
              <View style={gameStyles.gameMenuRowLeft}>
                <Ionicons name="exit-outline" size={20} color="#E74C3C" />
                <Text style={[gameStyles.gameMenuRowTxt, { color: "#E74C3C" }]}>
                  {profile.language === "en" ? "Quit match" : "Salir de la partida"}
                </Text>
              </View>
            </BouncePressable>

            <View style={gameStyles.gameMenuDivider} />

            {/* Back to game */}
            <BouncePressable style={gameStyles.gameMenuCloseBtn} onPress={closeGameMenu}>
              <Ionicons name="play" size={16} color={Colors.gold} />
              <Text style={gameStyles.gameMenuCloseTxt}>
                {profile.language === "en" ? "Back to game" : "Volver a la partida"}
              </Text>
            </BouncePressable>
          </Pressable>
        </Pressable>
      )}

      {/* ─── Ranked promotion/demotion overlay ─── */}
      {!!rankedPromotion && (
        <RankedResultOverlay
          type={rankedPromotion}
          onDone={() => setRankedPromotion(null)}
        />
      )}

      {/* ─── Exit Confirmation Modal ─── */}
      {showExitModal && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", zIndex: 999 }]}>
          <View style={{ backgroundColor: "#0d1a10", borderRadius: 18, padding: 24, margin: 24, width: "88%", maxWidth: 360, borderWidth: 1, borderColor: "#D4AF3744" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="exit-outline" size={24} color="#E74C3C" />
              <Text style={{ color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 18 }}>
                {T("exitGame" as any) || "¿Salir de la partida?"}
              </Text>
            </View>
            {modeParam === "ranked" && (
              <View style={{ backgroundColor: "#E74C3C22", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E74C3C44" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Ionicons name="warning-outline" size={18} color="#E74C3C" />
                  <Text style={{ color: "#E74C3C", fontFamily: "Nunito_700Bold", fontSize: 13 }}>
                    {T("rankedExitWarningTitle" as any) || "Advertencia"}
                  </Text>
                </View>
                <Text style={{ color: "#FF9999", fontFamily: "Nunito_400Regular", fontSize: 12, lineHeight: 18 }}>
                  {T("rankedExitWarning" as any) || "Si sales de la partida clasificatoria puedes perder puntos o bajar de rango."}
                </Text>
              </View>
            )}
            <Text style={{ color: "#BDC3C7", fontFamily: "Nunito_400Regular", fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
              {modeParam === "ranked"
                ? (T("exitGameSubRanked" as any) || "Tu progreso en esta partida no se guardará.")
                : (T("exitGameSub" as any) || "¿Estás seguro de que deseas salir? Tu progreso se perderá.")}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <BouncePressable
                wrapperStyle={{ flex: 1 }}
                onPress={() => { playButton().catch(() => {}); setShowExitModal(false); }}
                style={{ backgroundColor: "#1a2a1a", borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#D4AF3733" }}
              >
                <Text style={{ color: "#D4AF37", fontFamily: "Nunito_700Bold", fontSize: 14 }}>
                  {T("cancel") || "Cancelar"}
                </Text>
              </BouncePressable>
              <BouncePressable
                wrapperStyle={{ flex: 1 }}
                onPress={() => {
                  playButton().catch(() => {});
                  setShowExitModal(false);
                  addXp(-25);
                  // Ranked abandon penalty: only when match is actively in play (post-deal, pre-result) and rival hasn't already left.
                  const inProgress = gameState
                    && (gameState.phase === "playing" || gameState.phase === "choosing_suit")
                    && !rivalAbandoned
                    && lobbyPhase === "game";
                  if (modeParam === "ranked" && inProgress && !rankedAbandonRecordedRef.current) {
                    rankedAbandonRecordedRef.current = true;
                    rankedUpdatedRef.current = true;
                    const r = recordRankedAbandon();
                    if (r.cooldownMs > 0) {
                      const mins = Math.round(r.cooldownMs / 60000);
                      Alert.alert(
                        T("rankedExitWarningTitle" as any) || "Advertencia",
                        `${T("rankedAbandonPenalty" as any) || "Has abandonado demasiadas partidas. Penalización"}: -${r.totalStarLoss} ⭐\n${T("rankedCooldownMsg" as any) || "Cooldown"}: ${mins} min`,
                      );
                    }
                  }
                  router.back();
                }}
                style={{ backgroundColor: "#E74C3C", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Nunito_700Bold", fontSize: 14 }}>
                  {T("exitConfirm" as any) || "Salir"}
                </Text>
              </BouncePressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const gameStyles = StyleSheet.create({
  container: { flex: 1 },
  shuffleFlashBanner: {
    position: "absolute",
    top: "40%",
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.9)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#9B59B6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 999,
  },
  shuffleFlashText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  gridOverlay: {
    position: "absolute", inset: 0,
    opacity: 0.03,
    backgroundColor: "transparent",
    backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,transparent 1px,transparent 40px,#fff 41px),repeating-linear-gradient(90deg,#fff 0px,transparent 1px,transparent 40px,#fff 41px)",
  } as any,
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center",
  },
  headerMid: { flexDirection: "row", alignItems: "center", gap: 8 },
  onlinePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#2ecc7122", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "#2ecc7144",
  },
  onlinePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2ecc71" },
  onlinePillText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: "#2ecc71", letterSpacing: 2 },
  headerTitle: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  deckBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textDim },

  // Live event pill in header
  eventPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 6, paddingVertical: 2,
    maxWidth: 150,
  },
  eventPillText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 0.5 },

  // Live event intro banner
  eventBanner: {
    position: "absolute", top: 60, left: 16, right: 16,
    alignItems: "center", zIndex: 250,
  },
  eventBannerInner: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center", gap: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
    maxWidth: 360,
  },
  eventBannerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eventBannerTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#fff", letterSpacing: 1 },
  eventBannerDesc: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "rgba(255,255,255,0.9)", textAlign: "center" },

  gameZone: { flex: 1, position: "relative" },

  // Oval table (colors driven by table design via inline styles)
  tableOval: {
    position: "absolute",
    borderWidth: 2, borderColor: "#D4AF3744",
    overflow: "hidden",
    shadowColor: "#D4AF37", shadowOpacity: 0.2, shadowRadius: 20,
    elevation: 8,
  },
  tableInnerRing: {
    position: "absolute", inset: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  tableContent: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingHorizontal: 6,
  },
  drawPileBtn: { alignItems: "center", justifyContent: "center" },
  drawPileStack: { width: 76, height: 108, position: "relative" },
  drawCardAbs: { position: "absolute", width: 64, height: 92 },
  drawCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  drawCardDot: { fontSize: 22, color: "#D4AF37", opacity: 0.55 },
  drawLabel: {
    marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: "center",
  },
  drawLabelText: { fontFamily: "Nunito_800ExtraBold", fontSize: 10, color: "#fff" },
  dirArrowWrap: { alignItems: "center", gap: 2 },
  dirArrow: { fontSize: 18, color: "#D4AF37", opacity: 0.7 },
  suitOnTable: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  discardPileWrap: { alignItems: "center", justifyContent: "center" },

  // CPU zones
  topZone: { alignItems: "center", gap: 4 },
  sideZone: { alignItems: "center", gap: 4 },
  sideZoneRight: {},
  cpuAvatarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cpuAvatarRing: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cpuFlag: { fontSize: 16 },
  cpuName: { fontFamily: "Nunito_700Bold", fontSize: 10, maxWidth: 70 },
  cpuLevel: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#2ecc71" },
  topCardFan: { flexDirection: "row", alignItems: "flex-end" },
  sideCardFan: { alignItems: "center" },
  thinkingText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "#4A90E2", marginTop: 2 },
  skipText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: Colors.red, letterSpacing: 1 },
  teamBadge: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 3,
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, marginTop: 2,
  },
  cpuCountBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, borderWidth: 1, marginTop: 2,
  },
  cpuCountText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9 },

  faceDownMini: {
    width: 44, height: 64, borderRadius: 7,
    overflow: "hidden", borderWidth: 1.5, borderColor: Colors.gold + "66",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4,
  },
  faceDownDot: { fontSize: 16, color: "#D4AF37", opacity: 0.55, textAlign: "center", marginTop: 22 },

  // Player zone
  playerZone: { position: "absolute", left: 0, right: 0, gap: 2 },
  playerLabel: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14,
  },
  humanAvatar: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: Colors.gold,
    alignItems: "center", justifyContent: "center", backgroundColor: Colors.gold + "22",
  },
  playerName: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.gold, flex: 1 },
  playableBadge: {
    backgroundColor: Colors.gold + "22", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.gold + "44",
  },
  playableText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.gold },
  waitingBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#4A90E222", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: "#4A90E244",
  },
  waitingAvatar: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  waitingText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: "#4A90E2" },
  inactivityBar: {
    width: "100%", height: 5, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3, marginBottom: 6, overflow: "hidden",
  },
  inactivityFill: { height: 5, borderRadius: 3 },
  handContainer: { paddingHorizontal: 12, paddingVertical: 4 },
  selectedHint: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.gold, textAlign: "center", marginTop: 2,
  },

  messageBubble: {
    position: "absolute", left: 16, right: 16,
    backgroundColor: "rgba(0,0,20,0.6)", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: "#4A90E222",
    alignItems: "center",
  },
  messageText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "#4A90E2bb" },

  // Suit picker
  suitOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center", justifyContent: "center", gap: 20,
  },
  suitTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 2 },
  suitGrid: { flexDirection: "row", gap: 14, flexWrap: "wrap", justifyContent: "center" },
  suitBtn: {
    width: 80, height: 80, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center",
    gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  suitSym: { fontSize: 28, fontFamily: "Nunito_800ExtraBold" },
  suitLbl: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textMuted },

  // Result overlay
  resultOverlay: {
    position: "absolute", inset: 0, zIndex: 300,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  resultTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 40, letterSpacing: 2 },
  resultSub: { fontFamily: "Nunito_700Bold", fontSize: 16 },
  resultBtn: { marginTop: 24, borderRadius: 16, overflow: "hidden", width: 250 },
  resultBtnGrad: { paddingVertical: 16, alignItems: "center" },
  resultBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#fff" },

  // Hamburger menu button
  menuHamburger: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  hamLine: {
    width: 18, height: 2, borderRadius: 1,
    backgroundColor: Colors.gold,
  },

  // In-game menu modal
  gameMenuOverlay: {
    backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center", zIndex: 900,
  },
  gameMenuCard: {
    width: 300, backgroundColor: "#0d1f10", borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: Colors.gold + "44", gap: 4,
    shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 20, elevation: 20,
  },
  gameMenuTitle: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: Colors.gold,
    textAlign: "center", letterSpacing: 1, marginBottom: 4,
  },
  gameMenuCountdownTxt: {
    fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textDim,
    textAlign: "center", marginBottom: 12,
  },
  gameMenuRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, paddingHorizontal: 4,
  },
  gameMenuRowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  gameMenuRowTxt: {
    fontFamily: "Nunito_700Bold", fontSize: 14, color: "#D0D0D0",
  },
  gameMenuToggle: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, minWidth: 44, alignItems: "center",
  },
  gameMenuToggleTxt: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#fff",
  },
  gameMenuDivider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 6,
  },
  gameMenuCloseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, gap: 8, marginTop: 2,
  },
  gameMenuCloseTxt: {
    fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.gold,
  },

});
