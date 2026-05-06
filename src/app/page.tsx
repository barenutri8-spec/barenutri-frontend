import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "./(main)/dashboard/hero";
import ProductCategories from "./(main)/dashboard/product-categories";
import WhyUs from "./(main)/dashboard/why-us";
import Testimonials from "./(main)/dashboard/testmonials";
import CTA from "./(main)/dashboard/cta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductCategories />
        <WhyUs />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
