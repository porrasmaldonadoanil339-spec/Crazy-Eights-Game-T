import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { PlayingCard } from "@/components/PlayingCard";
import type { Suit } from "@/lib/gameEngine";
import { suitSymbol, suitName, suitColor, canPlay } from "@/lib/gameEngine";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function SuitPicker({
  visible,
  onSelect,
}: {
  visible: boolean;
  onSelect: (suit: Suit) => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.suitModalOverlay}>
        <View style={styles.suitModal}>
          <Text style={styles.suitModalTitle}>Elige un palo</Text>
          <View style={styles.suitGrid}>
            {SUITS.map((suit) => (
              <Pressable
                key={suit}
                onPress={() => onSelect(suit)}
                style={({ pressed }) => [
                  styles.suitOption,
                  pressed && styles.suitOptionPressed,
                ]}
              >
                <Text
                  style={[styles.suitSymbolLarge, { color: suitColor(suit) }]}
                >
                  {suitSymbol(suit)}
                </Text>
                <Text style={styles.suitOptionName}>{suitName(suit)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EndModal({
  phase,
  onRestart,
  onHome,
}: {
  phase: "player_wins" | "ai_wins" | "draw";
  onRestart: () => void;
  onHome: () => void;
}) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 300 });
    if (phase === "player_wins") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isWin = phase === "player_wins";

  return (
    <View style={styles.endOverlay}>
      <Animated.View style={[styles.endModal, style]}>
        <LinearGradient
          colors={
            isWin
              ? ["#1a3a1a", Colors.surface]
              : phase === "draw"
              ? ["#1a1a3a", Colors.surface]
              : ["#3a1a1a", Colors.surface]
          }
          style={styles.endGradient}
        >
          <View style={styles.endIconWrap}>
            <Ionicons
              name={isWin ? "trophy" : phase === "draw" ? "hand-left" : "skull"}
              size={40}
              color={
                isWin ? Colors.gold : phase === "draw" ? Colors.blue : Colors.red
              }
            />
          </View>
          <Text
            style={[
              styles.endTitle,
              {
                color: isWin
                  ? Colors.success
                  : phase === "draw"
                  ? Colors.blue
                  : Colors.red,
              },
            ]}
          >
            {isWin ? "¡GANASTE!" : phase === "draw" ? "EMPATE" : "PERDISTE"}
          </Text>
          <Text style={styles.endSub}>
            {isWin
              ? "Excelente jugada"
              : phase === "draw"
              ? "Muy parejo"
              : "El CPU fue mejor esta vez"}
          </Text>
          <View style={styles.endButtons}>
            <Pressable
              onPress={onRestart}
              style={({ pressed }) => [styles.endBtn, styles.endBtnPrimary, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.endBtnTextPrimary}>Jugar de nuevo</Text>
            </Pressable>
            <Pressable
              onPress={onHome}
              style={({ pressed }) => [styles.endBtn, styles.endBtnSecondary, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.endBtnTextSecondary}>Menú</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function AiHandDisplay({ count }: { count: number }) {
  return (
    <View style={styles.aiHandRow}>
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.aiCardBack,
            {
              marginLeft: i === 0 ? 0 : -28,
              zIndex: i,
              transform: [
                { rotate: `${(i - count / 2) * 3}deg` },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#1a3a6a", "#0e2248"]}
            style={styles.aiCardInner}
          >
            <Text style={styles.aiCardDot}>◆</Text>
          </LinearGradient>
        </View>
      ))}
      <View style={styles.aiCardCountBadge}>
        <Text style={styles.aiCardCountText}>{count}</Text>
      </View>
    </View>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    gameState,
    handlePlayCard,
    handleDraw,
    handleChooseSuit,
    runAiTurn,
    selectedCard,
    setSelectedCard,
    startGame,
  } = useGame();

  const aiThinking = useRef(false);
  const [suitPickerVisible, setSuitPickerVisible] = useState(false);
  const messageOpacity = useSharedValue(1);

  useEffect(() => {
    if (!gameState) return;
    messageOpacity.value = withSequence(
      withTiming(0, { duration: 50 }),
      withTiming(1, { duration: 300 })
    );
    if (
      gameState.currentPlayer === "ai" &&
      gameState.phase === "playing" &&
      !aiThinking.current
    ) {
      aiThinking.current = true;
      const delay = 800 + Math.random() * 600;
      setTimeout(() => {
        runAiTurn();
        aiThinking.current = false;
      }, delay);
    }
  }, [gameState?.currentPlayer, gameState?.phase, gameState?.message]);

  const msgStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const handleCardPress = async (card: import("@/lib/gameEngine").Card) => {
    if (!gameState || gameState.currentPlayer !== "player" || gameState.phase !== "playing") return;
    if (!canPlay(card, gameState)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8") {
        setSuitPickerVisible(true);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handlePlayCard(card);
      }
    } else {
      await Haptics.selectionAsync();
      setSelectedCard(card);
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    setSuitPickerVisible(false);
    if (selectedCard) {
      handlePlayCard(selectedCard, suit);
    }
  };

  const handleDrawPress = async () => {
    if (!gameState || gameState.currentPlayer !== "player") return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleDraw();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!gameState) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={styles.noGame}>Sin partida activa</Text>
        <Pressable onPress={() => router.back()} style={styles.backPressable}>
          <Ionicons name="arrow-back" size={24} color={Colors.gold} />
        </Pressable>
      </View>
    );
  }

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const isPlayerTurn =
    gameState.currentPlayer === "player" && gameState.phase === "playing";
  const isGameOver =
    gameState.phase === "player_wins" ||
    gameState.phase === "ai_wins" ||
    gameState.phase === "draw";

  const playableCount = gameState.playerHand.filter((c) =>
    canPlay(c, gameState)
  ).length;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient
        colors={["#061209", "#0a1a0f", "#0d2418"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.gold} />
        </Pressable>
        <Text style={styles.headerTitle}>OCHO LOCOS</Text>
        <View style={styles.deckInfo}>
          <Ionicons name="layers-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
        </View>
      </View>

      <View style={styles.aiSection}>
        <View style={styles.playerLabel}>
          <Ionicons
            name="hardware-chip-outline"
            size={14}
            color={
              gameState.currentPlayer === "ai" ? Colors.gold : Colors.textMuted
            }
          />
          <Text
            style={[
              styles.playerLabelText,
              gameState.currentPlayer === "ai" && styles.activeTurn,
            ]}
          >
            CPU {gameState.currentPlayer === "ai" ? "— pensando..." : ""}
          </Text>
        </View>
        <AiHandDisplay count={gameState.aiHand.length} />
      </View>

      <View style={styles.tableSection}>
        <Animated.View style={[styles.messageBox, msgStyle]}>
          <Text style={styles.messageText}>{gameState.message}</Text>
        </Animated.View>

        <View style={styles.cardsArea}>
          <Pressable onPress={handleDrawPress} disabled={!isPlayerTurn}>
            <View style={styles.drawPileStack}>
              {[2, 1, 0].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.deckCard,
                    {
                      top: -i * 2,
                      left: i * 2,
                      zIndex: 3 - i,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#1a3a6a", "#0e2248"]}
                    style={styles.deckCardInner}
                  >
                    <Text style={styles.deckCardDot}>◆</Text>
                  </LinearGradient>
                </View>
              ))}
              {isPlayerTurn && playableCount === 0 && (
                <View style={styles.drawHintBadge}>
                  <Text style={styles.drawHintText}>ROBAR</Text>
                </View>
              )}
            </View>
          </Pressable>

          <View style={styles.discardSection}>
            {topCard && (
              <PlayingCard card={topCard} size="lg" />
            )}
            {gameState.currentSuit !== topCard?.suit && (
              <View style={styles.suitOverrideTag}>
                <Text
                  style={[
                    styles.suitOverrideText,
                    { color: suitColor(gameState.currentSuit) },
                  ]}
                >
                  {suitSymbol(gameState.currentSuit)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.playerSection}>
        <View style={styles.playerLabel}>
          <Ionicons
            name="person"
            size={14}
            color={isPlayerTurn ? Colors.gold : Colors.textMuted}
          />
          <Text style={[styles.playerLabelText, isPlayerTurn && styles.activeTurn]}>
            Tú — {gameState.playerHand.length} cartas
          </Text>
          {selectedCard && isPlayerTurn && (
            <Text style={styles.tapHint}>
              {selectedCard.rank === "8"
                ? "Toca de nuevo → elegir palo"
                : "Toca de nuevo → jugar"}
            </Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
                  marginLeft: i === 0 ? 0 : -20,
                  zIndex: selected ? 100 : i,
                  transform: [
                    {
                      rotate: `${
                        (i - gameState.playerHand.length / 2) * 2.5
                      }deg`,
                    },
                  ],
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

      <SuitPicker
        visible={suitPickerVisible}
        onSelect={handleSuitSelect}
      />

      {isGameOver && (
        <EndModal
          phase={gameState.phase as "player_wins" | "ai_wins" | "draw"}
          onRestart={() => {
            startGame();
          }}
          onHome={() => {
            router.back();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 18,
    color: Colors.gold,
    letterSpacing: 3,
  },
  deckInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deckCount: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: Colors.textMuted,
  },
  aiSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center",
    gap: 8,
  },
  playerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerLabelText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  activeTurn: {
    color: Colors.gold,
    fontFamily: "Nunito_700Bold",
  },
  tapHint: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.gold,
    opacity: 0.7,
  },
  aiHandRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
  },
  aiCardBack: {
    width: 44,
    height: 62,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  aiCardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aiCardDot: {
    fontSize: 16,
    color: Colors.gold,
    opacity: 0.4,
  },
  aiCardCountBadge: {
    position: "absolute",
    right: -12,
    top: -8,
    backgroundColor: Colors.red,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 20,
  },
  aiCardCountText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 11,
    color: "#fff",
  },
  tableSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  messageBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 300,
  },
  messageText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: Colors.text,
    textAlign: "center",
  },
  cardsArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  drawPileStack: {
    width: 72,
    height: 104,
    position: "relative",
  },
  deckCard: {
    position: "absolute",
    width: 72,
    height: 104,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  deckCardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deckCardDot: {
    fontSize: 28,
    color: Colors.gold,
    opacity: 0.3,
  },
  drawHintBadge: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    backgroundColor: Colors.gold,
    borderRadius: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  drawHintText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 9,
    color: "#1a0a00",
    letterSpacing: 1,
  },
  discardSection: {
    position: "relative",
  },
  suitOverrideTag: {
    position: "absolute",
    top: -14,
    right: -14,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  suitOverrideText: {
    fontSize: 18,
    fontWeight: "900",
  },
  playerSection: {
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  handScroll: {
    maxHeight: 110,
  },
  handContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  suitModalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  suitModal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    width: 300,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  suitModalTitle: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 18,
    color: Colors.gold,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 2,
  },
  suitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  suitOption: {
    width: 120,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suitOptionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  suitSymbolLarge: {
    fontSize: 32,
    fontWeight: "900",
  },
  suitOptionName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.text,
  },
  endOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  endModal: {
    width: 300,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  endGradient: {
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  endIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  endTitle: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 28,
    letterSpacing: 3,
  },
  endSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  endButtons: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  endBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  endBtnPrimary: {
    backgroundColor: Colors.gold,
  },
  endBtnSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  endBtnTextPrimary: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 16,
    color: "#1a0a00",
  },
  endBtnTextSecondary: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: Colors.gold,
  },
  noGame: {
    fontFamily: "Nunito_700Bold",
    color: Colors.textMuted,
    fontSize: 16,
    margin: 20,
  },
  backPressable: {
    padding: 12,
  },
});
