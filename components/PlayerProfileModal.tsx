import React from "react";
import {
  View, Text, StyleSheet, Modal, Pressable, Image, ScrollView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export interface PlayerProfileData {
  name: string;
  level: number;
  wins: number;
  score: number;
  avatarIcon: string;
  avatarColor: string;
  photoUrl?: string;
  titleName?: string;
  rank?: number;
  winRate?: number;
  isFriend?: boolean;
  requestSent?: boolean;
}

interface PlayerProfileModalProps {
  visible: boolean;
  player: PlayerProfileData | null;
  onClose: () => void;
  onAddFriend?: (name: string) => void;
  onInvite?: (name: string) => void;
}

const RARITY_LEVEL_COLORS = (lvl: number) => {
  if (lvl >= 80) return ["#A855F7", "#7C3AED"];
  if (lvl >= 60) return ["#D4AF37", "#A07800"];
  if (lvl >= 40) return ["#E74C3C", "#A01a15"];
  if (lvl >= 20) return ["#1A8FC1", "#0e6090"];
  return ["#4CAF50", "#2E7D32"];
};

export function PlayerProfileModal({ visible, player, onClose, onAddFriend, onInvite }: PlayerProfileModalProps) {
  const insets = useSafeAreaInsets();
  if (!player) return null;

  const levelColors = RARITY_LEVEL_COLORS(player.level);
  const winRate = player.winRate ?? Math.min(95, 35 + Math.floor(player.level * 0.45));
  const gamesPlayed = Math.floor(player.wins / (winRate / 100));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modal, { marginTop: insets.top + 20 }]} onPress={() => {}}>
          <LinearGradient colors={["#0a1a0c", "#061510", "#041008"]} style={StyleSheet.absoluteFill} />

          {/* Header gold border */}
          <View style={[styles.topBorder, { backgroundColor: levelColors[0] }]} />

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={[styles.avatarWrap, { borderColor: levelColors[0] + "88" }]}>
              {player.photoUrl ? (
                <Image source={{ uri: player.photoUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={[player.avatarColor + "55", player.avatarColor + "22"]} style={styles.avatarGrad}>
                  <Ionicons name={player.avatarIcon as any} size={44} color={player.avatarColor} />
                </LinearGradient>
              )}
              {/* Level badge */}
              <View style={[styles.levelBadge, { backgroundColor: levelColors[0] }]}>
                <Text style={styles.levelBadgeTxt}>{player.level}</Text>
              </View>
            </View>

            {/* Name + title */}
            <Text style={styles.playerName}>{player.name}</Text>
            {player.titleName && (
              <View style={styles.titleRow}>
                <Ionicons name="ribbon" size={11} color={Colors.gold} />
                <Text style={styles.titleTxt}>{player.titleName}</Text>
              </View>
            )}

            {/* Rank badge */}
            {player.rank && (
              <View style={[styles.rankBadge, { backgroundColor: player.rank <= 3 ? Colors.gold + "22" : Colors.surface }]}>
                <Ionicons name="trophy" size={12} color={player.rank <= 3 ? Colors.gold : Colors.textMuted} />
                <Text style={[styles.rankTxt, { color: player.rank <= 3 ? Colors.gold : Colors.textMuted }]}>
                  #{player.rank} Ranking
                </Text>
              </View>
            )}

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <LinearGradient colors={["#1a2f1a", "#0d1f0f"]} style={styles.statGrad}>
                  <Ionicons name="trophy" size={18} color={Colors.gold} />
                  <Text style={styles.statValue}>{player.wins.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Victorias</Text>
                </LinearGradient>
              </View>
              <View style={styles.statBox}>
                <LinearGradient colors={["#1a2f1a", "#0d1f0f"]} style={styles.statGrad}>
                  <Ionicons name="trending-up" size={18} color="#27AE60" />
                  <Text style={styles.statValue}>{winRate}%</Text>
                  <Text style={styles.statLabel}>Tasa Vic.</Text>
                </LinearGradient>
              </View>
              <View style={styles.statBox}>
                <LinearGradient colors={["#1a2f1a", "#0d1f0f"]} style={styles.statGrad}>
                  <Ionicons name="game-controller" size={18} color="#4A90E2" />
                  <Text style={styles.statValue}>{gamesPlayed.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Partidas</Text>
                </LinearGradient>
              </View>
            </View>

            {/* XP bar */}
            <View style={styles.xpSection}>
              <View style={styles.xpLabelRow}>
                <Text style={styles.xpLabel}>Nivel {player.level}</Text>
                <Text style={styles.xpLabel}>Nivel {player.level + 1}</Text>
              </View>
              <View style={styles.xpTrack}>
                <LinearGradient
                  colors={[levelColors[0], levelColors[1]]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.xpFill, { width: `${(player.level % 10) * 10}%` }]}
                />
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Action buttons */}
            <View style={styles.actions}>
              {onAddFriend && !player.isFriend && !player.requestSent && (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.friendBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => onAddFriend(player.name)}
                >
                  <LinearGradient colors={["#27AE60", "#1a7a43"]} style={styles.actionBtnGrad}>
                    <Ionicons name="person-add" size={16} color="#fff" />
                    <Text style={styles.actionBtnTxt}>Agregar amigo</Text>
                  </LinearGradient>
                </Pressable>
              )}
              {player.requestSent && (
                <View style={[styles.actionBtn, styles.sentBtn]}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.textMuted} />
                  <Text style={styles.sentTxt}>Solicitud enviada</Text>
                </View>
              )}
              {player.isFriend && onInvite && (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => onInvite(player.name)}
                >
                  <LinearGradient colors={[Colors.gold, "#A07800"]} style={styles.actionBtnGrad}>
                    <Ionicons name="game-controller" size={16} color="#1a0a00" />
                    <Text style={[styles.actionBtnTxt, { color: "#1a0a00" }]}>Invitar a jugar</Text>
                  </LinearGradient>
                </Pressable>
              )}
              <Pressable style={[styles.actionBtn, styles.closeAction]} onPress={onClose}>
                <Text style={styles.closeActionTxt}>Cerrar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "88%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  topBorder: {
    height: 3,
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarGrad: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  levelBadgeTxt: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 11,
    color: "#fff",
  },
  playerName: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 20,
    color: Colors.text,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  titleTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.gold,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    width: "100%",
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statGrad: {
    padding: 10,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 15,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xpSection: {
    width: "100%",
    marginTop: 14,
    gap: 4,
  },
  xpLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 10,
    color: Colors.textMuted,
  },
  xpTrack: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 3,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  actions: {
    width: "100%",
    gap: 8,
  },
  actionBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  friendBtn: {},
  actionBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  actionBtnTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#fff",
  },
  sentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sentTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: Colors.textMuted,
  },
  closeAction: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeActionTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: Colors.textMuted,
  },
});
