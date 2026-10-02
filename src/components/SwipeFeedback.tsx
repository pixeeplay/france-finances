"use client";

import { useEffect, useState } from "react";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import {
  communityAgreement,
  trendFact,
  voteSide,
  type CommunityCounts,
} from "@/lib/sessionFeedback";
import { formatBillions } from "@/lib/format";
import type { Card, VoteDirection } from "@/types";

export interface LastVote {
  card: Card;
  direction: VoteDirection;
  /** Horodatage du vote, sert de cle pour relancer l'affichage */
  at: number;
}

/** Duree d'affichage du retour apres un swipe */
export const FEEDBACK_DURATION_MS = 2600;

interface SwipeFeedbackToastProps {
  lastVote: LastVote | null;
  counts: CommunityCounts;
  /** Montant cumule remis en question dans la session (Md€) */
  cutBillions: number;
}

/**
 * Retour affiche brievement apres chaque swipe : avis de la communaute
 * (si disponible), un fait sur la depense et le cumul "tronconne".
 * A placer dans un conteneur `relative` (superpose en haut de la pile).
 */
export function SwipeFeedbackToast({ lastVote, counts, cutBillions }: SwipeFeedbackToastProps) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!lastVote) return;
    const at = lastVote.at;
    const timer = setTimeout(() => setDismissedAt(at), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lastVote]);

  if (!lastVote || dismissedAt === lastVote.at) return null;

  const side = voteSide(lastVote.direction);
  const agreement = communityAgreement(counts[lastVote.card.id], lastVote.direction);
  const fact = trendFact(lastVote.card);

  return (
    <div
      className="absolute inset-x-0 top-2 z-40 flex justify-center px-2 pointer-events-none"
      data-testid="swipe-feedback"
      role="status"
    >
      <div className="max-w-[340px] w-full rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg">
        <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
          {side === "cut" ? (
            <span aria-hidden="true" className="shrink-0">
              <ChainsawIcon size={14} />
            </span>
          ) : (
            <span aria-hidden="true" className="shrink-0 text-primary">
              <ShieldIcon size={14} />
            </span>
          )}
          <span className="truncate">{lastVote.card.title}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {agreement
            ? `${agreement.percent} % des joueurs sont du même avis (${agreement.total} votes)`
            : "Pas encore assez de votes de la communauté sur cette carte"}
        </p>
        {fact && <p className="text-[11px] text-muted-foreground">{fact}</p>}
        {side === "cut" && (
          <p className="text-[11px] font-semibold text-danger">
            Cumul remis en question : {formatBillions(cutBillions)}
          </p>
        )}
      </div>
    </div>
  );
}

/** Ligne discrete et persistante : cumul "tronconne" de la session */
export function SessionCutCounter({ cutBillions }: { cutBillions: number }) {
  return (
    <p
      className="px-4 pb-1 text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"
      data-testid="session-cut-counter"
    >
      <span aria-hidden="true" className="shrink-0">
        <ChainsawIcon size={12} />
      </span>
      Tronçonné cette session :{" "}
      <span className="text-danger tabular-nums">{formatBillions(cutBillions)}</span>
    </p>
  );
}
