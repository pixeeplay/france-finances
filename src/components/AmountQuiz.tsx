"use client";

import { useMemo, useState } from "react";
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
 */
export function AmountQuiz({ card, onAnswer, onContinue }: AmountQuizProps) {
  const options = useMemo(() => buildQuizOptions(card), [card]);
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const correct = answered && options[chosen].correct;

  function choose(index: number) {
    if (answered) return;
    setChosen(index);
    onAnswer(options[index].correct);
  }

  return (
    <section
      aria-labelledby="amount-quiz-title"
      className="absolute inset-0 z-50 flex flex-col rounded-2xl border border-border bg-card p-5"
      data-testid="amount-quiz"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mini-quiz</p>
      <h2 id="amount-quiz-title" className="mt-1 text-lg font-bold leading-tight">
        À ton avis, combien ?
      </h2>
      <p className="mt-3 text-base font-semibold leading-snug">{card.title}</p>
      {card.subtitle && <p className="text-xs text-muted-foreground">{card.subtitle}</p>}
      <p className="mt-1 text-xs text-muted-foreground">Montant annuel</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          let state = "border-border hover:bg-muted";
          if (answered && opt.correct) state = "border-primary bg-primary/15";
          else if (answered && i === chosen) state = "border-danger bg-danger/15";
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              aria-pressed={i === chosen}
              className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-sm font-bold tabular-nums transition-colors disabled:cursor-default ${state}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4" aria-live="polite">
        {answered && (
          <>
            <p className={`text-sm font-bold ${correct ? "text-primary" : "text-danger"}`}>
              {correct ? "Bonne réponse." : `Raté : c'était ${formatBillions(card.amountBillions)}.`}
            </p>
            <p className="text-xs text-muted-foreground">Source : {card.source}</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Voir la carte
            </button>
          </>
        )}
      </div>
    </section>
  );
}
