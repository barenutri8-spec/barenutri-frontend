"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  OTP_RESEND_COOLDOWN_MS,
  ROUTES,
  STORAGE_KEYS,
} from "@/constants";
import type { OtpLoginContext } from "@/types";
import { persistAuthSession } from "@/lib/auth-session";
import { readOtpContext, saveOtpContext } from "@/lib/otp-context";
import { authService } from "@/services/auth.service";

type VerifyVisualStatus = "idle" | "verifying" | "success" | "error";

const OTP_LEN = 6;

/** Dedupe initial POST-register resend across remounts / Strict Mode */
const registerInitialResendKey = (email: string) =>
  `barenutri_otp_initial_resend:${email}`;

function formatCooldown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type LoginOtpStepProps = {
  /** Clears OTP session storage and returns to sign-in (or parent hides this step). */
  onBackToSignIn: () => void;
};

export function LoginOtpStep({ onBackToSignIn }: LoginOtpStepProps) {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [ctx, setCtx] = useState<OtpLoginContext | null>(null);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LEN }, () => "")
  );
  const otpString = digits.join("");
  const [visualStatus, setVisualStatus] =
    useState<VerifyVisualStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendLeftMs, setResendLeftMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const autoSubmitForOtpRef = useRef<string>("");

  useEffect(() => {
    const c = readOtpContext();
    if (!c) {
      onBackToSignIn();
      return;
    }
    setCtx(c);
    setResendLeftMs(Math.max(0, c.resend_available_at - Date.now()));
  }, [onBackToSignIn]);

  /** Register succeeded with tokens but we require OTP before home — request a code once. */
  useEffect(() => {
    if (!ctx?.post_register_token_deferred || !ctx.email.trim()) return;

    const guardKey = registerInitialResendKey(ctx.email);
    const guard = sessionStorage.getItem(guardKey);
    if (guard === "done" || guard === "pending") return;
    sessionStorage.setItem(guardKey, "pending");

    void (async () => {
      try {
        await authService.resendLoginOtp({
          email: ctx.email,
          otp_session_id: ctx.otp_session_id,
        });
        sessionStorage.setItem(guardKey, "done");

        const fresh = readOtpContext();
        if (!fresh) return;
        const next: OtpLoginContext = {
          ...fresh,
          post_register_token_deferred: false,
          resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
        };
        saveOtpContext(next);
        setCtx(next);
        setResendLeftMs(OTP_RESEND_COOLDOWN_MS);
      } catch (err) {
        sessionStorage.removeItem(guardKey);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Could not send a verification code. Try Resend or sign in again."
        );
      }
    })();
  }, [
    ctx?.post_register_token_deferred,
    ctx?.email,
    ctx?.otp_session_id,
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setResendLeftMs((prev) => (prev <= 0 ? 0 : prev - 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (otpString.length < OTP_LEN) autoSubmitForOtpRef.current = "";
  }, [otpString]);

  const runVerify = useCallback(async () => {
    if (!ctx || otpString.length !== OTP_LEN || submitting) return;
    setErrorMsg(null);
    setSubmitting(true);
    setVisualStatus("verifying");
    try {
      const res = await authService.verifyLoginOtp({
        email: ctx.email,
        otp: otpString,
        otp_session_id: ctx.otp_session_id,
      });
      const data = res.data;
      if (
        !data?.token ||
        !data.user ||
        typeof data.token !== "string"
      ) {
        throw new Error("Unexpected response from server.");
      }
      setVisualStatus("success");
      persistAuthSession({
        token: data.token,
        user: data.user,
        refreshToken: data.refreshToken,
      });
      sessionStorage.removeItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT);
      const destination = ctx.next_route ?? ROUTES.DASHBOARD;
      window.setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 650);
    } catch (err) {
      setVisualStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Verification failed."
      );
      setDigits(Array.from({ length: OTP_LEN }, () => ""));
      inputRefs.current[0]?.focus();
      window.setTimeout(() => setVisualStatus("idle"), 2200);
    } finally {
      setSubmitting(false);
    }
  }, [ctx, otpString, submitting, router]);

  useEffect(() => {
    if (
      otpString.length !== OTP_LEN ||
      visualStatus !== "idle" ||
      !ctx ||
      submitting
    ) {
      return;
    }
    if (autoSubmitForOtpRef.current === otpString) return;
    autoSubmitForOtpRef.current = otpString;
    void runVerify();
  }, [otpString, visualStatus, ctx, submitting, runVerify]);

  function updateDigit(index: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < OTP_LEN - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (visualStatus === "error") setVisualStatus("idle");
    setErrorMsg(null);
  }

  function onKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (!ctx || resendLeftMs > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMsg(null);
    try {
      await authService.resendLoginOtp({
        email: ctx.email,
        otp_session_id: ctx.otp_session_id,
      });
      const next: OtpLoginContext = {
        ...ctx,
        resend_available_at: Date.now() + OTP_RESEND_COOLDOWN_MS,
      };
      setCtx(next);
      saveOtpContext(next);
      setResendLeftMs(OTP_RESEND_COOLDOWN_MS);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResendLoading(false);
    }
  }

  const panelClass =
    visualStatus === "success"
      ? "border-emerald-400 bg-emerald-50 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]"
      : visualStatus === "error"
        ? "border-red-400 bg-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]"
        : visualStatus === "verifying"
          ? "border-amber-400 bg-amber-50/90 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
          : "border-zinc-200 bg-white";

  const digitRing =
    visualStatus === "success"
      ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500"
      : visualStatus === "error"
        ? "border-red-400 focus:border-red-500 focus:ring-red-400"
        : visualStatus === "verifying"
          ? "border-amber-400 focus:border-amber-500 focus:ring-amber-400"
          : "border-zinc-300 focus:border-[#8b1a1a] focus:ring-[#8b1a1a]";

  if (!ctx) {
    return (
      <div className="w-full max-w-md">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/brand-logo-photo.png"
          alt="Barenutri"
          width={200}
          height={70}
          className="object-contain"
        />
      </div>

      <h1 className="text-3xl font-bold text-[#3b3838]">Verify it&apos;s you</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Enter the code we sent to{" "}
        <span className="font-medium text-[#3b3838]">{ctx.email}</span>.
        The frame turns green when verified; amber while checking; red if the
        code is wrong.
      </p>

      <div
        className={`mt-8 rounded-xl border-2 p-6 transition-colors duration-300 ${panelClass}`}
      >
        {visualStatus === "success" ? (
          <p
            className="mb-4 text-center text-sm font-semibold text-emerald-800"
            role="status"
          >
            Verified — taking you to your account…
          </p>
        ) : null}

        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={d}
              disabled={submitting || visualStatus === "success"}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`Digit ${i + 1} of ${OTP_LEN}`}
              className={`h-12 w-10 rounded-lg border bg-white text-center text-lg font-semibold text-[#3b3838] shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 sm:h-14 sm:w-12 sm:text-xl ${digitRing}`}
            />
          ))}
        </div>

        {errorMsg ? (
          <p
            className="mt-4 text-center text-sm font-medium text-red-800"
            role="alert"
          >
            {errorMsg}
          </p>
        ) : null}

        <button
          type="button"
          disabled={
            otpString.length !== OTP_LEN ||
            submitting ||
            visualStatus === "success"
          }
          onClick={() => void runVerify()}
          className="gradient-btn mt-6 flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting || visualStatus === "verifying"
            ? "Verifying…"
            : visualStatus === "success"
              ? "Success"
              : "Verify and continue"}
        </button>

        <div className="mt-6 text-center text-sm text-zinc-600">
          {resendLeftMs > 0 ? (
            <p>
              Resend code in{" "}
              <span className="font-mono font-semibold text-[#8b1a1a]">
                {formatCooldown(resendLeftMs)}
              </span>
            </p>
          ) : (
            <button
              type="button"
              disabled={resendLoading}
              onClick={() => void handleResend()}
              className="font-medium text-[#8b1a1a] underline-offset-2 hover:underline disabled:opacity-50"
            >
              {resendLoading ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Wrong email?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-[#8b1a1a] hover:underline"
          onClick={(e) => {
            e.preventDefault();
            sessionStorage.removeItem(STORAGE_KEYS.OTP_LOGIN_CONTEXT);
            onBackToSignIn();
          }}
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
