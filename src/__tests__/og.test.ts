import { describe, expect, it } from "vitest";
import archetypesData from "@/data/archetypes.json";
import decksData from "@/data";
import { DEFAULT_ARCHETYPE_ID, getArchetypeById, isArchetypeId } from "@/lib/archetypeNames";
import { TOTAL_CARD_COUNT } from "@/lib/deckMeta";
import { lighten, pickSampleCards, truncateLabel, withAlpha } from "@/lib/ogHelpers";
import type { Card } from "@/types";

function card(id: string, amountBillions: number): Card {
  return { id, amountBillions } as Card;
}

describe("ogHelpers", () => {
  it("lighten mélange avec le blanc", () => {
    expect(lighten("#000000", 0)).toBe("#ffffff");
    expect(lighten("#EF4444", 1)).toBe("#ef4444");
    expect(lighten("#000000", 0.5)).toBe("#808080");
  });

  it("withAlpha ajoute un canal alpha borné", () => {
    expect(withAlpha("#3B82F6", 0.2)).toBe("#3B82F633");
    expect(withAlpha("#3B82F6", 1)).toBe("#3B82F6ff");
    expect(withAlpha("#3B82F6", 2)).toBe("#3B82F6ff");
  });

  it("truncateLabel coupe au mot et ajoute une ellipse", () => {
    expect(truncateLabel("Court", 20)).toBe("Court");
    const out = truncateLabel("Les dépenses qui auraient dû mourir mais qui persistent", 30);
    expect(out.length).toBeLessThanOrEqual(30);
    expect(out.endsWith("…")).toBe(true);
    expect(out).toBe("Les dépenses qui auraient dû…");
  });

  it("pickSampleCards prend la plus grosse, la médiane et la plus petite carte chiffrée", () => {
    const cards = [card("a", 5), card("b", 0), card("c", 100), card("d", 0.03), card("e", 12), card("f", 40)];
    expect(pickSampleCards(cards).map((c) => c.id)).toEqual(["c", "e", "d"]);
    expect(pickSampleCards([card("x", 1), card("y", 0)]).map((c) => c.id)).toEqual(["x"]);
  });

  it("chaque deck a au moins une carte chiffrée à montrer", () => {
    for (const deck of decksData.decks) {
      const samples = pickSampleCards(decksData.cards.filter((c) => c.deckId === deck.id));
      expect(samples.length, deck.id).toBeGreaterThan(0);
    }
  });
});

describe("archetypeNames", () => {
  it("connaît tous les archétypes du jeu", () => {
    for (const a of archetypesData.archetypes) {
      expect(isArchetypeId(a.id)).toBe(true);
      expect(getArchetypeById(a.id).name).toBe(a.name);
    }
  });

  it("retombe sur l'archétype par défaut", () => {
    expect(isArchetypeId("inconnu")).toBe(false);
    expect(isArchetypeId(null)).toBe(false);
    expect(getArchetypeById("<script>").id).toBe(DEFAULT_ARCHETYPE_ID);
    expect(getArchetypeById(undefined).name).toBe("L'Équilibriste");
  });
});

describe("TOTAL_CARD_COUNT", () => {
  it("égale le nombre réel de cartes", () => {
    expect(TOTAL_CARD_COUNT).toBe(decksData.cards.length);
  });
});
