import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ViewStyle, Animated, Easing, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RANK_COLORS, RANK_ICONS } from "@/lib/ranked";

interface RankShieldProps {
  rank: number;
  size?: number;
  style?: ViewStyle;
  showGlow?: boolean;
  // Task #120 — pulsing glow + rotating sheen for prestige presentation.
  // Defaults to true; pass false for tiny static badges in lists.
  animated?: boolean;
}

function shade(hex: string, pct: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.max(0, Math.min(255, Math.round(r + (pct >= 0 ? (255 - r) * pct : r * pct))));
  g = Math.max(0, Math.min(255, Math.round(g + (pct >= 0 ? (255 - g) * pct : g * pct))));
  b = Math.max(0, Math.min(255, Math.round(b + (pct >= 0 ? (255 - b) * pct : b * pct))));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function RankShield({ rank, size = 80, style, showGlow = true, animated = true }: RankShieldProps) {
  const baseColor = RANK_COLORS[rank] || "#8B7355";
  const lighter = shade(baseColor, 0.55);
  const lightest = shade(baseColor, 0.8);
  const darker = shade(baseColor, -0.45);
  const iconName = (RANK_ICONS[rank] || "shield") as any;

  const outerSize = size;
  const ringSize = size * 0.92;
  const innerSize = size * 0.74;
  const iconSize = Math.round(size * 0.46);
  const iconColor = "#FFFFFF";

  const pulse = useRef(new Animated.Value(0)).current;
  const sheenSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== "web" }),
      ]),
    );
    const loop2 = Animated.loop(
      Animated.timing(sheenSpin, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
    );
    loop1.start();
    loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, [animated, pulse, sheenSpin]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });
  const sheenRotate = sheenSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[{ width: outerSize, height: outerSize, alignItems: "center", justifyContent: "center" }, style]}>
      {/* Outer pulsing glow */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: outerSize * 1.22,
              height: outerSize * 1.22,
              borderRadius: outerSize,
              shadowColor: baseColor,
              backgroundColor: baseColor + "33",
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Outer metallic ring */}
      <LinearGradient
        colors={[lightest, lighter, baseColor, darker]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Rotating metallic sheen — gives the rim a "polished" sweeping highlight */}
        {showGlow && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              overflow: "hidden",
              transform: [{ rotate: sheenRotate }],
            }}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {/* Mid ring (notch / spikes accent) */}
        <View
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: Math.max(2, Math.round(size * 0.04)),
            borderColor: lighter,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: darker,
          }}
        >
          {/* Inner core gradient (dome) */}
          <LinearGradient
            colors={[lightest, baseColor, darker]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.65)",
            }}
          >
            {/* Top highlight (3D dome) */}
            <View
              style={{
                position: "absolute",
                top: innerSize * 0.06,
                left: innerSize * 0.18,
                width: innerSize * 0.65,
                height: innerSize * 0.28,
                borderRadius: innerSize / 2,
                backgroundColor: "rgba(255,255,255,0.36)",
              }}
              pointerEvents="none"
            />
            <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.iconShadow} />
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    shadowOpacity: 0.95,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  iconShadow: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

// Animated shining-star for the rank header (used by prestige UIs).
interface ShiningStarProps {
  filled: boolean;
  color: string;
  size?: number;
  delay?: number;
}
export function ShiningStar({ filled, color, size = 16, delay = 0 }: ShiningStarProps) {
  const shine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!filled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(shine, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(shine, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== "web" }),
        Animated.delay(1600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [filled, shine, delay]);
  const scale = shine.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const opacity = shine.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  if (!filled) {
    return <Ionicons name="star-outline" size={size} color={color} />;
  }
  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons
        name="star"
        size={size}
        color={color}
        style={{ textShadowColor: color + "cc", textShadowRadius: 6, textShadowOffset: { width: 0, height: 0 } }}
      />
    </Animated.View>
  );
}
