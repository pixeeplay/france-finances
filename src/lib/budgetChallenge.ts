import type { Card, Vote } from "@/types";
import { isSpendingCard } from "./cardKind";
import { seededShuffle, type Rng } from "./random";
import { isCutDirection } from "./sessionFeedback";

/** Defi principal : "Trouve 50 Md€" */
export const BUDGET_CHALLENGE_TARGET = 50;
export const BUDGET_CHALLENGE_CARD_COUNT = 12;
export const BUDGET_TARGET_MIN = 1;
export const BUDGET_TARGET_MAX = 200;
/** Decks exclus : ils ne contiennent aucune depense (couper une recette n'est pas une economie) */
const EXCLUDED_DECKS: readonly string[] = ["recettes"];

/** Le mode budget a-t-il un sens pour ce deck ? (couper une recette n'est pas une economie) */
export function isBudgetEligibleDeck(deckId: string): boolean {
  return !EXCLUDED_DECKS.includes(deckId);
}

export interface BudgetChallengeConstraints {
  /** Aucune carte ne doit permettre d'atteindre l'objectif a elle seule */
  maxCardBillions: number;
  /** Le total des cartes tirees doit laisser de la marge de choix */
  minTotalBillions: number;
}

export function clampBudgetTarget(raw: unknown, fallback: number = 15): number {
  const n = typeof raw === "string" || typeof raw === "number" ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.max(Math.round(n), BUDGET_TARGET_MIN), BUDGET_TARGET_MAX);
}

export function budgetChallengeConstraints(target: number): BudgetChallengeConstraints {
  return {
    maxCardBillions: Math.max(2, Math.round(target * 0.4 * 10) / 10),
    minTotalBillions: Math.round(target * 1.6 * 10) / 10,
  };
}

function sum(cards: readonly Card[]): number {
  return cards.reduce((s, c) => s + c.amountBillions, 0);
}

/**
 * Tire les cartes d'un defi budgetaire : aucune carte ne depasse ~40 % de
 * l'objectif (pas de "coupe magique") et le total tire depasse l'objectif
 * d'au moins 60 % quand le deck le permet, pour qu'il y ait de vrais arbitrages.
 * Seules les depenses (`kind: "depense"`) sont tirees : ni recette, ni
 * indicateur (fraude estimee, dette, deficit...).
 */
export function drawBudgetChallengeCards(
  cards: readonly Card[],
  target: number,
  rng: Rng = Math.random,
  count: number = BUDGET_CHALLENGE_CARD_COUNT,
): Card[] {
  const { maxCardBillions, minTotalBillions } = budgetChallengeConstraints(target);
  const base = cards.filter((c) => isBudgetEligibleDeck(c.deckId) && isSpendingCard(c));
  // Deck sans depense (ex. recettes) : pas de defi possible, on tire quand meme
  // des cartes pour ne jamais produire une session vide
  if (base.length === 0) return seededShuffle(cards, rng).slice(0, count);

  const eligible = base.filter((c) => c.amountBillions > 0 && c.amountBillions <= maxCardBillions);
  // Deck trop pauvre (ex. une petite categorie) : on complete avec les plus petites cartes
  // restantes, pour ne laisser entrer une "coupe magique" qu'en dernier recours
  const pool =
    eligible.length >= count
      ? eligible
      : [
          ...eligible,
          ...base
            .filter((c) => !eligible.includes(c))
            .sort((a, b) => a.amountBillions - b.amountBillions)
            .slice(0, count - eligible.length),
        ];
  const shuffled = seededShuffle(pool, rng);
  const picked = shuffled.slice(0, count);
  const rest = shuffled.slice(count).sort((a, b) => b.amountBillions - a.amountBillions);

  // Echange les plus petites cartes contre les plus grosses restantes jusqu'a atteindre le total minimal
  let restIndex = 0;
  while (sum(picked) < minTotalBillions && restIndex < rest.length) {
    let smallest = 0;
    for (let i = 1; i < picked.length; i++) {
      if (picked[i].amountBillions < picked[smallest].amountBillions) smallest = i;
    }
    const candidate = rest[restIndex++];
    if (candidate.amountBillions <= picked[smallest].amountBillions) break;
    picked[smallest] = candidate;
  }
  return seededShuffle(picked, rng);
}

/** Nombre minimal de coupes pour atteindre l'objectif (glouton par montant decroissant, optimal ici). */
export function minimumCutsToReach(cards: readonly Card[], target: number): number | null {
  const sorted = [...cards].sort((a, b) => b.amountBillions - a.amountBillions);
  let total = 0;
  for (let i = 0; i < sorted.length; i++) {
    total += sorted[i].amountBillions;
    if (total >= target) return i + 1;
  }
  return null;
}

export interface BudgetChallengeResult {
  target: number;
  cutBillions: number;
  keptBillions: number;
  reached: boolean;
  /** Nombre de depenses remises en question */
  cardsCut: number;
  /** Nombre de coupes (dans l'ordre de jeu) necessaires pour franchir l'objectif, null si non atteint */
  cutsToTarget: number | null;
  /** Minimum theorique de coupes avec ces cartes, null si l'objectif etait impossible */
  minimumCuts: number | null;
  /** Depassement (Md€) au-dela de l'objectif, 0 sinon */
  overshootBillions: number;
  /** Reste a trouver (Md€), 0 si atteint */
  remainingBillions: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function evaluateBudgetChallenge(
  cards: readonly Card[],
  votes: readonly Vote[],
  target: number,
): BudgetChallengeResult {
  const byId = new Map(cards.map((c) => [c.id, c]));
  let cutBillions = 0;
  let keptBillions = 0;
  let cardsCut = 0;
  let cutsToTarget: number | null = null;

  for (const vote of votes) {
    const card = byId.get(vote.cardId);
    if (!card) continue;
    if (isCutDirection(vote.direction)) {
      cardsCut++;
      cutBillions += card.amountBillions;
      if (cutsToTarget === null && cutBillions >= target) cutsToTarget = cardsCut;
    } else {
      keptBillions += card.amountBillions;
    }
  }

  const reached = cutBillions >= target;
  return {
    target,
    cutBillions: round1(cutBillions),
    keptBillions: round1(keptBillions),
    reached,
    cardsCut,
    cutsToTarget,
    minimumCuts: minimumCutsToReach(cards, target),
    overshootBillions: reached ? round1(cutBillions - target) : 0,
    remainingBillions: reached ? 0 : round1(target - cutBillions),
  };
}
