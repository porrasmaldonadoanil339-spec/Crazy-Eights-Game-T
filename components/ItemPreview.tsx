import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { StoreItem, localizeItem } from "@/lib/storeItems";
import type { Lang } from "@/lib/i18n";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { PlayingCard } from "@/components/PlayingCard";
import type { Card } from "@/lib/gameEngine";

// Dummy card used purely so PlayingCard can render its faceDown skin in store
// previews. Fields are unused in faceDown mode.
const PREVIEW_FACE_DOWN: Card = { id: "preview-back", rank: "A", suit: "spades" };
// Sample face-up card shown in card_design previews — 8 of hearts is the
// signature card of the game, so it doubles as a brand cue.
const PREVIEW_FACE_UP: Card = { id: "preview-front", rank: "8", suit: "hearts" };

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const RARITY_COLOR: Record<string, string> = {
  common: "#95A5A6",
  rare: "#2196F3",
  epic: "#9B59B6",
  event: "#FF6B6B",
  legendary: "#D4AF37",
};

const RARITY_BORDER_W: Record<string, number> = {
  common: 1.5, rare: 2, epic: 2.5, event: 2.5, legendary: 3,
};

// Both card-back and card-design previews delegate to PlayingCard so the store
// preview is pixel-identical to what the player sees in their hand. A thin
// rarity-tinted ring is drawn around the card to retain the rarity cue without
// duplicating the card chrome itself.
function PreviewFrame({ rarity, compact, children }: {
  rarity: string; compact?: boolean; children: React.ReactNode;
}) {
  const ringColor = (RARITY_COLOR[rarity] ?? "#95A5A6") + "AA";
  const ringWidth = RARITY_BORDER_W[rarity] ?? 1.5;
  const pad = ringWidth + 4;
  return (
    <View style={[
      compact ? previewStyles.cardFrameCompact : previewStyles.cardFrame,
      { borderColor: ringColor, borderWidth: ringWidth, padding: pad },
    ]}>
      {children}
    </View>
  );
}

function CardBackPreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const backColors = (item.backColors ?? ["#1E4080", "#0e2248", "#0a1832"]) as [string, string, string];
  const backAccent = item.backAccent ?? Colors.gold;
  const backPattern = (item.backPattern ?? "diamonds") as
    "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";
  return (
    <PreviewFrame rarity={item.rarity} compact={compact}>
      <PlayingCard
        card={PREVIEW_FACE_DOWN}
        faceDown
        size={compact ? "sm" : "md"}
        backColors={backColors}
        backAccent={backAccent}
        backPattern={backPattern}
        showEffectBadge={false}
      />
    </PreviewFrame>
  );
}

function CardDesignPreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const cardColors = (item.backColors ?? undefined) as [string, string, string] | undefined;
  return (
    <PreviewFrame rarity={item.rarity} compact={compact}>
      <PlayingCard
        card={PREVIEW_FACE_UP}
        size={compact ? "sm" : "md"}
        cardColors={cardColors}
        showEffectBadge={false}
      />
    </PreviewFrame>
  );
}

function TablePreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const colors = (item.backColors ?? [item.previewColor, item.previewColor + "88"]) as [string, string];
  return (
    <View style={[compact ? previewStyles.cardShapeCompact : previewStyles.cardShape, {
      borderWidth: RARITY_BORDER_W[item.rarity] ?? 1.5,
      borderColor: (RARITY_COLOR[item.rarity] ?? "#95A5A6") + "AA",
      overflow: "hidden",
    }]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <View style={previewStyles.tablePattern}>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <View key={r} style={{ flexDirection: "row", gap: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((c) => (
              <View key={c} style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: (colors[1] ?? item.previewColor) + "33" }} />
            ))}
          </View>
        ))}
      </View>
      <View style={[previewStyles.tableMiniCard, { borderColor: (colors[1] ?? item.previewColor) + "88", backgroundColor: "rgba(255,255,255,0.10)" }]}>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "900" }}>8♥</Text>
      </View>
    </View>
  );
}

function FramePreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  return (
    <View style={previewStyles.centerWrap}>
      <AvatarDisplay avatarId="avatar_default" frameId={item.id} size={compact ? 52 : 70} />
    </View>
  );
}

function AvatarPreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  return (
    <View style={previewStyles.centerWrap}>
      <AvatarDisplay avatarId={item.id} size={compact ? 52 : 70} />
    </View>
  );
}

function TitlePreview({ item, lang, compact }: { item: StoreItem; lang: Lang; compact?: boolean }) {
  const color = item.previewColor;
  const localized = localizeItem(item, lang);
  const icon = (item.preview ?? "ribbon") as IconName;
  return (
    <View style={previewStyles.titleWrap}>
      <LinearGradient
        colors={[color + "33", color + "11"] as [string, string]}
        style={compact ? previewStyles.titleBannerCompact : previewStyles.titleBanner}
      >
        <Ionicons name={icon} size={compact ? 14 : 20} color={color} />
        <Text style={[compact ? previewStyles.titleTextCompact : previewStyles.titleText, { color }]} numberOfLines={1}>{localized.name}</Text>
      </LinearGradient>
    </View>
  );
}

function AnimatedEmoteIcon({ icon, color, delay = 0, size = 36 }: { icon: IconName; color: string; delay?: number; size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 1, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, scale, rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "10deg"] });
  return (
    <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
      <Ionicons
        name={icon}
        size={size}
        color={color}
        style={{
          textShadowColor: color,
          textShadowRadius: 14,
          textShadowOffset: { width: 0, height: 0 },
        }}
      />
    </Animated.View>
  );
}

function EffectPreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const color = item.previewColor;
  const icon = (item.preview ?? "sparkles") as IconName;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient
        colors={[color + "55", color + "11"] as [string, string]}
        style={[compact ? previewStyles.effectCircleCompact : previewStyles.effectCircle, { borderColor: color + "AA" }]}
      >
        <Ionicons name={icon} size={compact ? 26 : 36} color={color} />
      </LinearGradient>
    </View>
  );
}

function StingerPreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const color = item.previewColor;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient
        colors={[color + "55", color + "11"] as [string, string]}
        style={[compact ? previewStyles.effectCircleCompact : previewStyles.effectCircle, { borderColor: color + "AA" }]}
      >
        <Ionicons name="musical-notes" size={compact ? 26 : 36} color={color} />
      </LinearGradient>
    </View>
  );
}

function EmotePreview({ item, compact }: { item: StoreItem; compact?: boolean }) {
  const color = item.previewColor;
  const icon = (item.preview ?? "happy") as IconName;
  return (
    <View style={previewStyles.centerWrap}>
      <AnimatedEmoteIcon icon={icon} color={color} size={compact ? 44 : 64} />
    </View>
  );
}

export function ItemPreview({ item, lang, compact }: { item: StoreItem; lang: Lang; compact?: boolean }) {
  switch (item.category) {
    case "card_back":    return <CardBackPreview item={item} compact={compact} />;
    case "card_design":  return <CardDesignPreview item={item} compact={compact} />;
    case "table_design": return <TablePreview item={item} compact={compact} />;
    case "avatar":       return <AvatarPreview item={item} compact={compact} />;
    case "frame":        return <FramePreview item={item} compact={compact} />;
    case "title":        return <TitlePreview item={item} lang={lang} compact={compact} />;
    case "effect":       return <EffectPreview item={item} compact={compact} />;
    case "emote":        return <EmotePreview item={item} compact={compact} />;
    case "logo_stinger": return <StingerPreview item={item} compact={compact} />;
    default:             return null;
  }
}

export const previewStyles = StyleSheet.create({
  cardShape: {
    width: 78, height: 108, borderRadius: 9,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  cardShapeCompact: {
    width: 56, height: 78, borderRadius: 7,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  // Frame around the unified PlayingCard preview — provides the rarity ring
  // without redrawing card chrome.
  cardFrame: {
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  cardFrameCompact: {
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  backPatternWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  backEmblem: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  innerBorder: {
    position: "absolute", top: 4, left: 4, right: 4, bottom: 4,
    borderWidth: 0.8, borderRadius: 6,
  },
  cardCornerTL: { position: "absolute", top: 5, left: 6, alignItems: "center" },
  cardCornerBR: { position: "absolute", bottom: 5, right: 6, alignItems: "center" },
  cardRank: { fontSize: 13, fontWeight: "900", lineHeight: 14 },
  cardSuit: { fontSize: 12, lineHeight: 13 },
  cardCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },
  cardCenterBadge: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  tablePattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  tableMiniCard: {
    width: 24, height: 32, borderRadius: 3,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  centerWrap: { alignItems: "center", justifyContent: "center" },
  effectCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  effectCircleCompact: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  titleWrap: { alignItems: "center", justifyContent: "center", width: "100%" },
  titleBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    minWidth: 130, maxWidth: "100%", justifyContent: "center",
  },
  titleBannerCompact: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 6, paddingVertical: 6, borderRadius: 8,
    maxWidth: "100%", justifyContent: "center",
  },
  titleText: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 13, letterSpacing: 0.5, flexShrink: 1,
  },
  titleTextCompact: {
    fontFamily: "Nunito_800ExtraBold", fontSize: 9, letterSpacing: 0.3, flexShrink: 1,
  },
});
