"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildQuizOptions } from "@/lib/quiz";
import { formatBillions } from "@/lib/format";
import type { Card } from "@/types";

interface AmountQuizProps {
  card: Card;
  /** Appele une seule fois, au moment du choix */
  onAnswer: (correct: boolean) => void;
  /** Le joueur passe a la carte (montant revele) */
  onContinue: () => void;
}

/**
 * Mini-quiz "A ton avis, combien ?" affiche par-dessus la pile avant de
 * reveler la carte. A placer dans un conteneur `relative`.
 *
 * Focus : place sur le titre a l'apparition, puis sur "Voir la carte" apres
 * la reponse (les choix restent focusables, en aria-disabled), pour qu'un
 * joueur au clavier ne reparte pas du debut de la page.
 */
export function AmountQuiz({ card, onAnswer, onContinue }: AmountQuizProps) {
  const options = useMemo(() => buildQuizOptions(card), [card]);
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const correct = answered && options[chosen].correct;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (answered) continueRef.current?.focus({ preventScroll: true });
  }, [answered]);

  function choose(index: number) {
    if (answered) return;
    setChosen(index);
    onAnswer(options[index].correct);
  }

  return (
    <section
      aria-labelledby="amount-quiz-title"
      className="absolute inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain rounded-3xl border border-warning/40 bg-card p-5 shadow-(--shadow-card)"
      data-testid="amount-quiz"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="kicker rounded-full bg-warning/15 px-3 py-1 text-warning">Mini-quiz · avant de voir la carte</p>
        {!answered && (
          <button
            type="button"
            onClick={onContinue}
            className="min-h-[44px] shrink-0 rounded-full px-3 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Passer
          </button>
        )}
      </div>
      <h2
        id="amount-quiz-title"
        ref={titleRef}
        tabIndex={-1}
        className="mt-3 text-3xl font-extrabold leading-tight text-brand-fg dark:text-foreground focus:outline-none"
      >
        À ton avis, combien ?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground leading-snug">
        Devine le montant de la prochaine dépense, puis découvre sa carte.
      </p>
      <p className="mt-3 text-base font-bold leading-snug">{card.title}</p>
      {card.subtitle && <p className="text-xs text-muted-foreground">{card.subtitle}</p>}
      <p className="mt-2 kicker text-muted-foreground">Montant annuel</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          let state = "border-border bg-background/60 hover:border-info";
          if (answered && opt.correct) state = "border-primary bg-primary/10 text-primary";
          else if (answered && i === chosen) state = "border-danger bg-danger/10 text-danger";
          else if (answered) state = "border-border text-muted-foreground";
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => choose(i)}
              aria-disabled={answered || undefined}
              aria-pressed={i === chosen}
              className={`min-h-[52px] rounded-2xl border-2 px-3 py-2 numeral text-xl transition-colors aria-disabled:cursor-default ${state}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4" aria-live="polite">
        {answered && (
          <>
            <p className={`text-base font-bold ${correct ? "text-primary" : "text-danger"}`}>
              {correct ? "Bonne réponse." : `Raté : c'était ${formatBillions(card.amountBillions)}.`}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Source : {card.source}</p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-brand px-4 text-base font-heading font-bold text-white hover:bg-brand-hover transition-colors"
            >
              Voir la carte
            </button>
          </>
        )}
      </div>
    </section>
  );
}
