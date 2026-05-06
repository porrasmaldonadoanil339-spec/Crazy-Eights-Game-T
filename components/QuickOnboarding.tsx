import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { useT } from "@/hooks/useT";
import { useProfile } from "@/context/ProfileContext";
import type { TranslationKey } from "@/lib/i18n";

const { width: SW, height: SH } = Dimensions.get("window");

type ArrowSide = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

interface QuickStep {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  arrow: ArrowSide;
}

const STEPS: QuickStep[] = [
  { titleKey: "tutQuickPlayTitle", bodyKey: "tutQuickPlayBody",  icon: "card",        iconColor: Colors.gold,   arrow: "bottom-right" },
  { titleKey: "tutQuickDrawTitle", bodyKey: "tutQuickDrawBody",  icon: "download",    iconColor: "#3498DB",     arrow: "bottom-left"  },
  { titleKey: "tutQuickEightTitle",bodyKey: "tutQuickEightBody", icon: "color-palette", iconColor: "#9B59B6",   arrow: "center"       },
  { titleKey: "tutQuickProgTitle", bodyKey: "tutQuickProgBody",  icon: "trophy",      iconColor: "#27AE60",     arrow: "top-right"    },
  { titleKey: "tutQuickShopTitle", bodyKey: "tutQuickShopBody",  icon: "bag",         iconColor: "#E67E22",     arrow: "top-left"     },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function QuickOnboarding({ visible, onClose }: Props) {
  const T = useT();
  const { markTutorialSeen } = useProfile();
  const [step, setStep] = useState(0);

  const finish = () => {
    markTutorialSeen();
    setStep(0);
    onClose();
  };

  if (!visible) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Anchor coordinates for the arrow indicator pointing to a UI region.
  const arrowPos: Record<ArrowSide, { top: number; left: number; rotate: string }> = {
    "bottom-right": { top: SH * 0.78, left: SW * 0.78, rotate: "135deg" },
    "bottom-left":  { top: SH * 0.78, left: SW * 0.10, rotate: "225deg" },
    "top-right":    { top: SH * 0.12, left: SW * 0.78, rotate: "45deg"  },
    "top-left":     { top: SH * 0.12, left: SW * 0.10, rotate: "315deg" },
    "center":       { top: SH * 0.45, left: SW * 0.50 - 22, rotate: "0deg" },
  };
  const ap = arrowPos[current.arrow];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        {/* Pointer arrow to UI region */}
        <Animated.View
          key={`arrow-${step}`}
          entering={FadeIn.duration(280)}
          style={[styles.arrowWrap, { top: ap.top, left: ap.left, transform: [{ rotate: ap.rotate }] }]}
        >
          <Ionicons name="arrow-up" size={44} color={current.iconColor} />
        </Animated.View>

        <View style={styles.cardWrap}>
          <Animated.View key={`card-${step}`} entering={FadeIn.duration(260)} exiting={FadeOut.duration(180)} style={styles.card}>
            <View style={[styles.iconBubble, { backgroundColor: current.iconColor + "22", borderColor: current.iconColor + "66" }]}>
              <Ionicons name={current.icon} size={32} color={current.iconColor} />
            </View>
            <Text style={styles.title}>{T(current.titleKey)}</Text>
            <Text style={styles.body}>{T(current.bodyKey)}</Text>

            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable onPress={finish} style={styles.skipBtn} hitSlop={10}>
                <Text style={styles.skipText}>{T("skip")}</Text>
              </Pressable>
              <Pressable
                onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
                style={[styles.nextBtn, { backgroundColor: current.iconColor }]}
                hitSlop={10}
              >
                <Text style={styles.nextText}>
                  {isLast ? T("startPlaying") : T("next")}
                </Text>
                <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={18} color="#0c0c0c" />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.78)", justifyContent: "center", alignItems: "center" },
  arrowWrap: { position: "absolute" },
  cardWrap: { width: "88%", maxWidth: 380 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 12,
  },
  iconBubble: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  title: { fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: Colors.text, textAlign: "center" },
  body:  { fontFamily: "Nunito_700Bold",      fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 20 },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.gold, width: 18 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 10 },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  skipText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: Colors.textDim },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 12,
  },
  nextText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#0c0c0c", letterSpacing: 0.3 },
});
