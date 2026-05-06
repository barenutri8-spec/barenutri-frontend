/** Backend origin + `/api/v1` (used by the server and by the dev proxy). */
export function resolveBackendApiV1Base(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
    /\/+$/,
    ""
  );
  if (raw.endsWith("/api/v1")) return raw;
  if (raw.endsWith("/api")) return `${raw}/v1`;
  return `${raw}/api/v1`;
}

/**
 * Browser: same-origin `/api/v1` → Next route proxies to the backend (avoids CORS preflight on :8000).
 * Server: calls the backend URL directly.
 */
function apiFetchBase(): string {
  if (typeof window !== "undefined") return "/api/v1";
  return resolveBackendApiV1Base();
}

function formatApiErrorPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const o = payload as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim();

  const detail = o.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();

  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null && "msg" in item) {
          const it = item as { msg?: string; loc?: unknown[] };
          const msg = typeof it.msg === "string" ? it.msg : "";
          if (Array.isArray(it.loc) && it.loc.length) {
            const loc = it.loc.map(String).join(".");
            return loc ? `${loc}: ${msg}` : msg;
          }
          return msg;
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join("; ");
  }

  return "";
}

async function getErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    const trimmed = text.trim().slice(0, 400);
    return trimmed || `HTTP ${res.status}`;
  }
  const formatted = formatApiErrorPayload(parsed);
  if (formatted) return `${formatted} (HTTP ${res.status})`;
  return `HTTP ${res.status}${text ? `: ${text.slice(0, 240)}` : ""}`;
}

function normalizeHeaders(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h);
  return { ...h };
}

export async function fetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const { headers: callerHeaders, ...rest } = options ?? {};
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  const res = await fetch(`${apiFetchBase()}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...normalizeHeaders(callerHeaders),
    },
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  return res.json();
}

/** POST endpoints that may return 204 or an empty body on success. */
export async function fetcherAllowEmpty(
  endpoint: string,
  options?: RequestInit
): Promise<unknown | null> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const { headers: callerHeaders, ...rest } = options ?? {};
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  const res = await fetch(`${apiFetchBase()}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...normalizeHeaders(callerHeaders),
    },
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
