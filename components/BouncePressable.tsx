import React from "react";
import { Pressable, PressableProps, Platform, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { playPremiumClick } from "@/lib/audioManager";

interface BouncePressableProps extends PressableProps {
  scaleTo?: number;
  children?: React.ReactNode;
  inline?: boolean;
  haptic?: boolean;
  /** When true, plays a short premium UI click on press. Opt-in to avoid
   *  doubling sounds in screens that already trigger their own SFX (cards,
   *  store rows, etc.). Recommended for main menu / modal action buttons. */
  sound?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
}

function tapHaptic() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}

export default function BouncePressable({
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  children,
  disabled,
  inline = false,
  haptic = true,
  sound = false,
  wrapperStyle,
  ...rest
}: BouncePressableProps) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[aStyle, { alignSelf: inline ? "auto" : "stretch" }, wrapperStyle]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(e) => {
          if (!disabled) {
            scale.value = withSpring(scaleTo, { damping: 15, stiffness: 320, mass: 0.4 });
            if (haptic) tapHaptic();
            if (sound) playPremiumClick().catch(() => {});
          }
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 10, stiffness: 260, mass: 0.4 });
          onPressOut?.(e);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
