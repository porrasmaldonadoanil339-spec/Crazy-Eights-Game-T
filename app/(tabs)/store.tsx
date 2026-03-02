import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Modal, FlatList,
} from "react-native";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory, CARD_BACKS, AVATARS, AVATAR_FRAMES, TITLES, EFFECTS } from "@/lib/storeItems";
import { playSound } from "@/lib/sounds";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

const RARITY_LABELS: Record<string, string> = {
  common: "COMÚN",
  rare: "RARO",
  epic: "ÉPICO",
  legendary: "LEGENDARIO",
};

const CATEGORIES: { id: StoreItemCategory; label: string; icon: string; count: number }[] = [
  { id: "card_back", label: "Dorsos",   icon: "card",          count: CARD_BACKS.length },
  { id: "avatar",    label: "Avatares", icon: "person-circle", count: AVATARS.length },
  { id: "frame",     label: "Marcos",   icon: "ellipse",       count: AVATAR_FRAMES.length },
  { id: "title",     label: "Títulos",  icon: "ribbon",        count: TITLES.length },
  { id: "effect",    label: "Efectos",  icon: "sparkles",      count: EFFECTS.length },
];

function ConfirmModal({
  item, visible, onConfirm, onCancel,
}: { item: StoreItem | null; visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!item) return null;
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalBg}>
        <View style={styles.confirmModal}>
          <LinearGradient colors={["#0a1a0c","#061209"]} style={StyleSheet.absoluteFill} />
          <View style={[styles.confirmIconWrap, { backgroundColor: item.previewColor + "33", borderColor: rarityColor + "66", borderWidth: 1.5 }]}>
            <Ionicons name={item.preview as any} size={32} color={item.previewColor} />
          </View>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22" }]}>
            <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{RARITY_LABELS[item.rarity]}</Text>
          </View>
          <Text style={styles.confirmName}>{item.name}</Text>
          <Text style={styles.confirmDesc}>{item.description}</Text>
          <View style={styles.priceRow}>
            <Ionicons name="cash" size={18} color={Colors.gold} />
            <Text style={styles.priceText}>{item.price} monedas</Text>
          </View>
          <View style={styles.confirmBtns}>
            <Pressable onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.buyBtn}>
              <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.buyBtnGrad}>
                <Ionicons name="bag-check" size={16} color="#1a0a00" />
                <Text style={styles.buyBtnText}>Comprar</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EffectCard({ item, owned, onPress }: { item: StoreItem; owned: boolean; onPress: () => void }) {
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.effectCard,
        { borderColor: rarityColor + "55" },
        owned && styles.effectCardOwned,
        pressed && !owned && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <LinearGradient colors={[rarityColor + "18", rarityColor + "06"]} style={styles.effectGrad}>
        <View style={[styles.effectIconWrap, { backgroundColor: item.previewColor + "33", borderColor: item.previewColor + "44" }]}>
          <Ionicons name={item.preview as any} size={30} color={item.previewColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.effectTopRow}>
            <Text style={styles.effectName}>{item.name}</Text>
            <View style={[styles.effectRarityBadge, { backgroundColor: rarityColor + "22" }]}>
              <Text style={[styles.effectRarityText, { color: rarityColor }]}>{RARITY_LABELS[item.rarity]}</Text>
            </View>
          </View>
          <Text style={styles.effectDesc}>{item.description}</Text>
          <View style={styles.effectFooter}>
            {owned ? (
              <View style={styles.ownedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.ownedText}>Obtenido</Text>
              </View>
            ) : item.isDefault ? (
              <Text style={styles.freeText}>Gratis</Text>
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

function StoreItemCard({ item, owned, onPress }: { item: StoreItem; owned: boolean; onPress: () => void }) {
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.itemCard,
        { borderColor: rarityColor + "55" },
        owned && styles.itemCardOwned,
        pressed && !owned && styles.itemCardPressed,
      ]}
    >
      <LinearGradient colors={[rarityColor + "18", "transparent"]} style={styles.itemGrad}>
        <View style={[styles.rarityBadgeSmall]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{RARITY_LABELS[item.rarity]}</Text>
        </View>
        {item.category === "card_back" ? (
          <LinearGradient
            colors={item.backColors ?? [item.previewColor, item.previewColor + "88"]}
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
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemFooter}>
          {owned ? (
            <View style={styles.ownedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
              <Text style={styles.ownedText}>Obtenido</Text>
            </View>
          ) : item.isDefault ? (
            <Text style={styles.freeText}>Gratis</Text>
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

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { profile, buyItem, updateCardBack, updateAvatar, updateTitle, updateFrame } = useProfile();
  const [category, setCategory] = useState<StoreItemCategory>("card_back");
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const catScrollRef = useRef<ScrollView>(null);

  const swipeHandlers = useSwipeTabs(2);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const items = STORE_ITEMS.filter((i) => i.category === category);
  const isEffects = category === "effect";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePurchase = async () => {
    if (!confirmItem) return;
    setConfirmItem(null);
    if (profile.coins < confirmItem.price) {
      await playSound("error");
      showToast("Monedas insuficientes");
      return;
    }
    const success = buyItem(confirmItem);
    if (success) {
      await playSound("purchase");
      if (confirmItem.category === "card_back") updateCardBack(confirmItem.id);
      if (confirmItem.category === "avatar") updateAvatar(confirmItem.id);
      if (confirmItem.category === "title") updateTitle(confirmItem.id);
      if (confirmItem.category === "frame") updateFrame(confirmItem.id);
      showToast(`¡${confirmItem.name} obtenido!`);
    }
  };

  const ownedCount = items.filter(i => profile.ownedItems.includes(i.id)).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]} {...swipeHandlers}>
      <LinearGradient colors={["#061209", "#0a1a0f", "#0d2418"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>TIENDA</Text>
          <Text style={styles.screenSub}>{ownedCount}/{items.length} en esta categoría</Text>
        </View>
        <View style={styles.coinsBig}>
          <Ionicons name="cash" size={18} color={Colors.gold} />
          <Text style={styles.coinsNum}>{profile.coins}</Text>
        </View>
      </View>

      <ScrollView
        ref={catScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
          >
            <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? Colors.gold : Colors.textMuted} />
            <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>{cat.label}</Text>
            <View style={[styles.catCount, category === cat.id && styles.catCountActive]}>
              <Text style={[styles.catCountText, category === cat.id && { color: Colors.gold }]}>{cat.count}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          isEffects ? styles.listContent : styles.grid,
          { paddingBottom: bottomPad + 90 }
        ]}
      >
        {isEffects ? (
          items.map((item) => (
            <EffectCard
              key={item.id}
              item={item}
              owned={profile.ownedItems.includes(item.id)}
              onPress={() => { if (!item.isDefault) setConfirmItem(item); }}
            />
          ))
        ) : (
          items.map((item) => (
            <StoreItemCard
              key={item.id}
              item={item}
              owned={profile.ownedItems.includes(item.id)}
              onPress={() => { if (!item.isDefault) setConfirmItem(item); }}
            />
          ))
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
  container: { flex: 1, backgroundColor: Colors.background },
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
  catRow: { paddingHorizontal: 16, gap: 8, marginBottom: 14, flexDirection: "row" },
  catBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 9, paddingHorizontal: 12, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
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
  itemCardOwned: { opacity: 0.75 },
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
  // Effects card
  effectCard: {
    borderRadius: 16, overflow: "hidden", borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  effectCardOwned: { opacity: 0.75 },
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
