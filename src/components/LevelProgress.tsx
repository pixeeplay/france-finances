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
      <h1 className="text-xl font-bold">Niveau {requestedLevel} verrouillé</h1>
      <p className="text-sm text-muted-foreground max-w-[320px]">
        {nextLevel === requestedLevel
          ? "Il se débloque en jouant : "
          : `Débloquez d'abord le niveau ${nextLevel} : `}
        {progress.label} terminées ({progress.done}/{progress.required}),{" "}
        {remainingText(progress.remaining, fromLevel)}.
      </p>
      <div className="flex w-full max-w-[320px] flex-col gap-3">
        <Link
          href={levelHref(deckId, unlockedLevel)}
          className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
        >
          Jouer ce deck en niveau {unlockedLevel}
        </Link>
        <Link
          href="/jeu"
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-foreground/40 px-6 font-semibold"
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
      <p
        className="rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground"
        data-testid="next-level-progress"
      >
        Niveau {next} : {progress.done}/{progress.required} sessions N{level},{" "}
        {remainingText(progress.remaining, level)} pour le débloquer.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2" data-testid="next-level-cta">
      {justUnlocked && (
        <p className="text-center text-sm font-bold text-primary" role="status">
          Niveau {next} débloqué
        </p>
      )}
      <Link
        href={levelHref(null, next)}
        className="flex min-h-[44px] items-center justify-center gap-2 w-full rounded-lg py-4 px-6 bg-primary text-primary-foreground font-semibold text-lg active:scale-[0.98] transition-transform"
      >
        Passer au Niveau {next}
        <span className="text-base" aria-hidden="true">
          &#8594;
        </span>
      </Link>
    </div>
  );
}
