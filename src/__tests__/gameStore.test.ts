import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Card } from "@/types";

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

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-1234",
});

// Mock fetch
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
    amountBillions: 2.0,
    costPerCitizen: 29,
    deckId,
    icon: "🎯",
    source: "Test",
    level: 1,
  };
}

describe("gameStore", () => {
  let useGameStore: typeof import("@/stores/gameStore").useGameStore;

  beforeEach(async () => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // Reset the store between tests by re-importing
    vi.resetModules();
    const mod = await import("@/stores/gameStore");
    useGameStore = mod.useGameStore;
  });

  describe("startSession", () => {
    it("initializes a new session with correct defaults", () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
      useGameStore.getState().startSession("defense", cards);

      const session = useGameStore.getState().session;
      expect(session).not.toBeNull();
      expect(session!.deckId).toBe("defense");
      expect(session!.cards).toHaveLength(3);
      expect(session!.votes).toEqual([]);
      expect(session!.currentIndex).toBe(0);
      expect(session!.level).toBe(1);
      expect(session!.gameMode).toBe("classic");
      expect(session!.completed).toBe(false);
    });

    it("accepts custom level and game mode", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards, 2, "budget", 50);

      const session = useGameStore.getState().session;
      expect(session!.level).toBe(2);
      expect(session!.gameMode).toBe("budget");
      expect(session!.budgetTarget).toBe(50);
    });

    it("clears cached stats from previous session", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState()._cachedStats).toBeNull();
    });
  });

  describe("voteAndAdvance", () => {
    it("records a vote and advances to next card", () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
      useGameStore.getState().startSession("defense", cards);

      const isLast = useGameStore.getState().voteAndAdvance("c1", "keep");

      const session = useGameStore.getState().session;
      expect(isLast).toBe(false);
      expect(session!.votes).toHaveLength(1);
      expect(session!.votes[0].cardId).toBe("c1");
      expect(session!.votes[0].direction).toBe("keep");
      expect(session!.currentIndex).toBe(1);
    });

    it("returns true when voting on the last card", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);

      useGameStore.getState().voteAndAdvance("c1", "keep");
      const isLast = useGameStore.getState().voteAndAdvance("c2", "cut");

      expect(isLast).toBe(true);
    });

    it("prevents duplicate votes for the same card", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);

      useGameStore.getState().voteAndAdvance("c1", "keep");
      const result = useGameStore.getState().voteAndAdvance("c1", "cut");

      expect(result).toBe(false);
      expect(useGameStore.getState().session!.votes).toHaveLength(1);
    });

    it("returns false if no session exists", () => {
      const result = useGameStore.getState().voteAndAdvance("c1", "keep");
      expect(result).toBe(false);
    });

    it("returns false if session is completed", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().voteAndAdvance("c1", "keep");
      useGameStore.getState().completeSession();

      const result = useGameStore.getState().voteAndAdvance("c1", "cut");
      expect(result).toBe(false);
    });
  });

  describe("completeSession", () => {
    it("marks session as completed and computes stats", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().voteAndAdvance("c1", "keep");
      useGameStore.getState().voteAndAdvance("c2", "cut");
      useGameStore.getState().completeSession();

      const session = useGameStore.getState().session;
      expect(session!.completed).toBe(true);
      expect(session!.endedAt).toBeDefined();
      expect(session!.totalDuration).toBeDefined();
    });

    it("caches session stats after completion", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().voteAndAdvance("c1", "keep");
      useGameStore.getState().voteAndAdvance("c2", "cut");
      useGameStore.getState().completeSession();

      const cached = useGameStore.getState()._cachedStats;
      expect(cached).not.toBeNull();
      expect(cached!.totalCards).toBe(2);
      expect(cached!.archetype).toBeDefined();
    });

    it("does nothing if session is already completed", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().voteAndAdvance("c1", "keep");
      useGameStore.getState().completeSession();

      const firstEndedAt = useGameStore.getState().session!.endedAt;
      useGameStore.getState().completeSession();

      expect(useGameStore.getState().session!.endedAt).toBe(firstEndedAt);
    });

    it("does nothing if no session exists", () => {
      // Should not throw
      useGameStore.getState().completeSession();
      expect(useGameStore.getState().session).toBeNull();
    });
  });

  describe("reset", () => {
    it("clears session and cached stats", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().reset();

      expect(useGameStore.getState().session).toBeNull();
      expect(useGameStore.getState()._cachedStats).toBeNull();
    });
  });

  describe("computed functions", () => {
    it("currentCard returns the card at currentIndex", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState().currentCard()?.id).toBe("c1");

      useGameStore.getState().voteAndAdvance("c1", "keep");
      expect(useGameStore.getState().currentCard()?.id).toBe("c2");
    });

    it("currentCard returns null when no session", () => {
      expect(useGameStore.getState().currentCard()).toBeNull();
    });

    it("nextCardInPile returns the next card", () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState().nextCardInPile()?.id).toBe("c2");
    });

    it("nextCardInPile returns null at end of deck", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState().nextCardInPile()).toBeNull();
    });

    it("progress returns correct fraction", () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3"), makeCard("c4")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState().progress()).toBe(0);

      useGameStore.getState().voteAndAdvance("c1", "keep");
      expect(useGameStore.getState().progress()).toBe(0.25);

      useGameStore.getState().voteAndAdvance("c2", "keep");
      expect(useGameStore.getState().progress()).toBe(0.5);
    });

    it("progress returns 0 when no session", () => {
      expect(useGameStore.getState().progress()).toBe(0);
    });

    it("sessionStats returns null when session not completed", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards);

      expect(useGameStore.getState().sessionStats()).toBeNull();
    });

    it("sessionStats returns cached stats after completion", () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      useGameStore.getState().startSession("defense", cards);
      useGameStore.getState().voteAndAdvance("c1", "keep");
      useGameStore.getState().voteAndAdvance("c2", "cut");
      useGameStore.getState().completeSession();

      const stats = useGameStore.getState().sessionStats();
      expect(stats).not.toBeNull();
      expect(stats!.totalCards).toBe(2);
      expect(stats!.keepCount).toBe(1);
      expect(stats!.cutCount).toBe(1);
      expect(stats!.archetype).toBeDefined();
    });
  });

  describe("recordAudit", () => {
    it("records an audit response", () => {
      const cards = [makeCard("c1")];
      useGameStore.getState().startSession("defense", cards, 3);

      useGameStore.getState().recordAudit({
        cardId: "c1",
        diagnostics: { q1: true, q2: false, q3: true },
        recommendation: "reduce",
      });

      const session = useGameStore.getState().session;
      expect(session!.auditResponses).toHaveLength(1);
      expect(session!.auditResponses![0].cardId).toBe("c1");
      expect(session!.auditResponses![0].recommendation).toBe("reduce");
    });

    it("does nothing if no session exists", () => {
      // Should not throw
      useGameStore.getState().recordAudit({
        cardId: "c1",
        diagnostics: {},
        recommendation: "keep",
      });
    });
  });
});
