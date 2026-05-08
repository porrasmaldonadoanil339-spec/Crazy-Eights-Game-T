// Task #112 — Shared premium chest visual.
//
// Extracted from ChestOpeningModal so every surface that displays a chest
// (store fichas tiles, inventory, "won chest" end-modal badge, opening
// animation, daily-reward popup) renders the SAME wood + metal + gem chest
// body. Previously the non-opening surfaces used a flat Ionicons cube/diamond/
// star which clashed with the cinematic opening animation. Per-rarity color
// is sourced from CHEST_CONFIG so rarity identity stays intact.
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CHEST_CONFIG, ChestType } from "@/lib/chestSystem";

interface Props {
  type: ChestType;
  size?: number;
  showShadow?: boolean;
}

export default function ChestVisual({ type, size = 60, showShadow = true }: Props) {
  const cfg = CHEST_CONFIG[type];
  const w = size;
  const h = Math.round(size * 0.86);
  const lidH = Math.round(h * 0.34);
  const lockSize = Math.max(12, Math.round(size * 0.32));
  const gemSize = Math.round(lockSize * 0.55);
  const studSize = Math.max(3, Math.round(size * 0.085));
  const bandWidth = Math.max(2, Math.round(size * 0.05));
  const bandInset = Math.max(2, Math.round(size * 0.1));
  const stripeBottom = Math.max(4, Math.round(size * 0.1));

  return (
    <View
      style={[
        styles.outer,
        {
          width: w,
          height: h,
          borderRadius: Math.round(size * 0.1),
          borderWidth: Math.max(1, Math.round(size * 0.03)),
          borderColor: cfg.borderColor,
        },
        showShadow && Platform.OS !== "web"
          ? {
              shadowColor: cfg.glowColor,
              shadowOpacity: 0.45,
              shadowRadius: Math.round(size * 0.18),
              shadowOffset: { width: 0, height: Math.round(size * 0.06) },
              elevation: 6,
            }
          : null,
      ]}
    >
      {/* Body */}
      <LinearGradient
        colors={[cfg.color + "EE", cfg.color + "AA", cfg.color + "55"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        {/* Vertical metal bands */}
        <View
          style={{
            position: "absolute",
            top: lidH,
            bottom: 0,
            left: bandInset,
            width: bandWidth,
            backgroundColor: cfg.glowColor + "55",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: lidH,
            bottom: 0,
            right: bandInset,
            width: bandWidth,
            backgroundColor: cfg.glowColor + "55",
          }}
        />
      </LinearGradient>

      {/* Lid */}
      <LinearGradient
        colors={[cfg.glowColor + "DD", cfg.color + "CC", cfg.color + "99"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: lidH,
          borderTopLeftRadius: Math.round(size * 0.08),
          borderTopRightRadius: Math.round(size * 0.08),
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.35)",
        }}
      >
        {/* Lid highlight */}
        <View
          style={{
            position: "absolute",
            top: Math.round(lidH * 0.18),
            left: Math.round(size * 0.12),
            right: Math.round(size * 0.12),
            height: Math.max(1, Math.round(lidH * 0.1)),
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        />
        {/* Hinges */}
        <View
          style={{
            position: "absolute",
            top: Math.round(lidH * 0.15),
            left: Math.round(size * 0.18),
            width: Math.max(4, Math.round(size * 0.08)),
            height: Math.max(3, Math.round(size * 0.05)),
            borderRadius: 2,
            backgroundColor: cfg.glowColor,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: Math.round(lidH * 0.15),
            right: Math.round(size * 0.18),
            width: Math.max(4, Math.round(size * 0.08)),
            height: Math.max(3, Math.round(size * 0.05)),
            borderRadius: 2,
            backgroundColor: cfg.glowColor,
          }}
        />
      </LinearGradient>

      {/* Lock plate with gem */}
      <View
        style={{
          position: "absolute",
          top: lidH - Math.round(lockSize * 0.4),
          left: w / 2 - lockSize / 2,
          width: lockSize,
          height: lockSize,
          borderRadius: lockSize / 2,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderWidth: Math.max(1, Math.round(size * 0.03)),
          borderColor: cfg.glowColor + "AA",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[cfg.glowColor, cfg.glowColor + "CC", cfg.color]}
          style={{
            width: gemSize,
            height: gemSize,
            borderRadius: gemSize / 2,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: Math.round(gemSize * 0.2),
              left: Math.round(gemSize * 0.25),
              width: Math.round(gemSize * 0.3),
              height: Math.round(gemSize * 0.18),
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          />
        </LinearGradient>
      </View>

      {/* Bottom stripe */}
      <View
        style={{
          position: "absolute",
          bottom: stripeBottom,
          left: bandInset + bandWidth + 2,
          right: bandInset + bandWidth + 2,
          height: Math.max(2, Math.round(size * 0.04)),
          borderRadius: 2,
          backgroundColor: cfg.glowColor + "AA",
        }}
      />

      {/* Bottom corner studs */}
      <View
        style={{
          position: "absolute",
          bottom: studSize / 2,
          left: studSize / 2,
          width: studSize,
          height: studSize,
          borderRadius: studSize / 2,
          backgroundColor: cfg.glowColor + "BB",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: studSize / 2,
          right: studSize / 2,
          width: studSize,
          height: studSize,
          borderRadius: studSize / 2,
          backgroundColor: cfg.glowColor + "BB",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
  },
});
