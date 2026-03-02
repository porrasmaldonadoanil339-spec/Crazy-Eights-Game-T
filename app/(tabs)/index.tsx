import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, Platform, Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { GAME_MODES, DIFFICULTIES, GameModeId, Difficulty } from "@/lib/gameModes";
import { playButton } from "@/lib/audioManager";
import { STORE_ITEMS } from "@/lib/storeItems";

const { width: SW } = Dimensions.get("window");

// Single floating suit element
function FloatSuit({ suit, x, y, size, opacity, duration }: {
  suit: string; x: number; y: number; size: number; opacity: number; duration: number;
}) {
  const ty = useSharedValue(0);
  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(-12, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
      ), -1
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    position: "absolute",
    left: x * SW,
    top: y * 600,
    opacity,
  }));
  const isRed = suit === "♥" || suit === "♦";
  return <Animated.Text style={[style, { fontSize: size, color: isRed ? "#C0392B" : "#fff" }]}>{suit}</Animated.Text>;
}

function FloatingSuits() {
  const positions = [
    { suit: "♠", x: 0.08, y: 0.12, size: 48, opacity: 0.08, dur: 3000 },
    { suit: "♥", x: 0.82, y: 0.06, size: 38, opacity: 0.07, dur: 3400 },
    { suit: "♦", x: 0.72, y: 0.45, size: 52, opacity: 0.06, dur: 3800 },
    { suit: "♣", x: 0.04, y: 0.55, size: 42, opacity: 0.07, dur: 4200 },
    { suit: "♠", x: 0.88, y: 0.78, size: 36, opacity: 0.05, dur: 3600 },
    { suit: "♥", x: 0.15, y: 0.85, size: 44, opacity: 0.07, dur: 3200 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <FloatSuit key={i} suit={p.suit} x={p.x} y={p.y} size={p.size} opacity={p.opacity} duration={p.dur} />
      ))}
    </>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4].map((s) => (
        <Ionicons key={s} name="star" size={10} color={s <= stars ? Colors.gold : Colors.textDim} />
      ))}
    </View>
  );
}

function DifficultyModal({ visible, onClose, onSelect, modeName }: {
  visible: boolean; onClose: () => void; onSelect: (d: Difficulty) => void; modeName: string;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <View style={styles.diffModal}>
          <LinearGradient colors={["#1a2f1a", Colors.surface]} style={styles.diffModalGrad}>
            <View style={styles.diffModalHandle} />
            <Text style={styles.diffTitle}>{modeName}</Text>
            <Text style={styles.diffSub}>Selecciona la dificultad</Text>
            <View style={styles.diffGrid}>
              {DIFFICULTIES.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => onSelect(d.id)}
                  style={({ pressed }) => [styles.diffOption, pressed && styles.diffOptionPressed]}
                >
                  <LinearGradient
                    colors={["rgba(212,175,55,0.12)", "transparent"]}
                    style={styles.diffOptionGrad}
                  >
                    <StarRating stars={d.stars} />
                    <Text style={styles.diffName}>{d.name}</Text>
                    <View style={styles.diffReward}>
                      <Ionicons name="cash" size={11} color={Colors.gold} />
                      <Text style={styles.diffRewardText}>x{d.coinMultiplier}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
}

function PokerTitle() {
  const glowAnim = useSharedValue(0.6);
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ), -1
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  return (
    <View style={styles.titleWrap}>
      <View style={styles.titleSuits}>
        <Text style={styles.suitRed}>♥</Text>
        <Text style={styles.suitBlack}>♠</Text>
        <Text style={styles.suitRed}>♦</Text>
        <Text style={styles.suitBlack}>♣</Text>
      </View>
      <Animated.View style={glowStyle}>
        <Text style={styles.mainTitle}>OCHO LOCOS</Text>
      </Animated.View>
      <Text style={styles.titleTagline}>CRAZY EIGHTS · CASINO EDITION</Text>
    </View>
  );
}

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();
  const { profile, level, xpProgress } = useProfile();
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 6;
  const avatarItem = STORE_ITEMS.find((i) => i.id === profile.avatarId);
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;

  const handleModePress = async (modeId: GameModeId) => {
    await playButton().catch(() => {});
    const mode = GAME_MODES.find((m) => m.id === modeId);
    if (!mode) return;
    if (!mode.hasDifficulty) {
      startGame(modeId, "normal");
      router.push("/game");
      return;
    }
    setSelectedMode(modeId);
    setShowDiffModal(true);
  };

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    if (!selectedMode) return;
    setShowDiffModal(false);
    startGame(selectedMode, difficulty);
    router.push("/game");
  };

  const selectedModeConfig = selectedMode ? GAME_MODES.find((m) => m.id === selectedMode) : null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Multi-layer felt background */}
      <LinearGradient
        colors={["#041008", "#071510", "#0a1a0f", "#071510", "#041008"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Felt texture lines */}
      <View style={styles.feltTextureH1} />
      <View style={styles.feltTextureH2} />
      <View style={styles.feltTextureV1} />

      {/* Floating card suits */}
      <FloatingSuits />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile bar */}
        <View style={styles.profileBar}>
          <View style={[styles.avatarSmall, { backgroundColor: avatarItem?.previewColor ?? Colors.surface }]}>
            <Ionicons name={(avatarItem?.preview ?? "person") as any} size={14} color="#fff" />
          </View>
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName} numberOfLines={1}>{profile.name}</Text>
            <View style={styles.xpMini}>
              <Text style={styles.levelTag}>Nv.{level}</Text>
              <View style={styles.xpBarMini}><View style={[styles.xpFillMini, { width: `${xpPct * 100}%` }]} /></View>
            </View>
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsSymbol}>$</Text>
            <Text style={styles.coinsNum}>{profile.coins}</Text>
          </View>
        </View>

        {/* Poker title */}
        <PokerTitle />

        {/* Divider with suits */}
        <View style={styles.suitDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSuit}>♦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Mode selection header */}
        <View style={styles.sectionHeader}>
          <Ionicons name="game-controller" size={14} color={Colors.textMuted} />
          <Text style={styles.sectionLabel}>MODOS DE JUEGO</Text>
        </View>

        {/* Game mode grid */}
        <View style={styles.modesGrid}>
          {GAME_MODES.map((mode) => {
            const wins = profile.stats.winsByMode[mode.id] ?? 0;
            const games = profile.stats.gamesByMode[mode.id] ?? 0;
            const wr = games > 0 ? Math.round((wins / games) * 100) : null;
            return (
              <Pressable
                key={mode.id}
                onPress={() => handleModePress(mode.id)}
                style={({ pressed }) => [
                  styles.modeCard,
                  pressed && styles.modeCardPressed,
                ]}
              >
                <LinearGradient
                  colors={[mode.color + "28", mode.color + "08", "transparent"]}
                  style={[styles.modeGrad, { borderColor: mode.color + "50" }]}
                >
                  {mode.isNew && (
                    <LinearGradient colors={[Colors.red, "#a01a15"]} style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NUEVO</Text>
                    </LinearGradient>
                  )}
                  <View style={[styles.modeIconWrap, { backgroundColor: mode.color + "25" }]}>
                    <Ionicons name={mode.icon as any} size={24} color={mode.color} />
                  </View>
                  <Text style={[styles.modeName, { color: mode.color }]}>{mode.name}</Text>
                  <Text style={styles.modeDesc} numberOfLines={2}>{mode.description}</Text>
                  <View style={styles.modeFooter}>
                    <View style={styles.modeReward}>
                      <Ionicons name="cash" size={11} color={Colors.gold} />
                      <Text style={styles.modeRewardText}>{mode.coinsReward}</Text>
                    </View>
                    {wr !== null && (
                      <Text style={styles.modeWR}>{wr}% WR</Text>
                    )}
                    {mode.hasDifficulty && (
                      <Ionicons name="chevron-forward" size={12} color={mode.color + "88"} />
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Quick actions row */}
        <View style={styles.quickRow}>
          <Pressable
            onPress={async () => { await playButton().catch(() => {}); router.push("/tutorial"); }}
            style={styles.quickBtn}
          >
            <Ionicons name="help-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.quickBtnText}>Tutorial</Text>
          </Pressable>
          <Pressable
            onPress={async () => { await playButton().catch(() => {}); router.push("/rules"); }}
            style={styles.quickBtn}
          >
            <Ionicons name="book-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.quickBtnText}>Reglas</Text>
          </Pressable>
          {profile.stats.totalGames > 0 && (
            <View style={styles.statChip}>
              <Ionicons name="trophy" size={14} color={Colors.gold} />
              <Text style={styles.statChipText}>{profile.stats.totalWins}V</Text>
              <Text style={styles.statChipSep}>·</Text>
              <Text style={styles.statChipText}>{profile.stats.totalGames}P</Text>
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <DifficultyModal
        visible={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        onSelect={handleDifficultySelect}
        modeName={selectedModeConfig?.name ?? ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#041008" },
  scroll: { paddingHorizontal: 16 },

  // Felt texture overlays
  feltTextureH1: { position: "absolute", left: 0, right: 0, top: "30%", height: 1, backgroundColor: "rgba(255,255,255,0.02)" },
  feltTextureH2: { position: "absolute", left: 0, right: 0, top: "65%", height: 1, backgroundColor: "rgba(255,255,255,0.02)" },
  feltTextureV1: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, backgroundColor: "rgba(255,255,255,0.015)" },

  // Profile bar
  profileBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: "rgba(212,175,55,0.15)", marginBottom: 16,
  },
  avatarSmall: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  profileBarInfo: { flex: 1 },
  profileBarName: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  xpMini: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  levelTag: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: Colors.gold,
    backgroundColor: Colors.gold + "20", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
  },
  xpBarMini: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  xpFillMini: { height: "100%", backgroundColor: Colors.gold, borderRadius: 2 },
  coinsBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: Colors.gold + "18", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold + "40",
  },
  coinsSymbol: { fontFamily: "Nunito_900ExtraBold", fontSize: 12, color: Colors.gold },
  coinsNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.gold },

  // Poker title
  titleWrap: { alignItems: "center", paddingVertical: 12, gap: 4 },
  titleSuits: { flexDirection: "row", gap: 12, marginBottom: 4 },
  suitRed: { fontSize: 22, color: "#C0392B", opacity: 0.8 },
  suitBlack: { fontSize: 22, color: Colors.textMuted, opacity: 0.8 },
  mainTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 36, color: Colors.gold,
    letterSpacing: 5,
    textShadowColor: "rgba(212,175,55,0.5)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  titleTagline: {
    fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim,
    letterSpacing: 3, textTransform: "uppercase",
  },

  // Divider
  suitDivider: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerSuit: { fontSize: 14, color: Colors.gold + "60" },

  // Section header
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted, letterSpacing: 2 },

  // Mode grid
  modesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  modeCard: { width: "47.5%", borderRadius: 16, overflow: "hidden" },
  modeCardPressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  modeGrad: {
    padding: 14, minHeight: 155, justifyContent: "space-between",
    borderWidth: 1.5, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  newBadge: {
    position: "absolute", top: 8, right: 8,
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
  },
  newBadgeText: { fontFamily: "Nunito_900ExtraBold", fontSize: 7, color: "#fff", letterSpacing: 1 },
  modeIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  modeName: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, marginBottom: 4 },
  modeDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted, lineHeight: 15, flex: 1 },
  modeFooter: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, flexWrap: "wrap" },
  modeReward: { flexDirection: "row", alignItems: "center", gap: 3 },
  modeRewardText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  modeWR: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim, flex: 1, textAlign: "right" },

  // Quick actions
  quickRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  quickBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnText: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" as any,
    backgroundColor: Colors.gold + "12", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gold + "30",
  },
  statChipText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  statChipSep: { color: Colors.textDim, fontSize: 11 },

  // Difficulty modal
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  diffModal: { borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: "hidden" },
  diffModalGrad: { padding: 22, paddingBottom: 36 },
  diffModalHandle: {
    width: 38, height: 4, backgroundColor: Colors.border, borderRadius: 2,
    alignSelf: "center", marginBottom: 18,
  },
  diffTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold, marginBottom: 4 },
  diffSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, marginBottom: 18 },
  diffGrid: { flexDirection: "row", gap: 8 },
  diffOption: { flex: 1, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  diffOptionPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  diffOptionGrad: { padding: 12, alignItems: "center", gap: 6 },
  diffName: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text },
  diffReward: { flexDirection: "row", alignItems: "center", gap: 3 },
  diffRewardText: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
});
