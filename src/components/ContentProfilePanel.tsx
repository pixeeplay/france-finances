"use client";

import { useMemo } from "react";
import decksMeta from "@/data/decks-meta.json";
import { computeContentProfile } from "@/lib/archetype";
import { formatBillions, isCutDirection } from "@/lib/sessionFeedback";
import type { Session } from "@/types";

const DECK_NAMES: Record<string, string> = Object.fromEntries(
  decksMeta.decks.map((d) => [d.id, d.name]),
);

export function deckName(deckId: string): string {
  return DECK_NAMES[deckId] ?? deckId;
}

/**
 * "Ce que tes choix disent" : part des montants remis en question,
 * categories et depenses les plus coupees / protegees.
 */
export function ContentProfilePanel({ session }: { session: Session }) {
  const profile = useMemo(
    () => computeContentProfile(session.cards, session.votes),
    [session.cards, session.votes],
  );
  if (profile.totalBillions <= 0) return null;

  const cardCutPercent =
    session.votes.length > 0
      ? Math.round(
          (session.votes.filter((v) => isCutDirection(v.direction)).length /
            session.votes.length) *
            100,
        )
      : 0;
  const amountPercent = Math.round(profile.cutAmountPercent);
  const multiDeck = profile.decks.length > 1;

  return (
    <div className="px-4 py-2" data-testid="content-profile">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-base font-bold mb-1">Ce que tes choix pèsent</p>
        <p className="text-xs text-muted-foreground">
          Tu as remis en question {cardCutPercent}&nbsp;% des cartes, soit {amountPercent}&nbsp;% des montants en jeu (
          {formatBillions(profile.cutBillions)} sur {formatBillions(profile.totalBillions)}).
        </p>

        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/30"
          role="img"
          aria-label={`${amountPercent} % des montants remis en question`}
        >
          <div className="h-full bg-danger" style={{ width: `${Math.min(100, amountPercent)}%` }} />
        </div>

        <dl className="mt-3 grid grid-cols-1 gap-2 text-xs">
          {multiDeck && profile.topCutDeck && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Catégorie la plus coupée</dt>
              <dd className="text-right font-semibold">
                {deckName(profile.topCutDeck.deckId)} ({formatBillions(profile.topCutDeck.cutBillions)})
              </dd>
            </div>
          )}
          {multiDeck && profile.topKeptDeck && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Catégorie la plus protégée</dt>
              <dd className="text-right font-semibold">
                {deckName(profile.topKeptDeck.deckId)} ({formatBillions(profile.topKeptDeck.keptBillions)})
              </dd>
            </div>
          )}
          {profile.largestCut && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Plus grosse dépense remise en question</dt>
              <dd className="text-right font-semibold">
                {profile.largestCut.title} ({formatBillions(profile.largestCut.amountBillions)})
              </dd>
            </div>
          )}
          {profile.largestKept && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Plus grosse dépense gardée</dt>
              <dd className="text-right font-semibold">
                {profile.largestKept.title} ({formatBillions(profile.largestKept.amountBillions)})
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
