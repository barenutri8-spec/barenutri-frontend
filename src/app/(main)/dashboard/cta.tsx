export default function CTA() {
  return (
    <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-[#3b3838] sm:text-4xl">
          Stay <span className="gradient-text">Connected</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-500">
          Get updates on new products, farmer stories, and exclusive offers.
        </p>
        <form className="mt-8 flex items-center justify-center gap-3">
          <input
            type="email"
            placeholder="Your email address"
            className="h-12 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-4 text-sm text-[#3b3838] placeholder:text-zinc-400 focus:border-[#8b1a1a] focus:outline-none focus:ring-1 focus:ring-[#8b1a1a]"
          />
          <button
            type="submit"
            className="gradient-btn flex h-12 shrink-0 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white transition-all"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
