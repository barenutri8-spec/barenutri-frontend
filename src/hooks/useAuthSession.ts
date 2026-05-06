"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/types";
import { STORAGE_KEYS } from "@/constants";

/** Same-tab auth updates (storage event only fires for other tabs). */
export const AUTH_SESSION_CHANGE_EVENT = "barenutri-auth-session-change";

export function useAuthSession(): {
  user: User | null;
  ready: boolean;
  logout: () => void;
} {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (raw && token) {
        setUser(JSON.parse(raw) as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, load);
    };
  }, [load]);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setUser(null);
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
  }, []);

  return { user, ready, logout };
}
