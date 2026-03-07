import { describe, it, expect, vi } from "vitest";

// Mock db as unavailable
vi.mock("@/db", () => ({
  db: null,
  isDbAvailable: () => false,
}));

// Mock db schema
vi.mock("@/db/schema", () => ({
  sessions: {},
  users: {},
}));

describe("GET /api/ranking", () => {
  it("returns 503 when database is not available", async () => {
    const { GET } = await import("@/app/api/ranking/route");
    const request = new Request("http://localhost:3000/api/ranking");
    const response = await GET(request as import("next/server").NextRequest);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Database not configured");
  });
});
