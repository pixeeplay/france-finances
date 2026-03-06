import type { Metadata } from "next";
import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { HeroSection } from "@/components/landing/HeroSection";
import { KeyNumbers } from "@/components/landing/KeyNumbers";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { ParisTeaser } from "@/components/landing/ParisTeaser";
import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { SourcesSection } from "@/components/landing/SourcesSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  icons: {
    icon: "/france.svg",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <NavbarLanding />
      <HeroSection />
      <HowItWorks />
      <KeyNumbers />
      <CategoriesSection />
      <ParisTeaser />
      <EcosystemSection />
      <SourcesSection />
      <Footer />
    </div>
  );
}
