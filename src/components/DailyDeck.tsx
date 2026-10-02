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
import { computeCutBillions } from "@/lib/sessionFeedback";
import { formatBillions } from "@/lib/format";
import { ShareIcon } from "./ShareIcon";
import type { Session, VoteDirection } from "@/types";

const SITE_URL = "https://france-finances.com";

const SQUARE_CLASS: Record<VoteDirection, string> = {
  keep: "bg-primary",
  cut: "bg-danger",
  reinforce: "bg-info",
  unjustified: "bg-warning",
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
        <span key={i} className={`h-4 w-4 rounded-[3px] ${SQUARE_CLASS[d]}`} />
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
      className="mx-4 my-4 rounded-xl border border-border bg-card p-4"
      data-testid="daily-deck-entry"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="daily-deck-title" className="text-base font-semibold leading-tight">
            Deck du jour{todayKey ? ` n°${getDailyNumber(todayKey)}` : ""}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Les mêmes 10 dépenses pour tout le monde, renouvelées chaque jour à minuit.
          </p>
        </div>
        {hydrated && streak > 0 && (
          <p className="shrink-0 text-right">
            <span className="block text-lg font-bold tabular-nums text-primary">{streak}</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
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
        className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
      >
        {todayResult ? "Rejouer (le premier résultat compte)" : "Jouer le deck du jour"}
      </Link>
      {hydrated && progress.bestStreak > 1 && (
        <p className="mt-2 text-[11px] text-muted-foreground text-center">
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
    <div className="px-4 py-2" data-testid="daily-result">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-bold">Deck du jour n°{getDailyNumber(dailyKey)}</p>
            <p className="text-xs text-muted-foreground">
              Série : {pluralDays(streak)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted transition-colors"
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
        <p className="mt-2 text-xs text-muted-foreground">
          {formatBillions(official.cutBillions)} remis en question sur {formatBillions(official.totalBillions)}.
        </p>
        {isReplay && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Partie rejouée : seul ton premier résultat du jour est conservé.
          </p>
        )}
      </div>
    </div>
  );
}
