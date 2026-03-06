import { describe, it, expect, vi } from "vitest";

// Mock db as unavailable
vi.mock("@/db", () => ({
  db: null,
  isDbAvailable: () => false,
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}));

// Mock db schema
vi.mock("@/db/schema", () => ({
  sessions: {},
  votes: {},
  auditResponses: {},
}));

describe("POST /api/sessions", () => {
  it("returns 503 when database is not available", async () => {
    const { POST } = await import("@/app/api/sessions/route");

    const request = new Request("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Database not configured");
  });

  it("returns 400 for invalid JSON body", async () => {
    // Need DB available for this test path
    vi.resetModules();
    vi.doMock("@/db", () => ({
      db: {},
      isDbAvailable: () => true,
    }));
    vi.doMock("@/auth", () => ({
      auth: vi.fn(() => Promise.resolve(null)),
    }));
    vi.doMock("@/db/schema", () => ({
      sessions: {},
      votes: {},
      auditResponses: {},
    }));

    const { POST } = await import("@/app/api/sessions/route");

    const request = new Request("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json{{{",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for validation failure (missing required fields)", async () => {
    vi.resetModules();
    vi.doMock("@/db", () => ({
      db: {},
      isDbAvailable: () => true,
    }));
    vi.doMock("@/auth", () => ({
      auth: vi.fn(() => Promise.resolve(null)),
    }));
    vi.doMock("@/db/schema", () => ({
      sessions: {},
      votes: {},
      auditResponses: {},
    }));

    const { POST } = await import("@/app/api/sessions/route");

    const request = new Request("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "not-a-uuid",
        deckId: "defense",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for invalid cardId format in votes", async () => {
    vi.resetModules();
    vi.doMock("@/db", () => ({
      db: {},
      isDbAvailable: () => true,
    }));
    vi.doMock("@/auth", () => ({
      auth: vi.fn(() => Promise.resolve(null)),
    }));
    vi.doMock("@/db/schema", () => ({
      sessions: {},
      votes: {},
      auditResponses: {},
    }));

    const { POST } = await import("@/app/api/sessions/route");

    const request = new Request("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
  });
});
