import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { AVATARS, AVATAR_FRAMES } from "@/lib/storeItems";

export interface AvatarDisplayProps {
  avatarId: string;
  frameId?: string;
  photoUri?: string;
  size?: number;
  iconSize?: number;
}

export function AvatarDisplay({ avatarId, frameId, photoUri, size = 60, iconSize }: AvatarDisplayProps) {
  const avatarItem = AVATARS.find(a => a.id === avatarId);
  const frameItem = frameId ? AVATAR_FRAMES.find(f => f.id === frameId) : null;
  const iSize = iconSize ?? Math.floor(size * 0.52);
  const radius = size / 2;

  const iconColor = avatarItem?.previewColor ?? "#D4AF37";
  const frameColors = frameItem?.backColors ?? [iconColor + "dd", iconColor + "88"];
  const frameBorderWidth = frameItem ? 4 : 2;

  // Detect "elite" frames: legendary/gold themes get extra shine
  const frameRarity = (frameItem as any)?.rarity ?? null;
  const isElite = frameRarity === "legendary" || frameRarity === "epic" || frameId === "frame_gold" || frameId === "frame_legend" || frameId === "frame_diamond";

  // Continuous shimmer rotation for elite frames
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isElite) {
      shimmer.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1, false);
      pulse.value = withRepeat(withSequence(
        withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ), -1, false);
    }
  }, [isElite, shimmer, pulse]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shimmer.value * 360}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {/* Outer glow halo for elite frames */}
      {isElite && (
        <Animated.View
          style={[
            pulseStyle,
            {
              position: "absolute",
              width: size + 14,
              height: size + 14,
              borderRadius: (size + 14) / 2,
              top: -7,
              left: -7,
              backgroundColor: (frameColors[0] ?? "#D4AF37") + "33",
              shadowColor: frameColors[0] ?? "#D4AF37",
              shadowOpacity: 0.85,
              shadowRadius: 14,
              elevation: 10,
            },
          ]}
        />
      )}

      {/* Outer frame ring — uses equip frame colors or defaults to icon color */}
      <LinearGradient
        colors={frameColors as [string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.frameRing, {
          width: size + frameBorderWidth * 2,
          height: size + frameBorderWidth * 2,
          borderRadius: radius + frameBorderWidth,
          top: -frameBorderWidth,
          left: -frameBorderWidth,
        }]}
      />

      {/* Rotating shimmer overlay for elite frames — sweep of light around the ring */}
      {isElite && (
        <Animated.View
          style={[
            shimmerStyle,
            {
              pointerEvents: "none",
              position: "absolute",
              width: size + frameBorderWidth * 2,
              height: size + frameBorderWidth * 2,
              borderRadius: radius + frameBorderWidth,
              top: -frameBorderWidth,
              left: -frameBorderWidth,
              overflow: "hidden",
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      )}

      {/* Inner avatar — dark casino background with colored icon */}
      <LinearGradient
        colors={["#0d1a10", "#101e13"]}
        style={[styles.inner, { width: size, height: size, borderRadius: radius }]}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: size, height: size, borderRadius: radius }}
            resizeMode="cover"
          />
        ) : (
          <>
            {/* Radial-ish glow behind the icon */}
            <View
              style={{
                position: "absolute",
                width: size * 0.78,
                height: size * 0.78,
                borderRadius: size * 0.39,
                backgroundColor: iconColor + "26",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: size * 0.46,
                height: size * 0.46,
                borderRadius: size * 0.23,
                backgroundColor: iconColor + "44",
              }}
            />
            <Ionicons name={(avatarItem?.preview ?? "person") as any} size={iSize} color={iconColor} />
            {/* Tiny sparkle for elite */}
            {isElite && (
              <View style={{ position: "absolute", top: size * 0.12, right: size * 0.14 }}>
                <Ionicons name="sparkles" size={Math.max(10, size * 0.16)} color="#FFFFFF" />
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frameRing: {
    position: "absolute",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
