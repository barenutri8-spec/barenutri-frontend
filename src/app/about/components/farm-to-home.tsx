import Image from "next/image";

export default function FarmToHome() {
  return (
    <section className="relative overflow-hidden bg-white px-4 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div>
            <h1 className="hero-title gradient-text uppercase leading-tight">
              Farm to Home
            </h1>
            <h2 className="mt-4 text-xl font-bold text-[#3b3838] sm:text-2xl">
              Pure Essentials, Directly From Farmers
            </h2>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg">
              We bring everyday essentials directly from farmers to your home
              — without mixing, without hidden ingredients, and without
              compromise.
            </p>
          </div>

          {/* Right stats */}
          <div className="relative flex flex-col gap-10 lg:pl-16">
            {/* Green decorative shape */}
            <div className="pointer-events-none absolute -right-20 -top-10 hidden h-[300px] w-[120px] rounded-bl-[80px] bg-[#6ab139] lg:block" />

            <div>
              <p className="gradient-text text-3xl font-semibold">100%</p>
              <p className="mt-1 text-lg font-medium text-[#3b3838]">
                Pure & Authentic
              </p>
            </div>
            <div>
              <p className="gradient-text text-3xl font-semibold">Zero</p>
              <p className="mt-1 text-lg font-medium text-[#3b3838]">
                Hidden Ingredients
              </p>
            </div>
          </div>
        </div>

        {/* Leaf icon centered */}
        {/* <div className="mt-10 flex justify-center">
          <svg
            className="h-16 w-16 text-[#4a9e2f]"
            viewBox="0 0 64 64"
            fill="currentColor"
          >
            <path d="M32 4C20 4 8 16 8 32c0 12 8 24 24 28V36c-8-2-14-8-16-16 6 4 14 8 16 8V4z" />
            <path d="M32 4c12 0 24 12 24 28 0 12-8 24-24 28V36c8-2 14-8 16-16-6 4-14 8-16 8V4z" opacity="0.7" />
          </svg>
        </div> */}

        {/* Farmer image */}
        <div className="relative mt-8 h-[400px] w-full  ">
          <Image
            src="/crafeted-images.png"
            alt="Indian farmer working in green fields"
            fill
            className=" object-center"
          />
        </div>
      </div>
    </section>
  );
}
