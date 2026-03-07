import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

describe("GET /api/community/stats", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function mockDb(available: boolean) {
    vi.doMock("@/db", () => ({
      db: available ? { select: mockSelect } : null,
      isDbAvailable: () => available,
    }));
    vi.doMock("@/db/schema", () => ({
      sessions: {
        archetypeId: "archetype_id",
        archetypeName: "archetype_name",
        deckId: "deck_id",
        keepCount: "keep_count",
        cutCount: "cut_count",
        totalCards: "total_cards",
      },
      votes: {
        cardId: "card_id",
        direction: "direction",
      },
    }));
    vi.doMock("drizzle-orm", () => ({
      sql: vi.fn((...args: unknown[]) => args),
    }));
  }

  // Track which query we're on (archetype, category, topCut, topProtected)
  let queryCount = 0;
  const mockSelect = vi.fn(() => {
    queryCount++;
    return createChain(queryCount);
  });

  function createChain(queryNum: number) {
    const archetypeRows = [
      { archetypeId: "equilibriste", archetypeName: "L'Equilibriste", count: 50 },
      { archetypeId: "tronconneur", archetypeName: "Le Tronconneur", count: 30 },
    ];
    const categoryRows = [
      { deckId: "defense", keepCount: 100, cutCount: 50, total: 150 },
    ];
    const topCutRows = [
      { cardId: "def-01", total: 20, cutCount: 18 },
    ];
    const topProtectedRows = [
      { cardId: "edu-01", total: 20, keepCount: 17 },
    ];

    const results = [archetypeRows, categoryRows, topCutRows, topProtectedRows];
    const data = results[(queryNum - 1) % results.length];

    return {
      from: vi.fn(() => ({
        groupBy: vi.fn((..._args: unknown[]) => {
          // For archetype/category queries (no having/orderBy/limit)
          if (queryNum <= 2) return Promise.resolve(data);
          // For topCut/topProtected (has having, orderBy, limit)
          return {
            having: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve(data)),
              })),
            })),
          };
        }),
      })),
    };
  }

  async function importGET() {
    const { GET } = await import("@/app/api/community/stats/route");
    return GET;
  }

  function makeRequest(ip: string = "192.168.1.1") {
    const req = new Request("http://localhost:3000/api/community/stats", {
      headers: { "x-forwarded-for": ip },
    });
    return req as unknown as NextRequest;
  }

  it("returns 503 when database is unavailable", async () => {
    mockDb(false);
    const GET = await importGET();
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Database not configured");
  });

  it("returns community stats when database is available", async () => {
    queryCount = 0;
    mockDb(true);
    const GET = await importGET();
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    // Check structure
    expect(data).toHaveProperty("archetypeDistribution");
    expect(data).toHaveProperty("categoryStats");
    expect(data).toHaveProperty("topCut");
    expect(data).toHaveProperty("topProtected");
    expect(data).toHaveProperty("totalSessions");
  });

  it("computes archetype distribution percentages correctly", async () => {
    queryCount = 0;
    mockDb(true);
    const GET = await importGET();
    const response = await GET(makeRequest());
    const data = await response.json();

    // Total = 50 + 30 = 80
    expect(data.totalSessions).toBe(80);
    const equi = data.archetypeDistribution.find(
      (a: { archetypeId: string }) => a.archetypeId === "equilibriste"
    );
    expect(equi).toBeDefined();
    expect(equi.count).toBe(50);
    expect(equi.percent).toBe(63); // Math.round(50/80 * 100)
  });

  it("computes category cutPercent correctly", async () => {
    queryCount = 0;
    mockDb(true);
    const GET = await importGET();
    const response = await GET(makeRequest());
    const data = await response.json();

    const defense = data.categoryStats.find(
      (c: { deckId: string }) => c.deckId === "defense"
    );
    expect(defense).toBeDefined();
    expect(defense.cutPercent).toBe(33); // Math.round(50/150 * 100)
  });
});
