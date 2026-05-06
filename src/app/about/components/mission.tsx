export default function Mission() {
  return (
    <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#8b1a1a]">
              Our Mission
            </p>
            <h2 className="mt-2 text-4xl font-semibold font-regular text-[#3b3838] sm:text-5xl">
              Bringing Back{" "}
              <span className="gradient-text font-semibold">Real Food</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              At Barenutri, we believe that food should be pure, honest, and
              wholesome — just like it was meant to be. We work directly with
              farming communities across India to source ingredients that are
              free from chemicals, preservatives, and artificial additives.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Every product we offer is traceable back to the farm it came
              from. We don&apos;t just sell food — we build trust between the
              people who grow it and the families who eat it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="gradient-text text-3xl font-bold">50+</p>
              <p className="mt-1 text-sm text-zinc-600">Farmer Partners</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="gradient-text text-3xl font-bold">100%</p>
              <p className="mt-1 text-sm text-zinc-600">Natural Products</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="gradient-text text-3xl font-bold">0</p>
              <p className="mt-1 text-sm text-zinc-600">Preservatives</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="gradient-text text-3xl font-bold">1000+</p>
              <p className="mt-1 text-sm text-zinc-600">Happy Families</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
