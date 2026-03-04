import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

const EFFECT_CONFIGS: Record<string, { symbols: string[]; colors: string[]; count: number }> = {
  effect_sparkle:  { symbols: ["✦","✧","⋆","✶","★"], colors: ["#D4AF37","#FFD700","#FFF8A0","#FFE566"], count: 12 },
  effect_bubbles:  { symbols: ["○","◎","●","⊙","◉"], colors: ["#ADD8E6","#87CEEB","#B0E0FF","#7BAFE8"], count: 10 },
  effect_leaves:   { symbols: ["❧","♣","✿","❀","♧"], colors: ["#228B22","#32CD32","#7CFC00","#90EE90"], count: 9 },
  effect_dust:     { symbols: ["•","·","∙","·","•"], colors: ["#8B4513","#A0522D","#D2691E","#C4A882"], count: 14 },
  effect_snow_c:   { symbols: ["❄","❅","❆","✻","✼"], colors: ["#FFFFFF","#E8F4FF","#C8E8FF","#B8D8FF"], count: 10 },
  effect_confetti: { symbols: ["●","▲","■","◆","★"], colors: ["#FF69B4","#FF6347","#32CD32","#FFD700","#1E90FF","#9B59B6"], count: 14 },
  effect_stars_c:  { symbols: ["★","☆","✦","✧","⋆"], colors: ["#FFFACD","#FFF8A0","#FFE566","#FFD700"], count: 12 },
  effect_rain:     { symbols: ["│","╎","|","╏","⋮"], colors: ["#4682B4","#5F9EA0","#6495ED","#87CEEB"], count: 12 },
  effect_petals:   { symbols: ["✿","❀","❁","♡","✾"], colors: ["#FFC0CB","#FFB6C1","#FF69B4","#FF8DA1"], count: 10 },
  effect_fire:     { symbols: ["▲","△","◣","◤","⬟"], colors: ["#FF4500","#FF6347","#FF8C00","#FFD700"], count: 11 },
  effect_lightning: { symbols: ["⚡","↯","╫","≋","⌁"], colors: ["#FFD700","#FFFF00","#FFF59D","#FFE082"], count: 8 },
  effect_cosmic:   { symbols: ["★","✦","◆","○","✿"], colors: ["#9B59B6","#A855F7","#8B5CF6","#C084FC","#7C3AED"], count: 12 },
  effect_gold:     { symbols: ["◆","◇","◈","◉","⬡"], colors: ["#D4AF37","#FFD700","#B8860B","#FFF8DC"], count: 10 },
};

function EffectParticle({ index, color, symbol, originX, originY }: {
  index: number; color: string; symbol: string; originX: number; originY: number;
}) {
  const x = useRef(new Animated.Value(originX)).current;
  const y = useRef(new Animated.Value(originY)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const angle = (index * (Math.PI * 2 / 8)) + (Math.random() - 0.5) * 1.2;
    const dist = 35 + Math.random() * 55;
    const tx = originX + Math.cos(angle) * dist;
    const ty = originY + Math.sin(angle) * dist;
    const delay = Math.random() * 80;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.spring(sc, { toValue: 1, damping: 8, stiffness: 200, useNativeDriver: true }),
        Animated.timing(x, { toValue: tx, duration: 550, useNativeDriver: true }),
        Animated.timing(y, { toValue: ty, duration: 550, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(op, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      });
    }, delay);
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: op,
        transform: [{ translateX: x }, { translateY: y }, { scale: sc }],
        fontSize: 13 + Math.random() * 6,
        color,
        fontWeight: "bold",
        pointerEvents: "none",
      } as any}
    >
      {symbol}
    </Animated.Text>
  );
}

interface CardPlayEffectProps {
  effectId: string;
  originX: number;
  originY: number;
  onDone: () => void;
}

export function CardPlayEffect({ effectId, originX, originY, onDone }: CardPlayEffectProps) {
  const config = EFFECT_CONFIGS[effectId];

  useEffect(() => {
    const timer = setTimeout(onDone, 900);
    return () => clearTimeout(timer);
  }, []);

  if (!config) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: config.count }).map((_, i) => {
        const colorIdx = i % config.colors.length;
        const symIdx = i % config.symbols.length;
        return (
          <EffectParticle
            key={i}
            index={i}
            color={config.colors[colorIdx]}
            symbol={config.symbols[symIdx]}
            originX={originX}
            originY={originY}
          />
        );
      })}
    </View>
  );
}
