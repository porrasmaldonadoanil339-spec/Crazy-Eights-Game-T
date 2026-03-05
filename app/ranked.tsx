import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { useProfile } from "@/context/ProfileContext";
import { getRankInfo, RANKS, RANK_COLORS } from "@/lib/ranked";
import { getRandomCpuProfile } from "@/lib/cpuProfiles";

const { width } = Dimensions.get("window");

export default function RankedScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const T = useT();
  const isDark = profile.darkMode !== false;
  const themeColors = isDark ? Colors : LightColors;
  const rankInfo = useMemo(() => getRankInfo(profile.rankedProfile), [profile.rankedProfile]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Simulate top 20 global ranking with CPU profiles
  const globalRanking = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const cpu = getRandomCpuProfile(i + 100);
      const rankIdx = Math.max(0, 11 - Math.floor(i / 2));
      const divisionIdx = 4 - (i % 5);
      return {
        id: `global_${i}`,
        name: cpu.name,
        avatarIcon: cpu.avatarIcon,
        avatarColor: cpu.avatarColor,
        rank: rankIdx,
        division: divisionIdx,
        stars: 3,
        level: cpu.level,
      };
    });
  }, []);

  const renderStars = (current: number, max: number) => {
    return (
      <View style={styles.starsRow}>
        {Array.from({ length: max }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < current ? "star" : "star-outline"}
            size={24}
            color={i < current ? rankInfo.color : themeColors.textDim}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={isDark ? ["#1a1a2e", "#0f0f1a"] : ["#f0f0f5", "#e6e6f0"]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: botPad + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Back */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{T("rankedMode")}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Current Rank Card */}
        <View style={[styles.rankCard, { backgroundColor: themeColors.card, borderColor: rankInfo.color + "44" }]}>
          <LinearGradient
            colors={[rankInfo.color + "22", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.rankIconBadge, { backgroundColor: rankInfo.color + "33" }]}>
            <Ionicons name="trophy" size={64} color={rankInfo.color} />
          </View>
          <Text style={[styles.rankName, { color: rankInfo.color }]}>
            {T(`rank${RANKS[profile.rankedProfile.rank]}` as any) || rankInfo.rankName} {profile.rankedProfile.division + 1}
          </Text>
          {renderStars(profile.rankedProfile.stars, profile.rankedProfile.maxStars)}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.text }]}>{profile.rankedProfile.totalWins}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>{T("wins").toUpperCase()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.text }]}>{profile.rankedProfile.totalLosses}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>{T("losses").toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Global Ranking Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{T("globalRanking")}</Text>
          {globalRanking.map((item, index) => (
            <View key={item.id} style={[styles.rankingItem, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.rankNumber, { color: index < 3 ? Colors.gold : themeColors.textMuted }]}>
                #{index + 1}
              </Text>
              <View style={[styles.avatarSmall, { backgroundColor: item.avatarColor }]}>
                <Ionicons name={item.avatarIcon as any} size={14} color="#fff" />
              </View>
              <View style={styles.rankingInfo}>
                <Text style={[styles.rankingName, { color: themeColors.text }]}>{item.name}</Text>
                <Text style={[styles.rankingMeta, { color: themeColors.textMuted }]}>
                  {T(`rank${RANKS[item.rank]}` as any)} {item.division + 1}
                </Text>
              </View>
              <Ionicons name="trophy" size={16} color={RANK_COLORS[item.rank]} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Play Button Fixed Bottom */}
      <View style={[styles.footer, { paddingBottom: botPad + 20, backgroundColor: themeColors.background + "ee" }]}>
        <Pressable
          onPress={() => router.push({ pathname: "/game-online", params: { mode: "ranked" } })}
          style={({ pressed }) => [
            styles.playBtn,
            { backgroundColor: rankInfo.color },
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
          ]}
        >
          <Ionicons name="play" size={24} color="#000" />
          <Text style={styles.playBtnText}>{T("playRanked")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 24 },
  rankCard: {
    marginHorizontal: 16, borderRadius: 24, padding: 24,
    alignItems: "center", borderWidth: 1, overflow: "hidden",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  rankIconBadge: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  rankName: { fontFamily: "Nunito_900ExtraBold", fontSize: 28, marginBottom: 12 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  starIcon: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 32 },
  statItem: { alignItems: "center" },
  statValue: { fontFamily: "Nunito_900ExtraBold", fontSize: 20 },
  statLabel: { fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.1)" },
  section: { paddingHorizontal: 16, marginTop: 32 },
  sectionTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, marginBottom: 16 },
  rankingItem: {
    flexDirection: "row", alignItems: "center", padding: 12,
    borderRadius: 16, marginBottom: 8, gap: 12,
  },
  rankNumber: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, width: 30 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rankingInfo: { flex: 1 },
  rankingName: { fontFamily: "Nunito_700Bold", fontSize: 14 },
  rankingMeta: { fontFamily: "Nunito_400Regular", fontSize: 12 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
  },
  playBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 12, height: 60, borderRadius: 30,
    elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  playBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: "#000" },
});
