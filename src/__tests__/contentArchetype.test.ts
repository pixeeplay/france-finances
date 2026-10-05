import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import {
  computeContentProfile,
  computeSessionResult,
  computeStats,
  determineArchetype,
} from "@/lib/archetype";
import { ContentProfilePanel } from "@/components/ContentProfilePanel";
import archetypesData from "@/data/archetypes.json";
import type { Card, Session, Vote, VoteDirection } from "@/types";

function card(id: string, amountBillions: number, deckId = "defense"): Card {
  return {
    id,
    title: `Carte ${id}`,
    subtitle: "",
    description: "",
    amountBillions,
    costPerCitizen: 0,
    deckId,
    icon: "",
    source: "test",
    level: 1,
    kind: "depense",
  };
}

function votesFor(cards: Card[], directions: VoteDirection[]): Vote[] {
  return directions.map((direction, i) => ({ cardId: cards[i].id, direction, duration: 5000, timestamp: i }));
}

function session(cards: Card[], directions: VoteDirection[], level: 1 | 2 | 3 = 1): Session {
  return {
    id: "s",
    deckId: "random",
    level,
    gameMode: "classic",
    cards,
    votes: votesFor(cards, directions),
    currentIndex: cards.length - 1,
    startedAt: 0,
    completed: true,
    totalDuration: 120_000,
  };
}

// 10 cards: 2 big (100 Md€), 8 small (1 Md€)
const mixed: Card[] = [
  card("big-01", 100, "sante"),
  card("big-02", 100, "social"),
  ...Array.from({ length: 8 }, (_, i) => card(`sml-0${i}`, 1, i < 4 ? "culture" : "defense")),
];

describe("computeContentProfile", () => {
  it("sums amounts by side and by deck", () => {
    const p = computeContentProfile(
      mixed,
      votesFor(mixed, ["cut", "keep", "cut", "cut", "keep", "keep", "unjustified", "keep", "keep", "keep"]),
    );
    expect(p.totalBillions).toBe(208);
    expect(p.cutBillions).toBe(103);
    expect(p.keptBillions).toBe(105);
    expect(p.cutAmountPercent).toBeCloseTo((103 / 208) * 100);
    expect(p.topCutDeck?.deckId).toBe("sante");
    expect(p.topKeptDeck?.deckId).toBe("social");
    expect(p.largestCut?.id).toBe("big-01");
    expect(p.largestKept?.id).toBe("big-02");
    const culture = p.decks.find((d) => d.deckId === "culture");
    expect(culture).toMatchObject({ cutCount: 2, keptCount: 2, cutBillions: 2, keptBillions: 2 });
  });

  it("ignores revenue and indicator cards", () => {
    const cards = [
      card("dep-01", 10),
      { ...card("eta-04", 100, "etat"), kind: "agregat" as const },
      { ...card("rec-01", 200, "recettes"), kind: "recette" as const },
    ];
    const p = computeContentProfile(cards, votesFor(cards, ["keep", "cut", "cut"]));
    expect(p.totalBillions).toBe(10);
    expect(p.cutBillions).toBe(0);
    expect(p.largestCut).toBeNull();
    expect(p.decks.map((d) => d.deckId)).toEqual(["defense"]);
  });

  it("handles empty sessions and unknown cards", () => {
    const p = computeContentProfile(mixed, [{ cardId: "nope", direction: "cut", duration: 0, timestamp: 0 }]);
    expect(p.totalBillions).toBe(0);
    expect(p.cutAmountPercent).toBe(0);
    expect(p.topCutDeck).toBeNull();
    expect(p.largestKept).toBeNull();
  });
});

describe("content-based archetypes", () => {
  it("declares the two new level-1 archetypes first", () => {
    const l1 = archetypesData.archetypes.filter((a) => a.level === 1).map((a) => a.id);
    expect(l1.slice(0, 2)).toEqual(["bucheron", "elagueur"]);
  });

  it("Bûcheron: few cuts, but on the biggest amounts", () => {
    // 2 cuts out of 10 (20 %) but 200 / 208 Md€
    const s = session(mixed, ["cut", "cut", "keep", "keep", "keep", "keep", "keep", "keep", "keep", "keep"]);
    expect(computeSessionResult(s).archetype.id).toBe("bucheron");
  });

  it("Élagueur: many cuts, only small amounts", () => {
    // 8 cuts out of 10 (80 %) but 8 / 208 Md€
    const s = session(mixed, ["keep", "keep", "cut", "cut", "cut", "cut", "cut", "cut", "cut", "cut"]);
    expect(computeSessionResult(s).archetype.id).toBe("elagueur");
  });

  it("the same percentages give a different archetype depending on the amounts", () => {
    const even = Array.from({ length: 10 }, (_, i) => card(`eq-0${i}`, 10));
    const directions: VoteDirection[] = ["cut", "cut", "cut", "cut", "cut", "cut", "cut", "cut", "keep", "keep"];
    expect(computeSessionResult(session(even, directions)).archetype.id).toBe("austeritaire");
    expect(computeSessionResult(session(mixed, ["keep", "keep", ...directions.slice(0, 8)])).archetype.id).toBe(
      "elagueur",
    );
  });

  it("keeps percentage-only behaviour without a content profile", () => {
    const stats = computeStats(votesFor(mixed, Array(10).fill("cut") as VoteDirection[]), 120_000);
    expect(determineArchetype(stats, 1).id).toBe("austeritaire");
    const few = computeStats(
      votesFor(mixed, ["cut", "cut", "keep", "keep", "keep", "keep", "keep", "keep", "keep", "keep"]),
      120_000,
    );
    expect(determineArchetype(few, 1).id).toBe("gardien");
  });

  it("computes the archetype on spending cards only", () => {
    const directions: VoteDirection[] = ["keep", "keep", "cut", "keep", "keep", "keep", "keep", "keep", "keep", "keep"];
    const base = computeSessionResult(session(mixed, directions));
    const others: Card[] = [
      { ...card("eta-04", 100, "etat"), kind: "agregat" },
      { ...card("eta-10", 150, "etat"), kind: "agregat" },
      { ...card("rec-01", 200, "recettes"), kind: "recette" },
      { ...card("rec-02", 100, "recettes"), kind: "recette" },
    ];
    const withOthers = computeSessionResult(
      session([...mixed, ...others], [...directions, "cut", "cut", "cut", "cut"]),
    );
    expect(withOthers.archetype.id).toBe(base.archetype.id);
    expect(withOthers.profile.totalBillions).toBe(base.profile.totalBillions);
    // Les stats affichées portent toujours sur toutes les cartes votées
    expect(withOthers.stats.totalCards).toBe(14);
    expect(withOthers.stats.cutCount).toBe(5);
  });

  it("does not apply level-1 content archetypes to other levels", () => {
    const s = session(mixed, ["cut", "cut", "keep", "keep", "keep", "keep", "keep", "keep", "keep", "keep"], 2);
    expect(computeSessionResult(s).archetype.level).toBe(2);
  });
});

describe("ContentProfilePanel", () => {
  it("summarises amounts and categories", () => {
    const s = session(mixed, ["cut", "keep", "keep", "keep", "keep", "keep", "keep", "keep", "keep", "keep"]);
    render(createElement(ContentProfilePanel, { session: s }));
    const panel = screen.getByTestId("content-profile");
    expect(panel).toHaveTextContent("10 % des cartes");
    expect(panel).toHaveTextContent("48 % des dépenses en jeu");
    expect(panel).toHaveTextContent("Santé");
    expect(panel).toHaveTextContent("Carte big-01");
  });
});
