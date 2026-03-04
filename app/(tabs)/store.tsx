import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Modal, FlatList,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory, CARD_BACKS, AVATARS, AVATAR_FRAMES, TITLES, EFFECTS, EMOTES, localizeItem } from "@/lib/storeItems";
import { playSound } from "@/lib/sounds";
import { useT } from "@/hooks/useT";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

function useRarityLabel() {
  const T = useT();
  return (rarity: string) => {
    if (rarity === "common") return T("rarityCommon").toUpperCase();
    if (rarity === "rare") return T("rarityRare").toUpperCase();
    if (rarity === "epic") return T("rarityEpic").toUpperCase();
    if (rarity === "legendary") return T("rarityLegendary").toUpperCase();
    return rarity.toUpperCase();
  };
}

  const CATEGORIES: { id: StoreItemCategory; icon: string; count: number }[] = [
    { id: "card_back", icon: "card",          count: STORE_ITEMS.filter(i => i.category === "card_back").length },
    { id: "avatar",    icon: "person-circle", count: STORE_ITEMS.filter(i => i.category === "avatar").length },
    { id: "frame",     icon: "ellipse",       count: STORE_ITEMS.filter(i => i.category === "frame").length },
    { id: "title",     icon: "ribbon",        count: STORE_ITEMS.filter(i => i.category === "title").length },
    { id: "effect",    icon: "sparkles",      count: STORE_ITEMS.filter(i => i.category === "effect").length },
    { id: "emote",     icon: "chatbubble-ellipses", count: EMOTES.length },
  ];

function ConfirmModal({
  item, visible, onConfirm, onCancel,
}: { item: StoreItem | null; visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const rarityLabel = useRarityLabel();
  if (!item) return null;
  const localized = localizeItem(item, lang);
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  const modalGrad = theme.isDark ? ["#0a1a0c","#061209"] as const : ["#e0f0d8","#cce4c4"] as const;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={[styles.modalBg, { backgroundColor: theme.overlay }]}>
        <View style={[styles.confirmModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <LinearGradient colors={modalGrad} style={StyleSheet.absoluteFill} />
          <View style={[styles.confirmIconWrap, { backgroundColor: item.previewColor + "33", borderColor: rarityColor + "66", borderWidth: 1.5 }]}>
            <Ionicons name={item.preview as any} size={32} color={item.previewColor} />
          </View>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22" }]}>
            <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
          </View>
          <Text style={[styles.confirmName, { color: theme.text }]}>{localized.name}</Text>
          <Text style={[styles.confirmDesc, { color: theme.textMuted }]}>{localized.description}</Text>
          <View style={styles.priceRow}>
            <Ionicons name="cash" size={18} color={theme.gold} />
            <Text style={[styles.priceText, { color: theme.gold }]}>{item.price} {T("coins")}</Text>
          </View>
          <View style={styles.confirmBtns}>
            <Pressable onPress={onCancel} style={[styles.cancelBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cancelText, { color: theme.textMuted }]}>{T("cancel")}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.buyBtn}>
              <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.buyBtnGrad}>
                <Ionicons name="bag-check" size={16} color="#1a0a00" />
                <Text style={styles.buyBtnText}>{T("buy")}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EquipBadge({ isEquipped, onEquip, T }: { isEquipped: boolean; onEquip: () => void; T: (k: any) => string }) {
  const theme = useTheme();
  if (isEquipped) {
    return (
      <View style={[styles.equipActiveBadge, { backgroundColor: Colors.gold + "22", borderColor: Colors.gold + "55" }]}>
        <Ionicons name="checkmark-circle" size={12} color={Colors.gold} />
        <Text style={[styles.equipActiveText, { color: Colors.gold }]}>{T("inUse")}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onEquip}
      style={({ pressed }) => [
        styles.equipBtn,
        { backgroundColor: theme.surface, borderColor: theme.gold + "66" },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name="checkmark" size={11} color={theme.gold} />
      <Text style={[styles.equipBtnText, { color: theme.gold }]}>{T("equip")}</Text>
    </Pressable>
  );
}

function EffectCard({ item, owned, isEquipped, onPress, onEquip }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; onPress: () => void; onEquip: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const rarityLabel = useRarityLabel();
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.effectCard,
        { borderColor: isEquipped ? Colors.gold + "88" : rarityColor + "55", backgroundColor: theme.surface },
        isEquipped && styles.effectCardEquipped,
        pressed && !owned && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <LinearGradient colors={[rarityColor + "18", rarityColor + "06"]} style={styles.effectGrad}>
        <View style={[styles.effectIconWrap, { backgroundColor: item.previewColor + "33", borderColor: item.previewColor + "44" }]}>
          <Ionicons name={item.preview as any} size={30} color={item.previewColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.effectTopRow}>
            <Text style={[styles.effectName, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.effectRarityBadge, { backgroundColor: rarityColor + "22" }]}>
              <Text style={[styles.effectRarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
            </View>
          </View>
          <Text style={[styles.effectDesc, { color: theme.textMuted }]}>{item.description}</Text>
          <View style={styles.effectFooter}>
            {owned ? (
              <EquipBadge isEquipped={isEquipped} onEquip={onEquip} T={T} />
            ) : item.isDefault ? (
              <Text style={styles.freeText}>{T("free")}</Text>
            ) : (
              <View style={styles.priceRowSm}>
                <Ionicons name="cash" size={12} color={Colors.gold} />
                <Text style={styles.priceSmText}>{item.price}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function StoreItemCard({ item, owned, isEquipped, onPress, onEquip }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; onPress: () => void; onEquip: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const rarityLabel = useRarityLabel();
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.itemCard,
        { borderColor: isEquipped ? Colors.gold + "88" : rarityColor + "55", backgroundColor: theme.surface },
        isEquipped && styles.itemCardEquipped,
        pressed && !owned && styles.itemCardPressed,
      ]}
    >
      <LinearGradient colors={[rarityColor + "18", "transparent"]} style={styles.itemGrad}>
        <View style={[styles.rarityBadgeSmall]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
        </View>
        {item.category === "card_back" ? (
          <LinearGradient
            colors={(item.backColors ?? [item.previewColor, item.previewColor + "88"]) as [string, string]}
            style={styles.cardPreview}
          >
            <Text style={[styles.cardPreviewDot, { color: item.backAccent ?? Colors.gold }]}>◆</Text>
            <Text style={[styles.cardPreviewDot2, { color: item.backAccent ?? Colors.gold, opacity: 0.3 }]}>◆</Text>
          </LinearGradient>
        ) : item.category === "frame" ? (
          <View style={styles.framePreviewWrap}>
            <View style={[styles.frameCircleOuter, { borderColor: (item.backColors?.[0] ?? item.previewColor) }]}>
              <View style={[styles.frameCircleInner, { borderColor: (item.backColors?.[1] ?? item.previewColor) + "88" }]}>
                <Ionicons name="person" size={20} color={item.previewColor + "88"} />
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.iconPreview, { backgroundColor: item.previewColor + "33" }]}>
            <Ionicons name={item.preview as any} size={28} color={owned ? item.previewColor : item.previewColor + "aa"} />
          </View>
        )}
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemFooter}>
          {owned ? (
            <EquipBadge isEquipped={isEquipped} onEquip={onEquip} T={T} />
          ) : item.isDefault ? (
            <Text style={styles.freeText}>{T("free")}</Text>
          ) : (
            <View style={styles.priceRowSm}>
              <Ionicons name="cash" size={12} color={Colors.gold} />
              <Text style={styles.priceSmText}>{item.price}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function EmoteCard({ item, owned, isEquipped, equippedCount, onPress, onToggle }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; equippedCount: number; onPress: () => void; onToggle: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const rarityLabel = useRarityLabel();
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.effectCard,
        { borderColor: isEquipped ? Colors.gold + "88" : rarityColor + "55", backgroundColor: theme.surface },
        isEquipped && styles.effectCardEquipped,
        pressed && !owned && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <LinearGradient colors={[rarityColor + "18", rarityColor + "06"]} style={styles.effectGrad}>
        <View style={[styles.effectIconWrap, { backgroundColor: item.previewColor + "33", borderColor: item.previewColor + "44", width: 44, height: 44 }]}>
          <Ionicons name={item.preview as any} size={22} color={item.previewColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.effectTopRow}>
            <Text style={[styles.effectName, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.effectRarityBadge, { backgroundColor: rarityColor + "22" }]}>
              <Text style={[styles.effectRarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
            </View>
          </View>
          <Text style={[styles.effectDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.description}</Text>
          <View style={styles.effectFooter}>
            {owned ? (
              <Pressable
                onPress={onToggle}
                style={({ pressed }) => [
                  styles.equipBtn,
                  isEquipped
                    ? { backgroundColor: Colors.gold + "33", borderColor: Colors.gold + "99" }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name={isEquipped ? "checkmark-circle" : "add-circle-outline"} size={12} color={isEquipped ? Colors.gold : theme.textMuted} />
                <Text style={[styles.equipBtnText, { color: isEquipped ? Colors.gold : theme.textMuted }]}>
                  {isEquipped ? T("equipped") : (equippedCount >= 8 ? "8/8" : T("equip"))}
                </Text>
              </Pressable>
            ) : item.isDefault ? (
              <Text style={styles.freeText}>{T("free")}</Text>
            ) : (
              <View style={styles.priceRowSm}>
                <Ionicons name="cash" size={12} color={Colors.gold} />
                <Text style={styles.priceSmText}>{item.price}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { profile, buyItem, updateCardBack, updateAvatar, updateTitle, updateFrame, updateEffect, updateEquippedEmotes } = useProfile();
  const [category, setCategory] = useState<StoreItemCategory>("card_back");
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const catScrollRef = useRef<ScrollView>(null);

  const T = useT();
  const theme = useTheme();
  const swipeHandlers = useSwipeTabs(2);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const lang = profile.language ?? "es";
  const items = STORE_ITEMS.filter((i) => i.category === category).map((i) => localizeItem(i, lang));
  const isEffects = category === "effect";
  const isEmotes = category === "emote";

  const isDark = profile.darkMode !== false;
  const themeColors = isDark ? Colors : LightColors;
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const themeGold = themeColors.gold;

  const equippedEmotes: string[] = profile.equippedEmotes ?? ["emote_gg", "emote_ocho", "emote_bravo", "emote_lol", "emote_no", "emote_si", "emote_jaja", "emote_bien"];

  const CATEGORY_LABELS: Record<StoreItemCategory, string> = {
    card_back: T("categoryCardBacks"),
    avatar: T("categoryAvatars"),
    frame: T("categoryFrames"),
    title: T("categoryTitles"),
    effect: T("categoryEffects"),
    emote: T("categoryEmotes"),
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  function getEquippedId(cat: StoreItemCategory): string {
    if (cat === "card_back") return profile.cardBackId ?? "back_default";
    if (cat === "avatar") return profile.avatarId ?? "avatar_knight";
    if (cat === "title") return profile.titleId ?? "title_novice";
    if (cat === "frame") return profile.selectedFrameId ?? "frame_gold";
    if (cat === "effect") return profile.selectedEffect ?? "none";
    return "";
  }

  function equipItem(item: StoreItem) {
    playSound("equip").catch(() => {});
    if (item.category === "card_back") updateCardBack(item.id);
    else if (item.category === "avatar") updateAvatar(item.id);
    else if (item.category === "title") updateTitle(item.id);
    else if (item.category === "frame") updateFrame(item.id);
    else if (item.category === "effect") updateEffect(item.id);
    showToast(`${item.name} ${T("equippedItem")}!`);
  }

  function toggleEmote(item: StoreItem) {
    const isEquipped = equippedEmotes.includes(item.id);
    if (isEquipped) {
      updateEquippedEmotes(equippedEmotes.filter(id => id !== item.id));
      playSound("equip").catch(() => {});
      showToast(T("emoteUnequipped"));
    } else {
      if (equippedEmotes.length >= 8) {
        playSound("error").catch(() => {});
        showToast(T("emoteSlotsFull"));
        return;
      }
      updateEquippedEmotes([...equippedEmotes, item.id]);
      playSound("equip").catch(() => {});
      showToast(T("emoteEquipped"));
    }
  }

  const handlePurchase = async () => {
    if (!confirmItem) return;
    setConfirmItem(null);
    if (profile.coins < confirmItem.price) {
      await playSound("error");
      showToast(T("insufficientCoins"));
      return;
    }
    const success = buyItem(confirmItem);
    if (success) {
      await playSound("purchase");
      if (confirmItem.category === "card_back") updateCardBack(confirmItem.id);
      if (confirmItem.category === "avatar") updateAvatar(confirmItem.id);
      if (confirmItem.category === "title") updateTitle(confirmItem.id);
      if (confirmItem.category === "frame") updateFrame(confirmItem.id);
      if (confirmItem.category === "effect") updateEffect(confirmItem.id);
      showToast(`${confirmItem.name} ${T("obtainedItem")}!`);
    }
  };

  const ownedCount = items.filter(i => profile.ownedItems.includes(i.id) || i.isDefault).length;
  const equippedId = getEquippedId(category);

  return (
    <View style={[styles.container, { paddingTop: topPad }]} {...swipeHandlers}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: themeGold }]}>{T("store")}</Text>
          {isEmotes
            ? <Text style={styles.screenSub}>{equippedEmotes.length}/8 {T("emotesEquipped")}</Text>
            : <Text style={styles.screenSub}>{ownedCount}/{items.length} {T("inCategory")}</Text>
          }
        </View>
        <View style={styles.coinsBig}>
          <Ionicons name="cash" size={18} color={themeGold} />
          <Text style={[styles.coinsNum, { color: themeGold }]}>{profile.coins}</Text>
        </View>
      </View>

      <ScrollView
        ref={catScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.catScrollView, { flexShrink: 0 }]}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => { setCategory(cat.id); playSound("tab").catch(() => {}); }}
              style={[
                styles.catBtn,
                { backgroundColor: theme.surface, borderColor: isActive ? themeGold : theme.border },
                isActive && { backgroundColor: themeGold + "22" },
              ]}
            >
              <Ionicons name={cat.icon as any} size={15} color={isActive ? themeGold : theme.textMuted} />
              <Text style={[styles.catLabel, { color: isActive ? themeGold : theme.textMuted }]}>{CATEGORY_LABELS[cat.id]}</Text>
              <View style={[styles.catCount, isActive && { backgroundColor: themeGold + "33" }]}>
                <Text style={[styles.catCountText, { color: isActive ? themeGold : theme.textDim }]}>{cat.count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          (isEffects || isEmotes) ? styles.listContent : styles.grid,
          { paddingBottom: bottomPad + 90 }
        ]}
      >
        {isEffects ? (
          items.map((item) => {
            const owned = profile.ownedItems.includes(item.id) || !!item.isDefault;
            return (
              <EffectCard
                key={item.id}
                item={item}
                owned={owned}
                isEquipped={equippedId === item.id}
                onPress={() => { if (!item.isDefault) setConfirmItem(item); }}
                onEquip={() => equipItem(item)}
              />
            );
          })
        ) : isEmotes ? (
          items.map((item) => {
            const owned = profile.ownedItems.includes(item.id) || !!item.isDefault;
            const isEquipped = equippedEmotes.includes(item.id);
            return (
              <EmoteCard
                key={item.id}
                item={item}
                owned={owned}
                isEquipped={isEquipped}
                equippedCount={equippedEmotes.length}
                onPress={() => { if (!item.isDefault && !owned) setConfirmItem(item); }}
                onToggle={() => { if (owned) toggleEmote(item); }}
              />
            );
          })
        ) : (
          items.map((item) => {
            const owned = profile.ownedItems.includes(item.id) || !!item.isDefault;
            return (
              <StoreItemCard
                key={item.id}
                item={item}
                owned={owned}
                isEquipped={equippedId === item.id}
                onPress={() => { if (!item.isDefault) setConfirmItem(item); }}
                onEquip={() => equipItem(item)}
              />
            );
          })
        )}
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <ConfirmModal
        item={confirmItem}
        visible={!!confirmItem}
        onConfirm={handlePurchase}
        onCancel={() => setConfirmItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 4 },
  screenSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim, marginTop: 2 },
  coinsBig: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  coinsNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold },
  catScrollView: { flexShrink: 0, flexGrow: 0, height: 75, marginBottom: 6 },
  catRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row", alignItems: "center" },
  catBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    minHeight: 40,
  },
  catBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + "22" },
  catLabel: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  catLabelActive: { color: Colors.gold },
  catCount: {
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: "center",
  },
  catCountActive: { backgroundColor: Colors.gold + "33" },
  catCountText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9, color: Colors.textDim },
  grid: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  listContent: { paddingHorizontal: 16, gap: 10 },
  itemCard: {
    width: "47.5%", borderRadius: 16, overflow: "hidden",
    borderWidth: 1.5, backgroundColor: Colors.surface,
  },
  itemCardEquipped: { borderWidth: 2 },
  itemCardOwned: { opacity: 0.85 },
  itemCardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  itemGrad: { padding: 12, minHeight: 170, justifyContent: "space-between" },
  rarityBadgeSmall: { alignSelf: "flex-start", marginBottom: 8 },
  rarityText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, letterSpacing: 1 },
  cardPreview: {
    width: 46, height: 64, borderRadius: 7, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.gold + "55", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
  },
  cardPreviewDot: { fontSize: 16, position: "absolute" },
  cardPreviewDot2: { fontSize: 10, position: "absolute", bottom: 8, right: 8 },
  framePreviewWrap: { marginBottom: 8, alignSelf: "flex-start" },
  frameCircleOuter: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  frameCircleInner: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  iconPreview: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  itemName: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.text, marginBottom: 3 },
  itemDesc: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted, lineHeight: 14, flex: 1 },
  itemFooter: { marginTop: 6 },
  ownedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  ownedText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.success },
  freeText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textMuted },
  priceRowSm: { flexDirection: "row", alignItems: "center", gap: 3 },
  priceSmText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.gold },
  equipBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
    alignSelf: "flex-start",
  },
  equipBtnText: { fontFamily: "Nunito_700Bold", fontSize: 10 },
  equipActiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
    alignSelf: "flex-start",
  },
  equipActiveText: { fontFamily: "Nunito_700Bold", fontSize: 10 },
  // Effects card
  effectCard: {
    borderRadius: 16, overflow: "hidden", borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  effectCardEquipped: { borderWidth: 2 },
  effectCardOwned: { opacity: 0.85 },
  effectGrad: { padding: 14, flexDirection: "row", alignItems: "center", gap: 14, minHeight: 80 },
  effectIconWrap: {
    width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, flexShrink: 0,
  },
  effectTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  effectName: { fontFamily: "Nunito_900ExtraBold", fontSize: 15, color: Colors.text, flex: 1 },
  effectRarityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  effectRarityText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, letterSpacing: 0.5 },
  effectDesc: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.textMuted, lineHeight: 16 },
  effectFooter: { marginTop: 6 },
  // Modal
  modalBg: { flex: 1, backgroundColor: Colors.overlay, alignItems: "center", justifyContent: "center" },
  confirmModal: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 24, width: 300,
    alignItems: "center", gap: 8, borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
  },
  confirmIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  rarityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  rarityBadgeText: { fontFamily: "Nunito_900ExtraBold", fontSize: 9, letterSpacing: 1 },
  confirmName: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.text },
  confirmDesc: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textAlign: "center" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 4 },
  priceText: { fontFamily: "Nunito_900ExtraBold", fontSize: 20, color: Colors.gold },
  confirmBtns: { flexDirection: "row", gap: 10, width: "100%", marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 14, alignItems: "center",
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  buyBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  buyBtnGrad: { padding: 13, alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center" },
  buyBtnText: { fontFamily: "Nunito_900ExtraBold", fontSize: 14, color: "#1a0a00" },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
});
