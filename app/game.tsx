import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform, Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  withRepeat, Easing, runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { PlayingCard } from "@/components/PlayingCard";
import { DealAnimation } from "@/components/DealAnimation";
import type { Suit } from "@/lib/gameEngine";
import { suitSymbol, suitName, suitColor, canPlay } from "@/lib/gameEngine";
import { getModeById, getDifficultyById } from "@/lib/gameModes";
import { STORE_ITEMS } from "@/lib/storeItems";
import type { Card } from "@/lib/gameEngine";
import {
  playCardFlip, playCardDraw, playCardWild, playWin, playLose, playError, playButton,
} from "@/lib/audioManager";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const { width: SW } = Dimensions.get("window");

// ─── Particle confetti for win ───────────────────────────────────────────────
function WinParticles() {
  const particles = Array.from({ length: 14 }).map((_, i) => {
    const x = useSharedValue(SW * 0.5);
    const y = useSharedValue(300);
    const op = useSharedValue(0);
    const sc = useSharedValue(0);
    useEffect(() => {
      const angle = (i / 14) * Math.PI * 2;
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
    const colors = ["♠","♥","♦","♣"];
    const isRed = i % 4 === 1 || i % 4 === 2;
    return (
      <Animated.Text key={i} style={[s, { fontSize: 14, color: isRed ? "#C0392B" : Colors.gold }]}>
        {colors[i % 4]}
      </Animated.Text>
    );
  });
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{particles}</View>;
}

// ─── Suit picker ─────────────────────────────────────────────────────────────
function SuitPicker({ visible, onSelect }: { visible: boolean; onSelect: (s: Suit) => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.suitOverlay}>
        <View style={styles.suitModal}>
          <LinearGradient colors={["#1a2e1a", Colors.surface]} style={styles.suitGrad}>
            <Text style={styles.suitTitle}>Elige un palo</Text>
            <Text style={styles.suitSub}>El 8 Loco cambia el palo activo</Text>
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
  const isOver = scores[0] >= 2 || scores[1] >= 2;
  const playerWon = scores[0] >= 2;
  return (
    <View style={styles.endOverlay}>
      <View style={styles.endModal}>
        <LinearGradient colors={isOver && playerWon ? ["#1a2e1a", Colors.surface] : ["#1a1a2e", Colors.surface]} style={styles.endGrad}>
          <Ionicons name="trophy" size={44} color={Colors.gold} />
          <Text style={styles.endTitle}>{isOver ? (playerWon ? "¡CAMPEÓN!" : "DERROTA") : `RONDA ${round - 1}`}</Text>
          <View style={styles.tScoreRow}>
            <View style={styles.tScoreTeam}><Text style={styles.tScoreLbl}>TÚ</Text><Text style={styles.tScoreNum}>{scores[0]}</Text></View>
            <Text style={styles.tScoreSep}>VS</Text>
            <View style={styles.tScoreTeam}><Text style={styles.tScoreLbl}>CPU</Text><Text style={styles.tScoreNum}>{scores[1]}</Text></View>
          </View>
          {!isOver && <Text style={styles.endSub}>Primera en 2 rondas gana el torneo</Text>}
          <View style={styles.endBtns}>
            {!isOver && <Pressable onPress={onContinue} style={styles.btnPrimary}><Text style={styles.btnPrimaryTxt}>Siguiente ronda</Text></Pressable>}
            <Pressable onPress={onQuit} style={[styles.btnSecondary, isOver && { flex: 1 }]}>
              <Text style={styles.btnSecondaryTxt}>{isOver ? "Volver al menú" : "Abandonar"}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// ─── End modal ────────────────────────────────────────────────────────────────
function EndModal({ phase, coinsEarned, xpEarned, onRestart, onHome }: {
  phase: string; coinsEarned: number; xpEarned: number; onRestart: () => void; onHome: () => void;
}) {
  const isWin = phase === "player_wins";
  const isDraw = phase === "draw";
  const sc = useSharedValue(0.7);
  const [showParticles, setShowParticles] = useState(isWin);

  useEffect(() => {
    sc.value = withSpring(1, { damping: 12 });
    if (isWin) playWin().catch(() => {});
    else playLose().catch(() => {});
    if (!isWin) setShowParticles(false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  return (
    <View style={styles.endOverlay}>
      {showParticles && <WinParticles />}
      <Animated.View style={[styles.endModal, animStyle]}>
        <LinearGradient
          colors={isWin ? ["#122212", Colors.surface] : isDraw ? ["#181822", Colors.surface] : ["#221212", Colors.surface]}
          style={styles.endGrad}
        >
          {/* Icon */}
          <View style={[styles.endIconWrap, { borderColor: isWin ? Colors.gold : isDraw ? Colors.blue : Colors.red }]}>
            {isWin ? (
              <Text style={styles.endIconText}>🏆</Text>
            ) : isDraw ? (
              <Ionicons name="hand-left" size={40} color={Colors.blue} />
            ) : (
              <Text style={styles.endIconText}>💀</Text>
            )}
          </View>

          <Text style={[styles.endTitle, { color: isWin ? Colors.gold : isDraw ? Colors.blue : Colors.red }]}>
            {isWin ? "¡GANASTE!" : isDraw ? "EMPATE" : "PERDISTE"}
          </Text>
          <Text style={styles.endSub}>
            {isWin ? "¡Excelente jugada, campeón!" : isDraw ? "Muy parejo, inténtalo de nuevo" : "El CPU fue más rápido esta vez"}
          </Text>

          {/* Rewards */}
          {(coinsEarned > 0 || xpEarned > 0) && (
            <View style={styles.rewardRow}>
              {coinsEarned > 0 && (
                <View style={styles.rewardChip}>
                  <Text style={styles.rewardChipIcon}>$</Text>
                  <Text style={styles.rewardChipVal}>+{coinsEarned}</Text>
                </View>
              )}
              {xpEarned > 0 && (
                <View style={styles.rewardChipXP}>
                  <Ionicons name="star" size={12} color={Colors.gold} />
                  <Text style={styles.rewardChipVal}>+{xpEarned} XP</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.endBtns}>
            <Pressable onPress={onRestart} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryTxt}>Jugar de nuevo</Text>
            </Pressable>
            <Pressable onPress={onHome} style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryTxt}>Menú principal</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ─── AI hand display ──────────────────────────────────────────────────────────
function AiHand({ count, isThinking }: { count: number; isThinking: boolean }) {
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
    <Animated.View style={[styles.aiHandRow, pStyle]}>
      {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
        <View key={i} style={[styles.aiCard, {
          marginLeft: i === 0 ? 0 : -24,
          zIndex: i,
          transform: [{ rotate: `${(i - Math.min(count, 12) / 2) * 4}deg` }],
        }]}>
          <LinearGradient colors={["#1E4080", "#0a1832"]} style={styles.aiCardInner}>
            <View style={styles.aiCardPattern}>
              {[0,1,2].map(r => (
                <View key={r} style={{ flexDirection: "row", gap: 2 }}>
                  {[0,1,2].map(c => <Text key={c} style={{ fontSize: 5, color: Colors.gold, opacity: 0.3 }}>◆</Text>)}
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
  const { recordGameResult, updateAchievementProgress } = useProfile();

  const aiThinking = useRef(false);
  const resultRecorded = useRef(false);
  const gameStartTimeRef = useRef<number>(Date.now());
  const [suitPickerVisible, setSuitPickerVisible] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [tournamentScores, setTournamentScores] = useState<[number, number]>([0, 0]);
  const [tournamentRound, setTournamentRound] = useState(1);
  const [endCoins, setEndCoins] = useState(0);
  const [endXp, setEndXp] = useState(0);
  const [isAiThinkingVis, setIsAiThinkingVis] = useState(false);
  const msgOpacity = useSharedValue(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;

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
    msgOpacity.value = withSequence(withTiming(0.2, { duration: 80 }), withTiming(1, { duration: 200 }));

    if (gameState.currentPlayer === "ai" && !aiThinking.current) {
      aiThinking.current = true;
      setIsAiThinkingVis(true);
      const delay = 800 + Math.random() * 600;
      setTimeout(() => {
        runAiTurn();
        aiThinking.current = false;
        setIsAiThinkingVis(false);
      }, delay);
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
      await playError().catch(() => {});
      return;
    }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8") {
        await playCardWild().catch(() => {});
        setSuitPickerVisible(true);
      } else {
        await playCardFlip().catch(() => {});
        handlePlayCard(card);
      }
    } else {
      await playCardDraw().catch(() => {});
      setSelectedCard(card);
    }
  };

  const handleSuitSelect = async (suit: Suit) => {
    setSuitPickerVisible(false);
    if (selectedCard) {
      handlePlayCard(selectedCard, suit);
    }
  };

  const handleDrawPress = async () => {
    if (!isPlayerTurn) return;
    await playCardDraw().catch(() => {});
    handleDraw();
  };

  const currentSuitColor = suitColor(gameState.currentSuit);
  const currentSuitSym = suitSymbol(gameState.currentSuit);

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Casino felt background */}
      <LinearGradient
        colors={["#061510", "#08180d", "#0a1a0f", "#08180d", "#061510"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Table oval border glow */}
      <View style={styles.tableGlowBorder} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { playButton().catch(() => {}); router.back(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.gold} />
        </Pressable>

        <View style={styles.headerCenter}>
          {modeConfig && (
            <View style={[styles.modePill, { borderColor: modeConfig.color + "44" }]}>
              <Ionicons name={modeConfig.icon as any} size={11} color={modeConfig.color} />
              <Text style={[styles.modeLabel, { color: modeConfig.color }]}>{modeConfig.name}</Text>
            </View>
          )}
          {session?.mode === "tournament" && (
            <Text style={styles.tournamentScore}>{tournamentScores[0]} — {tournamentScores[1]}</Text>
          )}
        </View>

        <View style={styles.deckInfo}>
          <Ionicons name="layers" size={13} color={Colors.textDim} />
          <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
        </View>
      </View>

      {/* AI section */}
      <View style={styles.aiSection}>
        <View style={styles.turnLabelRow}>
          <View style={[styles.turnDot, { backgroundColor: gameState.currentPlayer === "ai" && dealAnimationDone ? Colors.gold : "transparent" }]} />
          <Text style={[styles.turnLabel, gameState.currentPlayer === "ai" && dealAnimationDone && styles.activeTurn]}>
            CPU{isAiThinkingVis ? " · pensando..." : " · " + gameState.aiHand.length + " cartas"}
          </Text>
        </View>
        <AiHand count={gameState.aiHand.length} isThinking={isAiThinkingVis} />
      </View>

      {/* Table center */}
      <View style={styles.tableCenter}>
        {/* Current suit indicator */}
        <View style={[styles.suitIndicator, { borderColor: currentSuitColor + "55" }]}>
          <Text style={[styles.suitIndicatorSym, { color: currentSuitColor }]}>{currentSuitSym}</Text>
          <Text style={styles.suitIndicatorName}>{suitName(gameState.currentSuit)}</Text>
        </View>

        {/* Message */}
        <Animated.View style={[styles.messageBubble, msgStyle]}>
          <Text style={styles.messageText} numberOfLines={2}>
            {dealAnimationDone ? gameState.message : "Repartiendo cartas..."}
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
                  shadowOpacity: 0.3 - i * 0.05,
                }]}>
                  <LinearGradient colors={["#1E4080", "#0e2248"]} style={styles.deckCardInner}>
                    <View style={styles.deckPattern}>
                      {[0,1].map(r=><View key={r} style={{flexDirection:"row",gap:3}}>
                        {[0,1,2].map(c=><Text key={c} style={{fontSize:7,color:Colors.gold,opacity:0.25}}>◆</Text>)}
                      </View>)}
                    </View>
                  </LinearGradient>
                </View>
              ))}
              {isPlayerTurn && playableCount === 0 && (
                <LinearGradient colors={[Colors.gold, Colors.goldLight]} style={styles.drawLabel}>
                  <Text style={styles.drawLabelText}>ROBAR</Text>
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
              {selectedCard.rank === "8" ? "♦ 8 Loco · toca de nuevo para elegir palo" : "Toca la carta de nuevo para jugarla"}
            </Text>
          </View>
        )}
      </View>

      {/* Player section */}
      <View style={styles.playerSection}>
        <View style={styles.turnLabelRow}>
          <View style={[styles.turnDot, { backgroundColor: isPlayerTurn ? Colors.gold : "transparent" }]} />
          <Text style={[styles.turnLabel, isPlayerTurn && styles.activeTurn]}>
            Tú · {gameState.playerHand.length} cartas
          </Text>
          {isPlayerTurn && playableCount > 0 && (
            <Text style={styles.playableHint}>{playableCount} jugable{playableCount !== 1 ? "s" : ""}</Text>
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

      {/* Deal animation */}
      {!dealAnimationDone && (
        <DealAnimation
          cardsPerPlayer={gameState.playerHand.length}
          onComplete={() => setDealAnimationDone(true)}
        />
      )}

      <SuitPicker visible={suitPickerVisible} onSelect={handleSuitSelect} />

      {isGameOver && !showTournamentModal && session?.mode !== "tournament" && (
        <EndModal
          phase={gameState.phase}
          coinsEarned={endCoins}
          xpEarned={endXp}
          onRestart={() => {
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
    position: "absolute", top: "20%", left: 12, right: 12, bottom: "15%",
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
  deckInfo: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },

  // AI section
  aiSection: { alignItems: "center", paddingBottom: 8, gap: 6 },
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
  tableCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  suitIndicator: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1,
  },
  suitIndicatorSym: { fontSize: 20, fontWeight: "900" },
  suitIndicatorName: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted },
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

  // Player hand
  playerSection: { paddingBottom: 6, gap: 5, alignItems: "center" },
  handScroll: { maxHeight: 118 },
  handContainer: { paddingHorizontal: 24, paddingVertical: 8, alignItems: "flex-end" },

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
  endOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.88)", alignItems: "center", justifyContent: "center" },
  endModal: { width: 310, borderRadius: 24, overflow: "hidden", borderWidth: 1.5, borderColor: Colors.gold + "44" },
  endGrad: { padding: 28, alignItems: "center", gap: 10 },
  endIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center",
    borderWidth: 2, marginBottom: 4,
  },
  endIconText: { fontSize: 40 },
  endTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 28, letterSpacing: 2 },
  endSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textAlign: "center" },
  rewardRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rewardChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.gold + "20", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  rewardChipXP: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border,
  },
  rewardChipIcon: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold },
  rewardChipVal: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold },
  tScoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 6 },
  tScoreTeam: { alignItems: "center", gap: 4 },
  tScoreLbl: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  tScoreNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 36, color: Colors.gold },
  tScoreSep: { fontFamily: "Nunito_700Bold", fontSize: 16, color: Colors.textDim },
  endBtns: { width: "100%", gap: 10, marginTop: 4 },
  btnPrimary: { backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnPrimaryTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: "#1a0a00" },
  btnSecondary: {
    borderRadius: 14, paddingVertical: 13, alignItems: "center",
    borderWidth: 1, borderColor: Colors.border, backgroundColor: "rgba(255,255,255,0.04)",
  },
  btnSecondaryTxt: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.gold },
});
