import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
  const frameBorderWidth = frameItem ? 3 : 2;

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
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
            {/* Subtle glow behind the icon */}
            <View
              style={{
                position: "absolute",
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: size * 0.35,
                backgroundColor: iconColor + "22",
              }}
            />
            <Ionicons name={(avatarItem?.preview ?? "person") as any} size={iSize} color={iconColor} />
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
