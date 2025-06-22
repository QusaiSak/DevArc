import { FAQSection } from "./sections/FAQSection";
import { CTASection } from "./sections/CTASection";
import { Footer } from "./sections/Footer";
import { HeroSection } from "./sections/heroSection";

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
