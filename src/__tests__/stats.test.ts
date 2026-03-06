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

function makeCard(id: string, deckId: string = "defense"): Card {
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
  };
}

function makeVote(cardId: string, direction: "keep" | "cut"): Vote {
  return { cardId, direction, duration: 2000, timestamp: Date.now() };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  const cards = [makeCard("def-01"), makeCard("def-02"), makeCard("def-03")];
  const votes = [
    makeVote("def-01", "keep"),
    makeVote("def-02", "cut"),
    makeVote("def-03", "keep"),
  ];
  return {
    id: "test-session-id",
    deckId: "defense",
    level: 1,
    gameMode: "classic",
    cards,
    votes,
    currentIndex: 2,
    startedAt: Date.now() - 30000,
    endedAt: Date.now(),
    totalDuration: 30000,
    completed: true,
    ...overrides,
  };
}

describe("stats module", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("getSessions returns empty array when no sessions stored", async () => {
    const { getSessions } = await import("@/lib/stats");
    expect(getSessions()).toEqual([]);
  });

  it("getGlobalStats returns default stats when nothing stored", async () => {
    const { getGlobalStats } = await import("@/lib/stats");
    const stats = getGlobalStats();
    expect(stats.xp).toBe(0);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalCards).toBe(0);
    expect(stats.categoriesPlayed).toEqual([]);
  });

  it("getPlayerProfile generates a username if none exists", async () => {
    const { getPlayerProfile } = await import("@/lib/stats");
    const profile = getPlayerProfile();
    expect(profile.username).toBeTruthy();
    expect(profile.username.length).toBeGreaterThan(0);
  });

  it("saveCompletedSession stores session and updates global stats", async () => {
    const { saveCompletedSession, getSessions, getGlobalStats } = await import("@/lib/stats");

    const session = makeSession();
    saveCompletedSession(session);

    const sessions = getSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].deckId).toBe("defense");
    expect(sessions[0].totalCards).toBe(3);

    const stats = getGlobalStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalCards).toBe(3);
    expect(stats.categoriesPlayed).toContain("defense");
  });

  it("saveCompletedSession does not save incomplete sessions", async () => {
    const { saveCompletedSession, getSessions } = await import("@/lib/stats");

    const session = makeSession({ completed: false });
    saveCompletedSession(session);

    expect(getSessions()).toHaveLength(0);
  });

  it("saveCompletedSession does not save sessions without totalDuration", async () => {
    const { saveCompletedSession, getSessions } = await import("@/lib/stats");

    const session = makeSession({ totalDuration: undefined });
    saveCompletedSession(session);

    expect(getSessions()).toHaveLength(0);
  });

  it("saveCompletedSession computes XP correctly", async () => {
    const { saveCompletedSession, getGlobalStats } = await import("@/lib/stats");

    const session = makeSession();
    saveCompletedSession(session);

    const stats = getGlobalStats();
    // XP = totalCards * 10 + 50 (session bonus) = 3 * 10 + 50 = 80
    expect(stats.xp).toBe(80);
  });

  it("saveCompletedSession tracks kept and cut billions", async () => {
    const { saveCompletedSession, getSessions } = await import("@/lib/stats");

    const session = makeSession();
    saveCompletedSession(session);

    const stored = getSessions()[0];
    // 2 cards kept (def-01, def-03) at 5.0 each = 10.0
    expect(stored.totalKeptBillions).toBe(10);
    // 1 card cut (def-02) at 5.0 = 5.0
    expect(stored.totalCutBillions).toBe(5);
  });

  it("saveCompletedSession updates player profile", async () => {
    const { saveCompletedSession, getPlayerProfile } = await import("@/lib/stats");

    const session = makeSession();
    saveCompletedSession(session);

    const profile = getPlayerProfile();
    expect(profile.archetypeId).toBeTruthy();
    expect(profile.archetypeName).toBeTruthy();
    expect(profile.level).toBeGreaterThanOrEqual(1);
  });
});
