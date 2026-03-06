import { describe, it, expect } from "vitest";
import { computeStats, determineArchetype } from "@/lib/archetype";
import type { Vote, SessionStats } from "@/types";

// Helper to create votes quickly
function makeVotes(directions: Array<"keep" | "cut" | "reinforce" | "unjustified">): Vote[] {
  return directions.map((direction, i) => ({
    cardId: `card-${i}`,
    direction,
    duration: 2000,
    timestamp: Date.now() + i * 2000,
  }));
}

describe("computeStats", () => {
  it("computes correct stats for all-keep votes", () => {
    const votes = makeVotes(["keep", "keep", "keep", "keep", "keep"]);
    const stats = computeStats(votes, 10000);

    expect(stats.totalCards).toBe(5);
    expect(stats.keepCount).toBe(5);
    expect(stats.cutCount).toBe(0);
    expect(stats.reinforceCount).toBe(0);
    expect(stats.unjustifiedCount).toBe(0);
    expect(stats.keepPercent).toBe(100);
    expect(stats.cutPercent).toBe(0);
    expect(stats.totalDurationSeconds).toBe(10);
    expect(stats.averageDurationPerCard).toBe(2);
  });

  it("computes correct stats for mixed votes", () => {
    const votes = makeVotes(["keep", "cut", "reinforce", "unjustified", "keep"]);
    const stats = computeStats(votes, 15000);

    expect(stats.totalCards).toBe(5);
    expect(stats.keepCount).toBe(2);
    expect(stats.cutCount).toBe(1);
    expect(stats.reinforceCount).toBe(1);
    expect(stats.unjustifiedCount).toBe(1);
    expect(stats.keepPercent).toBe(40);
    expect(stats.cutPercent).toBe(20);
    expect(stats.totalDurationSeconds).toBe(15);
    expect(stats.averageDurationPerCard).toBe(3);
  });

  it("handles empty votes array", () => {
    const stats = computeStats([], 0);

    expect(stats.totalCards).toBe(0);
    expect(stats.keepCount).toBe(0);
    expect(stats.cutCount).toBe(0);
    expect(stats.keepPercent).toBe(0);
    expect(stats.cutPercent).toBe(0);
    expect(stats.averageDurationPerCard).toBe(0);
  });

  it("computes correct percentages for all-cut votes", () => {
    const votes = makeVotes(["cut", "cut", "cut", "cut"]);
    const stats = computeStats(votes, 8000);

    expect(stats.keepPercent).toBe(0);
    expect(stats.cutPercent).toBe(100);
  });
});

describe("determineArchetype", () => {
  function makeStats(overrides: Partial<Omit<SessionStats, "archetype">>): Omit<SessionStats, "archetype"> {
    return {
      totalCards: 10,
      keepCount: 5,
      cutCount: 5,
      reinforceCount: 0,
      unjustifiedCount: 0,
      keepPercent: 50,
      cutPercent: 50,
      totalDurationSeconds: 120,
      averageDurationPerCard: 12,
      ...overrides,
    };
  }

  it("returns Austeritaire for >80% cut at level 1", () => {
    const stats = makeStats({ cutPercent: 90, keepPercent: 10, cutCount: 9, keepCount: 1 });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("austeritaire");
  });

  it("returns Gardien for >80% keep at level 1", () => {
    const stats = makeStats({ keepPercent: 90, cutPercent: 10, keepCount: 9, cutCount: 1 });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("gardien");
  });

  it("returns Tranchant for 60-80% cut at level 1", () => {
    const stats = makeStats({ cutPercent: 70, keepPercent: 30, cutCount: 7, keepCount: 3 });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("tranchant");
  });

  it("returns Protecteur for 60-80% keep at level 1", () => {
    const stats = makeStats({ keepPercent: 70, cutPercent: 30, keepCount: 7, cutCount: 3 });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("protecteur");
  });

  it("returns Equilibriste for 40-60% cut at level 1", () => {
    const stats = makeStats({ cutPercent: 50, keepPercent: 50 });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("equilibriste");
  });

  it("returns Speedrunner for fast sessions at level 1 when no content-based match", () => {
    // 30% cut doesn't match any content-based archetype cleanly
    // Actually 30% cut, 70% keep -> protecteur would match (60-80 keep)
    // Let's use a case that doesn't match: 15% cut, 15% keep, rest reinforce/unjustified
    const stats = makeStats({
      cutPercent: 15,
      keepPercent: 15,
      totalDurationSeconds: 30,
      totalCards: 10,
      keepCount: 1,
      cutCount: 2,
      reinforceCount: 4,
      unjustifiedCount: 3,
    });
    const archetype = determineArchetype(stats, 1);
    expect(archetype.id).toBe("speedrunner");
  });

  it("returns a level 2 archetype when level is 2", () => {
    const stats = makeStats({
      keepPercent: 30,
      cutPercent: 30,
      reinforceCount: 2,
      unjustifiedCount: 2,
      totalCards: 10,
    });
    const archetype = determineArchetype(stats, 2);
    expect(archetype.level).toBe(2);
  });

  it("returns Reformateur for >40% reinforce at level 2", () => {
    const stats = makeStats({
      keepPercent: 10,
      cutPercent: 10,
      reinforceCount: 5,
      totalCards: 10,
    });
    const archetype = determineArchetype(stats, 2);
    expect(archetype.id).toBe("reformateur");
  });

  it("returns fallback archetype when no conditions match", () => {
    // Very unusual distribution that shouldn't match any explicit condition
    const stats = makeStats({
      cutPercent: 10,
      keepPercent: 10,
      reinforceCount: 0,
      unjustifiedCount: 0,
      totalDurationSeconds: 300,
      totalCards: 10,
    });
    const archetype = determineArchetype(stats, 1);
    // Should return some archetype (fallback)
    expect(archetype).toBeDefined();
    expect(archetype.level).toBe(1);
  });

  it("returns a level 3 archetype when level is 3", () => {
    const stats = makeStats({ cutPercent: 60, keepPercent: 40 });
    const archetype = determineArchetype(stats, 3);
    expect(archetype.level).toBe(3);
  });
});
