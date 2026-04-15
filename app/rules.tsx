import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RulesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const T = useT();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const RULES = useMemo(() => [
    {
      icon: "shuffle" as const,
      title: T("ruleGoalT" as any),
      desc: T("ruleGoalD" as any),
      detail: "Cada jugador empieza con cartas en mano. El turno pasa en orden. Cuando solo te quede una carta, debes decir '¡OCHO LOCOS!' antes de jugarla o recibirás penalización.",
    },
    {
      icon: "layers" as const,
      title: T("ruleDealT" as any),
      desc: T("ruleDealD" as any),
      detail: "El repartidor da las cartas una a una en sentido horario. La primera carta del mazo se coloca boca arriba para iniciar la pila de descarte. Si es un 8, se mezcla de vuelta.",
    },
    {
      icon: "play-circle" as const,
      title: T("rulePlayT" as any),
      desc: T("rulePlayD" as any),
      detail: "Debes jugar una carta que coincida en PALO (♠♥♦♣) o en NÚMERO con la carta superior de la pila. Los 8 son comodines y pueden jugarse en cualquier momento.",
    },
    {
      icon: "star" as const,
      title: T("ruleEightsT" as any),
      desc: T("ruleEightsD" as any),
      detail: "Al jugar un 8, elige el palo que deseas continuar. El rival debe jugar del palo que elegiste. Los Jokers obligan al rival a robar 5 cartas. Los 7 obligan al rival a robar 7 cartas (encadenables con otro 7 o Joker). Los 2 obligan a robar 2 cartas. Los 3 saltan el turno rival. Los 10 invierten el sentido.",
    },
    {
      icon: "add-circle" as const,
      title: T("ruleDrawT" as any),
      desc: T("ruleDrawD" as any),
      detail: "Si no tienes ninguna carta jugable, roba del mazo. Puedes jugar la carta que robaste si es válida. Solo robas una carta por turno (a menos que una carta especial te obligue a robar más).",
    },
    {
      icon: "sync" as const,
      title: T("ruleDeckT" as any),
      desc: T("ruleDeckD" as any),
      detail: "Cuando el mazo se agota, las cartas de la pila de descarte (excepto la carta superior) se barajan y forman un nuevo mazo. El juego continúa sin interrupción.",
    },
    {
      icon: "trophy" as const,
      title: T("ruleWinT" as any),
      desc: T("ruleWinD" as any),
      detail: "El primer jugador que se quede sin cartas gana la ronda. En modo Torneo, se juega al mejor de 3 rondas. En modo Clasificatoria, los puntos acumulan hacia el ranking.",
    },
  ], [T]);

  const toggle = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prev => prev === idx ? null : idx);
  };

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
        <Text style={styles.headerTitle}>{T("rules").toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {RULES.map((rule, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => toggle(idx)}
              style={({ pressed }) => [
                styles.ruleCard,
                isExpanded && styles.ruleCardExpanded,
                pressed && { opacity: 0.88 },
              ]}
            >
              <LinearGradient
                colors={isExpanded
                  ? ["rgba(212,175,55,0.08)", "rgba(212,175,55,0.04)"]
                  : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                style={styles.ruleGrad}
              >
                <View style={[styles.ruleIconWrap, isExpanded && styles.ruleIconWrapExpanded]}>
                  <Ionicons name={rule.icon} size={22} color={Colors.gold} />
                </View>
                <View style={styles.ruleText}>
                  <View style={styles.ruleTitleRow}>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={Colors.gold + "99"}
                    />
                  </View>
                  <Text style={styles.ruleDesc}>{rule.desc}</Text>
                  {isExpanded && (
                    <View style={styles.ruleDetailBox}>
                      <View style={styles.ruleDetailDivider} />
                      <Text style={styles.ruleDetail}>{rule.detail}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>OCHO LOCOS</Text>
          <Text style={styles.footerNoteSubtext}>{T("rulesTitle")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061209",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,175,55,0.2)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,175,55,0.1)",
  },
  headerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: Colors.gold,
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  ruleCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.12)",
  },
  ruleCardExpanded: {
    borderColor: "rgba(212,175,55,0.35)",
  },
  ruleGrad: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  ruleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ruleIconWrapExpanded: {
    backgroundColor: "rgba(212,175,55,0.22)",
    borderColor: "rgba(212,175,55,0.5)",
  },
  ruleText: {
    flex: 1,
    gap: 3,
  },
  ruleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ruleTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: Colors.gold,
    letterSpacing: 0.5,
    flex: 1,
  },
  ruleDesc: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  ruleDetailBox: {
    marginTop: 8,
  },
  ruleDetailDivider: {
    height: 1,
    backgroundColor: "rgba(212,175,55,0.2)",
    marginBottom: 8,
  },
  ruleDetail: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
    opacity: 0.85,
  },
  footerNote: {
    marginTop: 12,
    alignItems: "center",
    gap: 4,
  },
  footerNoteText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: Colors.gold,
    opacity: 0.4,
    letterSpacing: 3,
  },
  footerNoteSubtext: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    opacity: 0.5,
  },
});
