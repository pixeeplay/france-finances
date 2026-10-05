import type { Card, VoteDirection } from "@/types";
import legacyPool from "@/data/daily-legacy-pool.json";
import { isSpendingCard } from "./cardKind";
import { createSeededRng, seededShuffle } from "./random";

/** Identifiant de route du deck du jour : /jeu/quotidien */
export const DAILY_DECK_ID = "quotidien";
export const DAILY_CARD_COUNT = 10;
/** Jour n°1 du deck du jour (sert a numeroter les tirages) */
export const DAILY_EPOCH = "2026-10-01";
export const DAILY_TIMEZONE = "Europe/Paris";
/**
 * Decks sans aucune depense (toutes leurs cartes sont des recettes) : absents
 * de la mosaique de l'image de partage. Le tirage, lui, filtre carte par carte
 * sur `kind` (voir drawDailyCards).
 */
export const DAILY_EXCLUDED_DECKS: readonly string[] = ["recettes"];
/** Nombre maximal de resultats conserves en local */
const MAX_STORED_RESULTS = 60;

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Dates (cle "YYYY-MM-DD" dans le fuseau Europe/Paris)
// ---------------------------------------------------------------------------

/** Date du jour a Paris au format "YYYY-MM-DD" (meme cle pour tous les joueurs). */
export function getParisDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isValidDateKey(key: string): boolean {
  if (!DATE_KEY_REGEX.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function keyToUtc(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Nombre de jours de `from` a `to` (negatif si `to` est avant). */
export function daysBetween(from: string, to: string): number {
  return Math.round((keyToUtc(to) - keyToUtc(from)) / DAY_MS);
}

/** Numero du deck du jour (#1 = DAILY_EPOCH). */
export function getDailyNumber(key: string): number {
  return daysBetween(DAILY_EPOCH, key) + 1;
}

// ---------------------------------------------------------------------------
// Tirage deterministe
// ---------------------------------------------------------------------------

/**
 * Premier jour ou le tirage ne garde que les depenses (`kind`). Avant cette
 * date, le tirage reste celui qui etait en ligne (pool fige dans
 * `src/data/daily-legacy-pool.json`) : un deck du jour ne doit jamais changer
 * pour un numero deja servi, meme si l'on deploie en cours de journee.
 * Regle : cette date doit etre posterieure au jour du deploiement (le lendemain).
 */
export const DAILY_KIND_FILTER_FROM = "2026-10-06";

const LEGACY_POOL_IDS: ReadonlySet<string> = new Set(legacyPool.ids);

/** Cartes eligibles au tirage d'une date donnee. */
function dailyPool(cards: readonly Card[], dateKey: string): Card[] {
  if (dateKey < DAILY_KIND_FILTER_FROM) {
    // Ancien tirage : cartes jouables hors deck recettes au moment du gel,
    // y compris celles passees hors jeu depuis
    return cards.filter((c) => LEGACY_POOL_IDS.has(c.id));
  }
  return cards.filter((c) => c.playable !== false && isSpendingCard(c));
}

/**
 * Tire les cartes du jour : meme resultat pour une meme date, quel que soit
 * l'ordre des cartes en entree. Au plus une carte par deck tant que possible
 * pour varier les categories. Seules les depenses jouables sont tirees : une
 * recette ou un indicateur (fraude estimee, dette...) n'est pas une depense a
 * "tronconner".
 *
 * `cards` doit contenir aussi les cartes hors jeu (`playable: false`) pour que
 * les tirages anterieurs a DAILY_KIND_FILTER_FROM restent identiques ; elles
 * sont ecartees des tirages suivants.
 */
export function drawDailyCards(
  cards: readonly Card[],
  dateKey: string,
  count: number = DAILY_CARD_COUNT,
): Card[] {
  const pool = dailyPool(cards, dateKey).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const shuffled = seededShuffle(pool, createSeededRng(`daily:${dateKey}`));

  const picked: Card[] = [];
  const usedDecks = new Set<string>();
  for (const card of shuffled) {
    if (picked.length >= count) break;
    if (usedDecks.has(card.deckId)) continue;
    usedDecks.add(card.deckId);
    picked.push(card);
  }
  for (const card of shuffled) {
    if (picked.length >= count) break;
    if (!picked.includes(card)) picked.push(card);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Serie de jours
// ---------------------------------------------------------------------------

export interface DailyResult {
  dateKey: string;
  /** Votes dans l'ordre des cartes */
  directions: VoteDirection[];
  /** Montant remis en question (Md€) */
  cutBillions: number;
  /** Montant total des cartes du jour (Md€) */
  totalBillions: number;
}

export interface DailyProgress {
  lastPlayedDate: string | null;
  currentStreak: number;
  bestStreak: number;
  results: Record<string, DailyResult>;
}

export const INITIAL_DAILY_PROGRESS: DailyProgress = {
  lastPlayedDate: null,
  currentStreak: 0,
  bestStreak: 0,
  results: {},
};

/**
 * Enregistre le resultat d'un jour. Seule la premiere partie du jour compte
 * (rejouer ne modifie ni le resultat ni la serie).
 */
export function applyDailyResult(progress: DailyProgress, result: DailyResult): DailyProgress {
  if (!isValidDateKey(result.dateKey) || progress.results[result.dateKey]) return progress;

  const last = progress.lastPlayedDate;
  // Resultat d'un jour anterieur au dernier joue (horloge modifiee) : archive sans toucher a la serie
  if (last && daysBetween(last, result.dateKey) < 0) {
    return { ...progress, results: pruneResults({ ...progress.results, [result.dateKey]: result }) };
  }

  const continues = last !== null && daysBetween(last, result.dateKey) === 1;
  const currentStreak = continues ? progress.currentStreak + 1 : 1;
  return {
    lastPlayedDate: result.dateKey,
    currentStreak,
    bestStreak: Math.max(progress.bestStreak, currentStreak),
    results: pruneResults({ ...progress.results, [result.dateKey]: result }),
  };
}

function pruneResults(results: Record<string, DailyResult>): Record<string, DailyResult> {
  const keys = Object.keys(results).sort();
  if (keys.length <= MAX_STORED_RESULTS) return results;
  const kept = keys.slice(-MAX_STORED_RESULTS);
  return Object.fromEntries(kept.map((k) => [k, results[k]]));
}

/** Serie encore valable aujourd'hui (jouee aujourd'hui ou hier), sinon 0. */
export function getActiveStreak(progress: DailyProgress, todayKey: string): number {
  if (!progress.lastPlayedDate) return 0;
  const gap = daysBetween(progress.lastPlayedDate, todayKey);
  return gap === 0 || gap === 1 ? progress.currentStreak : 0;
}

// ---------------------------------------------------------------------------
// Partage facon Wordle
// ---------------------------------------------------------------------------

const SHARE_SQUARES: Record<VoteDirection, string> = {
  cut: "\u{1F7E5}", // carre rouge
  keep: "\u{1F7E9}", // carre vert
  reinforce: "\u{1F7E6}", // carre bleu
  unjustified: "\u{1F7E7}", // carre orange
};

export function directionsToSquares(directions: readonly VoteDirection[]): string {
  return directions.map((d) => SHARE_SQUARES[d]).join("");
}

const shareNumber = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function buildDailyShareText(params: {
  result: DailyResult;
  streak: number;
  url: string;
}): string {
  const { result, streak, url } = params;
  const lines = [
    `Budget Swipe, deck du jour n°${getDailyNumber(result.dateKey)}`,
    directionsToSquares(result.directions),
    `Remis en question : ${shareNumber.format(result.cutBillions)} Md€ sur ${shareNumber.format(result.totalBillions)} Md€`,
  ];
  if (streak > 1) lines.push(`Série : ${streak} jours`);
  lines.push(url);
  return lines.join("\n");
}
