import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";

interface RoundTransitionProps {
  round: number;
  totalRounds?: number;
  subtitle?: string;
  accent?: string;
}

// AAA-style ROUND 1/2/3 overlay used by Tournament. Pulses briefly in the
// centre of the screen, non-interactive (doesn't block input).
export default function RoundTransition({
  round,
  totalRounds = 3,
  subtitle,
  accent,
}: RoundTransitionProps) {
  const sc = useSharedValue(0.5);
  const op = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    sc.value = withSpring(1, { damping: 11 });
    op.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.ease) });
    pulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 280 }), withTiming(1, { duration: 280 })),
      4,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value * pulse.value }],
    opacity: op.value,
  }));

  const isFinal = round >= totalRounds;
  const accentColor = accent ?? (isFinal ? "#FFD700" : "#E67E22");
  const sub = subtitle ?? (isFinal ? "RONDA FINAL — TODO O NADA" : `GANA 2 DE ${totalRounds} PARA EL TROFEO`);

  return (
    <Animated.View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.banner, { borderColor: accentColor, shadowColor: accentColor }, animStyle]}>
        <LinearGradient colors={["#1a0d00", "#3d2400", "#1a0d00"]} style={styles.grad}>
          <Ionicons name="trophy" size={32} color={accentColor} />
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: accentColor }]}>ROUND {round}</Text>
            <Text style={styles.sub}>{sub}</Text>
          </View>
          <Ionicons name="trophy" size={32} color={accentColor} />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", zIndex: 200 },
  banner: {
    borderRadius: 20, overflow: "hidden", borderWidth: 2,
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 20,
  },
  grad: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 20, gap: 12 },
  textWrap: { alignItems: "center", gap: 4 },
  title: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, letterSpacing: 3 },
  sub: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#C39BD3" },
});
