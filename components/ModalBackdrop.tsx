import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

interface ModalBackdropProps {
  /** Blur intensity 0–100. Defaults to 30 for a soft, premium pane. */
  intensity?: number;
  /** Tint of the dimming layer painted over the blur. */
  tint?: "dark" | "light";
  /** Extra dim opacity (0–1) painted over the blur for legibility. */
  dimOpacity?: number;
  /** Pass-through style (positioning, alignment, etc.). */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

// BlurView backdrop on native; solid dim on web.
export function ModalBackdrop({
  intensity = 30,
  tint = "dark",
  dimOpacity = 0.55,
  style,
  children,
}: ModalBackdropProps) {
  const dim = `rgba(0,0,0,${dimOpacity})`;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.fill, { backgroundColor: dim }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.fill, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: dim }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export default ModalBackdrop;
