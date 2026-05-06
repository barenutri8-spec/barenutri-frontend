import { STORAGE_KEYS } from "@/constants";
import { AUTH_SESSION_CHANGE_EVENT } from "@/hooks/useAuthSession";
import type { User } from "@/types";

export function persistAuthSession(data: {
  token: string;
  user: User;
  refreshToken?: string;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
  if (data.refreshToken) {
    localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, data.refreshToken);
  }
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}
