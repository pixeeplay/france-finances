"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">&#127467;&#127479;</span>
            <span className="font-heading text-lg font-bold text-slate-900">
              france-finances
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#chiffres" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Chiffres clés
            </a>
            <a href="#comment-ca-marche" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Comment ça marche
            </a>
            <a href="#categories" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Catégories
            </a>
            <Link
              href="/jeu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-landing-primary text-white font-semibold text-sm hover:bg-landing-primary-light transition-colors"
            >
              Jouer
              <span>&#8594;</span>
            </Link>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-slate-700"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="flex flex-col px-4 py-4 gap-3">
            <a
              href="#chiffres"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600"
            >
              Chiffres clés
            </a>
            <a
              href="#comment-ca-marche"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600"
            >
              Comment ça marche
            </a>
            <a
              href="#categories"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-slate-600"
            >
              Catégories
            </a>
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
