"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { track } from "@/lib/analytics";

const ONBOARDED_KEY = "trnc:onboarded";

const slides = [
  {
    id: "welcome",
    icon: null, // uses ChainsawIcon
    title: "Bienvenue",
    subtitle: "La Tronçonneuse de Poche",
    description: "Swipe les dépenses publiques françaises et découvre ton profil budgétaire.",
  },
  {
    id: "howto",
    icon: null, // custom layout
    title: "Comment jouer ?",
    subtitle: "2 gestes, 1 choix",
    description: "Swipe à gauche pour garder une dépense, à droite pour la remettre en question.",
  },
  {
    id: "go",
    icon: "🎯",
    title: "C'est parti !",
    subtitle: "370 cartes, 16 catégories",
    description: "Choisis un thème ou lance le mode aléatoire. 10 cartes, 3 minutes max.",
  },
] as const;

export function useOnboarding() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(ONBOARDED_KEY);
  });

  const dismiss = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    setShow(false);
  }, []);

  return { showOnboarding: show, dismissOnboarding: dismiss };
}

interface OnboardingProps {
  onDone: () => void;
}

export function Onboarding({ onDone }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = current === slides.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      track("onboarding_complete", { skipped: false });
      onDone();
      return;
    }
    setDirection(1);
    setCurrent((i) => i + 1);
  }, [isLast, onDone]);

  const skip = useCallback(() => {
    track("onboarding_complete", { skipped: true });
    onDone();
  }, [onDone]);

  const slide = slides[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col max-w-md mx-auto lg:rounded-3xl lg:my-4 lg:shadow-2xl lg:border lg:border-border"
    >
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={skip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
        >
          Passer
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ x: direction * 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Slide-specific illustration */}
            {slide.id === "welcome" && (
              <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center mb-8 border border-border shadow-xl">
                <ChainsawIcon size={56} />
              </div>
            )}

            {slide.id === "howto" && (
              <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <ShieldIcon size={32} className="text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary">← OK</span>
                </div>
                <div className="text-2xl text-muted-foreground font-bold">ou</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-danger/10 border-2 border-danger flex items-center justify-center">
                    <ChainsawIcon size={32} />
                  </div>
                  <span className="text-xs font-bold text-danger">À revoir →</span>
                </div>
              </div>
            )}

            {slide.id === "go" && (
              <div className="text-6xl mb-8">{slide.icon}</div>
            )}

            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
              {slide.subtitle}
            </p>
            <h1 className="text-3xl font-[900] text-foreground mb-4 tracking-tight">
              {slide.title}
            </h1>
            <p className="text-muted-foreground text-base font-medium max-w-[280px] leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + button */}
      <div className="px-8 pb-12 flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={goNext}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            isLast
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          {isLast ? "Commencer" : "Suivant"}
        </button>
      </div>
    </motion.div>
  );
}
