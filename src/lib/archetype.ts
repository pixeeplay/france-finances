import type { Card, Vote, Archetype, Session, SessionStats, ArchetypeCondition } from "@/types";
import archetypesData from "@/data/archetypes.json";
import { isCutDirection } from "./sessionFeedback";

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

// === Profil de contenu (montants et categories) ===

export interface DeckBreakdown {
  deckId: string;
  cutBillions: number;
  keptBillions: number;
  cutCount: number;
  keptCount: number;
}

export interface ContentProfile {
  /** Montant total des cartes votees (Md€) */
  totalBillions: number;
  /** Montant remis en question : cut + unjustified (Md€) */
  cutBillions: number;
  /** Montant garde : keep + reinforce (Md€) */
  keptBillions: number;
  /** Part des montants remis en question (0-100) */
  cutAmountPercent: number;
  /** Detail par categorie, trie par montant remis en question decroissant */
  decks: DeckBreakdown[];
  /** Categorie la plus remise en question (en montant), null si aucune coupe */
  topCutDeck: DeckBreakdown | null;
  /** Categorie la plus protegee (en montant), null si rien garde */
  topKeptDeck: DeckBreakdown | null;
  /** Plus grosse depense remise en question / gardee */
  largestCut: Card | null;
  largestKept: Card | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Analyse le contenu d'une session : quels montants et quelles categories ont ete coupes. */
export function computeContentProfile(cards: readonly Card[], votes: readonly Vote[]): ContentProfile {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const decks = new Map<string, DeckBreakdown>();
  let cutBillions = 0;
  let keptBillions = 0;
  let largestCut: Card | null = null;
  let largestKept: Card | null = null;

  for (const vote of votes) {
    const card = byId.get(vote.cardId);
    if (!card) continue;
    const entry =
      decks.get(card.deckId) ??
      { deckId: card.deckId, cutBillions: 0, keptBillions: 0, cutCount: 0, keptCount: 0 };
    if (isCutDirection(vote.direction)) {
      cutBillions += card.amountBillions;
      entry.cutBillions += card.amountBillions;
      entry.cutCount++;
      if (!largestCut || card.amountBillions > largestCut.amountBillions) largestCut = card;
    } else {
      keptBillions += card.amountBillions;
      entry.keptBillions += card.amountBillions;
      entry.keptCount++;
      if (!largestKept || card.amountBillions > largestKept.amountBillions) largestKept = card;
    }
    decks.set(card.deckId, entry);
  }

  const list = [...decks.values()]
    .map((d) => ({ ...d, cutBillions: round1(d.cutBillions), keptBillions: round1(d.keptBillions) }))
    .sort((a, b) => b.cutBillions - a.cutBillions || a.deckId.localeCompare(b.deckId));
  const total = cutBillions + keptBillions;
  const topCut = list.find((d) => d.cutCount > 0) ?? null;
  const topKept =
    [...list].filter((d) => d.keptCount > 0).sort((a, b) => b.keptBillions - a.keptBillions)[0] ?? null;

  return {
    totalBillions: round1(total),
    cutBillions: round1(cutBillions),
    keptBillions: round1(keptBillions),
    cutAmountPercent: total > 0 ? (cutBillions / total) * 100 : 0,
    decks: list,
    topCutDeck: topCut,
    topKeptDeck: topKept,
    largestCut,
    largestKept,
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

/** Les conditions sur les montants ne s'evaluent qu'avec un profil de contenu */
function amountConditionOk(c: ExtendedCondition, profile: ContentProfile | undefined): boolean {
  const usesAmount = c.minCutAmountPercent !== undefined || c.maxCutAmountPercent !== undefined;
  if (!usesAmount) return true;
  if (!profile || profile.totalBillions <= 0) return false;
  const p = profile.cutAmountPercent;
  return (
    (c.minCutAmountPercent === undefined || p >= c.minCutAmountPercent) &&
    (c.maxCutAmountPercent === undefined || p <= c.maxCutAmountPercent)
  );
}

/**
 * Détermine l'archétype à partir des stats et, si fourni, du contenu de la session
 * (montants coupés). Les archétypes de contenu sont prioritaires (ordre du JSON).
 */
export function determineArchetype(
  stats: Omit<SessionStats, "archetype">,
  level: 1 | 2 | 3 = 1,
  profile?: ContentProfile
): Archetype {
  const archetypes = archetypesData.archetypes.filter(
    (a) => a.level === level
  ) as (Archetype & { condition: ExtendedCondition })[];

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

    const amountOk = amountConditionOk(c, profile);

    if (cutOk && keepOk && reinforceOk && unjustifiedOk && positiveOk && negativeOk && amountOk) {
      return archetype;
    }
  }

  // Speedrunner check last (so content-based archetypes take priority)
  const speedrunner = archetypes.find(
    (a) =>
      a.condition.maxDurationSeconds !== undefined &&
      amountConditionOk(a.condition, profile) &&
      stats.totalDurationSeconds <= a.condition.maxDurationSeconds
  );
  if (speedrunner) return speedrunner;

  // Fallback: return a balanced archetype matching the current level
  const fallbackIds: Record<number, string> = { 1: "equilibriste", 2: "stratege", 3: "auditeur_rigoureux" };
  return archetypes.find((a) => a.id === fallbackIds[level]) ?? archetypes.find((a) => a.level === level) ?? archetypes[0];
}

/** Stats + profil de contenu + archetype d'une session terminee (point d'entree unique). */
export function computeSessionResult(session: Pick<Session, "cards" | "votes" | "level" | "totalDuration">): {
  stats: Omit<SessionStats, "archetype">;
  profile: ContentProfile;
  archetype: Archetype;
} {
  const stats = computeStats(session.votes, session.totalDuration ?? 0);
  const profile = computeContentProfile(session.cards, session.votes);
  return { stats, profile, archetype: determineArchetype(stats, session.level, profile) };
}
