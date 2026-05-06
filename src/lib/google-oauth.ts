import { GOOGLE_OAUTH_CALLBACK_PATH, STORAGE_KEYS } from "@/constants";

/**
 * Reads OAuth parameters from the browser redirect URL (Google returns them in the query string).
 * Uses the full `href` so parsing matches exactly what landed after the redirect.
 */
export function extractGoogleOAuthRedirectParams(fullHref: string): {
  code: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
} {
  try {
    const u = new URL(fullHref);
    const fromSearch = (key: string) => u.searchParams.get(key);

    let code = fromSearch("code");
    let state = fromSearch("state");
    let error = fromSearch("error");
    let errorDescription = fromSearch("error_description");

    // Rare misconfigurations put params in the fragment instead of the query
    if (!code && u.hash.length > 1) {
      const hashParams = new URLSearchParams(u.hash.slice(1));
      code = hashParams.get("code");
      state = state ?? hashParams.get("state");
      error = error ?? hashParams.get("error");
      errorDescription =
        errorDescription ?? hashParams.get("error_description");
    }

    return { code, state, error, errorDescription };
  } catch {
    return {
      code: null,
      state: null,
      error: null,
      errorDescription: null,
    };
  }
}

/** Full redirect_uri sent to the backend (must match Google console + API). */
export function getGoogleOAuthRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${GOOGLE_OAUTH_CALLBACK_PATH}`;
}

/**
 * Persists expected OAuth `state` for CSRF validation after redirect.
 * Uses explicit `state` from the API when present; otherwise tries to read `state` from the auth URL query.
 */
export function rememberGoogleOAuthState(
  authorizationUrl: string,
  explicitState?: string
): void {
  if (typeof window === "undefined") return;
  if (explicitState) {
    sessionStorage.setItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE, explicitState);
    return;
  }
  try {
    const u = new URL(authorizationUrl);
    const s = u.searchParams.get("state");
    if (s) sessionStorage.setItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE, s);
  } catch {
    /* ignore invalid URL */
  }
}

/**
 * Returns true if `state` from the callback URL matches the value we stored before redirect.
 * If nothing was stored (e.g. only server-side state), returns true.
 */
export function verifyGoogleOAuthState(callbackState: string | null): boolean {
  if (typeof window === "undefined") return true;
  const expected = sessionStorage.getItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE);
  sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE);
  if (!expected) return true;
  return callbackState !== null && callbackState === expected;
}
