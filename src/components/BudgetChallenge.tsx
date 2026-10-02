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
      className="mx-4 mb-4 rounded-xl border border-border bg-card p-4"
      data-testid="budget-challenge-entry"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          <ChainsawIcon size={22} />
        </span>
        <div className="min-w-0">
          <h2 id="budget-challenge-title" className="text-base font-semibold leading-tight">
            Défi : trouve {BUDGET_CHALLENGE_TARGET}&nbsp;Md€
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
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
        className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg border-2 border-danger px-4 text-sm font-bold text-foreground hover:bg-danger/10 transition-colors"
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
    <div className="px-4 py-2" data-testid="budget-challenge-summary">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold">Bilan du défi</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Gardé : {formatBillions(result.keptBillions)} · Remis en question : {formatBillions(result.cutBillions)}
        </p>
      </div>
    </div>
  );
}
