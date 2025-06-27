import { FAQSection } from "../components/sections/FAQSection";
import { CTASection } from "../components/sections/CTASection";
import { Footer } from "../components/sections/Footer";
import { HeroSection } from "../components/sections/heroSection";

export const Home = () => {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
};
