import React from "react";
import { View, Text } from "react-native";

interface CoinIconProps {
  size?: number;
  color?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ size = 16, color = "#F1C40F" }) => {
  const border = Math.max(1, size * 0.08);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: border,
        borderColor: "rgba(0,0,0,0.28)",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.62,
          fontWeight: "900",
          color: "rgba(90,55,0,0.9)",
          lineHeight: size * 0.7,
          textAlign: "center",
          includeFontPadding: false,
        }}
      >
        $
      </Text>
    </View>
  );
};

export default CoinIcon;
