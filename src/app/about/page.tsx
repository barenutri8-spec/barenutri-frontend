import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FarmToHome from "./components/farm-to-home";
import Mission from "./components/mission";
import Values from "./components/values";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <FarmToHome />
        <Mission />
        <Values />
      </main>
      <Footer />
    </>
  );
}
