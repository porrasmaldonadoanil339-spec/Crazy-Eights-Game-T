import { CoinIcon } from "@/components/CoinIcon";
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Modal, FlatList, Animated, Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, LightColors } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory, CARD_BACKS, AVATARS, AVATAR_FRAMES, TITLES, EFFECTS, EMOTES, localizeItem } from "@/lib/storeItems";
import { playSound } from "@/lib/sounds";
import { useT } from "@/hooks/useT";
import { router } from "expo-router";
import BouncePressable from "@/components/BouncePressable";
import { getDailyShopItems, getDailyFreeItem, getDailyDateKey, DailyShopItem } from "@/lib/dailyShop";

const RARITY_COLORS_MAP: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  legendary: "#D4AF37",
};

const RARITY_PRICE_MULTIPLIER: Record<string, number> = {
  common: 3,
  rare: 5,
  epic: 8,
  legendary: 15,
};

const RARITY_SORT_ORDER: Record<string, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

function applyPriceMultiplier(item: StoreItem): StoreItem {
  if (item.price === 0 || item.isDefault) return item;
  const mult = RARITY_PRICE_MULTIPLIER[item.rarity] ?? 1;
  return { ...item, price: Math.round(item.price * mult) };
}

function sortItemsByRarityAndPrice(items: StoreItem[]): StoreItem[] {
  return [...items].sort((a, b) => {
    const rarityDiff = (RARITY_SORT_ORDER[a.rarity] ?? 0) - (RARITY_SORT_ORDER[b.rarity] ?? 0);
    if (rarityDiff !== 0) return rarityDiff;
    return a.price - b.price;
  });
}

const RARITY_BORDER: Record<string, number> = { common: 1.5, rare: 2, epic: 2.5, legendary: 3 };
const RARITY_BORDER_COLOR: Record<string, string> = {
  common: "#95A5A655",
  rare:   "#4AA8FF99",
  epic:   "#C084FC99",
  legendary: "#D4AF37",
};
const PATTERN_SYMBOL: Record<string, string> = {
  diamonds: "◆", stars: "★", circles: "●", crosses: "✚", waves: "〜", hexagons: "⬡",
};

function CardDesignPreview({ item }: { item: StoreItem }) {
  const bg = item.backColors?.[0] ?? "#FEFDF4";
  const tc = item.backColors?.[1] ?? "#333333";
  const ac = item.backColors?.[2] ?? Colors.gold;
  const rarity = item.rarity;

  const borderColor = RARITY_BORDER_COLOR[rarity] ?? "#D4AF3755";
  const borderWidth = RARITY_BORDER[rarity] ?? 1.5;

  return (
    <View style={[styles.cardPreview, { borderWidth, borderColor, overflow: "hidden" }]}>
      {rarity === "legendary" ? (
        <LinearGradient
          colors={[bg, tc + "33", ac + "22", bg]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : rarity === "epic" ? (
        <LinearGradient
          colors={[bg, ac + "44", bg]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : rarity === "rare" ? (
        <LinearGradient
          colors={[bg, ac + "18"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
      )}

      {rarity === "legendary" && (
        <>
          <View style={{ position: "absolute", top: 3, left: 3, width: 9, height: 9, borderTopWidth: 2, borderLeftWidth: 2, borderColor: ac }} />
          <View style={{ position: "absolute", top: 3, right: 3, width: 9, height: 9, borderTopWidth: 2, borderRightWidth: 2, borderColor: ac }} />
          <View style={{ position: "absolute", bottom: 3, left: 3, width: 9, height: 9, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: ac }} />
          <View style={{ position: "absolute", bottom: 3, right: 3, width: 9, height: 9, borderBottomWidth: 2, borderRightWidth: 2, borderColor: ac }} />
          <View style={{ position: "absolute", left: 5, top: 12, bottom: 12, width: 1, backgroundColor: ac + "44" }} />
          <View style={{ position: "absolute", right: 5, top: 12, bottom: 12, width: 1, backgroundColor: ac + "44" }} />
        </>
      )}
      {rarity === "epic" && (
        <>
          <View style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 1, backgroundColor: tc + "55" }} />
          <View style={{ position: "absolute", right: 5, top: 8, bottom: 8, width: 1, backgroundColor: tc + "55" }} />
          <View style={{ position: "absolute", top: 4, left: 8, right: 8, height: 1, backgroundColor: tc + "33" }} />
        </>
      )}
      {rarity === "rare" && (
        <View style={{ position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderWidth: 0.5, borderRadius: 5, borderColor: ac + "44" }} />
      )}

      <View style={styles.cardFaceCornerTL}>
        <Text style={[styles.cardFaceRank, { color: tc }]}>8</Text>
        <Text style={[styles.cardFaceSuit, { color: rarity === "legendary" ? ac : tc }]}>♥</Text>
      </View>

      <View style={styles.cardFaceCenter}>
        {rarity === "legendary" ? (
          <>
            <Text style={{ fontSize: 13, color: ac, textShadowColor: ac, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }}>★</Text>
            <Text style={{ fontSize: 8, color: ac + "cc" }}>♦</Text>
          </>
        ) : rarity === "epic" ? (
          <View style={[styles.cardFaceBadge, { backgroundColor: tc + "dd", shadowColor: tc, shadowRadius: 4, shadowOpacity: 0.5, elevation: 3 }]}>
            <Text style={{ fontSize: 11, color: bg, fontWeight: "900" }}>♥</Text>
          </View>
        ) : (
          <>
            <View style={[styles.cardFaceBadge, { backgroundColor: tc + "cc" }]}>
              <Text style={styles.cardFaceBadgeSuit}>♥</Text>
            </View>
            <Text style={[styles.cardFaceBadgeNum, { color: tc }]}>8</Text>
          </>
        )}
      </View>

      <View style={styles.cardFaceCornerBR}>
        <Text style={[styles.cardFaceRank, { color: tc, transform: [{ rotate: "180deg" }] }]}>8</Text>
        <Text style={[styles.cardFaceSuit, { color: rarity === "legendary" ? ac : tc, transform: [{ rotate: "180deg" }] }]}>♥</Text>
      </View>

      <View style={[styles.cardFaceInnerBorder, { borderColor: ac + "44" }]} />

      {rarity === "legendary" && (
        <View style={{ position: "absolute", top: 1, left: 1, right: 1, bottom: 1, borderWidth: 0.5, borderRadius: 6, borderColor: ac + "55" }} />
      )}
    </View>
  );
}

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
    { id: "card_design", icon: "layers",      count: STORE_ITEMS.filter(i => i.category === "card_design").length },
    { id: "table_design", icon: "square",      count: STORE_ITEMS.filter(i => i.category === "table_design").length },
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
            <CoinIcon size={18} color={theme.gold} />
            <Text style={[styles.priceText, { color: theme.gold }]}>{item.price} {T("coins")}</Text>
          </View>
          <View style={styles.confirmBtns}>
            <Pressable onPress={onCancel} style={[styles.cancelBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cancelText, { color: theme.textMuted }]}>{T("cancel")}</Text>
            </Pressable>
            <BouncePressable onPress={onConfirm} style={styles.buyBtn}>
              <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.buyBtnGrad}>
                <Ionicons name="bag-check" size={16} color="#1a0a00" />
                <Text style={styles.buyBtnText}>{T("buy")}</Text>
              </LinearGradient>
            </BouncePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoModal({
  item, visible, onClose,
}: { item: StoreItem | null; visible: boolean; onClose: () => void }) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const rarityLabel = useRarityLabel();
  if (!item) return null;
  const localized = localizeItem(item, lang);
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  const modalGrad = theme.isDark ? ["#1a1a1a", "#0a0a0a"] as const : ["#ffffff", "#f0f0f0"] as const;

  let previewText = "";
  if (item.category === "effect") {
    previewText = T("effectInfoPreview") ?? "Este efecto se mostrará al jugar cartas especiales.";
  } else if (item.category === "emote") {
    previewText = `${T("emoteLabel") ?? "Emote"}: ${localized.name}`;
  } else if (item.category === "frame" || item.category === "avatar") {
    previewText = T("profileInfoPreview") ?? "Personaliza tu perfil con este item.";
  } else if (item.category === "card_back") {
    previewText = T("cardBackInfoPreview") ?? "Cambia el diseño del dorso de tus cartas.";
  } else if (item.category === "card_design") {
    previewText = T("cardDesignInfoPreview") ?? "Cambia el diseño frontal de tus cartas.";
  } else if (item.category === "table_design") {
    previewText = T("tableDesignInfoPreview") ?? "Cambia el diseño de la mesa de juego.";
  } else if (item.category === "title") {
    previewText = T("titleInfoPreview") ?? "Se muestra bajo tu nombre en el perfil.";
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalBg, { backgroundColor: theme.overlay }]}>
        <View style={[styles.infoModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <LinearGradient colors={modalGrad} style={StyleSheet.absoluteFill} />
          <View style={[styles.confirmIconWrap, { backgroundColor: item.previewColor + "33", borderColor: rarityColor + "66", borderWidth: 1.5 }]}>
            <Ionicons name={item.preview as any} size={32} color={item.previewColor} />
          </View>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22" }]}>
            <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
          </View>
          <Text style={[styles.confirmName, { color: theme.text }]}>{localized.name}</Text>
          <Text style={[styles.confirmDesc, { color: theme.textMuted, textAlign: 'center' }]}>{localized.description}</Text>
          
          <View style={[styles.infoPreviewBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoPreviewText, { color: theme.text }]}>{previewText}</Text>
          </View>

          <Pressable onPress={onClose} style={[styles.closeInfoBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cancelText, { color: theme.text }]}>{T("close")}</Text>
          </Pressable>
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

function EffectCard({ item, owned, isEquipped, isDailyHot, onPress, onEquip, onInfo }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; isDailyHot?: boolean; onPress: () => void; onEquip: () => void; onInfo: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const localized = localizeItem(item, lang);
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
        <Pressable 
          onPress={(e) => { e.stopPropagation(); onInfo(); }}
          style={styles.infoBtn}
        >
          <Ionicons name="help-circle-outline" size={18} color={theme.textMuted} />
        </Pressable>
        <View style={[styles.effectIconWrap, { backgroundColor: item.previewColor + "33", borderColor: item.previewColor + "44" }]}>
          <Ionicons name={item.preview as any} size={30} color={item.previewColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.effectTopRow}>
            <Text style={[styles.effectName, { color: theme.text }]}>{localized.name}</Text>
            <View style={[styles.effectRarityBadge, { backgroundColor: rarityColor + "22" }]}>
              <Text style={[styles.effectRarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
            </View>
          </View>
          <Text style={[styles.effectDesc, { color: theme.textMuted }]}>{localized.description}</Text>
          <View style={styles.effectFooter}>
            {owned ? (
              <EquipBadge isEquipped={isEquipped} onEquip={onEquip} T={T} />
            ) : item.isDefault ? (
              <Text style={styles.freeText}>{T("free")}</Text>
            ) : (
              <View style={styles.priceRowSm}>
                <CoinIcon size={12} color={Colors.gold} />
                <Text style={styles.priceSmText}>{item.price}</Text>
              </View>
            )}
          </View>
        </View>
        {isDailyHot && !owned && !item.isDefault && (
          <View style={styles.dailyBadge} pointerEvents="none">
            <LinearGradient colors={["#FF6B6B", "#C13E3E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyBadgeGrad}>
              <Ionicons name="flame" size={9} color="#fff" />
              <Text style={styles.dailyBadgeText}>HOY</Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function StoreItemCard({ item, owned, isEquipped, isDailyHot, onPress, onEquip, onInfo }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; isDailyHot?: boolean; onPress: () => void; onEquip: () => void; onInfo: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const localized = localizeItem(item, lang);
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
        <Pressable 
          onPress={(e) => { e.stopPropagation(); onInfo(); }}
          style={styles.infoBtn}
        >
          <Ionicons name="help-circle-outline" size={16} color={theme.textMuted} />
        </Pressable>
        <View style={[styles.rarityBadgeSmall]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
        </View>
        {item.category === "card_back" ? (
          <LinearGradient
            colors={(item.backColors?.slice(0,2) ?? [item.previewColor, item.previewColor + "88"]) as [string, string]}
            style={[styles.cardPreview, {
              borderWidth: RARITY_BORDER[item.rarity] ?? 1.5,
              borderColor: RARITY_BORDER_COLOR[item.rarity] ?? "#D4AF3755",
            }]}
          >
            <View style={styles.cardBackPatternWrap}>
              {[0,1,2].map(row => (
                <View key={row} style={{ flexDirection: "row", gap: 3 }}>
                  {[0,1,2,3].map(col => (
                    <Text key={col} style={{ fontSize: 7, color: item.backAccent ?? Colors.gold, opacity: 0.4 }}>
                      {PATTERN_SYMBOL[item.backPattern ?? "diamonds"] ?? "◆"}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
            <View style={[styles.cardBackEmblem, {
              backgroundColor: (item.backAccent ?? Colors.gold) + "28",
              borderColor: (item.backAccent ?? Colors.gold) + "66",
              width: item.rarity === "legendary" ? 26 : item.rarity === "epic" ? 24 : 22,
              height: item.rarity === "legendary" ? 26 : item.rarity === "epic" ? 24 : 22,
              borderRadius: 13,
            }]}>
              <Text style={{ fontSize: item.rarity === "legendary" ? 13 : 11, color: item.backAccent ?? Colors.gold }}>
                {item.rarity === "legendary" ? "★" : item.rarity === "epic" ? "⬡" : "◆"}
              </Text>
            </View>
            <View style={[styles.cardPreviewInnerBorder, { borderColor: (item.backAccent ?? Colors.gold) + (item.rarity === "legendary" ? "77" : "44") }]} />
            {item.rarity === "legendary" && (
              <>
                <View style={{ position: "absolute", top: 3, left: 3, width: 7, height: 7, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: item.backAccent ?? Colors.gold }} />
                <View style={{ position: "absolute", bottom: 3, right: 3, width: 7, height: 7, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: item.backAccent ?? Colors.gold }} />
              </>
            )}
          </LinearGradient>
        ) : item.category === "card_design" ? (
          <CardDesignPreview item={item} />
        ) : item.category === "table_design" ? (
          <View style={[styles.cardPreview, { overflow: "hidden", borderRadius: 4 }]}>
            <LinearGradient
              colors={(item.backColors ?? [item.previewColor, item.previewColor + "88"]) as [string, string]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tablePreviewPattern}>
              {[0,1,2,3,4].map(r => (
                <View key={r} style={{ flexDirection: "row", gap: 4 }}>
                  {[0,1,2,3,4,5].map(c => (
                    <View key={c} style={{
                      width: 6, height: 6, borderRadius: 1,
                      backgroundColor: (item.backColors?.[1] ?? item.previewColor) + "28",
                    }} />
                  ))}
                </View>
              ))}
            </View>
            <View style={[styles.tablePreviewCard, {
              borderColor: (item.backColors?.[1] ?? item.previewColor) + "66",
              backgroundColor: "rgba(255,255,255,0.08)",
            }]}>
              <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: "900" }}>8♥</Text>
            </View>
          </View>
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
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{localized.name}</Text>
        <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={2}>{localized.description}</Text>
        <View style={styles.itemFooter}>
          {owned ? (
            <EquipBadge isEquipped={isEquipped} onEquip={onEquip} T={T} />
          ) : item.isDefault ? (
            <Text style={styles.freeText}>{T("free")}</Text>
          ) : (
            <View style={styles.priceRowSm}>
              <CoinIcon size={12} color={Colors.gold} />
              <Text style={styles.priceSmText}>{item.price}</Text>
            </View>
          )}
        </View>
        {!owned && !item.isDefault && (
          <>
            <View style={styles.lockedDarkOverlay} pointerEvents="none" />
            <View style={styles.lockBadge} pointerEvents="none">
              <View style={[styles.lockBadgeInner, { backgroundColor: rarityColor + "DD", borderColor: rarityColor }]}>
                <Ionicons name="lock-closed" size={11} color="#fff" />
              </View>
            </View>
          </>
        )}
        {isDailyHot && !owned && (
          <View style={styles.dailyBadge} pointerEvents="none">
            <LinearGradient colors={["#FF6B6B", "#C13E3E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyBadgeGrad}>
              <Ionicons name="flame" size={9} color="#fff" />
              <Text style={styles.dailyBadgeText}>HOY</Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function EmoteCard({ item, owned, isEquipped, equippedCount, isDailyHot, onPress, onToggle, onInfo }: {
  item: StoreItem; owned: boolean; isEquipped: boolean; equippedCount: number; isDailyHot?: boolean; onPress: () => void; onToggle: () => void; onInfo: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const localized = localizeItem(item, lang);
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
        <Pressable 
          onPress={(e) => { e.stopPropagation(); onInfo(); }}
          style={styles.infoBtn}
        >
          <Ionicons name="help-circle-outline" size={18} color={theme.textMuted} />
        </Pressable>
        <View style={[styles.effectIconWrap, { backgroundColor: item.previewColor + "33", borderColor: item.previewColor + "44", width: 44, height: 44 }]}>
          {item.animated ? (
            <AnimatedEmoteIcon icon={item.preview as any} color={item.previewColor} delay={0} />
          ) : (
            <Ionicons name={item.preview as any} size={22} color={item.previewColor} />
          )}
        </View>
        {item.animated && (
          <View style={styles.animatedBadge} pointerEvents="none">
            <Ionicons name="sparkles" size={8} color="#fff" />
            <Text style={styles.animatedBadgeText}>ANIM</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.effectTopRow}>
            <Text style={[styles.effectName, { color: theme.text }]}>{localized.name}</Text>
            <View style={[styles.effectRarityBadge, { backgroundColor: rarityColor + "22" }]}>
              <Text style={[styles.effectRarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
            </View>
          </View>
          <Text style={[styles.effectDesc, { color: theme.textMuted }]} numberOfLines={1}>{localized.description}</Text>
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
                <CoinIcon size={12} color={Colors.gold} />
                <Text style={styles.priceSmText}>{item.price}</Text>
              </View>
            )}
          </View>
        </View>
        {isDailyHot && !owned && !item.isDefault && (
          <View style={styles.dailyBadge} pointerEvents="none">
            <LinearGradient colors={["#FF6B6B", "#C13E3E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyBadgeGrad}>
              <Ionicons name="flame" size={9} color="#fff" />
              <Text style={styles.dailyBadgeText}>HOY</Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { profile, buyDailyShopItem, claimDailyShopFree, updateCardBack, updateCardDesign, updateTableDesign, updateAvatar, updateTitle, updateFrame, updateEffect, updateEquippedEmotes } = useProfile();
  const [confirmItem, setConfirmItem] = useState<DailyShopItem | null>(null);
  const [infoItem, setInfoItem] = useState<StoreItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const T = useT();
  const theme = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";

  const isDark = profile.darkMode !== false;
  const themeColors = isDark ? Colors : LightColors;
  const bgColors: [string, string, string] = isDark
    ? ["#061209", "#0a1a0f", "#0d2418"]
    : ["#d8eecc", "#e8f5e2", "#d0e6c6"];
  const themeGold = themeColors.gold;

  const equippedEmotes: string[] = profile.equippedEmotes ?? ["emote_gg", "emote_ocho", "emote_bravo", "emote_lol", "emote_no", "emote_si", "emote_jaja", "emote_bien"];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Daily rotation
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const dateKey = useMemo(() => getDailyDateKey(new Date(nowTick)), [nowTick]);
  const dailyItems = useMemo(() => getDailyShopItems(dateKey).map(i => ({ ...i, ...localizeItem(i, lang) })), [dateKey, lang]);
  const freeItem = useMemo(() => {
    const f = getDailyFreeItem(dateKey);
    return { ...f, ...localizeItem(f, lang) };
  }, [dateKey, lang]);
  const today = dateKey;
  const purchasedToday = profile.lastDailyShopDate === today ? (profile.purchasedDailyShopIds ?? []) : [];
  const freeClaimed = profile.lastDailyShopFreeDate === today;
  const msToMidnight = useMemo(() => {
    const d = new Date(nowTick);
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0);
    return next.getTime() - d.getTime();
  }, [nowTick]);
  const hoursLeft = Math.floor(msToMidnight / 3600000);
  const minutesLeft = Math.floor((msToMidnight % 3600000) / 60000);

  function getEquippedId(cat: StoreItemCategory): string {
    if (cat === "card_back") return profile.cardBackId ?? "back_default";
    if (cat === "card_design") return profile.cardDesignId ?? "face_default";
    if (cat === "table_design") return profile.tableDesignId ?? "table_casino";
    if (cat === "avatar") return profile.avatarId ?? "avatar_knight";
    if (cat === "title") return profile.titleId ?? "title_novice";
    if (cat === "frame") return profile.selectedFrameId ?? "frame_gold";
    if (cat === "effect") return profile.selectedEffect ?? "none";
    return "";
  }

  function equipItem(item: StoreItem) {
    playSound("equip").catch(() => {});
    if (item.category === "card_back") updateCardBack(item.id);
    else if (item.category === "card_design") updateCardDesign(item.id);
    else if (item.category === "table_design") updateTableDesign(item.id);
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
    const item = confirmItem;
    setConfirmItem(null);
    const balance = item.payCurrency === "fichas" ? (profile.fichas ?? 0) : profile.coins;
    if (balance < item.finalPrice) {
      await playSound("error");
      showToast(item.payCurrency === "fichas" ? "Fichas insuficientes" : T("insufficientCoins"));
      return;
    }
    const success = buyDailyShopItem(item.id, item.finalPrice, item.payCurrency);
    if (success) {
      await playSound("purchase");
      if (item.category === "card_back") updateCardBack(item.id);
      if (item.category === "card_design") updateCardDesign(item.id);
      if (item.category === "table_design") updateTableDesign(item.id);
      if (item.category === "avatar") updateAvatar(item.id);
      if (item.category === "title") updateTitle(item.id);
      if (item.category === "frame") updateFrame(item.id);
      if (item.category === "effect") updateEffect(item.id);
      showToast(`${item.name} ${T("obtainedItem")}!`);
    } else {
      showToast(T("insufficientCoins"));
    }
  };

  const handleClaimFree = async () => {
    if (freeClaimed) return;
    const ok = claimDailyShopFree(freeItem.id);
    if (ok) {
      await playSound("purchase");
      showToast(`¡${freeItem.name}!`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: themeGold }]}>{T("store")}</Text>
          <Text style={styles.screenSub}>{T("dailyRotation") as string ?? "Rotación diaria"} · {hoursLeft}h {minutesLeft}m</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={styles.coinsBig}>
            <CoinIcon size={16} color={themeGold} />
            <Text style={[styles.coinsNum, { color: themeGold }]}>{profile.coins}</Text>
          </View>
          <View style={[styles.coinsBig, { backgroundColor: "#3498DB22", borderColor: "#3498DB55" }]}>
            <Ionicons name="diamond" size={14} color="#3498DB" />
            <Text style={[styles.coinsNum, { color: "#3498DB" }]}>{profile.fichas ?? 0}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
      >
        <ChestShop themeColors={theme} themeGold={themeGold} showToast={showToast} T={T} />
        <AnimatedEmotesShowcase themeColors={theme} themeGold={themeGold} />

        <View style={styles.dailyFreeWrap}>
          <LinearGradient colors={["#2ECC7144", "#1A8F4A22"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyFreeGrad}>
            <View style={styles.dailyFreeIcon}>
              <Ionicons name="gift" size={28} color="#2ECC71" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyFreeTitle}>REGALO DIARIO</Text>
              <Text style={[styles.dailyFreeName, { color: theme.text }]} numberOfLines={1}>{freeItem.name}</Text>
              <Text style={[styles.dailyFreeDesc, { color: theme.textMuted }]} numberOfLines={1}>{freeItem.description}</Text>
            </View>
            <BouncePressable
              style={[styles.dailyFreeBtn, freeClaimed && { opacity: 0.5 }]}
              onPress={freeClaimed ? () => {} : handleClaimFree}
            >
              <LinearGradient colors={freeClaimed ? ["#666", "#444"] : ["#2ECC71", "#1A8F4A"]} style={styles.dailyFreeBtnGrad}>
                <Ionicons name={freeClaimed ? "checkmark" : "gift"} size={16} color="#fff" />
                <Text style={styles.dailyFreeBtnText}>{freeClaimed ? "OK" : "GRATIS"}</Text>
              </LinearGradient>
            </BouncePressable>
          </LinearGradient>
        </View>

        <View style={styles.dailyStripWrap}>
          <LinearGradient colors={["#FF6B6B22", "#C13E3E11"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyStripGrad}>
            <Ionicons name="flame" size={14} color="#FF6B6B" />
            <Text style={styles.dailyStripTitle}>OFERTAS DEL DÍA</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="time-outline" size={12} color="#FF6B6B" />
            <Text style={styles.dailyStripTimer}>{hoursLeft}h {minutesLeft}m</Text>
          </LinearGradient>
        </View>

        <View style={styles.grid}>
          {dailyItems.map((item) => {
            const owned = profile.ownedItems.includes(item.id) || purchasedToday.includes(item.id);
            const equippedId = getEquippedId(item.category);
            return (
              <DailyShopCard
                key={item.id}
                item={item}
                owned={owned}
                isEquipped={equippedId === item.id}
                onPress={() => { if (!owned) setConfirmItem(item); }}
                onEquip={() => equipItem(item)}
                onInfo={() => { setInfoItem(item); playSound("tab").catch(() => {}); }}
              />
            );
          })}
        </View>
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <DailyConfirmModal
        item={confirmItem}
        visible={!!confirmItem}
        onConfirm={handlePurchase}
        onCancel={() => setConfirmItem(null)}
      />

      <InfoModal
        item={infoItem}
        visible={!!infoItem}
        onClose={() => setInfoItem(null)}
      />
    </View>
  );
}

function DailyConfirmModal({
  item, visible, onConfirm, onCancel,
}: { item: DailyShopItem | null; visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const rarityLabel = useRarityLabel();
  if (!item) return null;
  const localized = localizeItem(item, lang);
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  const isFichas = item.payCurrency === "fichas";
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
            {isFichas
              ? <Ionicons name="diamond" size={18} color="#3498DB" />
              : <CoinIcon size={18} color={theme.gold} />}
            <Text style={[styles.priceText, { color: isFichas ? "#3498DB" : theme.gold }]}>{item.finalPrice} {isFichas ? "Fichas" : T("coins")}</Text>
          </View>
          <View style={styles.confirmBtns}>
            <Pressable onPress={onCancel} style={[styles.cancelBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cancelText, { color: theme.textMuted }]}>{T("cancel")}</Text>
            </Pressable>
            <BouncePressable onPress={onConfirm} style={styles.buyBtn}>
              <LinearGradient colors={isFichas ? ["#7FD0FF", "#3498DB"] : [theme.goldLight, theme.gold]} style={styles.buyBtnGrad}>
                <Ionicons name="bag-check" size={16} color="#1a0a00" />
                <Text style={styles.buyBtnText}>{T("buy")}</Text>
              </LinearGradient>
            </BouncePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DailyShopCard({ item, owned, isEquipped, onPress, onEquip, onInfo }: {
  item: DailyShopItem; owned: boolean; isEquipped: boolean; onPress: () => void; onEquip: () => void; onInfo: () => void;
}) {
  const T = useT();
  const theme = useTheme();
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const localized = localizeItem(item, lang);
  const rarityLabel = useRarityLabel();
  const rarityColor = RARITY_COLORS_MAP[item.rarity] ?? "#95A5A6";
  const isFichas = item.payCurrency === "fichas";
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
        <Pressable onPress={(e) => { e.stopPropagation(); onInfo(); }} style={styles.infoBtn}>
          <Ionicons name="help-circle-outline" size={16} color={theme.textMuted} />
        </Pressable>
        <View style={[styles.rarityBadgeSmall]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
        </View>
        <View style={[styles.iconPreview, { backgroundColor: item.previewColor + "33" }]}>
          <Ionicons name={item.preview as any} size={28} color={item.previewColor} />
        </View>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{localized.name}</Text>
        <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={2}>{localized.description}</Text>
        <View style={styles.itemFooter}>
          {owned ? (
            <EquipBadge isEquipped={isEquipped} onEquip={onEquip} T={T} />
          ) : (
            <View style={styles.priceRowSm}>
              {isFichas ? <Ionicons name="diamond" size={12} color="#3498DB" /> : <CoinIcon size={12} color={Colors.gold} />}
              <Text style={[styles.priceSmText, { color: isFichas ? "#3498DB" : Colors.gold }]}>{item.finalPrice}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  screenTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: Colors.gold, letterSpacing: 4 },
  screenSub: { fontFamily: "Nunito_400Regular", fontSize: 11, color: Colors.textDim, marginTop: 2 },
  coinsBig: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold + "22", paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.gold + "44",
  },
  coinsNum: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: Colors.gold },
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
  catCountText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: Colors.textDim },
  grid: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dailyFreeWrap: { paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
  dailyFreeGrad: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#2ECC7166" },
  dailyFreeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#2ECC7122", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2ECC7155" },
  dailyFreeTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 10, color: "#2ECC71", letterSpacing: 1.5, marginBottom: 2 },
  dailyFreeName: { fontFamily: "Nunito_800ExtraBold", fontSize: 14 },
  dailyFreeDesc: { fontFamily: "Nunito_400Regular", fontSize: 11, marginTop: 2 },
  dailyFreeBtn: { borderRadius: 10, overflow: "hidden" },
  dailyFreeBtnGrad: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  dailyFreeBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#fff", letterSpacing: 1 },
  dailyStripWrap: { paddingHorizontal: 16, marginBottom: 8 },
  dailyStripGrad: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#FF6B6B55" },
  dailyStripTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#FF6B6B", letterSpacing: 1.5 },
  dailyStripTimer: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#FF6B6B", fontVariant: ["tabular-nums"] },
  dailyBadge: { position: "absolute", top: 6, left: 6, zIndex: 10 },
  animatedBadge: { position: "absolute", top: 6, right: 36, zIndex: 10, flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#9B59B6", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: "#fff5" },
  animatedBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 7, color: "#fff", letterSpacing: 0.6 },
  dailyBadgeGrad: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#fff5" },
  dailyBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, color: "#fff", letterSpacing: 0.8 },
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
  rarityText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, letterSpacing: 1 },
  cardPreview: {
    width: 46, height: 64, borderRadius: 7, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.gold + "55", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
  },
  cardPreviewDot: { fontSize: 16, position: "absolute" },
  cardPreviewDot2: { fontSize: 10, position: "absolute", bottom: 8, right: 8 },
  cardPreviewInnerBorder: {
    position: "absolute", top: 3, left: 3, right: 3, bottom: 3,
    borderWidth: 1, borderRadius: 5,
  },
  cardBackPatternWrap: {
    position: "absolute", top: 4, left: 4, right: 4, bottom: 4,
    alignItems: "center", justifyContent: "center", gap: 2,
    overflow: "hidden",
  },
  cardBackEmblem: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  cardFaceCornerTL: {
    position: "absolute", top: 3, left: 4, alignItems: "center",
  },
  cardFaceCornerBR: {
    position: "absolute", bottom: 3, right: 4, alignItems: "center",
  },
  cardFaceRank: {
    fontSize: 9, fontWeight: "900", lineHeight: 11,
  },
  cardFaceSuit: {
    fontSize: 7, lineHeight: 9, marginTop: -1,
  },
  cardFaceCenter: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 1,
  },
  cardFaceBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3, shadowRadius: 2, elevation: 2,
  },
  cardFaceBadgeSuit: {
    fontSize: 11, color: "#fff", fontWeight: "900",
  },
  cardFaceBadgeNum: {
    fontSize: 10, fontWeight: "900", marginTop: 1,
  },
  cardFaceInnerBorder: {
    position: "absolute", top: 2, left: 2, right: 2, bottom: 2,
    borderWidth: 0.5, borderRadius: 5,
  },
  tablePreviewPattern: {
    position: "absolute", top: 4, left: 4, right: 4, bottom: 4,
    alignItems: "center", justifyContent: "center", gap: 3, overflow: "hidden",
  },
  tablePreviewCard: {
    width: 20, height: 28, borderRadius: 3, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
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
  itemName: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: Colors.text, marginBottom: 3 },
  itemDesc: { fontFamily: "Nunito_400Regular", fontSize: 10, color: Colors.textMuted, lineHeight: 14, flex: 1 },
  itemFooter: { marginTop: 6 },
  ownedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  ownedText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.success },
  freeText: { fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.textMuted },
  priceRowSm: { flexDirection: "row", alignItems: "center", gap: 3 },
  priceSmText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: Colors.gold },
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
  effectName: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: Colors.text, flex: 1 },
  effectRarityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  effectRarityText: { fontFamily: "Nunito_800ExtraBold", fontSize: 8, letterSpacing: 0.5 },
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
  rarityBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 1 },
  confirmName: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: Colors.text },
  confirmDesc: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.textMuted, textAlign: "center" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 4 },
  priceText: { fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: Colors.gold },
  confirmBtns: { flexDirection: "row", gap: 10, width: "100%", marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 14, alignItems: "center",
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: Colors.textMuted },
  buyBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  buyBtnGrad: { padding: 13, alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center" },
  buyBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#1a0a00" },
  lockedDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 14,
  },
  themedFeatRow: {
    flexDirection: "row",
    gap: 10,
  },
  themedFeatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  themedFeatGrad: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  themedFeatLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#FFF8E1",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  themedFeatSub: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "rgba(255,248,225,0.85)",
  },
  themedFeatBadge: {
    position: "absolute",
    top: 6, right: 6,
    backgroundColor: "#1a0a00",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1, borderColor: "#FFD700",
  },
  themedFeatBadgeText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 9,
    color: "#FFD700",
    letterSpacing: 0.5,
  },
  packModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  packCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: "#0e0905",
    borderWidth: 2, borderColor: "#D4AF37",
    padding: 18,
    gap: 12,
  },
  packTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    letterSpacing: 1.2,
  },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1, borderColor: "rgba(255,215,0,0.4)",
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12,
  },
  packRowLeft: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  packRowAmount: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#FFD700",
  },
  packRowPrice: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#A07800",
  },
  packCloseBtn: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },
  packCloseText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#9aa0a6",
  },
  lockBadge: {
    position: "absolute",
    top: 8, left: 8,
    zIndex: 5,
  },
  lockBadgeInner: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 3, elevation: 4,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  featuredHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginBottom: 8,
  },
  featuredTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  featuredScroll: {
    paddingRight: 16,
    gap: 10,
  },
  featuredCard: {
    width: 130,
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  featuredGrad: {
    padding: 10,
    minHeight: 130,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  featuredIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  featuredName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
  },
  featuredPrice: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  featuredPriceText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: Colors.gold,
  },
  featuredHotBadge: {
    position: "absolute",
    top: 6, right: 6,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "#FF4757",
  },
  featuredHotText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 8,
    color: "#fff",
    letterSpacing: 0.5,
  },
  toast: {
    position: "absolute", bottom: 90, alignSelf: "center",
    backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  toastText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.text },
  infoBtn: {
    position: "absolute", top: 8, right: 8, zIndex: 10,
    padding: 4,
  },
  infoModal: {
    width: "85%", maxWidth: 340, padding: 24, borderRadius: 32, alignItems: "center",
    borderWidth: 2, overflow: "hidden", gap: 12,
  },
  infoPreviewBox: {
    width: "100%", padding: 16, borderRadius: 20, borderWidth: 1,
    marginTop: 12, alignItems: "center", justifyContent: "center",
  },
  infoPreviewText: {
    fontFamily: "Nunito_700Bold", fontSize: 14, textAlign: "center", lineHeight: 20,
  },
  closeInfoBtn: {
    marginTop: 12, width: "100%", padding: 14, borderRadius: 16, alignItems: "center",
    borderWidth: 1,
  },
  chestShopWrap: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4, gap: 8 },
  chestShopHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  chestShopTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, letterSpacing: 1.2 },
  chestRow: { flexDirection: "row", gap: 8 },
  chestCard: {
    flex: 1, padding: 10, borderRadius: 12, borderWidth: 1,
    alignItems: "center", gap: 6, minHeight: 110,
  },
  chestName: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, letterSpacing: 0.5 },
  chestPriceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  chestPriceText: { fontFamily: "Nunito_800ExtraBold", fontSize: 12 },
});

function ChestShop({ themeColors, themeGold, showToast, T }: { themeColors: any; themeGold: string; showToast: (s: string) => void; T: (k: any) => string }) {
  const { profile, buyChestWithFichas } = useProfile();
  const PRICES: Record<"common" | "rare" | "epic" | "legendary", number> = {
    common: 25, rare: 80, epic: 200, legendary: 500,
  };
  const COLORS: Record<string, string> = {
    common: "#A0724A", rare: "#1A6FC4", epic: "#7B2FBE", legendary: "#D4AF37",
  };
  const NAMES: Record<string, string> = {
    common: "Común", rare: "Raro", epic: "Épico", legendary: "Legendario",
  };
  const handleBuy = async (type: "common" | "rare" | "epic" | "legendary") => {
    await playSound("purchase");
    const balance = profile.fichas ?? 0;
    if (balance < PRICES[type]) { showToast(`Fichas insuficientes`); return; }
    if ((profile.chestInventory ?? []).length >= 10) { showToast(`Inventario lleno`); return; }
    const ok = buyChestWithFichas(type);
    if (ok) showToast(`¡Cofre ${NAMES[type]} comprado!`);
    else showToast(`No se pudo comprar`);
  };
  return (
    <View style={styles.chestShopWrap}>
      <View style={styles.chestShopHeader}>
        <Ionicons name="cube" size={14} color={themeGold} />
        <Text style={[styles.chestShopTitle, { color: themeGold }]}>COFRES (FICHAS)</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="diamond" size={12} color="#3498DB" />
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: "#3498DB" }}>{profile.fichas ?? 0}</Text>
      </View>
      <View style={styles.chestRow}>
        {(["common", "rare", "epic", "legendary"] as const).map((t) => (
          <BouncePressable
            key={t}
            onPress={() => handleBuy(t)}
            style={[styles.chestCard, { backgroundColor: themeColors.surface, borderColor: COLORS[t] + "88" }]}
          >
            <Ionicons name={t === "legendary" ? "star" : t === "epic" ? "diamond" : "cube"} size={28} color={COLORS[t]} />
            <Text style={[styles.chestName, { color: COLORS[t] }]}>{NAMES[t]}</Text>
            <View style={styles.chestPriceRow}>
              <Ionicons name="diamond" size={11} color="#3498DB" />
              <Text style={[styles.chestPriceText, { color: "#3498DB" }]}>{PRICES[t]}</Text>
            </View>
          </BouncePressable>
        ))}
      </View>
    </View>
  );
}

function AnimatedEmoteIcon({ icon, color, delay }: { icon: any; color: string; delay: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.25, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, scale, rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["-12deg", "12deg"] });
  return (
    <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
      <Ionicons name={icon} size={36} color={color} />
    </Animated.View>
  );
}

function AnimatedEmotesShowcase({ themeColors, themeGold }: { themeColors: any; themeGold: string }) {
  const EMOTES_ANIM = [
    { icon: "sparkles", color: "#D4AF37", label: "Ocho!", delay: 0 },
    { icon: "trophy",   color: "#9B59B6", label: "Bravo!", delay: 300 },
    { icon: "happy",    color: "#F1C40F", label: "Jaja",   delay: 600 },
  ];
  return (
    <View style={[styles.chestShopWrap, { borderColor: themeGold + "55" }]}>
      <View style={styles.chestShopHeader}>
        <Ionicons name="happy" size={14} color={themeGold} />
        <Text style={[styles.chestShopTitle, { color: themeGold }]}>EMOTES ANIMADOS</Text>
      </View>
      <View style={styles.chestRow}>
        {EMOTES_ANIM.map((e) => (
          <View key={e.label} style={[styles.chestCard, { backgroundColor: themeColors.surface, borderColor: e.color + "88" }]}>
            <AnimatedEmoteIcon icon={e.icon} color={e.color} delay={e.delay} />
            <Text style={[styles.chestName, { color: e.color }]}>{e.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
