import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { PlayingCard } from "@/components/PlayingCard";
import { DealAnimation } from "@/components/DealAnimation";
import type { Suit } from "@/lib/gameEngine";
import { suitSymbol, suitName, suitColor, canPlay } from "@/lib/gameEngine";
import { playSound } from "@/lib/sounds";
import { getModeById, getDifficultyById } from "@/lib/gameModes";
import { STORE_ITEMS } from "@/lib/storeItems";
import type { Card } from "@/lib/gameEngine";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function SuitPicker({ visible, onSelect }: { visible: boolean; onSelect: (s: Suit) => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.suitOverlay}>
        <View style={styles.suitModal}>
          <Text style={styles.suitTitle}>Elige un palo</Text>
          <View style={styles.suitGrid}>
            {SUITS.map((suit) => (
              <Pressable key={suit} onPress={() => onSelect(suit)} style={({ pressed }) => [styles.suitOption, pressed && { opacity: 0.75 }]}>
                <Text style={[styles.suitSym, { color: suitColor(suit) }]}>{suitSymbol(suit)}</Text>
                <Text style={styles.suitLbl}>{suitName(suit)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TournamentModal({ scores, round, onContinue, onQuit }: { scores: [number, number]; round: number; onContinue: () => void; onQuit: () => void }) {
  const isOver = scores[0] >= 2 || scores[1] >= 2;
  const playerWon = scores[0] >= 2;
  return (
    <View style={styles.endOverlay}>
      <View style={styles.endModal}>
        <LinearGradient colors={["#1a2a1a", Colors.surface]} style={styles.endGrad}>
          <Ionicons name="trophy" size={40} color={Colors.gold} />
          <Text style={styles.endTitle}>
            {isOver ? (playerWon ? "¡CAMPEÓN!" : "DERROTA") : `RONDA ${round} TERMINADA`}
          </Text>
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreLbl}>Tú</Text>
            <Text style={styles.scoreBig}>{scores[0]} — {scores[1]}</Text>
            <Text style={styles.scoreLbl}>CPU</Text>
          </View>
          {!isOver && <Text style={styles.endSub}>Gana 2 rondas para ser campeón</Text>}
          <View style={styles.endBtns}>
            {!isOver && <Pressable onPress={onContinue} style={styles.endBtnPrimary}><Text style={styles.endBtnPrimaryText}>Siguiente ronda</Text></Pressable>}
            <Pressable onPress={onQuit} style={[styles.endBtnSecondary, isOver && { flex: 1 }]}>
              <Text style={styles.endBtnSecondaryText}>{isOver ? "Volver al menú" : "Abandonar"}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

function EndModal({ phase, onRestart, onHome }: { phase: string; onRestart: () => void; onHome: () => void }) {
  const isWin = phase === "player_wins";
  const scale = useSharedValue(0.7);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    playSound(isWin ? "win" : "lose").catch(() => {});
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={styles.endOverlay}>
      <Animated.View style={[styles.endModal, style]}>
        <LinearGradient
          colors={isWin ? ["#1a3a1a", Colors.surface] : ["#3a1a1a", Colors.surface]}
          style={styles.endGrad}
        >
          <View style={styles.endIconCircle}>
            <Ionicons name={isWin ? "trophy" : phase === "draw" ? "hand-left" : "skull"} size={40} color={isWin ? Colors.gold : phase === "draw" ? Colors.blue : Colors.red} />
          </View>
          <Text style={[styles.endTitle, { color: isWin ? Colors.success : phase === "draw" ? Colors.blue : Colors.red }]}>
            {isWin ? "¡GANASTE!" : phase === "draw" ? "EMPATE" : "PERDISTE"}
          </Text>
          <Text style={styles.endSub}>{isWin ? "Excelente jugada" : phase === "draw" ? "Muy parejo" : "El CPU fue mejor esta vez"}</Text>
          <View style={styles.endBtns}>
            <Pressable onPress={onRestart} style={styles.endBtnPrimary}><Text style={styles.endBtnPrimaryText}>Jugar de nuevo</Text></Pressable>
            <Pressable onPress={onHome} style={styles.endBtnSecondary}><Text style={styles.endBtnSecondaryText}>Menú</Text></Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function AiHand({ count }: { count: number }) {
  return (
    <View style={styles.aiHandRow}>
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <View key={i} style={[styles.aiCard, { marginLeft: i === 0 ? 0 : -26, zIndex: i, transform: [{ rotate: `${(i - count / 2) * 3}deg` }] }]}>
          <LinearGradient colors={["#1a3a6a", "#0e2248"]} style={styles.aiCardInner}>
            <Text style={styles.aiCardDot}>◆</Text>
          </LinearGradient>
        </View>
      ))}
      <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>
    </View>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    gameState, session, handlePlayCard, handleDraw, handleChooseSuit,
    runAiTurn, selectedCard, setSelectedCard, dealAnimationDone, setDealAnimationDone,
    startNextTournamentRound, startGame, getGameResult,
  } = useGame();
  const { recordGameResult, updateAchievementProgress } = useProfile();

  const aiThinking = useRef(false);
  const resultRecorded = useRef(false);
  const gameStartTimeRef = useRef<number>(Date.now());
  const [suitPickerVisible, setSuitPickerVisible] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [tournamentScores, setTournamentScores] = useState<[number, number]>([0, 0]);
  const [tournamentRound, setTournamentRound] = useState(1);
  const msgOpacity = useSharedValue(1);

  useEffect(() => {
    if (!dealAnimationDone) {
      aiThinking.current = false;
      resultRecorded.current = false;
      gameStartTimeRef.current = Date.now();
    }
  }, [dealAnimationDone]);

  useEffect(() => {
    if (!gameState || !dealAnimationDone) return;
    if (gameState.phase !== "playing") return;
    msgOpacity.value = withSequence(withTiming(0, { duration: 50 }), withTiming(1, { duration: 250 }));

    if (gameState.currentPlayer === "ai" && !aiThinking.current) {
      aiThinking.current = true;
      setTimeout(() => { runAiTurn(); aiThinking.current = false; }, 900 + Math.random() * 500);
    }
  }, [gameState?.currentPlayer, gameState?.message, dealAnimationDone]);

  useEffect(() => {
    if (!gameState || !session || resultRecorded.current) return;
    const result = getGameResult();
    if (!result) return;
    resultRecorded.current = true;

    const won = result === "player_wins";
    const modeConfig = getModeById(session.mode);
    const diffConfig = getDifficultyById(session.difficulty);
    const duration = Date.now() - gameStartTimeRef.current;
    const coins = Math.round(modeConfig.coinsReward * diffConfig.coinMultiplier * (won ? 1 : 0.1));
    const xp = Math.round(modeConfig.xpReward * diffConfig.xpMultiplier * (won ? 1 : 0.3));
    const isPerfect = session.cardsDrawnThisGame === 0 && won;
    const isComeback = (gameState?.playerHand?.length ?? 0) >= 10 && won;

    if (session.mode === "tournament") {
      const newScores: [number, number] = won
        ? [tournamentScores[0] + 1, tournamentScores[1]]
        : [tournamentScores[0], tournamentScores[1] + 1];
      setTournamentScores(newScores);
      setTournamentRound((r) => r + 1);
      if (won) {
        recordGameResult({ won: true, mode: session.mode, difficulty: session.difficulty, coinsEarned: coins, xpEarned: xp, eightsPlayed: session.eightsPlayedThisGame, cardsDrawn: session.cardsDrawnThisGame, isPerfect, isComeback, gameDurationMs: duration });
      } else {
        recordGameResult({ won: false, mode: session.mode, difficulty: session.difficulty, coinsEarned: Math.round(coins * 0.2), xpEarned: Math.round(xp * 0.5), eightsPlayed: session.eightsPlayedThisGame, cardsDrawn: session.cardsDrawnThisGame, isPerfect: false, isComeback: false });
      }
      setTimeout(() => setShowTournamentModal(true), 800);
    } else {
      recordGameResult({ won, mode: session.mode, difficulty: session.difficulty, coinsEarned: coins, xpEarned: xp, eightsPlayed: session.eightsPlayedThisGame, cardsDrawn: session.cardsDrawnThisGame, isPerfect, isComeback, gameDurationMs: duration });
    }

    // achievement updates
    if (won) {
      updateAchievementProgress("first_win", 1);
      updateAchievementProgress("win_5", 1);
      updateAchievementProgress("win_25", 1);
      updateAchievementProgress("win_100", 1);
      if (session.mode === "lightning") updateAchievementProgress("lightning_king", 1);
      if (session.mode === "tournament") updateAchievementProgress("tournament_champ", 1);
      if (session.mode === "coop") updateAchievementProgress("coop_hero", 1);
      if (session.mode === "challenge") updateAchievementProgress("challenge_master", 1);
      if (isPerfect) updateAchievementProgress("perfect_hand", 1);
      if (isComeback) updateAchievementProgress("comeback_king", 1);
    }
    if (session.eightsPlayedThisGame > 0) {
      updateAchievementProgress("eight_wizard", 1);
      updateAchievementProgress("eight_10", session.eightsPlayedThisGame);
    }
  }, [gameState?.phase]);

  const msgStyle = useAnimatedStyle(() => ({ opacity: msgOpacity.value }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

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
    if (!canPlay(card, gameState)) {
      await playSound("error");
      return;
    }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8") {
        setSuitPickerVisible(true);
      } else {
        await playSound("card_play");
        handlePlayCard(card);
      }
    } else {
      await playSound("card_draw");
      setSelectedCard(card);
    }
  };

  const handleSuitSelect = async (suit: Suit) => {
    setSuitPickerVisible(false);
    if (selectedCard) {
      await playSound("card_wild");
      handlePlayCard(selectedCard, suit);
    }
  };

  const handleDrawPress = async () => {
    if (!isPlayerTurn) return;
    await playSound("card_draw");
    handleDraw();
  };

  const handleDealDone = () => {
    setDealAnimationDone(true);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={["#061209", "#0a1a0f", "#0d2418"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          {modeConfig && (
            <View style={styles.modePill}>
              <Ionicons name={modeConfig.icon as any} size={12} color={modeConfig.color} />
              <Text style={[styles.modeLabel, { color: modeConfig.color }]}>{modeConfig.name}</Text>
            </View>
          )}
          {session?.mode === "tournament" && (
            <Text style={styles.tournamentInfo}>Ronda {tournamentRound} · {tournamentScores[0]}-{tournamentScores[1]}</Text>
          )}
        </View>
        <View style={styles.deckPill}>
          <Ionicons name="layers-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
        </View>
      </View>

      {/* AI section */}
      <View style={styles.aiSection}>
        <View style={styles.turnRow}>
          <Ionicons name="hardware-chip-outline" size={13} color={gameState.currentPlayer === "ai" ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.turnLabel, gameState.currentPlayer === "ai" && styles.activeTurn]}>
            CPU {gameState.currentPlayer === "ai" && dealAnimationDone ? "— pensando..." : ""}
          </Text>
        </View>
        <AiHand count={gameState.aiHand.length} />
      </View>

      {/* Table */}
      <View style={styles.table}>
        <Animated.View style={[styles.messageBubble, msgStyle]}>
          <Text style={styles.messageText}>{dealAnimationDone ? gameState.message : "Repartiendo cartas..."}</Text>
        </Animated.View>

        <View style={styles.cardsRow}>
          {/* Draw pile */}
          <Pressable onPress={handleDrawPress} disabled={!isPlayerTurn}>
            <View style={styles.drawStack}>
              {[2, 1, 0].map((i) => (
                <View key={i} style={[styles.deckCardAbs, { top: -i * 2, left: i * 2, zIndex: 3 - i }]}>
                  <LinearGradient colors={["#1a3a6a", "#0e2248"]} style={styles.deckCardInner}>
                    <Text style={styles.deckDot}>◆</Text>
                  </LinearGradient>
                </View>
              ))}
              {isPlayerTurn && playableCount === 0 && (
                <View style={styles.drawHint}><Text style={styles.drawHintText}>ROBAR</Text></View>
              )}
            </View>
          </Pressable>

          {/* Discard pile */}
          <View style={styles.discardWrap}>
            {topCard && <PlayingCard card={topCard} size="lg" />}
            {gameState.currentSuit !== topCard?.suit && (
              <View style={styles.suitTag}>
                <Text style={[styles.suitTagText, { color: suitColor(gameState.currentSuit) }]}>
                  {suitSymbol(gameState.currentSuit)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Player section */}
      <View style={styles.playerSection}>
        <View style={styles.turnRow}>
          <Ionicons name="person" size={13} color={isPlayerTurn ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.turnLabel, isPlayerTurn && styles.activeTurn]}>
            Tú — {gameState.playerHand.length} cartas
          </Text>
          {selectedCard && isPlayerTurn && (
            <Text style={styles.tapHint}>
              {selectedCard.rank === "8" ? "Toca de nuevo → elegir palo" : "Toca de nuevo → jugar"}
            </Text>
          )}
        </View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handContainer}
          style={styles.handScroll}
        >
          {gameState.playerHand.map((card, i) => {
            const playable = isPlayerTurn && canPlay(card, gameState);
            const selected = selectedCard?.id === card.id;
            return (
              <View
                key={card.id}
                style={{
                  marginLeft: i === 0 ? 0 : -18,
                  zIndex: selected ? 100 : i,
                  transform: [{ rotate: `${(i - gameState.playerHand.length / 2) * 2.5}deg` }],
                }}
              >
                <PlayingCard card={card} onPress={() => handleCardPress(card)} isPlayable={playable} isSelected={selected} size="md" />
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Deal animation overlay */}
      {!dealAnimationDone && (
        <DealAnimation
          cardsPerPlayer={gameState.playerHand.length}
          onComplete={handleDealDone}
        />
      )}

      <SuitPicker visible={suitPickerVisible} onSelect={handleSuitSelect} />

      {isGameOver && !showTournamentModal && session?.mode !== "tournament" && (
        <EndModal
          phase={gameState.phase}
          onRestart={() => {
            if (session) {
              startGame(session.mode, session.difficulty);
            }
          }}
          onHome={() => router.back()}
        />
      )}

      {showTournamentModal && (
        <TournamentModal
          scores={tournamentScores}
          round={tournamentRound}
          onContinue={() => {
            setShowTournamentModal(false);
            startNextTournamentRound();
          }}
          onQuit={() => {
            setShowTournamentModal(false);
            router.back();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 6, justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center", gap: 2 },
  modePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  modeLabel: { fontFamily: "Nunito_700Bold", fontSize: 11 },
  tournamentInfo: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
  deckPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  aiSection: { paddingHorizontal: 16, paddingBottom: 6, alignItems: "center", gap: 6 },
  turnRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  turnLabel: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textMuted },
  activeTurn: { color: Colors.gold, fontFamily: "Nunito_700Bold" },
  tapHint: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.gold, opacity: 0.7, marginLeft: 4 },
  aiHandRow: { flexDirection: "row", alignItems: "flex-end", position: "relative" },
  aiCard: {
    width: 42, height: 60, borderRadius: 6, overflow: "hidden",
    borderWidth: 1.5, borderColor: Colors.gold,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
  aiCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  aiCardDot: { fontSize: 14, color: Colors.gold, opacity: 0.4 },
  countBadge: {
    position: "absolute", right: -10, top: -8,
    backgroundColor: Colors.red, width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.background, zIndex: 20,
  },
  countText: { fontFamily: "Nunito_900ExtraBold", fontSize: 10, color: "#fff" },
  table: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  messageBubble: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border, maxWidth: 280,
  },
  messageText: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text, textAlign: "center" },
  cardsRow: { flexDirection: "row", alignItems: "center", gap: 40 },
  drawStack: { width: 72, height: 104, position: "relative" },
  deckCardAbs: { position: "absolute", width: 72, height: 104, borderRadius: 10, overflow: "hidden", borderWidth: 1.5, borderColor: Colors.gold },
  deckCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  deckDot: { fontSize: 26, color: Colors.gold, opacity: 0.3 },
  drawHint: {
    position: "absolute", bottom: -20, left: 0, right: 0,
    backgroundColor: Colors.gold, borderRadius: 5, paddingVertical: 2, alignItems: "center",
  },
  drawHintText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, color: "#1a0a00", letterSpacing: 1 },
  discardWrap: { position: "relative" },
  suitTag: {
    position: "absolute", top: -12, right: -12,
    backgroundColor: Colors.surface, borderRadius: 18, width: 34, height: 34,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.border,
  },
  suitTagText: { fontSize: 16, fontWeight: "900" },
  playerSection: { paddingBottom: 6, gap: 6, alignItems: "center" },
  handScroll: { maxHeight: 112 },
  handContainer: { paddingHorizontal: 20, paddingVertical: 6, alignItems: "flex-end" },
  suitOverlay: { flex: 1, backgroundColor: Colors.overlay, alignItems: "center", justifyContent: "center" },
  suitModal: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    borderWidth: 1.5, borderColor: Colors.borderStrong, width: 300,
  },
  suitTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold, textAlign: "center", marginBottom: 20, letterSpacing: 2 },
  suitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  suitOption: {
    width: 120, paddingVertical: 14, backgroundColor: Colors.card, borderRadius: 14,
    alignItems: "center", gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  suitSym: { fontSize: 32, fontWeight: "900" },
  suitLbl: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text },
  endOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay, alignItems: "center", justifyContent: "center" },
  endModal: { width: 300, borderRadius: 24, overflow: "hidden", borderWidth: 1.5, borderColor: Colors.borderStrong },
  endGrad: { padding: 28, alignItems: "center", gap: 8 },
  endIconCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.card,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  endTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 26, letterSpacing: 2, color: Colors.text },
  endSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted },
  scoreDisplay: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
  scoreLbl: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  scoreBig: { fontFamily: "Nunito_900ExtraBold", fontSize: 28, color: Colors.gold },
  endBtns: { width: "100%", gap: 10, marginTop: 8 },
  endBtnPrimary: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  endBtnPrimaryText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#1a0a00" },
  endBtnSecondary: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 13, alignItems: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  endBtnSecondaryText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.gold },
});
