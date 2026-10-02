"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDailyStore } from "@/stores/dailyStore";
import { useHydrated } from "@/hooks/useHydrated";
import { track } from "@/lib/analytics";
import {
  buildDailyShareText,
  DAILY_DECK_ID,
  getActiveStreak,
  getDailyNumber,
  getParisDateKey,
  type DailyResult,
} from "@/lib/daily";
import { computeCutBillions, formatBillions } from "@/lib/sessionFeedback";
import { ShareIcon } from "./ShareIcon";
import type { Session, VoteDirection } from "@/types";

const SITE_URL = "https://france-finances.com";

// Memes couleurs que la legende du jeu (HowItWorks) : injustifie = danger.
const SQUARE_CLASS: Record<VoteDirection, string> = {
  keep: "bg-primary",
  cut: "bg-danger",
  reinforce: "bg-info",
  unjustified: "bg-danger",
};

// Second indice, independant de la couleur (WCAG 1.4.1) : un glyphe par direction.
const SQUARE_GLYPH: Record<VoteDirection, string> = {
  keep: "M5 10.5l3.2 3L15 6.5", // coche
  cut: "M6 6l8 8M14 6l-8 8", // croix
  reinforce: "M10 15V5M6 9l4-4 4 4", // fleche haute
  unjustified: "M5.5 10h9", // barre
};

const DIRECTION_LABEL: Record<VoteDirection, string> = {
  keep: "gardée",
  cut: "à revoir",
  reinforce: "renforcée",
  unjustified: "injustifiée",
};

/** Rangee de carres colores (version UI, sans emoji) du resultat du jour */
export function DailySquares({ directions }: { directions: readonly VoteDirection[] }) {
  const label = directions.map((d, i) => `Carte ${i + 1} ${DIRECTION_LABEL[d]}`).join(", ");
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {directions.map((d, i) => (
        <span key={i} className={`flex h-5 w-5 items-center justify-center rounded-[2px] text-background ${SQUARE_CLASS[d]}`}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d={SQUARE_GLYPH[d]} />
          </svg>
        </span>
      ))}
    </div>
  );
}

function pluralDays(n: number): string {
  return `${n} jour${n > 1 ? "s" : ""}`;
}

/** Encart d'entree vers le deck du jour (page /jeu) */
export function DailyDeckEntry() {
  const hydrated = useHydrated();
  const progress = useDailyStore((s) => s);
  const todayKey = hydrated ? getParisDateKey() : null;
  const todayResult = todayKey ? progress.results[todayKey] : undefined;
  const streak = todayKey ? getActiveStreak(progress, todayKey) : 0;

  return (
    <section
      aria-labelledby="daily-deck-title"
      className="mx-4 my-4 border-t-2 border-foreground pt-3"
      data-testid="daily-deck-entry"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker text-muted-foreground">Chaque jour à minuit</p>
          <h2 id="daily-deck-title" className="mt-1 text-2xl font-semibold leading-tight">
            Deck du jour{todayKey ? ` n°${getDailyNumber(todayKey)}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les mêmes 10 dépenses pour tout le monde, renouvelées chaque jour à minuit.
          </p>
        </div>
        {hydrated && streak > 0 && (
          <p className="shrink-0 text-right border-l border-border pl-3">
            <span className="block numeral text-3xl font-semibold leading-none text-foreground">{streak}</span>
            <span className="mt-1 block kicker text-muted-foreground">
              {streak > 1 ? "jours de suite" : "jour"}
            </span>
          </p>
        )}
      </div>

      {todayResult && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <DailySquares directions={todayResult.directions} />
          <span className="text-xs text-muted-foreground">
            Joué aujourd&apos;hui : {formatBillions(todayResult.cutBillions)} remis en question
          </span>
        </div>
      )}

      <Link
        href={`/jeu/${DAILY_DECK_ID}`}
        onClick={() => track("deck_selected", { deckId: DAILY_DECK_ID, level: 1, mode: "daily" })}
        className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
      >
        {todayResult ? "Rejouer (le premier résultat compte)" : "Jouer le deck du jour"}
      </Link>
      {hydrated && progress.bestStreak > 1 && (
        <p className="mt-2 kicker text-muted-foreground">
          Meilleure série : {pluralDays(progress.bestStreak)}
        </p>
      )}
    </section>
  );
}

/** Resultat du deck du jour sur l'ecran de fin : enregistre la serie et propose le partage */
export function DailyResultPanel({ session }: { session: Session }) {
  const recordResult = useDailyStore((s) => s.recordResult);
  const results = useDailyStore((s) => s.results);
  const currentStreak = useDailyStore((s) => s.currentStreak);
  const lastPlayedDate = useDailyStore((s) => s.lastPlayedDate);
  const [copied, setCopied] = useState(false);
  const dailyKey = session.dailyKey;

  const thisResult = useMemo<DailyResult | null>(() => {
    if (!dailyKey) return null;
    const byId = new Map(session.votes.map((v) => [v.cardId, v.direction]));
    const directions = session.cards
      .map((c) => byId.get(c.id))
      .filter((d): d is VoteDirection => d !== undefined);
    return {
      dateKey: dailyKey,
      directions,
      cutBillions: computeCutBillions(session.cards, session.votes),
      totalBillions: Math.round(session.cards.reduce((s, c) => s + c.amountBillions, 0) * 10) / 10,
    };
  }, [dailyKey, session.cards, session.votes]);

  useEffect(() => {
    if (thisResult && session.completed) recordResult(thisResult);
  }, [thisResult, session.completed, recordResult]);

  // Le resultat qui compte est le premier de la journee (rejouer ne l'ecrase pas)
  const official = dailyKey ? (results[dailyKey] ?? thisResult) : null;
  const streak = lastPlayedDate === dailyKey ? currentStreak : 1;
  const isReplay = Boolean(
    official && thisResult && official.directions.join() !== thisResult.directions.join(),
  );

  const handleShare = useCallback(async () => {
    if (!official) return;
    const text = buildDailyShareText({ result: official, streak, url: `${SITE_URL}/jeu/${DAILY_DECK_ID}` });
    track("share_result", { archetype: "daily", platform: "daily" });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // annule ou indisponible : on copie
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papiers indisponible
    }
  }, [official, streak]);

  if (!official || !dailyKey) return null;

  return (
    <section className="px-4 py-5 border-b border-border" data-testid="daily-result">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="kicker text-muted-foreground">Série : {pluralDays(streak)}</p>
            <p className="mt-1 font-serif text-xl font-semibold">Deck du jour n°{getDailyNumber(dailyKey)}</p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-[44px] items-center gap-2 rounded-md border border-foreground/40 px-3 text-sm font-semibold hover:bg-muted transition-colors"
            aria-live="polite"
          >
            <span aria-hidden="true">
              <ShareIcon />
            </span>
            {copied ? "Copié" : "Partager"}
          </button>
        </div>
        <div className="mt-3">
          <DailySquares directions={official.directions} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="numeral text-base font-semibold text-foreground">{formatBillions(official.cutBillions)}</span>{" "}
          remis en question sur {formatBillions(official.totalBillions)}.
        </p>
        {isReplay && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Partie rejouée : seul ton premier résultat du jour est conservé.
          </p>
        )}
      </div>
    </section>
  );
}
