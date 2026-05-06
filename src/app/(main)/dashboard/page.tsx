import Hero from "./hero";
import ProductCategories from "./product-categories";
import WhyUs from "./why-us";
import Testimonials from "./testmonials";
import CTA from "./cta";

export default function DashboardPage() {
  return (
    <>
      <Hero />
      <ProductCategories />
      <WhyUs />
      <Testimonials />
      <CTA />
    </>
  );
}
