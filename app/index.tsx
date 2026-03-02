import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useGame } from "@/context/GameContext";

function FloatingCard({ rank, suit, delay, x, y, rotate }: { rank: string; suit: string; delay: number; x: number; y: number; rotate: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(withTiming(0.18, { duration: 2000 }), withTiming(0.06, { duration: 2000 })),
        -1,
        true
      );
      translateY.value = withRepeat(
        withSequence(withTiming(-12, { duration: 3000 }), withTiming(0, { duration: 3000 })),
        -1,
        true
      );
    }, delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const color = suit === "♥" || suit === "♦" ? Colors.red : "#111";

  return (
    <Animated.View style={[styles.floatCard, { left: x, top: y, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <View style={styles.floatCardInner}>
        <Text style={[styles.floatRank, { color }]}>{rank}</Text>
        <Text style={[styles.floatSuit, { color }]}>{suit}</Text>
      </View>
    </Animated.View>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { stats, loadStats, startGame } = useGame();

  const titleScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    loadStats();
    titleOpacity.value = withTiming(1, { duration: 600 });
    titleScale.value = withSpring(1, { damping: 12 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const handlePlay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    btnScale.value = withSequence(withSpring(0.94), withSpring(1));
    startGame();
    router.push("/game");
  };

  const handleRules = async () => {
    await Haptics.selectionAsync();
    router.push("/rules");
  };

  const FLOAT_CARDS = [
    { rank: "8", suit: "♠", x: 20, y: 80, rotate: -15, delay: 0 },
    { rank: "A", suit: "♥", x: 300, y: 120, rotate: 20, delay: 500 },
    { rank: "K", suit: "♦", x: 60, y: 600, rotate: -8, delay: 800 },
    { rank: "Q", suit: "♣", x: 290, y: 550, rotate: 12, delay: 300 },
    { rank: "J", suit: "♥", x: 15, y: 350, rotate: -20, delay: 1000 },
    { rank: "8", suit: "♦", x: 310, y: 350, rotate: 25, delay: 600 },
  ];

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient
        colors={["#061209", "#0a1a0f", "#0d2418"]}
        style={StyleSheet.absoluteFill}
      />

      {FLOAT_CARDS.map((c, i) => (
        <FloatingCard key={i} {...c} />
      ))}

      <Animated.View style={[styles.titleSection, titleStyle]}>
        <View style={styles.logoRow}>
          <View style={styles.suitRow}>
            <Text style={[styles.suitDecor, { color: Colors.red }]}>♥</Text>
            <Text style={[styles.suitDecor, { color: "#111" }]}>♠</Text>
          </View>
          <Text style={styles.mainTitle}>OCHO{"\n"}LOCOS</Text>
          <View style={styles.suitRow}>
            <Text style={[styles.suitDecor, { color: Colors.red }]}>♦</Text>
            <Text style={[styles.suitDecor, { color: "#111" }]}>♣</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Crazy Eights · Card Game</Text>
      </Animated.View>

      {stats.gamesPlayed > 0 && (
        <View style={styles.statsRow}>
          <StatBadge label="Victorias" value={stats.wins} />
          <View style={styles.statDivider} />
          <StatBadge label="Derrotas" value={stats.losses} />
          <View style={styles.statDivider} />
          <StatBadge label="Partidas" value={stats.gamesPlayed} />
        </View>
      )}

      <View style={styles.menuSection}>
        <Pressable onPress={handlePlay} style={({ pressed }) => pressed ? styles.playBtnPressed : styles.playBtn}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.gold, "#A8850A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playGradient}
          >
            <MaterialCommunityIcons name="cards-playing-outline" size={28} color="#1a0a00" />
            <Text style={styles.playText}>JUGAR</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={handleRules}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}
        >
          <Ionicons name="book-outline" size={20} color={Colors.gold} />
          <Text style={styles.secondaryText}>Reglas del juego</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>v1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSection: {
    alignItems: "center",
    marginTop: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  suitRow: {
    gap: 4,
    alignItems: "center",
  },
  suitDecor: {
    fontSize: 28,
    fontFamily: "Nunito_900ExtraBold",
    opacity: 0.9,
  },
  mainTitle: {
    fontSize: 52,
    fontFamily: "Nunito_900ExtraBold",
    color: Colors.gold,
    textAlign: "center",
    letterSpacing: 4,
    lineHeight: 56,
    textShadowColor: "rgba(212,175,55,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  divider: {
    width: 120,
    height: 1.5,
    backgroundColor: Colors.gold,
    marginVertical: 12,
    opacity: 0.5,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    gap: 16,
  },
  statBadge: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 24,
    color: Colors.gold,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  menuSection: {
    width: "100%",
    paddingHorizontal: 32,
    gap: 14,
    marginBottom: 20,
  },
  playBtn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  playBtnPressed: {
    borderRadius: 18,
    overflow: "hidden",
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  playGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  playText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 22,
    color: "#1a0a00",
    letterSpacing: 4,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  secondaryPressed: {
    opacity: 0.75,
  },
  secondaryText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: Colors.gold,
  },
  floatCard: {
    position: "absolute",
    width: 48,
    height: 68,
    borderRadius: 6,
  },
  floatCardInner: {
    flex: 1,
    backgroundColor: "#F8F5EE",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  floatRank: {
    fontSize: 16,
    fontWeight: "900",
  },
  floatSuit: {
    fontSize: 18,
  },
  version: {
    position: "absolute",
    bottom: 16,
    right: 20,
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.textDim,
  },
});
