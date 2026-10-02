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
      className="mx-4 mb-4 border-t border-border pt-3"
      data-testid="budget-challenge-entry"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="kicker flex items-center gap-1.5 text-danger">
            <span aria-hidden="true" className="shrink-0">
              <ChainsawIcon size={12} />
            </span>
            Défi
          </p>
          <h2 id="budget-challenge-title" className="mt-1 text-2xl font-semibold leading-tight">
            Trouve <span className="numeral">{BUDGET_CHALLENGE_TARGET}</span>&nbsp;Md€
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {BUDGET_CHALLENGE_CARD_COUNT} dépenses tirées au hasard, aucune au-delà de{" "}
            {formatBillions(maxCardBillions)}. Lesquelles remettre en question pour atteindre
            l&apos;objectif ?
          </p>
        </div>
      </div>
      <Link
        href={BUDGET_CHALLENGE_HREF}
        onClick={() =>
          track("deck_selected", { deckId: "random", level: 1, mode: "budget", target: BUDGET_CHALLENGE_TARGET })
        }
        className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-md border border-foreground/40 px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
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
    <section className="px-4 py-5 border-b border-border" data-testid="budget-challenge-summary">
      <p className="kicker text-muted-foreground">Bilan du défi</p>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
        <div>
          <dt className="kicker text-muted-foreground">Gardé</dt>
          <dd className="numeral text-xl font-semibold text-primary">{formatBillions(result.keptBillions)}</dd>
        </div>
        <div className="border-l border-border pl-4">
          <dt className="kicker text-muted-foreground">Remis en question</dt>
          <dd className="numeral text-xl font-semibold text-danger">{formatBillions(result.cutBillions)}</dd>
        </div>
      </dl>
    </section>
  );
}
