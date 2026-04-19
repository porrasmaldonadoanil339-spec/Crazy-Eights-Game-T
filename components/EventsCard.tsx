import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { CoinIcon } from "@/components/CoinIcon";

export type EventDifficulty = "easy" | "medium" | "hard";

export interface OchoEvent {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  durationDays: number;
  difficulty: EventDifficulty;
  chestType: "common" | "rare" | "epic" | "legendary";
}

const ALL_EVENTS: OchoEvent[] = [
  { id: "speed",    name: "Velocidad Extrema",  desc: "Todas las cartas tienen temporizador de 5s",        icon: "flash",   color: "#F39C12", durationDays: 2, difficulty: "hard",   chestType: "epic" },
  { id: "random",   name: "Cartas Aleatorias",  desc: "Las cartas especiales cambian aleatoriamente",      icon: "shuffle", color: "#9B59B6", durationDays: 2, difficulty: "medium", chestType: "rare" },
  { id: "double",   name: "Doble Efecto",       desc: "Las cartas especiales tienen efecto doble",         icon: "copy",    color: "#E74C3C", durationDays: 2, difficulty: "medium", chestType: "rare" },
  { id: "survival", name: "Supervivencia",      desc: "Comienza con 12 cartas. ¡Vacía tu mano!",           icon: "shield",  color: "#27AE60", durationDays: 2, difficulty: "easy",   chestType: "common" },
];

const DIFF_META: Record<EventDifficulty, { label: string; color: string }> = {
  easy:   { label: "FÁCIL",   color: "#2ecc71" },
  medium: { label: "MEDIO",   color: "#f1c40f" },
  hard:   { label: "DIFÍCIL", color: "#e74c3c" },
};

export function getActiveEvent(level: number): OchoEvent | null {
  const status = getEventStatus(level);
  return status.status === "live" ? status.event : null;
}

function getEventStatus(level: number) {
  if (level < 5) {
    return { event: ALL_EVENTS[0], nextEvent: ALL_EVENTS[1], status: "level_locked" as const, hoursLeft: 0, nextInHours: 0 };
  }
  const BASE = new Date("2026-03-01T00:00:00Z").getTime();
  const now = Date.now();
  const CYCLE = 3 * 24 * 3600 * 1000;
  const elapsed = now - BASE;
  const cycleIndex = Math.floor(elapsed / CYCLE);
  const eventIdx = cycleIndex % ALL_EVENTS.length;
  const event = ALL_EVENTS[eventIdx];
  const nextEvent = ALL_EVENTS[(eventIdx + 1) % ALL_EVENTS.length];
  const cyclePosMs = elapsed % CYCLE;
  const eventDurMs = event.durationDays * 24 * 3600 * 1000;
  const isLive = cyclePosMs < eventDurMs;
  const hoursLeft = isLive ? Math.ceil((eventDurMs - cyclePosMs) / 3600000) : 0;
  const nextInHours = isLive ? 0 : Math.ceil((CYCLE - cyclePosMs) / 3600000);
  // After event ends → "locked_cycle" until the next event activates (re-locks then re-unlocks)
  return { event, nextEvent, status: (isLive ? "live" : "locked_cycle") as "live" | "locked_cycle", hoursLeft, nextInHours };
}

interface EventsCardProps {
  level: number;
}

export default function EventsCard({ level }: EventsCardProps) {
  const { event, nextEvent, status, hoursLeft, nextInHours } = getEventStatus(level);

  // Live pulse animation
  const livePulse = useSharedValue(1);
  useEffect(() => {
    if (status === "live") {
      livePulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })), -1, false);
    } else {
      livePulse.value = 1;
    }
  }, [status, livePulse]);
  const liveDotStyle = useAnimatedStyle(() => ({ transform: [{ scale: livePulse.value }] }));

  // For locked_cycle / level_locked, show NEXT event preview but with lock theme
  const display = status === "locked_cycle" ? nextEvent : event;

  const bgColors: [string, string, string] = status === "live"
    ? [`${display.color}33`, `${display.color}10`, "transparent"]
    : status === "level_locked"
    ? ["#181818", "#0e0e0e", "transparent"]
    : ["#1a1410", "#100b08", "transparent"]; // locked_cycle = dark amber-tinted lock

  const statusLabel = status === "live"
    ? "EVENTO EN VIVO"
    : status === "level_locked"
    ? "NIVEL 5 REQUERIDO"
    : "EVENTO BLOQUEADO"; // re-locked between cycles

  const statusColor = status === "live" ? display.color : status === "level_locked" ? "#666" : "#8B6F47";
  const statusIcon = status === "live" ? "radio" : "lock-closed";

  const isLocked = status !== "live";
  const borderColor = status === "live" ? display.color + "AA" : status === "level_locked" ? "#33333388" : "#5A4530AA";

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: "hidden",
      borderWidth: 1.5,
      borderColor,
      shadowColor: display.color, shadowOpacity: status === "live" ? 0.5 : 0.05, shadowRadius: 12, elevation: 6,
    }}>
      <LinearGradient colors={bgColors} style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
          {status === "live" ? (
            <Animated.View style={[liveDotStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: display.color, shadowColor: display.color, shadowOpacity: 0.9, shadowRadius: 6 }]} />
          ) : (
            <Ionicons name={statusIcon as any} size={11} color={statusColor} />
          )}
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 10, color: statusColor, letterSpacing: 1.5 }}>
            {statusLabel}
          </Text>
          {status === "live" && (
            <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="time-outline" size={11} color={display.color} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: display.color }}>{hoursLeft}h</Text>
            </View>
          )}
          {status === "locked_cycle" && nextInHours > 0 && (
            <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#5A453022", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Ionicons name="hourglass-outline" size={10} color="#C9A876" />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: "#C9A876" }}>Abre en {nextInHours}h</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{
            width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: isLocked ? (status === "level_locked" ? "#33333388" : "#5A453088") : display.color + "88",
            backgroundColor: isLocked ? (status === "level_locked" ? "#22222244" : "#2A1F1544") : display.color + "26",
            position: "relative", overflow: "hidden",
          }}>
            <Ionicons
              name={(isLocked ? "lock-closed" : display.icon) as any}
              size={22}
              color={isLocked ? (status === "level_locked" ? "#666" : "#8B6F47") : display.color}
            />
            {status === "locked_cycle" && (
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", pointerEvents: "none" }} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: isLocked ? (status === "level_locked" ? "#666" : "#9B815C") : "#fff", marginBottom: 2 }}>
              {status === "level_locked" ? "Eventos Especiales" : status === "locked_cycle" ? `Próximo: ${display.name}` : display.name}
            </Text>
            <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 12, color: isLocked ? (status === "level_locked" ? "#555" : "#7A6549") : "#aaa", lineHeight: 16 }}>
              {status === "level_locked" ? "Desbloquea eventos al llegar a nivel 5" : status === "locked_cycle" ? "El evento se reactivará pronto" : display.desc}
            </Text>
          </View>
          {status === "live" && (
            <LinearGradient colors={[display.color, display.color + "CC"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 }}>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: "#000", letterSpacing: 0.5 }}>JUGAR</Text>
            </LinearGradient>
          )}
        </View>
        {status === "live" && (
          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center", gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <CoinIcon size={13} color={event.color} />
                <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: event.color }}>+50</Text>
              </View>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: "#888" }}>monedas extra</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center", gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="star" size={13} color={event.color} />
                <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: event.color }}>+100</Text>
              </View>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: "#888" }}>XP extra</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center", gap: 2 }}>
              <Ionicons name="cube" size={14} color={event.color} />
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: event.color }}>de Evento</Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 9, color: "#888" }}>cofre al ganar</Text>
            </View>
          </View>
        )}
        {status === "live" && (
          <View style={{ flexDirection: "row", marginTop: 8, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: DIFF_META[event.difficulty].color + "22", borderWidth: 1, borderColor: DIFF_META[event.difficulty].color + "55", gap: 4, alignItems: "center" }}>
            <Ionicons name="flame" size={10} color={DIFF_META[event.difficulty].color} />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: DIFF_META[event.difficulty].color, letterSpacing: 1 }}>{DIFF_META[event.difficulty].label}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
