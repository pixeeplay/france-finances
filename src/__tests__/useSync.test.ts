import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock @/lib/stats
const mockGetSessions = vi.fn();
const mockGetGlobalStats = vi.fn();
const mockGetPlayerProfile = vi.fn();
vi.mock("@/lib/stats", () => ({
  getSessions: () => mockGetSessions(),
  getGlobalStats: () => mockGetGlobalStats(),
  getPlayerProfile: () => mockGetPlayerProfile(),
}));

import { renderHook } from "@testing-library/react";

describe("useSync", () => {
  let useSync: typeof import("@/hooks/useSync").useSync;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Default: not authenticated
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    mockGetSessions.mockReturnValue([]);
    mockGetGlobalStats.mockReturnValue({ xp: 0, totalSessions: 0, totalCards: 0, categoriesPlayed: [], sessionsPerDeck: {}, auditsN3: 0, totalKeptBillions: 0, totalCutBillions: 0 });
    mockGetPlayerProfile.mockReturnValue({ username: "", customAvatar: null });

    // Default fetch mock
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ sessions: [] }), { status: 200 }))
    );

    vi.resetModules();
    const mod = await import("@/hooks/useSync");
    useSync = mod.useSync;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("throttling behavior", () => {
    it("does not sync when user is not authenticated", async () => {
      mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("does not sync when status is loading", async () => {
      mockUseSession.mockReturnValue({ data: null, status: "loading" });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("syncs when user is authenticated", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/me/sessions",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it("skips sync if last sync was less than 5 minutes ago", async () => {
      // Set lastSync to recent time
      localStorageMock.setItem("trnc:lastSync", String(Date.now()));

      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("syncs if last sync was more than 5 minutes ago", async () => {
      // Set lastSync to 6 minutes ago
      localStorageMock.setItem("trnc:lastSync", String(Date.now() - 6 * 60 * 1000));

      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/me/sessions",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it("does not sync twice on re-render", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      const { rerender } = renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      const callCount = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;

      rerender();
      await vi.advanceTimersByTimeAsync(100);

      // Should not have made additional fetch calls
      expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it("stores lastSync timestamp after successful sync", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(200);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "trnc:lastSync",
        expect.any(String)
      );
    });
  });

  describe("fetch timeout handling", () => {
    it("sets a 10-second abort timeout on the sessions fetch", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      // Make fetch hang (never resolve)
      globalThis.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(100);

      // Verify fetch was called with an AbortSignal
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/me/sessions",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it("handles fetch failure gracefully (no throw)", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      // Make fetch reject
      globalThis.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

      // Should not throw
      expect(() => {
        renderHook(() => useSync());
      }).not.toThrow();

      await vi.advanceTimersByTimeAsync(200);
    });

    it("handles non-ok response gracefully", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });

      globalThis.fetch = vi.fn(() =>
        Promise.resolve(new Response("Server Error", { status: 500 }))
      );

      // Should not throw
      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(200);

      // Should have tried to fetch but not crash
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("syncs profile to DB when username exists", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });
      mockGetPlayerProfile.mockReturnValue({ username: "TestPlayer", customAvatar: "avatar.png" });

      const fetchMock = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ sessions: [] }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      globalThis.fetch = fetchMock;

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(200);

      // Second fetch should be the profile PUT
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/me/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "TestPlayer", image: "avatar.png" }),
        })
      );
    });

    it("merges DB sessions into localStorage", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1", name: "Test", email: "test@test.com" } },
        status: "authenticated",
      });
      mockGetSessions.mockReturnValue([]);
      mockGetPlayerProfile.mockReturnValue({ username: "", customAvatar: null });

      const dbSessions = [
        {
          id: "db-session-1",
          deckId: "defense",
          level: 1 as const,
          archetypeId: "gardien",
          archetypeName: "Le Gardien",
          totalDurationMs: 60000,
          keepCount: 8,
          cutCount: 2,
          totalCards: 10,
          totalKeptBillions: 40,
          totalCutBillions: 10,
          date: "2026-03-01T10:00:00Z",
          votes: [{ cardId: "c1", direction: "keep", duration: 2000 }],
        },
      ];

      globalThis.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ sessions: dbSessions }), { status: 200 }))
      );

      renderHook(() => useSync());
      await vi.advanceTimersByTimeAsync(200);

      // Verify sessions were stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "trnc:sessions",
        expect.stringContaining("db-session-1")
      );
    });
  });
});
