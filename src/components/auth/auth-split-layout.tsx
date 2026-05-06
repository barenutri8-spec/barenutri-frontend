import type { ReactNode } from "react";
import Image from "next/image";

type AuthSplitLayoutProps = {
  children: ReactNode;
  /** Quote shown on the left hero panel */
  quote: ReactNode;
};

export function AuthSplitLayout({ children, quote }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/auth-hero-login.jpg"
          alt="Spices in clay bowls"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="hero-title !text-4xl leading-relaxed text-white">
            {quote}
          </p>
          <p className="mt-4 text-sm font-medium tracking-widest text-white/70 uppercase">
            Barenutri — Farm to Family
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
