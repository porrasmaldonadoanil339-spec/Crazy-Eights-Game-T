import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, Platform, Dimensions, useWindowDimensions, BackHandler,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  withSpring, Easing, FadeIn, FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { PlayingCard } from "@/components/PlayingCard";
import {
  MultiGameState, Card, Suit,
  initMultiGame, multiCanPlay, multiPlayCard, multiDraw, multiChooseSuit, multiConfirmTurn,
  multiApplyRandomShuffle,
  suitName, suitSymbol, suitColor, multiGetTopCard,
} from "@/lib/multiplayerEngine";
import { getEventConfig, getEventName, getEventShortName, getEventDesc } from "@/lib/eventModes";
import { playCardFlip, playCardDraw, playButton, playSpeedTick, stopMusic } from "@/lib/audioManager";
import { useProfile } from "@/context/ProfileContext";
import { CARD_BACKS } from "@/lib/storeItems";
import { EmotePanel, EmoteBubble, type Emote } from "@/components/EmotePanel";
import { getActiveEvent } from "@/components/EventsCard";
import { updateChallengeProgress } from "@/lib/challenges";
import BouncePressable from "@/components/BouncePressable";
import DiscardBouncer from "@/components/DiscardBouncer";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const PLAYER_COLORS = ["#D4AF37", "#27AE60", "#E74C3C", "#9B59B6"];
const PLAYER_ICONS: ("person" | "person-circle" | "happy" | "star")[] = ["person", "person-circle", "happy", "star"];

// ─── Small face-down card ────────────────────────────────────────────────
function FaceDownMini({ angle = 0 }: { angle?: number }) {
  const { profile } = useProfile();
  const cardBack = CARD_BACKS.find(b => b.id === profile.cardBackId) ?? CARD_BACKS[0];
  const backColors = (cardBack.backColors ?? ["#1E4080", "#0e2248", "#0a1832"]) as [string, string, string];
  const backAccent = cardBack.backAccent ?? "#D4AF37";
  return (
    <View style={[styles.faceDownMini, { transform: [{ rotate: `${angle}deg` }] }]}>
      <LinearGradient colors={backColors} style={StyleSheet.absoluteFill}>
        <Text style={[styles.faceDownDot, { color: backAccent }]}>◆</Text>
      </LinearGradient>
    </View>
  );
}

// ─── Opponent hand (horizontal fan) ─────────────────────────────────────
function OpponentFan({ count, name, color, highlight, iconName }: {
  count: number; name: string; color: string; highlight?: boolean; iconName?: string;
}) {
  const maxCards = Math.min(count, 8);
  return (
    <View style={styles.opponentFanWrap}>
      <View style={styles.opponentFanCards}>
        {Array.from({ length: maxCards }).map((_, i) => (
          <View key={i} style={{
            marginLeft: i === 0 ? 0 : -20,
            zIndex: i,
            transform: [{ rotate: `${(i - maxCards / 2) * 5}deg` }, { translateY: Math.abs(i - maxCards / 2) * 2 }],
          }}>
            <FaceDownMini />
          </View>
        ))}
      </View>
      <View style={styles.opponentFanLabel}>
        <View style={[styles.opponentAvatarRing, { borderColor: color + (highlight ? "cc" : "55"), backgroundColor: color + "18" }]}>
          <Ionicons name={(iconName ?? "person") as any} size={11} color={color} />
        </View>
        <Text style={[styles.opponentName, { color: highlight ? color : Colors.textMuted }]} numberOfLines={1}>{name}</Text>
        <View style={[styles.opponentCountBadge, { backgroundColor: color + "33", borderColor: color + "66" }]}>
          <Text style={[styles.opponentCountText, { color }]}>{count}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Side opponent (vertical fan) ────────────────────────────────────────
function SideOpponentFan({ count, name, color, side, iconName }: {
  count: number; name: string; color: string; side: "left" | "right"; iconName?: string;
}) {
  const maxCards = Math.min(count, 6);
  return (
    <View style={[styles.sideOpponentWrap, side === "right" && styles.sideOpponentRight]}>
      <View style={styles.sideOpponentCards}>
        {Array.from({ length: maxCards }).map((_, i) => (
          <View key={i} style={{ marginTop: i === 0 ? 0 : -24, zIndex: i }}>
            <FaceDownMini angle={side === "left" ? 90 : -90} />
          </View>
        ))}
      </View>
      <View style={styles.sideOpponentLabel}>
        <View style={[styles.opponentAvatarRing, { borderColor: color + "66", backgroundColor: color + "18" }]}>
          <Ionicons name={(iconName ?? "person") as any} size={10} color={color} />
        </View>
        <Text style={[styles.sideOpponentName, { color }]} numberOfLines={1}>{name}</Text>
        <View style={[styles.opponentCountBadge, { backgroundColor: color + "33", borderColor: color + "66" }]}>
          <Text style={[styles.opponentCountText, { color }]}>{count}</Text>
        </View>
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
  return (
    <Animated.Text style={[styles.dirArrow, style]}>
      {direction === 1 ? "↻" : "↺"}
    </Animated.Text>
  );
}

// ─── Suit picker ──────────────────────────────────────────────────────────
function SuitPicker({ onChoose }: { onChoose: (s: Suit) => void }) {
  const T = useT();
  return (
    <View style={styles.suitOverlay}>
      <Text style={styles.suitTitle}>{T("chooseSuit")}</Text>
      <View style={styles.suitGrid}>
        {SUITS.map(s => (
          <BouncePressable key={s} inline onPress={() => onChoose(s)} style={styles.suitBtn}>
            <Text style={[styles.suitSym, { color: suitColor(s) }]}>{suitSymbol(s)}</Text>
            <Text style={styles.suitLbl}>{suitName(s)}</Text>
          </BouncePressable>
        ))}
      </View>
    </View>
  );
}

// ─── Pass device overlay ──────────────────────────────────────────────────
function PassDeviceOverlay({ playerName, playerColor, message, onReady }: {
  playerName: string; playerColor: string; message: string; onReady: () => void;
}) {
  const T = useT();
  const pulse = useSharedValue(0.96);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(
      withTiming(1.04, { duration: 900 }),
      withTiming(0.96, { duration: 900 }),
    ), -1);
  }, []);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.passOverlay}>
      <LinearGradient colors={["#010805", "#020c08"]} style={StyleSheet.absoluteFill} />
      <View style={styles.passContent}>
        <View style={[styles.passAvatarRing, { borderColor: playerColor }]}>
          <Ionicons name="person" size={40} color={playerColor} />
        </View>
        <Text style={styles.passTurnLabel}>{T("turnOf")}</Text>
        <Text style={[styles.passPlayerName, { color: playerColor }]} numberOfLines={1}>{playerName}</Text>
        {message ? <Text style={styles.passMessage} numberOfLines={2}>{message}</Text> : null}
        <Text style={styles.passInstruction}>{T("passDevice")} {playerName}</Text>
        <Animated.View style={btnStyle}>
          <BouncePressable style={[styles.passBtn, { borderColor: playerColor }]} onPress={onReady}>
            <LinearGradient colors={[playerColor + "30", playerColor + "10"]} style={styles.passBtnInner}>
              <Ionicons name="eye-outline" size={20} color={playerColor} />
              <Text style={[styles.passBtnText, { color: playerColor }]}>{T("showMyCards")}</Text>
            </LinearGradient>
          </BouncePressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Win overlay ──────────────────────────────────────────────────────────
function WinOverlay({ winnerName, winnerColor, onClose }: {
  winnerName: string; winnerColor: string; onClose: () => void;
}) {
  const T = useT();
  return (
    <View style={styles.winOverlay}>
      <LinearGradient colors={["#010805", "#020d06"]} style={StyleSheet.absoluteFill} />
      <View style={styles.winContent}>
        <Ionicons name="trophy" size={72} color={winnerColor} />
        <Text style={[styles.winSubtitle, { color: winnerColor, opacity: 0.7 }]}>{T("winner")}</Text>
        <Text style={[styles.winName, { color: winnerColor }]} numberOfLines={2}>{winnerName}</Text>
        <BouncePressable style={styles.winBtn} onPress={onClose}>
          <LinearGradient colors={[Colors.gold, Colors.gold + "bb"]} style={styles.winBtnGrad}>
            <Text style={styles.winBtnText}>{T("returnMenu")}</Text>
          </LinearGradient>
        </BouncePressable>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function MultiGameScreen() {
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const params = useLocalSearchParams<{ names?: string; count?: string }>();
  const T = useT();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;
  const headerH = 50;
  const zoneH = SH - topPad - botPad - headerH;

  const tableW = Math.min(SW * 0.68, 260);
  const tableH = tableW * 0.56;
  const tableCenterY = zoneH * 0.42;
  const tableCenterX = SW / 2;

  const playerNames = React.useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => `${T("player")} ${i + 1}`);
  }, [T]);

  const { profile, level: playerLevel, updateAchievementProgress, recordEventWin } = useProfile();
  const activeEventId = React.useMemo(() => getActiveEvent(playerLevel)?.id ?? null, [playerLevel]);
  const eventResultRecordedRef = useRef(false);
  // Daily-challenge counters. In pass-and-play, the device owner operates
  // every seat, so all card plays count toward their daily challenges.
  const cardsPlayedRef = useRef(0);
  const eightsPlayedRef = useRef(0);
  const cardsDrawnRef = useRef(0);
  const challengeRecordedRef = useRef(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [playerCountSelect, setPlayerCountSelect] = useState(3);
  const [gameState, setGameState] = useState<MultiGameState>(() => initMultiGame(playerNames.slice(0, playerCountSelect), 8, activeEventId));

  useEffect(() => {
    if (gameState.phase === "game_over") {
      stopMusic().catch(() => {});
    }
  }, [gameState.phase]);

  // ─── Record daily-challenge progress for pass-and-play matches ──────────
  // Counts every card played on this device (the device owner operates
  // each seat) so daily challenges like "Play 50 cards" / "Play 10 eights"
  // / "Play 5 matches today" advance from local pass-and-play too. Mirrors
  // the win/lose blocks in app/game.tsx around lines 1958-1982.
  useEffect(() => {
    if (gameState.phase !== "game_over") return;
    if (challengeRecordedRef.current) return;
    challengeRecordedRef.current = true;
    const evId = gameState.eventId ?? null;
    // Pass-and-play has no dedicated mode id, so mode-filtered challenges
    // are skipped while event-filtered ones still progress.
    updateChallengeProgress("play_mode", 1, undefined, false, evId);
    updateChallengeProgress("cards_played", cardsPlayedRef.current, undefined, false, evId);
    updateChallengeProgress("specials", eightsPlayedRef.current, undefined, false, evId);
  }, [gameState.phase, gameState.eventId]);

  // ─── Record event-win achievement progress for pass-and-play wins ────────
  // In local pass-and-play, the device owner is participating, so a win by
  // any seat counts toward their event achievements (mirrors single-player
  // behaviour in app/game.tsx).
  useEffect(() => {
    if (gameState.phase !== "game_over") return;
    if (gameState.winnerIndex === null) return;
    if (eventResultRecordedRef.current) return;
    const evId = gameState.eventId ?? null;
    if (!evId) return;
    eventResultRecordedRef.current = true;
    const priorWinsForEvent = (profile.stats.winsByEvent ?? {})[evId] ?? 0;
    recordEventWin(evId);
    // Daily challenge progress (event-aware) — mirrors single-player
    // behaviour in app/game.tsx. Pass-and-play has no dedicated mode id, so
    // mode-filtered challenges are skipped while event-filtered ones still
    // progress for the active event.
    updateChallengeProgress("wins", 1, undefined, false, evId);
    updateAchievementProgress("event_any_win", 1);
    if (evId === "speed")    updateAchievementProgress("event_speed_win", 1);
    if (evId === "random")   updateAchievementProgress("event_random_win", 1);
    if (evId === "double")   updateAchievementProgress("event_double_win", 1);
    if (evId === "survival") updateAchievementProgress("event_survival_win", 1);
    if (priorWinsForEvent === 0) {
      updateAchievementProgress("event_versatile", 1);
    }
  }, [gameState.phase, gameState.winnerIndex, gameState.eventId, recordEventWin, updateAchievementProgress, profile.stats.winsByEvent]);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEventBanner, setShowEventBanner] = useState(false);
  const [eventShuffleFlash, setEventShuffleFlash] = useState(false);

  // ─── Live event hooks ─────────────────────────────────────────────────────
  // Always derive from the authoritative game state's eventId so the hooks
  // can't drift from what initMultiGame actually applied.
  const eventConfig = React.useMemo(
    () => getEventConfig(gameState.eventId ?? null),
    [gameState.eventId],
  );

  // "Cartas Aleatorias" — shuffle the active suit at random every 4 turns.
  const lastShuffleTurnRef = useRef<number>(-1);
  useEffect(() => {
    if (!gameStarted) return;
    if (gameState.eventId !== "random") return;
    if (gameState.phase !== "playing" && gameState.phase !== "pass_device") return;
    if (gameState.pendingDraw > 0) return;
    const tid = gameState.turnId ?? 0;
    if (tid === 0 || tid % 4 !== 0) return;
    if (lastShuffleTurnRef.current === tid) return;
    lastShuffleTurnRef.current = tid;
    setGameState(prev => multiApplyRandomShuffle(prev));
    setEventShuffleFlash(true);
    const t = setTimeout(() => setEventShuffleFlash(false), 1200);
    return () => clearTimeout(t);
  }, [gameStarted, gameState.turnId, gameState.phase, gameState.pendingDraw, gameState.eventId]);

  // "Velocidad Extrema" — auto-draw if the current player takes longer than turnSeconds.
  // Reset every time the turn rotates or pass-device → playing transition occurs.
  // A visible countdown bar is driven from the same interval so the player can see
  // how much time is left.
  const speedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedStartRef = useRef<number>(0);
  const speedLastTickSecRef = useRef<number>(-1);
  const [speedProgress, setSpeedProgress] = useState(1);
  useEffect(() => {
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
      speedIntervalRef.current = null;
    }
    const sec = eventConfig?.turnSeconds;
    if (!gameStarted || !sec || gameState.phase !== "playing") {
      setSpeedProgress(1);
      speedLastTickSecRef.current = -1;
      return;
    }
    speedStartRef.current = Date.now();
    speedLastTickSecRef.current = -1;
    setSpeedProgress(1);
    speedIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - speedStartRef.current) / 1000;
      const prog = Math.max(0, 1 - elapsed / sec);
      setSpeedProgress(prog);
      const secsLeft = Math.ceil(prog * sec);
      // Warning tick + haptic on the last 2 seconds (fires once per second).
      if ((secsLeft === 2 || secsLeft === 1) && secsLeft !== speedLastTickSecRef.current) {
        speedLastTickSecRef.current = secsLeft;
        playSpeedTick().catch(() => {});
      }
      if (prog <= 0) {
        if (speedIntervalRef.current) {
          clearInterval(speedIntervalRef.current);
          speedIntervalRef.current = null;
        }
        setGameState(prev => {
          if (prev.phase !== "playing") return prev;
          return multiDraw(prev);
        });
        setSelectedCard(null);
      }
    }, 100);
    return () => {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
        speedIntervalRef.current = null;
      }
    };
  }, [gameStarted, eventConfig?.turnSeconds, gameState.phase, gameState.turnId, gameState.currentPlayerIndex]);
  // ─── Emotes per player (local pass-and-play) ─────────────────────────────
  const [activeEmotes, setActiveEmotes] = useState<Record<number, Emote | null>>({});
  const lastEmoteAtRef = useRef<Record<number, number>>({});

  // Intercept Android hardware back button → confirm before leaving the match.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!gameStarted) return false;
      if (showExitModal) {
        // Mirror the on-screen "No" button: second back press closes the modal.
        setShowExitModal(false);
        return true;
      }
      setShowExitModal(true);
      return true;
    });
    return () => sub.remove();
  }, [gameStarted, showExitModal]);

  // Re-initialize when starting
  const handleStartGame = useCallback(() => {
    playButton().catch(() => {});
    const selectedNames = playerNames.slice(0, playerCountSelect);
    setGameState(initMultiGame(selectedNames, 8, activeEventId));
    setGameStarted(true);
    cardsPlayedRef.current = 0;
    eightsPlayedRef.current = 0;
    cardsDrawnRef.current = 0;
    challengeRecordedRef.current = false;
    eventResultRecordedRef.current = false;
  }, [playerCountSelect, playerNames, activeEventId]);

  // Event mode intro banner (shows for ~3.2s once a match with an active event begins)
  useEffect(() => {
    if (!gameStarted) return;
    if (!gameState.eventId) return;
    setShowEventBanner(true);
    const t = setTimeout(() => setShowEventBanner(false), 3200);
    return () => clearTimeout(t);
  }, [gameStarted, gameState.eventId]);

  const pidx = gameState.currentPlayerIndex;
  const currentHand = gameState.hands[pidx] ?? [];
  const handleSendEmote = useCallback((emote: Emote) => {
    const idx = pidx;
    lastEmoteAtRef.current[idx] = Date.now();
    setActiveEmotes(prev => ({ ...prev, [idx]: emote }));
    setTimeout(() => {
      setActiveEmotes(prev => (prev[idx] === emote ? { ...prev, [idx]: null } : prev));
    }, 2400);
  }, [pidx]);
  const playerCount = gameState.playerCount;
  const topCard = multiGetTopCard(gameState);
  const isPlaying = gameState.phase === "playing";
  const cardSz = playerCount >= 3 ? "sm" : "md";
  const currentColor = PLAYER_COLORS[pidx % PLAYER_COLORS.length];
  const topSuitColor = suitColor(gameState.currentSuit);

  // Build opponent list (everyone except current player)
  const opponents = React.useMemo(() => {
    const arr = [];
    for (let i = 1; i < playerCount; i++) {
      const idx = (pidx + i) % playerCount;
      arr.push({ idx, name: playerNames[idx], color: PLAYER_COLORS[idx % PLAYER_COLORS.length] });
    }
    return arr;
  }, [pidx, playerCount, playerNames]);

  const handleCardPress = useCallback((card: Card) => {
    if (!isPlaying) return;
    if (!multiCanPlay(card, gameState)) { playCardFlip().catch(() => {}); return; }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0)) return;
      playCardFlip().catch(() => {});
      cardsPlayedRef.current += 1;
      setGameState(multiPlayCard(gameState, card));
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }, [gameState, isPlaying, selectedCard]);

  const handleChooseSuit = useCallback((suit: Suit) => {
    if (!selectedCard) return;
    playCardFlip().catch(() => {});
    cardsPlayedRef.current += 1;
    if (selectedCard.rank === "8") eightsPlayedRef.current += 1;
    setGameState(multiPlayCard(gameState, selectedCard, suit));
    setSelectedCard(null);
  }, [gameState, selectedCard]);

  const handleDraw = useCallback(() => {
    if (!isPlaying) return;
    playCardDraw().catch(() => {});
    cardsDrawnRef.current += 1;
    setGameState(multiDraw(gameState));
    setSelectedCard(null);
  }, [gameState, isPlaying]);

  // Opponent zone positions based on count
  const getOpponentPositions = () => {
    if (playerCount === 2) {
      return [{ ...opponents[0], pos: "top" as const }];
    }
    if (playerCount === 3) {
      return [
        { ...opponents[0], pos: "topLeft" as const },
        { ...opponents[1], pos: "topRight" as const },
      ];
    }
    if (playerCount === 4) {
      return [
        { ...opponents[0], pos: "right" as const },
        { ...opponents[1], pos: "top" as const },
        { ...opponents[2], pos: "left" as const },
      ];
    }
    // For 6 players
    return [
      { ...opponents[0], pos: "right" as const },
      { ...opponents[1], pos: "topRight" as const },
      { ...opponents[2], pos: "top" as const },
      { ...opponents[3], pos: "topLeft" as const },
      { ...opponents[4], pos: "left" as const },
    ];
  };

  const opponentPositions = getOpponentPositions();

  // Absolute positions for each opponent zone
  const posStyles: Record<string, object> = {
    top: {
      position: "absolute" as const, top: 4,
      left: 0, right: 0, alignItems: "center" as const,
    },
    topLeft: {
      position: "absolute" as const, top: 4,
      left: 8,
    },
    topRight: {
      position: "absolute" as const, top: 4,
      right: 8,
    },
    left: {
      position: "absolute" as const, top: tableCenterY - 70,
      left: 4,
    },
    right: {
      position: "absolute" as const, top: tableCenterY - 70,
      right: 4,
    },
  };

  if (!gameStarted) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <LinearGradient
          colors={["#051209", "#081a0d", "#0a1f10", "#081a0d", "#051209"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <BouncePressable inline onPress={() => { playButton().catch(() => {}); router.back(); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={Colors.gold} />
          </BouncePressable>
          <Text style={styles.configTitle}>{T("multiplayer")}</Text>
          <View style={{ width: 34 }} />
        </View>

        <View style={styles.configContainer}>
          <View style={styles.configCard}>
            <Ionicons name="people" size={48} color={Colors.gold} style={{ alignSelf: "center", marginBottom: 20 }} />
            <Text style={styles.configLabel}>{T("playerCount")}</Text>
            <View style={styles.chipRow}>
              {[2, 3, 4, 6].map(n => (
                <BouncePressable
                  key={n}
                  inline
                  onPress={() => { playButton().catch(() => {}); setPlayerCountSelect(n); }}
                  style={[styles.chip, playerCountSelect === n && styles.chipActive]}
                >
                  <Text style={[styles.chipText, playerCountSelect === n && styles.chipTextActive]}>{n}P</Text>
                </BouncePressable>
              ))}
            </View>
            <Text style={styles.configDesc}>
              {playerCountSelect} {T("players")} {T("local").toLowerCase()}. {T("passDevicePrompt") || "Pasa el dispositivo entre turnos."}
            </Text>

            <BouncePressable style={styles.startBtn} onPress={handleStartGame}>
              <LinearGradient colors={[Colors.gold, "#B8860B"]} style={styles.startBtnGrad}>
                <Ionicons name="play" size={20} color="#000" />
                <Text style={styles.startBtnText}>{T("startGame")}</Text>
              </LinearGradient>
            </BouncePressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#051209", "#081a0d", "#0a1f10", "#081a0d", "#051209"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { height: headerH }]}>
        <BouncePressable inline onPress={() => { playButton().catch(() => {}); setShowExitModal(true); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={Colors.gold} />
        </BouncePressable>
        <View style={styles.headerMid}>
          <Ionicons name="people" size={12} color={Colors.textMuted} />
          <Text style={styles.headerTitle}>{playerCount} {T("players")} · {T("local")}</Text>
          {eventConfig && (
            <View style={[styles.eventPill, { borderColor: eventConfig.color + "66", backgroundColor: eventConfig.color + "18" }]}>
              <Ionicons name={eventConfig.icon as any} size={10} color={eventConfig.color} />
              <Text style={[styles.eventPillText, { color: eventConfig.color }]} numberOfLines={1}>
                {T("eventLabel")} · {getEventShortName(eventConfig.id, T).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.deckBadge}>
          <Ionicons name="layers-outline" size={12} color={Colors.textDim} />
          <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
        </View>
      </View>

      {/* Random suit shuffle flash */}
      {eventShuffleFlash && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.shuffleFlashBanner, { pointerEvents: "none" } as any]}>
          <Ionicons name="shuffle" size={20} color="#9B59B6" />
          <Text style={styles.shuffleFlashText}>{T("eventRandomShuffleBanner")}</Text>
        </Animated.View>
      )}

      {/* Event intro banner */}
      {showEventBanner && eventConfig && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.eventBanner, { pointerEvents: "none" } as any]}>
          <LinearGradient colors={[eventConfig.color, "#000"] as any} style={styles.eventBannerInner}>
            <View style={styles.eventBannerRow}>
              <Ionicons name={eventConfig.icon as any} size={18} color="#fff" />
              <Text style={styles.eventBannerTitle} numberOfLines={1}>
                {T("eventLabel")} · {getEventName(eventConfig.id, T).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.eventBannerDesc} numberOfLines={2}>{getEventDesc(eventConfig.id, T)}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Game zone */}
      <View style={[styles.gameZone, { height: zoneH, paddingBottom: botPad }]}>

        {/* ─── Oval table ─── */}
        <View style={[styles.tableOval, {
          width: tableW, height: tableH,
          left: tableCenterX - tableW / 2,
          top: tableCenterY - tableH / 2,
          borderRadius: tableH / 2,
        }]}>
          <LinearGradient
            colors={["#0e3e10", "#0a2d0c", "#082409"]}
            style={[StyleSheet.absoluteFill, { borderRadius: tableH / 2 }]}
          />
          {/* Felt inner ring */}
          <View style={[styles.tableInnerRing, { borderRadius: (tableH - 14) / 2 }]} />

          {/* Table content */}
          <View style={styles.tableContent}>
            {/* Draw pile */}
            <BouncePressable inline onPress={handleDraw} disabled={!isPlaying} style={styles.drawPileBtn}>
              <View style={styles.drawPileStack}>
                {[2, 1, 0].map(i => (
                  <View key={i} style={[styles.drawCardAbs, { top: -i * 1.5, left: i * 1.5, zIndex: 3 - i }]}>
                    <LinearGradient colors={["#1E4080", "#0e2248"]} style={styles.drawCardInner}>
                      <Text style={styles.drawCardDot}>◆</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
              {isPlaying && (
                <View style={[styles.drawLabel, { backgroundColor: gameState.pendingDraw > 0 ? Colors.red : Colors.gold }]}>
                  <Text style={styles.drawLabelText}>
                    {gameState.pendingDraw > 0 ? `+${gameState.pendingDraw}` : T("drawCard")}
                  </Text>
                </View>
              )}
            </BouncePressable>

            {/* Direction arrow */}
            <View style={styles.dirArrowWrap}>
              <DirectionArrow direction={gameState.direction} />
              <Text style={[styles.suitOnTable, { color: topSuitColor }]}>{suitSymbol(gameState.currentSuit)}</Text>
            </View>

            {/* Discard pile */}
            <View style={styles.discardPileWrap}>
              {topCard && (
                <DiscardBouncer
                  cardId={topCard.id}
                  isSpecial={["8","Joker","7","2","10","J"].includes(topCard.rank)}
                >
                  <PlayingCard card={topCard} size="sm" />
                </DiscardBouncer>
              )}
            </View>
          </View>
        </View>

        {/* ─── Opponents ─── */}
        {opponentPositions.map(op => {
          const handCount = gameState.hands[op.idx].length;
          const isSkipped = gameState.lastSkipped === op.idx;
          if (op.pos === "left" || op.pos === "right") {
            return (
              <View key={op.idx} style={posStyles[op.pos]}>
                <SideOpponentFan count={handCount} name={op.name} color={op.color} side={op.pos} iconName={PLAYER_ICONS[op.idx % PLAYER_ICONS.length]} />
                {isSkipped && <Text style={styles.skipLabel}>⊗ {T("action_skip")}</Text>}
                <View pointerEvents="none" style={{ alignItems: "center", marginTop: 2 }}>
                  <EmoteBubble emote={activeEmotes[op.idx] ?? null} side="cpu" />
                </View>
              </View>
            );
          }
          return (
            <View key={op.idx} style={posStyles[op.pos]}>
              <OpponentFan count={handCount} name={op.name} color={op.color} highlight={isSkipped} iconName={PLAYER_ICONS[op.idx % PLAYER_ICONS.length]} />
              {isSkipped && <Text style={styles.skipLabel}>⊗ {T("action_skip")}</Text>}
              <View pointerEvents="none" style={{ alignItems: "center", marginTop: 2 }}>
                <EmoteBubble emote={activeEmotes[op.idx] ?? null} side="cpu" />
              </View>
            </View>
          );
        })}

        {/* ─── Current player hand ─── */}
        <View style={[styles.playerZone, { top: tableCenterY + tableH / 2 + 10 }]}>
          <View style={styles.playerLabel}>
            <View style={[styles.opponentAvatarRing, { borderColor: currentColor, backgroundColor: currentColor + "22", width: 22, height: 22, borderRadius: 11 }]}>
              <Ionicons name={PLAYER_ICONS[pidx % PLAYER_ICONS.length]} size={13} color={currentColor} />
            </View>
            <Text style={[styles.playerName, { color: currentColor }]} numberOfLines={1}>
              {playerNames[pidx]} · {currentHand.length} {T("cards")}
            </Text>
            {isPlaying && gameState.pendingDraw > 0 && (
              <View style={[styles.pendingBadge, { backgroundColor: Colors.red + "22", borderColor: Colors.red + "66" }]}>
                <Text style={[styles.pendingText, { color: Colors.red }]}>+{gameState.pendingDraw}</Text>
              </View>
            )}
            {isPlaying && (
              <EmotePanel
                onSendEmote={handleSendEmote}
                lastEmoteTime={lastEmoteAtRef.current[pidx] ?? 0}
              />
            )}
          </View>
          {/* Speed-event countdown bar — only visible during Velocidad Extrema */}
          {isPlaying && eventConfig?.turnSeconds ? (
            <View style={styles.speedBarWrap}>
              <Ionicons
                name="flash"
                size={11}
                color={speedProgress > 0.5 ? Colors.gold : speedProgress > 0.25 ? "#FF9500" : "#FF3B30"}
              />
              <View style={styles.speedBar}>
                <View
                  style={[
                    styles.speedFill,
                    {
                      width: `${Math.round(speedProgress * 100)}%` as `${number}%`,
                      backgroundColor: speedProgress > 0.5
                        ? Colors.gold
                        : speedProgress > 0.25
                        ? "#FF9500"
                        : "#FF3B30",
                    },
                  ]}
                />
              </View>
              <Text style={[styles.speedCountdown, {
                color: speedProgress > 0.5 ? Colors.gold : speedProgress > 0.25 ? "#FF9500" : "#FF3B30",
              }]}>
                {Math.ceil(speedProgress * (eventConfig.turnSeconds ?? 0))}s
              </Text>
            </View>
          ) : null}
          {/* Current player emote bubble */}
          <View style={{ alignItems: "center", marginTop: 2 }} pointerEvents="none">
            <EmoteBubble emote={activeEmotes[pidx] ?? null} side="player" />
          </View>
          {/* Arc fan hand — unified scroll system (matches ranked mode) */}
          {(() => {
            const N = currentHand.length;
            if (N === 0) return null;
            const CARD_W = cardSz === "sm" ? 46 : 64;
            const CARD_H = cardSz === "sm" ? 68 : 92;
            const MAX_ANGLE = N <= 7 ? Math.min(20, N * 2.4) : Math.min(10, N * 1.2);
            const MAX_ARC = N <= 7 ? 16 : 8;
            const xStep = N <= 4 ? CARD_W * 0.78 : N <= 7 ? CARD_W * 0.66 : CARD_W * 0.58;
            const totalWidth = CARD_W + (N - 1) * xStep + 16;
            const fitsOnScreen = totalWidth <= SW - 16;
            const containerH = CARD_H + MAX_ARC + 28;

            const Hand = (
              <View style={{ height: containerH, width: Math.max(totalWidth, SW), position: "relative" }}>
                {currentHand.map((card, i) => {
                  const playable = isPlaying && multiCanPlay(card, gameState);
                  const selected = selectedCard?.id === card.id;
                  const centerI = (N - 1) / 2;
                  const t = N <= 1 ? 0 : (i - centerI) / Math.max(1, centerI);
                  const angle = t * MAX_ANGLE;
                  const arcY = Math.abs(t) * MAX_ARC;
                  const baseStart = fitsOnScreen ? Math.max(8, (SW - totalWidth) / 2) : 8;
                  const x = baseStart + i * xStep;
                  return (
                    <View
                      key={card.id}
                      style={{
                        position: "absolute",
                        left: x,
                        bottom: arcY + 8,
                        zIndex: selected ? 100 : i + 1,
                        transform: [{ rotate: `${angle}deg` }, { translateY: selected ? -10 : 0 }],
                      }}
                    >
                      <PlayingCard
                        card={card}
                        onPress={() => handleCardPress(card)}
                        isPlayable={playable}
                        isSelected={selected}
                        size={cardSz}
                      />
                    </View>
                  );
                })}
              </View>
            );

            if (fitsOnScreen) return <View style={{ height: containerH }}>{Hand}</View>;
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
          {selectedCard && isPlaying && (
            <Text style={styles.selectedHint}>
              {(selectedCard.rank === "8" || (selectedCard.rank === "Joker" && gameState.pendingDraw === 0))
                ? "Toca de nuevo → elegir palo"
                : "Toca de nuevo para jugar"}
            </Text>
          )}
        </View>

        {/* Message bar */}
        <Animated.View
          key={`msg-${gameState.message}`}
          entering={FadeIn.duration(180)}
          style={[styles.messageBubble, { top: tableCenterY + tableH / 2 - 4 }]}
        >
          <Text style={styles.messageText} numberOfLines={1}>{gameState.message}</Text>
        </Animated.View>

      </View>

      {/* Suit picker */}
      {gameState.phase === "choosing_suit" && selectedCard && (
        <View style={StyleSheet.absoluteFill}>
          <SuitPicker onChoose={handleChooseSuit} />
        </View>
      )}

      {/* Pass device overlay */}
      {gameState.phase === "pass_device" && (
        <PassDeviceOverlay
          playerName={playerNames[pidx]}
          playerColor={currentColor}
          message={gameState.message}
          onReady={() => { playButton().catch(() => {}); setGameState(multiConfirmTurn(gameState)); setSelectedCard(null); }}
        />
      )}

      {/* Win overlay */}
      {gameState.phase === "game_over" && gameState.winnerIndex !== null && (
        <WinOverlay
          winnerName={playerNames[gameState.winnerIndex]}
          winnerColor={PLAYER_COLORS[gameState.winnerIndex % PLAYER_COLORS.length]}
          onClose={() => { playButton().catch(() => {}); router.back(); }}
        />
      )}

      {/* Exit confirmation */}
      {showExitModal && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", zIndex: 999 }]}>
          <View style={{ backgroundColor: "#0d1a10", borderRadius: 18, padding: 24, margin: 24, width: "88%", maxWidth: 360, borderWidth: 1, borderColor: "#D4AF3744" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="exit-outline" size={24} color="#E74C3C" />
              <Text style={{ color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 18 }}>
                {T("exitGame" as any) || "¿Salir de la partida?"}
              </Text>
            </View>
            <Text style={{ color: "#BDC3C7", fontFamily: "Nunito_400Regular", fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
              {T("exitGameSub" as any) || "¿Estás seguro de que deseas salir? Tu progreso se perderá."}
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
                onPress={() => { playButton().catch(() => {}); setShowExitModal(false); router.back(); }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#051209" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center",
  },
  headerMid: { flexDirection: "row", alignItems: "center", gap: 6 },
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
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4,
    maxWidth: 160,
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

  // Oval table
  tableOval: {
    position: "absolute",
    borderWidth: 2.5, borderColor: Colors.gold + "55",
    overflow: "hidden",
    shadowColor: Colors.gold, shadowOpacity: 0.15, shadowRadius: 20,
    elevation: 8,
  },
  tableInnerRing: {
    position: "absolute", inset: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  tableContent: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 12,
  },
  drawPileBtn: { alignItems: "center", justifyContent: "center" },
  drawPileStack: { width: 44, height: 60, position: "relative" },
  drawCardAbs: { position: "absolute", width: 40, height: 56, borderRadius: 6, overflow: "hidden" },
  drawCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  drawCardDot: { fontSize: 8, color: Colors.gold, opacity: 0.25 },
  drawLabel: {
    marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: "center",
  },
  drawLabelText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, color: "#fff" },
  dirArrowWrap: { alignItems: "center", gap: 2 },
  dirArrow: { fontSize: 18, color: Colors.gold, opacity: 0.6 },
  suitOnTable: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  discardPileWrap: { alignItems: "center", justifyContent: "center" },

  // Opponents
  opponentFanWrap: { alignItems: "center", gap: 4 },
  opponentFanCards: { flexDirection: "row", alignItems: "flex-end" },
  opponentFanLabel: { flexDirection: "row", alignItems: "center", gap: 5 },
  opponentDot: { width: 7, height: 7, borderRadius: 3.5 },
  opponentAvatarRing: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  opponentName: { fontFamily: "Nunito_700Bold", fontSize: 10, maxWidth: 80 },
  opponentCountBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, borderWidth: 1,
  },
  opponentCountText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9 },
  skipLabel: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: Colors.red,
    marginTop: 2, letterSpacing: 1,
  },

  // Side opponents
  sideOpponentWrap: { alignItems: "center", gap: 4 },
  sideOpponentRight: {},
  sideOpponentCards: { alignItems: "center" },
  sideOpponentLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
  sideOpponentName: { fontFamily: "Nunito_700Bold", fontSize: 9, maxWidth: 52 },

  faceDownMini: {
    width: 30, height: 44, borderRadius: 5,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.gold + "44",
  },
  faceDownDot: { fontSize: 7, color: Colors.gold, opacity: 0.3, textAlign: "center", marginTop: 16 },

  // Current player
  playerZone: {
    position: "absolute", left: 0, right: 0, gap: 4,
  },
  playerLabel: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16,
  },
  playerDot: { width: 9, height: 9, borderRadius: 4.5 },
  playerName: { fontFamily: "Nunito_700Bold", fontSize: 13, flex: 1 },
  pendingBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1,
  },
  pendingText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11 },

  // Speed-event countdown bar
  speedBarWrap: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, marginTop: 2,
  },
  speedBar: {
    flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2, overflow: "hidden",
  },
  speedFill: { height: 4, borderRadius: 2 },
  speedCountdown: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 11, minWidth: 22, textAlign: "right",
  },
  handContainer: { paddingHorizontal: 12, paddingVertical: 4 },
  selectedHint: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.gold,
    textAlign: "center", marginTop: 2,
  },

  messageBubble: {
    position: "absolute", left: 16, right: 16,
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  messageText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted },

  // Random suit shuffle flash
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

  // Suit picker
  suitOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.88)",
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

  // Pass device overlay
  passOverlay: { position: "absolute", inset: 0, zIndex: 200, alignItems: "center", justifyContent: "center" },
  passContent: { alignItems: "center", gap: 10, paddingHorizontal: 28 },
  passAvatarRing: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  passTurnLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textDim, letterSpacing: 4, marginTop: 4,
  },
  passPlayerName: { fontFamily: "Nunito_800ExtraBold", fontSize: 34, textAlign: "center" },
  passMessage: {
    fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted, textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 10, maxWidth: 300,
  },
  passInstruction: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textDim, textAlign: "center" },
  passBtn: { marginTop: 18, borderRadius: 18, overflow: "hidden", borderWidth: 2, width: 270 },
  passBtnInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 17, paddingHorizontal: 24,
  },
  passBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, letterSpacing: 1 },

  // Win overlay
  winOverlay: { position: "absolute", inset: 0, zIndex: 300, alignItems: "center", justifyContent: "center" },
  winContent: { alignItems: "center", gap: 10 },
  winSubtitle: { fontFamily: "Nunito_700Bold", fontSize: 12, letterSpacing: 5 },
  winName: { fontFamily: "Nunito_800ExtraBold", fontSize: 42, textAlign: "center", paddingHorizontal: 20 },
  winBtn: { marginTop: 24, borderRadius: 16, overflow: "hidden", width: 250 },
  winBtnGrad: { paddingVertical: 16, alignItems: "center" },
  winBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#1a0a00" },

  // Config Screen
  configTitle: { fontFamily: "Nunito_700Bold", fontSize: 18, color: Colors.gold },
  configContainer: { flex: 1, padding: 20, justifyContent: "center" },
  configCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  configLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipActive: {
    backgroundColor: Colors.gold + "22",
    borderColor: Colors.gold,
  },
  chipText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: Colors.textDim,
  },
  chipTextActive: {
    color: Colors.gold,
  },
  configDesc: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textDim,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 32,
  },
  startBtn: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  startBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1a0a00",
  },
});
