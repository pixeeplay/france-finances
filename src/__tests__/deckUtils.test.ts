import { describe, it, expect } from "vitest";
import { shuffle, drawCards, filterByDeck, getCardsByCategory, shuffleDeck, drawSession } from "@/lib/deckUtils";
import type { Card } from "@/types";

function makeCard(id: string, deckId: string = "defense"): Card {
  return {
    id,
    title: `Card ${id}`,
    subtitle: "Subtitle",
    description: "Description",
    amountBillions: 1.5,
    costPerCitizen: 22,
    deckId,
    icon: "🎯",
    source: "Test",
    level: 1,
  };
}

describe("shuffle", () => {
  it("returns a new array with the same elements", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original);

    expect(result).toHaveLength(original.length);
    expect(result.sort()).toEqual(original.sort());
  });

  it("does not mutate the original array", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);

    expect(original).toEqual(copy);
  });

  it("handles empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("handles single element", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("shuffleDeck is an alias for shuffle", () => {
    expect(shuffleDeck).toBe(shuffle);
  });
});

describe("drawCards", () => {
  const cards = Array.from({ length: 20 }, (_, i) => makeCard(`card-${i}`));

  it("draws the specified number of cards", () => {
    const drawn = drawCards(cards, 5);
    expect(drawn).toHaveLength(5);
  });

  it("defaults to 10 cards", () => {
    const drawn = drawCards(cards);
    expect(drawn).toHaveLength(10);
  });

  it("returns all cards if count exceeds deck size", () => {
    const smallDeck = cards.slice(0, 3);
    const drawn = drawCards(smallDeck, 10);
    expect(drawn).toHaveLength(3);
  });

  it("returns unique cards (no duplicates)", () => {
    const drawn = drawCards(cards, 10);
    const ids = drawn.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("drawSession is an alias for drawCards", () => {
    expect(drawSession).toBe(drawCards);
  });
});

describe("filterByDeck", () => {
  const cards = [
    makeCard("d1", "defense"),
    makeCard("d2", "defense"),
    makeCard("s1", "sante"),
    makeCard("e1", "education"),
  ];

  it("filters cards by deckId", () => {
    const result = filterByDeck(cards, "defense");
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.deckId === "defense")).toBe(true);
  });

  it("returns empty array for non-existent deck", () => {
    const result = filterByDeck(cards, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("returns empty for empty input", () => {
    expect(filterByDeck([], "defense")).toEqual([]);
  });
});

describe("getCardsByCategory", () => {
  it("is an alias for filterByDeck", () => {
    const cards = [makeCard("d1", "defense"), makeCard("s1", "sante")];
    const result = getCardsByCategory(cards, "defense");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d1");
  });
});
