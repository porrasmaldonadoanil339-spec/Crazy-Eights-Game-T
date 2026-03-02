import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Modal, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { playSound } from "@/lib/sounds";

export interface Emote {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const EMOTES: Emote[] = [
  { id: "gg",       label: "Buena jugada",    icon: "thumbs-up",      color: "#27AE60" },
  { id: "draw2",    label: "Toma ese +2",      icon: "flame",           color: "#E74C3C" },
  { id: "close",    label: "Casi pierdo",      icon: "heart-half",      color: "#E67E22" },
  { id: "draw",     label: "Te tocó robar",    icon: "layers",          color: "#9B59B6" },
  { id: "no",       label: "No puede ser",     icon: "close-circle",    color: "#E74C3C" },
  { id: "win",      label: "Te voy a ganar",   icon: "trophy",          color: "#D4AF37" },
  { id: "luck",     label: "Qué suerte",       icon: "star",            color: "#F1C40F" },
  { id: "expert",   label: "Modo Experto",     icon: "timer",           color: "#A855F7" },
];

interface EmoteBubbleProps {
  emote: Emote | null;
  side: "player" | "cpu";
}

export function EmoteBubble({ emote, side }: EmoteBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!emote) return;
    opacity.setValue(1);
    translateY.setValue(0);
    Animated.sequence([
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: side === "player" ? 10 : -10, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [emote]);

  if (!emote) return null;

  return (
    <Animated.View
      style={[
        styles.bubble,
        side === "player" ? styles.bubblePlayer : styles.bubbleCpu,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={emote.icon} size={14} color={emote.color} />
      <Text style={[styles.bubbleText, { color: emote.color }]}>{emote.label}</Text>
    </Animated.View>
  );
}

interface EmotePanelProps {
  onSendEmote: (emote: Emote) => void;
  lastEmoteTime: number;
}

export function EmotePanel({ onSendEmote, lastEmoteTime }: EmotePanelProps) {
  const [open, setOpen] = useState(false);
  const COOLDOWN_MS = 5000;
  const canSend = Date.now() - lastEmoteTime > COOLDOWN_MS;

  const handleEmote = (emote: Emote) => {
    if (!canSend) return;
    playSound("button_press").catch(() => {});
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
            <Text style={styles.panelTitle}>Reacción</Text>
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
                  <Text style={styles.emoteLabel}>{emote.label}</Text>
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
