"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useArchetype } from "@/hooks/useArchetype";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { track } from "@/lib/analytics";
import type { Vote, Card, AuditRecommendation } from "@/types";

const SITE_URL = "https://nicoquipaie.pixeeplay.fr";

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
  const session = useGameStore((s) => s.session);
  const reset = useGameStore((s) => s.reset);
  const { archetype, stats } = useArchetype();
  const [showConfetti, setShowConfetti] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const level = session?.level ?? 1;
  const isBudgetMode = session?.gameMode === "budget";
  const budgetTarget = session?.budgetTarget ?? 0;

  // Hide confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // No session data — redirect to play
  if (!session || !session.completed || !stats || !archetype) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">Aucune session en cours.</p>
        <button
          onClick={() => router.push("/play")}
          className="rounded-xl py-3 px-6 border-2 border-border text-foreground font-bold hover:bg-card transition-colors"
        >
          Jouer
        </button>
      </div>
    );
  }

  const keepCount = stats.keepCount;
  const cutCount = stats.cutCount;
  const reinforceCount = stats.reinforceCount ?? 0;
  const unjustifiedCount = stats.unjustifiedCount ?? 0;
  const keepPercent = Math.round(stats.keepPercent);
  const cutPercent = Math.round(stats.cutPercent);
  const reinforcePercent = stats.totalCards > 0 ? Math.round((reinforceCount / stats.totalCards) * 100) : 0;
  const unjustifiedPercent = stats.totalCards > 0 ? Math.round((unjustifiedCount / stats.totalCards) * 100) : 0;

  // Calculate totals by direction in Md€
  const totalKept = session.cards
    .filter((c) => session.votes.find((v) => v.cardId === c.id && v.direction === "keep"))
    .reduce((sum, c) => sum + c.amountBillions, 0);
  const totalCut = session.cards
    .filter((c) => session.votes.find((v) => v.cardId === c.id && v.direction === "cut"))
    .reduce((sum, c) => sum + c.amountBillions, 0);

  function handleContinue() {
    reset();
    router.push("/play");
  }

  const handleShare = useCallback(async () => {
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

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
          Résultats
        </h2>
        <button
          onClick={handleContinue}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:bg-danger hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Title & Confetti */}
      <div className="relative px-4 text-center pb-3 pt-6">
        {showConfetti && (
          <>
            <span className="confetti-particle absolute top-0 left-10 text-xl">
              ✨
            </span>
            <span className="confetti-particle absolute top-4 right-12 text-2xl">
              🎉
            </span>
            <span className="confetti-particle absolute top-2 left-1/3 text-lg">
              🎊
            </span>
            <span className="confetti-particle absolute top-6 right-1/4 text-sm">
              ✨
            </span>
          </>
        )}
        <h1 className="text-primary tracking-tight text-3xl font-bold leading-tight drop-shadow-md">
          Session terminée !
        </h1>
      </div>

      {/* Archetype Card */}
      <div className="p-4">
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-xl bg-card border border-border">
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            title={shareCopied ? "Copié !" : "Partager"}
          >
            {shareCopied ? <span className="text-primary text-sm">✓</span> : <ShareIcon />}
          </button>
          <div className="text-6xl mb-4">{archetype.icon}</div>
          <p className="text-2xl font-bold leading-tight tracking-tight mb-2">
            {archetype.name}
          </p>
          <p className="text-muted-foreground text-center text-sm font-medium">
            &ldquo;{archetype.tagline}&rdquo;
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-2">
        <p className="text-center text-sm font-medium text-muted-foreground mb-6">
          {stats.totalCards} cartes swipées en{" "}
          {formatDuration(session.totalDuration ?? 0)}
        </p>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <p className="text-base font-bold mb-4 text-center">
            Répartition des choix
          </p>

          {level >= 2 ? (
            /* Level 2: 4-bar layout */
            <div className="flex flex-col gap-3 mb-4">
              <StatBar
                icon={<ShieldIcon size={14} className="text-primary" />}
                label="OK"
                count={keepCount}
                percent={keepPercent}
                colorClass="bg-primary"
                glowClass="shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
              <StatBar
                icon={<ChainsawIcon size={14} />}
                label="Réduire"
                count={cutCount}
                percent={cutPercent}
                colorClass="bg-warning"
                glowClass="shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              />
              <StatBar
                icon={<span className="text-sm">📈</span>}
                label="Renforcer"
                count={reinforceCount}
                percent={reinforcePercent}
                colorClass="bg-info"
                glowClass="shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
              <StatBar
                icon={<span className="text-sm">❌</span>}
                label="Injustifié"
                count={unjustifiedCount}
                percent={unjustifiedPercent}
                colorClass="bg-danger"
                glowClass="shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
            </div>
          ) : (
            /* Level 1: donut chart */
            <div className="flex items-center justify-center gap-6 mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--color-danger) 0% ${cutPercent}%, var(--color-primary) ${cutPercent}% 100%)`,
                }}
              >
                <div className="w-16 h-16 bg-card rounded-full" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-bold">{keepPercent}%</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShieldIcon size={14} /> OK ({keepCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-sm font-bold">{cutPercent}%</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ChainsawIcon size={14} /> À revoir ({cutCount})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Totals kept/cut */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Total gardé
              </p>
              <p className="text-lg font-bold text-primary">
                {totalKept.toFixed(1)} Md€
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Total à revoir
              </p>
              <p className="text-lg font-bold text-danger">
                {totalCut.toFixed(1)} Md€
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Mode Result */}
      {isBudgetMode && budgetTarget > 0 && (
        <div className="px-4 py-2">
          <div className={`rounded-2xl p-5 border ${
            totalCut >= budgetTarget
              ? "bg-primary/10 border-primary/30"
              : "bg-danger/10 border-danger/30"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{totalCut >= budgetTarget ? "\u2705" : "\u274C"}</span>
              <div>
                <p className="text-lg font-bold">
                  {totalCut >= budgetTarget ? "Objectif atteint !" : "Objectif non atteint"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cible : {budgetTarget} Md&euro; d&apos;economies
                </p>
              </div>
            </div>
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  totalCut >= budgetTarget ? "bg-primary" : "bg-warning"
                }`}
                style={{ width: `${Math.min((totalCut / budgetTarget) * 100, 100)}%` }}
              />
            </div>
            <p className="text-center text-sm font-bold">
              {totalCut.toFixed(1)} / {budgetTarget} Md&euro;
              {totalCut >= budgetTarget && (
                <span className="text-primary ml-2">
                  (+{(totalCut - budgetTarget).toFixed(1)} Md&euro;)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Level 3: Audit Report */}
      {level === 3 && session.auditResponses && session.auditResponses.length > 0 && (
        <AuditReport cards={session.cards} auditResponses={session.auditResponses} />
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 px-4 py-6 mt-2">
        {level === 1 && (
          <button
            onClick={() => router.push("/play?level=2")}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-4 px-6 bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
          >
            Passer au Niveau 2
            <span className="text-base">&#8594;</span>
          </button>
        )}
        {level === 2 && (
          <button
            onClick={() => router.push("/play?level=3")}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-4 px-6 bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
          >
            Passer au Niveau 3
            <span className="text-base">&#8594;</span>
          </button>
        )}
        <button
          onClick={() => router.push("/play")}
          className="flex items-center justify-center w-full rounded-xl py-4 px-6 border-2 border-border text-foreground font-bold hover:bg-card transition-colors"
        >
          {level >= 2 ? `Nouveau deck Niveau ${level}` : "Continuer (nouveau deck)"}
        </button>
      </div>

      {/* Detailed History */}
      <div className="px-4 pb-10">
        <details className="group bg-card rounded-xl border border-border overflow-hidden">
          <summary className="flex items-center justify-center gap-2 p-4 cursor-pointer font-medium text-sm hover:bg-muted/30 transition-colors list-none">
            <ChainsawIcon size={18} /> Voir le detail de mes choix
            <ChevronIcon />
          </summary>
          <div className="p-4 border-t border-border bg-background/30 flex flex-col gap-3">
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
          </div>
        </details>
      </div>
    </div>
  );
}

function HistoryItem({ card, vote }: { card: Card; vote: Vote | null }) {
  const dir = vote?.direction ?? "keep";

  const iconMap: Record<string, React.ReactNode> = {
    keep: <ShieldIcon size={16} className="text-primary group-hover/item:text-white transition-colors" />,
    cut: <ChainsawIcon size={16} className="chainsaw-hover-white" />,
    reinforce: <span className="text-sm">📈</span>,
    unjustified: <span className="text-sm">❌</span>,
  };

  const hoverBgMap: Record<string, string> = {
    keep: "group-hover/item:bg-primary",
    cut: "group-hover/item:bg-danger",
    reinforce: "group-hover/item:bg-info",
    unjustified: "group-hover/item:bg-danger",
  };

  return (
    <div className="group/item flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-background/50 flex items-center justify-center text-xl">
          {card.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{card.title}</span>
          <span className="text-[10px] text-muted-foreground">
            {card.amountBillions} Md€
          </span>
        </div>
      </div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover/item:scale-110 ${hoverBgMap[dir]}`}
      >
        {iconMap[dir]}
      </div>
    </div>
  );
}

function StatBar({ icon, label, count, percent, colorClass, glowClass }: {
  icon: ReactNode;
  label: string;
  count: number;
  percent: number;
  colorClass: string;
  glowClass: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span>{count} carte{count > 1 ? "s" : ""}</span>
      </div>
      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full ${glowClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-open:rotate-180 transition-transform"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const recommendationLabels: Record<AuditRecommendation, string> = {
  keep: "Maintenir le budget",
  reduce: "Reduire de moitie",
  externalize: "Externaliser",
  merge: "Fusionner",
  reinforce: "Renforcer (+15%)",
  delete: "Suppression totale",
};

const recommendationColors: Record<AuditRecommendation, string> = {
  keep: "text-muted-foreground",
  reduce: "text-warning",
  externalize: "text-info",
  merge: "text-info",
  reinforce: "text-primary",
  delete: "text-danger",
};

const recommendationIcons: Record<AuditRecommendation, string> = {
  keep: "\uD83D\uDEE1\uFE0F",
  reduce: "\uD83E\uDE9A",
  externalize: "\uD83D\uDD04",
  merge: "\uD83D\uDD00",
  reinforce: "\uD83D\uDCC8",
  delete: "\u274C",
};

function AuditReport({ cards, auditResponses }: {
  cards: Card[];
  auditResponses: { cardId: string; diagnostics: Record<string, boolean>; recommendation: AuditRecommendation }[];
}) {
  // Count by recommendation type
  const counts: Record<string, number> = {};
  for (const r of auditResponses) {
    counts[r.recommendation] = (counts[r.recommendation] || 0) + 1;
  }

  // Estimate savings
  let totalSavings = 0;
  for (const r of auditResponses) {
    const card = cards.find((c) => c.id === r.cardId);
    if (!card) continue;
    if (r.recommendation === "reduce") totalSavings += card.amountBillions * 0.5;
    else if (r.recommendation === "delete") totalSavings += card.amountBillions;
    else if (r.recommendation === "reinforce") totalSavings -= card.amountBillions * 0.15;
  }

  const savingsPerCitizen = Math.round((totalSavings * 1e9) / 68e6);

  const summaryItems = [
    { label: "reductions", count: (counts["reduce"] || 0), color: "text-warning border-warning/20 bg-warning/10" },
    { label: "suppressions", count: (counts["delete"] || 0), color: "text-danger border-danger/20 bg-danger/10" },
    { label: "fusions", count: (counts["merge"] || 0) + (counts["externalize"] || 0), color: "text-info border-info/20 bg-info/10" },
    { label: "renforcees", count: (counts["reinforce"] || 0) + (counts["keep"] || 0), color: "text-primary border-primary/20 bg-primary/10" },
  ].filter((s) => s.count > 0);

  return (
    <div className="px-4 py-2 space-y-4">
      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold">
          Sur {auditResponses.length} depenses auditees :
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm font-medium">
          {summaryItems.map((s) => (
            <span
              key={s.label}
              className={`flex items-center justify-center px-2.5 py-1.5 rounded-md border text-center ${s.color}`}
            >
              {s.count} {s.label}
            </span>
          ))}
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex items-start gap-3">
          <span className="text-2xl">{"\uD83D\uDCB0"}</span>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">Impact estime</p>
            <p className="text-lg font-bold text-primary font-mono tracking-tight">
              {totalSavings >= 0 ? "-" : "+"}{Math.abs(totalSavings).toFixed(1)} Md&euro; {totalSavings >= 0 ? "d'economies" : "d'investissement"}
            </p>
            <p className="text-sm font-medium text-primary/80">
              soit ~{Math.abs(savingsPerCitizen)}&euro; / contribuable
            </p>
          </div>
        </div>
      </div>

      {/* Detail per card */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Detail du rapport
        </h3>
        <div className="flex flex-col gap-2">
          {auditResponses.map((r) => {
            const card = cards.find((c) => c.id === r.cardId);
            if (!card) return null;
            const rec = r.recommendation as AuditRecommendation;
            return (
              <div key={r.cardId} className="bg-card border border-border p-3 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background text-xl shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight line-clamp-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{card.amountBillions} Md&euro;</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-background text-muted-foreground">
                    Prescription:
                  </span>
                  <span className={`text-xs font-bold ${recommendationColors[rec]}`}>
                    {recommendationIcons[rec]} {recommendationLabels[rec]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
