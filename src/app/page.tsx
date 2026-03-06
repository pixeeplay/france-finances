import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { HeroSection } from "@/components/landing/HeroSection";
import { KeyNumbers } from "@/components/landing/KeyNumbers";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { ParisTeaser } from "@/components/landing/ParisTeaser";
import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { SourcesSection } from "@/components/landing/SourcesSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <NavbarLanding />
      <HeroSection />
      <KeyNumbers />
      <HowItWorks />
      <CategoriesSection />
      <ParisTeaser />
      <EcosystemSection />
      <SourcesSection />
      <Footer />
    </div>
  );
}
