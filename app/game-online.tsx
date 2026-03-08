import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform, useWindowDimensions, Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  withSpring, Easing, FadeIn, FadeInDown, SlideInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { PlayingCard } from "@/components/PlayingCard";
import { DealAnimation } from "@/components/DealAnimation";
import {
  MultiGameState, Card, Suit,
  initMultiGame, multiCanPlay, multiPlayCard, multiDraw, multiChooseSuit, multiConfirmTurn,
  cpuPlayMulti, suitName, suitSymbol, suitColor, multiGetTopCard,
} from "@/lib/multiplayerEngine";
import { useProfile } from "@/context/ProfileContext";
import {
  playCardFlip, playCardDraw, playButton, playWin, playMenuOpen,
  stopMusic, resumeMusic, startGameMusic
} from "@/lib/audioManager";
import { CARD_BACKS } from "@/lib/storeItems";
import { CPU_PROFILES, type CpuProfile } from "@/lib/cpuProfiles";
import { playSound } from "@/lib/sounds";
import { getSocket, ensureDisconnected } from "@/lib/onlineSocket";

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
}

const DUMMY_CARD: Card = { id: "xx", rank: "2", suit: "hearts" };

function buildLocalState(srv: ServerGameState): MultiGameState {
  const n = srv.playerNames.length;
  const myPidx = srv.myPlayerIndex;
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
  };
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function pickCpuProfiles(count: number, playerLevel: number): CpuProfile[] {
  const range = 15;
  let candidates = CPU_PROFILES.filter(p => Math.abs(p.level - playerLevel) <= range);
  
  if (candidates.length < count) {
    const wideRange = 30;
    candidates = CPU_PROFILES.filter(p => Math.abs(p.level - playerLevel) <= wideRange);
  }

  const shuffled = [...(candidates.length >= count ? candidates : CPU_PROFILES)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
              <Ionicons name="person" size={20} color={Colors.gold} />
            </View>
            <View style={lobbyStyles.slotInfo}>
              <Text style={[lobbyStyles.slotName, { color: Colors.gold }]}>{humanName}</Text>
              <Text style={lobbyStyles.slotSub}>{T("level")} 1 · {T("you")}</Text>
            </View>
            <View style={lobbyStyles.onlineDot} />
          </Animated.View>

          {/* CPU slots */}
          {cpuProfiles.slice(0, joinedCount).map((cpu, i) => (
            <Animated.View
              key={cpu.name}
              entering={FadeInDown.delay(100 + i * 80).duration(500)}
              style={lobbyStyles.slot}
            >
              <View style={[lobbyStyles.slotAvatar, { borderColor: cpu.avatarColor }]}>
                {cpu.photoUrl ? (
                  <Image
                    source={{ uri: cpu.photoUrl }}
                    style={{ width: 36, height: 36, borderRadius: 18 }}
                  />
                ) : (
                  <Ionicons name={cpu.avatarIcon as any} size={20} color={cpu.avatarColor} />
                )}
              </View>
              <View style={lobbyStyles.slotInfo}>
                <Text style={[lobbyStyles.slotName, { color: cpu.avatarColor }]}>{cpu.name}</Text>
                <Text style={lobbyStyles.slotSub}>{T("level")} {cpu.level} · {wrFromLevel(cpu.level)}% WR</Text>
              </View>
              <View style={[lobbyStyles.onlineDot, { backgroundColor: "#2ecc71" }]} />
            </Animated.View>
          ))}

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
  modeLabel: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 4 },
  spinner: { fontSize: 52, color: "#4A90E2", fontFamily: "Nunito_900ExtraBold" },
  searchLabel: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: "#4A90E2", letterSpacing: 3 },
  searchSub: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textDim },
  foundLabel: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 2, textAlign: "center" },
  countdownWrap: { alignItems: "center", gap: 4 },
  countdownLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted, letterSpacing: 3 },
  countdown: { fontFamily: "Nunito_900ExtraBold", fontSize: 72, color: Colors.gold },
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
function CpuZone({ handCount, profile, color, isThinking, isCurrent, side, isSkipped, backColors, backAccent }: {
  handCount: number; profile: CpuProfile; color: string;
  isThinking: boolean; isCurrent: boolean; side?: "left" | "right";
  isSkipped?: boolean;
  backColors?: [string, string, string]; backAccent?: string;
}) {
  const glow = useSharedValue(0);
  useEffect(() => {
    if (isCurrent) {
      glow.value = withRepeat(withSequence(
        withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })
      ), -1);
    } else {
      glow.value = 0;
    }
  }, [isCurrent]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.5,
  }));

  const maxCards = Math.min(handCount, side ? 5 : 7);

  return (
    <View style={side ? [gameStyles.sideZone, side === "right" && gameStyles.sideZoneRight] : gameStyles.topZone}>
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
            marginLeft: side ? 0 : i === 0 ? 0 : -18,
            marginTop: side ? (i === 0 ? 0 : -22) : 0,
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
    </View>
  );
}

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

// ─── Suit picker ──────────────────────────────────────────────────────────
function SuitPicker({ onChoose }: { onChoose: (s: Suit) => void }) {
  const T = useT();
  return (
    <View style={gameStyles.suitOverlay}>
      <Text style={gameStyles.suitTitle}>{T("chooseSuit")}</Text>
      <View style={gameStyles.suitGrid}>
        {SUITS.map(s => (
          <Pressable key={s} onPress={() => onChoose(s)} style={gameStyles.suitBtn}>
            <Text style={[gameStyles.suitSym, { color: suitColor(s) }]}>{suitSymbol(s)}</Text>
            <Text style={gameStyles.suitLbl}>{suitName(s)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Win/Lose overlay ────────────────────────────────────────────────────
function ResultOverlay({ isWin, winnerName, winnerColor, onClose, onPlayAgain }: {
  isWin: boolean; winnerName: string; winnerColor: string; onClose: () => void; onPlayAgain: () => void;
}) {
  const T = useT();
  return (
    <View style={gameStyles.resultOverlay}>
      <LinearGradient
        colors={isWin ? ["#041a04", "#062206"] : ["#1a0404", "#220606"]}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={isWin ? "trophy" : "close-circle"} size={72} color={isWin ? Colors.gold : Colors.red} />
      <Text style={[gameStyles.resultTitle, { color: isWin ? Colors.gold : Colors.red }]}>
        {isWin ? T("youWon") : T("defeat")}
      </Text>
      {!isWin && (
        <Text style={[gameStyles.resultSub, { color: winnerColor }]}>{winnerName} {T("wonSuffix")}</Text>
      )}
      <Pressable style={gameStyles.resultBtn} onPress={onPlayAgain}>
        <LinearGradient colors={[Colors.gold, "#A07800"]} style={gameStyles.resultBtnGrad}>
          <Ionicons name="refresh" size={16} color="#1a0a00" />
          <Text style={gameStyles.resultBtnText}>{T("playAgain")}</Text>
        </LinearGradient>
      </Pressable>
      <Pressable style={[gameStyles.resultBtn, { marginTop: 8 }]} onPress={onClose}>
        <LinearGradient
          colors={["#333", "#222"]}
          style={gameStyles.resultBtnGrad}
        >
          <Text style={[gameStyles.resultBtnText, { color: "#ccc" }]}>{T("returnMenu")}</Text>
        </LinearGradient>
      </Pressable>
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
          <Pressable onPress={onClaim} style={raStyles.claimBtn}>
            <LinearGradient colors={[Colors.gold, "#A07800"]} style={raStyles.claimGrad}>
              <Ionicons name="checkmark-circle" size={18} color="#1a0a00" />
              <Text style={raStyles.claimTxt}>{T("autoVictory")}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onPlayAgain} style={raStyles.againBtn}>
            <Text style={raStyles.againTxt}>{T("playAgain")}</Text>
          </Pressable>
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
  autoVic: { fontFamily: "Nunito_900ExtraBold", fontSize: 26, color: Colors.gold, textAlign: "center" },
  sub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" },
  trophyRow: { flexDirection: "row", gap: 12, marginVertical: 4 },
  claimBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 4 },
  claimGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  claimTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: "#1a0a00" },
  againBtn: { paddingVertical: 10 },
  againTxt: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "rgba(255,255,255,0.45)" },
});

// ─── Main screen ──────────────────────────────────────────────────────────
export default function OnlineGameScreen() {
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const params = useLocalSearchParams<{ count?: string; rivalName?: string; code?: string; pidx?: string; mode?: string }>();
  const { profile, level: playerLevel } = useProfile();
  const T = useT();

  const isOnline = !!params.code;
  const onlineCode = params.code ?? "";
  const serverPidx = parseInt(params.pidx ?? "0", 10);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const cardBack = CARD_BACKS.find(b => b.id === profile.cardBackId) ?? CARD_BACKS[0];
  const backColors = (cardBack.backColors ?? ["#1E4080", "#0e2248", "#0a1832"]) as [string, string, string];
  const backAccent = cardBack.backAccent ?? "#D4AF37";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;
  const headerH = 50;
  const zoneH = SH - topPad - botPad - headerH;
  const tableW = Math.min(SW * 0.64, 250);
  const tableH = tableW * 0.55;
  const tableCenterY = zoneH * 0.44;

  const playerCount = Math.min(4, Math.max(2, parseInt(params.count ?? "3", 10)));

  const [currentCpuProfiles, setCurrentCpuProfiles] = useState<CpuProfile[]>(() => {
    const profiles = pickCpuProfiles(playerCount - 1, playerLevel || 1);
    if (params.rivalName && profiles.length > 0) {
      profiles[0] = { ...profiles[0], name: params.rivalName };
    }
    return profiles;
  });
  const humanName = profile.name || "Tú";

  // All player names: human is index 0, CPUs are 1..n
  const allNames = [humanName, ...currentCpuProfiles.map(c => c.name)];

  // Lobby state — online games start directly in "dealing" phase
  const [lobbyPhase, setLobbyPhase] = useState<"searching" | "found" | "countdown" | "dealing" | "game" | "result">(
    isOnline ? "dealing" : "searching"
  );
  const [joinedCount, setJoinedCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [rivalAbandoned, setRivalAbandoned] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<MultiGameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const cpuThinking = useRef(false);
  const [inactivityProgress, setInactivityProgress] = useState(1);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActionTime = useRef(Date.now());

  // ─── Online WebSocket setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline) return;

    const s = getSocket();
    socketRef.current = s;

    s.off("game_state");
    s.off("game_over");
    s.off("player_left");

    s.on("game_state", (srv: ServerGameState) => {
      const local = buildLocalState(srv);
      setGameState(local);
      setLobbyPhase(prev => (prev === "dealing" || prev === "game") ? "game" : prev);
      if (local.phase === "game_over") {
        setLobbyPhase("result");
        stopMusic().catch(() => {});
        playWin().catch(() => {});
      }
    });

    s.on("game_over", () => {
      setLobbyPhase("result");
    });

    s.on("player_left", () => {
      setRivalAbandoned(true);
    });

    return () => {
      s.off("game_state");
      s.off("game_over");
      s.off("player_left");
    };
  }, [isOnline]);

  // ─── Lobby sequence ─────────────────────────────────────────────────────
  useEffect(() => {
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
      stopMusic().catch(() => {});
      startGameMusic().catch(() => {});
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
      const gs = initMultiGame(allNames);
      gs.phase = "playing"; // Online starts directly, no pass_device for human
      setGameState(gs);
      setLobbyPhase("dealing");
    }, currentDelay));

    return () => {
      timers.forEach(clearTimeout);
      resumeMusic().catch(() => {});
    };
  }, []);

  const handleDealingComplete = useCallback(() => {
    setLobbyPhase("game");
  }, []);

  // ─── Rival abandoned: ~8% chance a CPU rival "disconnects" 10-25s into game ──
  useEffect(() => {
    if (lobbyPhase !== "game" || rivalAbandoned) return;
    if (Math.random() > 0.08) return; // 8% chance per game
    const delay = 10000 + Math.random() * 15000; // 10-25 seconds in
    const t = setTimeout(() => {
      if (lobbyPhase === "game") setRivalAbandoned(true);
    }, delay);
    return () => clearTimeout(t);
  }, [lobbyPhase]);

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
          return cpuPlayMulti(prev);
        });
      }, delay);
      return () => {
        clearTimeout(t);
        cpuThinking.current = false;
      };
    }
  }, [gameState?.turnId, gameState?.phase, lobbyPhase]);

  // ─── Inactivity timer (auto-draw after 20s idle on human turn) ───────────
  const INACTIVITY_TIMEOUT = 20;
  useEffect(() => {
    const isActive =
      gameState?.phase === "playing" &&
      gameState?.currentPlayerIndex === 0 &&
      lobbyPhase === "game";

    if (isActive) {
      lastActionTime.current = Date.now();
      if (inactivityRef.current) clearInterval(inactivityRef.current);
      inactivityRef.current = setInterval(() => {
        const elapsed = (Date.now() - lastActionTime.current) / 1000;
        const prog = Math.max(0, 1 - elapsed / INACTIVITY_TIMEOUT);
        setInactivityProgress(prog);
        if (prog <= 0 && inactivityRef.current) {
          clearInterval(inactivityRef.current);
          inactivityRef.current = null;
          setGameState(prev => {
            if (!prev || prev.phase !== "playing" || prev.currentPlayerIndex !== 0) return prev;
            return multiDraw(prev);
          });
          setSelectedCard(null);
        }
      }, 100);
    } else {
      if (inactivityRef.current) {
        clearInterval(inactivityRef.current);
        inactivityRef.current = null;
      }
      setInactivityProgress(1);
    }
    return () => {
      if (inactivityRef.current) {
        clearInterval(inactivityRef.current);
        inactivityRef.current = null;
      }
    };
  }, [gameState?.currentPlayerIndex, gameState?.phase, lobbyPhase]);

  // ─── Player card interactions ────────────────────────────────────────────
  const isPlaying = gameState?.phase === "playing" && gameState?.currentPlayerIndex === 0;
  const currentHand = gameState?.hands[0] ?? [];
  const topCard = gameState ? multiGetTopCard(gameState) : null;

  const handleCardPress = useCallback((card: Card) => {
    if (!gameState || !isPlaying) return;
    lastActionTime.current = Date.now();
    if (!multiCanPlay(card, gameState)) { playCardFlip().catch(() => {}); return; }
    if (isOnline) {
      if (selectedCard?.id === card.id) {
        playCardFlip().catch(() => {});
        socketRef.current?.emit("play_card", { card });
        setSelectedCard(null);
      } else {
        setSelectedCard(card);
      }
      return;
    }
    if (selectedCard?.id === card.id) {
      playCardFlip().catch(() => {});
      if (card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0)) {
        setGameState(multiPlayCard(gameState, card));
        return;
      }
      setGameState(multiPlayCard(gameState, card));
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }, [gameState, isPlaying, selectedCard, isOnline]);

  const handleChooseSuit = useCallback((suit: Suit) => {
    if (!gameState) return;
    playCardFlip().catch(() => {});
    if (isOnline) {
      socketRef.current?.emit("choose_suit", { suit });
      setSelectedCard(null);
      return;
    }
    setGameState(multiChooseSuit(gameState, suit));
    setSelectedCard(null);
  }, [gameState, isOnline]);

  const handleDraw = useCallback(() => {
    if (!gameState || !isPlaying) return;
    lastActionTime.current = Date.now();
    playCardDraw().catch(() => {});
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
    const newProfiles = pickCpuProfiles(playerCount - 1, playerLevel || 1);
    setCurrentCpuProfiles(newProfiles);
    const newNames = [humanName, ...newProfiles.map(c => c.name)];
    const gs = initMultiGame(newNames);
    gs.phase = "playing";
    setGameState(gs);
    setSelectedCard(null);
    cpuThinking.current = false;
  }, [playerCount, humanName, isOnline]);

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
  }, [playerCount]);

  const posStyles: Record<string, object> = {
    top: { position: "absolute" as const, top: 4, left: 0, right: 0, alignItems: "center" as const },
    topLeft: { position: "absolute" as const, top: 4, left: 8 },
    topRight: { position: "absolute" as const, top: 4, right: 8 },
    left: { position: "absolute" as const, top: tableCenterY - 80, left: 4 },
    right: { position: "absolute" as const, top: tableCenterY - 80, right: 4 },
  };

  // Show lobby
  if (lobbyPhase !== "game" && lobbyPhase !== "result") {
    if (lobbyPhase === "dealing") {
      if (isOnline && !gameState) {
        return (
          <View style={{ flex: 1, backgroundColor: "#020810", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <LinearGradient colors={["#020810", "#041530"]} style={StyleSheet.absoluteFill} />
            <Animated.Text style={{ fontSize: 42, color: Colors.gold, fontFamily: "Nunito_800ExtraBold" }}>
              ⟳
            </Animated.Text>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.gold, letterSpacing: 3 }}>
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

  return (
    <View style={[gameStyles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#04080e", "#060d18", "#080f1a", "#060d18", "#04080e"]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle grid texture */}
      <View style={[gameStyles.gridOverlay, { pointerEvents: "none" } as any]} />

      {/* Header */}
      <View style={[gameStyles.header, { height: headerH }]}>
        <Pressable onPress={() => { playButton().catch(() => {}); router.back(); }} style={gameStyles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={Colors.gold} />
        </Pressable>
        <View style={gameStyles.headerMid}>
          <View style={gameStyles.onlinePill}>
            <View style={gameStyles.onlinePillDot} />
            <Text style={gameStyles.onlinePillText}>ONLINE</Text>
          </View>
          <Text style={gameStyles.headerTitle}>{playerCount} {T("players")}</Text>
        </View>
        <View style={gameStyles.deckBadge}>
          <Ionicons name="layers-outline" size={12} color={Colors.textDim} />
          <Text style={gameStyles.deckCount}>{gs.drawPile.length}</Text>
        </View>
      </View>

      {/* Game zone */}
      <View style={[gameStyles.gameZone, { height: zoneH, paddingBottom: botPad }]}>

        {/* ─── Oval table ─── */}
        <View style={[gameStyles.tableOval, {
          width: tableW, height: tableH,
          left: SW / 2 - tableW / 2,
          top: tableCenterY - tableH / 2,
          borderRadius: tableH / 2,
        }]}>
          <LinearGradient
            colors={["#0d1f3e", "#0a1830", "#07101e"]}
            style={[StyleSheet.absoluteFill, { borderRadius: tableH / 2 }]}
          />
          <View style={[gameStyles.tableInnerRing, { borderRadius: (tableH - 14) / 2 }]} />
          <View style={gameStyles.tableContent}>
            {/* Draw pile */}
            <Pressable onPress={handleDraw} disabled={!isPlaying} style={gameStyles.drawPileBtn}>
              <View style={gameStyles.drawPileStack}>
                {[2, 1, 0].map(i => (
                  <View key={i} style={[gameStyles.drawCardAbs, { top: -i * 1.5, left: i * 1.5, zIndex: 3 - i }]}>
                    <LinearGradient colors={backColors} style={gameStyles.drawCardInner}>
                      <Text style={[gameStyles.drawCardDot, { color: backAccent }]}>◆</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
              {isPlaying && (
                <View style={[gameStyles.drawLabel, { backgroundColor: gs.pendingDraw > 0 ? Colors.red : "#4A90E2" }]}>
                  <Text style={gameStyles.drawLabelText}>
                    {gs.pendingDraw > 0 ? `+${gs.pendingDraw}` : T("drawCard")}
                  </Text>
                </View>
              )}
            </Pressable>

            <View style={gameStyles.dirArrowWrap}>
              <DirectionArrow direction={gs.direction} />
              <Text style={[gameStyles.suitOnTable, { color: topSuitColor }]}>{suitSymbol(gs.currentSuit)}</Text>
            </View>

            {/* Discard pile */}
            <View style={gameStyles.discardPileWrap}>
              {topCard && <PlayingCard card={topCard} size="sm" />}
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
          return (
            <View key={cp.idx} style={posStyles[cp.pos]}>
              <CpuZone
                handCount={handCount}
                profile={cpu}
                color={PLAYER_COLORS[cp.idx % PLAYER_COLORS.length]}
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

          {/* Inactivity progress bar — shown during human turn */}
          {isPlaying && inactivityProgress < 1 && (
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
            </View>
          )}

          {/* Arc fan hand */}
          {(() => {
            const N = currentHand.length;
            if (N === 0) return null;
            const CARD_W = 62;
            const CARD_H = 90;
            const MAX_ANGLE = Math.min(24, N * 2.8);
            const MAX_ARC = 16;
            const xStep = N <= 4 ? CARD_W * 0.72 : N <= 7 ? CARD_W * 0.60 : N <= 10 ? CARD_W * 0.48 : CARD_W * 0.38;
            const totalWidth = CARD_W + (N - 1) * xStep;
            const startX = Math.max(8, (SW - totalWidth) / 2);
            const containerH = CARD_H + MAX_ARC + 8;

            return (
              <View style={{ height: containerH, width: "100%", position: "relative" }}>
                {currentHand.map((card, i) => {
                  const centerI = (N - 1) / 2;
                  const t = N <= 1 ? 0 : (i - centerI) / Math.max(1, centerI);
                  const angle = t * MAX_ANGLE;
                  const arcY = Math.abs(t) * MAX_ARC;
                  const x = startX + i * xStep;
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
                        transform: [{ rotate: `${angle}deg` }],
                      }}
                    >
                      <PlayingCard
                        card={card}
                        onPress={() => handleCardPress(card)}
                        isPlayable={playable}
                        isSelected={selected}
                        size="md"
                      />
                    </View>
                  );
                })}
              </View>
            );
          })()}
        </View>

        {/* Message bar — sits above the player hand zone */}
        <View style={[gameStyles.messageBubble, { bottom: 168 }]}>
          <Text style={gameStyles.messageText} numberOfLines={1}>{gs.message}</Text>
        </View>

      </View>

      {/* Suit picker */}
      {gs.phase === "choosing_suit" && selectedCard && gs.currentPlayerIndex === 0 && (
        <View style={StyleSheet.absoluteFill}>
          <SuitPicker onChoose={handleChooseSuit} />
        </View>
      )}

      {/* Result overlay */}
      {gs.phase === "game_over" && gs.winnerIndex !== null && !rivalAbandoned && (
        <ResultOverlay
          isWin={gs.winnerIndex === 0}
          winnerName={allNames[gs.winnerIndex]}
          winnerColor={PLAYER_COLORS[gs.winnerIndex % PLAYER_COLORS.length]}
          onClose={() => { playButton().catch(() => {}); router.back(); }}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Rival abandoned overlay */}
      {rivalAbandoned && (
        <RivalAbandonedOverlay
          rivalName={currentCpuProfiles[0]?.name ?? "Rival"}
          onClaim={() => { playWin().catch(() => {}); router.back(); }}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </View>
  );
}

const gameStyles = StyleSheet.create({
  container: { flex: 1 },
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
  onlinePillText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: "#2ecc71", letterSpacing: 2 },
  headerTitle: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  deckBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textDim },
  gameZone: { flex: 1, position: "relative" },

  // Oval table (blue-themed for online)
  tableOval: {
    position: "absolute",
    borderWidth: 2, borderColor: "#4A90E244",
    overflow: "hidden",
    shadowColor: "#4A90E2", shadowOpacity: 0.2, shadowRadius: 20,
    elevation: 8,
  },
  tableInnerRing: {
    position: "absolute", inset: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  tableContent: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 12,
  },
  drawPileBtn: { alignItems: "center", justifyContent: "center" },
  drawPileStack: { width: 44, height: 60, position: "relative" },
  drawCardAbs: { position: "absolute", width: 40, height: 56, borderRadius: 6, overflow: "hidden" },
  drawCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  drawCardDot: { fontSize: 8, color: "#4A90E2", opacity: 0.3 },
  drawLabel: {
    marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: "center",
  },
  drawLabelText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, color: "#fff" },
  dirArrowWrap: { alignItems: "center", gap: 2 },
  dirArrow: { fontSize: 18, color: "#4A90E2", opacity: 0.7 },
  suitOnTable: { fontSize: 16, fontFamily: "Nunito_900ExtraBold" },
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
  cpuLevel: { fontFamily: "Nunito_400Regular", fontSize: 9, color: Colors.textDim },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#2ecc71" },
  topCardFan: { flexDirection: "row", alignItems: "flex-end" },
  sideCardFan: { alignItems: "center" },
  thinkingText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "#4A90E2", marginTop: 2 },
  skipText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: Colors.red, letterSpacing: 1 },
  cpuCountBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, borderWidth: 1, marginTop: 2,
  },
  cpuCountText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9 },

  faceDownMini: {
    width: 28, height: 40, borderRadius: 5,
    overflow: "hidden", borderWidth: 1, borderColor: "#4A90E244",
  },
  faceDownDot: { fontSize: 7, color: "#4A90E2", opacity: 0.3, textAlign: "center", marginTop: 12 },

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
    backgroundColor: "#4A90E222", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: "#4A90E244",
  },
  waitingText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: "#4A90E2" },
  inactivityBar: {
    width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2, marginBottom: 4, overflow: "hidden",
  },
  inactivityFill: { height: 3, borderRadius: 2 },
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
  suitTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 2 },
  suitGrid: { flexDirection: "row", gap: 14, flexWrap: "wrap", justifyContent: "center" },
  suitBtn: {
    width: 80, height: 80, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center",
    gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  suitSym: { fontSize: 28, fontFamily: "Nunito_900ExtraBold" },
  suitLbl: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textMuted },

  // Result overlay
  resultOverlay: {
    position: "absolute", inset: 0, zIndex: 300,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  resultTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 40, letterSpacing: 2 },
  resultSub: { fontFamily: "Nunito_700Bold", fontSize: 16 },
  resultBtn: { marginTop: 24, borderRadius: 16, overflow: "hidden", width: 250 },
  resultBtnGrad: { paddingVertical: 16, alignItems: "center" },
  resultBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#fff" },
});
