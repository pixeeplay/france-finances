"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useArchetype } from "@/hooks/useArchetype";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import type { Vote, Card } from "@/types";

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
  const keepPercent = Math.round(stats.keepPercent);
  const cutPercent = Math.round(stats.cutPercent);

  // Calculate totals kept/cut in Md€
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
          <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
            <ShareIcon />
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
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Donut chart via conic-gradient */}
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

      {/* CTAs */}
      <div className="flex flex-col gap-3 px-4 py-6 mt-2">
        <button
          disabled
          className="flex items-center justify-center gap-2 w-full rounded-xl py-4 px-6 bg-primary/40 text-primary-foreground/60 font-bold text-lg cursor-not-allowed"
        >
          Passer au Niveau 2
          <span className="text-base">🔒</span>
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center justify-center w-full rounded-xl py-4 px-6 border-2 border-border text-foreground font-bold hover:bg-card transition-colors"
        >
          Continuer (nouveau deck)
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
  const isKeep = vote?.direction === "keep";

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
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isKeep
            ? "group-hover/item:bg-primary group-hover/item:scale-110"
            : "group-hover/item:bg-danger group-hover/item:scale-110"
        }`}
      >
        {isKeep ? (
          <ShieldIcon size={16} className="text-primary group-hover/item:text-white transition-colors" />
        ) : (
          <ChainsawIcon size={16} className="chainsaw-hover-white" />
        )}
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
