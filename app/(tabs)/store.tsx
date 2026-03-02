import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory } from "@/lib/storeItems";
import { playSound } from "@/lib/sounds";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

const CATEGORIES: { id: StoreItemCategory; label: string; icon: string }[] = [
  { id: "card_back", label: "Dorsos", icon: "card" },
  { id: "avatar", label: "Avatares", icon: "person-circle" },
  { id: "frame", label: "Marcos", icon: "ellipse" },
  { id: "title", label: "Títulos", icon: "ribbon" },
];

function ConfirmModal({
  item, visible, onConfirm, onCancel,
}: { item: StoreItem | null; visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!item) return null;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalBg}>
        <View style={styles.confirmModal}>
          <View style={[styles.confirmIconWrap, { backgroundColor: item.previewColor + "33" }]}>
            <Ionicons name={item.preview as any} size={32} color={item.previewColor} />
          </View>
          <Text style={styles.confirmName}>{item.name}</Text>
          <Text style={styles.confirmDesc}>{item.description}</Text>
          <View style={styles.priceRow}>
            <Ionicons name="cash" size={16} color={Colors.gold} />
            <Text style={styles.priceText}>{item.price} monedas</Text>
          </View>
          <View style={styles.confirmBtns}>
            <Pressable onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.buyBtn}>
              <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.buyBtnGrad}>
                <Text style={styles.buyBtnText}>Comprar</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StoreItemCard({ item, owned, onPress }: { item: StoreItem; owned: boolean; onPress: () => void }) {
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      style={({ pressed }) => [
        styles.itemCard,
        { borderColor: rarityColor + "44" },
        owned && styles.itemCardOwned,
        pressed && !owned && styles.itemCardPressed,
      ]}
    >
      <LinearGradient colors={[rarityColor + "15", "transparent"]} style={styles.itemGrad}>
        <View style={styles.rarityBadge}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{item.rarity.toUpperCase()}</Text>
        </View>
        {item.category === "card_back" ? (
          <View style={[styles.cardPreview, { backgroundColor: item.previewColor }]}>
            <Text style={styles.cardPreviewDot}>◆</Text>
          </View>
        ) : (
          <View style={[styles.iconPreview, { backgroundColor: item.previewColor + "33" }]}>
            <Ionicons name={item.preview as any} size={28} color={owned ? item.previewColor : item.previewColor + "aa"} />
          </View>
        )}
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemFooter}>
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

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const items = STORE_ITEMS.filter((i) => i.category === category);

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

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#061209", "#0a1a0f", "#0d2418"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>TIENDA</Text>
        <View style={styles.coinsBig}>
          <Ionicons name="cash" size={18} color={Colors.gold} />
          <Text style={styles.coinsNum}>{profile.coins}</Text>
        </View>
      </View>

      <View style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
          >
            <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? Colors.gold : Colors.textMuted} />
            <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {items.map((item) => (
          <StoreItemCard
            key={item.id}
            item={item}
            owned={profile.ownedItems.includes(item.id)}
            onPress={() => {
              if (!item.isDefault) setConfirmItem(item);
            }}
          />
        ))}
        <View style={{ height: 100 }} />
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_900ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 4 },
  coinsBig: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  coinsNum: { fontFamily: "Nunito_900ExtraBold", fontSize: 16, color: Colors.gold },
  catRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  catBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  catBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + "22" },
  catLabel: { fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted },
  catLabelActive: { color: Colors.gold },
  grid: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  itemCard: {
    width: "47.5%", borderRadius: 16, overflow: "hidden",
    borderWidth: 1.5, backgroundColor: Colors.surface,
  },
  itemCardOwned: { opacity: 0.8 },
  itemCardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  itemGrad: { padding: 14, minHeight: 160, justifyContent: "space-between" },
  rarityBadge: { alignSelf: "flex-start", marginBottom: 8 },
  rarityText: { fontFamily: "Nunito_900ExtraBold", fontSize: 8, letterSpacing: 1 },
  cardPreview: {
    width: 44, height: 62, borderRadius: 6, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.gold + "55", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
  cardPreviewDot: { fontSize: 16, color: Colors.gold, opacity: 0.5 },
  iconPreview: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  itemName: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.text, marginBottom: 4 },
  itemDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textMuted, lineHeight: 15, flex: 1 },
  itemFooter: { marginTop: 8 },
  ownedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  ownedText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.success },
  freeText: { fontFamily: "Nunito_700Bold", fontSize: 11, color: Colors.textMuted },
  priceRowSm: { flexDirection: "row", alignItems: "center", gap: 4 },
  priceSmText: { fontFamily: "Nunito_900ExtraBold", fontSize: 13, color: Colors.gold },
  modalBg: { flex: 1, backgroundColor: Colors.overlay, alignItems: "center", justifyContent: "center" },
  confirmModal: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: 300,
    alignItems: "center", gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  confirmIconWrap: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  confirmName: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.text },
  confirmDesc: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textAlign: "center" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 4 },
  priceText: { fontFamily: "Nunito_900ExtraBold", fontSize: 18, color: Colors.gold },
  confirmBtns: { flexDirection: "row", gap: 10, width: "100%", marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12, alignItems: "center",
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  buyBtn: { flex: 1, borderRadius: 12, overflow: "hidden" },
  buyBtnGrad: { padding: 13, alignItems: "center" },
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
