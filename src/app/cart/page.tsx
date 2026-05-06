import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f9f7f4]">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-zinc-900">Your Cart</h1>
          <p className="mt-3 text-zinc-600">
            Cart review page is ready. Next step is wiring it with shared cart data.
          </p>
          <Link
            href="/products"
            className="gradient-btn mt-6 inline-block rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
