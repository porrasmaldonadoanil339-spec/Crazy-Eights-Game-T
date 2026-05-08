import { EVENT_CONFIGS, EVENT_ORDER, type EventConfig, type EventId } from "./eventModes";

export interface WeeklyEventSlot {
  event: EventConfig;
  weekStart: number;
  weekEnd: number;
  hoursLeft: number;
  daysLeft: number;
  index: number;
  total: number;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;
const EPOCH = new Date("2026-03-02T00:00:00Z").getTime();

export function getCurrentWeeklyEvent(now: number = Date.now()): WeeklyEventSlot {
  const elapsed = Math.max(0, now - EPOCH);
  const weekIndex = Math.floor(elapsed / WEEK_MS);
  const idx = ((weekIndex % EVENT_ORDER.length) + EVENT_ORDER.length) % EVENT_ORDER.length;
  const id = EVENT_ORDER[idx];
  const weekStart = EPOCH + weekIndex * WEEK_MS;
  const weekEnd = weekStart + WEEK_MS;
  const msLeft = Math.max(0, weekEnd - now);
  return {
    event: EVENT_CONFIGS[id],
    weekStart,
    weekEnd,
    hoursLeft: Math.ceil(msLeft / 3600000),
    daysLeft: Math.ceil(msLeft / (24 * 3600000)),
    index: idx,
    total: EVENT_ORDER.length,
  };
}

export function getNextWeeklyEvent(now: number = Date.now()): EventConfig {
  const cur = getCurrentWeeklyEvent(now);
  const nextIdx = (cur.index + 1) % EVENT_ORDER.length;
  return EVENT_CONFIGS[EVENT_ORDER[nextIdx]];
}

export function getUpcomingSchedule(weeks: number = 4, now: number = Date.now()): WeeklyEventSlot[] {
  const slots: WeeklyEventSlot[] = [];
  for (let i = 0; i < weeks; i++) {
    slots.push(getCurrentWeeklyEvent(now + i * WEEK_MS));
  }
  return slots;
}

export function isEventActive(id: EventId, now: number = Date.now()): boolean {
  return getCurrentWeeklyEvent(now).event.id === id;
}
