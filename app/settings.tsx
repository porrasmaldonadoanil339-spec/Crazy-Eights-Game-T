import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Platform, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useProfile } from "@/context/ProfileContext";
import { stopMusic, startMenuMusic, setMuted } from "@/lib/audioManager";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateSettings } = useProfile();

  const toggleMusic = async () => {
    const next = !profile.musicEnabled;
    updateSettings({ musicEnabled: next });
    if (!next) {
      stopMusic().catch(() => {});
    } else {
      startMenuMusic().catch(() => {});
    }
  };

  const toggleSfx = () => {
    const next = !profile.sfxEnabled;
    updateSettings({ sfxEnabled: next });
    setMuted(!next);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <LinearGradient colors={["#041008", "#061510", "#041008"]} style={StyleSheet.absoluteFill}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.title}>Configuración</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#1a3a1a" }]}>
                <Ionicons name="musical-notes" size={20} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Música</Text>
                <Text style={styles.rowSub}>Música de fondo en menú y partida</Text>
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
                <Text style={styles.rowLabel}>Efectos de Sonido</Text>
                <Text style={styles.rowSub}>Cartas, victorias, botones</Text>
              </View>
            </View>
            <Switch
              value={profile.sfxEnabled}
              onValueChange={toggleSfx}
              trackColor={{ false: "#333", true: "#1a3a5a" }}
              thumbColor={profile.sfxEnabled ? "#4FC3F7" : "#666"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: "#2a1a3a" }]}>
                <Ionicons name="phone-portrait" size={20} color="#9B59B6" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Vibración</Text>
                <Text style={styles.rowSub}>Feedback háptico en jugadas</Text>
              </View>
            </View>
            <View style={styles.badgeOn}>
              <Text style={styles.badgeText}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Game Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Juego</Text>

          <View style={styles.infoRow}>
            <Ionicons name="timer-outline" size={16} color="#D4AF37" />
            <Text style={styles.infoText}>
              Modo Experto: 8 segundos por turno. La barra se vacía — ¡no pierdas el tiempo!
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color="#4FC3F7" />
            <Text style={styles.infoText}>
              Cartas especiales: 2, 3, 7, 8, 10, J y Comodín tienen poderes únicos.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="swap-horizontal" size={16} color="#27AE60" />
            <Text style={styles.infoText}>
              10 invierte la dirección. 3 salta al oponente. J repite tu turno.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca del Juego</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.gameName}>OCHO LOCOS</Text>
            <Text style={styles.gameVer}>Versión 2.0</Text>
            <Text style={styles.gameDesc}>
              El juego de cartas más popular de América Latina, ahora con torneos, logros y pase de batalla.
            </Text>
          </View>
        </View>

        {/* Reset hint */}
        <Text style={styles.resetHint}>
          Los datos se guardan localmente en tu dispositivo.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 44, height: 44,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(212,175,55,0.25)",
  },
  title: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 22, color: "#D4AF37", letterSpacing: 1,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.15)",
    padding: 16, marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11, color: "#D4AF37", letterSpacing: 2,
    textTransform: "uppercase", marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLeft: {
    flexDirection: "row", alignItems: "center", flex: 1,
  },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15, color: "#E8DCC8",
  },
  rowSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11, color: "#6B7A5C", marginTop: 1,
  },
  divider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 10,
  },
  badgeOn: {
    backgroundColor: "rgba(39,174,96,0.2)",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "#27AE60",
  },
  badgeText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11, color: "#27AE60",
  },
  infoRow: {
    flexDirection: "row", alignItems: "flex-start",
    marginBottom: 10, gap: 10,
  },
  infoText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13, color: "#9AAA8C", flex: 1, lineHeight: 19,
  },
  aboutCard: {
    alignItems: "center", paddingVertical: 12,
  },
  gameName: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 24, color: "#D4AF37", letterSpacing: 4,
  },
  gameVer: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12, color: "#6B7A5C", marginTop: 2, marginBottom: 8,
  },
  gameDesc: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13, color: "#9AAA8C", textAlign: "center", lineHeight: 19,
  },
  resetHint: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11, color: "#445544", textAlign: "center", marginTop: 8,
  },
});
