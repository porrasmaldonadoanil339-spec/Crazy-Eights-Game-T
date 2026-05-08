// Task #88 — helpers for backing up the player's custom intro clip to the
// cloud and resolving a remote profile URI back to a local cached file the
// audio manager can play. The profile field `customLogoStingerUri` may now
// hold an https:// URL pointing at the server's /api/auth/profile/stinger
// endpoint; this module:
//   - uploads a freshly-saved clip and returns the remote URL,
//   - copies the local source into a deterministic cache slot keyed by the
//     remote filename so subsequent boots don't have to re-download,
//   - downloads + caches the remote clip on app start when the cache slot
//     is missing (e.g. fresh install / new device),
//   - deletes the remote copy when the player removes their pick.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Directory, Paths } from "expo-file-system";
import { getApiUrl } from "@/lib/query-client";

const CACHE_SUBDIR = "custom-stingers/cached";

function cacheDir(): Directory {
  const d = new Directory(Paths.document, CACHE_SUBDIR);
  try { d.create({ intermediates: true, idempotent: true }); } catch {}
  return d;
}

function isRemote(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

function filenameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) return null;
    if (!/^[A-Za-z0-9_.-]+$/.test(last)) return null;
    return last;
  } catch {
    return null;
  }
}

// Task #91 — re-encode the trimmed [startMs, endMs] window of a source clip
// into a real m4a file by round-tripping through the server's ffmpeg-backed
// /api/auth/profile/stinger/trim endpoint. Writes the trimmed bytes into the
// app's document directory and returns the local file:// URI plus the
// trimmed clip's actual duration. Returns null on any failure (network /
// server / write error) so callers can show an alert instead of silently
// keeping the full source. No auth required (the endpoint is rate-limited
// per IP and stateless), so guests can trim too.
const TRIMMED_DIR = "custom-stingers";

function base64ToBytes(b64: string): Uint8Array {
  const bin = globalThis.atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Task #105 — build a multipart payload that points React Native's fetch at
// the source file's uri so the bytes stream from disk to the network without
// ever being read into JS memory. RN's FormData accepts the
// `{ uri, name, type } as any` shape; this is the documented (if untyped)
// pattern for streaming local files. We DO NOT set Content-Type ourselves
// — fetch derives the multipart boundary string from FormData.
function buildStingerFormData(srcUri: string, ext: string, extra?: Record<string, string | number>): FormData {
  const fd = new FormData();
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  fd.append("file", { uri: srcUri, name: `clip.${safeExt}`, type: `audio/${safeExt}` } as unknown as Blob);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) fd.append(k, String(v));
  }
  return fd;
}

// Task #108 — discriminated result so callers can distinguish a user-
// initiated abort (no error UI) from a real network/server failure
// (retry-able error UI). The previous `null` overload is gone — every
// caller now switches on `.ok` / `.reason`.
export type TrimStingerResult =
  | { ok: true; uri: string; durationMs: number; ext: string }
  | { ok: false; reason: "aborted" | "failed" };

export async function trimCustomStingerToFile(
  srcUri: string,
  ext: string,
  startMs: number,
  endMs: number,
  signal?: AbortSignal,
): Promise<TrimStingerResult> {
  // Caller may have already aborted before we even started (rare but
  // possible if the trim button is double-tapped). Skip the fetch.
  if (signal?.aborted) return { ok: false, reason: "aborted" };
  let trimmed: { ext: string; durationMs: number; data: string };
  try {
    const url = new URL("/api/auth/profile/stinger/trim", getApiUrl()).toString();
    const resp = await fetch(url, {
      method: "POST",
      body: buildStingerFormData(srcUri, ext, { startMs, endMs }),
      signal,
    });
    if (!resp.ok) return { ok: false, reason: "failed" };
    const json = await resp.json() as { ok?: boolean; ext?: string; durationMs?: number; data?: string };
    if (!json.ok || !json.data || !json.ext || typeof json.durationMs !== "number") {
      return { ok: false, reason: "failed" };
    }
    trimmed = { ext: json.ext, durationMs: json.durationMs, data: json.data };
  } catch (err: unknown) {
    // fetch + AbortController throws either a DOMException with
    // name === "AbortError" (web/RN polyfill) or an Error whose name
    // contains "abort" — check both, and also re-check signal.aborted
    // since the caller may have aborted between the throw and now.
    const name = (err as { name?: string } | null)?.name ?? "";
    if (signal?.aborted || name === "AbortError" || /abort/i.test(name)) {
      return { ok: false, reason: "aborted" };
    }
    return { ok: false, reason: "failed" };
  }
  // Server already returned the trimmed bytes — even if the caller
  // aborts between here and the disk write, completing the write is
  // cheaper than discarding the work and we'd rather hand back the
  // file than waste the round-trip. The caller checks the result and
  // ignores it on abort, so the file just stays on disk briefly until
  // the next save / app close (the document dir gets cleaned up by
  // the existing custom-stinger sweep).
  try {
    const dir = new Directory(Paths.document, TRIMMED_DIR);
    try { dir.create({ intermediates: true, idempotent: true }); } catch {}
    const safeExt = trimmed.ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "m4a";
    const fileName = `intro-${Date.now()}.${safeExt}`;
    const dest = new File(dir, fileName);
    if (dest.exists) { try { dest.delete(); } catch {} }
    dest.write(base64ToBytes(trimmed.data));
    return { ok: true, uri: dest.uri, durationMs: trimmed.durationMs, ext: safeExt };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

// Task #104 — re-encode an oversized source clip down to a smaller mono
// 64k AAC m4a via the server's /profile/stinger/shrink endpoint, then
// write the result to the document directory and return its uri/ext/size.
// Used by the trim modal when the picked source exceeds the trim
// endpoint's 5 MB limit but is still small enough for the shrink endpoint
// (30 MB). Returns a structured reason on failure so the UI can show a
// specific message ("input too large" vs "still too big after shrinking"
// vs "network/server").
const SHRUNK_DIR = "custom-stingers";

export type ShrinkStingerErrorReason =
  | "input_too_large"   // 413 — source was over 30 MB cap
  | "still_too_large"   // 413 — shrink ran but output still > 5 MB
  | "rate_limited"      // 429 — try again later
  | "bad_request"       // 400 — unsupported format / bad payload
  | "transient";        // network / 5xx / file IO
export type ShrinkStingerResult =
  | { ok: true; uri: string; ext: string; sizeBytes: number }
  | { ok: false; reason: ShrinkStingerErrorReason };

export async function shrinkCustomStingerToFile(
  srcUri: string,
  ext: string,
): Promise<ShrinkStingerResult> {
  // Task #105 — stream the source bytes via multipart instead of base64
  // JSON so a 25-30 MB recording doesn't have to be loaded into JS memory
  // before being sent. fetch + RN's FormData reads from `srcUri` directly.
  let resp: Response;
  try {
    const url = new URL("/api/auth/profile/stinger/shrink", getApiUrl()).toString();
    resp = await fetch(url, {
      method: "POST",
      body: buildStingerFormData(srcUri, ext),
    });
  } catch {
    return { ok: false, reason: "transient" };
  }
  if (!resp.ok) {
    switch (resp.status) {
      case 400: return { ok: false, reason: "bad_request" };
      case 413: {
        // Distinguish "input was over 30 MB" vs "shrunk output still > 5 MB"
        // by checking the response body — both come back as 413 but mean
        // different things to the player. Falls back to input_too_large
        // on parse failure (the more common case in practice).
        try {
          const body = await resp.json() as { sizeBytes?: number };
          if (typeof body.sizeBytes === "number") return { ok: false, reason: "still_too_large" };
        } catch {}
        return { ok: false, reason: "input_too_large" };
      }
      case 429: return { ok: false, reason: "rate_limited" };
      default:  return { ok: false, reason: "transient" };
    }
  }
  let json: { ok?: boolean; ext?: string; data?: string; sizeBytes?: number };
  try {
    json = await resp.json() as typeof json;
  } catch {
    return { ok: false, reason: "transient" };
  }
  if (!json.ok || !json.data || !json.ext || typeof json.sizeBytes !== "number") {
    return { ok: false, reason: "transient" };
  }
  try {
    const dir = new Directory(Paths.document, SHRUNK_DIR);
    try { dir.create({ intermediates: true, idempotent: true }); } catch {}
    const safeExt = json.ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "m4a";
    const fileName = `intro-shrunk-${Date.now()}.${safeExt}`;
    const dest = new File(dir, fileName);
    if (dest.exists) { try { dest.delete(); } catch {} }
    dest.write(base64ToBytes(json.data));
    return { ok: true, uri: dest.uri, ext: safeExt, sizeBytes: json.sizeBytes };
  } catch {
    return { ok: false, reason: "transient" };
  }
}

// Task #92 — ask the server to decode the source clip and return ~N peak
// amplitude samples (0..1) so the trim modal can render a real waveform of
// the recorded audio. Returns null on any failure (no auth needed). Caller
// is expected to fall back to a deterministic placeholder so the modal
// still shows *something* if decoding fails.
export async function computeStingerWaveform(
  srcUri: string,
  ext: string,
  samples: number = 36,
): Promise<number[] | null> {
  let base64: string;
  try {
    base64 = await new File(srcUri).base64();
  } catch {
    return null;
  }
  try {
    const url = new URL("/api/auth/profile/stinger/waveform", getApiUrl()).toString();
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: base64, ext, samples }),
    });
    if (!resp.ok) return null;
    const json = await resp.json() as { ok?: boolean; samples?: number[] };
    if (!json.ok || !Array.isArray(json.samples)) return null;
    return json.samples.map(v => {
      const n = typeof v === "number" && isFinite(v) ? v : 0;
      return Math.max(0, Math.min(1, n));
    });
  } catch {
    return null;
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem("ocho_auth_v1");
    if (!raw) return null;
    const { token, user } = JSON.parse(raw) as { token?: string; user?: { isGuest?: boolean } };
    if (!token || user?.isGuest) return null;
    return token;
  } catch {
    return null;
  }
}

// Task #97 — structured upload result. Permanent reasons (too_large,
// rate_limited, storage_full) tell the auto-retry hook to back off and
// the settings UI to surface a specific message instead of a generic
// "Backup failed". Transient reasons (network / 5xx / file read) are
// safe to retry silently on the next foreground / reconnect.
export type UploadStingerErrorReason =
  | "no_auth"        // guest or no stored token — nothing to retry until sign-in
  | "transient"      // network failure, 5xx, file read error → silent retry ok
  | "unauthorized"   // 401 (token expired) → manual retry after re-auth
  | "too_large"      // 413 → the same file will always fail; permanent
  | "rate_limited"   // 429 → permanent for now, manual retry later may work
  | "storage_full"   // 507 → server-side, permanent for now
  | "bad_request";   // 400 → unsupported format / corrupt payload; permanent
export type UploadStingerResult =
  | { ok: true; url: string }
  | { ok: false; reason: UploadStingerErrorReason };

// Module-level coalescing: when both the manual retry from settings and
// the silent auto-retry from _layout fire around the same foreground /
// reconnect event for the *same* clip, a second upload would race the
// first and the "last write wins" state update could clobber the real
// outcome. We key by (localUri, ext) so duplicate requests share one
// promise — but a brand-new clip (different URI) always starts its own
// upload, so saving clip B while clip A is still in flight doesn't end
// up with the profile pointing at clip A's URL.
const inFlightUploads = new Map<string, Promise<UploadStingerResult>>();

// Uploads a locally-persisted custom stinger to the cloud. Returns a
// structured result so callers can distinguish permanent failures
// (don't auto-retry) from transient ones (do).
export async function uploadCustomStinger(localUri: string, ext: string): Promise<UploadStingerResult> {
  const key = `${localUri}\u0000${ext}`;
  const existing = inFlightUploads.get(key);
  if (existing) return existing;
  const pending = (async (): Promise<UploadStingerResult> => {
  const token = await getAuthToken();
  if (!token) return { ok: false, reason: "no_auth" };
  let base64: string;
  try {
    const f = new File(localUri);
    base64 = await f.base64();
  } catch {
    return { ok: false, reason: "transient" };
  }
  let resp: Response;
  try {
    const url = new URL("/api/auth/profile/stinger", getApiUrl()).toString();
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: base64, ext }),
    });
  } catch {
    return { ok: false, reason: "transient" };
  }
  if (resp.ok) {
    try {
      const json = await resp.json() as { ok?: boolean; url?: string };
      if (json.ok && json.url) return { ok: true, url: json.url };
      return { ok: false, reason: "transient" };
    } catch {
      return { ok: false, reason: "transient" };
    }
  }
  switch (resp.status) {
    case 400: return { ok: false, reason: "bad_request" };
    case 401: return { ok: false, reason: "unauthorized" };
    case 413: return { ok: false, reason: "too_large" };
    case 429: return { ok: false, reason: "rate_limited" };
    case 507: return { ok: false, reason: "storage_full" };
    default:  return { ok: false, reason: "transient" };
  }
  })();
  inFlightUploads.set(key, pending);
  try {
    return await pending;
  } finally {
    inFlightUploads.delete(key);
  }
}

// Reasons the auto-retry hook should treat as permanent (no point trying
// again on the next foreground / reconnect — the same payload + the same
// server state will fail the same way). The settings screen still allows
// a manual retry for `storage_full` / `rate_limited` since those are
// time-based, but the silent background retry stays out of it. `401`
// (`unauthorized`) is permanent for the silent path because the token
// won't fix itself — the player needs to re-auth, at which point the
// settings badge tells them to do so and the URI-change reset (or a
// manual retry) restarts the upload.
export function isPermanentUploadError(reason: UploadStingerErrorReason): boolean {
  return reason === "too_large"
      || reason === "rate_limited"
      || reason === "storage_full"
      || reason === "bad_request"
      || reason === "unauthorized";
}

// Task #96 — silent retry of the cloud upload for a locally-saved custom
// stinger (one that previously failed to back up because the device was
// offline / unauthenticated). Returns the new remote URL on success or
// null on any other outcome (still local, still offline, guest user, etc.).
// Caller is responsible for swapping the profile URI to the returned value
// — this helper deliberately doesn't touch profile state so it stays usable
// from non-React contexts.
export async function tryAutoUploadCustomStinger(
  localUri: string | null | undefined,
): Promise<UploadStingerResult | null> {
  if (!localUri || isRemote(localUri)) return null;
  const dotIdx = localUri.lastIndexOf(".");
  const ext = dotIdx >= 0 ? localUri.slice(dotIdx + 1).toLowerCase() : "m4a";
  const result = await uploadCustomStinger(localUri, ext);
  if (result.ok) cacheLocalCopyForRemote(result.url, localUri);
  return result;
}

// Best-effort delete of the user's remote stinger copy. Silent on failure —
// the local profile change still wins so the player sees the slot cleared.
export async function deleteRemoteCustomStinger(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;
  try {
    const url = new URL("/api/auth/profile/stinger", getApiUrl()).toString();
    await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

// After a successful upload, copy the locally-saved source into the cache
// slot keyed by the remote URL's filename so the post-upload `setCustomStingerUri`
// (driven by the profile change) finds a hit and skips the network entirely.
export function cacheLocalCopyForRemote(remoteUrl: string, localUri: string): string | null {
  const filename = filenameFromUrl(remoteUrl);
  if (!filename) return null;
  try {
    const dir = cacheDir();
    const dest = new File(dir, filename);
    if (dest.exists) { try { dest.delete(); } catch {} }
    const src = new File(localUri);
    src.copy(dest);
    return dest.uri;
  } catch {
    return null;
  }
}

// Resolves the profile-stored URI to a local file:// URI playable by the
// audio manager. Local URIs pass through unchanged. Remote URLs are served
// from the cache; missing cache entries trigger a one-shot download.
export async function resolveCustomStingerUri(uri: string | null | undefined): Promise<string | null> {
  if (!uri) return null;
  if (!isRemote(uri)) return uri;
  const filename = filenameFromUrl(uri);
  if (!filename) return null;
  const dir = cacheDir();
  const dest = new File(dir, filename);
  if (dest.exists) return dest.uri;
  try {
    const downloaded = await File.downloadFileAsync(uri, dest);
    return downloaded.uri;
  } catch {
    return null;
  }
}

// Removes every cached download. Called when the player clears their custom
// pick so we don't accumulate orphaned files in the document directory.
export function clearCustomStingerCache(): void {
  try {
    const dir = cacheDir();
    for (const entry of dir.list()) {
      try { entry.delete(); } catch {}
    }
  } catch {}
}
