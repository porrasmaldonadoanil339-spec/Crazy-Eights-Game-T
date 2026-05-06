import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import type { TranslationKey } from "@/lib/i18n";

const { width: SW } = Dimensions.get("window");

const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_COLORS = [Colors.gold, "#E53935", "#E53935", Colors.gold];

const TIP_KEYS: readonly TranslationKey[] = [
  "liveTip1", "liveTip2", "liveTip3", "liveTip4",
  "liveTip5", "liveTip6", "liveTip7", "liveTip8",
];

function FloatingMiniCard({ index }: { index: number }) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftX = 18 + Math.random() * 24;
    const driftY = 14 + Math.random() * 20;
    const dur = 4500 + Math.random() * 2500;
    Animated.loop(Animated.sequence([
      Animated.timing(tx, { toValue: driftX, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(tx, { toValue: -driftX, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(ty, { toValue: -driftY, duration: dur * 0.85, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(ty, { toValue: driftY, duration: dur * 0.85, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(rot, { toValue: 1, duration: dur * 1.2, useNativeDriver: true }),
      Animated.timing(rot, { toValue: -1, duration: dur * 1.2, useNativeDriver: true }),
    ])).start();
  }, []);

  const top = 30 + (index * 71) % 240;
  const left = 20 + (index * 53) % (SW - 60);
  const cardW = 28 + (index % 3) * 6;
  const cardH = Math.round(cardW * 1.45);
  const suit = SUITS[index % SUITS.length];
  const color = SUIT_COLORS[index % SUIT_COLORS.length];
  const rotInterp = rot.interpolate({ inputRange: [-1, 1], outputRange: ["-14deg", "14deg"] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top, left,
        width: cardW,
        height: cardH,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.22)",
        opacity: 0.22,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ translateX: tx }, { translateY: ty }, { rotate: rotInterp }],
      }}
    >
      <Text style={{ fontSize: cardW * 0.55, color, fontFamily: "Nunito_700Bold", lineHeight: cardW * 0.65 }}>
        {suit}
      </Text>
    </Animated.View>
  );
}

export function TipRotator({ intervalMs = 3500 }: { intervalMs?: number }) {
  const T = useT();
  const [idx, setIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
        setIdx((i) => (i + 1) % TIP_KEYS.length);
        Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const tipText = T(TIP_KEYS[idx]) || "";

  return (
    <View style={styles.tipBox}>
      <Ionicons name="bulb" size={14} color={Colors.gold} />
      <Animated.Text style={[styles.tipText, { opacity }]} numberOfLines={2}>
        {tipText}
      </Animated.Text>
    </View>
  );
}

export function FloatingCardField({ count = 6 }: { count?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <FloatingMiniCard key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
    maxWidth: 320,
    minHeight: 42,
  },
  tipText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.text,
    flex: 1,
    lineHeight: 16,
  },
});
