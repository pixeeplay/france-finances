import { describe, it, expect } from "vitest";
import decksData from "@/data";
import { CARDS_AND_CATEGORIES, CATEGORY_COUNT, TOTAL_CARD_COUNT } from "@/lib/deckMeta";

describe("deckMeta : compteurs calculés", () => {
  it("TOTAL_CARD_COUNT correspond au nombre réel de cartes", () => {
    expect(TOTAL_CARD_COUNT).toBe(decksData.cards.length);
  });

  it("CATEGORY_COUNT compte les decks principaux, hors thématiques", () => {
    const main = decksData.decks.filter((d) => d.type !== "thematic");
    expect(CATEGORY_COUNT).toBe(main.length);
    expect(CATEGORY_COUNT).toBe(16);
  });

  it("CARDS_AND_CATEGORIES reprend les deux compteurs", () => {
    expect(CARDS_AND_CATEGORIES).toBe(`${TOTAL_CARD_COUNT} cartes, ${CATEGORY_COUNT} catégories`);
  });
});
