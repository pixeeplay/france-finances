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
      className="absolute inset-0 z-50 flex flex-col rounded-3xl border border-border bg-card p-5"
      data-testid="amount-quiz"
    >
      <p className="kicker text-muted-foreground border-b border-border pb-3">Mini-quiz</p>
      <h2
        id="amount-quiz-title"
        ref={titleRef}
        tabIndex={-1}
        className="mt-3 text-2xl font-semibold leading-tight focus:outline-none"
      >
        À ton avis, combien ?
      </h2>
      <p className="mt-3 text-base font-medium leading-snug">{card.title}</p>
      {card.subtitle && <p className="text-xs text-muted-foreground">{card.subtitle}</p>}
      <p className="mt-2 kicker text-muted-foreground">Montant annuel</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          let state = "border-border hover:border-foreground/60";
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
              className={`min-h-[44px] rounded-md border-2 px-3 py-2 numeral text-lg font-semibold transition-colors aria-disabled:cursor-default ${state}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4" aria-live="polite">
        {answered && (
          <>
            <p className={`text-sm font-semibold ${correct ? "text-primary" : "text-danger"}`}>
              {correct ? "Bonne réponse." : `Raté : c'était ${formatBillions(card.amountBillions)}.`}
            </p>
            <p className="mt-1 font-mono text-[11px] leading-4 text-muted-foreground">Source : {card.source}</p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Voir la carte
            </button>
          </>
        )}
      </div>
    </section>
  );
}
