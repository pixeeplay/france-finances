"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useDragControls, useReducedMotion } from "framer-motion";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { ReinforceIcon } from "./ReinforceIcon";
import { StopIcon } from "./StopIcon";
import { AcronymText } from "./AcronymText";
import { AmountScale } from "./AmountScale";
import { CategoryBadge, catStyle } from "./icons/CategoryBadge";
import type { Card, VoteDirection } from "@/types";
import { formatBillions, formatEuros } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { SPRING_SWIPE } from "@/lib/motion-constants";

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
            transition={reducedMotion ? { duration: 0 } : SPRING_SWIPE}
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
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-card border-t border-border rounded-t-2xl max-h-[92vh] max-w-md mx-auto will-change-transform"
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
                className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              >
                <span className="text-lg" aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-[180px] relative">
              {/* Category & Title */}
              <div className="pt-2">
                <p className="flex items-center gap-2.5 mb-3" style={catStyle(card.deckId)}>
                  <CategoryBadge deckId={card.deckId} size={36} />
                  <span className="kicker cat-text">{getDeckName(card.deckId)}</span>
                </p>
                <h1 className="text-3xl leading-tight font-extrabold text-foreground mb-5">
                  <AcronymText lexiconInNewTab text={card.title} />
                </h1>
              </div>

              {/* Badges */}
              <dl className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-2xl bg-background/60 border border-border p-3">
                  <dt className="kicker text-muted-foreground">Coût annuel</dt>
                  <dd className="numeral text-3xl text-danger">
                    {formatBillions(card.amountBillions)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-background/60 border border-border p-3">
                  <dt className="kicker text-muted-foreground">Par habitant / an</dt>
                  <dd className="numeral text-3xl text-primary">
                    {formatEuros(card.costPerCitizen)}
                  </dd>
                  {card.costPerCitizen >= 24 && (
                    <dd className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      soit {formatEuros(card.costPerCitizen / 12)} par mois
                    </dd>
                  )}
                </div>
              </dl>
              <AmountScale amountBillions={card.amountBillions} className="mb-8" />

              {/* Contexte */}
              <section className="mb-8">
                <h3 className="text-xl font-extrabold text-foreground mb-3">
                  Contexte
                </h3>
                <AcronymText
                  lexiconInNewTab
                  text={card.description}
                  className="text-muted-foreground leading-relaxed text-[15px]"
                />
              </section>

              {/* Équivalence */}
              {card.equivalence && (
                <section className="mb-8">
                  <h3 className="text-xl font-extrabold text-foreground mb-3">
                    Équivalence
                  </h3>
                  <div className="rounded-2xl bg-warning/10 border border-warning/25 p-4">
                    <AcronymText
                      lexiconInNewTab
                      text={card.equivalence}
                      className="text-foreground font-medium text-[15px] leading-snug"
                    />
                  </div>
                </section>
              )}

              {/* Subtitle / Détail (masqué si contenu dans l'équivalence) */}
              {card.subtitle && !(card.equivalence && card.equivalence.includes(card.subtitle)) && (
                <section className="mb-8">
                  <h3 className="text-xl font-extrabold text-foreground mb-3">
                    Détail
                  </h3>
                  <div className="rounded-2xl bg-background/60 border border-border p-4">
                    <AcronymText
                      lexiconInNewTab
                      text={card.subtitle}
                      className="text-foreground font-medium text-[15px] leading-snug"
                    />
                  </div>
                </section>
              )}

              {/* Trend */}
              {card.trend !== undefined && (
                <section className="mb-8">
                  <h3 className="text-xl font-extrabold text-foreground mb-3">
                    Évolution
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="numeral text-2xl text-info"
                    >
                      {card.trend > 0 ? "+" : ""}
                      {card.trend.toLocaleString("fr-FR")}{"\u00A0"}%
                    </span>
                    <span className="text-muted-foreground text-sm">
                      sur la période récente
                    </span>
                  </div>
                </section>
              )}

              {/* Sources */}
              <section className="mb-6">
                <h3 className="text-xl font-extrabold text-foreground mb-3">
                  Sources
                </h3>
                <div className="flex flex-col gap-2.5">
                  {card.sourceUrl ? (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 min-h-[44px] p-3.5 rounded-2xl bg-background/60 border border-border hover:border-info/60 transition-colors group"
                    >
                      <AcronymText
                        lexiconInNewTab
                        text={card.source}
                        className="text-foreground font-medium text-[15px]"
                      />
                      <span className="text-info text-lg transition-colors" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-background/60 border border-border">
                      <AcronymText
                        lexiconInNewTab
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
                      className="text-xs font-medium text-info bg-info/10 px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-5 pt-4 pb-safe z-30">
              {level >= 2 ? (
                <div className="flex items-center justify-evenly mb-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleVote("keep")}
                      aria-label="Garder cette dépense"
                      className="w-12 h-12 rounded-full bg-card border-2 border-primary/80 flex items-center justify-center hover:bg-primary active:scale-95 transition-all"
                    >
                      <ShieldIcon size={20} className="text-primary hover:text-primary-foreground" />
                    </button>
                    <span className="text-[9px] font-bold text-primary uppercase">Garder</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleVote("cut")}
                      aria-label="Réduire cette dépense"
                      className="group/item w-12 h-12 rounded-full bg-card border-2 border-warning/80 flex items-center justify-center hover:bg-warning active:scale-95 transition-all"
                    >
                      <ChainsawIcon size={20} variant="orange" className="chainsaw-hover-white" />
                    </button>
                    <span className="text-[9px] font-bold text-warning uppercase">Réduire</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleVote("reinforce")}
                      aria-label="Renforcer cette dépense"
                      className="w-12 h-12 rounded-full bg-card border-2 border-info/80 flex items-center justify-center hover:bg-info active:scale-95 transition-all"
                    >
                      <ReinforceIcon size={20} />
                    </button>
                    <span className="text-[9px] font-bold text-info uppercase">Renforcer</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleVote("unjustified")}
                      aria-label="Marquer comme injustifié"
                      className="w-12 h-12 rounded-full bg-card border-2 border-danger/80 flex items-center justify-center hover:bg-danger active:scale-95 transition-all"
                    >
                      <StopIcon size={20} />
                    </button>
                    <span className="text-[9px] font-bold text-danger uppercase">Injustifié</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => handleVote("keep")}
                    aria-label="Garder cette dépense"
                    className="flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-2xl border-2 border-primary/80 bg-primary/10 text-primary font-heading font-bold hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all"
                  >
                    <ShieldIcon size={20} />
                    Garder
                  </button>
                  <button
                    onClick={() => handleVote("cut")}
                    aria-label="Remettre en question cette dépense"
                    className="group/item flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-2xl border-2 border-danger/80 bg-danger/10 text-danger font-heading font-bold hover:bg-danger hover:text-background active:scale-95 transition-all"
                  >
                    <ChainsawIcon size={20} className="chainsaw-hover-white" />
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
