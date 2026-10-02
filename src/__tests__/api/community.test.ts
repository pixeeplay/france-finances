import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

describe("GET /api/community", () => {
  const where = vi.fn();
  const rows = [
    { cardId: "def-01", direction: "keep", count: 3 },
    { cardId: "def-01", direction: "cut", count: 2 },
    { cardId: "san-02", direction: "unjustified", count: 1 },
  ];

  beforeEach(() => {
    vi.resetModules();
    where.mockReset();
    where.mockImplementation(() => ({ groupBy: vi.fn(() => Promise.resolve(rows)) }));
  });

  function mockDb(available: boolean) {
    vi.doMock("@/db", () => ({
      db: available ? { select: vi.fn(() => ({ from: vi.fn(() => ({ where })) })) } : null,
      isDbAvailable: () => available,
    }));
    vi.doMock("@/db/schema", () => ({
      votes: { cardId: "card_id", direction: "direction" },
    }));
    vi.doMock("drizzle-orm", () => ({
      sql: vi.fn((...args: unknown[]) => args),
      inArray: vi.fn((col: unknown, values: unknown) => ({ col, values })),
    }));
  }

  async function call(query = "", ip = "10.0.0.1") {
    const { GET } = await import("@/app/api/community/route");
    const req = new Request(`http://localhost:3000/api/community${query}`, {
      headers: { "x-forwarded-for": ip },
    });
    return GET(req as unknown as NextRequest);
  }

  it("returns 503 without database", async () => {
    mockDb(false);
    const res = await call("", "10.0.0.2");
    expect(res.status).toBe(503);
  });

  it("aggregates counts per card", async () => {
    mockDb(true);
    const res = await call("", "10.0.0.3");
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data["def-01"]).toEqual({ keep: 3, cut: 2, reinforce: 0, unjustified: 0, total: 5 });
    expect(data["san-02"].total).toBe(1);
    expect(where).toHaveBeenCalledWith(undefined);
  });

  it("filters on valid ids when provided", async () => {
    mockDb(true);
    await call("?ids=def-01,san-02,bad", "10.0.0.4");
    expect(where).toHaveBeenCalledWith({ col: "card_id", values: ["def-01", "san-02"] });
  });

  it("short-circuits when every id is invalid", async () => {
    mockDb(true);
    const res = await call("?ids=nope", "10.0.0.5");
    expect(await res.json()).toEqual({});
    expect(where).not.toHaveBeenCalled();
  });
});
