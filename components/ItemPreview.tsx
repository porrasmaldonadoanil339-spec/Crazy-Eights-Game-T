import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { StoreItem, localizeItem } from "@/lib/storeItems";
import { AvatarDisplay } from "@/components/AvatarDisplay";

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
        borderColor: (RARITY_COLOR[rarity] ?? "#95A5A6") + "AA",
      }]}
    >
      <View style={previewStyles.backPatternWrap}>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} style={{ flexDirection: "row", gap: 5 }}>
            {[0, 1, 2, 3, 4].map((col) => (
              <Text key={col} style={{ fontSize: 11, color: accent, opacity: 0.45 }}>
                {PATTERN_SYMBOL[item.backPattern ?? "diamonds"] ?? "◆"}
              </Text>
            ))}
          </View>
        ))}
      </View>
      <View style={[previewStyles.backEmblem, { backgroundColor: accent + "33", borderColor: accent + "88" }]}>
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
      borderColor: (RARITY_COLOR[rarity] ?? "#95A5A6") + "AA",
      overflow: "hidden",
    }]}>
      <LinearGradient
        colors={rarity === "legendary" ? [bg, tc + "33", ac + "22", bg] as [string, string, string, string]
          : rarity === "epic" ? [bg, ac + "44", bg] as [string, string, string]
          : rarity === "rare" ? [bg, ac + "18"] as [string, string]
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

function TitlePreview({ item, lang }: { item: StoreItem; lang: "es" | "en" | "pt" }) {
  const color = item.previewColor;
  const localized = localizeItem(item, lang);
  const icon = (item.preview ?? "ribbon") as IconName;
  return (
    <View style={previewStyles.titleWrap}>
      <LinearGradient colors={[color + "33", color + "11"] as [string, string]} style={previewStyles.titleBanner}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[previewStyles.titleText, { color }]} numberOfLines={1}>{localized.name}</Text>
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
      <Ionicons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

function EffectPreview({ item }: { item: StoreItem }) {
  const color = item.previewColor;
  const icon = (item.preview ?? "sparkles") as IconName;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient colors={[color + "55", color + "11"] as [string, string]} style={[previewStyles.effectCircle, { borderColor: color + "AA" }]}>
        <Ionicons name={icon} size={36} color={color} />
      </LinearGradient>
    </View>
  );
}

function EmotePreview({ item }: { item: StoreItem }) {
  const color = item.previewColor;
  const icon = (item.preview ?? "happy") as IconName;
  return (
    <View style={previewStyles.centerWrap}>
      <LinearGradient colors={[color + "44", color + "0A"] as [string, string]} style={[previewStyles.effectCircle, { borderColor: color + "88" }]}>
        <AnimatedEmoteIcon icon={icon} color={color} />
      </LinearGradient>
    </View>
  );
}

export function ItemPreview({ item, lang }: { item: StoreItem; lang: "es" | "en" | "pt" }) {
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

export const previewStyles = StyleSheet.create({
  cardShape: {
    width: 78, height: 108, borderRadius: 9,
    alignItems: "center", justifyContent: "center", position: "relative",
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
