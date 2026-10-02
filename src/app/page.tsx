import type { Metadata } from "next";
import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { HeroSection } from "@/components/landing/HeroSection";
import { DailyTeaser } from "@/components/landing/DailyTeaser";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { KeyNumbers } from "@/components/landing/KeyNumbers";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { DossiersSection } from "@/components/landing/DossiersSection";
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
        <DailyTeaser />
        <HowItWorks />
        <KeyNumbers />
        <CategoriesSection />
        <DossiersSection />
        <ToolsSection />
        <SourcesSection />
      </main>
      <Footer />
    </div>
  );
}
