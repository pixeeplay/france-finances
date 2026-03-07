"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useDragControls, useReducedMotion } from "framer-motion";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { AcronymText } from "./AcronymText";
import type { Card, VoteDirection } from "@/types";

interface CardDetailProps {
  card: Card | null;
  level?: 1 | 2 | 3;
  onClose: () => void;
  onVote: (direction: VoteDirection) => void;
}

export function CardDetail({ card, level = 1, onClose, onVote }: CardDetailProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleVote = useCallback(
    (direction: VoteDirection) => {
      onVote(direction);
      onClose();
    },
    [onVote, onClose]
  );

  // Escape key to close
  useEffect(() => {
    if (!card) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  // Focus trap: keep focus inside the bottom sheet
  useEffect(() => {
    if (!card || !sheetRef.current) return;
    const sheet = sheetRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the close button on open
    const closeBtn = sheet.querySelector<HTMLElement>("[aria-label='Fermer le détail']");
    closeBtn?.focus();

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = sheet.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);
    return () => {
      window.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, [card]);

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 max-w-md mx-auto"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            ref={(el) => {
              constraintsRef.current = el;
              sheetRef.current = el;
            }}
            initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            dragControls={dragControls}
            role="dialog"
            aria-label={`Détail : ${card.title}`}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-card rounded-t-[32px] max-h-[92vh] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] max-w-md mx-auto will-change-transform"
          >
            {/* Drag Handle & Close */}
            <div className="flex flex-col items-center pt-3 pb-2 relative shrink-0">
              <button
                onPointerDown={(e) => dragControls.start(e)}
                className="flex h-5 w-full items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <div className="h-1.5 w-12 rounded-full bg-muted" />
              </button>
              <button
                onClick={onClose}
                aria-label="Fermer le détail"
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-[180px] relative">
              {/* Category & Title */}
              <div className="pt-2">
                <h2 className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-1">
                  {card.icon} {card.deckId.toUpperCase()}
                </h2>
                <h1 className="text-[28px] leading-tight font-bold text-foreground tracking-tight mb-5">
                  <AcronymText text={card.title} />
                </h1>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-primary text-sm font-bold tracking-wide">
                    ~{card.amountBillions} Md€ / an
                  </p>
                </div>
                <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-muted border border-border px-3.5 shadow-sm">
                  <p className="text-foreground text-sm font-medium">
                    ~{card.costPerCitizen}€ par Français / an
                  </p>
                </div>
              </div>

              {/* Contexte */}
              <section className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                  Contexte
                </h3>
                <AcronymText
                  text={card.description}
                  className="text-muted-foreground leading-relaxed text-[15px]"
                />
              </section>

              {/* Équivalence */}
              {card.equivalence && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2 tracking-tight">
                    <span className="text-warning text-xl" aria-hidden="true">📊</span>
                    Équivalence
                  </h3>
                  <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-2xl mt-0.5" aria-hidden="true">💡</span>
                    <AcronymText
                      text={card.equivalence}
                      className="text-foreground font-medium text-[15px] leading-snug"
                    />
                  </div>
                </section>
              )}

              {/* Subtitle / Détail */}
              {card.subtitle && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2 tracking-tight">
                    <span className="text-primary text-xl" aria-hidden="true">📋</span>
                    Détail
                  </h3>
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-2xl mt-0.5" aria-hidden="true">💡</span>
                    <AcronymText
                      text={card.subtitle}
                      className="text-foreground font-medium text-[15px] leading-snug"
                    />
                  </div>
                </section>
              )}

              {/* Trend */}
              {card.trend !== undefined && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                    Évolution
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        card.trend > 0
                          ? "bg-danger/10 text-danger"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {card.trend > 0 ? "+" : ""}
                      {card.trend}%
                    </span>
                    <span className="text-muted-foreground text-sm">
                      sur la période récente
                    </span>
                  </div>
                </section>
              )}

              {/* Sources */}
              <section className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2 tracking-tight">
                  <span className="text-muted-foreground text-xl" aria-hidden="true">🔗</span>
                  Sources
                </h3>
                <div className="flex flex-col gap-2.5">
                  {card.sourceUrl ? (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl bg-background/40 border border-border hover:bg-muted transition-all group"
                    >
                      <AcronymText
                        text={card.source}
                        className="text-foreground font-medium text-[15px]"
                      />
                      <span className="text-muted-foreground text-lg group-hover:text-primary transition-colors">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-background/40 border border-border">
                      <AcronymText
                        text={card.source}
                        className="text-foreground font-medium text-[15px]"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Tags */}
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Scroll fade hint */}
            <div className="pointer-events-none absolute bottom-[168px] left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent z-20" />

            {/* Sticky Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-5 pt-4 rounded-t-3xl z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              {level >= 2 ? (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button
                    onClick={() => handleVote("keep")}
                    aria-label="Valider cette dépense"
                    className="flex flex-col items-center justify-center gap-1 py-3 min-h-[44px] rounded-xl border-2 border-primary/80 text-primary font-bold active:scale-95 transition-all"
                  >
                    <ShieldIcon size={20} />
                    <span className="text-[10px] uppercase">OK</span>
                  </button>
                  <button
                    onClick={() => handleVote("cut")}
                    aria-label="Réduire cette dépense"
                    className="flex flex-col items-center justify-center gap-1 py-3 min-h-[44px] rounded-xl border-2 border-warning/80 text-warning font-bold active:scale-95 transition-all"
                  >
                    <ChainsawIcon size={20} />
                    <span className="text-[10px] uppercase">Réduire</span>
                  </button>
                  <button
                    onClick={() => handleVote("reinforce")}
                    aria-label="Renforcer cette dépense"
                    className="flex flex-col items-center justify-center gap-1 py-3 min-h-[44px] rounded-xl border-2 border-info/80 text-info font-bold active:scale-95 transition-all"
                  >
                    <span className="text-lg" aria-hidden="true">📈</span>
                    <span className="text-[10px] uppercase">Renforcer</span>
                  </button>
                  <button
                    onClick={() => handleVote("unjustified")}
                    aria-label="Marquer comme injustifié"
                    className="flex flex-col items-center justify-center gap-1 py-3 min-h-[44px] rounded-xl border-2 border-danger/80 text-danger font-bold active:scale-95 transition-all"
                  >
                    <span className="text-lg" aria-hidden="true">❌</span>
                    <span className="text-[10px] uppercase">Injustifié</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => handleVote("keep")}
                    aria-label="Valider cette dépense"
                    className="flex items-center justify-center gap-2 py-3.5 min-h-[44px] rounded-xl border-2 border-primary/80 text-primary font-bold hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all"
                  >
                    <ShieldIcon size={20} />
                    OK pour moi
                  </button>
                  <button
                    onClick={() => handleVote("cut")}
                    aria-label="Remettre en question cette dépense"
                    className="flex items-center justify-center gap-2 py-3.5 min-h-[44px] rounded-xl border-2 border-danger/80 text-danger font-bold hover:bg-danger hover:text-white active:scale-95 transition-all"
                  >
                    <ChainsawIcon size={20} />
                    À revoir
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
