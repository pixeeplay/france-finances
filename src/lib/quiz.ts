import type { Card } from "@/types";
import { createSeededRng, seededShuffle } from "./random";
import { formatBillions } from "./format";

/**
 * Mini-quiz "A ton avis, combien ?" : avant de reveler certaines cartes,
 * le joueur estime le montant parmi 4 propositions.
 */

/** Positions (index de carte) ou un quiz est propose, si la carte s'y prete */
export const QUIZ_POSITIONS: readonly number[] = [1, 5];
/** Taille minimale de session pour proposer des quiz */
export const QUIZ_MIN_CARDS = 6;
export const QUIZ_OPTION_COUNT = 4;

/** Facteurs d'echelle pour les mauvaises reponses (ordres de grandeur plausibles) */
const DISTRACTOR_FACTORS: readonly number[] = [0.1, 0.25, 0.5, 2, 4, 10];

/** Arrondi a 2 chiffres significatifs (12,345 -> 12 ; 0,0456 -> 0,046) */
export function roundSignificant(value: number, digits: number = 2): number {
  if (value === 0 || !Number.isFinite(value)) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

export function isQuizEligible(card: Card): boolean {
  return Number.isFinite(card.amountBillions) && card.amountBillions > 0;
}

/** Index des cartes de la session sur lesquelles poser un quiz */
export function getQuizIndexes(cards: readonly Card[]): number[] {
  if (cards.length < QUIZ_MIN_CARDS) return [];
  const result: number[] = [];
  for (const pos of QUIZ_POSITIONS) {
    // Si la carte prevue n'a pas de montant exploitable, on prend la suivante libre
    for (let i = pos; i < cards.length; i++) {
      if (!result.includes(i) && isQuizEligible(cards[i])) {
        result.push(i);
        break;
      }
    }
  }
  return result;
}

export interface QuizOption {
  /** Montant propose en Md€ */
  billions: number;
  label: string;
  correct: boolean;
}

/**
 * 4 propositions (la bonne + 3 ordres de grandeur differents), dans un ordre
 * deterministe pour une carte donnee.
 */
export function buildQuizOptions(card: Card): QuizOption[] {
  const rng = createSeededRng(`quiz:${card.id}`);
  const correctLabel = formatBillions(card.amountBillions);
  const options: QuizOption[] = [{ billions: card.amountBillions, label: correctLabel, correct: true }];
  const usedLabels = new Set([correctLabel]);

  for (const factor of seededShuffle(DISTRACTOR_FACTORS, rng)) {
    if (options.length >= QUIZ_OPTION_COUNT) break;
    const billions = roundSignificant(card.amountBillions * factor);
    const label = formatBillions(billions);
    if (billions <= 0 || usedLabels.has(label)) continue;
    usedLabels.add(label);
    options.push({ billions, label, correct: false });
  }
  return seededShuffle(options, rng);
}

// === Statistiques de comprehension ===

export interface QuizStats {
  answered: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
}

export const EMPTY_QUIZ_STATS: QuizStats = { answered: 0, correct: 0, currentStreak: 0, bestStreak: 0 };

export function applyQuizAnswer(stats: QuizStats, correct: boolean): QuizStats {
  const currentStreak = correct ? stats.currentStreak + 1 : 0;
  return {
    answered: stats.answered + 1,
    correct: stats.correct + (correct ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
  };
}
