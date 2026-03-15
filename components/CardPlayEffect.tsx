import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

type Direction = "radial" | "up" | "down" | "diagonal" | "orbit" | "flash";

interface EffectConfig {
  symbols: string[];
  colors: string[];
  count: number;
  dir: Direction;
  minSize: number;
  maxSize: number;
  speed: number;
  glowColor?: string;
}

const EFFECT_CONFIGS: Record<string, EffectConfig> = {
  effect_sparkle: {
    symbols: ["✦","✧","⋆","✶","★","◈","✸","✹"],
    colors: ["#D4AF37","#FFD700","#FFF8A0","#FFE566","#FFFFFF","#FFEC8B"],
    count: 26, dir: "radial", minSize: 14, maxSize: 30, speed: 1.0,
    glowColor: "#D4AF3766",
  },
  effect_bubbles: {
    symbols: ["○","◎","●","⊙","◉","⬭","◌","⊚"],
    colors: ["#ADD8E6","#87CEEB","#B0E0FF","#7BAFE8","#E0F8FF","#60B8E8"],
    count: 22, dir: "up", minSize: 16, maxSize: 34, speed: 0.8,
  },
  effect_leaves: {
    symbols: ["❧","♣","✿","❀","♧","☘","✾","❁"],
    colors: ["#228B22","#32CD32","#7CFC00","#90EE90","#3CB371","#00A86B"],
    count: 20, dir: "diagonal", minSize: 16, maxSize: 28, speed: 0.9,
  },
  effect_dust: {
    symbols: ["•","◦","∙","·","⦁","◉","●"],
    colors: ["#8B4513","#A0522D","#D2691E","#C4A882","#DEB887","#F4A460"],
    count: 28, dir: "radial", minSize: 8, maxSize: 22, speed: 0.85,
  },
  effect_snow_c: {
    symbols: ["❄","❅","❆","✻","✼","❊","✲","❋"],
    colors: ["#FFFFFF","#E8F4FF","#C8E8FF","#B8D8FF","#D8EFFF"],
    count: 24, dir: "down", minSize: 14, maxSize: 28, speed: 0.65,
  },
  effect_confetti: {
    symbols: ["●","▲","■","◆","★","▼","◀","▶"],
    colors: ["#FF69B4","#FF6347","#32CD32","#FFD700","#1E90FF","#9B59B6","#FF4500","#00CED1"],
    count: 32, dir: "radial", minSize: 10, maxSize: 24, speed: 1.1,
    glowColor: "#FFFFFF44",
  },
  effect_stars_c: {
    symbols: ["★","☆","✦","✧","⋆","✯","✪","✫"],
    colors: ["#FFFACD","#FFF8A0","#FFE566","#FFD700","#FFF5B0","#FFFDE0"],
    count: 28, dir: "orbit", minSize: 14, maxSize: 32, speed: 1.0,
    glowColor: "#FFD70055",
  },
  effect_rain: {
    symbols: ["│","╎","|","╏","⋮","╿","╽","│"],
    colors: ["#4682B4","#5F9EA0","#6495ED","#87CEEB","#4169E1","#00BFFF"],
    count: 30, dir: "down", minSize: 16, maxSize: 28, speed: 1.3,
  },
  effect_petals: {
    symbols: ["✿","❀","❁","♡","✾","❃","❋","❊"],
    colors: ["#FFC0CB","#FFB6C1","#FF69B4","#FF8DA1","#FFD0E0","#FF7F9C"],
    count: 24, dir: "diagonal", minSize: 14, maxSize: 30, speed: 0.75,
    glowColor: "#FF69B433",
  },
  effect_fire: {
    symbols: ["▲","△","◣","◤","⬟","⬠","▴","⬡"],
    colors: ["#FF4500","#FF6347","#FF8C00","#FFD700","#FF3300","#FF7700"],
    count: 28, dir: "up", minSize: 18, maxSize: 36, speed: 1.2,
    glowColor: "#FF450066",
  },
  effect_lightning: {
    symbols: ["⚡","↯","╫","≋","⌁","✦","⚡","↯"],
    colors: ["#FFD700","#FFFF00","#FFF59D","#FFE082","#FFFFFF","#FFEC00"],
    count: 22, dir: "flash", minSize: 20, maxSize: 40, speed: 1.5,
    glowColor: "#FFFF0088",
  },
  effect_cosmic: {
    symbols: ["★","✦","◆","○","✿","✧","◈","⬡"],
    colors: ["#9B59B6","#A855F7","#8B5CF6","#C084FC","#7C3AED","#E879F9"],
    count: 26, dir: "orbit", minSize: 14, maxSize: 32, speed: 1.0,
    glowColor: "#9B59B666",
  },
  effect_gold: {
    symbols: ["◆","◇","◈","◉","⬡","✦","◐","◑"],
    colors: ["#D4AF37","#FFD700","#B8860B","#FFF8DC","#DAA520","#FFEC8B"],
    count: 24, dir: "radial", minSize: 14, maxSize: 30, speed: 0.95,
    glowColor: "#D4AF3777",
  },
};

function EffectParticle({
  index, color, symbol, originX, originY, config, totalCount,
}: {
  index: number; color: string; symbol: string;
  originX: number; originY: number;
  config: EffectConfig; totalCount: number;
}) {
  const x = useRef(new Animated.Value(originX)).current;
  const y = useRef(new Animated.Value(originY)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.3)).current;
  const rot = useRef(new Animated.Value(0)).current;

  const fontSize = config.minSize + Math.random() * (config.maxSize - config.minSize);

  useEffect(() => {
    const delay = index * (900 / totalCount) * 0.3 + Math.random() * 60;
    const speedMult = config.speed * (0.8 + Math.random() * 0.5);

    let tx = originX;
    let ty = originY;
    const dir = config.dir;

    if (dir === "radial" || dir === "flash") {
      const angle = (index / totalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const dist = dir === "flash"
        ? 20 + Math.random() * 110
        : 40 + Math.random() * 90;
      tx = originX + Math.cos(angle) * dist;
      ty = originY + Math.sin(angle) * dist;
    } else if (dir === "up") {
      // Spread upward: x drifts ±80, y goes strongly up
      tx = originX + (Math.random() - 0.5) * 160;
      ty = originY - (80 + Math.random() * 160);
    } else if (dir === "down") {
      // Rain/snow falls downward from origin, spread horizontally
      tx = originX + (Math.random() - 0.5) * SW;
      ty = originY + 80 + Math.random() * (SH * 0.5);
    } else if (dir === "diagonal") {
      // Drift sideways and slightly down (petals/leaves in wind)
      const side = Math.random() > 0.5 ? 1 : -1;
      tx = originX + side * (60 + Math.random() * 140);
      ty = originY + (20 + Math.random() * 120);
    } else if (dir === "orbit") {
      // Orbit out in spiral
      const angle = (index / totalCount) * Math.PI * 2 * 1.5 + Math.random() * 0.5;
      const dist = 50 + (index / totalCount) * 80 + Math.random() * 30;
      tx = originX + Math.cos(angle) * dist;
      ty = originY + Math.sin(angle) * dist;
    }

    const duration = Math.round(700 / speedMult + Math.random() * 400);
    const rotDeg = (Math.random() - 0.5) * 720;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 90, useNativeDriver: false }),
        Animated.spring(sc, { toValue: 1, damping: 7, stiffness: 180, useNativeDriver: false }),
        Animated.timing(x, { toValue: tx, duration, useNativeDriver: false }),
        Animated.timing(y, { toValue: ty, duration, useNativeDriver: false }),
        Animated.timing(rot, { toValue: rotDeg, duration, useNativeDriver: false }),
      ]).start(() => {
        Animated.timing(op, { toValue: 0, duration: 350, useNativeDriver: false }).start();
      });
    }, delay);
  }, []);

  const rotateStr = rot.interpolate({ inputRange: [-720, 720], outputRange: ["-720deg", "720deg"] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: op,
        transform: [
          { translateX: x },
          { translateY: y },
          { scale: sc },
          { rotate: rotateStr },
        ],
        fontSize,
        color,
        fontWeight: "bold",
        pointerEvents: "none",
        textShadowColor: color,
        textShadowRadius: 8,
        textShadowOffset: { width: 0, height: 0 },
      } as any}
    >
      {symbol}
    </Animated.Text>
  );
}

function ScreenGlow({ color, dir }: { color: string; dir: Direction }) {
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(op, { toValue: dir === "flash" ? 0.55 : 0.25, duration: 80, useNativeDriver: false }),
      Animated.timing(op, { toValue: dir === "flash" ? 0.3 : 0.12, duration: 200, useNativeDriver: false }),
      Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: color,
        opacity: op,
        pointerEvents: "none",
      } as any}
    />
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
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!config) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
      {config.glowColor && (
        <ScreenGlow color={config.glowColor} dir={config.dir} />
      )}
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
            config={config}
            totalCount={config.count}
          />
        );
      })}
    </View>
  );
}
