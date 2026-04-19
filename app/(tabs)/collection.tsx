import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Modal, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/hooks/useT";
import { Colors, LightColors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { STORE_ITEMS, StoreItem, StoreItemCategory, localizeItem } from "@/lib/storeItems";
import BouncePressable from "@/components/BouncePressable";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { playSound } from "@/lib/sounds";

type CategoryDef = { id: StoreItemCategory; icon: string; labelKey: string };

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
  legendary: "#D4AF37",
};

const RARITY_BORDER_W: Record<string, number> = { common: 1.5, rare: 2, epic: 2.5, legendary: 3 };

const PATTERN_SYMBOL: Record<string, string> = {
  diamonds: "◆", stars: "★", circles: "●", crosses: "✚", waves: "〜", hexagons: "⬡",
};

function CardBackPreview({ item }: { item: StoreItem }) {
  const colors = (item.backColors?.slice(0, 2) ?? [item.previewColor, item.previewColor + "88"]) as [string, string];
  const accent = item.backAccent ?? Colors.gold;
  const rarity = item.rarity;
  return (
    <LinearGradient
      colors={colors}
      style={[previewStyles.cardShape, {
        borderWidth: RARITY_BORDER_W[rarity] ?? 1.5,
        borderColor: RARITY_COLOR[rarity] + "AA",
      }]}
    >
      <View style={previewStyles.backPatternWrap}>
        {[0,1,2,3].map(row => (
          <View key={row} style={{ flexDirection: "row", gap: 5 }}>
            {[0,1,2,3,4].map(col => (
              <Text key={col} style={{ fontSize: 11, color: accent, opacity: 0.45 }}>
                {PATTERN_SYMBOL[item.backPattern ?? "diamonds"] ?? "◆"}
              </Text>
            ))}
          </View>
        ))}
      </View>
      <View style={[previewStyles.backEmblem, {
        backgroundColor: accent + "33",
        borderColor: accent + "88",
      }]}>
        <Text style={{ fontSize: 18, color: accent, fontWeight: "900" }}>
          {rarity === "legendary" ? "★" : rarity === "epic" ? "⬡" : "◆"}
        </Text>
      </View>
      <View style={[previewStyles.innerBorder, { borderColor: accent + "55" }]} />
    </LinearGradient>
  );
}

function CardDesignPreview({ item }: { item: StoreItem }) {
  const bg = item.backColors?.[0] ?? "#FEFDF4";
  const tc = item.backColors?.[1] ?? "#333333";
  const ac = item.backColors?.[2] ?? Colors.gold;
  const rarity = item.rarity;
  return (
    <View style={[previewStyles.cardShape, {
      borderWidth: RARITY_BORDER_W[rarity] ?? 1.5,
      borderColor: RARITY_COLOR[rarity] + "AA",
      overflow: "hidden",
    }]}>
      <LinearGradient
        colors={rarity === "legendary" ? [bg, tc + "33", ac + "22", bg] as [string, string, string, string]
              : rarity === "epic"      ? [bg, ac + "44", bg] as [string, string, string]
              : rarity === "rare"      ? [bg, ac + "18"] as [string, string]
              : [bg, bg] as [string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={previewStyles.cardCornerTL}>
        <Text style={[previewStyles.cardRank, { color: tc }]}>8</Text>
        <Text style={[previewStyles.cardSuit, { color: rarity === "legendary" ? ac : tc }]}>♥</Text>
      </View>
      <View style={previewStyles.cardCenter}>
        <View style={[previewStyles.cardCenterBadge, { backgroundColor: tc + "DD" }]}>
          <Text style={{ fontSize: 22, color: bg, fontWeight: "900" }}>♥</Text>
        </View>
      </View>
      <View style={previewStyles.cardCornerBR}>
        <Text style={[previewStyles.cardRank, { color: tc, transform: [{ rotate: "180deg" }] }]}>8</Text>
        <Text style={[previewStyles.cardSuit, { color: rarity === "legendary" ? ac : tc, transform: [{ rotate: "180deg" }] }]}>♥</Text>
      </View>
      <View style={[previewStyles.innerBorder, { borderColor: ac + "44" }]} />
    </View>
  );
}

function TablePreview({ item }: { item: StoreItem }) {
  const colors = (item.backColors ?? [item.previewColor, item.previewColor + "88"]) as [string, string];
  return (
    <View style={[previewStyles.cardShape, {
      borderWidth: RARITY_BORDER_W[item.rarity] ?? 1.5,
      borderColor: RARITY_COLOR[item.rarity] + "AA",
      overflow: "hidden",
    }]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <View style={previewStyles.tablePattern}>
        {[0,1,2,3,4,5].map(r => (
          <View key={r} style={{ flexDirection: "row", gap: 6 }}>
            {[0,1,2,3,4,5,6].map(c => (
              <View key={c} style={{
                width: 8, height: 8, borderRadius: 1,
                backgroundColor: (colors[1] ?? item.previewColor) + "33",
              }} />
            ))}
          </View>
        ))}
      </View>
      <View style={[previewStyles.tableMiniCard, {
        borderColor: (colors[1] ?? item.previewColor) + "88",
        backgroundColor: "rgba(255,255,255,0.10)",
      }]}>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "900" }}>8♥</Text>
      </View>
    </View>
  );
}

function FramePreview({ item }: { item: StoreItem }) {
  return (
    <View style={previewStyles.centerWrap}>
      <AvatarDisplay avatarId="avatar_default" frameId={item.id} size={70} />
    </View>
  );
}

function AvatarPreview({ item }: { item: StoreItem }) {
  return (
    <View style={previewStyles.centerWrap}>
      <AvatarDisplay avatarId={item.id} size={70} />
    </View>
  );
}

function TitlePreview({ item, lang }: { item: StoreItem, lang: "es"|"en"|"pt" }) {
  const color = item.previewColor;
  const localized = localizeItem(item, lang);
  return (
    <View style={previewStyles.titleWrap}>
      <LinearGradient
        colors={[color + "33", color + "11"] as [string, string]}
        style={previewStyles.titleBanner}
      >
        <Ionicons name={(item.preview as any) ?? "ribbon"} size={20} color={color} />
        <Text style={[previewStyles.titleText, { color }]} numberOfLines={1}>
          {localized.name}
        </Text>
      </LinearGradient>
    </View>
  );
}

function AnimatedSpinIcon({ icon, color, size = 38 }: { icon: any; color: string; size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot,   { toValue: 1,    duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot,   { toValue: 0, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "10deg"] });
  return (
    <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
      <Ionicons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

function EffectPreview({ item }: { item: StoreItem }) {
  const color = item.previewColor;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient
        colors={[color + "55", color + "11"] as [string, string]}
        style={[previewStyles.effectCircle, { borderColor: color + "AA" }]}
      >
        <Ionicons name={(item.preview as any) ?? "sparkles"} size={36} color={color} />
      </LinearGradient>
    </View>
  );
}

function EmotePreview({ item }: { item: StoreItem }) {
  const color = item.previewColor;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient
        colors={[color + "44", color + "0A"] as [string, string]}
        style={[previewStyles.effectCircle, { borderColor: color + "88" }]}
      >
        {item.animated ? (
          <AnimatedSpinIcon icon={item.preview as any} color={color} />
        ) : (
          <Ionicons name={(item.preview as any) ?? "happy"} size={36} color={color} />
        )}
      </LinearGradient>
    </View>
  );
}

function ItemPreview({ item, lang }: { item: StoreItem, lang: "es"|"en"|"pt" }) {
  switch (item.category) {
    case "card_back":    return <CardBackPreview item={item} />;
    case "card_design":  return <CardDesignPreview item={item} />;
    case "table_design": return <TablePreview item={item} />;
    case "avatar":       return <AvatarPreview item={item} />;
    case "frame":        return <FramePreview item={item} />;
    case "title":        return <TitlePreview item={item} lang={lang} />;
    case "effect":       return <EffectPreview item={item} />;
    case "emote":        return <EmotePreview item={item} />;
    default:             return null;
  }
}

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const T = useT();
  const {
    profile,
    updateCardBack, updateCardDesign, updateTableDesign,
    updateAvatar, updateFrame, updateTitle, updateEffect,
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
  const lang = (profile.language ?? "es") as "es"|"en"|"pt";

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

  const rarityLabel = (r: string) => {
    switch (r) {
      case "rare":      return T("rarityRare");
      case "epic":      return T("rarityEpic");
      case "legendary": return T("rarityLegendary");
      default:          return T("rarityCommon");
    }
  };

  const renderItem = ({ item }: { item: StoreItem }) => {
    const isOwned = item.isDefault || owned.includes(item.id);
    const isEquipped = equippedId(activeCat) === item.id;
    const rarityColor = RARITY_COLOR[item.rarity] ?? "#95A5A6";
    const localized = localizeItem(item, lang);

    const handlePress = () => {
      if (!isOwned) {
        setInfoItem(item);
      } else if (!isEquipped && activeCat !== "emote") {
        equip(item);
      } else {
        setInfoItem(item);
      }
    };

    return (
      <BouncePressable
        onPress={handlePress}
        style={[
          styles.gridItem,
          {
            backgroundColor: theme.surface,
            borderColor: isEquipped ? themeGold : rarityColor + "55",
            borderWidth: isEquipped ? 2 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={[rarityColor + "14", "transparent"] as [string, string]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.previewSlot}>
          <ItemPreview item={item} lang={lang} />
        </View>

        <View style={styles.itemFooter}>
          <Text style={[styles.itemName, { color: isOwned ? theme.text : theme.textMuted }]} numberOfLines={1}>
            {localized.name}
          </Text>
          <View style={[styles.rarityChip, { backgroundColor: rarityColor + "22", borderColor: rarityColor + "55" }]}>
            <Text style={[styles.rarityChipText, { color: rarityColor }]}>{rarityLabel(item.rarity)}</Text>
          </View>
        </View>

        {isEquipped && (
          <View style={[styles.equippedBadge, { backgroundColor: themeGold }]} pointerEvents="none">
            <Ionicons name="checkmark" size={11} color="#000" />
            <Text style={styles.equippedText}>{T("equipped")}</Text>
          </View>
        )}

        {!isOwned && (
          <>
            <View style={styles.lockedDim} pointerEvents="none" />
            <View style={styles.lockCenter} pointerEvents="none">
              <View style={[styles.lockCircle, { backgroundColor: rarityColor + "EE", borderColor: rarityColor }]}>
                <Ionicons name="lock-closed" size={26} color="#fff" />
              </View>
              <Text style={[styles.lockedLabel, { color: "#fff" }]}>{T("locked")}</Text>
            </View>
          </>
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
  gridContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  gridItem: {
    flex: 1, borderRadius: 14, padding: 12,
    alignItems: "center",
    maxWidth: "48%",
    minHeight: 180,
    overflow: "hidden",
    position: "relative",
  },
  previewSlot: {
    height: 100,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  itemFooter: { width: "100%", alignItems: "center", gap: 5 },
  itemName: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, textAlign: "center" },
  rarityChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1,
  },
  rarityChipText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 0.5 },
  equippedBadge: {
    position: "absolute", top: 8, right: 8,
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  equippedText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: "#000" },
  lockedDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
  },
  lockCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lockCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  lockedLabel: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 11, letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.8)", textShadowRadius: 3,
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

const previewStyles = StyleSheet.create({
  cardShape: {
    width: 70, height: 96, borderRadius: 8,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  backPatternWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  backEmblem: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  innerBorder: {
    position: "absolute", top: 4, left: 4, right: 4, bottom: 4,
    borderWidth: 0.8, borderRadius: 5,
  },
  cardCornerTL: {
    position: "absolute", top: 4, left: 5, alignItems: "center",
  },
  cardCornerBR: {
    position: "absolute", bottom: 4, right: 5, alignItems: "center",
  },
  cardRank: { fontSize: 12, fontWeight: "900", lineHeight: 13 },
  cardSuit: { fontSize: 11, lineHeight: 12 },
  cardCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },
  cardCenterBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  tablePattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  tableMiniCard: {
    width: 22, height: 30, borderRadius: 3,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  centerWrap: { alignItems: "center", justifyContent: "center" },
  effectCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  titleWrap: { alignItems: "center", justifyContent: "center", width: "100%" },
  titleBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    minWidth: 130, maxWidth: "100%", justifyContent: "center",
  },
  titleText: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 13, letterSpacing: 0.5, flexShrink: 1,
  },
});
