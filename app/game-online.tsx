import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform, useWindowDimensions,
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
import { PlayingCard } from "@/components/PlayingCard";
import {
  MultiGameState, Card, Suit,
  initMultiGame, multiCanPlay, multiPlayCard, multiDraw, multiChooseSuit, multiConfirmTurn,
  cpuPlayMulti, suitName, suitSymbol, suitColor, multiGetTopCard,
} from "@/lib/multiplayerEngine";
import { useProfile } from "@/context/ProfileContext";
import { playCardFlip, playCardDraw, playButton, playWin } from "@/lib/audioManager";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

// Fake CPU online profiles
const CPU_POOL = [
  { name: "CarlosMX", flag: "🇲🇽", level: 12, wr: 67, avatarColor: "#27AE60" },
  { name: "LucíaAR", flag: "🇦🇷", level: 8,  wr: 52, avatarColor: "#E74C3C" },
  { name: "DiegoVE", flag: "🇻🇪", level: 15, wr: 71, avatarColor: "#9B59B6" },
  { name: "SofíaCO", flag: "🇨🇴", level: 6,  wr: 45, avatarColor: "#E67E22" },
  { name: "MiguelCL", flag: "🇨🇱", level: 20, wr: 78, avatarColor: "#1A8FC1" },
  { name: "ValeriaPE", flag: "🇵🇪", level: 10, wr: 60, avatarColor: "#27AE60" },
  { name: "AndresEC", flag: "🇪🇨", level: 14, wr: 65, avatarColor: "#E74C3C" },
  { name: "IsabelBO", flag: "🇧🇴", level: 7,  wr: 48, avatarColor: "#D4AF37" },
  { name: "XavierUY", flag: "🇺🇾", level: 18, wr: 73, avatarColor: "#9B59B6" },
  { name: "NataliaCR", flag: "🇨🇷", level: 11, wr: 58, avatarColor: "#E74C3C" },
];

function pickCpuProfiles(count: number) {
  const shuffled = [...CPU_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
  cpuProfiles: typeof CPU_POOL;
  joinedCount: number;
  phase: "searching" | "found" | "countdown";
  countdown: number;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (phase === "found" || phase === "countdown") {
      pulse.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 400 }), withTiming(1, { duration: 400 })), -1
      );
    }
  }, [phase]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={lobbyStyles.container}>
      <LinearGradient colors={["#020810", "#041530", "#02080f"]} style={lobbyStyles.bg} />

      <View style={lobbyStyles.content}>
        {phase === "searching" && (
          <>
            <LobbySpinner />
            <Text style={lobbyStyles.searchLabel}>BUSCANDO PARTIDA...</Text>
            <Text style={lobbyStyles.searchSub}>{joinedCount + 1}/{playerCount} jugadores</Text>
          </>
        )}
        {phase === "found" && (
          <Animated.Text style={[lobbyStyles.foundLabel, pulseStyle]}>¡PARTIDA ENCONTRADA!</Animated.Text>
        )}
        {phase === "countdown" && (
          <View style={lobbyStyles.countdownWrap}>
            <Text style={lobbyStyles.countdownLabel}>COMIENZA EN</Text>
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
              <Text style={lobbyStyles.slotSub}>Nivel 1 · Tú</Text>
            </View>
            <View style={lobbyStyles.onlineDot} />
          </Animated.View>

          {/* CPU slots */}
          {cpuProfiles.slice(0, joinedCount).map((cpu, i) => (
            <Animated.View
              key={cpu.name}
              entering={FadeInDown.delay(100).duration(500)}
              style={lobbyStyles.slot}
            >
              <View style={[lobbyStyles.slotAvatar, { borderColor: cpu.avatarColor }]}>
                <Text style={lobbyStyles.slotFlag}>{cpu.flag}</Text>
              </View>
              <View style={lobbyStyles.slotInfo}>
                <Text style={[lobbyStyles.slotName, { color: cpu.avatarColor }]}>{cpu.name}</Text>
                <Text style={lobbyStyles.slotSub}>Nivel {cpu.level} · {cpu.wr}% WR</Text>
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
                <Text style={lobbyStyles.slotName}>Buscando...</Text>
                <Text style={lobbyStyles.slotSub}>Conectando</Text>
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
function FaceDownMini({ angle = 0 }: { angle?: number }) {
  return (
    <View style={[gameStyles.faceDownMini, { transform: [{ rotate: `${angle}deg` }] }]}>
      <LinearGradient colors={["#1E4080", "#0e2248"]} style={StyleSheet.absoluteFill}>
        <Text style={gameStyles.faceDownDot}>◆</Text>
      </LinearGradient>
    </View>
  );
}

// ─── CPU opponent zone ────────────────────────────────────────────────────
function CpuZone({ handCount, profile, color, isThinking, isCurrent, side, isSkipped }: {
  handCount: number; profile: typeof CPU_POOL[0]; color: string;
  isThinking: boolean; isCurrent: boolean; side?: "left" | "right";
  isSkipped?: boolean;
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
          <Text style={gameStyles.cpuFlag}>{profile.flag}</Text>
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
            <FaceDownMini />
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
  return (
    <View style={gameStyles.suitOverlay}>
      <Text style={gameStyles.suitTitle}>Elige el palo</Text>
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
function ResultOverlay({ isWin, winnerName, winnerColor, onClose }: {
  isWin: boolean; winnerName: string; winnerColor: string; onClose: () => void;
}) {
  return (
    <View style={gameStyles.resultOverlay}>
      <LinearGradient
        colors={isWin ? ["#041a04", "#062206"] : ["#1a0404", "#220606"]}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={isWin ? "trophy" : "close-circle"} size={72} color={isWin ? Colors.gold : Colors.red} />
      <Text style={[gameStyles.resultTitle, { color: isWin ? Colors.gold : Colors.red }]}>
        {isWin ? "¡GANASTE!" : "DERROTA"}
      </Text>
      {!isWin && (
        <Text style={[gameStyles.resultSub, { color: winnerColor }]}>{winnerName} ganó</Text>
      )}
      <Pressable style={gameStyles.resultBtn} onPress={onClose}>
        <LinearGradient
          colors={isWin ? [Colors.gold, Colors.gold + "bb"] : [Colors.red, Colors.red + "bb"]}
          style={gameStyles.resultBtnGrad}
        >
          <Text style={gameStyles.resultBtnText}>VOLVER AL MENÚ</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function OnlineGameScreen() {
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const params = useLocalSearchParams<{ count?: string }>();
  const { profile } = useProfile();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;
  const headerH = 50;
  const zoneH = SH - topPad - botPad - headerH;
  const tableW = Math.min(SW * 0.64, 250);
  const tableH = tableW * 0.55;
  const tableCenterY = zoneH * 0.44;

  const playerCount = Math.min(4, Math.max(2, parseInt(params.count ?? "2", 10)));

  const cpuProfiles = React.useMemo(() => pickCpuProfiles(playerCount - 1), []);
  const humanName = profile.name || "Tú";

  // All player names: human is index 0, CPUs are 1..n
  const allNames = [humanName, ...cpuProfiles.map(c => c.name)];

  // Lobby state
  const [lobbyPhase, setLobbyPhase] = useState<"searching" | "found" | "countdown" | "game" | "result">("searching");
  const [joinedCount, setJoinedCount] = useState(0);
  const [countdown, setCountdown] = useState(3);

  // Game state
  const [gameState, setGameState] = useState<MultiGameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const cpuThinking = useRef(false);

  // ─── Lobby sequence ─────────────────────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 1200;

    for (let i = 0; i < playerCount - 1; i++) {
      const d = delay;
      timers.push(setTimeout(() => setJoinedCount(prev => prev + 1), d));
      delay += 800 + Math.random() * 400;
    }

    timers.push(setTimeout(() => setLobbyPhase("found"), delay));
    delay += 800;
    timers.push(setTimeout(() => setLobbyPhase("countdown"), delay));
    delay += 400;

    for (let c = 3; c >= 1; c--) {
      const cVal = c;
      timers.push(setTimeout(() => setCountdown(cVal), delay));
      delay += 1000;
    }

    timers.push(setTimeout(() => {
      const gs = initMultiGame(allNames);
      gs.phase = "playing"; // Online starts directly, no pass_device for human
      setGameState(gs);
      setLobbyPhase("game");
    }, delay));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── CPU auto-play ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameState || lobbyPhase !== "game") return;
    if (gameState.phase === "game_over") return;
    const pidx = gameState.currentPlayerIndex;
    if (pidx === 0) return; // Human's turn

    if (gameState.phase === "pass_device") {
      // Auto-confirm for CPU (no pass-device needed)
      const t = setTimeout(() => {
        setGameState(prev => prev ? { ...prev, phase: "playing" } : prev);
      }, 200);
      return () => clearTimeout(t);
    }

    if (gameState.phase === "playing" && !cpuThinking.current) {
      cpuThinking.current = true;
      const delay = 1000 + Math.random() * 1200;
      const t = setTimeout(() => {
        cpuThinking.current = false;
        setGameState(prev => {
          if (!prev || prev.currentPlayerIndex !== pidx) return prev;
          return cpuPlayMulti(prev);
        });
      }, delay);
      return () => clearTimeout(t);
    }
  }, [gameState, lobbyPhase]);

  // ─── Player card interactions ────────────────────────────────────────────
  const isPlaying = gameState?.phase === "playing" && gameState?.currentPlayerIndex === 0;
  const currentHand = gameState?.hands[0] ?? [];
  const topCard = gameState ? multiGetTopCard(gameState) : null;

  const handleCardPress = useCallback((card: Card) => {
    if (!gameState || !isPlaying) return;
    if (!multiCanPlay(card, gameState)) { playCardFlip().catch(() => {}); return; }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0)) return;
      playCardFlip().catch(() => {});
      setGameState(multiPlayCard(gameState, card));
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }, [gameState, isPlaying, selectedCard]);

  const handleChooseSuit = useCallback((suit: Suit) => {
    if (!gameState || !selectedCard) return;
    playCardFlip().catch(() => {});
    setGameState(multiPlayCard(gameState, selectedCard, suit));
    setSelectedCard(null);
  }, [gameState, selectedCard]);

  const handleDraw = useCallback(() => {
    if (!gameState || !isPlaying) return;
    playCardDraw().catch(() => {});
    setGameState(multiDraw(gameState));
    setSelectedCard(null);
  }, [gameState, isPlaying]);

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
    return (
      <View style={{ flex: 1 }}>
        <LobbyScreen
          playerCount={playerCount}
          humanName={humanName}
          cpuProfiles={cpuProfiles}
          joinedCount={joinedCount}
          phase={lobbyPhase as "searching" | "found" | "countdown"}
          countdown={countdown}
        />
      </View>
    );
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
      <View style={gameStyles.gridOverlay} pointerEvents="none" />

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
          <Text style={gameStyles.headerTitle}>{playerCount} Jugadores</Text>
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
                    <LinearGradient colors={["#1E4080", "#0e2248"]} style={gameStyles.drawCardInner}>
                      <Text style={gameStyles.drawCardDot}>◆</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
              {isPlaying && (
                <View style={[gameStyles.drawLabel, { backgroundColor: gs.pendingDraw > 0 ? Colors.red : "#4A90E2" }]}>
                  <Text style={gameStyles.drawLabelText}>
                    {gs.pendingDraw > 0 ? `+${gs.pendingDraw}` : "ROBAR"}
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
          const cpu = cpuProfiles[cp.idx - 1];
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
              />
            </View>
          );
        })}

        {/* ─── Human player hand ─── */}
        <View style={[gameStyles.playerZone, { top: tableCenterY + tableH / 2 + 10 }]}>
          <View style={gameStyles.playerLabel}>
            <View style={gameStyles.humanAvatar}>
              <Ionicons name="person" size={14} color={Colors.gold} />
            </View>
            <Text style={gameStyles.playerName} numberOfLines={1}>
              {humanName} · {currentHand.length} cartas
            </Text>
            {isPlaying && playableCount > 0 && (
              <View style={gameStyles.playableBadge}>
                <Text style={gameStyles.playableText}>{playableCount} jugables</Text>
              </View>
            )}
            {!isPlaying && gs.currentPlayerIndex !== 0 && (
              <View style={gameStyles.waitingBadge}>
                <Text style={gameStyles.waitingText}>Esperando...</Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={gameStyles.handContainer}
          >
            {currentHand.map((card, i) => {
              const playable = isPlaying && multiCanPlay(card, gs);
              const selected = selectedCard?.id === card.id;
              return (
                <View key={card.id} style={{
                  marginLeft: i === 0 ? 0 : -20,
                  zIndex: selected ? 100 : i,
                  transform: [{ translateY: selected ? -10 : 0 }],
                }}>
                  <PlayingCard
                    card={card}
                    onPress={() => handleCardPress(card)}
                    isPlayable={playable}
                    isSelected={selected}
                    size="sm"
                  />
                </View>
              );
            })}
          </ScrollView>
          {selectedCard && isPlaying && (
            <Text style={gameStyles.selectedHint}>
              {(selectedCard.rank === "8" || (selectedCard.rank === "Joker" && gs.pendingDraw === 0))
                ? "Toca de nuevo → elegir palo"
                : "Toca de nuevo para jugar"}
            </Text>
          )}
        </View>

        {/* Message bar */}
        <View style={[gameStyles.messageBubble, { top: tableCenterY + tableH / 2 - 4 }]}>
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
      {gs.phase === "game_over" && gs.winnerIndex !== null && (
        <ResultOverlay
          isWin={gs.winnerIndex === 0}
          winnerName={allNames[gs.winnerIndex]}
          winnerColor={PLAYER_COLORS[gs.winnerIndex % PLAYER_COLORS.length]}
          onClose={() => { playButton().catch(() => {}); router.back(); }}
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
  playerZone: { position: "absolute", left: 0, right: 0, gap: 4 },
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
