"use client";

import { useEffect, useState } from "react";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import {
  communityAgreement,
  formatBillions,
  trendFact,
  voteSide,
  type CommunityCounts,
} from "@/lib/sessionFeedback";
import type { Card, VoteDirection } from "@/types";

export interface LastVote {
  card: Card;
  direction: VoteDirection;
  /** Horodatage du vote, sert de cle pour relancer l'affichage */
  at: number;
}

/** Duree d'affichage du retour apres un swipe */
export const FEEDBACK_DURATION_MS = 2600;

/** Phrase de l'avis de la communaute (complete, pour les lecteurs d'ecran) */
function agreementSentence(lastVote: LastVote, counts: CommunityCounts): string {
  const agreement = communityAgreement(counts[lastVote.card.id], lastVote.direction);
  return agreement
    ? `${agreement.percent} % des joueurs sont du même avis (${agreement.total} votes)`
    : "Pas encore assez de votes de la communauté sur cette carte";
}

/**
 * Texte du retour de vote pour la zone aria-live de la pile : une seule annonce
 * par vote, fusionnee avec celle de la carte suivante (pas de role=status en double).
 */
export function feedbackAnnouncement(lastVote: LastVote | null, counts: CommunityCounts): string {
  if (!lastVote) return "";
  const fact = trendFact(lastVote.card);
  return `${lastVote.card.title} : ${agreementSentence(lastVote, counts)}.${fact ? ` ${fact}.` : ""}`;
}

interface SessionFeedbackBarProps {
  lastVote: LastVote | null;
  counts: CommunityCounts;
  /** Montant cumule remis en question dans la session (Md€) */
  cutBillions: number;
  /** Mode budget : objectif d'economies (Md€), affiche a la place du cumul simple */
  budgetTarget?: number;
}

/**
 * Bandeau de hauteur fixe au-dessus de la pile : retour bref apres chaque vote
 * (avis de la communaute, tendance) et cumul "tronconne" de la session.
 * Il ne recouvre jamais la carte ; l'annonce vocale passe par la zone
 * aria-live de SwipeStack (voir feedbackAnnouncement).
 */
export function SessionFeedbackBar({ lastVote, counts, cutBillions, budgetTarget }: SessionFeedbackBarProps) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!lastVote) return;
    const at = lastVote.at;
    const timer = setTimeout(() => setDismissedAt(at), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lastVote]);

  const visible = lastVote !== null && dismissedAt !== lastVote.at;

  return (
    <div className="relative mx-4 mb-2 flex h-11 items-center gap-3 border-y border-border">
      <div className="min-w-0 flex-1" aria-hidden="true">
        {visible && lastVote ? <FeedbackLines lastVote={lastVote} counts={counts} /> : null}
      </div>
      {budgetTarget ? (
        <BudgetCounter cutBillions={cutBillions} target={budgetTarget} />
      ) : (
        <p
          className="shrink-0 flex flex-col items-end leading-none"
          data-testid="session-cut-counter"
        >
          <span className="kicker flex items-center gap-1 text-muted-foreground">
            <span aria-hidden="true" className="shrink-0">
              <ChainsawIcon size={11} />
            </span>
            Tronçonné
          </span>
          <span className="sr-only"> cette session : </span>
          <span className="numeral mt-0.5 text-base font-semibold text-danger">{formatBillions(cutBillions)}</span>
        </p>
      )}
    </div>
  );
}

/** Suivi de l'objectif du mode budget : montant / cible et jauge sur le filet du bas */
function BudgetCounter({ cutBillions, target }: { cutBillions: number; target: number }) {
  const reached = cutBillions >= target;
  const progress = Math.min(cutBillions / target, 1) * 100;
  return (
    <>
      <p className="shrink-0 flex flex-col items-end leading-none" data-testid="budget-counter">
        <span className={`kicker ${reached ? "text-primary" : "text-muted-foreground"}`}>
          {reached ? "Objectif atteint" : "Objectif économies"}
        </span>
        <span className={`numeral mt-0.5 text-base font-semibold ${reached ? "text-primary" : "text-foreground"}`}>
          {cutBillions.toFixed(1)} / {target}&nbsp;Md€
        </span>
      </p>
      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-muted" aria-hidden="true">
        <span
          className={`block h-full transition-[width] duration-500 ${reached ? "bg-primary" : "bg-warning"}`}
          style={{ width: `${progress}%` }}
        />
      </span>
    </>
  );
}

function FeedbackLines({ lastVote, counts }: { lastVote: LastVote; counts: CommunityCounts }) {
  const side = voteSide(lastVote.direction);
  const fact = trendFact(lastVote.card);
  const detail = fact ? `${agreementSentence(lastVote, counts)} · ${fact}` : agreementSentence(lastVote, counts);

  return (
    <div className="animate-fade-in" data-testid="swipe-feedback">
      <p className="flex items-center gap-1.5 text-xs font-medium leading-4 text-foreground">
        {side === "cut" ? (
          <span className="shrink-0">
            <ChainsawIcon size={12} />
          </span>
        ) : (
          <span className="shrink-0 text-primary">
            <ShieldIcon size={12} />
          </span>
        )}
        <span className="truncate">{lastVote.card.title}</span>
      </p>
      <p className="truncate text-[11px] leading-4 text-muted-foreground">{detail}</p>
    </div>
  );
}
