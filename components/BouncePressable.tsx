import React from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface BouncePressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children?: React.ReactNode;
}

export default function BouncePressable({
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  children,
  disabled,
  ...rest
}: BouncePressableProps) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[aStyle, { alignSelf: "stretch" }]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(e) => {
          if (!disabled) {
            scale.value = withSpring(scaleTo, { damping: 15, stiffness: 320, mass: 0.4 });
          }
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 10, stiffness: 260, mass: 0.4 });
          onPressOut?.(e);
        }}
        style={style as any}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
