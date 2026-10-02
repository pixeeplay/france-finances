"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { applyTheme } from "@/lib/theme";

const NAV_LINKS = [
  { href: "/chiffres", label: "Les chiffres" },
  { href: "/simulateur", label: "Simulateur" },
  { href: "/#ordres-de-grandeur", label: "Ordres de grandeur" },
  { href: "/#dossiers", label: "Dossiers" },
  { href: "/#categories", label: "Catégories" },
  { href: "/#sources", label: "Sources" },
];

/** Suit la classe `dark` de <html> (sombre par défaut, y compris au rendu serveur). */
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getThemeSnapshot = () => document.documentElement.classList.contains("dark");
const getServerThemeSnapshot = () => true;

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function NavbarLanding() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = useCallback(() => {
    const nowDark = !document.documentElement.classList.contains("dark");
    applyTheme(nowDark);
    try {
      localStorage.setItem("theme", nowDark ? "dark" : "light");
    } catch {
      // stockage indisponible : le choix vaut pour la page courante
    }
  }, []);

  const themeLabel = isDark ? "Passer en thème clair" : "Passer en thème sombre";

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center min-h-[44px] font-serif text-xl tracking-tight" aria-label="france-finances.com, accueil">
            <span className="font-semibold text-foreground">france-finances</span>
            <span className="text-muted-foreground">.com</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={themeLabel}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              href="/jeu"
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Jouer
              <span aria-hidden="true">&#8594;</span>
            </Link>
          </nav>

          {/* Mobile: theme toggle + menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground"
              aria-label={themeLabel}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav id="menu-mobile" aria-label="Navigation principale" className="md:hidden border-t border-border bg-background">
          <ul className="flex flex-col px-4 py-2 divide-y divide-border">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center min-h-[44px] text-sm text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link
                href="/jeu"
                className="flex items-center justify-center gap-2 min-h-[44px] rounded-md bg-foreground text-background font-semibold text-sm"
              >
                Jouer
                <span aria-hidden="true">&#8594;</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
