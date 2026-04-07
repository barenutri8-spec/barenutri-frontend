import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden sm:h-[700px] lg:h-[800px]">
      {/* Background image */}
      <Image
        src="/bariherobg.png"
        alt="Indian farming landscape at sunrise with farmers and ox carts"
        fill
        priority
        quality={100}
        className="object-cover object-center contrast-[1.05] saturate-[1.1]"
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            {/* Sanskrit tagline */}
            <p className="text-lg text-[#d4a843] sm:text-xl">
              आरोग्यमे महाभाग्यम्
            </p>

            {/* Main heading */}
            <h1 className="hero-title mt-4 leading-tight text-white">
              True Wealth
              <br />
              Lies in{" "}
              <span className="text-[#d4a843]">Health</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-200 sm:text-lg">
              Pure, honest food — directly from farmers to your family. No
              mixing, no hidden ingredients, no compromise.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 rounded-full bg-[#d4a843] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c09535] sm:px-8"
              >
                Explore Products
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-[#d4a843] hover:bg-[#d4a843] sm:px-8"
              >
                Join Us Now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
