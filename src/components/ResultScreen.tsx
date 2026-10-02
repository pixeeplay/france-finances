"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useArchetype } from "@/hooks/useArchetype";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { ReinforceIcon } from "./ReinforceIcon";
import { StopIcon } from "./StopIcon";
import { track } from "@/lib/analytics";
import { formatBillions, formatPercent } from "@/lib/format";
import dynamic from "next/dynamic";
const RadarChart = dynamic(() => import("./RadarChart").then((m) => m.RadarChart), {
  ssr: false,
  loading: () => <div className="w-[240px] h-[240px] mx-auto rounded-full bg-muted/30" />,
});
import { computeRadarFromSession } from "@/lib/radarData";
import type { Vote, Card } from "@/types";
import { AuditReport } from "./AuditReport";
import { StatBar } from "./StatBar";
import { ShareIcon } from "./ShareIcon";
import { ChevronIcon } from "./ChevronIcon";
import { CategoryBadge } from "./icons/CategoryBadge";
import { DailyResultPanel } from "./DailyDeck";
import { BudgetChallengeSummary } from "./BudgetChallenge";
import { ContentProfilePanel } from "./ContentProfilePanel";
import { NextLevelCTA } from "./LevelProgress";

const SITE_URL = "https://france-finances.com";

/** Format duration in "Xmin Ys" */
function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds.toString().padStart(2, "0")}s`;
}

export function ResultScreen() {
  const router = useRouter();
  const { session, reset } = useGameStore(useShallow((s) => ({
    session: s.session,
    reset: s.reset,
  })));
  const { archetype, stats } = useArchetype();
  const [shareCopied, setShareCopied] = useState(false);
  const level = session?.level ?? 1;
  const isBudgetMode = session?.gameMode === "budget";
  const budgetTarget = session?.budgetTarget ?? 0;

  const keepCount = stats?.keepCount ?? 0;
  const cutCount = stats?.cutCount ?? 0;
  const reinforceCount = stats?.reinforceCount ?? 0;
  const unjustifiedCount = stats?.unjustifiedCount ?? 0;
  const keepPercent = Math.round(stats?.keepPercent ?? 0);
  const cutPercent = Math.round(stats?.cutPercent ?? 0);
  const reinforcePercent = stats && stats.totalCards > 0 ? Math.round((reinforceCount / stats.totalCards) * 100) : 0;
  const unjustifiedPercent = stats && stats.totalCards > 0 ? Math.round((unjustifiedCount / stats.totalCards) * 100) : 0;

  const handleShare = useCallback(async () => {
    if (!archetype || !stats) return;
    track("share_result", { archetype: archetype.id, platform: "native" });
    const title = `Mon profil budgétaire : ${archetype.name}`;
    const text = `${archetype.tagline} — J'ai tronçonné ${cutPercent}% du budget !`;
    const shareUrl = `${SITE_URL}/share?a=${archetype.id}&k=${keepPercent}&c=${cutPercent}&n=${stats.totalCards}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fallback below
      }
    }

    // Fallback: copy to clipboard
    const shareText = `${title}\n${text}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard not available
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }
  }, [archetype, keepPercent, cutPercent, stats]);

  // No session data — redirect to jeu
  if (!session || !session.completed || !stats || !archetype) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">Aucune session en cours.</p>
        <button
          onClick={() => router.push("/jeu")}
          className="min-h-[48px] rounded-2xl py-3 px-6 bg-brand text-white font-heading font-bold hover:bg-brand-hover transition-colors"
        >
          Jouer
        </button>
      </div>
    );
  }

  // Calculate totals by direction in Md€
  const totalKept = session.cards
    .filter((c) => session.votes.find((v) => v.cardId === c.id && (v.direction === "keep" || v.direction === "reinforce")))
    .reduce((sum, c) => sum + c.amountBillions, 0);
  const totalCut = session.cards
    .filter((c) => session.votes.find((v) => v.cardId === c.id && (v.direction === "cut" || v.direction === "unjustified")))
    .reduce((sum, c) => sum + c.amountBillions, 0);

  function handleContinue() {
    reset();
    router.push("/jeu");
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide" role="region" aria-live="polite" aria-label="Résultats de la session">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h2 className="kicker text-primary">
          Résultats · Niveau {level}
        </h2>
        <button
          onClick={handleContinue}
          aria-label="Fermer les résultats"
          className="min-h-[44px] min-w-[44px] -mr-1.5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-danger hover:text-white transition-colors"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {/* Archétype */}
      <section className="relative mx-4 mt-2 mb-2 rounded-3xl bg-card border border-primary/30 shadow-(--shadow-card) px-5 pt-6 pb-6 text-center">
        <span
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl ${cutPercent >= 50 ? "bg-danger/15" : "bg-primary/15 text-primary"}`}
          aria-hidden="true"
        >
          {cutPercent >= 50 ? <ChainsawIcon size={44} /> : <ShieldIcon size={44} />}
        </span>
        <div className="flex items-start justify-center gap-3">
          <p className="kicker text-primary">Ton profil budgétaire</p>
          <button
            onClick={handleShare}
            className="absolute top-3 right-3 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center bg-background/60 hover:bg-muted transition-colors text-muted-foreground"
            aria-label={shareCopied ? "Copié !" : "Partager les résultats"}
            aria-live="polite"
          >
            {shareCopied ? <span className="text-primary text-sm" aria-hidden="true">✓</span> : <ShareIcon />}
          </button>
        </div>
        <h1 className="text-4xl font-black leading-[1.05] mt-2 mb-3 text-brand-fg dark:text-foreground">
          {archetype.name}
        </h1>
        <p className="text-lg font-medium leading-snug text-muted-foreground">
          &laquo;&nbsp;{archetype.tagline}&nbsp;&raquo;
        </p>
        <p className="mt-4 text-sm text-muted-foreground tabular-nums">
          {stats.totalCards} cartes swipées en {formatDuration(session.totalDuration ?? 0)}
        </p>
      </section>

      {/* Répartition */}
      <section className="mx-4 my-2 rounded-2xl bg-card border border-border p-5" data-testid="result-stats">
        <h3 className="text-xl font-extrabold mb-4">Répartition des choix</h3>

        {level >= 2 ? (
          <div className="flex flex-col gap-3 mb-5">
            <StatBar
              icon={<ShieldIcon size={14} className="text-primary" />}
              label="Garder"
              count={keepCount}
              percent={keepPercent}
              colorClass="bg-primary"
            />
            <StatBar
              icon={<ChainsawIcon size={14} />}
              label="Réduire"
              count={cutCount}
              percent={cutPercent}
              colorClass="bg-warning"
            />
            <StatBar
              icon={<ReinforceIcon size={14} />}
              label="Renforcer"
              count={reinforceCount}
              percent={reinforcePercent}
              colorClass="bg-info"
            />
            <StatBar
              icon={<StopIcon size={14} />}
              label="Injustifié"
              count={unjustifiedCount}
              percent={unjustifiedPercent}
              colorClass="bg-danger"
            />
          </div>
        ) : (
          /* Level 1 : barre empilée 100 % (garder | à revoir) */
          <div className="mb-5">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full bg-primary" style={{ width: `${keepPercent}%` }} />
              <div className="h-full bg-danger" style={{ width: `${cutPercent}%` }} />
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <div>
                <p className="kicker flex items-center gap-1.5 text-primary">
                  <ShieldIcon size={14} /> Garder
                </p>
                <p className="numeral text-3xl text-primary">{formatPercent(keepPercent)}</p>
                <p className="text-xs text-muted-foreground">{keepCount} carte{keepCount > 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <p className="kicker flex items-center justify-end gap-1.5 text-danger">
                  <ChainsawIcon size={14} /> À revoir
                </p>
                <p className="numeral text-3xl text-danger">{formatPercent(cutPercent)}</p>
                <p className="text-xs text-muted-foreground">{cutCount} carte{cutCount > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Totaux en Md€ */}
        <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <dt className="kicker text-muted-foreground">Total gardé</dt>
            <dd className="numeral text-2xl text-primary">
              {formatBillions(totalKept)}
            </dd>
          </div>
          <div className="border-l border-border pl-4">
            <dt className="kicker text-muted-foreground">Total à revoir</dt>
            <dd className="numeral text-2xl text-danger">
              {formatBillions(totalCut)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Content-based reading: amounts and categories put into question */}
      <ContentProfilePanel session={session} />

      {/* Daily deck: streak + Wordle-like share */}
      {session.dailyKey && <DailyResultPanel session={session} />}

      {/* Radar: Tes choix vs la communauté (Level 2+) */}
      {level >= 2 && session.cards && (() => {
        const radarAxes = computeRadarFromSession(session.cards, session.votes);
        if (radarAxes.length < 3) return null;
        return (
          <section className="mx-4 my-2 rounded-2xl bg-card border border-border p-5">
            <h3 className="text-xl font-extrabold mb-1">
              Tes choix vs la communauté
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Part des coupes par catégorie
            </p>
            <RadarChart axes={radarAxes} size={240} />
          </section>
        );
      })()}

      {/* Budget Mode Result */}
      {isBudgetMode && budgetTarget > 0 && (
        <section className="mx-4 my-2 rounded-2xl bg-card border border-border p-5">
          <p className="kicker text-muted-foreground">Objectif d&apos;économies</p>
          <p className="font-heading text-xl font-extrabold mt-1 mb-3">
            {totalCut >= budgetTarget ? "Objectif atteint" : "Objectif non atteint"}
          </p>
          <div className="w-full bg-muted h-3 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${totalCut >= budgetTarget ? "bg-primary" : "bg-warning"}`}
              style={{ width: `${Math.min((totalCut / budgetTarget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm tabular-nums">
            <span className="font-semibold">{formatBillions(totalCut)}</span>
            <span className="text-muted-foreground"> sur {formatBillions(budgetTarget)} visés</span>
            {totalCut >= budgetTarget && (
              <span className="text-primary ml-2">
                (+{formatBillions(totalCut - budgetTarget)})
              </span>
            )}
          </p>
        </section>
      )}

      {isBudgetMode && budgetTarget > 0 && <BudgetChallengeSummary session={session} />}

      {/* Level 3: Audit Report */}
      {level === 3 && session.auditResponses && session.auditResponses.length > 0 && (
        <AuditReport cards={session.cards} auditResponses={session.auditResponses} />
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 px-4 py-6">
        {/* Niveau suivant : débloqué en jouant (pas par l'URL) */}
        <NextLevelCTA level={level} />
        <button
          onClick={() => router.push("/jeu")}
          className="flex items-center justify-center w-full min-h-[52px] rounded-2xl py-4 px-6 bg-card border border-border text-foreground font-heading font-bold hover:bg-muted transition-colors"
        >
          {level >= 2 ? `Nouveau deck Niveau ${level}` : "Continuer (nouveau deck)"}
        </button>
      </div>

      {/* Detailed History */}
      <div className="px-4 pb-10">
        <details className="group rounded-2xl bg-card border border-border px-4">
          <summary className="flex items-center justify-between gap-2 min-h-[44px] py-3 cursor-pointer font-medium text-sm list-none">
            <span className="flex items-center gap-2">
              <ChainsawIcon size={18} /> Voir le détail de mes choix
            </span>
            <ChevronIcon />
          </summary>
          <ol className="flex flex-col divide-y divide-border border-t border-border">
            {session.cards.map((card) => {
              const vote = session.votes.find((v) => v.cardId === card.id);
              return (
                <HistoryItem
                  key={card.id}
                  card={card}
                  vote={vote ?? null}
                />
              );
            })}
          </ol>
        </details>
      </div>
    </div>
  );
}

const VOTE_LABELS: Record<string, string> = {
  keep: "Garder",
  cut: "À revoir",
  reinforce: "Renforcer",
  unjustified: "Injustifié",
};

function HistoryItem({ card, vote }: { card: Card; vote: Vote | null }) {
  const dir = vote?.direction ?? "keep";

  const iconMap: Record<string, React.ReactNode> = {
    keep: <ShieldIcon size={16} className="text-primary" />,
    cut: <ChainsawIcon size={16} />,
    reinforce: <ReinforceIcon size={16} />,
    unjustified: <StopIcon size={16} />,
  };

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <CategoryBadge deckId={card.deckId} size={32} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{card.title}</span>
          <span className="text-xs font-semibold text-danger tabular-nums">
            {formatBillions(card.amountBillions)}
          </span>
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <span className="sr-only">{VOTE_LABELS[dir]}</span>
        {iconMap[dir]}
      </div>
    </li>
  );
}
