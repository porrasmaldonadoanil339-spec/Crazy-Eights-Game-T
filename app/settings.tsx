import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Platform, ScrollView,
  Modal, Pressable, Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useProfile } from "@/context/ProfileContext";
import { stopMusic, startMenuMusic, setMuted } from "@/lib/audioManager";

const LANGUAGES = [
  { code: "es" as const, label: "Español", flag: "🇪🇸", subtitle: "Spanish" },
  { code: "en" as const, label: "English", flag: "🇺🇸", subtitle: "Inglés" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateSettings } = useProfile();
  const [showLangModal, setShowLangModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleMusic = async () => {
    const next = !profile.musicEnabled;
    updateSettings({ musicEnabled: next });
    if (!next) stopMusic().catch(() => {});
    else startMenuMusic().catch(() => {});
  };

  const toggleSfx = () => {
    const next = !profile.sfxEnabled;
    updateSettings({ sfxEnabled: next });
    setMuted(!next);
  };

  const toggleVibration = () => {
    const next = !profile.vibrationEnabled;
    updateSettings({ vibrationEnabled: next });
    if (next) Vibration.vibrate(80);
  };

  const selectLanguage = (code: "es" | "en") => {
    updateSettings({ language: code });
    setShowLangModal(false);
    if (profile.vibrationEnabled) Vibration.vibrate(40);
  };

  const currentLang = LANGUAGES.find(l => l.code === (profile.language ?? "es")) ?? LANGUAGES[0];

  const t = (es: string, en: string) => (profile.language === "en" ? en : es);

  return (
    <LinearGradient colors={["#041008", "#061510", "#041008"]} style={StyleSheet.absoluteFill}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.title}>{t("Configuración", "Settings")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("IDIOMA", "LANGUAGE")}</Text>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.langBtnLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a2a3a" }]}>
                <Ionicons name="globe" size={20} color="#4FC3F7" />
              </View>
              <View>
                <Text style={styles.rowLabel}>{t("Idioma del Juego", "Game Language")}</Text>
                <Text style={styles.rowSub}>
                  {currentLang.flag} {currentLang.label} — {currentLang.subtitle}
                </Text>
              </View>
            </View>
            <View style={styles.langChevron}>
              <Text style={styles.langValue}>{currentLang.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("AUDIO", "AUDIO")}</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a3a1a" }]}>
                <Ionicons name="musical-notes" size={20} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.rowLabel}>{t("Música", "Music")}</Text>
                <Text style={styles.rowSub}>{t("Música de fondo en menú y partida", "Background music in menu & game")}</Text>
              </View>
            </View>
            <Switch
              value={profile.musicEnabled}
              onValueChange={toggleMusic}
              trackColor={{ false: "#333", true: "#2a5a2a" }}
              thumbColor={profile.musicEnabled ? "#D4AF37" : "#666"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a2a3a" }]}>
                <Ionicons name="volume-high" size={20} color="#4FC3F7" />
              </View>
              <View>
                <Text style={styles.rowLabel}>{t("Efectos de Sonido", "Sound Effects")}</Text>
                <Text style={styles.rowSub}>{t("Cartas, victorias, botones", "Cards, wins, buttons")}</Text>
              </View>
            </View>
            <Switch
              value={profile.sfxEnabled}
              onValueChange={toggleSfx}
              trackColor={{ false: "#333", true: "#1a3a5a" }}
              thumbColor={profile.sfxEnabled ? "#4FC3F7" : "#666"}
            />
          </View>
        </View>

        {/* Haptics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("TÁCTIL", "HAPTICS")}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#2a1a3a" }]}>
                <Ionicons name="phone-portrait" size={20} color="#9B59B6" />
              </View>
              <View>
                <Text style={styles.rowLabel}>{t("Vibración", "Vibration")}</Text>
                <Text style={styles.rowSub}>{t("Feedback háptico en jugadas y victorias", "Haptic feedback on plays & wins")}</Text>
              </View>
            </View>
            <Switch
              value={profile.vibrationEnabled ?? true}
              onValueChange={toggleVibration}
              trackColor={{ false: "#333", true: "#2a1a3a" }}
              thumbColor={(profile.vibrationEnabled ?? true) ? "#9B59B6" : "#666"}
            />
          </View>
        </View>

        {/* Game Rules Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("REGLAS DEL JUEGO", "GAME RULES")}</Text>

          {[
            { icon: "timer-outline", color: "#D4AF37", text: t("Modo Experto: 8 segundos por turno. ¡No pierdas el tiempo!", "Expert Mode: 8 seconds per turn. Don't waste time!") },
            { icon: "card-outline", color: "#4FC3F7", text: t("Cartas especiales: 2, 3, 7, 8, 10, J y Comodín tienen poderes únicos.", "Special cards: 2, 3, 7, 8, 10, J and Joker have unique powers.") },
            { icon: "swap-horizontal", color: "#27AE60", text: t("10 invierte la dirección. 3 salta al oponente. J repite tu turno.", "10 reverses direction. 3 skips opponent. J repeats your turn.") },
            { icon: "layers", color: "#E74C3C", text: t("2 y 7 obligan a robar cartas — ¡apílalas con el mismo número!", "2 and 7 force draws — stack them with the same number!") },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingTop: 10, marginTop: 2 }]}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ACERCA DEL JUEGO", "ABOUT")}</Text>
          <View style={styles.aboutCard}>
            <LinearGradient
              colors={["#D4AF3722", "#D4AF3705"]}
              style={styles.aboutGrad}
            >
              <Text style={styles.gameName}>OCHO LOCOS</Text>
              <Text style={styles.gameVer}>{t("Versión", "Version")} 3.0</Text>
              <Text style={styles.gameDesc}>
                {t(
                  "El juego de cartas más popular de América Latina, ahora con torneos, 60+ logros, pase de batalla de 80 niveles y multijugador online.",
                  "The most popular card game in Latin America, now with tournaments, 60+ achievements, 80-level battle pass and online multiplayer."
                )}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.resetHint}>
          {t("Los datos se guardan localmente en tu dispositivo.", "Data is saved locally on your device.")}
        </Text>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLangModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.langModal}>
            <LinearGradient colors={["#0a1a0c", "#061209"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{t("Seleccionar Idioma", "Select Language")}</Text>
              <Pressable onPress={() => setShowLangModal(false)} style={styles.langModalClose}>
                <Ionicons name="close" size={20} color="#6B7A5C" />
              </Pressable>
            </View>
            {LANGUAGES.map((lang) => {
              const selected = (profile.language ?? "es") === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => selectLanguage(lang.code)}
                  style={({ pressed }) => [
                    styles.langOption,
                    selected && styles.langOptionSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langOptionName, selected && { color: "#D4AF37" }]}>
                      {lang.label}
                    </Text>
                    <Text style={styles.langOptionSub}>{lang.subtitle}</Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color="#D4AF37" />
                  )}
                </Pressable>
              );
            })}
            <Text style={styles.langNote}>
              {t("La traducción se aplica en toda la aplicación.", "Translation applies across the whole app.")}
            </Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24,
  },
  backBtn: {
    width: 44, height: 44, backgroundColor: "rgba(212,175,55,0.12)",
    borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(212,175,55,0.25)",
  },
  title: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: "#D4AF37", letterSpacing: 1 },
  section: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(212,175,55,0.12)",
    padding: 16, marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: "#D4AF37",
    letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowLabel: { fontFamily: "Nunito_700Bold", fontSize: 15, color: "#E8DCC8" },
  rowSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#6B7A5C", marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 10 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  infoText: { fontFamily: "Nunito_400Regular", fontSize: 13, color: "#9AAA8C", flex: 1, lineHeight: 19 },
  aboutCard: { borderRadius: 12, overflow: "hidden" },
  aboutGrad: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 16, borderRadius: 12 },
  gameName: { fontFamily: "Nunito_900ExtraBold", fontSize: 26, color: "#D4AF37", letterSpacing: 5 },
  gameVer: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#6B7A5C", marginTop: 2, marginBottom: 10 },
  gameDesc: { fontFamily: "Nunito_400Regular", fontSize: 13, color: "#9AAA8C", textAlign: "center", lineHeight: 20 },
  resetHint: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#445544", textAlign: "center", marginTop: 4 },
  // Language button
  langBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6,
  },
  langBtnLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  langChevron: { flexDirection: "row", alignItems: "center", gap: 4 },
  langValue: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#D4AF37" },
  // Language modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  langModal: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
    overflow: "hidden", borderTopWidth: 1, borderColor: "rgba(212,175,55,0.2)",
  },
  langModalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  langModalTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: "#D4AF37" },
  langModalClose: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 14, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  langOptionSelected: {
    backgroundColor: "rgba(212,175,55,0.12)", borderColor: "rgba(212,175,55,0.4)",
  },
  langFlag: { fontSize: 30 },
  langOptionName: { fontFamily: "Nunito_700Bold", fontSize: 17, color: "#E8DCC8" },
  langOptionSub: { fontFamily: "Nunito_400Regular", fontSize: 12, color: "#6B7A5C", marginTop: 1 },
  langNote: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#4A5540", textAlign: "center", marginTop: 12 },
});
