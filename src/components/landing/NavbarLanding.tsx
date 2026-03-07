"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    const nowDark = document.documentElement.classList.toggle("dark");
    setIsDark(nowDark);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/france.svg" alt="France" width={28} height={28} />
            <span className="font-heading text-lg font-bold text-landing-primary dark:text-white">
              france-finances<span className="text-landing-expense dark:text-landing-expense">.com</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#chiffres" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Chiffres cl&eacute;s
            </Link>
            <Link href="/#comment-ca-marche" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Comment &ccedil;a marche
            </Link>
            <Link href="/#categories" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Cat&eacute;gories
            </Link>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link
              href="/jeu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-landing-primary text-white font-semibold text-sm hover:bg-landing-primary-light transition-colors"
            >
              Jouer
              <span>&#8594;</span>
            </Link>
          </nav>

          {/* Mobile: theme toggle + burger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300"
              aria-label={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex flex-col px-4 py-4 gap-3">
            <Link
              href="/#chiffres"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Chiffres cl&eacute;s
            </Link>
            <Link
              href="/#comment-ca-marche"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Comment &ccedil;a marche
            </Link>
            <Link
              href="/#categories"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Cat&eacute;gories
            </Link>
            <Link
              href="/jeu"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-landing-primary text-white font-semibold text-sm"
            >
              Jouer
              <span>&#8594;</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
