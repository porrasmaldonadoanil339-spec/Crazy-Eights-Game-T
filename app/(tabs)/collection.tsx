import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/hooks/useT";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory, localizeItem } from "@/lib/storeItems";
import { TranslationKey } from "@/lib/i18n";
import { getOwnedExclusives, ExclusiveCategory } from "@/lib/battlePass";
import BouncePressable from "@/components/BouncePressable";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { ItemPreview } from "@/components/ItemPreview";
import { playSound } from "@/lib/sounds";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type CategoryDef = { id: StoreItemCategory; icon: IconName; labelKey: TranslationKey };

type GridItem = StoreItem & { isExclusive?: boolean; seasonNumber?: number };

const EXCLUSIVE_CATEGORIES: StoreItemCategory[] = ["card_back", "avatar", "frame", "title"];

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

const RARITY_COLOR: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  event: "#FF6B6B",
  legendary: "#D4AF37",
};

const RARITY_ORDER: Record<string, number> = {
  common: 0, rare: 1, epic: 2, event: 3, legendary: 4,
};


export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const T = useT();
  const {
    profile,
    updateCardBack, updateCardDesign, updateTableDesign,
    updateAvatar, updateFrame, updateTitle, updateEffect,
    updateEquippedEmotes,
  } = useProfile();
  const [activeCat, setActiveCat] = useState<StoreItemCategory>("card_back");
  const [infoItem, setInfoItem] = useState<StoreItem | null>(null);

  const isDark = profile.darkMode !== false;
  const theme = isDark ? Colors : LightColors;
  const themeGold = isDark ? Colors.gold : "#A07800";
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const rawLang = profile.language ?? "es";
  const lang: "es"|"en"|"pt" = rawLang === "en" || rawLang === "pt" ? rawLang : "es";

  const owned = profile.ownedItems ?? [];
  const items = useMemo<GridItem[]>(() => {
    const base: GridItem[] = STORE_ITEMS.filter((i) => i.category === activeCat);
    if (EXCLUSIVE_CATEGORIES.includes(activeCat)) {
      const exs = getOwnedExclusives(owned, activeCat as ExclusiveCategory, lang);
      for (const ex of exs) {
        base.push({
          id: ex.id,
          category: activeCat,
          name: ex.name,
          description: "",
          price: 0,
          preview: ex.icon,
          previewColor: ex.iconColor,
          rarity: "legendary",
          isExclusive: true,
          seasonNumber: ex.seasonNumber,
        });
      }
    }
    base.sort((a, b) => {
      const ra = RARITY_ORDER[a.rarity] ?? 0;
      const rb = RARITY_ORDER[b.rarity] ?? 0;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    return base;
  }, [activeCat, owned, lang]);

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

  const equippedEmotes = profile.equippedEmotes ?? [];
  const isEmoteEquipped = (id: string) => equippedEmotes.includes(id);

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
      case "emote": {
        if (isEmoteEquipped(item.id)) {
          updateEquippedEmotes(equippedEmotes.filter(id => id !== item.id));
        } else if (equippedEmotes.length < 8) {
          updateEquippedEmotes([...equippedEmotes, item.id]);
        } else {
          setInfoItem(item);
        }
        break;
      }
    }
  };

  const rarityLabel = (r: string) => {
    switch (r) {
      case "rare":      return T("rarityRare");
      case "epic":      return T("rarityEpic");
      case "event":     return "EVENTO";
      case "legendary": return T("rarityLegendary");
      default:          return T("rarityCommon");
    }
  };

  const renderItem = ({ item }: { item: GridItem }) => {
    const isOwned = item.isDefault || owned.includes(item.id);
    const isEquipped = activeCat === "emote"
      ? isEmoteEquipped(item.id)
      : equippedId(activeCat) === item.id;
    const isExclusive = !!item.isExclusive;
    const rarityColor = RARITY_COLOR[item.rarity] ?? "#95A5A6";
    const localized = isExclusive ? { name: item.name, description: "" } : localizeItem(item, lang);

    const handlePress = () => {
      if (!isOwned) {
        setInfoItem(item);
        return;
      }
      if (activeCat === "emote") {
        equip(item);
      } else if (!isEquipped) {
        equip(item);
      } else {
        setInfoItem(item);
      }
    };

    return (
      <BouncePressable
        onPress={handlePress}
        style={styles.gridItem}
      >
        <View style={styles.previewSlot}>
          <ItemPreview item={item} lang={lang} />

          {isEquipped && (
            <View style={[styles.equippedBadgeFloat, { backgroundColor: themeGold }]} pointerEvents="none">
              <Ionicons name="checkmark" size={12} color="#000" />
            </View>
          )}

          {!isOwned && (
            <View style={styles.lockOverlay} pointerEvents="none">
              <View style={[styles.lockCircle, { backgroundColor: rarityColor + "EE", borderColor: rarityColor }]}>
                <Ionicons name="lock-closed" size={22} color="#fff" />
              </View>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.itemName,
            { color: isOwned ? theme.text : theme.textMuted },
          ]}
          numberOfLines={1}
        >
          {localized.name}
        </Text>

        {isExclusive ? (
          <View style={styles.exclusiveBadge}>
            <Ionicons name="star" size={8} color="#000" />
            <Text style={styles.exclusiveBadgeText} numberOfLines={1}>
              {T("limitedEditionSeason").replace("{n}", String(item.seasonNumber))}
            </Text>
          </View>
        ) : (
          <View style={[styles.rarityChip, { backgroundColor: rarityColor + "22", borderColor: rarityColor + "55" }]}>
            <Text style={[styles.rarityChipText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
          </View>
        )}

        {isEquipped && (
          <Text style={[styles.equippedTextLine, { color: themeGold }]}>
            {T("equipped")}
          </Text>
        )}
      </BouncePressable>
    );
  };

  const infoRarityColor = infoItem ? (RARITY_COLOR[infoItem.rarity] ?? "#95A5A6") : "#95A5A6";
  const infoLocalized = infoItem ? localizeItem(infoItem, lang) : null;
  const infoOwned = !!(infoItem && (infoItem.isDefault || owned.includes(infoItem.id)));

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
              onPress={() => setActiveCat(cat.id)}
              style={[
                styles.catBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isActive && { borderColor: themeGold, backgroundColor: themeGold + "22" },
              ]}
            >
              <Ionicons name={cat.icon} size={16} color={isActive ? themeGold : theme.textMuted} />
              <Text style={[styles.catLabel, { color: isActive ? themeGold : theme.textMuted }]}>
                {T(cat.labelKey as TranslationKey)}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="albums-outline" size={48} color={theme.textDim} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>—</Text>
          </View>
        }
      />

      <Modal
        visible={!!infoItem}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoItem(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoItem(null)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: infoRarityColor + "AA" }]} onPress={() => {}}>
            <LinearGradient
              colors={[infoRarityColor + "22", "transparent"] as [string, string]}
              style={StyleSheet.absoluteFill}
            />
            {infoItem && (
              <>
                <View style={styles.modalPreviewSlot}>
                  <ItemPreview item={infoItem} lang={lang} />
                </View>
                <Text style={[styles.modalName, { color: theme.text }]}>{infoLocalized?.name}</Text>
                <View style={[styles.rarityChip, { backgroundColor: infoRarityColor + "22", borderColor: infoRarityColor + "55", marginTop: 6 }]}>
                  <Text style={[styles.rarityChipText, { color: infoRarityColor }]}>{rarityLabel(infoItem.rarity)}</Text>
                </View>
                <Text style={[styles.modalDesc, { color: theme.textMuted }]}>{infoLocalized?.description}</Text>
                {!infoOwned && (
                  <View style={styles.modalLockRow}>
                    <Ionicons name="lock-closed" size={14} color={infoRarityColor} />
                    <Text style={[styles.modalLockText, { color: infoRarityColor }]}>{T("locked")}</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => setInfoItem(null)}
                  style={[styles.modalCloseBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                >
                  <Text style={[styles.modalCloseText, { color: theme.text }]}>{T("close")}</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  gridContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },
  gridItem: {
    flex: 1, paddingVertical: 8, paddingHorizontal: 4,
    alignItems: "center",
    maxWidth: "48%",
    gap: 8,
  },
  previewSlot: {
    minHeight: 120,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  itemName: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, textAlign: "center", marginTop: 2 },
  rarityChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1,
  },
  rarityChipText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 0.5 },
  equippedBadgeFloat: {
    position: "absolute", top: -4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#000",
    zIndex: 10,
  },
  equippedTextLine: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 1, marginTop: 2,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
  },
  lockCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  exclusiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
    backgroundColor: "#D4AF37",
    maxWidth: "100%",
  },
  exclusiveBadgeText: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 7, color: "#000",
    letterSpacing: 0.3,
  },
  emptyWrap: { alignItems: "center", padding: 40, gap: 10 },
  emptyText: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    width: "100%", maxWidth: 320, borderRadius: 18, padding: 20,
    borderWidth: 2, alignItems: "center", overflow: "hidden",
  },
  modalPreviewSlot: { height: 120, width: "100%", alignItems: "center", justifyContent: "center" },
  modalName: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, marginTop: 10, textAlign: "center" },
  modalDesc: { fontFamily: "Nunito_500Medium", fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 18 },
  modalLockRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
  },
  modalLockText: { fontFamily: "Nunito_800ExtraBold", fontSize: 12, letterSpacing: 1 },
  modalCloseBtn: {
    marginTop: 18, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  modalCloseText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
});

