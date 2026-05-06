export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

/** POST /auth/login — either full session or OTP challenge */
export type LoginData =
  | { user: User; token: string; refreshToken?: string }
  | {
      requires_otp: true;
      email?: string;
      otp_session_id?: string;
    };

export interface OtpLoginContext {
  email: string;
  otp_session_id?: string;
  /** Epoch ms when resend is allowed */
  resend_available_at: number;
  /** Where to send the user after OTP (defaults to dashboard). */
  next_route?: string;
  /**
   * Register returned tokens but we send users to OTP first; verify page runs one resend
   * so an email code is available when the API did not return `requires_otp`.
   */
  post_register_token_deferred?: boolean;
}

/** POST /api/v1/auth/register — email + password */
export interface RegisterEmailPayload {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}
