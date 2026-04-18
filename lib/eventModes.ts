import type { Suit } from "./gameEngine";

export type EventId = "speed" | "random" | "double" | "survival";

export interface EventConfig {
  id: EventId;
  name: string;
  shortName: string;
  desc: string;
  icon: string;
  color: string;
  cardsPerPlayer: number;
  turnSeconds?: number;
  doubleDrawEffect?: boolean;
  randomSuitShuffle?: boolean;
  randomShuffleEvery?: number;
}

export const EVENT_CONFIGS: Record<EventId, EventConfig> = {
  speed: {
    id: "speed",
    name: "Velocidad Extrema",
    shortName: "Velocidad",
    desc: "Solo 5 segundos por turno. ¡Decide rápido!",
    icon: "flash",
    color: "#F39C12",
    cardsPerPlayer: 8,
    turnSeconds: 5,
  },
  random: {
    id: "random",
    name: "Cartas Aleatorias",
    shortName: "Aleatorio",
    desc: "El palo activo cambia al azar cada pocos turnos.",
    icon: "shuffle",
    color: "#9B59B6",
    cardsPerPlayer: 8,
    randomSuitShuffle: true,
    randomShuffleEvery: 4,
  },
  double: {
    id: "double",
    name: "Doble Efecto",
    shortName: "Doble",
    desc: "Las cartas A, 2, 3 y Joker hacen robar el doble.",
    icon: "copy",
    color: "#E74C3C",
    cardsPerPlayer: 8,
    doubleDrawEffect: true,
  },
  survival: {
    id: "survival",
    name: "Supervivencia",
    shortName: "Survival",
    desc: "Empiezas con 12 cartas. ¡Vacíalas todas!",
    icon: "shield",
    color: "#27AE60",
    cardsPerPlayer: 12,
  },
};

export function getEventConfig(id: EventId | undefined | null): EventConfig | null {
  if (!id) return null;
  return EVENT_CONFIGS[id] ?? null;
}

export const EVENT_ORDER: EventId[] = ["speed", "random", "double", "survival"];

export function pickRandomSuit(exclude?: Suit): Suit {
  const all: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const choices = exclude ? all.filter(s => s !== exclude) : all;
  return choices[Math.floor(Math.random() * choices.length)];
}
