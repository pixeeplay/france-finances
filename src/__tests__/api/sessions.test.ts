import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/sessions", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function mockDb(available: boolean) {
    vi.doMock("@/db", () => ({
      db: available ? {} : null,
      isDbAvailable: () => available,
    }));
    vi.doMock("@/auth", () => ({
      auth: vi.fn(() => Promise.resolve(null)),
    }));
    vi.doMock("@/db/schema", () => ({
      sessions: {},
      votes: {},
      auditResponses: {},
    }));
  }

  async function importPOST() {
    const { POST } = await import("@/app/api/sessions/route");
    return POST;
  }

  function makeRequest(body: unknown) {
    return new Request("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("returns 503 when database is not available", async () => {
    mockDb(false);
    const POST = await importPOST();
    const response = await POST(makeRequest({ id: "test" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Database not configured");
  });

  it("returns 400 for invalid JSON body", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest("not json{{{"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for validation failure (missing required fields)", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      id: "not-a-uuid",
      deckId: "defense",
    }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for invalid cardId format in votes", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      id: "550e8400-e29b-41d4-a716-446655440000",
      deckId: "defense",
      level: 1,
      archetypeId: "equilibriste",
      archetypeName: "L'Equilibriste",
      totalDurationMs: 30000,
      totalCards: 1,
      keepCount: 1,
      cutCount: 0,
      totalKeptBillions: 5,
      totalCutBillions: 0,
      votes: [
        { cardId: "INVALID!!!", direction: "keep", durationMs: 2000 },
      ],
    }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
  });
});
