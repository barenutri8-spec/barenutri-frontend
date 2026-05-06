"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginOtpStep } from "@/components/auth/login-otp-step";
import { ROUTES } from "@/constants";

export default function LoginVerifyPage() {
  const router = useRouter();

  const backToSignIn = useCallback(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return (
    <AuthSplitLayout
      quote={
        <>
          &ldquo;Security is part of how we care for every family we
          serve.&rdquo;
        </>
      }
    >
      <LoginOtpStep onBackToSignIn={backToSignIn} />
    </AuthSplitLayout>
  );
}
