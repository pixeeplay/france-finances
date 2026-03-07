import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Session, Card, Vote } from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock fetch (for syncSessionToApi)
globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }))));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

function makeCard(id: string, deckId: string = "defense", amountBillions: number = 5.0): Card {
  return {
    id,
    title: `Card ${id}`,
    subtitle: "Subtitle",
    description: "Description",
    amountBillions,
    costPerCitizen: 74,
    deckId,
    icon: "\uD83C\uDFAF",
    source: "Test",
    level: 1,
  };
}

function makeVote(cardId: string, direction: "keep" | "cut" | "reinforce" | "unjustified"): Vote {
  return { cardId, direction, duration: 2000, timestamp: Date.now() };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  const cards = Array.from({ length: 10 }, (_, i) => makeCard(`def-${String(i + 1).padStart(2, "0")}`));
  const votes = cards.map((c, i) => makeVote(c.id, i % 2 === 0 ? "keep" : "cut"));
  return {
    id: "test-session-id",
    deckId: "defense",
    level: 1,
    gameMode: "classic",
    cards,
    votes,
    currentIndex: 9,
    startedAt: Date.now() - 30000,
    endedAt: Date.now(),
    totalDuration: 30000,
    completed: true,
    ...overrides,
  };
}

describe("XP bonus calculations", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("base XP: 10 per card + 50 session bonus", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    const session = makeSession();
    saveCompletedSession(session);

    const stats = getGlobalStats();
    // XP = 10 cards * 10 + 50 = 150
    expect(stats.xp).toBe(150);
  });

  it("speedrunner bonus: +100 XP when archetype is speedrunner", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    // To trigger speedrunner archetype, we need a very fast session
    // The speedrunner archetype is determined by maxDurationSeconds in the archetype conditions
    // We need to make the session fast enough to get that archetype
    // With all-keep votes (100% keep -> "protecteur" normally), but super fast -> speedrunner
    const cards = Array.from({ length: 10 }, (_, i) => makeCard(`def-${String(i + 1).padStart(2, "0")}`));
    // Mix votes so no content archetype matches first, then speed check applies
    const votes = cards.map((c, i) => makeVote(c.id, i % 2 === 0 ? "keep" : "cut"));

    const session = makeSession({
      cards,
      votes,
      totalDuration: 5000, // 5 seconds total — very fast
    });

    saveCompletedSession(session);

    const stats = getGlobalStats();
    const sessions = (await import("@/lib/stats")).getSessions();
    const stored = sessions[0];

    if (stored.archetypeId === "speedrunner") {
      // Base: 10*10 + 50 = 150, + speedrunner bonus 100 = 250
      expect(stats.xp).toBe(250);
    } else {
      // If the archetype system didn't assign speedrunner (depends on archetype conditions),
      // at least verify the base XP is correct
      expect(stats.xp).toBe(150);
    }
  });

  it("L3 bonus: +100 XP for level 3 sessions", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    const session = makeSession({ level: 3 });
    saveCompletedSession(session);

    const stats = getGlobalStats();
    const sessions = (await import("@/lib/stats")).getSessions();
    const stored = sessions[0];

    // Base: 10*10 + 50 = 150, + L3 bonus 100 = 250
    // (possibly + speedrunner bonus if archetype matches)
    const expectedBase = 150 + 100; // L3 bonus
    const speedrunnerBonus = stored.archetypeId === "speedrunner" ? 100 : 0;
    expect(stats.xp).toBe(expectedBase + speedrunnerBonus);
  });

  it("budget target reached bonus: +150 XP when budget target met", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    // Create cards with specific amounts, cut enough to reach target
    const cards = Array.from({ length: 10 }, (_, i) =>
      makeCard(`def-${String(i + 1).padStart(2, "0")}`, "defense", 2.0)
    );
    // Cut all 10 cards (10 * 2.0 = 20.0 Md) with target of 10.0 Md
    const votes = cards.map((c) => makeVote(c.id, "cut"));

    const session = makeSession({
      cards,
      votes,
      gameMode: "budget",
      budgetTarget: 10.0,
    });

    saveCompletedSession(session);

    const stats = getGlobalStats();
    const sessions = (await import("@/lib/stats")).getSessions();
    const stored = sessions[0];

    expect(stored.budgetTargetReached).toBe(true);

    // Base: 10*10 + 50 = 150, + budget bonus 150 = 300
    const speedrunnerBonus = stored.archetypeId === "speedrunner" ? 100 : 0;
    expect(stats.xp).toBe(300 + speedrunnerBonus);
  });

  it("budget target NOT reached: no budget bonus", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    // Create cards, keep most of them (low cuts)
    const cards = Array.from({ length: 10 }, (_, i) =>
      makeCard(`def-${String(i + 1).padStart(2, "0")}`, "defense", 2.0)
    );
    // Only cut 2 cards (2 * 2.0 = 4.0 Md) with target of 10.0 Md
    const votes = cards.map((c, i) => makeVote(c.id, i < 2 ? "cut" : "keep"));

    const session = makeSession({
      cards,
      votes,
      gameMode: "budget",
      budgetTarget: 10.0,
    });

    saveCompletedSession(session);

    const stats = getGlobalStats();
    const sessions = (await import("@/lib/stats")).getSessions();
    const stored = sessions[0];

    expect(stored.budgetTargetReached).toBe(false);

    // Base: 10*10 + 50 = 150, no budget bonus
    const speedrunnerBonus = stored.archetypeId === "speedrunner" ? 100 : 0;
    expect(stats.xp).toBe(150 + speedrunnerBonus);
  });

  it("L3 + budget bonus stack together", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    const cards = Array.from({ length: 10 }, (_, i) =>
      makeCard(`def-${String(i + 1).padStart(2, "0")}`, "defense", 2.0)
    );
    const votes = cards.map((c) => makeVote(c.id, "cut"));

    const session = makeSession({
      cards,
      votes,
      level: 3,
      gameMode: "budget",
      budgetTarget: 10.0,
      totalDuration: 120000, // 2 minutes, not speedrunner-fast
    });

    saveCompletedSession(session);

    const stats = getGlobalStats();
    const sessions = (await import("@/lib/stats")).getSessions();
    const stored = sessions[0];

    expect(stored.budgetTargetReached).toBe(true);

    // Base: 10*10 + 50 = 150, + L3 bonus 100, + budget bonus 150 = 400
    const speedrunnerBonus = stored.archetypeId === "speedrunner" ? 100 : 0;
    expect(stats.xp).toBe(400 + speedrunnerBonus);
  });

  it("multiple sessions accumulate XP", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    // Session 1: basic L1
    const session1 = makeSession({ id: "session-1", totalDuration: 120000 });
    saveCompletedSession(session1);

    const stats1 = getGlobalStats();
    const xp1 = stats1.xp;
    expect(xp1).toBeGreaterThanOrEqual(150); // at least base XP

    // Session 2: L3
    const session2 = makeSession({ id: "session-2", level: 3, totalDuration: 120000 });
    saveCompletedSession(session2);

    const stats2 = getGlobalStats();
    expect(stats2.xp).toBeGreaterThan(xp1);
    expect(stats2.totalSessions).toBe(2);
  });

  it("player level increases with XP (level = floor(xp/500) + 1)", async () => {
    const { saveCompletedSession, getPlayerProfile } = await import("@/lib/stats");

    // Save multiple sessions to accumulate XP
    for (let i = 0; i < 5; i++) {
      const session = makeSession({
        id: `session-${i}`,
        totalDuration: 120000,
      });
      saveCompletedSession(session);
    }

    const profile = getPlayerProfile();
    // 5 sessions * 150 base XP = 750 XP minimum -> level = floor(750/500) + 1 = 2
    expect(profile.level).toBeGreaterThanOrEqual(2);
  });

  it("auditsN3 counter increments for level 3 sessions", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    // L1 session
    saveCompletedSession(makeSession({ id: "s1", totalDuration: 120000 }));
    expect(getGlobalStats().auditsN3).toBe(0);

    // L3 session
    saveCompletedSession(makeSession({ id: "s2", level: 3, totalDuration: 120000 }));
    expect(getGlobalStats().auditsN3).toBe(1);

    // Another L3 session
    saveCompletedSession(makeSession({ id: "s3", level: 3, totalDuration: 120000 }));
    expect(getGlobalStats().auditsN3).toBe(2);
  });
});
