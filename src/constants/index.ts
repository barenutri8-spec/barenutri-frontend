export const APP_NAME = "BareNutri";

/** 2 minutes — wait before “Resend code” after login, register, or each resend */
export const OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  LOGIN_VERIFY: "/login/verify",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
} as const;

/**
 * OAuth redirect path — must match the URI registered with Google and sent to
 * `POST /auth/google/authorization-url` as `redirect_uri`.
 */
export const GOOGLE_OAUTH_CALLBACK_PATH = "/auth/callback/google";

/** Client-only auth persistence for follow-up requests (e.g. `/auth/me`). */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "barenutri_auth_token",
  AUTH_REFRESH_TOKEN: "barenutri_auth_refresh_token",
  AUTH_USER: "barenutri_auth_user",
  /** JSON: `{ email, otp_session_id?, resend_available_at }` during login OTP step */
  OTP_LOGIN_CONTEXT: "barenutri_otp_login_context",
  /** CSRF `state` value from `POST /auth/google/authorization-url` (or parsed from auth URL). */
  GOOGLE_OAUTH_STATE: "barenutri_google_oauth_state",
} as const;
