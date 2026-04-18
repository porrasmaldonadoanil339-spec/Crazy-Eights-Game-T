import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/hooks/useT";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory } from "@/lib/storeItems";
import BouncePressable from "@/components/BouncePressable";
import { playSound } from "@/lib/sounds";

type CategoryDef = {
  id: StoreItemCategory | "emote_slot";
  icon: string;
  labelKey: string;
};

const CATEGORIES: CategoryDef[] = [
  { id: "card_back",    icon: "card",          labelKey: "categoryCardBacks" },
  { id: "card_design",  icon: "layers",        labelKey: "categoryCardDesigns" },
  { id: "table_design", icon: "square",        labelKey: "categoryTableDesigns" },
  { id: "avatar",       icon: "person-circle", labelKey: "categoryAvatars" },
  { id: "frame",        icon: "ellipse",       labelKey: "categoryFrames" },
  { id: "title",        icon: "ribbon",        labelKey: "categoryTitles" },
  { id: "effect",       icon: "sparkles",      labelKey: "categoryEffects" },
  { id: "emote",        icon: "happy",         labelKey: "categoryEmotes" },
];

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const T = useT();
  const {
    profile,
    updateCardBack, updateCardDesign, updateTableDesign,
    updateAvatar, updateFrame, updateTitle, updateEffect,
  } = useProfile();
  const [activeCat, setActiveCat] = useState<StoreItemCategory>("card_back");

  const isDark = profile.darkMode !== false;
  const theme = isDark ? Colors : LightColors;
  const themeGold = isDark ? Colors.gold : "#A07800";
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const owned = profile.ownedItems ?? [];
  const items = useMemo(
    () => STORE_ITEMS.filter((i) => i.category === activeCat),
    [activeCat]
  );

  const ownedCount = items.filter((i) => owned.includes(i.id) || i.isDefault).length;

  const equippedId = (cat: StoreItemCategory): string | undefined => {
    switch (cat) {
      case "card_back":    return profile.cardBackId;
      case "card_design":  return profile.cardDesignId;
      case "table_design": return profile.tableDesignId;
      case "avatar":       return profile.avatarId;
      case "frame":        return profile.selectedFrameId;
      case "title":        return profile.titleId;
      case "effect":       return profile.selectedEffect;
      case "emote":        return undefined;
    }
  };

  const equip = async (item: StoreItem) => {
    await playSound("equip");
    switch (item.category) {
      case "card_back":    updateCardBack(item.id); break;
      case "card_design":  updateCardDesign(item.id); break;
      case "table_design": updateTableDesign(item.id); break;
      case "avatar":       updateAvatar(item.id); break;
      case "frame":        updateFrame(item.id); break;
      case "title":        updateTitle(item.id); break;
      case "effect":       updateEffect(item.id); break;
    }
  };

  const renderItem = ({ item }: { item: StoreItem }) => {
    const isOwned = item.isDefault || owned.includes(item.id);
    const isEquipped = equippedId(activeCat) === item.id;
    return (
      <BouncePressable
        onPress={() => isOwned && !isEquipped && equip(item)}
        style={[
          styles.gridItem,
          { backgroundColor: theme.surface, borderColor: isEquipped ? themeGold : theme.border },
          !isOwned && { opacity: 0.45 },
        ]}
      >
        <View style={[styles.itemIconWrap, { backgroundColor: theme.card }]}>
          <Ionicons
            name={(item.category === "card_back" ? "card" : item.category === "avatar" ? "person" : item.category === "frame" ? "ellipse" : item.category === "title" ? "ribbon" : item.category === "effect" ? "sparkles" : item.category === "emote" ? "happy" : "square") as any}
            size={32}
            color={isOwned ? themeGold : theme.textDim}
          />
          {!isOwned && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.itemName, { color: isOwned ? theme.text : theme.textMuted }]} numberOfLines={1}>
          {item.name}
        </Text>
        {isEquipped && (
          <View style={[styles.equippedBadge, { backgroundColor: themeGold }]}>
            <Ionicons name="checkmark" size={10} color="#000" />
            <Text style={styles.equippedText}>{T("equipped")}</Text>
          </View>
        )}
      </BouncePressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: themeGold }]}>{T("tabCollection")}</Text>
        <View style={[styles.counterBadge, { backgroundColor: themeGold + "22", borderColor: themeGold + "44" }]}>
          <Ionicons name="albums" size={14} color={themeGold} />
          <Text style={[styles.counterText, { color: themeGold }]}>{ownedCount}/{items.length}</Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        renderItem={({ item: cat }) => {
          const isActive = activeCat === cat.id;
          return (
            <Pressable
              onPress={() => setActiveCat(cat.id as StoreItemCategory)}
              style={[
                styles.catBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isActive && { borderColor: themeGold, backgroundColor: themeGold + "22" },
              ]}
            >
              <Ionicons name={cat.icon as any} size={16} color={isActive ? themeGold : theme.textMuted} />
              <Text style={[styles.catLabel, { color: isActive ? themeGold : theme.textMuted }]}>
                {T(cat.labelKey as any)}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={3}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="albums-outline" size={48} color={theme.textDim} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>—</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, letterSpacing: 4 },
  counterBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  counterText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  catRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  catBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
    height: 36,
  },
  catLabel: { fontFamily: "Nunito_700Bold", fontSize: 12 },
  gridContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  gridItem: {
    flex: 1, aspectRatio: 0.85, borderRadius: 12, padding: 10,
    borderWidth: 1, alignItems: "center", justifyContent: "space-between",
    maxWidth: "33%",
  },
  itemIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  lockBadge: {
    position: "absolute", top: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  itemName: { fontFamily: "Nunito_700Bold", fontSize: 11, textAlign: "center" },
  equippedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  equippedText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: "#000" },
  emptyWrap: { alignItems: "center", padding: 40, gap: 10 },
  emptyText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
});
