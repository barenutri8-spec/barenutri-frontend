"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  extractGoogleOAuthRedirectParams,
  getGoogleOAuthRedirectUri,
  verifyGoogleOAuthState,
} from "@/lib/google-oauth";
import { persistAuthSession } from "@/lib/auth-session";
import {
  OTP_RESEND_COOLDOWN_MS,
  ROUTES,
  STORAGE_KEYS,
} from "@/constants";
import { isOtpChallenge, isPasswordLoginComplete } from "@/lib/login-result";

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { code, state, error: oauthError, errorDescription } =
      extractGoogleOAuthRedirectParams(window.location.href);

    if (oauthError) {
      setError(
        oauthError === "access_denied"
          ? "Google sign-in was cancelled."
          : errorDescription?.trim() || `Google error: ${oauthError}`
      );
      return;
    }

    if (!code) {
      setError("Missing authorization code. Try signing in again.");
      return;
    }

    if (!verifyGoogleOAuthState(state)) {
      setError("Sign-in session expired or invalid. Please try again.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const redirectUri = getGoogleOAuthRedirectUri();
        const res = await authService.completeGoogleSignIn({
          code,
          redirectUri,
          state: state ?? "",
        });
        if (cancelled) return;

        const data = res.data;
        if (data == null) {
          setError("Unexpected response from server.");
          return;
        }

        if (isPasswordLoginComplete(data)) {
          persistAuthSession({
            token: data.token,
            user: data.user,
            refreshToken: data.refreshToken,
          });
          router.replace(ROUTES.DASHBOARD);
          router.refresh();
          return;
        }

        if (isOtpChallenge(data)) {
          const ctx = {
            email: data.email ?? "",
            otp_session_id: data.otp_session_id,
            resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
            next_route: ROUTES.DASHBOARD,
          };
          sessionStorage.setItem(
            STORAGE_KEYS.OTP_LOGIN_CONTEXT,
            JSON.stringify(ctx)
          );
          router.replace(ROUTES.LOGIN);
          return;
        }

        setError("Unexpected response from server.");
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Google sign-in failed."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p
          className="max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="text-sm font-medium text-[#8b1a1a] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4">
      <p className="text-sm text-zinc-600">Completing sign-in…</p>
      <p className="text-xs text-zinc-400">Please wait, redirecting.</p>
    </div>
  );
}
