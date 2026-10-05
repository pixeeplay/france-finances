import { describe, it, expect } from "vitest";
import {
  BUDGET_CHALLENGE_CARD_COUNT,
  BUDGET_CHALLENGE_TARGET,
  budgetChallengeConstraints,
  clampBudgetTarget,
  drawBudgetChallengeCards,
  evaluateBudgetChallenge,
  isBudgetEligibleDeck,
  minimumCutsToReach,
} from "@/lib/budgetChallenge";
import { createSeededRng } from "@/lib/random";
import decksData from "@/data";
import type { Card, Vote, VoteDirection } from "@/types";

const allCards = decksData.cards as Card[];

function card(id: string, amountBillions: number, deckId = "defense", kind: Card["kind"] = "depense"): Card {
  return {
    id,
    title: id,
    subtitle: "",
    description: "",
    amountBillions,
    costPerCitizen: 0,
    deckId,
    icon: "",
    source: "test",
    level: 1,
    kind,
  };
}

function vote(cardId: string, direction: VoteDirection): Vote {
  return { cardId, direction, duration: 0, timestamp: 0 };
}

describe("clampBudgetTarget", () => {
  it("parses and clamps", () => {
    expect(clampBudgetTarget("50")).toBe(50);
    expect(clampBudgetTarget("9999")).toBe(200);
    expect(clampBudgetTarget("abc")).toBe(15);
    expect(clampBudgetTarget(undefined)).toBe(15);
    expect(clampBudgetTarget("-3")).toBe(15);
    expect(clampBudgetTarget("0.4")).toBe(1);
  });
});

describe("budgetChallengeConstraints", () => {
  it("caps cards at 40% of the target and requires 160% in total", () => {
    expect(budgetChallengeConstraints(50)).toEqual({ maxCardBillions: 20, minTotalBillions: 80 });
    expect(budgetChallengeConstraints(1).maxCardBillions).toBe(2);
  });
});

describe("drawBudgetChallengeCards", () => {
  it("draws a challenge where no single card reaches 50 Md€ and the target is reachable", () => {
    for (let seed = 0; seed < 25; seed++) {
      const cards = drawBudgetChallengeCards(allCards, BUDGET_CHALLENGE_TARGET, createSeededRng(`s${seed}`));
      expect(cards).toHaveLength(BUDGET_CHALLENGE_CARD_COUNT);
      expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
      expect(cards.every((c) => c.amountBillions <= 20 && c.amountBillions > 0)).toBe(true);
      expect(cards.every((c) => c.deckId !== "recettes")).toBe(true);
      expect(cards.every((c) => c.kind === "depense")).toBe(true);
      const total = cards.reduce((s, c) => s + c.amountBillions, 0);
      expect(total).toBeGreaterThanOrEqual(80);
    }
  });

  it("is reproducible with a seeded rng", () => {
    const a = drawBudgetChallengeCards(allCards, 50, createSeededRng("x")).map((c) => c.id);
    const b = drawBudgetChallengeCards(allCards, 50, createSeededRng("x")).map((c) => c.id);
    expect(a).toEqual(b);
  });

  it("swaps small cards for bigger ones to reach the minimum total", () => {
    const pool = [
      ...Array.from({ length: 12 }, (_, i) => card(`sml-${i}`, 1)),
      ...Array.from({ length: 6 }, (_, i) => card(`big-${i}`, 15)),
    ];
    const cards = drawBudgetChallengeCards(pool, 50, createSeededRng("swap"));
    const total = cards.reduce((s, c) => s + c.amountBillions, 0);
    expect(total).toBeGreaterThanOrEqual(80);
  });

  it("falls back to every spending card when the deck is too small", () => {
    const pool = [
      card("a-01", 100),
      card("b-01", 3),
      card("rec-01", 5, "recettes", "recette"),
      card("eta-04", 10, "etat", "agregat"),
      card("col-11", 4, "collectivites", "recette"),
    ];
    const cards = drawBudgetChallengeCards(pool, 50, createSeededRng("small"));
    expect(cards.map((c) => c.id).sort()).toEqual(["a-01", "b-01"]);
  });

  it("completes a small deck with the smallest oversized cards, not the biggest", () => {
    const pool = [
      ...Array.from({ length: 5 }, (_, i) => card(`sml-${i}`, 2)),
      ...Array.from({ length: 10 }, (_, i) => card(`big-${i}`, 30 + i * 10)),
    ];
    const cards = drawBudgetChallengeCards(pool, 50, createSeededRng("small-deck"));
    expect(cards).toHaveLength(BUDGET_CHALLENGE_CARD_COUNT);
    const ids = cards.map((c) => c.id);
    for (let i = 0; i < 5; i++) expect(ids).toContain(`sml-${i}`);
    // the 7 smallest oversized cards (30..90), never the 3 biggest (100, 110, 120)
    expect(Math.max(...cards.map((c) => c.amountBillions))).toBe(90);
  });

  it("never returns an empty session on an excluded deck (recettes)", () => {
    const recettes = allCards.filter((c) => c.deckId === "recettes");
    expect(recettes.length).toBeGreaterThan(0);
    const cards = drawBudgetChallengeCards(recettes, 20, createSeededRng("rec"));
    expect(cards).toHaveLength(Math.min(BUDGET_CHALLENGE_CARD_COUNT, recettes.length));
  });
});

describe("isBudgetEligibleDeck", () => {
  it("excludes revenue decks only", () => {
    expect(isBudgetEligibleDeck("recettes")).toBe(false);
    expect(isBudgetEligibleDeck("defense")).toBe(true);
    expect(isBudgetEligibleDeck("random")).toBe(true);
  });
});

describe("minimumCutsToReach", () => {
  it("counts the fewest cards needed", () => {
    const cards = [card("a", 10), card("b", 30), card("c", 25), card("d", 5)];
    expect(minimumCutsToReach(cards, 50)).toBe(2);
    expect(minimumCutsToReach(cards, 70)).toBe(4);
    expect(minimumCutsToReach(cards, 71)).toBeNull();
  });
});

describe("evaluateBudgetChallenge", () => {
  const cards = [card("a", 20), card("b", 15), card("c", 18), card("d", 4), card("e", 10)];

  it("reports when and how the target was reached", () => {
    const votes = [vote("d", "cut"), vote("a", "cut"), vote("b", "keep"), vote("e", "unjustified"), vote("c", "cut")];
    const r = evaluateBudgetChallenge(cards, votes, 50);
    expect(r.reached).toBe(true);
    expect(r.cutBillions).toBe(52);
    expect(r.keptBillions).toBe(15);
    expect(r.cardsCut).toBe(4);
    expect(r.cutsToTarget).toBe(4);
    expect(r.minimumCuts).toBe(3);
    expect(r.overshootBillions).toBe(2);
    expect(r.remainingBillions).toBe(0);
  });

  it("reports the remaining amount when missed", () => {
    const r = evaluateBudgetChallenge(cards, [vote("a", "cut"), vote("b", "keep")], 50);
    expect(r.reached).toBe(false);
    expect(r.cutsToTarget).toBeNull();
    expect(r.remainingBillions).toBe(30);
    expect(r.overshootBillions).toBe(0);
  });

  it("ignores votes on unknown cards", () => {
    const r = evaluateBudgetChallenge(cards, [vote("zzz", "cut")], 50);
    expect(r.cardsCut).toBe(0);
  });
});
