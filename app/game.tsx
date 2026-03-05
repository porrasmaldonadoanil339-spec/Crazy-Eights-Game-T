import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform, Dimensions, Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  withRepeat, withDelay, Easing, runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { PlayingCard } from "@/components/PlayingCard";
import { DealAnimation } from "@/components/DealAnimation";
import { CardPlayEffect } from "@/components/CardPlayEffect";
import { MatchmakingScreen } from "@/components/MatchmakingScreen";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import type { Suit } from "@/lib/gameEngine";
import { suitSymbol, suitName, suitColor, canPlay } from "@/lib/gameEngine";
import { getModeById, getDifficultyById } from "@/lib/gameModes";
import { AVATARS, CARD_BACKS } from "@/lib/storeItems";
import type { Card } from "@/lib/gameEngine";
import { getRandomCpuProfile, type CpuProfile } from "@/lib/cpuProfiles";
import { playSound } from "@/lib/sounds";
import { EmotePanel, EmoteBubble, EMOTES, type Emote } from "@/components/EmotePanel";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const { width: SW, height: SH } = Dimensions.get("window");

// ─── Particle confetti for win ───────────────────────────────────────────────
const PARTICLE_SYMS = ["♠","♥","♦","♣"];
function WinParticle({ index, total }: { index: number; total: number }) {
  const x = useSharedValue(SW * 0.5);
  const y = useSharedValue(300);
  const op = useSharedValue(0);
  const sc = useSharedValue(0);
  useEffect(() => {
    const angle = (index / total) * Math.PI * 2;
    const dist = 80 + Math.random() * 100;
    const tx = SW * 0.5 + Math.cos(angle) * dist;
    const ty = 300 + Math.sin(angle) * dist - 120;
    op.value = withTiming(1, { duration: 100 });
    sc.value = withSpring(1.2, { damping: 10 });
    x.value = withTiming(tx, { duration: 700, easing: Easing.out(Easing.quad) });
    y.value = withTiming(ty, { duration: 700, easing: Easing.out(Easing.quad) });
    setTimeout(() => { op.value = withTiming(0, { duration: 300 }); }, 600);
  }, []);
  const s = useAnimatedStyle(() => ({
    position: "absolute", left: x.value - 6, top: y.value - 6,
    opacity: op.value, transform: [{ scale: sc.value }],
  }));
  const isRed = index % 4 === 1 || index % 4 === 2;
  return (
    <Animated.Text style={[s, { fontSize: 14, color: isRed ? "#C0392B" : Colors.gold }]}>
      {PARTICLE_SYMS[index % 4]}
    </Animated.Text>
  );
}

function WinParticles() {
  const total = 14;
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
      {Array.from({ length: total }).map((_, i) => (
        <WinParticle key={i} index={i} total={total} />
      ))}
    </View>
  );
}

// ─── Expert timer bar ──────────────────────────────────────────────────────────
function ExpertTimerBar({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total;
  const isRed = seconds <= 3;
  return (
    <View style={timerStyles.wrap}>
      <View style={timerStyles.track}>
        <View style={[timerStyles.fill, {
          width: `${pct * 100}%`,
          backgroundColor: isRed ? "#E74C3C" : "#D4AF37",
        }]} />
      </View>
      <Text style={[timerStyles.label, isRed && timerStyles.labelRed]}>{seconds}s</Text>
    </View>
  );
}
const timerStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 },
  track: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  label: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: "#D4AF37", minWidth: 26 },
  labelRed: { color: "#E74C3C" },
});

// ─── Pending draw indicator ────────────────────────────────────────────────────
function PendingDrawBanner({ count, type }: { count: number; type: "two" | "seven" | null }) {
  const T = useT();
  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 350 }), withTiming(1, { duration: 350 })), -1
    );
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: blink.value }));
  const msg = type === "two"
    ? T("drawNCards2").replace("{n}", String(count))
    : T("drawNCards7").replace("{n}", String(count));
  return (
    <Animated.View style={[pendStyles.wrap, s]}>
      <Ionicons name="alert-circle" size={14} color="#E74C3C" />
      <Text style={pendStyles.text}>{msg}</Text>
    </Animated.View>
  );
}
const pendStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(231,76,60,0.15)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "#E74C3C55",
  },
  text: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "#E74C3C" },
  num: { fontFamily: "Nunito_900ExtraBold" },
});

// ─── Suit picker ─────────────────────────────────────────────────────────────
function SuitPicker({ visible, onSelect, isJoker }: {
  visible: boolean; onSelect: (s: Suit) => void; isJoker?: boolean;
}) {
  const T = useT();
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.suitOverlay}>
        <View style={styles.suitModal}>
          <LinearGradient colors={["#1a2e1a", Colors.surface]} style={styles.suitGrad}>
            <Text style={styles.suitTitle}>{isJoker ? T("joker") : T("chooseSuit")}</Text>
            <Text style={styles.suitSub}>{isJoker ? T("jokerDesc") : T("chooseSuitSub8")}</Text>
            <View style={styles.suitGrid}>
              {SUITS.map((suit) => (
                <Pressable key={suit} onPress={() => onSelect(suit)} style={({ pressed }) => [styles.suitOption, pressed && styles.suitOptionPressed]}>
                  <Text style={[styles.suitSymLg, { color: suitColor(suit) }]}>{suitSymbol(suit)}</Text>
                  <Text style={styles.suitLbl}>{suitName(suit)}</Text>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

// ─── Tournament modal ─────────────────────────────────────────────────────────
function TournamentModal({ scores, round, onContinue, onQuit }: {
  scores: [number, number]; round: number; onContinue: () => void; onQuit: () => void;
}) {
  const T = useT();
  const isOver = scores[0] >= 2 || scores[1] >= 2;
  const playerWon = scores[0] >= 2;
  return (
    <View style={styles.endOverlay}>
      <View style={styles.endModal}>
        <LinearGradient colors={isOver && playerWon ? ["#1a2e1a", Colors.surface] : ["#1a1a2e", Colors.surface]} style={styles.endGrad}>
          <Ionicons name="trophy" size={44} color={Colors.gold} />
          <Text style={styles.endTitle}>{isOver ? (playerWon ? T("champion") : T("defeat")) : `${T("round")} ${round - 1}`}</Text>
          <View style={styles.tScoreRow}>
            <View style={styles.tScoreTeam}><Text style={styles.tScoreLbl}>{T("you")}</Text><Text style={styles.tScoreNum}>{scores[0]}</Text></View>
            <Text style={styles.tScoreSep}>VS</Text>
            <View style={styles.tScoreTeam}><Text style={styles.tScoreLbl}>{T("cpu")}</Text><Text style={styles.tScoreNum}>{scores[1]}</Text></View>
          </View>
          {!isOver && <Text style={styles.endSub}>{T("firstToWinRounds")}</Text>}
          <View style={styles.endBtns}>
            {!isOver && <Pressable onPress={onContinue} style={styles.btnPrimary}><Text style={styles.btnPrimaryTxt}>{T("continueRound")}</Text></Pressable>}
            <Pressable onPress={onQuit} style={[styles.btnSecondary, isOver && { flex: 1 }]}>
              <Text style={styles.btnSecondaryTxt}>{isOver ? T("returnMenu") : T("abandon")}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// ─── Win messages pool ────────────────────────────────────────────────────────
const WIN_MESSAGES = [
  "¡Dominas la mesa como un campeón!",
  "¡Nadie puede contigo hoy!",
  "¡Las cartas son tuyas, maestro!",
  "¡Brillante estrategia! ¡Impresionante!",
  "¡El oponente ni supo lo que pasó!",
  "¡Eso fue pura magia de cartas!",
  "¡Eres imparable, sigue así!",
];
const LOSE_MESSAGES = [
  "¡La próxima será tuya, no te rindas!",
  "El CPU tuvo suerte… ¡hoy no te ganarán!",
  "¡Cada derrota te hace más fuerte!",
  "Un buen jugador aprende de cada partida.",
  "¡Así no, inténtalo de nuevo!",
  "El oponente estuvo listo hoy. ¡Tú serás el próximo!",
];

// ─── End modal ────────────────────────────────────────────────────────────────
function EndModal({ phase, coinsEarned, xpEarned, onRestart, onHome }: {
  phase: string; coinsEarned: number; xpEarned: number; onRestart: () => void; onHome: () => void;
}) {
  const T = useT();
  const isWin = phase === "player_wins";
  const isDraw = phase === "draw";

  const sc = useSharedValue(0.6);
  const glowOp = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleOp = useSharedValue(0);

  const winMsg = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
  const loseMsg = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];

  useEffect(() => {
    sc.value = withSpring(1, { damping: 10, stiffness: 120 });
    glowOp.value = withTiming(1, { duration: 600 });
    titleY.value = withDelay(200, withSpring(0, { damping: 14 }));
    titleOp.value = withDelay(200, withTiming(1, { duration: 400 }));
    if (isWin) playSound("win").catch(() => {});
    else playSound("lose").catch(() => {});
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }));

  const bgColors: [string, string, string] = isWin
    ? ["#0A1E0A", "#122212", "#0D1A0D"]
    : isDraw
    ? ["#0E0E1E", "#181822", "#0E0E1A"]
    : ["#1E0A0A", "#221212", "#1A0D0D"];

  const accentColor = isWin ? Colors.gold : isDraw ? Colors.blue : Colors.red;
  const glowColor = isWin ? "#D4AF3744" : isDraw ? "#4A90E244" : "#C0392B44";

  return (
    <View style={styles.endOverlay}>
      {isWin && <WinParticles />}

      {/* Background glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          glowStyle,
          { alignItems: "center", justifyContent: "center", pointerEvents: "none" } as any,
        ]}
      >
        <View style={[styles.bgGlow, { backgroundColor: glowColor }]} />
      </Animated.View>

      <Animated.View style={[styles.endModal, { borderColor: accentColor + "55" }, cardStyle]}>
        <LinearGradient colors={bgColors} style={styles.endGrad}>

          {/* Icon with radial ring */}
          <View style={[styles.endIconOuter, { borderColor: accentColor + "33", shadowColor: accentColor }]}>
            <View style={[styles.endIconInner, { borderColor: accentColor + "88", backgroundColor: accentColor + "18" }]}>
              {isWin
                ? <Ionicons name="trophy" size={48} color={Colors.gold} />
                : isDraw
                ? <Ionicons name="hand-left" size={44} color={Colors.blue} />
                : <Ionicons name="skull" size={44} color={Colors.red} />
              }
            </View>
          </View>

          {/* Title */}
          <Animated.View style={[{ alignItems: "center", gap: 4 }, titleStyle]}>
            <Text style={[styles.endLabel, { color: accentColor + "CC" }]}>
              {T("result")}
            </Text>
            <Text style={[styles.endTitle, { color: accentColor }]}>
              {isWin ? T("victory") : isDraw ? T("draw") : T("defeat")}
            </Text>
            <Text style={styles.endSub}>
              {isWin ? winMsg : isDraw ? T("drawMsg") : loseMsg}
            </Text>
          </Animated.View>

          {/* Divider */}
          <View style={[styles.endDivider, { backgroundColor: accentColor + "22" }]} />

          {/* Rewards */}
          {(coinsEarned > 0 || xpEarned > 0) && (
            <View style={styles.rewardSection}>
              <Text style={styles.rewardLabel}>{T("rewards")}</Text>
              <View style={styles.rewardRow}>
                {coinsEarned > 0 && (
                  <View style={[styles.rewardChip, { backgroundColor: Colors.gold + "22", borderColor: Colors.gold + "55" }]}>
                    <Ionicons name="cash" size={16} color={Colors.gold} />
                    <Text style={[styles.rewardChipVal, { color: Colors.gold }]}>+{coinsEarned}</Text>
                    <Text style={styles.rewardChipSub}>{T("coins")}</Text>
                  </View>
                )}
                {xpEarned > 0 && (
                  <View style={[styles.rewardChipXP, { backgroundColor: "#9B59B622", borderColor: "#9B59B655" }]}>
                    <Ionicons name="star" size={14} color="#A855F7" />
                    <Text style={[styles.rewardChipVal, { color: "#A855F7" }]}>+{xpEarned}</Text>
                    <Text style={styles.rewardChipSub}>{T("xp")}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.endBtns}>
            <Pressable
              onPress={onRestart}
              style={({ pressed }) => [styles.btnPrimary, { backgroundColor: accentColor, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="refresh" size={16} color="#1a0a00" />
              <Text style={styles.btnPrimaryTxt}>{T("playAgain")}</Text>
            </Pressable>
            <Pressable
              onPress={onHome}
              style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="home" size={14} color={accentColor} />
              <Text style={[styles.btnSecondaryTxt, { color: accentColor }]}>{T("mainMenu")}</Text>
            </Pressable>
          </View>

        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ─── AI hand display ──────────────────────────────────────────────────────────
function AiHand({ count, isThinking, cpuProfile, backColors, backAccent }: {
  count: number; isThinking: boolean; cpuProfile: CpuProfile | null;
  backColors: [string, string, string]; backAccent: string;
}) {
  const T = useT();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isThinking) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 400 }), withTiming(1, { duration: 400 })), -1
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isThinking]);
  const pStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.aiSection}>
      {/* CPU Profile row */}
      <View style={styles.cpuProfileRow}>
        {cpuProfile?.photoUrl ? (
          <Image
            source={{ uri: cpuProfile.photoUrl }}
            style={[styles.cpuAvatar, { backgroundColor: cpuProfile.avatarColor }]}
          />
        ) : (
          <View style={[styles.cpuAvatar, { backgroundColor: cpuProfile?.avatarColor ?? "#2C3E50" }]}>
            <Ionicons name={(cpuProfile?.avatarIcon ?? "person") as any} size={13} color="#fff" />
          </View>
        )}
        <View style={styles.cpuProfileInfo}>
          <Text style={styles.cpuName} numberOfLines={1}>{cpuProfile?.name ?? "CPU"}</Text>
          <Text style={styles.cpuMeta} numberOfLines={1}>
            Nv.{cpuProfile?.level ?? "?"} · {cpuProfile?.titleId?.replace("title_", "").replace(/_/g, " ") ?? "CPU"}
          </Text>
        </View>
        <View style={[styles.turnDot, { backgroundColor: isThinking ? Colors.gold : "rgba(255,255,255,0.1)" }]} />
        {isThinking && <Text style={styles.thinkingText}>{T("thinking")}</Text>}
      </View>

      <Animated.View style={[styles.aiHandRow, pStyle]}>
        {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
          <View key={i} style={[styles.aiCard, {
            marginLeft: i === 0 ? 0 : -24,
            zIndex: i,
            transform: [{ rotate: `${(i - Math.min(count, 12) / 2) * 4}deg` }],
          }]}>
            <LinearGradient colors={backColors} style={styles.aiCardInner}>
              <View style={styles.aiCardPattern}>
                {[0,1,2].map(r => (
                  <View key={r} style={{ flexDirection: "row", gap: 2 }}>
                    {[0,1,2].map(c => <Text key={c} style={{ fontSize: 5, color: backAccent, opacity: 0.3 }}>◆</Text>)}
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}
        <View style={styles.aiCountBadge}>
          <Text style={styles.aiCountText}>{count}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Player profile bar ───────────────────────────────────────────────────────
function PlayerProfileBar({ name, avatarId, titleId, level, photoUri }: {
  name: string; avatarId: string; titleId: string; level: number; photoUri?: string;
}) {
  const avatarItem = AVATARS.find(a => a.id === avatarId);
  const titleName = titleId.replace("title_", "").replace(/_/g, " ");
  return (
    <View style={styles.playerProfileRow}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={[styles.playerAvatar, { borderRadius: 16 }]} />
      ) : (
        <View style={[styles.playerAvatar, { backgroundColor: avatarItem?.previewColor ?? "#2a4a2a" }]}>
          <Ionicons name={(avatarItem?.preview ?? "person") as any} size={13} color="#fff" />
        </View>
      )}
      <View style={styles.playerProfileInfo}>
        <Text style={styles.playerProfileName} numberOfLines={1}>{name}</Text>
        <Text style={styles.playerProfileMeta} numberOfLines={1}>Nv.{level} · {titleName}</Text>
      </View>
      <View style={styles.playerTurnDot} />
    </View>
  );
}

// ─── Main game screen ─────────────────────────────────────────────────────────
export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    gameState, session, handlePlayCard, handleDraw, handleChooseSuit,
    runAiTurn, selectedCard, setSelectedCard, dealAnimationDone, setDealAnimationDone,
    startNextTournamentRound, startGame, getGameResult,
  } = useGame();
  const { profile, level, recordGameResult, updateAchievementProgress } = useProfile();
  const T = useT();

  const cardBack = CARD_BACKS.find(b => b.id === profile.cardBackId) ?? CARD_BACKS[0];
  const backColors = (cardBack.backColors ?? ["#1E4080", "#0e2248", "#0a1832"]) as [string, string, string];
  const backAccent = cardBack.backAccent ?? Colors.gold;

  const aiThinking = useRef(false);
  const resultRecorded = useRef(false);
  const gameStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cpuEmoteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCount = useRef(0);
  const prevLevel = useRef(level);
  const [cpuProfile, setCpuProfile] = useState<CpuProfile | null>(null);
  const [suitPickerVisible, setSuitPickerVisible] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [tournamentScores, setTournamentScores] = useState<[number, number]>([0, 0]);
  const [tournamentRound, setTournamentRound] = useState(1);
  const [endCoins, setEndCoins] = useState(0);
  const [endXp, setEndXp] = useState(0);
  const [isAiThinkingVis, setIsAiThinkingVis] = useState(false);
  const [expertTimer, setExpertTimer] = useState(8);
  const [playerEmote, setPlayerEmote] = useState<Emote | null>(null);
  const [cpuEmote, setCpuEmote] = useState<Emote | null>(null);
  const [lastPlayerEmoteTime, setLastPlayerEmoteTime] = useState(0);
  const [muteCpuEmotes, setMuteCpuEmotes] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpNum, setLevelUpNum] = useState(1);
  const [showEffect, setShowEffect] = useState(false);
  const [inactivityProgress, setInactivityProgress] = useState(1);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActionTime = useRef(Date.now());
  const prevAiHandCount = useRef<number>(0);
  const prevPendingDraw = useRef<number>(0);
  const msgOpacity = useSharedValue(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;
  const isExpert = session?.difficulty === "expert";
  const timerTotal = 8;

  // Pick CPU profile — new seed each retry so opponent changes
  const pickNewCpuProfile = () => {
    const seed = (Math.floor(Date.now() / 1000) + retryCount.current * 37) % 347;
    setCpuProfile(getRandomCpuProfile(seed));
  };

  useEffect(() => {
    pickNewCpuProfile();
  }, []);

  useEffect(() => {
    if (!dealAnimationDone) {
      aiThinking.current = false;
      resultRecorded.current = false;
      gameStartTimeRef.current = Date.now();
      prevLevel.current = level;
    }
  }, [dealAnimationDone]);

  // Detect level up after game result
  useEffect(() => {
    if (!resultRecorded.current) return;
    if (level > prevLevel.current) {
      setLevelUpNum(level);
      setShowLevelUp(true);
      prevLevel.current = level;
    }
  }, [level]);

  // CPU random emote timer — fires quirky emotes during play
  useEffect(() => {
    if (!dealAnimationDone || !gameState || gameState.phase !== "playing") {
      if (cpuEmoteTimerRef.current) { clearInterval(cpuEmoteTimerRef.current); cpuEmoteTimerRef.current = null; }
      return;
    }
    const randomEmotes = ["luck", "win", "expert", "close"];
    cpuEmoteTimerRef.current = setInterval(() => {
      if (Math.random() < 0.3) {
        const id = randomEmotes[Math.floor(Math.random() * randomEmotes.length)];
        const emote = EMOTES.find(e => e.id === id) ?? null;
        if (emote) {
          setCpuEmote(emote);
          setTimeout(() => setCpuEmote(null), 2500);
        }
      }
    }, 15000 + Math.random() * 10000);
    return () => { if (cpuEmoteTimerRef.current) { clearInterval(cpuEmoteTimerRef.current); cpuEmoteTimerRef.current = null; } };
  }, [dealAnimationDone, gameState?.phase]);

  // Expert timer
  useEffect(() => {
    if (!isExpert || !dealAnimationDone) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setExpertTimer(timerTotal);
      return;
    }
    const isPlayerTurn = gameState?.currentPlayer === "player" && gameState?.phase === "playing";
    if (!isPlayerTurn) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setExpertTimer(timerTotal);
      return;
    }
    // Start countdown
    let countdown = timerTotal;
    setExpertTimer(timerTotal);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      countdown--;
      setExpertTimer(countdown);
      if (countdown <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Auto draw on timeout
        playSound("card_draw").catch(() => {});
        handleDraw();
      }
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [gameState?.currentPlayer, gameState?.phase, isExpert, dealAnimationDone, gameState?.message]);

  // AI emote logic — reacts to game events
  useEffect(() => {
    if (!gameState || !dealAnimationDone) return;
    const pendingDraw = gameState.pendingDraw;
    const aiCount = gameState.aiHand.length;
    let emote: Emote | null = null;

    // CPU caused a big pendingDraw
    if (pendingDraw > prevPendingDraw.current && gameState.currentPlayer === "player") {
      emote = EMOTES.find(e => e.id === "draw2") ?? null;
    }
    // CPU is down to 1 card
    else if (aiCount === 1 && prevAiHandCount.current > 1) {
      emote = EMOTES.find(e => e.id === "win") ?? null;
    }
    // CPU drew a lot of cards
    else if (aiCount > prevAiHandCount.current + 2) {
      emote = EMOTES.find(e => e.id === "luck") ?? null;
    }

    if (emote) {
      const timeoutId = setTimeout(() => {
        setCpuEmote(emote);
        setTimeout(() => setCpuEmote(null), 2500);
      }, 600);
      prevPendingDraw.current = pendingDraw;
      prevAiHandCount.current = aiCount;
    } else {
      prevPendingDraw.current = pendingDraw;
      prevAiHandCount.current = aiCount;
    }
  }, [gameState?.pendingDraw, gameState?.aiHand?.length, gameState?.currentPlayer, dealAnimationDone]);

  const handleSendEmote = (emote: Emote) => {
    setPlayerEmote(emote);
    setLastPlayerEmoteTime(Date.now());
    setTimeout(() => setPlayerEmote(null), 2500);
  };

  // AI turn trigger
  useEffect(() => {
    if (!gameState || !dealAnimationDone) return;
    if (gameState.phase !== "playing") return;
    msgOpacity.value = withSequence(withTiming(0.2, { duration: 80 }), withTiming(1, { duration: 200 }));
    if (gameState.currentPlayer === "ai" && !aiThinking.current) {
      aiThinking.current = true;
      setIsAiThinkingVis(true);
      const delay = 800 + Math.random() * 600;
      setTimeout(() => {
        aiThinking.current = false;
        setIsAiThinkingVis(false);
        runAiTurn();
      }, delay);
    }
  }, [gameState?.currentPlayer, gameState?.turnId, dealAnimationDone]);

  // Game result handling
  useEffect(() => {
    if (!gameState || !session || resultRecorded.current) return;
    const result = getGameResult();
    if (!result) return;
    resultRecorded.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const won = result === "player_wins";
    const modeConfig = getModeById(session.mode);
    const diffConfig = getDifficultyById(session.difficulty);
    const duration = Date.now() - gameStartTimeRef.current;
    const coins = Math.round(modeConfig.coinsReward * diffConfig.coinMultiplier * (won ? 1 : 0.1));
    const xp = Math.round(modeConfig.xpReward * diffConfig.xpMultiplier * (won ? 1 : 0.3));
    const isPerfect = session.cardsDrawnThisGame === 0 && won;
    const isComeback = (gameState?.playerHand?.length ?? 0) >= 10 && won;

    setEndCoins(coins);
    setEndXp(xp);

    if (session.mode === "tournament") {
      const newScores: [number, number] = won
        ? [tournamentScores[0] + 1, tournamentScores[1]]
        : [tournamentScores[0], tournamentScores[1] + 1];
      setTournamentScores(newScores);
      setTournamentRound((r) => r + 1);
      recordGameResult({ won, mode: session.mode, difficulty: session.difficulty, coinsEarned: coins, xpEarned: xp, eightsPlayed: session.eightsPlayedThisGame, cardsDrawn: session.cardsDrawnThisGame, isPerfect, isComeback, gameDurationMs: duration });
      setTimeout(() => setShowTournamentModal(true), 900);
    } else {
      recordGameResult({ won, mode: session.mode, difficulty: session.difficulty, coinsEarned: coins, xpEarned: xp, eightsPlayed: session.eightsPlayedThisGame, cardsDrawn: session.cardsDrawnThisGame, isPerfect, isComeback, gameDurationMs: duration });
    }

    if (won) {
      updateAchievementProgress("first_win", 1);
      updateAchievementProgress("win_5", 1);
      updateAchievementProgress("win_25", 1);
      updateAchievementProgress("win_100", 1);
      updateAchievementProgress("win_500", 1);
      if (session.difficulty === "expert") updateAchievementProgress("expert_survivor", 1);
      if (session.difficulty === "expert") updateAchievementProgress("expert_win", 1);
      if (session.difficulty === "hard" || session.difficulty === "expert") updateAchievementProgress("hard_win", 1);
      if (session.mode === "lightning") updateAchievementProgress("lightning_king", 1);
      if (session.mode === "tournament") updateAchievementProgress("tournament_champ", 1);
      if (session.mode === "coop") updateAchievementProgress("coop_hero", 1);
      if (session.mode === "challenge") updateAchievementProgress("challenge_master", 1);
      if (isPerfect) updateAchievementProgress("perfect_hand", 1);
      if (isComeback) updateAchievementProgress("comeback_king", 1);
      if (session.mode === "lightning" && duration < 120000) updateAchievementProgress("speed_demon", 1);
      if (duration > 600000) updateAchievementProgress("marathon_man", 1);
    }
    if (session.eightsPlayedThisGame > 0) {
      updateAchievementProgress("eight_wizard", 1);
      updateAchievementProgress("eight_10", session.eightsPlayedThisGame);
      updateAchievementProgress("eight_50", session.eightsPlayedThisGame);
    }
    updateAchievementProgress("marathon_session", 1);
    updateAchievementProgress("practice_grad", session.mode === "practice" ? 1 : 0);
  }, [gameState?.phase]);

  // ─── Inactivity auto-draw timer ──────────────────────────────────────────
  const INACTIVITY_TIMEOUT = session?.mode === "lightning" ? 10 : session?.mode === "practice" ? 30 : 20;
  useEffect(() => {
    const isActive =
      gameState?.currentPlayer === "player" &&
      gameState?.phase === "playing" &&
      dealAnimationDone &&
      !showMatchmaking &&
      !isExpert; // Expert mode already has its own 8s countdown timer

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
          handleDraw();
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
  }, [gameState?.currentPlayer, gameState?.phase, dealAnimationDone, gameState?.turnId, showMatchmaking]);

  const msgStyle = useAnimatedStyle(() => ({ opacity: msgOpacity.value }));

  if (!gameState) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gold} />
        </Pressable>
      </View>
    );
  }

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const isPlayerTurn = gameState.currentPlayer === "player" && gameState.phase === "playing" && dealAnimationDone;
  const isGameOver = ["player_wins", "ai_wins", "draw"].includes(gameState.phase);
  const playableCount = isPlayerTurn ? gameState.playerHand.filter((c) => canPlay(c, gameState)).length : 0;
  const modeConfig = session ? getModeById(session.mode) : null;

  const handleCardPress = async (card: Card) => {
    if (!isPlayerTurn) return;
    lastActionTime.current = Date.now();
    if (!canPlay(card, gameState)) {
      await playSound("error").catch(() => {});
      return;
    }
    if (selectedCard?.id === card.id) {
      const needsSuitPick = card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0);
      if (needsSuitPick) {
        await playSound("card_wild").catch(() => {});
        setSuitPickerVisible(true);
      } else {
        await playSound("card_play").catch(() => {});
        const willHaveLastCard = gameState.playerHand.length === 2;
        handlePlayCard(card);
        if (willHaveLastCard) {
          setTimeout(() => playSound("last_card").catch(() => {}), 350);
        }
        if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
          setShowEffect(true);
        }
      }
    } else {
      await playSound("card_draw").catch(() => {});
      setSelectedCard(card);
    }
  };

  const handleSuitSelect = async (suit: Suit) => {
    setSuitPickerVisible(false);
    if (selectedCard) {
      handlePlayCard(selectedCard, suit);
      if (profile.selectedEffect && profile.selectedEffect !== "effect_none" && profile.selectedEffect !== "none") {
        setShowEffect(true);
      }
      setSelectedCard(null);
    }
  };

  const handleDrawPress = async () => {
    if (!isPlayerTurn) return;
    lastActionTime.current = Date.now();
    await playSound("card_draw").catch(() => {});
    handleDraw();
  };

  const currentSuitColor = suitColor(gameState.currentSuit);
  const currentSuitSym = suitSymbol(gameState.currentSuit);
  const isJokerSelected = selectedCard?.rank === "Joker";

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Casino felt background */}
      <LinearGradient
        colors={["#061510", "#08180d", "#0a1a0f", "#08180d", "#061510"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tableGlowBorder} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { playSound("button_press").catch(() => {}); router.back(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          {modeConfig && (
            <View style={[styles.modePill, { borderColor: modeConfig.color + "44" }]}>
              <Ionicons name={modeConfig.icon as any} size={11} color={modeConfig.color} />
              <Text style={[styles.modeLabel, { color: modeConfig.color }]}>{modeConfig.name}</Text>
              {isExpert && <Ionicons name="timer" size={10} color="#E74C3C" style={{ marginLeft: 2 }} />}
            </View>
          )}
          {session?.mode === "tournament" && (
            <Text style={styles.tournamentScore}>{tournamentScores[0]} — {tournamentScores[1]}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => { setMuteCpuEmotes(m => !m); playSound("button_press").catch(() => {}); }}
            style={[styles.muteBtn, muteCpuEmotes && styles.muteBtnActive]}
          >
            <Ionicons name={muteCpuEmotes ? "volume-mute" : "volume-medium"} size={15} color={muteCpuEmotes ? Colors.textDim : Colors.gold} />
          </Pressable>
          <View style={styles.deckInfo}>
            <Ionicons name="layers" size={13} color={Colors.textDim} />
            <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
          </View>
        </View>
      </View>

      {/* Expert timer */}
      {isExpert && isPlayerTurn && dealAnimationDone && (
        <ExpertTimerBar seconds={expertTimer} total={timerTotal} />
      )}

      {/* AI section with CPU emote */}
      <View style={styles.aiSectionWrapper}>
        <AiHand count={gameState.aiHand.length} isThinking={isAiThinkingVis} cpuProfile={cpuProfile} backColors={backColors} backAccent={backAccent} />
        <EmoteBubble emote={cpuEmote} side="cpu" muted={muteCpuEmotes} />
      </View>

      {/* Table center */}
      <View style={styles.tableCenter}>
        {/* Pending draw alert */}
        {gameState.pendingDraw > 0 && isPlayerTurn && (
          <PendingDrawBanner count={gameState.pendingDraw} type={gameState.pendingDrawType} />
        )}

        {/* Current suit indicator */}
        <View style={[styles.suitIndicator, { borderColor: currentSuitColor + "55" }]}>
          <Text style={[styles.suitIndicatorSym, { color: currentSuitColor }]}>{currentSuitSym}</Text>
          <Text style={styles.suitIndicatorName}>{suitName(gameState.currentSuit)}</Text>
          {gameState.jActive && gameState.jSuit && (
            <View style={styles.jActiveBadge}>
              <Text style={styles.jActiveTxt}>{T("jActive")}</Text>
            </View>
          )}
        </View>

        {/* Message */}
        <Animated.View style={[styles.messageBubble, msgStyle]}>
          <Text style={styles.messageText} numberOfLines={2}>
            {dealAnimationDone ? gameState.message : T("dealingCards")}
          </Text>
        </Animated.View>

        {/* Cards row */}
        <View style={styles.cardsRow}>
          {/* Draw pile */}
          <Pressable onPress={handleDrawPress} disabled={!isPlayerTurn}>
            <View style={styles.drawPile}>
              {[3,2,1,0].map(i => (
                <View key={i} style={[styles.deckCardAbs, {
                  top: -i * 1.5, left: i * 1.5, zIndex: 4 - i,
                }]}>
                  <LinearGradient colors={backColors} style={styles.deckCardInner}>
                    <View style={styles.deckPattern}>
                      {[0,1].map(r=><View key={r} style={{flexDirection:"row",gap:3}}>
                        {[0,1,2].map(c=><Text key={c} style={{fontSize:7,color:backAccent,opacity:0.25}}>◆</Text>)}
                      </View>)}
                    </View>
                  </LinearGradient>
                </View>
              ))}
              {isPlayerTurn && (playableCount === 0 || gameState.pendingDraw > 0) && (
                <LinearGradient colors={[Colors.gold, Colors.goldLight]} style={styles.drawLabel}>
                  <Text style={styles.drawLabelText}>
                    {gameState.pendingDraw > 0 ? `+${gameState.pendingDraw}` : T("drawCard")}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </Pressable>

          {/* VS divider */}
          <View style={styles.vsDivider}>
            <View style={styles.vsDividerLine} />
            <Text style={styles.vsDividerText}>♦</Text>
            <View style={styles.vsDividerLine} />
          </View>

          {/* Discard pile */}
          <View style={styles.discardPile}>
            {topCard && <PlayingCard card={topCard} size="lg" />}
          </View>
        </View>

        {selectedCard && isPlayerTurn && (
          <View style={styles.selectedHint}>
            <Text style={styles.selectedHintText}>
              {selectedCard.rank === "8"
                ? "8 Loco · toca de nuevo para elegir palo"
                : selectedCard.rank === "Joker" && gameState.pendingDraw === 0
                  ? "Comodín · toca de nuevo para elegir palo"
                  : selectedCard.rank === "Joker" && gameState.pendingDraw > 0
                    ? `Comodín · añade 5 al stack (${gameState.pendingDraw + 5} total)`
                    : "Toca la carta de nuevo para jugarla"}
            </Text>
          </View>
        )}
      </View>

      {/* Player section */}
      <View style={styles.playerSection}>
        {/* Player profile */}
        <PlayerProfileBar
          name={profile.name}
          avatarId={profile.avatarId}
          titleId={profile.titleId}
          level={level}
          photoUri={profile.photoUri || undefined}
        />
        <View style={styles.turnLabelRow}>
          <View style={[styles.turnDot, { backgroundColor: isPlayerTurn ? Colors.gold : "transparent" }]} />
          <Text style={[styles.turnLabel, isPlayerTurn && styles.activeTurn]}>
            {T("you")} · {gameState.playerHand.length} {T("cards")}
          </Text>
          {isPlayerTurn && playableCount > 0 && (
            <Text style={styles.playableHint}>{playableCount} {playableCount !== 1 ? T("playableCountPlural") : T("playableCount")}</Text>
          )}
          <View style={{ marginLeft: "auto" }}>
            <EmotePanel onSendEmote={handleSendEmote} lastEmoteTime={lastPlayerEmoteTime} />
          </View>
        </View>
        {/* Inactivity countdown bar — visible only on player's turn */}
        {isPlayerTurn && (
          <View style={styles.inactivityBar}>
            <View
              style={[
                styles.inactivityFill,
                {
                  width: `${Math.round(inactivityProgress * 100)}%` as any,
                  backgroundColor: inactivityProgress > 0.5
                    ? Colors.gold
                    : inactivityProgress > 0.25
                    ? "#FF9500"
                    : "#FF3B30",
                },
              ]}
            />
          </View>
        )}
        {/* Player emote bubble */}
        <EmoteBubble emote={playerEmote} side="player" />

        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handContainer}
          style={styles.handScroll}
        >
          {dealAnimationDone && gameState.playerHand.map((card, i) => {
            const playable = isPlayerTurn && canPlay(card, gameState);
            const selected = selectedCard?.id === card.id;
            const angle = (i - gameState.playerHand.length / 2) * 3;
            return (
              <View
                key={card.id}
                style={{
                  marginLeft: i === 0 ? 0 : -20,
                  zIndex: selected ? 100 : i,
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
        </ScrollView>
      </View>

      {/* Deal animation — only shown after matchmaking */}
      {!dealAnimationDone && !showMatchmaking && (
        <DealAnimation
          cardsPerPlayer={gameState.playerHand.length}
          playerCards={gameState.playerHand}
          starterCard={gameState.discardPile[gameState.discardPile.length - 1] ?? null}
          onComplete={() => setDealAnimationDone(true)}
          backColors={backColors}
          backAccent={backAccent}
        />
      )}

      {showEffect && (
        <CardPlayEffect
          effectId={profile.selectedEffect ?? "effect_none"}
          originX={SW * 0.6}
          originY={SH * 0.42}
          onDone={() => setShowEffect(false)}
        />
      )}

      {/* Matchmaking screen */}
      {showMatchmaking && cpuProfile && (
        <MatchmakingScreen
          playerAvatarId={profile.avatarId}
          playerFrameId={profile.selectedFrameId}
          playerPhotoUri={profile.photoUri || undefined}
          playerName={profile.name}
          cpuProfile={cpuProfile}
          onComplete={() => setShowMatchmaking(false)}
        />
      )}

      {/* Level up overlay */}
      {showLevelUp && (
        <LevelUpOverlay
          newLevel={levelUpNum}
          onDone={() => setShowLevelUp(false)}
        />
      )}

      <SuitPicker
        visible={suitPickerVisible}
        onSelect={handleSuitSelect}
        isJoker={isJokerSelected}
      />

      {isGameOver && !showTournamentModal && session?.mode !== "tournament" && (
        <EndModal
          phase={gameState.phase}
          coinsEarned={endCoins}
          xpEarned={endXp}
          onRestart={() => {
            retryCount.current += 1;
            pickNewCpuProfile();
            setShowMatchmaking(true);
            if (session) startGame(session.mode, session.difficulty);
          }}
          onHome={() => router.back()}
        />
      )}

      {showTournamentModal && (
        <TournamentModal
          scores={tournamentScores}
          round={tournamentRound}
          onContinue={() => { setShowTournamentModal(false); startNextTournamentRound(); }}
          onQuit={() => { setShowTournamentModal(false); router.back(); }}
        />
      )}
    </View>
  );
}

const CARD_BACK_W = 72;
const CARD_BACK_H = 104;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061510" },
  tableGlowBorder: {
    position: "absolute", top: "18%", left: 12, right: 12, bottom: "14%",
    borderRadius: 120, borderWidth: 1, borderColor: "rgba(212,175,55,0.08)",
  },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 10,
    paddingVertical: 5, justifyContent: "space-between",
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center", gap: 2 },
  modePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1,
  },
  modeLabel: { fontFamily: "Nunito_700Bold", fontSize: 11 },
  tournamentScore: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.gold },
  headerRight: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  muteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  muteBtnActive: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderColor: "rgba(255,255,255,0.04)",
  },
  deckInfo: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },

  // CPU Profile
  aiSection: { alignItems: "center", paddingBottom: 6, gap: 6 },
  aiSectionWrapper: { position: "relative", alignItems: "center" },
  cpuProfileRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    maxWidth: 260,
  },
  cpuAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  cpuProfileInfo: { flex: 1 },
  cpuName: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text },
  cpuMeta: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
  thinkingText: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.gold, fontStyle: "italic" },

  turnLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  turnDot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: Colors.gold + "40" },
  turnLabel: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textMuted },
  activeTurn: { color: Colors.gold, fontFamily: "Nunito_700Bold" },
  playableHint: { fontFamily: "Nunito_400Regular", fontSize: 10, color: "#4ade80", marginLeft: 4 },
  aiHandRow: { flexDirection: "row", alignItems: "flex-end", position: "relative" },
  aiCard: {
    width: 44, height: 64, borderRadius: 7, overflow: "hidden",
    borderWidth: 1.5, borderColor: Colors.gold + "66",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4,
  },
  aiCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  aiCardPattern: { gap: 2, alignItems: "center" },
  aiCountBadge: {
    position: "absolute", right: -8, top: -8,
    backgroundColor: Colors.red, width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#061510", zIndex: 20,
  },
  aiCountText: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#fff" },

  // Table center
  tableCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  suitIndicator: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1,
  },
  suitIndicatorSym: { fontSize: 20, fontWeight: "900" },
  suitIndicatorName: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted },
  jActiveBadge: {
    backgroundColor: "rgba(39,174,96,0.2)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: "#27AE60",
  },
  jActiveTxt: { fontFamily: "Nunito_700Bold", fontSize: 9, color: "#27AE60" },
  messageBubble: {
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border, maxWidth: 280,
  },
  messageText: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text, textAlign: "center" },
  cardsRow: { flexDirection: "row", alignItems: "center", gap: 24 },
  drawPile: { width: CARD_BACK_W + 6, height: CARD_BACK_H + 6, position: "relative" },
  deckCardAbs: {
    position: "absolute", width: CARD_BACK_W, height: CARD_BACK_H,
    borderRadius: 10, overflow: "hidden",
    borderWidth: 1.5, borderColor: Colors.gold + "66",
    shadowColor: "#000", shadowOffset: { width: 2, height: 4 }, shadowRadius: 5, elevation: 5,
  },
  deckCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  deckPattern: { gap: 2, alignItems: "center" },
  drawLabel: {
    position: "absolute", bottom: -20, left: 0, right: 0,
    borderRadius: 6, paddingVertical: 3, alignItems: "center",
  },
  drawLabelText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: "#1a0a00", letterSpacing: 1 },
  vsDivider: { alignItems: "center", gap: 5 },
  vsDividerLine: { width: 1, height: 30, backgroundColor: Colors.border },
  vsDividerText: { fontSize: 12, color: Colors.gold + "50" },
  discardPile: { position: "relative" },
  selectedHint: {
    backgroundColor: "rgba(212,175,55,0.12)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold + "30",
    maxWidth: 280,
  },
  selectedHintText: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.gold + "cc", textAlign: "center" },

  // Player profile
  playerProfileRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(212,175,55,0.15)",
    maxWidth: 260, alignSelf: "center",
  },
  playerAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  playerProfileInfo: { flex: 1 },
  playerProfileName: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text },
  playerProfileMeta: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
  playerTurnDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#27AE60" },

  // Inactivity bar
  inactivityBar: {
    width: "92%", height: 3, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2, overflow: "hidden", marginBottom: 2,
  },
  inactivityFill: { height: 3, borderRadius: 2 },

  // Player hand
  playerSection: { paddingBottom: 6, gap: 5, alignItems: "center" },
  handScroll: { height: 138 },
  handContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 6,
    paddingTop: 28,
  },

  // Suit picker
  suitOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center" },
  suitModal: { width: 320, borderRadius: 24, overflow: "hidden", borderWidth: 1.5, borderColor: Colors.gold + "55" },
  suitGrad: { padding: 24 },
  suitTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold, textAlign: "center", marginBottom: 4, letterSpacing: 2 },
  suitSub: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textMuted, textAlign: "center", marginBottom: 20 },
  suitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  suitOption: {
    width: "47%", paddingVertical: 16, backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, alignItems: "center", gap: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  suitOptionPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  suitSymLg: { fontSize: 36, fontWeight: "900" },
  suitLbl: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },

  // End/Tournament modals
  endOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" },
  bgGlow: { width: 280, height: 280, borderRadius: 140 },
  endModal: { width: 320, borderRadius: 28, overflow: "hidden", borderWidth: 1.5 },
  endGrad: { padding: 28, alignItems: "center", gap: 12 },
  endIconOuter: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 20, shadowOpacity: 0.6, elevation: 10,
  },
  endIconInner: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },
  endLabel: { fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 3 },
  endTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 32, letterSpacing: 3 },
  endSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 19 },
  endDivider: { width: "100%", height: 1 },
  rewardSection: { width: "100%", gap: 8 },
  rewardLabel: { fontFamily: "Nunito_700Bold", fontSize: 9, color: Colors.textDim, letterSpacing: 2, textAlign: "center" },
  rewardRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  rewardChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
  },
  rewardChipXP: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
  },
  rewardChipVal: { fontFamily: "Nunito_900ExtraBold", fontSize: 16 },
  rewardChipSub: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim },
  tScoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 6 },
  tScoreTeam: { alignItems: "center", gap: 4 },
  tScoreLbl: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  tScoreNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 36, color: Colors.gold },
  tScoreSep: { fontFamily: "Nunito_700Bold", fontSize: 16, color: Colors.textDim },
  endBtns: { width: "100%", gap: 10, marginTop: 4 },
  btnPrimary: {
    borderRadius: 16, paddingVertical: 15, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
  },
  btnPrimaryTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#1a0a00" },
  btnSecondary: {
    borderRadius: 16, paddingVertical: 13, alignItems: "center",
    borderWidth: 1, borderColor: Colors.border, backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row", justifyContent: "center", gap: 8,
  },
  btnSecondaryTxt: { fontFamily: "Nunito_700Bold", fontSize: 14 },
});
