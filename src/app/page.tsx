import type { Metadata } from "next";
import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { HeroSection } from "@/components/landing/HeroSection";
import { MagnitudeSection } from "@/components/landing/MagnitudeSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DossiersSection } from "@/components/landing/DossiersSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { SourcesSection } from "@/components/landing/SourcesSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  icons: {
    icon: "/france.svg",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />
      <main>
        <HeroSection />
        <MagnitudeSection />
        <HowItWorks />
        <DossiersSection />
        <CategoriesSection />
        <ToolsSection />
        <SourcesSection />
      </main>
      <Footer />
    </div>
  );
}
