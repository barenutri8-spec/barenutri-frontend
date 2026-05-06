import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f9f7f4]">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-zinc-900">Track Order</h1>
          <p className="mt-3 text-zinc-600">
            Tracking page is ready. We can connect shipment status APIs in the next step.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
