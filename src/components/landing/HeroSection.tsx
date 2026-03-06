"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePublicStats } from "@/hooks/usePublicStats";

export function HeroSection() {
  const { totalSessions, totalSwipes } = usePublicStats();

  return (
    <section id="hero" className="section-padding pt-28 md:pt-36 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="font-heading font-[900] text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            <span className="text-gradient-primary">Où va l&apos;argent</span>{" "}
            <span className="text-gradient-expense">public</span> ?
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            La France dépense{" "}
            <strong className="text-landing-expense">1 600 milliards d&apos;euros</strong>{" "}
            par an. Soit{" "}
            <strong className="text-landing-expense">23 500 € par Français</strong>.
            Savez-vous à quoi ils servent ?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/jeu"
              className="inline-flex items-center gap-3 bg-landing-success text-white font-heading font-bold text-lg px-10 h-14 rounded-2xl shadow-lg hover-lift hover:bg-landing-success/90 transition-all active:scale-95"
            >
              <Image src="/chainsaw.svg" alt="" width={24} height={24} className="invert" />
              Jouer à Budget Swipe
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center gap-2 font-heading font-bold text-lg px-10 h-14 rounded-2xl border-2 border-landing-primary/40 text-landing-primary hover:bg-landing-primary/5 transition-all hover-lift"
            >
              Explorer les catégories
            </a>
          </div>

          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-600">
              {totalSessions > 0 ? totalSessions.toLocaleString("fr-FR") : "12 847"}
            </span>{" "}
            sessions jouées{" · "}
            <span className="font-semibold text-slate-600">
              {totalSwipes > 0 ? totalSwipes.toLocaleString("fr-FR") : "154 208"}
            </span>{" "}
            cartes swipées
          </p>
        </motion.div>
      </div>
    </section>
  );
}
