import { fetcher, fetcherAllowEmpty } from "@/lib/api";
import type {
  User,
  ApiResponse,
  RegisterEmailPayload,
  LoginData,
} from "@/types";

/** Body returned by POST /auth/login (bearer tokens + user). */
interface RawLoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    profile_picture?: string | null;
  };
}

function mapSessionUser(raw: RawLoginResponse["user"]): User {
  const name = raw.full_name?.trim() || raw.email;
  return {
    id: raw.id,
    email: raw.email,
    name,
    avatar: raw.profile_picture ?? undefined,
  };
}

function sessionFromRaw(
  raw: RawLoginResponse
): ApiResponse<{ user: User; token: string; refreshToken?: string }> {
  return {
    success: true,
    message: "OK",
    data: {
      user: mapSessionUser(raw.user),
      token: raw.access_token,
      ...(raw.refresh_token ? { refreshToken: raw.refresh_token } : {}),
    },
  };
}

/** Bearer-style session at root or under `data` (some endpoints wrap). */
function extractRawLoginSession(raw: unknown): RawLoginResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.access_token === "string" &&
    o.user &&
    typeof o.user === "object"
  ) {
    return o as RawLoginResponse;
  }
  const nested = o.data;
  if (
    nested &&
    typeof nested === "object" &&
    typeof (nested as Record<string, unknown>).access_token === "string" &&
    (nested as Record<string, unknown>).user
  ) {
    return nested as RawLoginResponse;
  }
  return null;
}

function unwrapDataPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const o = raw as Record<string, unknown>;
  if ("data" in o && o.data !== undefined && typeof o.success === "boolean") {
    return o.data;
  }
  /** `{ data: { requires_otp | access_token } }` without top-level `success` */
  if ("data" in o && o.data !== undefined && typeof o.data === "object") {
    const inner = o.data as Record<string, unknown>;
    if (
      typeof inner.access_token === "string" ||
      inner.requires_otp === true ||
      inner.require_otp === true ||
      inner.otp_required === true ||
      inner.pending_verification === true ||
      inner.email_verification_required === true
    ) {
      return o.data;
    }
  }
  return raw;
}

function extractOtpChallengePayload(payload: unknown): Extract<
  LoginData,
  { requires_otp: true }
> | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const requires =
    p.requires_otp === true ||
    p.require_otp === true ||
    p.otp_required === true ||
    /** Some APIs signal email OTP step without a boolean name match */
    p.pending_verification === true ||
    p.email_verification_required === true;
  if (!requires) return null;
  return {
    requires_otp: true,
    email: typeof p.email === "string" ? p.email : undefined,
    otp_session_id:
      typeof p.otp_session_id === "string"
        ? p.otp_session_id
        : typeof p.session_id === "string"
          ? p.session_id
          : typeof p.verification_session_id === "string"
            ? p.verification_session_id
            : undefined,
  };
}

/**
 * Parses the same shapes as POST /auth/login: session or OTP challenge.
 * Returns null if the body is neither (e.g. “user created” without tokens).
 */
function parseLoginDataIfPresent(raw: unknown): LoginData | null {
  const candidates = [raw, unwrapDataPayload(raw)];
  const unique = candidates.filter((c, i) => i === 0 || c !== candidates[0]);

  for (const candidate of unique) {
    const session = extractRawLoginSession(candidate);
    if (session) {
      return {
        user: mapSessionUser(session.user),
        token: session.access_token,
        ...(session.refresh_token ? { refreshToken: session.refresh_token } : {}),
      };
    }
    const otp = extractOtpChallengePayload(candidate);
    if (otp) return otp;
  }

  return null;
}

/** Parses POST /auth/login JSON: full session or OTP challenge (several wrapper shapes). */
function parseLoginData(raw: unknown): LoginData {
  const parsed = parseLoginDataIfPresent(raw);
  if (parsed) return parsed;
  throw new Error("Unexpected response from server.");
}

function sessionResponseFromUnknown(raw: unknown): ApiResponse<{
  user: User;
  token: string;
  refreshToken?: string;
}> {
  const session = extractRawLoginSession(raw);
  if (!session) {
    throw new Error("Unexpected response from server.");
  }
  return sessionFromRaw(session);
}

/** Response from POST /auth/google/authorization-url (shapes may vary by API version). */
function parseGoogleAuthorizationUrlPayload(raw: unknown): {
  authorizationUrl: string;
  state?: string;
} {
  const unwrapData = (o: unknown): Record<string, unknown> | null => {
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (
      "data" in rec &&
      rec.data !== undefined &&
      typeof rec.data === "object" &&
      rec.data !== null
    ) {
      return rec.data as Record<string, unknown>;
    }
    return rec;
  };

  const o = unwrapData(raw);
  if (!o) throw new Error("Unexpected response from server.");

  const authorizationUrl =
    (typeof o.authorization_url === "string" && o.authorization_url) ||
    (typeof o.authorizationUrl === "string" && o.authorizationUrl) ||
    (typeof o.url === "string" && o.url) ||
    (typeof o.auth_url === "string" && o.auth_url) ||
    "";

  if (!authorizationUrl) throw new Error("Unexpected response from server.");

  const state = typeof o.state === "string" ? o.state : undefined;

  return { authorizationUrl, state };
}

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginData>> => {
    const raw = await fetcher<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = parseLoginData(raw);
    return {
      success: true,
      message: "OK",
      data,
    };
  },

  /**
   * Completes login after OTP. Backend: POST /auth/login/verify
   * Body: `{ email, otp, otp_session_id? }` (adjust field names to match your API).
   */
  verifyLoginOtp: async (body: {
    email: string;
    otp: string;
    otp_session_id?: string;
  }): Promise<
    ApiResponse<{ user: User; token: string; refreshToken?: string }>
  > => {
    const raw = await fetcher<unknown>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({
        email: body.email,
        otp: body.otp,
        ...(body.otp_session_id
          ? { otp_session_id: body.otp_session_id }
          : {}),
      }),
    });
    return sessionResponseFromUnknown(raw);
  },

  /** Backend: POST /auth/login/resend-otp — may return an empty body. */
  resendLoginOtp: async (body: {
    email: string;
    otp_session_id?: string;
  }): Promise<void> => {
    await fetcherAllowEmpty("/auth/login/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email: body.email,
        ...(body.otp_session_id
          ? { otp_session_id: body.otp_session_id }
          : {}),
      }),
    });
  },

  /**
   * Creates the account. If the API returns tokens + user (auto sign-in), uses that;
   * otherwise signs in with the same email/password so the client can go home logged in.
   */
  register: async (
    body: RegisterEmailPayload
  ): Promise<ApiResponse<LoginData>> => {
    const raw = await fetcher<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    /** Prefer register response: OTP must not be skipped by a follow-up login that returns tokens. */
    const fromRegister = parseLoginDataIfPresent(raw);
    if (fromRegister) {
      return {
        success: true,
        message: "OK",
        data: fromRegister,
      };
    }
    return authService.login(body.email, body.password);
  },

  me: () => fetcher<ApiResponse<User>>("/auth/me"),

  /**
   * POST /auth/google/authorization-url — returns the Google URL to open and optional `state`.
   * The caller should persist `state` (e.g. `rememberGoogleOAuthState`) and redirect the browser.
   */
  requestGoogleAuthorizationUrl: async (
    redirectUri: string
  ): Promise<{ authorizationUrl: string; state?: string }> => {
    const raw = await fetcher<unknown>("/auth/google/authorization-url", {
      method: "POST",
      body: JSON.stringify({ redirect_uri: redirectUri }),
    });
    return parseGoogleAuthorizationUrlPayload(raw);
  },

  /**
   * POST /auth/google/callback — exchange the authorization code for a session (or OTP step).
   */
  completeGoogleSignIn: async (body: {
    code: string;
    redirectUri: string;
    state: string;
  }): Promise<ApiResponse<LoginData>> => {
    const raw = await fetcher<unknown>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({
        code: body.code,
        redirect_uri: body.redirectUri,
        state: body.state,
      }),
    });
    const data = parseLoginData(raw);
    return {
      success: true,
      message: "OK",
      data,
    };
  },
};
