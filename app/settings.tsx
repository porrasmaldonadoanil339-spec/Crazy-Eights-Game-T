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
import { stopMusic, startMenuMusic, syncSettings, getCurrentTrack } from "@/lib/audioManager";
import { useT } from "@/hooks/useT";

const LANGUAGES = [
  { code: "es" as const, label: "Español", flag: "🇪🇸", subtitle: "Español (Latinoamérica)" },
  { code: "en" as const, label: "English", flag: "🇺🇸", subtitle: "English (USA)" },
  { code: "pt" as const, label: "Português", flag: "🇧🇷", subtitle: "Português (Brasil)" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateSettings } = useProfile();
  const T = useT();
  const [showLangModal, setShowLangModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isDark = profile.darkMode !== false;

  const bg = isDark ? ["#041008", "#061510", "#041008"] as const : ["#e8f5e2", "#d4edce", "#e8f5e2"] as const;
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const cardBorder = isDark ? "rgba(212,175,55,0.12)" : "rgba(0,100,0,0.12)";
  const titleColor = isDark ? "#D4AF37" : "#1a4a1a";
  const labelColor = isDark ? "#E8DCC8" : "#1a2e1a";
  const subColor = isDark ? "#6B7A5C" : "#4a7a4a";
  const sectionTitleColor = isDark ? "#D4AF37" : "#2a6a2a";

  const toggleMusic = async () => {
    const next = !profile.musicEnabled;
    updateSettings({ musicEnabled: next });
    syncSettings(next, profile.sfxEnabled);
    if (!next) {
      stopMusic().catch(() => {});
    } else if (getCurrentTrack() === null) {
      startMenuMusic().catch(() => {});
    }
  };

  const toggleSfx = () => {
    const next = !profile.sfxEnabled;
    updateSettings({ sfxEnabled: next });
    syncSettings(profile.musicEnabled, next);
  };

  const toggleVibration = () => {
    const next = !profile.vibrationEnabled;
    updateSettings({ vibrationEnabled: next });
    if (next) Vibration.vibrate(80);
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !isDark });
    if (profile.vibrationEnabled) Vibration.vibrate(40);
  };

  const selectLanguage = (code: "es" | "en" | "pt") => {
    updateSettings({ language: code });
    setShowLangModal(false);
    if (profile.vibrationEnabled) Vibration.vibrate(40);
  };

  const currentLang = LANGUAGES.find(l => l.code === (profile.language ?? "es")) ?? LANGUAGES[0];

  return (
    <LinearGradient colors={bg} style={StyleSheet.absoluteFill}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: titleColor + "22", borderColor: titleColor + "40" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={titleColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: titleColor }]}>{T("settings")}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Language */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{T("language").toUpperCase()}</Text>
          <TouchableOpacity style={styles.langBtn} onPress={() => setShowLangModal(true)} activeOpacity={0.8}>
            <View style={styles.langBtnLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a2a3a" }]}>
                <Ionicons name="globe" size={20} color="#4FC3F7" />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: labelColor }]}>{T("selectLanguage")}</Text>
                <Text style={[styles.rowSub, { color: subColor }]}>
                  {currentLang.flag} {currentLang.label}
                </Text>
              </View>
            </View>
            <View style={styles.langChevron}>
              <Text style={[styles.langValue, { color: titleColor }]}>{currentLang.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={titleColor} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Display / Theme */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{T("display").toUpperCase()}</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? "#2a1a3a" : "#fff9e6" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#9B59B6" : "#F39C12"} />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  {isDark ? T("darkMode") : T("lightMode")}
                </Text>
                <Text style={[styles.rowSub, { color: subColor }]}>
                  {isDark ? T("on") : T("off")}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#ccc", true: "#2a1a3a" }}
              thumbColor={isDark ? "#9B59B6" : "#F39C12"}
            />
          </View>
        </View>

        {/* Audio */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{T("audio")}</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a3a1a" }]}>
                <Ionicons name="musical-notes" size={20} color="#D4AF37" />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: labelColor }]}>{T("music")}</Text>
                <Text style={[styles.rowSub, { color: subColor }]}>{T("musicDesc")}</Text>
              </View>
            </View>
            <Switch
              value={profile.musicEnabled}
              onValueChange={toggleMusic}
              trackColor={{ false: "#333", true: "#2a5a2a" }}
              thumbColor={profile.musicEnabled ? "#D4AF37" : "#666"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a2a3a" }]}>
                <Ionicons name="volume-high" size={20} color="#4FC3F7" />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: labelColor }]}>{T("soundEffects")}</Text>
                <Text style={[styles.rowSub, { color: subColor }]}>{T("sfxDesc")}</Text>
              </View>
            </View>
            <Switch
              value={profile.sfxEnabled}
              onValueChange={toggleSfx}
              trackColor={{ false: "#333", true: "#1a3a5a" }}
              thumbColor={profile.sfxEnabled ? "#4FC3F7" : "#666"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#2a1a3a" }]}>
                <Ionicons name="phone-portrait" size={20} color="#9B59B6" />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: labelColor }]}>{T("vibration")}</Text>
                <Text style={[styles.rowSub, { color: subColor }]}>{T("vibrationDesc")}</Text>
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

        {/* Rules */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{T("rules").toUpperCase()}</Text>
          {[
            { icon: "timer-outline", color: "#D4AF37", textEs: "Modo Experto: 8 segundos por turno. ¡No pierdas el tiempo!", textEn: "Expert Mode: 8 sec per turn. Don't waste time!", textPt: "Modo Especialista: 8 seg por turno. Não perca tempo!" },
            { icon: "card-outline", color: "#4FC3F7", textEs: "Cartas especiales: 2, 3, 7, 8, 10, J y Comodín tienen poderes únicos.", textEn: "Special cards: 2, 3, 7, 8, 10, J & Joker have unique powers.", textPt: "Cartas especiais: 2, 3, 7, 8, 10, J e Curinga têm poderes únicos." },
            { icon: "swap-horizontal", color: "#27AE60", textEs: "10 invierte la dirección. 3 salta. J repite tu turno.", textEn: "10 reverses direction. 3 skips. J repeats your turn.", textPt: "10 inverte a direção. 3 pula. J repete seu turno." },
            { icon: "layers", color: "#E74C3C", textEs: "2 y 7 obligan a robar — ¡apílalos con el mismo número!", textEn: "2 and 7 force draws — stack them with the same number!", textPt: "2 e 7 forçam compra — empilhe com o mesmo número!" },
          ].map((item, i) => {
            const text = profile.language === "en" ? item.textEn : profile.language === "pt" ? item.textPt : item.textEs;
            return (
              <View key={i} style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", paddingTop: 10, marginTop: 2 }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
                <Text style={[styles.infoText, { color: isDark ? "#9AAA8C" : "#3a5a3a" }]}>{text}</Text>
              </View>
            );
          })}
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{T("about")}</Text>
          <View style={styles.aboutCard}>
            <LinearGradient colors={["#D4AF3722", "#D4AF3705"]} style={styles.aboutGrad}>
              <Text style={styles.gameName}>OCHO LOCOS</Text>
              <Text style={[styles.gameVer, { color: subColor }]}>{T("version")} 3.0</Text>
              <Text style={[styles.gameDesc, { color: isDark ? "#9AAA8C" : "#3a5a3a" }]}>{T("gameDescAbout")}</Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={[styles.resetHint, { color: isDark ? "#445544" : "#6a8a6a" }]}>{T("savedLocally")}</Text>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.langModal}>
            <LinearGradient colors={["#0a1a0c", "#061209"]} style={StyleSheet.absoluteFill} />
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{T("selectLanguage")}</Text>
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
                  {selected && <Ionicons name="checkmark-circle" size={22} color="#D4AF37" />}
                </Pressable>
              );
            })}
            <Text style={styles.langNote}>
              {T("language") === "Idioma"
                ? "La traducción se aplica en toda la aplicación."
                : "Translation applies across the whole app."}
            </Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, letterSpacing: 1 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 2.5, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowLabel: { fontFamily: "Nunito_700Bold", fontSize: 15 },
  rowSub: { fontFamily: "Nunito_400Regular", fontSize: 11, marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  infoText: { fontFamily: "Nunito_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  aboutCard: { borderRadius: 12, overflow: "hidden" },
  aboutGrad: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 16, borderRadius: 12 },
  gameName: { fontFamily: "Nunito_900ExtraBold", fontSize: 26, color: "#D4AF37", letterSpacing: 5 },
  gameVer: { fontFamily: "Nunito_400Regular", fontSize: 11, marginTop: 2, marginBottom: 10 },
  gameDesc: { fontFamily: "Nunito_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
  resetHint: { fontFamily: "Nunito_400Regular", fontSize: 11, textAlign: "center", marginTop: 4 },
  langBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  langBtnLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  langChevron: { flexDirection: "row", alignItems: "center", gap: 4 },
  langValue: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  langModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, overflow: "hidden", borderTopWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  langModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  langModalTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: "#D4AF37" },
  langModalClose: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  langOption: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, marginBottom: 10, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  langOptionSelected: { backgroundColor: "rgba(212,175,55,0.12)", borderColor: "rgba(212,175,55,0.4)" },
  langFlag: { fontSize: 30 },
  langOptionName: { fontFamily: "Nunito_700Bold", fontSize: 17, color: "#E8DCC8" },
  langOptionSub: { fontFamily: "Nunito_400Regular", fontSize: 12, color: "#6B7A5C", marginTop: 1 },
  langNote: { fontFamily: "Nunito_400Regular", fontSize: 11, color: "#4A5540", textAlign: "center", marginTop: 12 },
});
