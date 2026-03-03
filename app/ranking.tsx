import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/context/ProfileContext";
import { useT } from "@/hooks/useT";
import { CPU_PROFILES } from "@/lib/cpuProfiles";

type Period = "alltime" | "weekly" | "monthly";

interface RankEntry {
  rank: number;
  name: string;
  level: number;
  score: number;
  wins: number;
  country: string;
  avatarIcon: string;
  avatarColor: string;
  isPlayer?: boolean;
}

const COUNTRIES = [
  "MX","AR","BR","CO","CL","PE","VE","EC","BO","PY","UY","GT","HN","SV","CR","PA","CU","DO","ES","US"
];

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildLeaderboard(
  playerName: string,
  playerLevel: number,
  playerWins: number,
  period: Period
): RankEntry[] {
  const profiles = CPU_PROFILES.slice(0, 99);
  const multiplier = period === "alltime" ? 1 : period === "monthly" ? 0.12 : 0.03;
  const entries: RankEntry[] = profiles.map((p, i) => {
    const seed = i * 13 + (period === "weekly" ? 7777 : period === "monthly" ? 3333 : 1111);
    const baseWins = Math.floor(p.level * 18 * (1 + seededRand(seed) * 2));
    const wins = Math.max(1, Math.floor(baseWins * multiplier));
    return {
      rank: 0,
      name: p.name,
      level: p.level,
      score: wins * 10 + Math.floor(seededRand(seed + 1) * 1000),
      wins,
      country: COUNTRIES[Math.floor(seededRand(seed + 2) * COUNTRIES.length)],
      avatarIcon: p.avatarIcon,
      avatarColor: p.avatarColor,
    };
  });

  const playerWinsAdjusted = Math.max(0, Math.floor(playerWins * multiplier));
  const playerEntry: RankEntry = {
    rank: 0,
    name: playerName,
    level: playerLevel,
    score: playerWinsAdjusted * 10,
    wins: playerWinsAdjusted,
    country: "MX",
    avatarIcon: "person",
    avatarColor: Colors.gold,
    isPlayer: true,
  };

  const all = [...entries, playerEntry].sort((a, b) => b.score - a.score);
  return all.map((e, i) => ({ ...e, rank: i + 1 }));
}

function RankRow({ entry, theme }: { entry: RankEntry; theme: any }) {
  const isTop3 = entry.rank <= 3;
  const medalColors = ["#D4AF37", "#C0C0C0", "#CD7F32"];
  const bgColor = entry.isPlayer
    ? Colors.gold + "18"
    : isTop3
    ? medalColors[entry.rank - 1] + "10"
    : "transparent";
  const borderColor = entry.isPlayer
    ? Colors.gold + "44"
    : "transparent";

  return (
    <View style={[styles.row, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.rankCol}>
        {isTop3 ? (
          <Ionicons
            name={entry.rank === 1 ? "trophy" : "medal"}
            size={18}
            color={medalColors[entry.rank - 1]}
          />
        ) : (
          <Text style={[styles.rankNum, { color: entry.isPlayer ? Colors.gold : theme.textMuted }]}>
            {entry.rank}
          </Text>
        )}
      </View>
      <View style={[styles.avatarDot, { backgroundColor: entry.avatarColor + "33", borderColor: entry.avatarColor + "66" }]}>
        <Ionicons name={entry.avatarIcon as any} size={14} color={entry.avatarColor} />
      </View>
      <View style={styles.nameCol}>
        <Text style={[styles.entryName, { color: entry.isPlayer ? Colors.gold : theme.text }]} numberOfLines={1}>
          {entry.name}
          {entry.isPlayer ? " ★" : ""}
        </Text>
        <Text style={[styles.entryCountry, { color: theme.textMuted }]}>
          Lv.{entry.level} · {entry.country}
        </Text>
      </View>
      <View style={styles.scoreCol}>
        <Text style={[styles.entryWins, { color: entry.isPlayer ? Colors.gold : theme.text }]}>
          {entry.wins.toLocaleString()}
        </Text>
        <Text style={[styles.entryWinsLabel, { color: theme.textMuted }]}>V</Text>
      </View>
    </View>
  );
}

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const { profile, level } = useProfile();
  const T = useT();
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>("alltime");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isDark = theme.isDark;

  const leaderboard = useMemo(() => buildLeaderboard(
    profile.name,
    level,
    profile.stats.totalWins,
    period,
  ), [profile.name, level, profile.stats.totalWins, period]);

  const playerEntry = leaderboard.find((e) => e.isPlayer);

  const bgGrad: [string, string] = isDark
    ? ["#041008", "#0a1a0f"]
    : ["#d4edd0", "#e8f5e2"];

  const PERIODS: { id: Period; label: string }[] = [
    { id: "alltime", label: T("allTime") },
    { id: "monthly", label: T("monthly") },
    { id: "weekly", label: T("weekly") },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={bgGrad} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.gold} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.gold }]}>{T("worldRanking")}</Text>
          {playerEntry && (
            <Text style={[styles.myRankText, { color: theme.textMuted }]}>
              {T("myRank")}: #{playerEntry.rank}
            </Text>
          )}
        </View>
        <View style={[styles.trophyWrap, { backgroundColor: Colors.gold + "18" }]}>
          <Ionicons name="trophy" size={22} color={Colors.gold} />
        </View>
      </View>

      {/* Period tabs */}
      <View style={styles.tabRow}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setPeriod(p.id)}
            style={[
              styles.tabBtn,
              { borderColor: period === p.id ? theme.gold : theme.border, backgroundColor: period === p.id ? theme.gold + "22" : "transparent" },
            ]}
          >
            <Text style={[styles.tabText, { color: period === p.id ? theme.gold : theme.textMuted }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Column headers */}
      <View style={[styles.colHeaders, { borderBottomColor: theme.border }]}>
        <Text style={[styles.colLabel, { width: 40 }]}>#</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>{T("player")}</Text>
        <Text style={[styles.colLabel, { width: 56, textAlign: "right" }]}>{T("rankWins")}</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(e) => `${e.rank}-${e.name}`}
        renderItem={({ item }) => <RankRow entry={item} theme={theme} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        initialScrollIndex={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#041008" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  title: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold, letterSpacing: 3,
  },
  myRankText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  trophyWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
    alignItems: "center",
  },
  tabText: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  colHeaders: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 6,
    borderBottomWidth: 1,
  },
  colLabel: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textDim, letterSpacing: 1 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, marginHorizontal: 0,
  },
  rankCol: { width: 30, alignItems: "center" },
  rankNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 14 },
  avatarDot: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  nameCol: { flex: 1 },
  entryName: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  entryCountry: { fontFamily: "Nunito_400Regular", fontSize: 10, marginTop: 1 },
  scoreCol: { flexDirection: "row", alignItems: "baseline", gap: 2, minWidth: 50, justifyContent: "flex-end" },
  entryWins: { fontFamily: "Nunito_900ExtraBold", fontSize: 15 },
  entryWinsLabel: { fontFamily: "Nunito_700Bold", fontSize: 10 },
});
