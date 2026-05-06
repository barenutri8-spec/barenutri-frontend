"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { OTP_RESEND_COOLDOWN_MS, ROUTES, STORAGE_KEYS } from "@/constants";
import { isOtpChallenge, isPasswordLoginComplete } from "@/lib/login-result";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!agreedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      const data = res.data;
      if (data == null) {
        setError("Unexpected response from server.");
        return;
      }

      if (isPasswordLoginComplete(data)) {
        /** Do not sign in yet — OTP first, then home (tokens from register are not stored). */
        const ctx = {
          email: email.trim(),
          resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
          next_route: ROUTES.HOME,
          post_register_token_deferred: true,
        };
        sessionStorage.setItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT, JSON.stringify(ctx));
        router.push(ROUTES.LOGIN_VERIFY);
        return;
      }

      if (isOtpChallenge(data)) {
        const ctx = {
          email: data.email ?? email.trim(),
          otp_session_id: data.otp_session_id,
          resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
          next_route: ROUTES.HOME,
        };
        sessionStorage.setItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT, JSON.stringify(ctx));
        router.push(ROUTES.LOGIN_VERIFY);
        return;
      }

      setError("Unexpected response from server.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/auth-hero-login.jpg"
          alt="Spices in clay bowls"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="hero-title !text-xl leading-relaxed text-white">
            &ldquo;We don&apos;t just sell food — we build trust between the
            people who grow it and the families who eat it.&rdquo;
          </p>
          <p className="mt-4 text-sm font-medium tracking-widest text-white/70 uppercase">
            Barenutri — Farm to Family
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
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
          <h1 className="text-3xl font-bold text-[#3b3838]">Join Barenutri</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Pure food, honest sourcing — start your journey
          </p>

          {/* Form */}
          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {error ? (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#3b3838]"
              >
                Full name
              </label>
              <input
                id="name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
              />
            </div>

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
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#3b3838]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 pr-11 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
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

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#3b3838]"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 pr-11 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
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

            {/* Terms checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-[#3d6b35] focus:ring-[#3d6b35]"
              />
              <label htmlFor="terms" className="text-sm text-zinc-500">
                I agree to the{" "}
                <Link
                  href="/terms-of-service"
                  className="gradient-text font-medium underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="gradient-text font-medium underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Create account button */}
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn mt-2 flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#8b1a1a] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
