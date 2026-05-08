import type { Suit } from "./gameEngine";
import type { TranslationKey } from "./i18n";

export type EventId =
  | "speed"
  | "random"
  | "double"
  | "survival"
  | "frozen"
  | "inferno"
  | "chaos"
  | "casino"
  | "fiebre";

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
  frozen: {
    id: "frozen",
    name: "Muerte Súbita",
    shortName: "Súbita",
    desc: "Una sola mano corta — el primer error te elimina.",
    icon: "snow",
    color: "#3498DB",
    cardsPerPlayer: 5,
    turnSeconds: 12,
  },
  inferno: {
    id: "inferno",
    name: "Relámpago Extremo",
    shortName: "Relámpago",
    desc: "Solo 4 segundos por turno y 5 cartas. ¡Quema rivales!",
    icon: "flame",
    color: "#E74C3C",
    cardsPerPlayer: 5,
    turnSeconds: 4,
  },
  chaos: {
    id: "chaos",
    name: "Modo Troll",
    shortName: "Troll",
    desc: "Doble efecto y palo cambiante. ¡Confía en tus reflejos!",
    icon: "skull",
    color: "#FF1744",
    cardsPerPlayer: 8,
    turnSeconds: 6,
    doubleDrawEffect: true,
    randomSuitShuffle: true,
    randomShuffleEvery: 3,
  },
  casino: {
    id: "casino",
    name: "Casino Royale",
    shortName: "Casino",
    desc: "Recompensas premium para apostadores audaces.",
    icon: "diamond",
    color: "#8E44AD",
    cardsPerPlayer: 8,
  },
  fiebre: {
    id: "fiebre",
    name: "Modo Fiebre",
    shortName: "Fiebre",
    desc: "Cartas extra y efectos dobles. Recompensas inflamadas.",
    icon: "flame",
    color: "#FF6B35",
    cardsPerPlayer: 10,
    turnSeconds: 7,
    doubleDrawEffect: true,
  },
};

export function getEventConfig(id: string | undefined | null): EventConfig | null {
  if (!id) return null;
  // Runtime narrow — accepts any string (e.g. server payloads) and returns
  // null for unknown ids without resorting to type assertions.
  if (id in EVENT_CONFIGS) return EVENT_CONFIGS[id as EventId];
  return null;
}

// Only the original 4 events have translation keys. New events fall back to
// the Spanish strings on EventConfig so we don't have to ship 22-language
// translations for every rotation expansion at once.
const EVENT_NAME_KEYS: Partial<Record<EventId, TranslationKey>> = {
  speed: "eventSpeedName",
  random: "eventRandomName",
  double: "eventDoubleName",
  survival: "eventSurvivalName",
};
const EVENT_SHORT_KEYS: Partial<Record<EventId, TranslationKey>> = {
  speed: "eventSpeedShort",
  random: "eventRandomShort",
  double: "eventDoubleShort",
  survival: "eventSurvivalShort",
};
const EVENT_DESC_KEYS: Partial<Record<EventId, TranslationKey>> = {
  speed: "eventSpeedDesc",
  random: "eventRandomDesc",
  double: "eventDoubleDesc",
  survival: "eventSurvivalDesc",
};

type Translator = (key: TranslationKey) => string;

export function getEventName(id: EventId, T: Translator): string {
  const key = EVENT_NAME_KEYS[id];
  return key ? T(key) : EVENT_CONFIGS[id].name;
}
export function getEventShortName(id: EventId, T: Translator): string {
  const key = EVENT_SHORT_KEYS[id];
  return key ? T(key) : EVENT_CONFIGS[id].shortName;
}
export function getEventDesc(id: EventId, T: Translator): string {
  const key = EVENT_DESC_KEYS[id];
  return key ? T(key) : EVENT_CONFIGS[id].desc;
}

export const EVENT_ORDER: EventId[] = [
  "speed", "random", "double", "survival",
  "frozen", "inferno", "chaos", "casino", "fiebre",
];

export function pickRandomSuit(exclude?: Suit): Suit {
  const all: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const choices = exclude ? all.filter(s => s !== exclude) : all;
  return choices[Math.floor(Math.random() * choices.length)];
}
