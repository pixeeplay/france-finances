import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/analytics", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function mockDb(available: boolean, insertFn?: ReturnType<typeof vi.fn>) {
    const mockInsert = insertFn ?? vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    }));
    vi.doMock("@/db", () => ({
      db: available ? { insert: mockInsert } : null,
      isDbAvailable: () => available,
    }));
    vi.doMock("@/db/schema", () => ({
      analyticsEvents: {},
    }));
    return mockInsert;
  }

  async function importPOST() {
    const { POST } = await import("@/app/api/analytics/route");
    return POST;
  }

  function makeRequest(body: unknown, headers: Record<string, string> = {}) {
    return new Request("http://localhost:3000/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.1",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("returns ok when db is unavailable (graceful degradation)", async () => {
    mockDb(false);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      events: [{ event: "page_view", properties: {} }],
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("returns 400 for invalid JSON body", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest("not valid json{{{"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for validation failure (empty events array)", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest({ events: [] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for validation failure (missing event field)", async () => {
    mockDb(true);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      events: [{ properties: {} }],
    }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for too many events (>20)", async () => {
    mockDb(true);
    const POST = await importPOST();
    const events = Array.from({ length: 21 }, (_, i) => ({
      event: `event_${i}`,
      properties: {},
    }));
    const response = await POST(makeRequest({ events }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("silently skips bot traffic (returns ok without db insert)", async () => {
    const insertFn = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
    mockDb(true, insertFn);
    const POST = await importPOST();
    const response = await POST(makeRequest(
      { events: [{ event: "page_view" }] },
      { "user-agent": "Googlebot/2.1" }
    ));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    // Bot traffic should not reach db insert
    expect(insertFn).not.toHaveBeenCalled();
  });

  it("accepts valid batch of events and returns ok", async () => {
    const valuesFn = vi.fn(() => Promise.resolve());
    const insertFn = vi.fn(() => ({ values: valuesFn }));
    mockDb(true, insertFn);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      events: [
        { event: "page_view", page: "/jeu", properties: { deckId: "defense" } },
        { event: "card_vote", properties: { cardId: "def-01", direction: "keep" } },
      ],
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(insertFn).toHaveBeenCalled();
    expect(valuesFn).toHaveBeenCalled();
  });

  it("handles db insert errors gracefully (returns ok, does not expose error)", async () => {
    const valuesFn = vi.fn(() => Promise.reject(new Error("DB connection lost")));
    const insertFn = vi.fn(() => ({ values: valuesFn }));
    mockDb(true, insertFn);
    const POST = await importPOST();
    const response = await POST(makeRequest({
      events: [{ event: "page_view" }],
    }));
    const data = await response.json();

    // Should return ok even on db error (graceful degradation)
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});
