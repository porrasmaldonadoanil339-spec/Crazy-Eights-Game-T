import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CoinIconProps {
  size?: number;
  color?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ size = 16, color = "#F1C40F" }) => {
  const rim = Math.max(1, size * 0.085);
  const innerSize = size - rim * 2;
  const fontSize = size * 0.6;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LinearGradient
        colors={[color, "#B8860B"]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: innerSize * 0.08,
            left: innerSize * 0.18,
            width: innerSize * 0.42,
            height: innerSize * 0.18,
            borderRadius: innerSize * 0.4,
            backgroundColor: "rgba(255,255,255,0.45)",
            transform: [{ rotate: "-22deg" }],
          }}
        />
        <Text
          style={{
            fontFamily: "Nunito_800ExtraBold",
            fontSize,
            color: "rgba(70,40,0,0.95)",
            lineHeight: fontSize * 1.05,
            textAlign: "center",
            includeFontPadding: false,
            textShadowColor: "rgba(255,240,180,0.6)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 0,
          }}
        >
          8
        </Text>
      </LinearGradient>
    </View>
  );
};

export default CoinIcon;
