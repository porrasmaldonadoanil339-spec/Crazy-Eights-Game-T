import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ChipIconProps {
  size?: number;
  color?: string;
}

export const ChipIcon: React.FC<ChipIconProps> = ({ size = 16, color = "#3498DB" }) => {
  const rim = Math.max(1, size * 0.07);
  const innerSize = size - rim * 2;
  const wedgeCount = 8;
  const wedgeW = Math.max(1.2, size * 0.12);
  const wedgeH = Math.max(2, size * 0.16);
  const fontSize = size * 0.55;
  const innerDisc = innerSize * 0.66;

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
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Casino notches around the rim */}
        {Array.from({ length: wedgeCount }).map((_, i) => {
          const angle = (i * 360) / wedgeCount;
          return (
            <View
              key={i}
              pointerEvents="none"
              style={{
                position: "absolute",
                width: wedgeW,
                height: wedgeH,
                backgroundColor: "#FFFFFF",
                borderRadius: wedgeW / 3,
                top: -wedgeH * 0.15,
                left: innerSize / 2 - wedgeW / 2,
                transform: [
                  { translateY: innerSize / 2 },
                  { rotate: `${angle}deg` },
                  { translateY: -innerSize / 2 },
                ],
              }}
            />
          );
        })}

        {/* Inner disc */}
        <LinearGradient
          colors={["#FFFFFF", "#E6EEF5"]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.85, y: 0.95 }}
          style={{
            width: innerDisc,
            height: innerDisc,
            borderRadius: innerDisc / 2,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: Math.max(0.5, size * 0.025),
            borderColor: color,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize,
              color,
              lineHeight: fontSize * 1.05,
              textAlign: "center",
              includeFontPadding: false,
            }}
          >
            8
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

export default ChipIcon;
