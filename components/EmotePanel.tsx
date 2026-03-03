import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Modal, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { playSound } from "@/lib/sounds";
import { useProfile } from "@/context/ProfileContext";
import { emoteLabel } from "@/lib/achTranslations";

export interface Emote {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  sound: string;
}

export const EMOTES: Emote[] = [
  { id: "gg",     icon: "thumbs-up",     color: "#27AE60", sound: "win" },
  { id: "draw2",  icon: "flame",         color: "#E74C3C", sound: "card_wild" },
  { id: "close",  icon: "heart-half",    color: "#E67E22", sound: "button_press" },
  { id: "draw",   icon: "layers",        color: "#9B59B6", sound: "card_draw" },
  { id: "no",     icon: "close-circle",  color: "#E74C3C", sound: "error" },
  { id: "win",    icon: "trophy",        color: "#D4AF37", sound: "achievement" },
  { id: "luck",   icon: "star",          color: "#F1C40F", sound: "card_flip" },
  { id: "expert", icon: "timer",         color: "#A855F7", sound: "shuffle" },
];

interface EmoteBubbleProps {
  emote: Emote | null;
  side: "player" | "cpu";
  lang?: "es" | "en" | "pt";
  muted?: boolean;
}

export function EmoteBubble({ emote, side, lang = "es", muted = false }: EmoteBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!emote) return;
    opacity.setValue(1);
    translateY.setValue(0);
    scale.setValue(0.7);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: side === "player" ? 10 : -10, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [emote]);

  if (!emote || muted) return null;

  const label = emoteLabel(emote.id, lang);

  return (
    <Animated.View
      style={[
        styles.bubble,
        side === "player" ? styles.bubblePlayer : styles.bubbleCpu,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Ionicons name={emote.icon} size={16} color={emote.color} />
      <Text style={[styles.bubbleText, { color: emote.color }]}>{label}</Text>
    </Animated.View>
  );
}

interface EmotePanelProps {
  onSendEmote: (emote: Emote) => void;
  lastEmoteTime: number;
}

export function EmotePanel({ onSendEmote, lastEmoteTime }: EmotePanelProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as "es" | "en" | "pt";
  const COOLDOWN_MS = 5000;
  const canSend = Date.now() - lastEmoteTime > COOLDOWN_MS;

  const panelTitle = lang === "en" ? "React" : lang === "pt" ? "Reagir" : "Reacción";

  const handleEmote = (emote: Emote) => {
    if (!canSend) return;
    playSound(emote.sound as any).catch(() => {});
    onSendEmote(emote);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => { if (canSend) setOpen(true); }}
        style={[styles.triggerBtn, !canSend && styles.triggerBtnDisabled]}
        testID="emote-button"
      >
        <Ionicons name="happy" size={18} color={canSend ? Colors.gold : Colors.textDim} />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBg} onPress={() => setOpen(false)}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{panelTitle}</Text>
            <View style={styles.grid}>
              {EMOTES.map((emote) => (
                <Pressable
                  key={emote.id}
                  onPress={() => handleEmote(emote)}
                  style={styles.emoteBtn}
                >
                  <View style={[styles.emoteIconWrap, { backgroundColor: emote.color + "22" }]}>
                    <Ionicons name={emote.icon} size={22} color={emote.color} />
                  </View>
                  <Text style={styles.emoteLabel}>{emoteLabel(emote.id, lang)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface + "cc",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.gold + "55",
  },
  triggerBtnDisabled: { opacity: 0.4 },
  modalBg: {
    flex: 1, backgroundColor: "#00000066",
    justifyContent: "flex-end", paddingBottom: 160,
    alignItems: "center",
  },
  panel: {
    backgroundColor: Colors.surface,
    borderRadius: 20, padding: 16, width: 280,
    borderWidth: 1, borderColor: Colors.border,
  },
  panelTitle: {
    fontFamily: "Nunito_700Bold", fontSize: 12, color: Colors.textMuted,
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "center",
  },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center",
  },
  emoteBtn: {
    width: 116, alignItems: "center", gap: 4,
    backgroundColor: Colors.card, borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  emoteIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  emoteLabel: {
    fontFamily: "Nunito_700Bold", fontSize: 10, color: Colors.text, textAlign: "center",
  },
  bubble: {
    position: "absolute", flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.surface + "f0",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    zIndex: 100,
  },
  bubblePlayer: { bottom: 84, right: 8 },
  bubbleCpu: { top: 84, right: 8 },
  bubbleText: {
    fontFamily: "Nunito_700Bold", fontSize: 11,
  },
});
