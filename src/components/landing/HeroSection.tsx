"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePublicStats } from "@/hooks/usePublicStats";

export function HeroSection() {
  const { totalSessions, totalSwipes } = usePublicStats();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-landing-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-landing-success/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-primary/10 text-landing-primary text-sm font-semibold mb-8">
            <span>&#127467;&#127479;</span>
            Budget de la France 2025-2026
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Comprenez où vont{" "}
            <span className="text-gradient-primary">vos impôts</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explorez les dépenses publiques françaises de manière interactive.
            Swipez, analysez et formez votre propre opinion sur le budget de la France.
          </p>

          {/* Chainsaw illustration */}
          <motion.div
            className="flex justify-center mb-10"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Image
              src="/chainsaw.svg"
              alt="La Tronçonneuse de Poche"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/jeu"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-landing-primary text-white font-bold text-lg hover:bg-landing-primary-light transition-all hover:shadow-lg hover:shadow-landing-primary/25 active:scale-95"
            >
              Commencer à explorer
              <span>&#8594;</span>
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Comment ça marche ?
            </a>
          </div>

          {/* Live stats */}
          {(totalSessions > 0 || totalSwipes > 0) && (
            <motion.div
              className="mt-10 flex items-center justify-center gap-8 text-sm text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-slate-700 font-heading">
                  {totalSessions.toLocaleString("fr-FR")}
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold">Sessions</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-slate-700 font-heading">
                  {totalSwipes.toLocaleString("fr-FR")}
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold">Swipes</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
