import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Powders",
    description:
      "Turmeric, kumkum, and karam powders prepared with authentic traditional methods.",
    image: "/spices.jpg",
    href: "/products?category=powders",
  },
  {
    title: "Flours",
    description:
      "All kinds of flours including millet-based flours for everyday healthy cooking.",
    image: "/flours.jpg",
    href: "/products?category=flours",
  },
  {
    title: "Raw Products",
    description:
      "Raw turmeric, dried red chillies, and assorted millets sourced directly from farms.",
    image: "/staples.jpg",
    href: "/products?category=raw-products",
  },
  {
    title: "Traditional Essentials",
    description:
      "Timeless home essentials like raw forest honey and other traditional pantry staples.",
    image: "/staples.jpg",
    href: "/products?category=traditional-essentials",
  },
];

export default function ProductCategories() {
  return (
    <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#8b1a1a] uppercase">
            What We Offer
          </p>
          <h2 className="mt-2 text-4xl font-bold text-zinc-900 sm:text-5xl">
            Product <span className="gradient-text">Categories</span>
          </h2>
        </div>

        {/* Category cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px]">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#3b3838]">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
