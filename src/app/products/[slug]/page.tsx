import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  CATEGORY_OPTIONS,
  PRODUCTS,
  discountPercentOff,
  getCompareAtPrice,
  getStartingPrice,
} from "@/data/products";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const categoryLabel =
    CATEGORY_OPTIONS.find((option) => option.value === product.category)?.label ??
    "Products";

  const relatedProducts = PRODUCTS.filter(
    (item) =>
      item.slug !== product.slug &&
      (item.category === product.category || item.type === product.type),
  ).slice(0, 4);

  return (
    <>
      <Header />
      <main className="bg-[#f9f7f4]">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← Back to Products
          </Link>

          <div className="mt-5 grid gap-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:gap-10">
            <div className="relative h-72 w-full overflow-hidden rounded-lg bg-zinc-100 sm:h-96">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>

            <div>
              <p className="text-sm font-medium text-[#8b1a1a]">{categoryLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{product.name}</h1>
              <p className="mt-4 text-zinc-700">{product.description}</p>

              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                  Available Sizes
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                  Pricing
                </h2>
                <div className="mt-3 space-y-1 text-zinc-800">
                  {product.sizes.map((size) => {
                    const sale = product.priceBySize[size];
                    const compare = getCompareAtPrice(product, size);
                    const pct =
                      compare != null ? discountPercentOff(compare, sale) : 0;
                    return (
                      <p key={size} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                        <span>{size}:</span>
                        {compare != null ? (
                          <>
                            <span className="text-zinc-400 line-through">₹{compare}</span>
                            <span className="font-semibold text-zinc-900">₹{sale}</span>
                            {pct > 0 ? (
                              <span className="text-xs font-medium text-green-700">
                                ({pct}% off)
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-semibold">₹{sale}</span>
                        )}
                      </p>
                    );
                  })}
                  <p className="pt-1 text-base font-semibold">
                    Starts at ₹{getStartingPrice(product)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                  Stock Status
                </h2>
                <p className="mt-2 text-sm">
                  {product.inStock ? (
                    <span className="font-medium text-green-700">In Stock</span>
                  ) : (
                    <span className="font-medium text-amber-700">Out of Stock</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Related Products</h2>
          {relatedProducts.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No related products available.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-36 w-full bg-zinc-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-zinc-900">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      ₹{getStartingPrice(item)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
