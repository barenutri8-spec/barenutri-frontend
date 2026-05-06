"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginOtpStep } from "@/components/auth/login-otp-step";
import { authService } from "@/services/auth.service";
import { OTP_RESEND_COOLDOWN_MS, ROUTES, STORAGE_KEYS } from "@/constants";
import { persistAuthSession } from "@/lib/auth-session";
import { getGoogleOAuthRedirectUri, rememberGoogleOAuthState } from "@/lib/google-oauth";
import { readOtpContext } from "@/lib/otp-context";
import { isOtpChallenge, isPasswordLoginComplete } from "@/lib/login-result";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registeredNotice, setRegisteredNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("registered") === "1") setRegisteredNotice(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (readOtpContext()) setStep("otp");
  }, []);

  const leaveOtpStep = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT);
    setStep("credentials");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
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
        router.push(ROUTES.DASHBOARD);
        router.refresh();
        return;
      }

      if (isOtpChallenge(data)) {
        const ctx = {
          email: data.email ?? email.trim(),
          otp_session_id: data.otp_session_id,
          resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
          next_route: ROUTES.DASHBOARD,
        };
        sessionStorage.setItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT, JSON.stringify(ctx));
        setStep("otp");
        return;
      }

      setError("Unexpected response from server.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const redirectUri = getGoogleOAuthRedirectUri();
      const { authorizationUrl, state } =
        await authService.requestGoogleAuthorizationUrl(redirectUri);
      rememberGoogleOAuthState(authorizationUrl, state);
      window.location.assign(authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      quote={
        step === "otp" ? (
          <>
            &ldquo;Security is part of how we care for every family we
            serve.&rdquo;
          </>
        ) : (
          <>
            &ldquo;We don&apos;t just sell food — we build trust between the
            people who grow it and the families who eat it.&rdquo;
          </>
        )
      }
    >
      {step === "otp" ? (
        <LoginOtpStep onBackToSignIn={leaveOtpStep} />
      ) : (
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <Image
              src="/brand-logo-photo.png"
              alt="Barenutri"
              width={200}
              height={70}
              className="object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-[#3b3838]">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to your Barenutri account
          </p>

          {/* Form */}
          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {registeredNotice ? (
              <p
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                role="status"
              >
                Account created. You can sign in now.
              </p>
            ) : null}
            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#3b3838]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#3b3838]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#8b1a1a] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 pr-11 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="gradient-btn mt-2 flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-3 text-zinc-400">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            aria-busy={googleLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white text-sm font-semibold text-[#3b3838] shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b1a1a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#8b1a1a] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      )}
    </AuthSplitLayout>
  );
}
