import decksMeta from "@/data/decks-meta.json";

/**
 * Accès léger aux métadonnées des decks (sans charger les cartes).
 * Utilisable côté client (SwipeCard, ResultScreen...).
 */

/**
 * Nombre total de cartes du jeu, calculé à partir des `cardCount` des decks
 * (eux-mêmes vérifiés contre les fichiers de cartes par `data:check` et les tests).
 */
export const TOTAL_CARD_COUNT: number = decksMeta.decks.reduce(
  (sum, d) => sum + d.cardCount,
  0,
);

/** Nombre de catégories (decks principaux, hors decks thématiques). */
export const CATEGORY_COUNT: number = decksMeta.decks.filter(
  (d) => d.type !== "thematic",
).length;

/** Accroche commune : "379 cartes, 16 catégories". */
export const CARDS_AND_CATEGORIES = `${TOTAL_CARD_COUNT} cartes, ${CATEGORY_COUNT} catégories`;

const deckNames: Record<string, string> = Object.fromEntries(
  decksMeta.decks.map((d) => [d.id, d.name]),
);

/** Nom lisible d'un deck ("sante" -> "Santé"). Retombe sur l'id si inconnu. */
export function getDeckName(deckId: string): string {
  return deckNames[deckId] ?? deckId;
}

/**
 * Couleur d'accent de chaque catégorie (pastilles, pictogrammes, barres).
 * Reprend `decks-meta.json` en dédoublonnant les teintes partagées, pour
 * qu'une couleur désigne une seule catégorie.
 */
const DECK_COLOR_OVERRIDES: Record<string, string> = {
  etat: "#A16207",
  "france-europe": "#2563EB",
  zombies: "#F43F5E",
  ukraine: "#FACC15",
};

const deckColors: Record<string, string> = Object.fromEntries(
  decksMeta.decks.map((d) => [d.id, DECK_COLOR_OVERRIDES[d.id] ?? d.color]),
);

/** Couleur par défaut (deck inconnu, mode aléatoire). */
export const DEFAULT_DECK_COLOR = "#10B981";

/** Couleur d'accent d'un deck (hex). */
export function getDeckColor(deckId: string): string {
  return deckColors[deckId] ?? DEFAULT_DECK_COLOR;
}
