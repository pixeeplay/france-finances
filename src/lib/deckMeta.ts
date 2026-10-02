import decksMeta from "@/data/decks-meta.json";

/**
 * Accès léger aux métadonnées des decks (sans charger les 369 cartes).
 * Utilisable côté client (SwipeCard, ResultScreen...).
 */
const deckNames: Record<string, string> = Object.fromEntries(
  decksMeta.decks.map((d) => [d.id, d.name]),
);

/** Nom lisible d'un deck ("sante" -> "Santé"). Retombe sur l'id si inconnu. */
export function getDeckName(deckId: string): string {
  return deckNames[deckId] ?? deckId;
}
