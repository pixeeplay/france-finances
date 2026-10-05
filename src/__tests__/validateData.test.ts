import { describe, it, expect } from "vitest";
import type { Card, Deck } from "@/types";
import { validateDecksData } from "@/lib/validateData";

function makeDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: "defense",
    name: "Défense",
    description: "Budget de la défense",
    icon: "⚔️",
    color: "#EF4444",
    cardCount: 1,
    ...overrides,
  };
}

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "def-01",
    title: "Armée de terre",
    subtitle: "Sous-titre",
    description: "Description",
    amountBillions: 5.0,
    costPerCitizen: 74,
    deckId: "defense",
    icon: "🎯",
    source: "PLF 2025",
    level: 1,
    kind: "depense",
    ...overrides,
  };
}

describe("validateDecksData", () => {
  it("returns valid for correct data", () => {
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [makeCard()],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects missing required deck fields", () => {
    const result = validateDecksData({
      decks: [makeDeck({ name: "" })],
      cards: [makeCard()],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing field "name"'))).toBe(true);
  });

  it("detects missing required card fields", () => {
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [makeCard({ title: "" })],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing field "title"'))).toBe(true);
  });

  it("detects duplicate card IDs", () => {
    const result = validateDecksData({
      decks: [makeDeck({ cardCount: 2 })],
      cards: [makeCard(), makeCard()],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicate ID"))).toBe(true);
  });

  it("detects orphan cards referencing unknown decks", () => {
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [makeCard({ deckId: "nonexistent" })],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("unknown deck"))).toBe(true);
  });

  it("detects card count mismatch", () => {
    const result = validateDecksData({
      decks: [makeDeck({ cardCount: 5 })],
      cards: [makeCard()],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("cardCount=5 but found 1"))).toBe(true);
  });

  it("warns about missing recommended fields", () => {
    const card = makeCard({ source: "", subtitle: "" });
    // source and subtitle are empty strings which are falsy
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [card],
    });

    expect(result.warnings.some((w) => w.includes("source"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("subtitle"))).toBe(true);
  });

  it("warns about missing level", () => {
    const card = makeCard();
    // @ts-expect-error testing undefined level
    delete card.level;
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [card],
    });

    expect(result.warnings.some((w) => w.includes("level"))).toBe(true);
  });

  it("warns about negative amountBillions", () => {
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [makeCard({ amountBillions: -1 })],
    });

    expect(result.warnings.some((w) => w.includes("negative amountBillions"))).toBe(true);
  });

  it("warns about negative costPerCitizen", () => {
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [makeCard({ costPerCitizen: -5 })],
    });

    expect(result.warnings.some((w) => w.includes("negative costPerCitizen"))).toBe(true);
  });

  it("validates multiple decks and cards correctly", () => {
    const result = validateDecksData({
      decks: [
        makeDeck({ id: "defense", cardCount: 2 }),
        makeDeck({ id: "sante", name: "Santé", cardCount: 1 }),
      ],
      cards: [
        makeCard({ id: "def-01", deckId: "defense" }),
        makeCard({ id: "def-02", deckId: "defense" }),
        makeCard({ id: "san-01", deckId: "sante" }),
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports errors but not warnings for validity", () => {
    // Missing source is a warning, not an error
    const card = makeCard({ source: "" });
    const result = validateDecksData({
      decks: [makeDeck()],
      cards: [card],
    });

    expect(result.valid).toBe(true); // warnings don't affect validity
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
