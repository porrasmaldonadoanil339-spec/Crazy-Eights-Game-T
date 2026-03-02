import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { useProfile } from "@/context/ProfileContext";
import { GAME_MODES, DIFFICULTIES, GameModeId, Difficulty } from "@/lib/gameModes";
import { playSound } from "@/lib/sounds";
import { getXpProgress } from "@/lib/battlePass";
import { STORE_ITEMS } from "@/lib/storeItems";

function StarRating({ stars }: { stars: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4].map((s) => (
        <Ionicons key={s} name="star" size={10} color={s <= stars ? Colors.gold : Colors.textDim} />
      ))}
    </View>
  );
}

function DifficultyModal({
  visible,
  onClose,
  onSelect,
  modeName,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (d: Difficulty) => void;
  modeName: string;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <View style={styles.diffModal}>
          <View style={styles.diffModalHeader}>
            <Text style={styles.diffModalTitle}>{modeName}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.diffModalSub}>Elige la dificultad</Text>
          <View style={styles.diffGrid}>
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => onSelect(d.id)}
                style={({ pressed }) => [styles.diffOption, pressed && styles.diffOptionPressed]}
              >
                <StarRating stars={d.stars} />
                <Text style={styles.diffOptionName}>{d.name}</Text>
                <Text style={styles.diffOptionMult}>x{d.coinMultiplier} monedas</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();
  const { profile, level, xpProgress } = useProfile();
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const avatarItem = STORE_ITEMS.find((i) => i.id === profile.avatarId);
  const titleItem = STORE_ITEMS.find((i) => i.id === profile.titleId);
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;

  const handleModePress = async (modeId: GameModeId) => {
    await playSound("button_press");
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
    await playSound("shuffle");
    startGame(selectedMode, difficulty);
    router.push("/game");
  };

  const handleTutorial = async () => {
    await playSound("button_press");
    router.push("/tutorial");
  };

  const selectedModeConfig = selectedMode ? GAME_MODES.find((m) => m.id === selectedMode) : null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#061209", "#0a1a0f", "#0d2418"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header with profile snippet */}
        <View style={styles.header}>
          <View style={styles.profileChip}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarItem?.previewColor ?? Colors.surface }]}>
              <Ionicons name={(avatarItem?.preview ?? "person") as any} size={18} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
              <View style={styles.xpRow}>
                <Text style={styles.levelTag}>Nv.{level}</Text>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: `${xpPct * 100}%` }]} />
                </View>
                <Text style={styles.xpText}>{xpProgress.current}/{xpProgress.needed}</Text>
              </View>
            </View>
            <View style={styles.coinsBadge}>
              <Ionicons name="cash" size={12} color={Colors.gold} />
              <Text style={styles.coinsText}>{profile.coins}</Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>OCHO LOCOS</Text>
            <Pressable onPress={handleTutorial} style={styles.tutorialBtn}>
              <Ionicons name="help-circle" size={22} color={Colors.gold} />
            </Pressable>
          </View>
        </View>

        {/* Modes */}
        <Text style={styles.sectionLabel}>Modos de juego</Text>
        <View style={styles.modesGrid}>
          {GAME_MODES.map((mode) => {
            const wins = profile.stats.winsByMode[mode.id] ?? 0;
            const games = profile.stats.gamesByMode[mode.id] ?? 0;
            return (
              <Pressable
                key={mode.id}
                onPress={() => handleModePress(mode.id)}
                style={({ pressed }) => [
                  styles.modeCard,
                  { borderColor: mode.color + "55" },
                  pressed && styles.modeCardPressed,
                ]}
              >
                <LinearGradient
                  colors={[mode.color + "22", "transparent"]}
                  style={styles.modeGradient}
                >
                  {mode.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NUEVO</Text>
                    </View>
                  )}
                  <View style={[styles.modeIconCircle, { backgroundColor: mode.color + "33" }]}>
                    <Ionicons name={mode.icon as any} size={22} color={mode.color} />
                  </View>
                  <Text style={styles.modeName}>{mode.name}</Text>
                  <Text style={styles.modeDesc} numberOfLines={2}>{mode.description}</Text>
                  <View style={styles.modeFooter}>
                    <View style={styles.modeReward}>
                      <Ionicons name="cash" size={11} color={Colors.gold} />
                      <Text style={styles.modeRewardText}>{mode.coinsReward}</Text>
                    </View>
                    {games > 0 && (
                      <Text style={styles.modeStats}>{wins}/{games} victorias</Text>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Quick stats */}
        {profile.stats.totalGames > 0 && (
          <View style={styles.quickStats}>
            <Text style={styles.sectionLabel}>Tus estadísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{profile.stats.totalWins}</Text>
                <Text style={styles.statLbl}>Victorias</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{profile.stats.totalGames}</Text>
                <Text style={styles.statLbl}>Partidas</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>
                  {profile.stats.totalGames > 0
                    ? Math.round((profile.stats.totalWins / profile.stats.totalGames) * 100)
                    : 0}%
                </Text>
                <Text style={styles.statLbl}>Win Rate</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{profile.stats.dailyStreak}</Text>
                <Text style={styles.statLbl}>Racha</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { marginBottom: 16 },
  profileChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.text },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  levelTag: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 10, color: Colors.gold,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  xpBarBg: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  xpBarFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 2 },
  xpText: { fontFamily: "Nunito_400Regular", fontSize: 9, color: Colors.textDim },
  coinsBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  coinsText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.gold },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mainTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 28, color: Colors.gold,
    letterSpacing: 3,
    textShadowColor: "rgba(212,175,55,0.35)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  tutorialBtn: { padding: 6 },
  sectionLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted,
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, marginTop: 4,
  },
  modesGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  modeCard: {
    width: "47.5%", borderRadius: 16, overflow: "hidden",
    borderWidth: 1.5, backgroundColor: Colors.surface,
  },
  modeCardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  modeGradient: { padding: 14, minHeight: 150, justifyContent: "space-between" },
  newBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: Colors.red, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
  },
  newBadgeText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, color: "#fff" },
  modeIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  modeName: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: Colors.text, marginBottom: 4 },
  modeDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted, lineHeight: 15, flex: 1 },
  modeFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  modeReward: { flexDirection: "row", alignItems: "center", gap: 3 },
  modeRewardText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  modeStats: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim },
  quickStats: { marginTop: 16 },
  statsRow: {
    flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14, alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold },
  statLbl: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  statDiv: { width: 1, height: 28, backgroundColor: Colors.border },
  modalBg: {
    flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end",
  },
  diffModal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  diffModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  diffModalTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold },
  diffModalSub: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, marginBottom: 16 },
  diffGrid: { flexDirection: "row", gap: 8, paddingBottom: 20 },
  diffOption: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12,
    padding: 12, alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  diffOptionPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  diffOptionName: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.text },
  diffOptionMult: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
});
