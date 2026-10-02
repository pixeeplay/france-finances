"use client";

import Link from "next/link";
import { useProgression } from "@/hooks/useProgression";
import {
  getLevelProgress,
  newlyUnlockedLevel,
  type GameLevel,
  type LevelCounts,
} from "@/lib/progression";

function levelHref(deckId: string | null, level: GameLevel): string {
  const base = deckId ? `/jeu/${deckId}` : "/jeu";
  return level > 1 ? `${base}?level=${level}` : base;
}

function remainingText(remaining: number, fromLevel: number): string {
  return `encore ${remaining} session${remaining > 1 ? "s" : ""} N${fromLevel}`;
}

/** Ecran affiche quand on demande un niveau pas encore debloque (ex. /jeu/defense?level=3) */
export function LevelLockedNotice({
  requestedLevel,
  unlockedLevel,
  counts,
  deckId,
}: {
  requestedLevel: 2 | 3;
  unlockedLevel: GameLevel;
  counts: LevelCounts;
  deckId: string;
}) {
  // Palier suivant a franchir : le niveau intermediaire s'il est lui aussi verrouille
  const nextLevel = Math.min(requestedLevel, unlockedLevel + 1) as 2 | 3;
  const progress = getLevelProgress(counts, nextLevel);
  const fromLevel = nextLevel - 1;
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center" data-testid="level-locked">
      <p className="kicker text-muted-foreground">Progression</p>
      <h1 className="-mt-2 text-3xl font-semibold leading-tight">Niveau {requestedLevel} verrouillé</h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px]">
        {nextLevel === requestedLevel
          ? "Il se débloque en jouant : "
          : `Débloquez d'abord le niveau ${nextLevel} : `}
        {progress.label} terminées ({progress.done}/{progress.required}),{" "}
        {remainingText(progress.remaining, fromLevel)}.
      </p>
      <div className="flex w-full max-w-[320px] flex-col gap-3">
        <Link
          href={levelHref(deckId, unlockedLevel)}
          className="flex min-h-[48px] items-center justify-center rounded-md bg-foreground px-6 font-semibold text-background hover:opacity-90 transition-opacity"
        >
          Jouer ce deck en niveau {unlockedLevel}
        </Link>
        <Link
          href="/jeu"
          className="flex min-h-[48px] items-center justify-center rounded-md border border-foreground/40 px-6 font-semibold hover:bg-muted transition-colors"
        >
          Choisir un autre deck
        </Link>
      </div>
    </main>
  );
}

/**
 * Appel a l'action de fin de session : passer au niveau suivant s'il est
 * debloque, sinon afficher ce qu'il reste a jouer.
 */
export function NextLevelCTA({ level }: { level: GameLevel }) {
  const progression = useProgression();
  if (level >= 3 || !progression) return null;
  const next = (level + 1) as 2 | 3;
  const progress = getLevelProgress(progression.counts, next);

  // Ce qu'etaient les compteurs avant la session qui vient de se terminer
  const before: LevelCounts = { ...progression.counts, [level]: Math.max(0, progression.counts[level] - 1) };
  const justUnlocked = newlyUnlockedLevel(before, progression.counts) === next;

  if (!progress.unlocked) {
    return (
      <div className="border-y border-border py-3" data-testid="next-level-progress">
        <p className="flex items-baseline justify-between gap-3">
          <span className="kicker text-muted-foreground">Niveau {next}</span>
          <span className="numeral text-base font-semibold">
            {progress.done}/{progress.required}
          </span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-[1px] bg-muted" aria-hidden="true">
          <div
            className="h-full bg-foreground/70"
            style={{ width: `${Math.min(100, (progress.done / Math.max(1, progress.required)) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Se débloque après {progress.required} sessions N{level} : {remainingText(progress.remaining, level)}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" data-testid="next-level-cta">
      {justUnlocked && (
        <p className="kicker text-center text-primary" role="status">
          Niveau {next} débloqué
        </p>
      )}
      <Link
        href={levelHref(null, next)}
        className="flex min-h-[48px] items-center justify-center gap-2 w-full rounded-md py-4 px-6 bg-foreground text-background font-semibold text-lg hover:opacity-90 transition-opacity"
      >
        Passer au Niveau {next}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
