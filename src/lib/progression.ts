/**
 * Progression L1 -> L2 -> L3 debloquee par le jeu (et non plus par ?level=).
 *
 * Une session d'un niveau superieur compte aussi pour les paliers inferieurs :
 * un joueur ayant 2 sessions N2 a forcement de quoi debloquer le N2.
 */

export type GameLevel = 1 | 2 | 3;
export type LevelCounts = Record<GameLevel, number>;

export interface LevelRequirement {
  /** Niveau a jouer pour progresser */
  fromLevel: GameLevel;
  /** Nombre de sessions terminees requises a ce niveau (ou au-dessus) */
  sessions: number;
}

export const LEVEL_REQUIREMENTS: Record<2 | 3, LevelRequirement> = {
  2: { fromLevel: 1, sessions: 2 },
  3: { fromLevel: 2, sessions: 2 },
};

export const EMPTY_LEVEL_COUNTS: LevelCounts = { 1: 0, 2: 0, 3: 0 };

function isLevel(n: unknown): n is GameLevel {
  return n === 1 || n === 2 || n === 3;
}

/** Compte les sessions par niveau a partir de l'historique local */
export function countSessionsByLevel(sessions: readonly { level: number }[]): LevelCounts {
  const counts: LevelCounts = { ...EMPTY_LEVEL_COUNTS };
  for (const s of sessions) {
    if (isLevel(s.level)) counts[s.level]++;
  }
  return counts;
}

/**
 * Fusionne le compteur cumule (non purge) et l'historique (purge apres 30 jours) :
 * on garde le maximum par niveau.
 */
export function mergeLevelCounts(
  cumulative: Partial<Record<string, number>> | undefined,
  history: LevelCounts,
): LevelCounts {
  const read = (l: GameLevel) => {
    const v = cumulative?.[String(l)];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  };
  return {
    1: Math.max(read(1), history[1]),
    2: Math.max(read(2), history[2]),
    3: Math.max(read(3), history[3]),
  };
}

/** Sessions comptant pour un palier : celles du niveau requis ou au-dessus */
export function sessionsAtOrAbove(counts: LevelCounts, level: GameLevel): number {
  let total = 0;
  for (const l of [1, 2, 3] as const) if (l >= level) total += counts[l];
  return total;
}

export function isLevelUnlocked(counts: LevelCounts, level: GameLevel): boolean {
  if (level === 1) return true;
  const req = LEVEL_REQUIREMENTS[level];
  return isLevelUnlocked(counts, req.fromLevel) && sessionsAtOrAbove(counts, req.fromLevel) >= req.sessions;
}

export function computeUnlockedLevel(counts: LevelCounts): GameLevel {
  if (isLevelUnlocked(counts, 3)) return 3;
  if (isLevelUnlocked(counts, 2)) return 2;
  return 1;
}

export interface LevelProgress {
  level: 2 | 3;
  unlocked: boolean;
  done: number;
  required: number;
  remaining: number;
  /** Libelle court : "2 sessions N1" */
  label: string;
}

export function getLevelProgress(counts: LevelCounts, level: 2 | 3): LevelProgress {
  const req = LEVEL_REQUIREMENTS[level];
  const done = Math.min(sessionsAtOrAbove(counts, req.fromLevel), req.sessions);
  return {
    level,
    unlocked: isLevelUnlocked(counts, level),
    done,
    required: req.sessions,
    remaining: req.sessions - done,
    label: `${req.sessions} session${req.sessions > 1 ? "s" : ""} N${req.fromLevel}`,
  };
}

/** Niveau effectivement jouable pour une demande (?level=) */
export function resolvePlayableLevel(requested: GameLevel, unlocked: GameLevel): GameLevel {
  return requested <= unlocked ? requested : unlocked;
}

/**
 * Niveau debloque juste par la derniere session (pour l'annoncer), null sinon.
 * `before` = compteurs sans la session, `after` = avec.
 */
export function newlyUnlockedLevel(before: LevelCounts, after: LevelCounts): 2 | 3 | null {
  const a = computeUnlockedLevel(before);
  const b = computeUnlockedLevel(after);
  return b > a ? (b as 2 | 3) : null;
}
