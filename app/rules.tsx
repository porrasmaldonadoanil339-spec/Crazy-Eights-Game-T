import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface Rule {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}

const RULES: Rule[] = [
  {
    icon: "shuffle",
    title: "Objetivo",
    desc: "Ser el primero en quedarse sin cartas en la mano.",
  },
  {
    icon: "layers",
    title: "Repartir",
    desc: "Cada jugador recibe 7 cartas. Se voltea una carta para iniciar la pila de descarte.",
  },
  {
    icon: "play-circle",
    title: "Jugar",
    desc: "Juega una carta que coincida en PALO o en NÚMERO con la carta en la cima de la pila.",
  },
  {
    icon: "star",
    title: "Los 8 — Locos",
    desc: "Los 8 son comodines. Puedes jugarlos en cualquier momento y elegir el palo que quieras.",
  },
  {
    icon: "add-circle",
    title: "Robar carta",
    desc: "Si no puedes jugar ninguna carta, debes robar una del mazo.",
  },
  {
    icon: "sync",
    title: "Sin cartas en mazo",
    desc: "Si el mazo se agota, se barajan las cartas descartadas (excepto la carta superior) para formar un nuevo mazo.",
  },
  {
    icon: "trophy",
    title: "Victoria",
    desc: "Gana el jugador que se quede sin cartas primero. ¡Juega tus 8 estratégicamente!",
  },
];

export default function RulesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

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
        <Text style={styles.headerTitle}>REGLAS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.suitRow}>
            <Text style={[styles.introSuit, { color: Colors.red }]}>♥</Text>
            <Text style={[styles.introSuit, { color: "#111" }]}>♠</Text>
            <Text style={[styles.introSuit, { color: Colors.red }]}>♦</Text>
            <Text style={[styles.introSuit, { color: "#111" }]}>♣</Text>
          </View>
          <Text style={styles.introTitle}>Ocho Locos</Text>
          <Text style={styles.introSub}>Crazy Eights — Juego de cartas clásico</Text>
        </View>

        {RULES.map((rule, i) => (
          <View key={i} style={styles.ruleCard}>
            <View style={styles.ruleIconWrap}>
              <Ionicons name={rule.icon} size={22} color={Colors.gold} />
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDesc}>{rule.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={18} color={Colors.gold} />
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Consejo: </Text>
            Guarda tus 8 para momentos clave. Son tus mejores armas cuando el CPU tiene pocas cartas.
          </Text>
        </View>
      </ScrollView>
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
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: Colors.gold,
    letterSpacing: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  intro: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  suitRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  introSuit: {
    fontSize: 28,
    fontWeight: "900",
  },
  introTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 28,
    color: Colors.gold,
    letterSpacing: 2,
  },
  introSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  ruleCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  ruleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    flexShrink: 0,
  },
  ruleContent: {
    flex: 1,
    gap: 4,
  },
  ruleTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: Colors.gold,
  },
  ruleDesc: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "rgba(212,175,55,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 16,
    gap: 10,
    alignItems: "flex-start",
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  tipBold: {
    fontFamily: "Nunito_700Bold",
    color: Colors.gold,
  },
});
