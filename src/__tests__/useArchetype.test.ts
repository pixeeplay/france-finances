import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Vote, Archetype } from "@/types";

// Mock gameStore
const mockSession = vi.fn();
vi.mock("@/stores/gameStore", () => ({
  useGameStore: (selector: (s: { session: unknown }) => unknown) =>
    selector({ session: mockSession() }),
}));

// Mock archetype lib
const mockComputeStats = vi.fn();
const mockDetermineArchetype = vi.fn();
vi.mock("@/lib/archetype", () => ({
  computeStats: (...args: unknown[]) => mockComputeStats(...args),
  determineArchetype: (...args: unknown[]) => mockDetermineArchetype(...args),
  computeSessionResult: (s: { votes: Vote[]; totalDuration: number; level: number }) => {
    const stats = mockComputeStats(s.votes, s.totalDuration);
    return { stats, profile: {}, archetype: mockDetermineArchetype(stats, s.level) };
  },
}));

describe("useArchetype", () => {
  let useArchetype: typeof import("@/hooks/useArchetype").useArchetype;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Re-setup mocks after resetModules
    mockSession.mockReturnValue(null);
    mockComputeStats.mockReturnValue({
      totalCards: 10,
      keepCount: 6,
      cutCount: 4,
      reinforceCount: 0,
      unjustifiedCount: 0,
      keepPercent: 60,
      cutPercent: 40,
      totalDurationSeconds: 30,
      averageDurationPerCard: 3,
    });
    mockDetermineArchetype.mockReturnValue({
      id: "equilibriste",
      name: "L'Equilibriste",
      icon: "balance",
      tagline: "Test tagline",
      description: "Test description",
      level: 1,
      condition: {},
    } as Archetype);

    const mod = await import("@/hooks/useArchetype");
    useArchetype = mod.useArchetype;
  });

  it("returns null archetype and stats when session is null", () => {
    mockSession.mockReturnValue(null);
    const { result } = renderHook(() => useArchetype());

    expect(result.current.archetype).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it("returns null when session is not completed", () => {
    mockSession.mockReturnValue({
      completed: false,
      totalDuration: 30000,
      votes: [],
      level: 1,
    });
    const { result } = renderHook(() => useArchetype());

    expect(result.current.archetype).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it("returns null when totalDuration is falsy (0 or undefined)", () => {
    mockSession.mockReturnValue({
      completed: true,
      totalDuration: 0,
      votes: [],
      level: 1,
    });
    const { result } = renderHook(() => useArchetype());

    expect(result.current.archetype).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it("returns null when totalDuration is undefined", () => {
    mockSession.mockReturnValue({
      completed: true,
      totalDuration: undefined,
      votes: [],
      level: 1,
    });
    const { result } = renderHook(() => useArchetype());

    expect(result.current.archetype).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it("computes stats and archetype for completed session", () => {
    const votes: Vote[] = [
      { cardId: "c1", direction: "keep", duration: 2000, timestamp: 1000 },
      { cardId: "c2", direction: "cut", duration: 3000, timestamp: 2000 },
      { cardId: "c3", direction: "keep", duration: 2500, timestamp: 3000 },
    ];
    mockSession.mockReturnValue({
      completed: true,
      totalDuration: 7500,
      votes,
      level: 1,
    });

    const { result } = renderHook(() => useArchetype());

    expect(mockComputeStats).toHaveBeenCalledWith(votes, 7500);
    expect(mockDetermineArchetype).toHaveBeenCalledWith(
      expect.objectContaining({ totalCards: 10 }),
      1
    );
    expect(result.current.archetype).not.toBeNull();
    expect(result.current.archetype?.id).toBe("equilibriste");
    expect(result.current.stats).not.toBeNull();
  });

  it("passes the correct level to determineArchetype", () => {
    const votes: Vote[] = [
      { cardId: "c1", direction: "keep", duration: 2000, timestamp: 1000 },
    ];
    mockSession.mockReturnValue({
      completed: true,
      totalDuration: 5000,
      votes,
      level: 2,
    });

    renderHook(() => useArchetype());

    expect(mockDetermineArchetype).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it("memoizes result (does not recompute on re-render with same session)", () => {
    const session = {
      completed: true,
      totalDuration: 5000,
      votes: [{ cardId: "c1", direction: "keep" as const, duration: 2000, timestamp: 1000 }],
      level: 1 as const,
    };
    mockSession.mockReturnValue(session);

    const { result, rerender } = renderHook(() => useArchetype());
    const firstResult = result.current;

    rerender();

    // Same reference since session did not change
    expect(result.current).toBe(firstResult);
    // computeStats called only once
    expect(mockComputeStats).toHaveBeenCalledTimes(1);
  });
});
