import type { ReactNode } from "react";
import { NavbarLanding } from "@/components/landing/NavbarLanding";
import { Footer } from "@/components/landing/Footer";

/**
 * Gabarit des pages de contenu (navigation du site + pied de page).
 * Le contenu s'aligne sur la largeur du header (max-w-6xl, mêmes marges) ;
 * chaque page limite elle-même ses blocs de texte à une longueur de ligne
 * confortable (max-w-prose).
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-16">{children}</main>
      <Footer />
    </div>
  );
}
