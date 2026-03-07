import { describe, it, expect, vi, beforeEach } from "vitest";

describe("GET /api/me/sessions", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function mockDeps(options: {
    dbAvailable?: boolean;
    user?: { id: string } | null;
    sessionRows?: Array<Record<string, unknown>>;
    voteRows?: Array<Record<string, unknown>>;
  }) {
    const {
      dbAvailable = true,
      user = null,
      sessionRows = [],
      voteRows = [],
    } = options;

    // Mock auth
    vi.doMock("@/auth", () => ({
      auth: vi.fn(() =>
        Promise.resolve(user ? { user } : null)
      ),
    }));

    // Mock db
    const mockFrom = vi.fn();
    const mockSelectSessions = vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(sessionRows)),
          })),
        })),
      })),
    }));
    const mockSelectVotes = vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(voteRows)),
      })),
    }));

    // Track call count so first select returns sessions, second returns votes
    let selectCallCount = 0;
    const mockSelect = vi.fn(() => {
      selectCallCount++;
      if (selectCallCount === 1) return mockSelectSessions();
      return mockSelectVotes();
    });

    vi.doMock("@/db", () => ({
      db: dbAvailable ? { select: mockSelect } : null,
      isDbAvailable: () => dbAvailable,
    }));

    vi.doMock("@/db/schema", () => ({
      sessions: {
        id: "id",
        deckId: "deck_id",
        level: "level",
        archetypeId: "archetype_id",
        archetypeName: "archetype_name",
        totalDurationMs: "total_duration_ms",
        totalCards: "total_cards",
        keepCount: "keep_count",
        cutCount: "cut_count",
        reinforceCount: "reinforce_count",
        unjustifiedCount: "unjustified_count",
        totalKeptBillions: "total_kept_billions",
        totalCutBillions: "total_cut_billions",
        createdAt: "created_at",
        userId: "user_id",
      },
      votes: {
        sessionId: "session_id",
        cardId: "card_id",
        direction: "direction",
        durationMs: "duration_ms",
      },
    }));

    // Mock drizzle-orm operators
    vi.doMock("drizzle-orm", () => ({
      eq: vi.fn((...args: unknown[]) => args),
      desc: vi.fn((col: unknown) => col),
      sql: vi.fn(),
    }));
  }

  async function importGET() {
    const { GET } = await import("@/app/api/me/sessions/route");
    return GET;
  }

  it("returns 401 when not authenticated", async () => {
    mockDeps({ user: null });
    const GET = await importGET();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.type).toBe("auth");
  });

  it("returns 503 when database is unavailable", async () => {
    mockDeps({ dbAvailable: false, user: { id: "user-123" } });
    const GET = await importGET();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Database not configured");
  });

  it("returns empty sessions array when user has no sessions", async () => {
    mockDeps({ user: { id: "user-123" }, sessionRows: [] });
    const GET = await importGET();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessions).toEqual([]);
  });

  it("returns sessions with votes for authenticated user", async () => {
    const now = new Date();
    mockDeps({
      user: { id: "user-123" },
      sessionRows: [
        {
          id: "session-1",
          deckId: "defense",
          level: 1,
          archetypeId: "equilibriste",
          archetypeName: "L'Equilibriste",
          totalDurationMs: 30000,
          totalCards: 10,
          keepCount: 5,
          cutCount: 5,
          reinforceCount: 0,
          unjustifiedCount: 0,
          totalKeptBillions: 25.0,
          totalCutBillions: 25.0,
          createdAt: now,
        },
      ],
      voteRows: [
        { sessionId: "session-1", cardId: "def-01", direction: "keep", durationMs: 2000 },
        { sessionId: "session-1", cardId: "def-02", direction: "cut", durationMs: 1500 },
      ],
    });

    const GET = await importGET();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessions).toHaveLength(1);
    expect(data.sessions[0].id).toBe("session-1");
    expect(data.sessions[0].deckId).toBe("defense");
    expect(data.sessions[0].votes).toHaveLength(2);
    expect(data.sessions[0].date).toBe(now.toISOString());
  });
});
