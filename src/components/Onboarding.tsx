"use client";

import { useState, useCallback } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { UiIcon } from "./icons/UiIcon";
import { track } from "@/lib/analytics";
import { SPRING_SWIPE } from "@/lib/motion-constants";

const ONBOARDED_KEY = "trnc:onboarded";

const slides = [
  {
    id: "welcome",
    title: "Bienvenue",
    subtitle: "La Tronçonneuse de Poche",
    description: "Swipe les dépenses publiques françaises et découvre ton profil budgétaire.",
  },
  {
    id: "howto",
    title: "Comment jouer ?",
    subtitle: "2 gestes, 1 choix",
    description: "Swipe à gauche pour garder une dépense, à droite pour la remettre en question.",
  },
  {
    id: "go",
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
    try {
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {
      // QuotaExceededError — non-critical
    }
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
    <LazyMotion features={domAnimation}>
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col max-w-md mx-auto lg:rounded-3xl lg:my-4 lg:shadow-2xl lg:border lg:border-border"
    >
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={skip}
          className="min-h-[44px] text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3"
        >
          Passer
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={slide.id}
            custom={direction}
            initial={{ x: direction * 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -200, opacity: 0 }}
            transition={SPRING_SWIPE}
            className="flex flex-col items-center text-center w-full"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`Diapositive ${current + 1} sur ${slides.length} : ${slide.title}`}
          >
            {/* Slide-specific illustration */}
            {slide.id === "welcome" && (
              <div className="w-24 h-24 bg-card rounded-md flex items-center justify-center mb-8 border border-border" aria-hidden="true">
                <ChainsawIcon size={56} />
              </div>
            )}

            {slide.id === "howto" && (
              <div className="flex items-center gap-6 mb-8" aria-hidden="true">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center">
                    <ShieldIcon size={32} className="text-primary" />
                  </div>
                  <span className="kicker text-primary">← OK</span>
                </div>
                <div className="font-serif text-2xl text-muted-foreground">ou</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-danger flex items-center justify-center">
                    <ChainsawIcon size={32} />
                  </div>
                  <span className="kicker text-danger">À revoir →</span>
                </div>
              </div>
            )}

            {slide.id === "go" && (
              <div className="w-24 h-24 bg-card rounded-md flex items-center justify-center mb-8 border border-border text-foreground" aria-hidden="true">
                <UiIcon name="target" size={52} />
              </div>
            )}

            <p className="kicker text-muted-foreground mb-3">
              {slide.subtitle}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground mb-4">
              {slide.title}
            </h1>
            <p className="text-muted-foreground text-base max-w-[280px] leading-relaxed">
              {slide.description}
            </p>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + button */}
      <div className="px-8 pb-12 flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-[1px] transition-all duration-300 ${
                i === current
                  ? "w-8 bg-foreground"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={goNext}
          className={`w-full min-h-[48px] py-4 rounded-md font-semibold text-lg transition-colors ${
            isLast
              ? "bg-foreground text-background hover:opacity-90"
              : "border border-foreground/40 text-foreground hover:bg-muted"
          }`}
        >
          {isLast ? "Commencer" : "Suivant"}
        </button>
      </div>
    </m.div>
    </LazyMotion>
  );
}
