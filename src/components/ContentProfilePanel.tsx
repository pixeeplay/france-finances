"use client";

import { useMemo } from "react";
import decksMeta from "@/data/decks-meta.json";
import { computeContentProfile } from "@/lib/archetype";
import { isCutDirection } from "@/lib/sessionFeedback";
import { formatBillions } from "@/lib/format";
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
    <section className="mx-4 my-2 rounded-2xl bg-card border border-border p-5" data-testid="content-profile">
      <div>
        <p className="kicker text-danger">En montants</p>
        <h3 className="mt-1 mb-2 text-xl font-extrabold">Ce que tes choix pèsent</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tu as remis en question {cardCutPercent}&nbsp;% des cartes, soit {amountPercent}&nbsp;% des dépenses en jeu (
          {formatBillions(profile.cutBillions)} sur {formatBillions(profile.totalBillions)}).
        </p>

        <div
          className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${amountPercent} % des montants remis en question`}
        >
          <div className="h-full bg-primary" style={{ width: `${Math.max(0, 100 - amountPercent)}%` }} />
          <div className="h-full bg-danger" style={{ width: `${Math.min(100, amountPercent)}%` }} />
        </div>

        <dl className="mt-4 flex flex-col divide-y divide-border border-t border-border text-sm">
          {multiDeck && profile.topCutDeck && (
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="kicker text-muted-foreground">Catégorie la plus coupée</dt>
              <dd className="text-right font-medium">
                {deckName(profile.topCutDeck.deckId)} ({formatBillions(profile.topCutDeck.cutBillions)})
              </dd>
            </div>
          )}
          {multiDeck && profile.topKeptDeck && (
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="kicker text-muted-foreground">Catégorie la plus protégée</dt>
              <dd className="text-right font-medium">
                {deckName(profile.topKeptDeck.deckId)} ({formatBillions(profile.topKeptDeck.keptBillions)})
              </dd>
            </div>
          )}
          {profile.largestCut && (
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="kicker text-muted-foreground">Plus grosse dépense remise en question</dt>
              <dd className="text-right font-medium">
                {profile.largestCut.title} ({formatBillions(profile.largestCut.amountBillions)})
              </dd>
            </div>
          )}
          {profile.largestKept && (
            <div className="flex items-baseline justify-between gap-3 py-2">
              <dt className="kicker text-muted-foreground">Plus grosse dépense gardée</dt>
              <dd className="text-right font-medium">
                {profile.largestKept.title} ({formatBillions(profile.largestKept.amountBillions)})
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
