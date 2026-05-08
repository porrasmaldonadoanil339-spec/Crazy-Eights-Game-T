// Task #98 — keep the original source clip + last-picked trim window in
// memory for one session so the player can re-open the trim modal and
// try a different 2-second slice without re-recording or re-uploading.
// Module-level state intentionally: it survives navigating away from the
// Settings screen, but dies on app reload — matching the spec's "Source
// clip is dropped on app close or after a fresh upload" requirement.
// Cleanup of the actual file on disk is the caller's responsibility (the
// settings screen already owns expo-file-system imports), so this module
// stays a tiny in-memory store with a subscribe hook.

export type StingerSourceMemo = {
  srcUri: string;
  ext: string;
  durationMs: number;
  srcSizeBytes: number;
  startMs: number;
  endMs: number;
};

let memo: StingerSourceMemo | null = null;
const listeners = new Set<() => void>();

export function getStingerSourceMemo(): StingerSourceMemo | null {
  return memo;
}

export function setStingerSourceMemo(next: StingerSourceMemo | null): void {
  memo = next;
  for (const l of listeners) {
    try { l(); } catch {}
  }
}

export function clearStingerSourceMemo(): void {
  setStingerSourceMemo(null);
}

export function subscribeStingerSourceMemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
