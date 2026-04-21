import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RANK_COLORS, RANK_ICONS } from "@/lib/ranked";

interface RankShieldProps {
  rank: number;
  size?: number;
  style?: ViewStyle;
  showGlow?: boolean;
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

export function RankShield({ rank, size = 80, style, showGlow = true }: RankShieldProps) {
  const baseColor = RANK_COLORS[rank] || "#8B7355";
  const lighter = shade(baseColor, 0.45);
  const darker = shade(baseColor, -0.45);
  const iconName = (RANK_ICONS[rank] || "shield") as any;

  const outerSize = size;
  const ringSize = size * 0.92;
  const innerSize = size * 0.74;
  const iconSize = Math.round(size * 0.46);
  const iconColor = "#FFFFFF";

  return (
    <View style={[{ width: outerSize, height: outerSize, alignItems: "center", justifyContent: "center" }, style]}>
      {/* Outer glow */}
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              width: outerSize * 1.18,
              height: outerSize * 1.18,
              borderRadius: outerSize,
              shadowColor: baseColor,
              backgroundColor: baseColor + "22",
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Outer metallic ring */}
      <LinearGradient
        colors={[lighter, baseColor, darker]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
            colors={[lighter, baseColor, darker]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.55)",
            }}
          >
            {/* Top highlight to give 3D dome effect */}
            <View
              style={{
                position: "absolute",
                top: innerSize * 0.06,
                left: innerSize * 0.18,
                width: innerSize * 0.65,
                height: innerSize * 0.28,
                borderRadius: innerSize / 2,
                backgroundColor: "rgba(255,255,255,0.32)",
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
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  iconShadow: {
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
