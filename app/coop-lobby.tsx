import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { useProfile } from "@/context/ProfileContext";
import { useGame } from "@/context/GameContext";
import { playButton, stopMusic, startGameMusic } from "@/lib/audioManager";
import { CPU_PROFILES, type CpuProfile } from "@/lib/cpuProfiles";

const AVATAR_COLORS = ["#E74C3C","#9B59B6","#E67E22","#2ECC71","#1A8FC1","#D4AF37","#C0392B","#27AE60","#8E44AD","#F39C12"];

function pickLocalCpus(count: number, playerLevel: number): CpuProfile[] {
  const range = 20;
  let candidates = CPU_PROFILES.filter(p => Math.abs(p.level - playerLevel) <= range);
  if (candidates.length < count) candidates = CPU_PROFILES;
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface LobbySlot {
  name: string;
  avatarIcon: string;
  avatarColor: string;
  level: number;
  winRate: number;
  isMe?: boolean;
  joined: boolean;
}

function SlotCard({ slot, accentColor }: { slot: LobbySlot | null; accentColor: string }) {
  const T = useT();

  if (!slot) {
    return (
      <View style={[styles.slotCard, styles.slotEmpty, { borderColor: accentColor + "44" }]}>
        <Ionicons name="person-add-outline" size={28} color={accentColor + "88"} />
        <Text style={[styles.slotEmptyLabel, { color: accentColor + "66" }]}>{T("searching") || "Buscando..."}</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.slotCard, { borderColor: slot.joined ? accentColor + "88" : accentColor + "44" }]}>
      <LinearGradient
        colors={[accentColor + "22", accentColor + "08"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.slotAvatar, { backgroundColor: slot.avatarColor + "33", borderColor: slot.avatarColor }]}>
        <Ionicons name={slot.avatarIcon as any} size={24} color={slot.avatarColor} />
        {slot.isMe && (
          <View style={styles.meTag}>
            <Text style={styles.meTxt}>TÚ</Text>
          </View>
        )}
      </View>
      <Text style={styles.slotName} numberOfLines={1}>{slot.name}</Text>
      <Text style={styles.slotLevel}>Nv. {slot.level}</Text>
      <Text style={[styles.slotWr, { color: accentColor }]}>{slot.winRate}% WR</Text>
      {!slot.joined && (
        <View style={styles.joiningBadge}>
          <Text style={styles.joiningTxt}>{T("searching") || "Conectando..."}</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function CoopLobbyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { profile, level } = useProfile();
  const { startGame } = useGame();
  const T = useT();

  const TEAM_COLOR = "#27AE60";
  const RIVAL_COLOR = "#E74C3C";

  const [phase, setPhase] = useState<"joining" | "ready" | "countdown">("joining");
  const [countdownVal, setCountdownVal] = useState(3);
  const [cpus] = useState(() => pickLocalCpus(3, level || 1));

  const mySlot: LobbySlot = {
    name: profile.name || "Tú",
    avatarIcon: "person",
    avatarColor: AVATAR_COLORS[0],
    level: level || 1,
    winRate: Math.min(88, 40 + (level || 1)),
    isMe: true,
    joined: true,
  };

  const [partner, setPartner] = useState<LobbySlot | null>(null);
  const [rival1, setRival1] = useState<LobbySlot | null>(null);
  const [rival2, setRival2] = useState<LobbySlot | null>(null);

  useEffect(() => {
    const makeSlot = (cpu: CpuProfile, joined: boolean): LobbySlot => ({
      name: cpu.name,
      avatarIcon: cpu.avatarIcon || "person",
      avatarColor: cpu.avatarColor || AVATAR_COLORS[1],
      level: cpu.level,
      winRate: Math.min(88, 35 + cpu.level),
      joined,
    });

    const t1 = setTimeout(() => setPartner(makeSlot(cpus[0], false)), 600);
    const t2 = setTimeout(() => setPartner(prev => prev ? { ...prev, joined: true } : prev), 1800);
    const t3 = setTimeout(() => setRival1(makeSlot(cpus[1], false)), 1200);
    const t4 = setTimeout(() => setRival1(prev => prev ? { ...prev, joined: true } : prev), 2400);
    const t5 = setTimeout(() => setRival2(makeSlot(cpus[2], false)), 1800);
    const t6 = setTimeout(() => {
      setRival2(prev => prev ? { ...prev, joined: true } : prev);
      setPhase("ready");
    }, 3200);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  const handleStart = useCallback(async () => {
    await playButton().catch(() => {});
    setPhase("countdown");
    let c = 3;
    setCountdownVal(c);
    const iv = setInterval(() => {
      c--;
      setCountdownVal(c);
      if (c <= 0) {
        clearInterval(iv);
        stopMusic().catch(() => {});
        startGameMusic().catch(() => {});
        startGame("coop", "normal");
        router.replace("/game");
      }
    }, 1000);
  }, [startGame]);

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={["#041008", "#061510", "#041008"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>COOPERATIVO</Text>
          <Text style={styles.headerSub}>2 vs 2</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {phase === "joining" ? (T("searching") || "Buscando compañero y rivales...") :
         phase === "countdown" ? `Iniciando en ${countdownVal}...` :
         "¡Equipo listo para combatir!"}
      </Text>

      {/* Teams layout */}
      <View style={styles.teamsRow}>
        {/* Team 1 */}
        <View style={styles.teamColumn}>
          <View style={[styles.teamBadge, { borderColor: TEAM_COLOR + "88", backgroundColor: TEAM_COLOR + "15" }]}>
            <Ionicons name="shield-checkmark" size={14} color={TEAM_COLOR} />
            <Text style={[styles.teamLabel, { color: TEAM_COLOR }]}>EQUIPO 1</Text>
          </View>
          <SlotCard slot={mySlot} accentColor={TEAM_COLOR} />
          <SlotCard slot={partner} accentColor={TEAM_COLOR} />
          <View style={styles.teamDesc}>
            <Text style={styles.teamDescTxt}>Turno: <Text style={{ color: TEAM_COLOR }}>1ro y 2do</Text></Text>
          </View>
        </View>

        {/* VS */}
        <View style={styles.vsColumn}>
          <View style={styles.vsCircle}>
            <Text style={styles.vsTxt}>VS</Text>
          </View>
          <View style={styles.vsSeparator} />
        </View>

        {/* Team 2 */}
        <View style={styles.teamColumn}>
          <View style={[styles.teamBadge, { borderColor: RIVAL_COLOR + "88", backgroundColor: RIVAL_COLOR + "15" }]}>
            <Ionicons name="skull" size={14} color={RIVAL_COLOR} />
            <Text style={[styles.teamLabel, { color: RIVAL_COLOR }]}>RIVALES</Text>
          </View>
          <SlotCard slot={rival1} accentColor={RIVAL_COLOR} />
          <SlotCard slot={rival2} accentColor={RIVAL_COLOR} />
          <View style={styles.teamDesc}>
            <Text style={styles.teamDescTxt}>Turno: <Text style={{ color: RIVAL_COLOR }}>3ro y 4to</Text></Text>
          </View>
        </View>
      </View>

      {/* Turn order strip */}
      <Animated.View entering={FadeInDown.delay(3400).duration(400)} style={styles.turnStrip}>
        <Text style={styles.turnStripTitle}>ORDEN DE TURNOS</Text>
        <View style={styles.turnRow}>
          {[
            { label: "Tú", color: TEAM_COLOR },
            { label: partner?.name?.split(" ")[0] ?? "Comp.", color: TEAM_COLOR },
            { label: rival1?.name?.split(" ")[0] ?? "Rival 1", color: RIVAL_COLOR },
            { label: rival2?.name?.split(" ")[0] ?? "Rival 2", color: RIVAL_COLOR },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <View style={styles.turnItem}>
                <View style={[styles.turnBadge, { backgroundColor: item.color + "22", borderColor: item.color + "66" }]}>
                  <Text style={[styles.turnNum, { color: item.color }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.turnName, { color: item.color }]} numberOfLines={1}>{item.label}</Text>
              </View>
              {i < 3 && <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      {/* Shared deck info */}
      <Animated.View entering={FadeInDown.delay(3600).duration(400)} style={styles.infoStrip}>
        <Ionicons name="layers" size={16} color={Colors.gold} />
        <Text style={styles.infoTxt}>Cada equipo comparte su baraja de 8 cartas</Text>
      </Animated.View>

      {/* Start button */}
      {phase === "ready" && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.startWrap}>
          <Pressable onPress={handleStart} style={styles.startBtn}>
            <LinearGradient
              colors={[TEAM_COLOR, "#1a7a40"]}
              style={styles.startGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play" size={22} color="#fff" />
              <Text style={styles.startTxt}>INICIAR PARTIDA</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      {phase === "countdown" && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.countdownWrap}>
          <Text style={styles.countdownNum}>{countdownVal}</Text>
          <Text style={styles.countdownLabel}>COMENZANDO...</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center",
  },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 18,
    color: Colors.gold, letterSpacing: 2,
  },
  headerSub: {
    fontFamily: "Nunito_700Bold", fontSize: 12,
    color: "rgba(255,255,255,0.5)", letterSpacing: 3,
  },
  subtitle: {
    fontFamily: "Nunito_700Bold", fontSize: 13,
    color: "rgba(255,255,255,0.55)", textAlign: "center",
    marginBottom: 16, paddingHorizontal: 24,
  },
  teamsRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 12, gap: 4, flex: 1,
  },
  teamColumn: { flex: 1, alignItems: "center", gap: 10 },
  teamBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1,
  },
  teamLabel: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 11, letterSpacing: 1,
  },
  slotCard: {
    width: "100%", borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", paddingVertical: 12, paddingHorizontal: 8,
    overflow: "hidden", gap: 4, minHeight: 110,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  slotEmpty: {
    justifyContent: "center", borderStyle: "dashed",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  slotEmptyLabel: {
    fontFamily: "Nunito_600SemiBold", fontSize: 10, textAlign: "center",
  },
  slotAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, position: "relative",
  },
  meTag: {
    position: "absolute", bottom: -2, right: -2,
    backgroundColor: Colors.gold, borderRadius: 4,
    paddingHorizontal: 3, paddingVertical: 1,
  },
  meTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 7, color: "#000" },
  slotName: {
    fontFamily: "Nunito_700Bold", fontSize: 12,
    color: "#fff", textAlign: "center",
  },
  slotLevel: {
    fontFamily: "Nunito_600SemiBold", fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  slotWr: {
    fontFamily: "Nunito_700Bold", fontSize: 11,
  },
  joiningBadge: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  joiningTxt: {
    fontFamily: "Nunito_600SemiBold", fontSize: 9,
    color: "rgba(255,255,255,0.6)",
  },
  teamDesc: { marginTop: 4 },
  teamDescTxt: {
    fontFamily: "Nunito_600SemiBold", fontSize: 10,
    color: "rgba(255,255,255,0.45)", textAlign: "center",
  },
  vsColumn: { width: 36, alignItems: "center", justifyContent: "center", paddingTop: 36 },
  vsCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  vsTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 11, color: "#fff" },
  vsSeparator: {
    width: 1, flex: 1, backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 8,
  },
  turnStrip: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  turnStripTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 10,
    color: "rgba(255,255,255,0.4)", letterSpacing: 2,
    textAlign: "center", marginBottom: 8,
  },
  turnRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  turnItem: { alignItems: "center", gap: 3 },
  turnBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  turnNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 13 },
  turnName: { fontFamily: "Nunito_700Bold", fontSize: 9, maxWidth: 50, textAlign: "center" },
  infoStrip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: Colors.gold + "15", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.gold + "33",
  },
  infoTxt: {
    fontFamily: "Nunito_600SemiBold", fontSize: 12,
    color: "rgba(255,255,255,0.7)", flex: 1,
  },
  startWrap: { padding: 16, paddingTop: 12 },
  startBtn: { borderRadius: 16, overflow: "hidden" },
  startGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16,
  },
  startTxt: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: "#fff", letterSpacing: 1 },
  countdownWrap: { alignItems: "center", padding: 16, paddingTop: 12 },
  countdownNum: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 64,
    color: Colors.gold,
  },
  countdownLabel: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 14,
    color: "rgba(255,255,255,0.6)", letterSpacing: 3,
  },
});
