"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChainsawIcon } from "./ChainsawIcon";
import { track } from "@/lib/analytics";
import {
  BUDGET_CHALLENGE_CARD_COUNT,
  BUDGET_CHALLENGE_TARGET,
  budgetChallengeConstraints,
  evaluateBudgetChallenge,
} from "@/lib/budgetChallenge";
import { formatBillions } from "@/lib/format";
import type { Session } from "@/types";

export const BUDGET_CHALLENGE_HREF = `/jeu/random?mode=budget&target=${BUDGET_CHALLENGE_TARGET}`;

/** Encart d'entree du defi "Trouve 50 Md€" (page /jeu) */
export function BudgetChallengeEntry() {
  const { maxCardBillions } = budgetChallengeConstraints(BUDGET_CHALLENGE_TARGET);
  return (
    <section
      aria-labelledby="budget-challenge-title"
      className="flex flex-col rounded-2xl border border-danger/30 bg-danger/10 p-3.5"
      data-testid="budget-challenge-entry"
    >
      <p className="kicker flex items-center gap-1.5 text-danger">
        <span aria-hidden="true" className="shrink-0">
          <ChainsawIcon size={12} />
        </span>
        Défi
      </p>
      <h2 id="budget-challenge-title" className="mt-1 text-xl font-extrabold leading-tight">
        Trouve <span className="numeral text-danger whitespace-nowrap">{BUDGET_CHALLENGE_TARGET}&nbsp;Md€</span>
      </h2>
      <p className="mt-1 mb-3 text-xs leading-snug text-muted-foreground">
        {BUDGET_CHALLENGE_CARD_COUNT} dépenses au hasard, aucune au-delà de {formatBillions(maxCardBillions)}.
      </p>
      <Link
        href={BUDGET_CHALLENGE_HREF}
        onClick={() =>
          track("deck_selected", { deckId: "random", level: 1, mode: "budget", target: BUDGET_CHALLENGE_TARGET })
        }
        className="mt-auto flex min-h-[44px] w-full items-center justify-center rounded-xl bg-danger px-3 text-sm font-heading font-bold text-background hover:opacity-90 transition-opacity"
      >
        Relever le défi
      </Link>
    </section>
  );
}

/** Bilan detaille du defi budgetaire sur l'ecran de resultats */
export function BudgetChallengeSummary({ session }: { session: Session }) {
  const target = session.budgetTarget ?? 0;
  const result = useMemo(
    () => evaluateBudgetChallenge(session.cards, session.votes, target),
    [session.cards, session.votes, target],
  );
  if (session.gameMode !== "budget" || target <= 0) return null;

  let message: string;
  if (result.reached && result.cutsToTarget !== null) {
    message = `Objectif franchi à ta ${result.cutsToTarget}e coupe.`;
    if (result.minimumCuts !== null && result.minimumCuts < result.cardsCut) {
      message += ` Avec ces cartes, ${result.minimumCuts} coupes bien choisies suffisaient : tu as remis en question ${result.cardsCut} dépenses.`;
    } else {
      message += " Tu n'as pas coupé plus que nécessaire.";
    }
  } else if (result.minimumCuts === null) {
    message = "Avec ces cartes, l'objectif n'était pas atteignable.";
  } else {
    message = `Il manquait ${formatBillions(result.remainingBillions)}. Avec ces cartes, ${result.minimumCuts} coupes bien choisies suffisaient.`;
  }

  return (
    <section className="mx-4 my-2 rounded-2xl bg-card border border-border p-5" data-testid="budget-challenge-summary">
      <p className="kicker text-warning">Bilan du défi</p>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-primary/10 p-3">
          <dt className="kicker text-muted-foreground">Gardé</dt>
          <dd className="numeral text-xl text-primary">{formatBillions(result.keptBillions)}</dd>
        </div>
        <div className="rounded-xl bg-danger/10 p-3">
          <dt className="kicker text-muted-foreground">Remis en question</dt>
          <dd className="numeral text-xl text-danger">{formatBillions(result.cutBillions)}</dd>
        </div>
      </dl>
    </section>
  );
}
