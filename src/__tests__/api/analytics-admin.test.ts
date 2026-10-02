import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

type SessionUser = { id: string; email: string } | null;

function mockDeps(user: SessionUser) {
  vi.doMock("@/auth", () => ({
    auth: vi.fn(() => Promise.resolve(user ? { user } : null)),
  }));
  // DB unavailable: an authorized request ends with a 503, which proves
  // the auth guard let it through without needing a full query mock.
  vi.doMock("@/db", () => ({
    db: null,
    isDbAvailable: () => false,
  }));
  vi.doMock("@/db/schema", () => ({
    analyticsEvents: {},
  }));
}

const ADMIN = { id: "u1", email: "Admin@France-Finances.com" };
const VISITOR = { id: "u2", email: "visitor@gmail.com" };

describe("GET /api/analytics/dashboard (admin guard)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("ADMIN_EMAILS", "admin@france-finances.com");
    vi.stubEnv("ANALYTICS_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function callGET(user: SessionUser, headers: Record<string, string> = {}) {
    mockDeps(user);
    const { GET } = await import("@/app/api/analytics/dashboard/route");
    return GET(new NextRequest("http://localhost:3000/api/analytics/dashboard?days=7", { headers }));
  }

  it("returns 401 for anonymous requests", async () => {
    const res = await callGET(null);
    expect(res.status).toBe(401);
    expect((await res.json()).ok).toBe(false);
  });

  it("returns 403 for a signed-in non-admin user", async () => {
    const res = await callGET(VISITOR);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: "Forbidden" });
  });

  it("lets an admin through (case-insensitive email)", async () => {
    const res = await callGET(ADMIN);
    expect(res.status).toBe(503);
  });

  it("returns 403 for everyone when ADMIN_EMAILS is unset", async () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    const res = await callGET(ADMIN);
    expect(res.status).toBe(403);
  });

  it("accepts a valid ANALYTICS_SECRET header without session", async () => {
    vi.stubEnv("ANALYTICS_SECRET", "s3cret");
    const res = await callGET(null, { "x-analytics-secret": "s3cret" });
    expect(res.status).toBe(503);
  });

  it("rejects a wrong ANALYTICS_SECRET header", async () => {
    vi.stubEnv("ANALYTICS_SECRET", "s3cret");
    const res = await callGET(null, { "x-analytics-secret": "nope" });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/analytics/purge (admin guard)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("ADMIN_EMAILS", "admin@france-finances.com");
    vi.stubEnv("ANALYTICS_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function callDELETE(user: SessionUser, headers: Record<string, string> = {}) {
    mockDeps(user);
    const { DELETE } = await import("@/app/api/analytics/purge/route");
    return DELETE(
      new NextRequest("http://localhost:3000/api/analytics/purge", { method: "DELETE", headers }),
    );
  }

  it("fails closed for anonymous requests when ANALYTICS_SECRET is unset", async () => {
    const res = await callDELETE(null);
    expect(res.status).toBe(401);
  });

  it("returns 403 for a signed-in non-admin user", async () => {
    const res = await callDELETE(VISITOR);
    expect(res.status).toBe(403);
  });

  it("lets an admin through", async () => {
    const res = await callDELETE(ADMIN);
    expect(res.status).toBe(503);
  });

  it("accepts a valid ANALYTICS_SECRET header", async () => {
    vi.stubEnv("ANALYTICS_SECRET", "s3cret");
    const res = await callDELETE(null, { "x-analytics-secret": "s3cret" });
    expect(res.status).toBe(503);
  });
});
