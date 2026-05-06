import type { LoginData, User } from "@/types";

export function isPasswordLoginComplete(
  data: LoginData
): data is { user: User; token: string; refreshToken?: string } {
  return "token" in data && typeof data.token === "string" && !!data.token;
}

export function isOtpChallenge(
  data: LoginData
): data is Extract<LoginData, { requires_otp: true }> {
  return "requires_otp" in data && data.requires_otp === true;
}
