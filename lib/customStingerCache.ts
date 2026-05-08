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
