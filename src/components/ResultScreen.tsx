"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useArchetype } from "@/hooks/useArchetype";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { ReinforceIcon } from "./ReinforceIcon";
import { StopIcon } from "./StopIcon";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
const RadarChart = dynamic(() => import("./RadarChart").then((m) => m.RadarChart), {
  ssr: false,
  loading: () => <div className="w-[240px] h-[240px] mx-auto rounded-full bg-muted/30 animate-pulse" />,
});
import { computeRadarFromSession } from "@/lib/radarData";
import type { Vote, Card } from "@/types";
import { AuditReport } from "./AuditReport";
import { StatBar } from "./StatBar";
import { ShareIcon } from "./ShareIcon";
import { ChevronIcon } from "./ChevronIcon";

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
  const prefersReducedMotion = useReducedMotion();
  const [showConfetti, setShowConfetti] = useState(!prefersReducedMotion);
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

  // Hide confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

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
          className="rounded-xl py-3 px-6 border-2 border-border text-foreground font-bold hover:bg-card transition-colors"
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
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
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
            <span className="confetti-particle absolute top-0 left-10 text-xl" aria-hidden="true">
              ✨
            </span>
            <span className="confetti-particle absolute top-4 right-12 text-2xl" aria-hidden="true">
              🎉
            </span>
            <span className="confetti-particle absolute top-2 left-1/3 text-lg" aria-hidden="true">
              🎊
            </span>
            <span className="confetti-particle absolute top-6 right-1/4 text-sm" aria-hidden="true">
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
            aria-label={shareCopied ? "Copié !" : "Partager les résultats"}
          >
            {shareCopied ? <span className="text-primary text-sm">✓</span> : <ShareIcon />}
          </button>
          <div className="text-6xl mb-4" aria-hidden="true">{archetype.icon}</div>
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

        <div className="bg-card rounded-2xl p-5 border border-border" data-testid="result-stats">
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
                glowClass="shadow-(--shadow-glow-green-sm)"
              />
              <StatBar
                icon={<ChainsawIcon size={14} />}
                label="Réduire"
                count={cutCount}
                percent={cutPercent}
                colorClass="bg-warning"
                glowClass="shadow-(--shadow-glow-amber)"
              />
              <StatBar
                icon={<ReinforceIcon size={14} />}
                label="Renforcer"
                count={reinforceCount}
                percent={reinforcePercent}
                colorClass="bg-info"
                glowClass="shadow-(--shadow-glow-blue)"
              />
              <StatBar
                icon={<StopIcon size={14} />}
                label="Injustifié"
                count={unjustifiedCount}
                percent={unjustifiedPercent}
                colorClass="bg-danger"
                glowClass="shadow-(--shadow-glow-red)"
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

      {/* Radar: Tes choix vs la communauté (Level 2+) */}
      {level >= 2 && session.cards && (() => {
        const radarAxes = computeRadarFromSession(session.cards, session.votes);
        if (radarAxes.length < 3) return null;
        return (
          <div className="px-4 py-2">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="text-base font-bold mb-1 text-center">
                Tes choix vs la communauté
              </h3>
              <p className="text-xs text-muted-foreground text-center mb-4">
                % de coupes par catégorie
              </p>
              <RadarChart axes={radarAxes} size={240} />
            </div>
          </div>
        );
      })()}

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
            onClick={() => router.push("/jeu?level=2")}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-4 px-6 bg-primary text-white font-bold text-lg shadow-(--shadow-glow-green) active:scale-95 transition-transform"
          >
            Passer au Niveau 2
            <span className="text-base">&#8594;</span>
          </button>
        )}
        {level === 2 && (
          <button
            onClick={() => router.push("/jeu?level=3")}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-4 px-6 bg-primary text-white font-bold text-lg shadow-(--shadow-glow-green) active:scale-95 transition-transform"
          >
            Passer au Niveau 3
            <span className="text-base">&#8594;</span>
          </button>
        )}
        <button
          onClick={() => router.push("/jeu")}
          className="flex items-center justify-center w-full rounded-xl py-4 px-6 border-2 border-border text-foreground font-bold hover:bg-card transition-colors"
        >
          {level >= 2 ? `Nouveau deck Niveau ${level}` : "Continuer (nouveau deck)"}
        </button>
      </div>

      {/* Detailed History */}
      <div className="px-4 pb-10">
        <details className="group bg-card rounded-xl border border-border overflow-hidden">
          <summary className="flex items-center justify-center gap-2 p-4 cursor-pointer font-medium text-sm hover:bg-muted/30 transition-colors list-none">
            <ChainsawIcon size={18} /> Voir le détail de mes choix
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
    reinforce: <ReinforceIcon size={16} />,
    unjustified: <StopIcon size={16} />,
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

