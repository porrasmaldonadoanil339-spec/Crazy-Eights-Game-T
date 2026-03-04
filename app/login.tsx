import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { useT } from "@/hooks/useT";
import { playSound } from "@/lib/sounds";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const T = useT();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";

  const comingSoon = () => {
    const msg = lang === "en"
      ? "This feature will be available in the full version of OCHO LOCOS. Stay tuned!"
      : lang === "pt"
      ? "Esta funcionalidade estará disponível na versão completa do OCHO LOCOS. Fique atento!"
      : "Esta función estará disponible en la versión completa de OCHO LOCOS. ¡Próximamente!";
    const title = lang === "en" ? "Coming Soon" : lang === "pt" ? "Em Breve" : "Próximamente";
    Alert.alert(title, msg, [{ text: "OK" }]);
  };

  const topPad = insets.top + 16;
  const botPad = insets.bottom + 24;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient
        colors={["#010804", "#030e08", "#041008", "#030e08", "#010804"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: topPad }]} hitSlop={10}>
        <Ionicons name="chevron-back" size={22} color={Colors.textMuted} />
      </Pressable>

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.suitRow}>
          <Text style={styles.suitRed}>♥</Text>
          <Text style={styles.suitBlack}>♠</Text>
          <Text style={styles.suitRed}>♦</Text>
          <Text style={styles.suitBlack}>♣</Text>
        </View>
        <Text style={styles.logoText}>OCHO LOCOS</Text>
        <Text style={styles.logoSub}>CRAZY EIGHTS · CASINO EDITION</Text>

        <View style={[styles.divider, { marginVertical: 24 }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerDiamond}>◆</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.subtitle}>
          {lang === "en"
            ? "Link your account to save your progress in the cloud and compete globally"
            : lang === "pt"
            ? "Vincule sua conta para salvar seu progresso na nuvem e competir globalmente"
            : "Vincula tu cuenta para guardar tu progreso en la nube y competir a nivel global"}
        </Text>
      </View>

      {/* Auth buttons */}
      <View style={styles.buttonsSection}>
        {/* Google */}
        <Pressable
          onPress={() => { playSound("button_press").catch(() => {}); comingSoon(); }}
          style={({ pressed }) => [styles.authBtn, styles.authBtnGoogle, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        >
          <View style={styles.authBtnIcon}>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
          </View>
          <Text style={styles.authBtnText}>
            {lang === "en" ? "Continue with Google" : lang === "pt" ? "Continuar com Google" : "Continuar con Google"}
          </Text>
        </Pressable>

        {/* Facebook */}
        <Pressable
          onPress={() => { playSound("button_press").catch(() => {}); comingSoon(); }}
          style={({ pressed }) => [styles.authBtn, styles.authBtnFacebook, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        >
          <View style={[styles.authBtnIcon, { backgroundColor: "#1877F2" }]}>
            <Ionicons name="logo-facebook" size={20} color="#fff" />
          </View>
          <Text style={styles.authBtnText}>
            {lang === "en" ? "Continue with Facebook" : lang === "pt" ? "Continuar com Facebook" : "Continuar con Facebook"}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>{lang === "en" ? "OR" : lang === "pt" ? "OU" : "O"}</Text>
          <View style={styles.orLine} />
        </View>

        {/* Play without account */}
        <Pressable
          onPress={() => { playSound("button_press").catch(() => {}); router.replace("/(tabs)"); }}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.skipBtnText}>
            {lang === "en" ? "Play without account" : lang === "pt" ? "Jogar sem conta" : "Jugar sin cuenta"}
          </Text>
        </Pressable>
      </View>

      {/* Privacy note */}
      <Text style={styles.privacyNote}>
        {lang === "en"
          ? "By linking an account you agree to our Terms and Privacy Policy"
          : lang === "pt"
          ? "Ao vincular uma conta você concorda com nossos Termos e Política de Privacidade"
          : "Al vincular una cuenta aceptas nuestros Términos y Política de Privacidad"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24,
  },
  backBtn: {
    position: "absolute", left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  logoSection: {
    alignItems: "center", marginTop: 32,
  },
  suitRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  suitRed: { fontSize: 22, color: "#C0392B", opacity: 0.6 },
  suitBlack: { fontSize: 22, color: "#ffffff", opacity: 0.4 },
  logoText: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 34, color: Colors.gold,
    letterSpacing: 5, textAlign: "center",
  },
  logoSub: {
    fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim,
    letterSpacing: 3, marginTop: 4,
  },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(212,175,55,0.2)" },
  dividerDiamond: { fontSize: 12, color: Colors.gold + "80" },
  subtitle: {
    fontFamily: "Nunito_400Regular", fontSize: 14, color: Colors.textMuted,
    textAlign: "center", lineHeight: 20, paddingHorizontal: 8,
  },
  buttonsSection: {
    width: "100%", gap: 12,
  },
  authBtn: {
    flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14,
    paddingHorizontal: 18, borderRadius: 14, borderWidth: 1,
  },
  authBtnGoogle: {
    backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)",
  },
  authBtnFacebook: {
    backgroundColor: "rgba(24,119,242,0.1)", borderColor: "rgba(24,119,242,0.25)",
  },
  authBtnIcon: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  authBtnText: {
    fontFamily: "Nunito_700Bold", fontSize: 15, color: "#ffffff", flex: 1,
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  orText: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textDim },
  skipBtn: {
    paddingVertical: 14, alignItems: "center", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  skipBtnText: {
    fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted,
  },
  privacyNote: {
    fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim,
    textAlign: "center", lineHeight: 14, paddingHorizontal: 16,
  },
});
