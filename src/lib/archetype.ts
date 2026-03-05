import type { Vote, Archetype, SessionStats, ArchetypeCondition } from "@/types";
import archetypesData from "@/data/archetypes.json";

/** Calcule les stats d'une session à partir des votes */
export function computeStats(
  votes: Vote[],
  totalDurationMs: number
): Omit<SessionStats, "archetype"> {
  const totalCards = votes.length;
  const keepCount = votes.filter((v) => v.direction === "keep").length;
  const cutCount = votes.filter((v) => v.direction === "cut").length;
  const reinforceCount = votes.filter((v) => v.direction === "reinforce").length;
  const unjustifiedCount = votes.filter((v) => v.direction === "unjustified").length;

  return {
    totalCards,
    keepCount,
    cutCount,
    reinforceCount,
    unjustifiedCount,
    keepPercent: totalCards > 0 ? (keepCount / totalCards) * 100 : 0,
    cutPercent: totalCards > 0 ? (cutCount / totalCards) * 100 : 0,
    totalDurationSeconds: totalDurationMs / 1000,
    averageDurationPerCard: totalCards > 0 ? totalDurationMs / 1000 / totalCards : 0,
  };
}

interface ExtendedCondition extends ArchetypeCondition {
  minReinforcePercent?: number;
  maxReinforcePercent?: number;
  minUnjustifiedPercent?: number;
  maxUnjustifiedPercent?: number;
  minPositivePercent?: number;
  minNegativePercent?: number;
}

/** Détermine l'archétype à partir des stats */
export function determineArchetype(
  stats: Omit<SessionStats, "archetype">,
  level: 1 | 2 | 3 = 1
): Archetype {
  const archetypes = archetypesData.archetypes.filter(
    (a) => a.level === level
  ) as (Archetype & { condition: ExtendedCondition })[];

  // Speedrunner check first
  const speedrunner = archetypes.find(
    (a) =>
      a.condition.maxDurationSeconds !== undefined &&
      stats.totalDurationSeconds <= a.condition.maxDurationSeconds
  );
  if (speedrunner) return speedrunner;

  const reinforcePercent = stats.totalCards > 0
    ? ((stats.reinforceCount ?? 0) / stats.totalCards) * 100
    : 0;
  const unjustifiedPercent = stats.totalCards > 0
    ? ((stats.unjustifiedCount ?? 0) / stats.totalCards) * 100
    : 0;
  const positivePercent = stats.keepPercent + reinforcePercent;
  const negativePercent = stats.cutPercent + unjustifiedPercent;

  for (const archetype of archetypes) {
    const c = archetype.condition;
    const cutOk =
      (c.minCutPercent === undefined || stats.cutPercent >= c.minCutPercent) &&
      (c.maxCutPercent === undefined || stats.cutPercent <= c.maxCutPercent);
    const keepOk =
      (c.minKeepPercent === undefined || stats.keepPercent >= c.minKeepPercent) &&
      (c.maxKeepPercent === undefined || stats.keepPercent <= c.maxKeepPercent);
    const reinforceOk =
      (c.minReinforcePercent === undefined || reinforcePercent >= c.minReinforcePercent) &&
      (c.maxReinforcePercent === undefined || reinforcePercent <= c.maxReinforcePercent);
    const unjustifiedOk =
      (c.minUnjustifiedPercent === undefined || unjustifiedPercent >= c.minUnjustifiedPercent) &&
      (c.maxUnjustifiedPercent === undefined || unjustifiedPercent <= c.maxUnjustifiedPercent);
    const positiveOk =
      c.minPositivePercent === undefined || positivePercent >= c.minPositivePercent;
    const negativeOk =
      c.minNegativePercent === undefined || negativePercent >= c.minNegativePercent;

    if (cutOk && keepOk && reinforceOk && unjustifiedOk && positiveOk && negativeOk) {
      return archetype;
    }
  }

  // Fallback
  return archetypes.find((a) => a.id === "equilibriste" || a.id === "stratege") ?? archetypes[0];
}
