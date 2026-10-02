import { describe, it, expect } from "vitest";
import {
  communityAgreement,
  computeCutBillions,
  formatBillions,
  isCutDirection,
  parseCommunityCardIds,
  trendFact,
  voteSide,
} from "@/lib/sessionFeedback";
import { sanitizeCommunityResponse } from "@/hooks/useCommunityVotes";
import type { Card, Vote, VoteDirection } from "@/types";

function card(id: string, amountBillions: number, extra: Partial<Card> = {}): Card {
  return {
    id,
    title: id,
    subtitle: "",
    description: "",
    amountBillions,
    costPerCitizen: 0,
    deckId: "defense",
    icon: "",
    source: "test",
    level: 1,
    ...extra,
  };
}

function vote(cardId: string, direction: VoteDirection): Vote {
  return { cardId, direction, duration: 1000, timestamp: 0 };
}

describe("voteSide / isCutDirection", () => {
  it("groups cut and unjustified on the cut side", () => {
    expect(voteSide("cut")).toBe("cut");
    expect(voteSide("unjustified")).toBe("cut");
    expect(voteSide("keep")).toBe("keep");
    expect(voteSide("reinforce")).toBe("keep");
    expect(isCutDirection("unjustified")).toBe(true);
    expect(isCutDirection("reinforce")).toBe(false);
  });
});

describe("computeCutBillions", () => {
  const cards = [card("a", 10), card("b", 2.5), card("c", 0.33)];

  it("sums amounts of cut and unjustified votes only", () => {
    const votes = [vote("a", "cut"), vote("b", "keep"), vote("c", "unjustified")];
    expect(computeCutBillions(cards, votes)).toBe(10.33);
  });

  it("returns 0 without cut votes", () => {
    expect(computeCutBillions(cards, [vote("a", "keep"), vote("b", "reinforce")])).toBe(0);
    expect(computeCutBillions(cards, [])).toBe(0);
  });

  it("ignores votes on unknown cards", () => {
    expect(computeCutBillions(cards, [vote("zzz", "cut"), vote("b", "cut")])).toBe(2.5);
  });
});

describe("communityAgreement", () => {
  const counts = { keep: 6, cut: 3, reinforce: 0, unjustified: 1, total: 10 };

  it("returns the share of players on the same side", () => {
    expect(communityAgreement(counts, "keep")).toEqual({ percent: 60, total: 10 });
    expect(communityAgreement(counts, "cut")).toEqual({ percent: 40, total: 10 });
    expect(communityAgreement(counts, "unjustified")).toEqual({ percent: 40, total: 10 });
  });

  it("returns null when there is no data or not enough votes", () => {
    expect(communityAgreement(undefined, "keep")).toBeNull();
    expect(communityAgreement({ keep: 1, cut: 1, reinforce: 0, unjustified: 0, total: 2 }, "keep")).toBeNull();
    expect(communityAgreement({ keep: 0, cut: 0, reinforce: 0, unjustified: 0, total: 0 }, "keep", 0)).toBeNull();
  });

  it("honours a custom threshold", () => {
    expect(communityAgreement({ keep: 1, cut: 1, reinforce: 0, unjustified: 0, total: 2 }, "keep", 2)).toEqual({
      percent: 50,
      total: 2,
    });
  });
});

describe("formatBillions", () => {
  it("formats with a French decimal comma and at most one decimal", () => {
    expect(formatBillions(12.35)).toMatch(/^12,4 Md€$/);
    expect(formatBillions(3)).toMatch(/^3 Md€$/);
    expect(formatBillions(0)).toMatch(/^0 Md€$/);
  });
});

describe("trendFact", () => {
  it("describes rises and falls", () => {
    expect(trendFact(card("a", 1, { trend: 12.5 }))).toBe("En hausse de 12,5 % sur 5 ans");
    expect(trendFact(card("a", 1, { trend: -4 }))).toBe("En baisse de 4 % sur 5 ans");
  });

  it("returns null without a meaningful trend", () => {
    expect(trendFact(card("a", 1))).toBeNull();
    expect(trendFact(card("a", 1, { trend: 0 }))).toBeNull();
  });
});

describe("parseCommunityCardIds", () => {
  it("returns null when absent or empty", () => {
    expect(parseCommunityCardIds(null)).toBeNull();
    expect(parseCommunityCardIds("  ")).toBeNull();
  });

  it("keeps valid ids, dedupes and drops invalid ones", () => {
    expect(parseCommunityCardIds("def-01, san-02,def-01,DROP TABLE,x-1")).toEqual(["def-01", "san-02"]);
  });

  it("caps the list to 50 ids", () => {
    const raw = Array.from({ length: 80 }, (_, i) => `def-${String(i + 100)}`).join(",");
    expect(parseCommunityCardIds(raw)).toHaveLength(50);
  });
});

describe("sanitizeCommunityResponse", () => {
  it("keeps only well-formed entries", () => {
    const res = sanitizeCommunityResponse({
      "def-01": { keep: 1, cut: 2, reinforce: 0, unjustified: 0, total: 3 },
      "def-02": { keep: "x" },
    });
    expect(res).toEqual({ "def-01": { keep: 1, cut: 2, reinforce: 0, unjustified: 0, total: 3 } });
  });

  it("returns null for errors and non-objects", () => {
    expect(sanitizeCommunityResponse({ ok: false, error: "Database not configured" })).toBeNull();
    expect(sanitizeCommunityResponse(null)).toBeNull();
    expect(sanitizeCommunityResponse([1, 2])).toBeNull();
  });
});
