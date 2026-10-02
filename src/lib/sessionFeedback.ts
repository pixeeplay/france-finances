import type { Card, Vote, VoteDirection } from "@/types";

/** Compteurs agreges par carte, tels que renvoyes par GET /api/community */
export interface CardVoteCounts {
  keep: number;
  cut: number;
  reinforce: number;
  unjustified: number;
  total: number;
}

export type CommunityCounts = Record<string, CardVoteCounts>;

/** Nombre minimal de votes pour afficher un pourcentage communautaire */
export const MIN_COMMUNITY_VOTES = 5;

/** Sens general d'un vote : on garde (keep/reinforce) ou on remet en question (cut/unjustified) */
export type VoteSide = "keep" | "cut";

export function voteSide(direction: VoteDirection): VoteSide {
  return direction === "cut" || direction === "unjustified" ? "cut" : "keep";
}

export function isCutDirection(direction: VoteDirection): boolean {
  return voteSide(direction) === "cut";
}

/**
 * Somme (Md€) des cartes remises en question (cut + unjustified) dans une session.
 * Les votes dont la carte est inconnue sont ignores.
 */
export function computeCutBillions(cards: readonly Card[], votes: readonly Vote[]): number {
  const amounts = new Map(cards.map((c) => [c.id, c.amountBillions]));
  let total = 0;
  for (const vote of votes) {
    if (!isCutDirection(vote.direction)) continue;
    total += amounts.get(vote.cardId) ?? 0;
  }
  return Math.round(total * 100) / 100;
}

export interface CommunityAgreement {
  /** Pourcentage (0-100, arrondi) des votants du meme avis (meme "sens") */
  percent: number;
  /** Nombre de votes pris en compte */
  total: number;
}

/**
 * Pourcentage de la communaute du meme avis que le joueur sur une carte.
 * Compare par "sens" (garder vs remettre en question) pour rester comparable
 * entre les niveaux 1 (2 directions) et 2-3 (4 directions).
 * Retourne null si les donnees sont absentes ou trop peu nombreuses.
 */
export function communityAgreement(
  counts: CardVoteCounts | undefined,
  direction: VoteDirection,
  minVotes: number = MIN_COMMUNITY_VOTES,
): CommunityAgreement | null {
  if (!counts) return null;
  const total = counts.keep + counts.cut + counts.reinforce + counts.unjustified;
  if (total < minVotes || total <= 0) return null;
  const same =
    voteSide(direction) === "cut" ? counts.cut + counts.unjustified : counts.keep + counts.reinforce;
  return { percent: Math.round((same / total) * 100), total };
}

const billionsFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Formate un montant en milliards : 12.35 -> "12,4 Md€" */
export function formatBillions(value: number): string {
  return `${billionsFormatter.format(value)} Md€`;
}

/** Meme format que POST /api/sessions (ex. "def-01") */
const CARD_ID_REGEX = /^[a-z]{2,4}-\d{2,3}$/;
export const MAX_COMMUNITY_IDS = 50;

/**
 * Parse le parametre `ids` de GET /api/community ("def-01,san-02").
 * Retourne null s'il est absent, sinon la liste des ids valides (dedoublonnee, max 50).
 */
export function parseCommunityCardIds(raw: string | null): string[] | null {
  if (raw === null || raw.trim() === "") return null;
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => CARD_ID_REGEX.test(id));
  return [...new Set(ids)].slice(0, MAX_COMMUNITY_IDS);
}

/** Texte factuel optionnel sur l'evolution de la depense (champ trend) */
export function trendFact(card: Card): string | null {
  if (card.trend === undefined || !Number.isFinite(card.trend) || card.trend === 0) return null;
  const abs = billionsFormatter.format(Math.abs(card.trend));
  return card.trend > 0 ? `En hausse de ${abs} % sur 5 ans` : `En baisse de ${abs} % sur 5 ans`;
}
