import { describe, it, expect } from "vitest";
import type { Card, Vote } from "@/types";
import { computeRadarFromSession, computeRadarFromHistory } from "@/lib/radarData";

function makeCard(id: string, deckId: string): Card {
  return {
    id,
    title: `Card ${id}`,
    subtitle: "Subtitle",
    description: "Description",
    amountBillions: 5.0,
    costPerCitizen: 74,
    deckId,
    icon: "🎯",
    source: "Test",
    level: 1,
    kind: "depense",
  };
}

function makeVote(cardId: string, direction: "keep" | "cut" | "unjustified" | "reinforce"): Vote {
  return { cardId, direction, duration: 2000, timestamp: Date.now() };
}

describe("computeRadarFromSession", () => {
  it("returns empty array when no votes match radar categories", () => {
    const cards = [makeCard("c1", "unknown_category")];
    const votes = [makeVote("c1", "cut")];
    const result = computeRadarFromSession(cards, votes);
    expect(result).toEqual([]);
  });

  it("computes cut percentage for a single category", () => {
    const cards = [
      makeCard("d1", "defense"),
      makeCard("d2", "defense"),
    ];
    const votes = [
      makeVote("d1", "cut"),
      makeVote("d2", "keep"),
    ];
    const result = computeRadarFromSession(cards, votes);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Défense");
    expect(result[0].playerValue).toBe(50); // 1 cut out of 2
  });

  it("treats unjustified as cut-like", () => {
    const cards = [makeCard("d1", "defense")];
    const votes = [makeVote("d1", "unjustified")];
    const result = computeRadarFromSession(cards, votes);

    expect(result[0].playerValue).toBe(100); // 1 unjustified out of 1
  });

  it("treats keep and reinforce as non-cut", () => {
    const cards = [
      makeCard("d1", "defense"),
      makeCard("d2", "defense"),
    ];
    const votes = [
      makeVote("d1", "keep"),
      makeVote("d2", "reinforce"),
    ];
    const result = computeRadarFromSession(cards, votes);

    expect(result[0].playerValue).toBe(0); // 0 cuts out of 2
  });

  it("includes community averages from defaults", () => {
    const cards = [makeCard("d1", "defense")];
    const votes = [makeVote("d1", "cut")];
    const result = computeRadarFromSession(cards, votes);

    expect(result[0].communityValue).toBe(45); // default for defense
  });

  it("uses custom community averages when provided", () => {
    const cards = [makeCard("d1", "defense")];
    const votes = [makeVote("d1", "cut")];
    const custom = { defense: 70 };
    const result = computeRadarFromSession(cards, votes, custom);

    expect(result[0].communityValue).toBe(70);
  });

  it("handles multiple categories", () => {
    const cards = [
      makeCard("d1", "defense"),
      makeCard("s1", "sante"),
      makeCard("s2", "sante"),
    ];
    const votes = [
      makeVote("d1", "cut"),
      makeVote("s1", "keep"),
      makeVote("s2", "cut"),
    ];
    const result = computeRadarFromSession(cards, votes);

    expect(result).toHaveLength(2);
    const defense = result.find((r) => r.label === "Défense")!;
    const sante = result.find((r) => r.label === "Santé")!;
    expect(defense.playerValue).toBe(100);
    expect(sante.playerValue).toBe(50);
  });

  it("skips votes for cards not in the cards array", () => {
    const cards = [makeCard("d1", "defense")];
    const votes = [
      makeVote("d1", "cut"),
      makeVote("missing", "cut"),
    ];
    const result = computeRadarFromSession(cards, votes);

    expect(result).toHaveLength(1);
    expect(result[0].playerValue).toBe(100);
  });

  it("returns empty array with no votes", () => {
    const result = computeRadarFromSession([], []);
    expect(result).toEqual([]);
  });
});

describe("computeRadarFromHistory", () => {
  it("returns empty array when no sessions match radar categories", () => {
    const sessions = [{ deckId: "unknown", keepCount: 5, cutCount: 5, totalCards: 10 }];
    const result = computeRadarFromHistory(sessions);
    expect(result).toEqual([]);
  });

  it("computes cut percentage from session history", () => {
    const sessions = [
      { deckId: "defense", keepCount: 6, cutCount: 4, totalCards: 10 },
    ];
    const result = computeRadarFromHistory(sessions);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Défense");
    expect(result[0].playerValue).toBe(40); // 4 cuts out of 10
  });

  it("aggregates across multiple sessions for same category", () => {
    const sessions = [
      { deckId: "defense", keepCount: 8, cutCount: 2, totalCards: 10 },
      { deckId: "defense", keepCount: 5, cutCount: 5, totalCards: 10 },
    ];
    const result = computeRadarFromHistory(sessions);

    // Total: 7 cuts out of 20 = 35%
    expect(result[0].playerValue).toBe(35);
  });

  it("uses custom community averages", () => {
    const sessions = [
      { deckId: "sante", keepCount: 5, cutCount: 5, totalCards: 10 },
    ];
    const result = computeRadarFromHistory(sessions, { sante: 80 });
    expect(result[0].communityValue).toBe(80);
  });

  it("handles multiple categories from history", () => {
    const sessions = [
      { deckId: "defense", keepCount: 5, cutCount: 5, totalCards: 10 },
      { deckId: "education", keepCount: 8, cutCount: 2, totalCards: 10 },
    ];
    const result = computeRadarFromHistory(sessions);

    expect(result).toHaveLength(2);
    const defense = result.find((r) => r.label === "Défense")!;
    const edu = result.find((r) => r.label === "Éducation")!;
    expect(defense.playerValue).toBe(50);
    expect(edu.playerValue).toBe(20);
  });

  it("returns empty for empty sessions array", () => {
    const result = computeRadarFromHistory([]);
    expect(result).toEqual([]);
  });
});
