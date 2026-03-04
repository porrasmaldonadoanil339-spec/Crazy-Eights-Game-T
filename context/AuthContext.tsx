import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";

export type AuthUserPublic = { id: string; username: string };

const AUTH_STORAGE_KEY = "ocho_auth_v1";

export interface AuthUser {
  id: string;
  username: string;
  isGuest: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (accessToken: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithFacebook: (accessToken: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithToken: (user: AuthUserPublic, token: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  loginWithGoogle: async () => ({ ok: false }),
  loginWithFacebook: async () => ({ ok: false }),
  loginWithToken: () => {},
  loginAsGuest: () => {},
  logout: () => {},
  isAuthenticated: false,
});

function getBase(): string {
  try {
    const url = getApiUrl();
    return url.endsWith("/") ? url.slice(0, -1) : url;
  } catch {
    return "";
  }
}

async function authPost(path: string, body: Record<string, string>) {
  const base = getBase();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const data = await res.json() as Record<string, unknown>;
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as { user: AuthUser; token: string };
          if (saved.user && saved.token) {
            if (saved.user.isGuest) {
              setUser(saved.user);
            } else {
              authPost("/api/auth/verify", { token: saved.token })
                .then((data) => {
                  if (data.ok && data.user) {
                    const u = data.user as { id: string; username: string };
                    setUser({ id: u.id, username: u.username, isGuest: false });
                  }
                })
                .catch(() => {});
            }
          }
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback((u: AuthUser, tok: string) => {
    setUser(u);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: u, token: tok }));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const data = await authPost("/api/auth/login", { username, password });
      if (data.ok && data.user && data.token) {
        const u = data.user as { id: string; username: string };
        persist({ id: u.id, username: u.username, isGuest: false }, data.token as string);
        return { ok: true };
      }
      return { ok: false, error: (data.error as string) || "Login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, [persist]);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const data = await authPost("/api/auth/register", { username, password });
      if (data.ok && data.user && data.token) {
        const u = data.user as { id: string; username: string };
        persist({ id: u.id, username: u.username, isGuest: false }, data.token as string);
        return { ok: true };
      }
      return { ok: false, error: (data.error as string) || "Registration failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, [persist]);

  const loginWithGoogle = useCallback(async (accessToken: string) => {
    try {
      const data = await authPost("/api/auth/google", { accessToken });
      if (data.ok && data.user && data.token) {
        const u = data.user as { id: string; username: string };
        persist({ id: u.id, username: u.username, isGuest: false }, data.token as string);
        return { ok: true };
      }
      return { ok: false, error: (data.error as string) || "Google login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, [persist]);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    try {
      const data = await authPost("/api/auth/facebook", { accessToken });
      if (data.ok && data.user && data.token) {
        const u = data.user as { id: string; username: string };
        persist({ id: u.id, username: u.username, isGuest: false }, data.token as string);
        return { ok: true };
      }
      return { ok: false, error: (data.error as string) || "Facebook login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, [persist]);

  const loginWithToken = useCallback((userPublic: AuthUserPublic, token: string) => {
    persist({ id: userPublic.id, username: userPublic.username, isGuest: false }, token);
  }, [persist]);

  const loginAsGuest = useCallback(() => {
    const guestId = "guest_" + Date.now().toString(36);
    const guestUser: AuthUser = { id: guestId, username: "Invitado", isGuest: true };
    persist(guestUser, "guest");
  }, [persist]);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      loginWithToken,
      loginAsGuest,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
