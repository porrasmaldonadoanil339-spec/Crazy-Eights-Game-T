import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform, Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { PlayingCard } from "@/components/PlayingCard";
import {
  MultiGameState, Card, Suit,
  initMultiGame, multiCanPlay, multiPlayCard, multiDraw, multiChooseSuit, multiConfirmTurn,
  suitName, suitSymbol, suitColor, multiGetTopCard,
} from "@/lib/multiplayerEngine";
import { playCardFlip, playCardDraw, playWin, playButton } from "@/lib/audioManager";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const { width: SW } = Dimensions.get("window");

const PLAYER_COLORS = ["#D4AF37", "#27AE60", "#E74C3C", "#9B59B6"];
const PLAYER_ICONS = ["person", "person-circle", "happy", "star"];

// ─── Opponent hand (face down) ─────────────────────────────────────────────
function OpponentHand({ count, name, color, isLeft }: { count: number; name: string; color: string; isLeft?: boolean }) {
  const maxVisible = Math.min(count, 10);
  return (
    <View style={[styles.opponentSection, isLeft != null && (isLeft ? styles.opponentLeft : styles.opponentRight)]}>
      <Text style={[styles.opponentName, { color }]} numberOfLines={1}>{name}</Text>
      <View style={styles.opponentCards}>
        {Array.from({ length: maxVisible }).map((_, i) => (
          <View
            key={i}
            style={[styles.faceDownCard, {
              marginLeft: i === 0 ? 0 : -16,
              zIndex: i,
              transform: [{ rotate: `${(i - maxVisible / 2) * 2}deg` }],
            }]}
          >
            <LinearGradient colors={["#1E4080", "#0e2248"]} style={styles.faceDownInner}>
              <Text style={styles.faceDownDot}>◆</Text>
            </LinearGradient>
          </View>
        ))}
        <View style={[styles.countBadge, { backgroundColor: color }]}>
          <Text style={styles.countBadgeTxt}>{count}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Side opponent (vertical face-down) ──────────────────────────────────
function SideOpponent({ count, name, color }: { count: number; name: string; color: string }) {
  const maxVisible = Math.min(count, 6);
  return (
    <View style={styles.sideOpponent}>
      <Text style={[styles.sideOpponentName, { color }]} numberOfLines={1}>{name}</Text>
      {Array.from({ length: maxVisible }).map((_, i) => (
        <View key={i} style={[styles.sideCard, { marginTop: i === 0 ? 0 : -22, zIndex: i }]}>
          <LinearGradient colors={["#1E4080", "#0e2248"]} style={styles.sideCardInner}>
            <Text style={styles.faceDownDot}>◆</Text>
          </LinearGradient>
        </View>
      ))}
      <View style={[styles.countBadge, { backgroundColor: color, marginTop: 4 }]}>
        <Text style={styles.countBadgeTxt}>{count}</Text>
      </View>
    </View>
  );
}

// ─── Suit picker ──────────────────────────────────────────────────────────
function SuitPicker({ visible, onChoose }: { visible: boolean; onChoose: (s: Suit) => void }) {
  if (!visible) return null;
  return (
    <View style={styles.suitOverlay}>
      <Text style={styles.suitTitle}>Elige el palo</Text>
      <View style={styles.suitGrid}>
        {SUITS.map(s => (
          <Pressable key={s} onPress={() => onChoose(s)} style={styles.suitBtn}>
            <Text style={[styles.suitSym, { color: suitColor(s) }]}>{suitSymbol(s)}</Text>
            <Text style={styles.suitLbl}>{suitName(s)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Pass device overlay ──────────────────────────────────────────────────
function PassDeviceOverlay({ playerName, playerColor, onReady }: {
  playerName: string; playerColor: string; onReady: () => void;
}) {
  return (
    <View style={styles.passOverlay}>
      <LinearGradient
        colors={["#020d06", "#04130a", "#020d06"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.passContent}>
        <View style={[styles.passAvatar, { borderColor: playerColor }]}>
          <Ionicons name="person" size={36} color={playerColor} />
        </View>
        <Text style={styles.passTurnLabel}>TURNO DE</Text>
        <Text style={[styles.passPlayerName, { color: playerColor }]}>{playerName}</Text>
        <Text style={styles.passInstruction}>Pasa el dispositivo a {playerName}</Text>
        <Pressable style={[styles.passBtn, { borderColor: playerColor }]} onPress={onReady}>
          <LinearGradient colors={[playerColor + "33", playerColor + "11"]} style={styles.passBtnGrad}>
            <Ionicons name="eye" size={20} color={playerColor} />
            <Text style={[styles.passBtnText, { color: playerColor }]}>MOSTRAR MIS CARTAS</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Win overlay ──────────────────────────────────────────────────────────
function WinOverlay({ winnerName, winnerColor, onClose }: {
  winnerName: string; winnerColor: string; onClose: () => void;
}) {
  return (
    <View style={styles.winOverlay}>
      <LinearGradient colors={["#020d06", "#041008"]} style={StyleSheet.absoluteFill} />
      <View style={styles.winContent}>
        <Text style={[styles.winTitle, { color: winnerColor }]}>¡GANÓ!</Text>
        <Text style={[styles.winName, { color: winnerColor }]}>{winnerName}</Text>
        <Ionicons name="trophy" size={64} color={winnerColor} style={{ marginVertical: 20 }} />
        <Pressable style={styles.winBtn} onPress={onClose}>
          <LinearGradient colors={[Colors.gold, Colors.gold + "aa"]} style={styles.winBtnGrad}>
            <Text style={styles.winBtnText}>VOLVER AL MENÚ</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function MultiGameScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ names?: string; count?: string }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 4;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 4;

  // Parse player names from route params
  const playerNames = React.useMemo(() => {
    if (params.names) {
      try { return JSON.parse(params.names) as string[]; }
      catch {}
    }
    const count = parseInt(params.count ?? "2", 10);
    return Array.from({ length: count }, (_, i) => `Jugador ${i + 1}`);
  }, []);

  const [gameState, setGameState] = useState<MultiGameState>(() =>
    initMultiGame(playerNames)
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const pidx = gameState.currentPlayerIndex;
  const currentHand = gameState.hands[pidx] ?? [];
  const playerCount = gameState.playerCount;
  const topCard = multiGetTopCard(gameState);
  const currentSuitSym = suitSymbol(gameState.currentSuit);
  const currentSuitColor = suitColor(gameState.currentSuit);
  const isPlaying = gameState.phase === "playing";
  const playableCount = isPlaying
    ? currentHand.filter(c => multiCanPlay(c, gameState)).length
    : 0;

  // Card size based on player count and hand size
  const cardSize = (playerCount <= 2 && currentHand.length <= 10) ? "md" : "sm";

  // Opponent indices (clockwise from current)
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
    if (!multiCanPlay(card, gameState)) {
      playCardFlip().catch(() => {});
      return;
    }
    if (selectedCard?.id === card.id) {
      if (card.rank === "8" || (card.rank === "Joker" && gameState.pendingDraw === 0)) {
        // Need suit picker — don't play yet, wait for suit choice
        return;
      }
      playCardFlip().catch(() => {});
      const ns = multiPlayCard(gameState, card);
      setGameState(ns);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }, [gameState, isPlaying, selectedCard]);

  const handleChooseSuit = useCallback((suit: Suit) => {
    if (!selectedCard) return;
    playCardFlip().catch(() => {});
    const ns = multiPlayCard(gameState, selectedCard, suit);
    setGameState(ns);
    setSelectedCard(null);
  }, [gameState, selectedCard]);

  const handleDraw = useCallback(() => {
    if (!isPlaying) return;
    playCardDraw().catch(() => {});
    const ns = multiDraw(gameState);
    setGameState(ns);
    setSelectedCard(null);
  }, [gameState, isPlaying]);

  const handleConfirmTurn = useCallback(() => {
    playButton().catch(() => {});
    const ns = multiConfirmTurn(gameState);
    setGameState(ns);
  }, [gameState]);

  const handlePlayAndChooseSuit = useCallback((suit: Suit) => {
    if (!selectedCard) return;
    handleChooseSuit(suit);
  }, [selectedCard, handleChooseSuit]);

  const currentColor = PLAYER_COLORS[pidx % PLAYER_COLORS.length];

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient
        colors={["#061510", "#08180d", "#0a1a0f", "#08180d", "#061510"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tableGlowBorder} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { playButton().catch(() => {}); router.back(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.modePill}>
            <Ionicons name="people" size={12} color={Colors.gold} />
            <Text style={styles.modeLabel}>{playerCount} Jugadores</Text>
          </View>
        </View>
        <View style={styles.deckInfo}>
          <Ionicons name="layers" size={13} color={Colors.textDim} />
          <Text style={styles.deckCount}>{gameState.drawPile.length}</Text>
        </View>
      </View>

      {/* Opponents layout */}
      {playerCount === 2 && (
        <OpponentHand
          count={opponents[0]?.idx !== undefined ? gameState.hands[opponents[0].idx].length : 0}
          name={opponents[0]?.name ?? ""}
          color={opponents[0]?.color ?? Colors.gold}
        />
      )}

      {playerCount === 3 && (
        <View style={styles.twoOpponentsRow}>
          {opponents.map((op) => (
            <OpponentHand key={op.idx} count={gameState.hands[op.idx].length} name={op.name} color={op.color} />
          ))}
        </View>
      )}

      {playerCount === 4 && (
        <View style={styles.fourPlayerTop}>
          <SideOpponent
            count={gameState.hands[opponents[2]?.idx ?? 0].length}
            name={opponents[2]?.name ?? ""}
            color={opponents[2]?.color ?? Colors.gold}
          />
          <OpponentHand
            count={gameState.hands[opponents[0]?.idx ?? 0].length}
            name={opponents[0]?.name ?? ""}
            color={opponents[0]?.color ?? Colors.gold}
          />
          <SideOpponent
            count={gameState.hands[opponents[1]?.idx ?? 0].length}
            name={opponents[1]?.name ?? ""}
            color={opponents[1]?.color ?? Colors.gold}
          />
        </View>
      )}

      {/* Table center */}
      <View style={styles.tableCenter}>
        {/* Suit indicator */}
        <View style={[styles.suitIndicator, { borderColor: currentSuitColor + "55" }]}>
          <Text style={[styles.suitSym, { color: currentSuitColor }]}>{currentSuitSym}</Text>
          <Text style={styles.suitLblSmall}>{suitName(gameState.currentSuit)}</Text>
        </View>

        {/* Message */}
        <View style={styles.messageBubble}>
          <Text style={styles.messageText} numberOfLines={2}>{gameState.message}</Text>
        </View>

        {/* Cards row */}
        <View style={styles.cardsRow}>
          {/* Draw pile */}
          <Pressable onPress={handleDraw} disabled={!isPlaying}>
            <View style={styles.drawPile}>
              {[2, 1, 0].map(i => (
                <View key={i} style={[styles.deckCardAbs, { top: -i * 1.5, left: i * 1.5, zIndex: 3 - i }]}>
                  <LinearGradient colors={["#1E4080", "#0e2248"]} style={styles.deckCardInner}>
                    <Text style={styles.deckCardDot}>◆</Text>
                  </LinearGradient>
                </View>
              ))}
              {isPlaying && playableCount === 0 && (
                <LinearGradient colors={[Colors.gold, Colors.gold + "cc"]} style={styles.drawLabel}>
                  <Text style={styles.drawLabelText}>
                    {gameState.pendingDraw > 0 ? `+${gameState.pendingDraw}` : "ROBAR"}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </Pressable>

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

        {selectedCard && isPlaying && (
          <View style={styles.selectedHint}>
            <Text style={styles.selectedHintText}>
              {(selectedCard.rank === "8" || (selectedCard.rank === "Joker" && gameState.pendingDraw === 0))
                ? "Toca de nuevo para elegir palo"
                : "Toca la carta de nuevo para jugarla"}
            </Text>
          </View>
        )}
      </View>

      {/* Player section */}
      <View style={styles.playerSection}>
        {/* Player label */}
        <View style={styles.turnLabelRow}>
          <View style={[styles.playerDot, { backgroundColor: currentColor }]} />
          <Text style={[styles.turnLabel, { color: currentColor }]}>
            {playerNames[pidx]} · {currentHand.length} cartas
          </Text>
          {isPlaying && playableCount > 0 && (
            <Text style={styles.playableHint}>{playableCount} jugable{playableCount !== 1 ? "s" : ""}</Text>
          )}
        </View>

        {/* Hand */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handContainer}
          style={styles.handScroll}
        >
          {currentHand.map((card, i) => {
            const playable = isPlaying && multiCanPlay(card, gameState);
            const selected = selectedCard?.id === card.id;
            const angle = (i - currentHand.length / 2) * 2.5;
            return (
              <View
                key={card.id}
                style={{
                  marginLeft: i === 0 ? 0 : (cardSize === "sm" ? -22 : -18),
                  zIndex: selected ? 100 : i,
                  transform: [{ rotate: `${angle}deg` }],
                }}
              >
                <PlayingCard
                  card={card}
                  onPress={() => handleCardPress(card)}
                  isPlayable={playable}
                  isSelected={selected}
                  size={cardSize}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Suit picker overlay */}
      {gameState.phase === "choosing_suit" && selectedCard && (
        <View style={StyleSheet.absoluteFill}>
          <SuitPicker visible onChoose={handlePlayAndChooseSuit} />
        </View>
      )}

      {/* Pass device overlay */}
      {gameState.phase === "pass_device" && (
        <PassDeviceOverlay
          playerName={playerNames[pidx]}
          playerColor={currentColor}
          onReady={handleConfirmTurn}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tableGlowBorder: {
    position: "absolute", inset: 8, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.06)",
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  modePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.gold + "18",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gold + "33",
  },
  modeLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  deckInfo: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  deckCount: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },

  // Opponent layouts
  opponentSection: { alignItems: "center", gap: 4, paddingVertical: 4 },
  opponentLeft: { flex: 1 },
  opponentRight: { flex: 1 },
  opponentName: { fontFamily: "Nunito_700Bold", fontSize: 11 },
  opponentCards: { flexDirection: "row", alignItems: "center" },
  twoOpponentsRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 8 },
  fourPlayerTop: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 4, gap: 4 },

  faceDownCard: {
    width: 32, height: 46, borderRadius: 6, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.gold + "44",
  },
  faceDownInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  faceDownDot: { fontSize: 8, color: Colors.gold, opacity: 0.5 },
  countBadge: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    marginLeft: 6,
  },
  countBadgeTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#fff" },

  // Side opponent
  sideOpponent: { alignItems: "center", gap: 2, minWidth: 40 },
  sideOpponentName: { fontFamily: "Nunito_700Bold", fontSize: 9, textAlign: "center" },
  sideCard: {
    width: 26, height: 38, borderRadius: 4, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.gold + "44",
  },
  sideCardInner: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Table center
  tableCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  suitIndicator: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1,
  },
  suitSym: { fontSize: 20, fontFamily: "Nunito_900ExtraBold" },
  suitLblSmall: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted },
  messageBubble: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, maxWidth: 280,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  messageText: {
    fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text, textAlign: "center",
  },
  cardsRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  drawPile: { width: 68, height: 96, position: "relative" },
  deckCardAbs: { position: "absolute", width: 64, height: 90, borderRadius: 10, overflow: "hidden" },
  deckCardInner: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  deckCardDot: { fontSize: 12, color: Colors.gold, opacity: 0.3 },
  drawLabel: {
    position: "absolute", bottom: -10, left: "50%",
    transform: [{ translateX: -22 }],
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, zIndex: 10,
  },
  drawLabelText: { fontFamily: "Nunito_900ExtraBold", fontSize: 10, color: Colors.background },
  vsDivider: { alignItems: "center", gap: 4 },
  vsDividerLine: { width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  vsDividerText: { fontSize: 12, color: Colors.gold, opacity: 0.4 },
  discardPile: { alignItems: "center", justifyContent: "center" },
  selectedHint: {
    backgroundColor: Colors.gold + "22", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.gold + "44",
  },
  selectedHintText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.gold, textAlign: "center" },

  // Player section
  playerSection: { gap: 5, alignItems: "center" },
  turnLabelRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, width: "100%",
  },
  playerDot: { width: 8, height: 8, borderRadius: 4 },
  turnLabel: { fontFamily: "Nunito_700Bold", fontSize: 13, flex: 1 },
  playableHint: {
    fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  handScroll: { width: "100%", maxHeight: 140 },
  handContainer: {
    paddingHorizontal: 16, paddingVertical: 4, alignItems: "flex-end",
    paddingBottom: 8,
  },

  // Suit picker
  suitOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center", justifyContent: "center", gap: 20,
  },
  suitTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 2,
  },
  suitGrid: { flexDirection: "row", gap: 14, flexWrap: "wrap", justifyContent: "center" },
  suitBtn: {
    width: 80, height: 80, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  suitLbl: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textMuted },

  // Pass device overlay
  passOverlay: {
    position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", zIndex: 200,
  },
  passContent: { alignItems: "center", gap: 12, paddingHorizontal: 32 },
  passAvatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  passTurnLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted,
    letterSpacing: 4,
  },
  passPlayerName: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 32, textAlign: "center",
  },
  passInstruction: {
    fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textDim, textAlign: "center",
  },
  passBtn: {
    marginTop: 24, borderRadius: 16, overflow: "hidden", borderWidth: 2,
    width: 260,
  },
  passBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, paddingHorizontal: 24,
  },
  passBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, letterSpacing: 1 },

  // Win overlay
  winOverlay: {
    position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", zIndex: 300,
  },
  winContent: { alignItems: "center", gap: 8, paddingHorizontal: 32 },
  winTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, letterSpacing: 4 },
  winName: { fontFamily: "Nunito_900ExtraBold", fontSize: 40, textAlign: "center" },
  winBtn: { marginTop: 16, borderRadius: 16, overflow: "hidden", width: 240 },
  winBtnGrad: { paddingVertical: 16, alignItems: "center" },
  winBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.background },
});
