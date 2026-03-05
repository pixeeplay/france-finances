import type { Card, Deck } from "@/types";

const REQUIRED_CARD_FIELDS: (keyof Card)[] = [
  "id", "title", "description", "amountBillions", "costPerCitizen", "deckId", "icon",
];

const REQUIRED_DECK_FIELDS: (keyof Deck)[] = [
  "id", "name", "description", "icon", "cardCount",
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate the entire decks.json dataset at load time */
export function validateDecksData(data: { decks: Deck[]; cards: Card[] }): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check decks
  for (const deck of data.decks) {
    for (const field of REQUIRED_DECK_FIELDS) {
      if (deck[field] === undefined || deck[field] === null || deck[field] === "") {
        errors.push(`Deck "${deck.id}": missing field "${field}"`);
      }
    }
  }

  // Check cards
  const deckIds = new Set(data.decks.map((d) => d.id));
  const cardIds = new Set<string>();

  for (const card of data.cards) {
    // Required fields
    for (const field of REQUIRED_CARD_FIELDS) {
      if (card[field] === undefined || card[field] === null || card[field] === "") {
        errors.push(`Card "${card.id}": missing field "${field}"`);
      }
    }

    // Duplicate IDs
    if (cardIds.has(card.id)) {
      errors.push(`Card "${card.id}": duplicate ID`);
    }
    cardIds.add(card.id);

    // Orphan cards
    if (!deckIds.has(card.deckId)) {
      errors.push(`Card "${card.id}": references unknown deck "${card.deckId}"`);
    }

    // Data sanity
    if (card.amountBillions < 0) {
      warnings.push(`Card "${card.id}": negative amountBillions (${card.amountBillions})`);
    }
    if (card.costPerCitizen < 0) {
      warnings.push(`Card "${card.id}": negative costPerCitizen (${card.costPerCitizen})`);
    }
  }

  // Card count mismatch
  for (const deck of data.decks) {
    const actual = data.cards.filter((c) => c.deckId === deck.id).length;
    if (actual !== deck.cardCount) {
      errors.push(`Deck "${deck.id}": cardCount=${deck.cardCount} but found ${actual} cards`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
