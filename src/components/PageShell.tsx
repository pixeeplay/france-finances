import type { ReactNode } from "react";
import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { Footer } from "@/components/landing/Footer";

/** Gabarit des pages de contenu (navigation du site + pied de page). */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">{children}</main>
      <Footer />
    </div>
  );
}
