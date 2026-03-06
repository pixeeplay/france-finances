import { describe, it, expect, vi } from "vitest";

// Mock the db module before importing the route
vi.mock("@/db", () => ({
  db: null,
  isDbAvailable: () => false,
}));

describe("GET /api/health", () => {
  it("returns status ok with timestamp and db status", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.db).toBe(false);
    expect(data.timestamp).toBeDefined();
    // Verify timestamp is a valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
