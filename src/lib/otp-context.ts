import { STORAGE_KEYS } from "@/constants";
import type { OtpLoginContext } from "@/types";

export function readOtpContext(): OtpLoginContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.email !== "string" || !o.email.trim()) return null;
    const resend =
      typeof o.resend_available_at === "number"
        ? o.resend_available_at
        : Date.now();
    return {
      email: o.email.trim(),
      otp_session_id:
        typeof o.otp_session_id === "string" ? o.otp_session_id : undefined,
      resend_available_at: resend,
      next_route:
        typeof o.next_route === "string" && o.next_route.startsWith("/")
          ? o.next_route
          : undefined,
      post_register_token_deferred: o.post_register_token_deferred === true,
    };
  } catch {
    return null;
  }
}

export function saveOtpContext(ctx: OtpLoginContext) {
  sessionStorage.setItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT, JSON.stringify(ctx));
}
