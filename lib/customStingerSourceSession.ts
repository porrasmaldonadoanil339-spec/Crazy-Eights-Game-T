// Task #98 — keep the original source clip + last-picked trim window so the
// player can re-open the trim modal and try a different 2-second slice
// without re-recording or re-uploading.
// Task #106 — also persist the memo to AsyncStorage and rely on a stable
// on-disk copy of the source (written by `persistCustomStingerSource` in
// customStingerCache) so Re-trim still works after the app is killed and
// reopened, for as long as the saved custom intro itself sticks around.
// Cleanup of the source file on disk remains the caller's responsibility
// (the settings screen owns the expo-file-system imports for that flow).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";

export type StingerSourceMemo = {
  srcUri: string;
  ext: string;
  durationMs: number;
  srcSizeBytes: number;
  startMs: number;
  endMs: number;
};

const STORAGE_KEY = "ocho_stinger_source_v1";

let memo: StingerSourceMemo | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) {
    try { l(); } catch {}
  }
}

function persist(next: StingerSourceMemo | null): void {
  // Fire-and-forget: persistence is best-effort, the in-memory copy is
  // always authoritative for the rest of the session.
  if (next) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  } else {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }
}

export function getStingerSourceMemo(): StingerSourceMemo | null {
  return memo;
}

export function setStingerSourceMemo(next: StingerSourceMemo | null): void {
  memo = next;
  persist(next);
  notify();
}

export function clearStingerSourceMemo(): void {
  setStingerSourceMemo(null);
}

export function subscribeStingerSourceMemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// Task #106 — read the persisted memo (if any) at startup, validate that
// the source file still lives on disk, and seed the in-memory state. Safe
// to call multiple times: only the first call actually does the work.
// If a `setStingerSourceMemo` happens to land mid-hydration (e.g. the
// player opens the trim modal and saves before AsyncStorage resolves), we
// keep the live value instead of clobbering it with the persisted one.
export async function hydrateStingerSourceMemo(): Promise<StingerSourceMemo | null> {
  if (hydrated) return memo;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return memo;
    const parsed = JSON.parse(raw) as Partial<StingerSourceMemo> | null;
    if (
      !parsed
      || typeof parsed.srcUri !== "string"
      || typeof parsed.ext !== "string"
      || typeof parsed.durationMs !== "number"
      || typeof parsed.srcSizeBytes !== "number"
      || typeof parsed.startMs !== "number"
      || typeof parsed.endMs !== "number"
    ) {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      return memo;
    }
    let exists = false;
    try { exists = !!new File(parsed.srcUri).exists; } catch {}
    if (!exists) {
      // Source file got swept (e.g. user wiped app storage); drop the
      // stale entry so the UI hides the Re-trim button cleanly.
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      return memo;
    }
    if (memo) return memo;
    memo = {
      srcUri: parsed.srcUri,
      ext: parsed.ext,
      durationMs: parsed.durationMs,
      srcSizeBytes: parsed.srcSizeBytes,
      startMs: parsed.startMs,
      endMs: parsed.endMs,
    };
    notify();
    return memo;
  } catch {
    return memo;
  }
}
