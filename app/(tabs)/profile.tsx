import React, { useState } from "react";
import { router } from "expo-router";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Modal, Platform, Alert, Image,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useT } from "@/hooks/useT";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { STORE_ITEMS, AVATARS, AVATAR_FRAMES } from "@/lib/storeItems";
import { getXpProgress, getPlayerLevel, BATTLE_PASS_TIERS } from "@/lib/battlePass";
import { playSound } from "@/lib/sounds";
import { GAME_MODES } from "@/lib/gameModes";
import { AvatarDisplay } from "@/components/AvatarDisplay";

const TITLE_ITEMS = STORE_ITEMS.filter((i) => i.category === "title");

function EditNameModal({
  visible, currentName, onSave, onClose,
}: { visible: boolean; currentName: string; onSave: (n: string) => void; onClose: () => void }) {
  const [name, setName] = useState(currentName);
  const T = useT();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.editModal}>
          <Text style={styles.editTitle}>{T("editName")}</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            maxLength={16}
            autoFocus
            placeholderTextColor={Colors.textDim}
            placeholder={T("yourName")}
          />
          <View style={styles.editBtns}>
            <Pressable onPress={onClose} style={styles.editBtnCancel}>
              <Text style={styles.editBtnCancelText}>{T("cancel")}</Text>
            </Pressable>
            <Pressable onPress={() => { onSave(name); onClose(); }} style={styles.editBtnSave}>
              <Text style={styles.editBtnSaveText}>{T("save")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AvatarPickerModal({
  visible, ownedItems, currentId, photoUri, onSelect, onTakePhoto, onPickPhoto, onClearPhoto, onClose,
}: {
  visible: boolean; ownedItems: string[]; currentId: string; photoUri: string;
  onSelect: (id: string) => void;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
  onClearPhoto: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Elegir Avatar</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color={Colors.textMuted} /></Pressable>
          </View>

          {/* Photo options */}
          <View style={styles.photoRow}>
            <Pressable style={styles.photoBtn} onPress={onTakePhoto}>
              <Ionicons name="camera" size={20} color={Colors.gold} />
              <Text style={styles.photoBtnText}>Cámara</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={onPickPhoto}>
              <Ionicons name="images" size={20} color={Colors.gold} />
              <Text style={styles.photoBtnText}>Galería</Text>
            </Pressable>
            {photoUri ? (
              <Pressable style={[styles.photoBtn, styles.photoBtnDanger]} onPress={onClearPhoto}>
                <Ionicons name="trash" size={20} color="#E74C3C" />
                <Text style={[styles.photoBtnText, { color: "#E74C3C" }]}>Quitar foto</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.orDivider}>— o elige un avatar —</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
            {AVATARS.map((item) => {
              const owned = ownedItems.includes(item.id);
              const selected = item.id === currentId && !photoUri;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => { if (owned) { onSelect(item.id); onClose(); } }}
                  style={[styles.avatarOption, selected && styles.avatarOptionSelected, !owned && styles.avatarOptionLocked]}
                >
                  <View style={[styles.avatarIconWrap, { backgroundColor: item.previewColor + "44" }]}>
                    <Ionicons name={item.preview as any} size={24} color={owned ? item.previewColor : Colors.textDim} />
                  </View>
                  <Text style={[styles.avatarOptionName, !owned && { color: Colors.textDim }]}>{item.name}</Text>
                  {!owned && <Ionicons name="lock-closed" size={12} color={Colors.textDim} style={{ marginTop: 2 }} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

function FramePickerModal({
  visible, ownedItems, currentId, onSelect, onClose,
}: {
  visible: boolean; ownedItems: string[]; currentId: string;
  onSelect: (id: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Marco de Avatar</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color={Colors.textMuted} /></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
            {AVATAR_FRAMES.map((item) => {
              const owned = ownedItems.includes(item.id);
              const selected = item.id === currentId;
              const frameColors = (item.backColors ?? ["#D4AF37", "#B8860B"]) as [string, string];
              return (
                <Pressable
                  key={item.id}
                  onPress={() => { if (owned) { onSelect(item.id); onClose(); } }}
                  style={[styles.avatarOption, selected && styles.avatarOptionSelected, !owned && styles.avatarOptionLocked]}
                >
                  <LinearGradient
                    colors={frameColors}
                    style={styles.framePreview}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.frameInner} />
                  </LinearGradient>
                  <Text style={[styles.avatarOptionName, !owned && { color: Colors.textDim }]}>{item.name}</Text>
                  {!owned && (
                    <View style={styles.priceBadge}>
                      <Ionicons name="cash" size={9} color={Colors.gold} />
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                  )}
                  <View style={[styles.rarityDot, {
                    backgroundColor: item.rarity === "legendary" ? "#D4AF37" :
                      item.rarity === "epic" ? "#9B59B6" :
                      item.rarity === "rare" ? "#2196F3" : "#95A5A6",
                  }]} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

function StatRow({ label, value, textColor, textMuted }: { label: string; value: string | number; textColor?: string; textMuted?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statRowLabel, textMuted ? { color: textMuted } : {}]}>{label}</Text>
      <Text style={[styles.statRowValue, textColor ? { color: textColor } : {}]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, level, xpProgress, updateName, updateAvatar, updateTitle, updateFrame, updatePhotoUri } = useProfile();
  const { user, logout } = useAuth();
  const [showEditName, setShowEditName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTitlePicker, setShowTitlePicker] = useState(false);
  const [showFramePicker, setShowFramePicker] = useState(false);

  const T = useT();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const swipeHandlers = useSwipeTabs(3);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const xpPct = xpProgress.needed > 0 ? xpProgress.current / xpProgress.needed : 0;

  const titleItem = STORE_ITEMS.find((i) => i.id === profile.titleId);
  const cardBackItem = STORE_ITEMS.find((i) => i.id === profile.cardBackId);
  const frameItem = AVATAR_FRAMES.find((f) => f.id === profile.selectedFrameId);

  const handleSaveName = async (name: string) => {
    await playSound("button_press");
    updateName(name);
  };

  const winRate = profile.stats.totalGames > 0
    ? Math.round((profile.stats.totalWins / profile.stats.totalGames) * 100) : 0;

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("No disponible", "La cámara no está disponible en la versión web.");
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara para tomar tu foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      updatePhotoUri(result.assets[0].uri);
      setShowAvatarPicker(false);
    }
  };

  const handlePickPhoto = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          updatePhotoUri(url);
          setShowAvatarPicker(false);
        }
      };
      input.click();
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para elegir una foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      updatePhotoUri(result.assets[0].uri);
      setShowAvatarPicker(false);
    }
  };

  const handleClearPhoto = () => {
    updatePhotoUri("");
    setShowAvatarPicker(false);
  };

  const isDark = profile.darkMode !== false;
  const themeColors = isDark ? Colors : LightColors;
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const textColor = isDark ? themeColors.text : themeColors.text;
  const textMuted = isDark ? themeColors.textMuted : themeColors.textMuted;
  const surfaceColor = isDark ? themeColors.surface : themeColors.surface;
  const themeGold = isDark ? themeColors.gold : themeColors.gold;

  return (
    <View style={[styles.container, { paddingTop: topPad }]} {...swipeHandlers}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.screenTitle, { color: themeGold }]}>{T("profile")}</Text>

        {/* Avatar + name card */}
        <LinearGradient
          colors={[themeGold + "22", surfaceColor]}
          style={styles.profileCard}
        >
          <View style={styles.avatarCol}>
            <Pressable onPress={() => setShowAvatarPicker(true)} style={styles.avatarBig}>
              <AvatarDisplay
                avatarId={profile.avatarId}
                frameId={profile.selectedFrameId}
                photoUri={profile.photoUri}
                size={76}
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={10} color={Colors.background} />
              </View>
            </Pressable>
            <Pressable onPress={() => setShowFramePicker(true)} style={styles.frameBadge}>
              <Ionicons name="ellipse" size={10} color={frameItem?.previewColor ?? Colors.gold} />
              <Text style={[styles.frameBadgeText, { color: frameItem?.previewColor ?? Colors.gold }]}>
                {frameItem?.name ?? "Marco"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.profileDetails}>
            <Pressable onPress={() => setShowEditName(true)} style={styles.nameRow}>
              <Text style={[styles.profileName, { color: textColor }]}>{profile.name}</Text>
              <Ionicons name="pencil" size={14} color={themeGold} />
            </Pressable>

            <Pressable onPress={() => setShowTitlePicker(true)} style={[styles.titleBadge, { backgroundColor: themeGold + "22", borderColor: themeGold + "44" }]}>
              <Text style={[styles.titleText, { color: themeGold }]}>{titleItem?.name ?? "Novato"}</Text>
              <Ionicons name="chevron-down" size={12} color={themeGold} />
            </Pressable>

            <View style={styles.levelSection}>
              <Text style={[styles.levelNum, { color: textMuted }]}>{T("level")} {level}</Text>
              <View style={[styles.xpBarBig, { backgroundColor: isDark ? Colors.border : "#aacfa0" }]}>
                <View style={[styles.xpFill, { width: `${xpPct * 100}%`, backgroundColor: themeGold }]} />
              </View>
              <Text style={[styles.xpNums, { color: textMuted }]}>{xpProgress.current} / {xpProgress.needed} XP</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Coins + card back */}
        <View style={styles.resourceRow}>
          <View style={[styles.resourceCard, { backgroundColor: surfaceColor, borderColor: isDark ? Colors.border : "#aacfa0" }]}>
            <Ionicons name="cash" size={20} color={themeGold} />
            <Text style={[styles.resourceVal, { color: themeGold }]}>{profile.coins}</Text>
            <Text style={[styles.resourceLbl, { color: textMuted }]}>{T("coins")}</Text>
          </View>
          <View style={[styles.resourceCard, { backgroundColor: surfaceColor, borderColor: isDark ? Colors.border : "#aacfa0" }]}>
            <Ionicons name="star" size={20} color={themeGold} />
            <Text style={[styles.resourceVal, { color: themeGold }]}>{profile.totalXp}</Text>
            <Text style={[styles.resourceLbl, { color: textMuted }]}>XP Total</Text>
          </View>
          <View style={[styles.resourceCard, { backgroundColor: surfaceColor, borderColor: isDark ? Colors.border : "#aacfa0" }]}>
            <View style={[styles.miniCard, { backgroundColor: cardBackItem?.previewColor ?? "#1A3A6A" }]}>
              <Text style={{ color: Colors.gold, fontSize: 10 }}>◆</Text>
            </View>
            <Text style={[styles.resourceVal, { color: themeGold, fontSize: 12 }]} numberOfLines={1}>{cardBackItem?.name ?? "Clásico"}</Text>
            <Text style={[styles.resourceLbl, { color: textMuted }]}>{T("cardBackLabel")}</Text>
          </View>
        </View>

        {/* Friends button */}
        <Pressable
          style={({ pressed }) => [
            styles.friendsBtn,
            { backgroundColor: isDark ? Colors.surface : "#c8e0c0", borderColor: isDark ? Colors.border : "#9ec89a" },
            pressed && { opacity: 0.82 },
          ]}
          onPress={() => router.push("/friends")}
        >
          <View style={[styles.friendsBtnIcon, { backgroundColor: Colors.gold + "22" }]}>
            <Ionicons name="people" size={18} color={themeGold} />
          </View>
          <Text style={[styles.friendsBtnLabel, { color: textColor }]}>Amigos</Text>
          <Ionicons name="chevron-forward" size={16} color={textMuted} />
        </Pressable>

        {/* Account section */}
        {user && !user.isGuest ? (
          <View style={[styles.friendsBtn, { backgroundColor: isDark ? Colors.surface : "#c8e0c0", borderColor: isDark ? Colors.border : "#9ec89a", marginTop: 6 }]}>
            <View style={[styles.friendsBtnIcon, { backgroundColor: "#27AE6022" }]}>
              <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.friendsBtnLabel, { color: textColor }]}>
                {user.username}
              </Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: textMuted }}>
                {lang === "en" ? "Linked account" : lang === "pt" ? "Conta vinculada" : "Cuenta vinculada"}
              </Text>
            </View>
            <Pressable
              onPress={() => { logout(); playSound("button_press").catch(() => {}); }}
              style={{ backgroundColor: "#E74C3C22", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
            >
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: "#E74C3C" }}>
                {lang === "en" ? "Logout" : lang === "pt" ? "Sair" : "Salir"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.friendsBtn,
              { backgroundColor: isDark ? Colors.surface : "#c8e0c0", borderColor: isDark ? Colors.border : "#9ec89a", marginTop: 6 },
              pressed && { opacity: 0.82 },
            ]}
            onPress={() => { playSound("button_press").catch(() => {}); router.push("/login"); }}
          >
            <View style={[styles.friendsBtnIcon, { backgroundColor: "#4A90E222" }]}>
              <Ionicons name="person-circle-outline" size={18} color="#4A90E2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.friendsBtnLabel, { color: textColor }]}>
                {lang === "en" ? "Link Account" : lang === "pt" ? "Vincular Conta" : "Vincular Cuenta"}
              </Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: textMuted }}>
                {lang === "en" ? "Google / Facebook / Email" : lang === "pt" ? "Google / Facebook / Email" : "Google / Facebook / Email"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={textMuted} />
          </Pressable>
        )}

        {/* Stats */}
        <Text style={[styles.sectionLabel, { color: themeGold }]}>{T("generalStats")}</Text>
        <View style={[styles.statsBlock, { backgroundColor: surfaceColor + "cc", borderColor: isDark ? Colors.border : "#aacfa0" }]}>
          <StatRow label={T("gamesPlayed")} value={profile.stats.totalGames} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("wins")} value={profile.stats.totalWins} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("losses")} value={profile.stats.totalLosses} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("winRate")} value={`${winRate}%`} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("streak")} value={`${profile.stats.dailyStreak} ${T("days")}`} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("eightsPlayed")} value={profile.stats.totalEightsPlayed} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("cardsDrawn")} value={profile.stats.totalCardsDrawn} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("perfectWins")} value={profile.stats.perfectWins} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("comebacks")} value={profile.stats.comebackWins} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("tournamentsWon")} value={profile.stats.tournamentsWon} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("coopWins")} value={profile.stats.coopWins} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("challengesCompleted")} value={profile.stats.challengesCompleted} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("localMultiWins")} value={profile.stats.localMultiWins ?? 0} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("localMultiGames")} value={profile.stats.localMultiGames ?? 0} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("onlineMultiWins")} value={profile.stats.onlineMultiWins ?? 0} textColor={textColor} textMuted={textMuted} />
          <StatRow label={T("onlineMultiGames")} value={profile.stats.onlineMultiGames ?? 0} textColor={textColor} textMuted={textMuted} />
        </View>

        <Text style={[styles.sectionLabel, { color: themeGold }]}>{T("byMode")}</Text>
        <View style={[styles.statsBlock, { backgroundColor: surfaceColor + "cc", borderColor: isDark ? Colors.border : "#aacfa0" }]}>
          {GAME_MODES.map((mode) => {
            const wins = profile.stats.winsByMode[mode.id] ?? 0;
            const games = profile.stats.gamesByMode[mode.id] ?? 0;
            return (
              <View key={mode.id} style={[styles.modeStatRow, { borderBottomColor: isDark ? Colors.border : "#aacfa0" }]}>
                <View style={[styles.modeIconSm, { backgroundColor: mode.color + "33" }]}>
                  <Ionicons name={mode.icon as any} size={14} color={mode.color} />
                </View>
                <Text style={[styles.modeStatName, { color: textMuted }]}>{mode.name}</Text>
                <Text style={[styles.modeStatVal, { color: themeGold }]}>{wins}/{games}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <EditNameModal
        visible={showEditName}
        currentName={profile.name}
        onSave={handleSaveName}
        onClose={() => setShowEditName(false)}
      />
      <AvatarPickerModal
        visible={showAvatarPicker}
        ownedItems={profile.ownedItems}
        currentId={profile.avatarId}
        photoUri={profile.photoUri}
        onSelect={updateAvatar}
        onTakePhoto={handleTakePhoto}
        onPickPhoto={handlePickPhoto}
        onClearPhoto={handleClearPhoto}
        onClose={() => setShowAvatarPicker(false)}
      />
      <FramePickerModal
        visible={showFramePicker}
        ownedItems={profile.ownedItems}
        currentId={profile.selectedFrameId}
        onSelect={updateFrame}
        onClose={() => setShowFramePicker(false)}
      />
      <Modal transparent animationType="slide" visible={showTitlePicker} onRequestClose={() => setShowTitlePicker(false)}>
        <Pressable style={styles.modalBg} onPress={() => setShowTitlePicker(false)}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Elegir Título</Text>
              <Pressable onPress={() => setShowTitlePicker(false)}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
              {TITLE_ITEMS.map((item) => {
                const owned = profile.ownedItems.includes(item.id);
                const selected = item.id === profile.titleId;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => { if (owned) { updateTitle(item.id); setShowTitlePicker(false); } }}
                    style={[styles.avatarOption, selected && styles.avatarOptionSelected, !owned && styles.avatarOptionLocked]}
                  >
                    <View style={[styles.avatarIconWrap, { backgroundColor: item.previewColor + "33" }]}>
                      <Ionicons name={item.preview as any} size={20} color={owned ? item.previewColor : Colors.textDim} />
                    </View>
                    <Text style={[styles.avatarOptionName, !owned && { color: Colors.textDim }]}>{item.name}</Text>
                    {!owned && <View style={styles.priceBadge}><Ionicons name="cash" size={9} color={Colors.gold} /><Text style={styles.priceText}>{item.price}</Text></View>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  screenTitle: {
    fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold,
    letterSpacing: 4, marginBottom: 16,
  },
  profileCard: {
    borderRadius: 18, padding: 16, flexDirection: "row", gap: 16,
    alignItems: "center", borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  avatarCol: { alignItems: "center", gap: 6 },
  avatarBig: { position: "relative" },
  avatarEditBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: Colors.gold, width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.background,
  },
  frameBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: Colors.card, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  frameBadgeText: { fontFamily: "Nunito_700Bold", fontSize: 9 },
  profileDetails: { flex: 1, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.text },
  titleBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    backgroundColor: Colors.gold + "22", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  titleText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  levelSection: { gap: 3 },
  levelNum: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  xpBarBig: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  xpFill: { height: "100%", backgroundColor: Colors.gold, borderRadius: 3 },
  xpNums: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textDim },
  resourceRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  resourceCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 12, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  resourceVal: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold, textAlign: "center" },
  resourceLbl: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted },
  miniCard: {
    width: 24, height: 34, borderRadius: 4,
    alignItems: "center", justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted,
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, marginTop: 4,
  },
  statsBlock: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, overflow: "hidden", marginBottom: 16,
  },
  statRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statRowLabel: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted },
  statRowValue: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  modeStatRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modeIconSm: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  modeStatName: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, flex: 1 },
  modeStatVal: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.gold },
  modalBg: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", alignItems: "center" },
  editModal: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 20,
    width: 300, borderWidth: 1, borderColor: Colors.border,
  },
  editTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold, marginBottom: 12 },
  nameInput: {
    backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: "Nunito_700Bold", fontSize: 16, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  editBtns: { flexDirection: "row", gap: 10 },
  editBtnCancel: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: "center",
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  editBtnCancelText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  editBtnSave: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: "center", backgroundColor: Colors.gold,
  },
  editBtnSaveText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "#1a0a00" },
  pickerModal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, borderWidth: 1, borderColor: Colors.border, alignSelf: "stretch",
  },
  pickerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  pickerTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold },
  photoRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  photoBtn: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12,
    alignItems: "center", gap: 6, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  photoBtnDanger: { borderColor: "#E74C3C44" },
  photoBtnText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.gold },
  orDivider: {
    fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim,
    textAlign: "center", marginBottom: 12,
  },
  avatarRow: { paddingVertical: 4, gap: 10, paddingBottom: 20 },
  avatarOption: {
    width: 90, backgroundColor: Colors.card, borderRadius: 12, padding: 10,
    alignItems: "center", gap: 6, borderWidth: 1, borderColor: Colors.border,
  },
  avatarOptionSelected: { borderColor: Colors.gold, backgroundColor: Colors.gold + "22" },
  avatarOptionLocked: { opacity: 0.6 },
  avatarIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarOptionName: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.text, textAlign: "center" },
  priceBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  priceText: { fontFamily: "Nunito_700Bold", fontSize: 9, color: Colors.gold },
  framePreview: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  frameInner: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.background,
  },
  rarityDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  friendsBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 14,
  },
  friendsBtnIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  friendsBtnLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 15, flex: 1,
  },
});
