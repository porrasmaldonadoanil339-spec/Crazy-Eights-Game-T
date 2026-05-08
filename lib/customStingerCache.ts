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

// Uploads a locally-persisted custom stinger to the cloud. Returns the
// resulting remote URL on success or null when the user is unauthenticated /
// offline / the upload fails (callers should keep the local file:// URI in
// the profile in those cases so playback still works on this device).
export async function uploadCustomStinger(localUri: string, ext: string): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;
  let base64: string;
  try {
    const f = new File(localUri);
    base64 = await f.base64();
  } catch {
    return null;
  }
  try {
    const url = new URL("/api/auth/profile/stinger", getApiUrl()).toString();
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: base64, ext }),
    });
    if (!resp.ok) return null;
    const json = await resp.json() as { ok?: boolean; url?: string };
    return json.ok && json.url ? json.url : null;
  } catch {
    return null;
  }
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
): Promise<string | null> {
  if (!localUri || isRemote(localUri)) return null;
  const dotIdx = localUri.lastIndexOf(".");
  const ext = dotIdx >= 0 ? localUri.slice(dotIdx + 1).toLowerCase() : "m4a";
  const remoteUrl = await uploadCustomStinger(localUri, ext);
  if (!remoteUrl) return null;
  cacheLocalCopyForRemote(remoteUrl, localUri);
  return remoteUrl;
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
