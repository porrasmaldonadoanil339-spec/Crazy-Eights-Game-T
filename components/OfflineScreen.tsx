import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, Animated, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "@/context/NetworkContext";
import { useProfile } from "@/context/ProfileContext";

const MSGS = {
  title: {
    es: "Sin conexión",
    en: "No connection",
    pt: "Sem conexão",
  },
  body: {
    es: "Se necesita conexión a Internet para jugar.\nActiva tu Wi-Fi o datos móviles.",
    en: "Internet connection is required to play.\nEnable your Wi-Fi or mobile data.",
    pt: "É necessária conexão com a Internet para jogar.\nAtive o Wi-Fi ou os dados móveis.",
  },
  retry: {
    es: "Reintentar",
    en: "Try again",
    pt: "Tentar novamente",
  },
  checking: {
    es: "Verificando conexión…",
    en: "Checking connection…",
    pt: "Verificando conexão…",
  },
};

export function OfflineScreen() {
  const { recheckNow, isChecking } = useNetwork();
  const { profile } = useProfile();
  const lang = (profile?.language ?? "es") as "es" | "en" | "pt";
  const insets = useSafeAreaInsets();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 120 }),
    ]).start();

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ])
    );
    shakeLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => { shakeLoop.stop(); pulseLoop.stop(); };
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <LinearGradient
      colors={["#010804", "#020f08", "#010804"]}
      style={[styles.root, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 20 }]}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: cardAnim }] }]}>
        <LinearGradient
          colors={["#0d2018", "#081510", "#0a1a12"]}
          style={styles.cardInner}
        >
          <LinearGradient
            colors={["#D4AF3733", "#D4AF3700"]}
            style={styles.cardTopGlow}
          />

          <View style={styles.logoRow}>
            <Text style={styles.logoText}>OCHO LOCOS</Text>
          </View>

          <Animated.View style={[styles.iconWrap, { transform: [{ translateX: shakeAnim }, { scale: pulseAnim }] }]}>
            <LinearGradient
              colors={["#1a0808", "#2a0a0a"]}
              style={styles.iconBg}
            >
              <Ionicons name="wifi-outline" size={52} color="#C0392B" style={{ opacity: 0.85 }} />
              <View style={styles.slashWrap}>
                <View style={styles.slash} />
              </View>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>{MSGS.title[lang]}</Text>
          <Text style={styles.body}>{MSGS.body[lang]}</Text>

          <View style={styles.divider} />

          <View style={styles.hintsRow}>
            <HintChip icon="wifi" label={lang === "es" ? "Wi-Fi" : "Wi-Fi"} />
            <HintChip icon="cellular" label={lang === "es" ? "Datos móviles" : lang === "pt" ? "Dados móveis" : "Mobile data"} />
          </View>

          <Pressable
            onPress={recheckNow}
            disabled={isChecking}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.8 }, isChecking && { opacity: 0.6 }]}
          >
            <LinearGradient colors={["#D4AF37", "#A07800"]} style={styles.retryGrad}>
              {isChecking ? (
                <>
                  <Animated.View style={{ transform: [{ rotate: "45deg" }] }}>
                    <Ionicons name="sync" size={18} color="#010804" />
                  </Animated.View>
                  <Text style={styles.retryText}>{MSGS.checking[lang]}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="#010804" />
                  <Text style={styles.retryText}>{MSGS.retry[lang]}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.footer}>
        {lang === "es" ? "Activa tu conexión para continuar" : lang === "pt" ? "Ative sua conexão para continuar" : "Enable your connection to continue"}
      </Text>
    </LinearGradient>
  );
}

function HintChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon as any} size={13} color="#D4AF37" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  card: {
    width: "88%",
    maxWidth: 360,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  cardInner: {
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  cardTopGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  logoRow: {
    marginBottom: 4,
  },
  logoText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 20,
    color: "#D4AF37",
    letterSpacing: 3,
  },
  iconWrap: {
    marginVertical: 8,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#C0392B44",
  },
  slashWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  slash: {
    position: "absolute",
    width: 68,
    height: 2.5,
    backgroundColor: "#C0392B",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
  title: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 22,
    color: "#EEE8D5",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  body: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "rgba(238,232,213,0.55)",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(212,175,55,0.15)",
    marginVertical: 4,
  },
  hintsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  chipText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "rgba(212,175,55,0.8)",
  },
  retryBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  retryGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryText: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 15,
    color: "#010804",
    letterSpacing: 0.5,
  },
  footer: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "rgba(238,232,213,0.2)",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
