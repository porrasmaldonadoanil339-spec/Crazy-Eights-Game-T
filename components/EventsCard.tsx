import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ALL_EVENTS = [
  { id: "speed", name: "Velocidad Extrema", desc: "Todas las cartas tienen temporizador de 5s", icon: "flash", color: "#F39C12", durationDays: 2 },
  { id: "random", name: "Cartas Aleatorias", desc: "Las cartas especiales cambian aleatoriamente", icon: "shuffle", color: "#9B59B6", durationDays: 2 },
  { id: "double", name: "Doble Efecto", desc: "Las cartas especiales tienen efecto doble", icon: "copy", color: "#E74C3C", durationDays: 2 },
  { id: "survival", name: "Supervivencia", desc: "Comienza con 12 cartas. ¡Vacía tu mano!", icon: "shield", color: "#27AE60", durationDays: 2 },
];

function getEventStatus(level: number) {
  if (level < 5) {
    return { event: ALL_EVENTS[0], status: "locked" as const, hoursLeft: 0, nextInHours: 0 };
  }
  const BASE = new Date("2026-03-01T00:00:00Z").getTime();
  const now = Date.now();
  const CYCLE = 3 * 24 * 3600 * 1000;
  const elapsed = now - BASE;
  const cycleIndex = Math.floor(elapsed / CYCLE);
  const eventIdx = cycleIndex % ALL_EVENTS.length;
  const event = ALL_EVENTS[eventIdx];
  const cyclePosMs = elapsed % CYCLE;
  const eventDurMs = event.durationDays * 24 * 3600 * 1000;
  const isLive = cyclePosMs < eventDurMs;
  const hoursLeft = isLive ? Math.ceil((eventDurMs - cyclePosMs) / 3600000) : 0;
  const nextInHours = isLive ? 0 : Math.ceil((CYCLE - cyclePosMs) / 3600000);
  return { event, status: (isLive ? "live" : "upcoming") as "live" | "upcoming", hoursLeft, nextInHours };
}

interface EventsCardProps {
  level: number;
}

export default function EventsCard({ level }: EventsCardProps) {
  const { event, status, hoursLeft, nextInHours } = getEventStatus(level);

  const bgColors: [string, string, string] = status === "live"
    ? [`${event.color}22`, `${event.color}0a`, "transparent"]
    : status === "locked"
    ? ["#1a1a1a", "#111111", "transparent"]
    : ["#0d1520", "#091020", "transparent"];

  const statusLabel = status === "live"
    ? "EVENTO EN VIVO"
    : status === "locked"
    ? "NIVEL 5 REQUERIDO"
    : "PROXIMO EVENTO";

  const statusColor = status === "live" ? event.color : status === "locked" ? "#666" : "#4A90E2";
  const statusIcon = status === "live" ? "radio" : status === "locked" ? "lock-closed" : "time";

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: "hidden",
      borderWidth: 1.5,
      borderColor: status === "live" ? event.color + "88" : status === "locked" ? "#33333388" : "#4A90E244",
      shadowColor: event.color, shadowOpacity: status === "live" ? 0.4 : 0.1, shadowRadius: 10, elevation: 6,
    }}>
      <LinearGradient colors={bgColors} style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
          <Ionicons name={statusIcon as any} size={11} color={statusColor} />
          <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 10, color: statusColor, letterSpacing: 1.5 }}>
            {statusLabel}
          </Text>
          {status === "live" && (
            <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="time-outline" size={11} color={event.color} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: event.color }}>{hoursLeft}h</Text>
            </View>
          )}
          {status === "upcoming" && nextInHours > 0 && (
            <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: "#4A90E2" }}>en {nextInHours}h</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: status === "locked" ? "#33333388" : event.color + "66",
            backgroundColor: status === "locked" ? "#22222244" : event.color + "18",
          }}>
            <Ionicons name={(status === "locked" ? "lock-closed" : event.icon) as any} size={22} color={status === "locked" ? "#666" : event.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: status === "locked" ? "#666" : "#fff", marginBottom: 2 }}>
              {status === "locked" ? "Eventos Especiales" : event.name}
            </Text>
            <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 12, color: status === "locked" ? "#555" : "#aaa" }} numberOfLines={1}>
              {status === "locked" ? "Desbloquea eventos al llegar a nivel 5" : event.desc}
            </Text>
          </View>
          {status === "live" && (
            <View style={{ backgroundColor: event.color, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: "#000" }}>Jugar</Text>
            </View>
          )}
        </View>
        {status === "live" && (
          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center" }}>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: event.color }}>+2</Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: "#888" }}>pts por victoria</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center" }}>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: event.color }}>+1</Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: "#888" }}>pts por derrota</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 8, alignItems: "center" }}>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: event.color }}>Cofre</Text>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 10, color: "#888" }}>a 10 puntos</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
