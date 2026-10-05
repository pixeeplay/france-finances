import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

type SessionLike = { user: { email: string } } | null;
type AuthedRequest = NextRequest & { auth: SessionLike };
type ProxyHandler = (req: AuthedRequest) => Response;

/**
 * `auth(handler)` de NextAuth injecte la session dans `req.auth`.
 * Le mock reproduit ce contrat avec une session choisie par test.
 */
function mockAuth(session: SessionLike) {
  vi.doMock("@/auth", () => ({
    auth: (handler: ProxyHandler) => (req: NextRequest) =>
      handler(Object.assign(req, { auth: session })),
  }));
}

async function runProxy(session: SessionLike, path = "/pixee-admin") {
  mockAuth(session);
  const { proxy } = await import("@/proxy");
  const handler = proxy as unknown as (req: NextRequest) => Response;
  return handler(new NextRequest(`http://localhost${path}`));
}

describe("proxy /pixee-admin", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("ADMIN_EMAILS", "admin@france-finances.com");
  });

  afterEach(() => {
    vi.doUnmock("@/auth");
    vi.unstubAllEnvs();
  });

  it("repond 404 (reecriture) a un visiteur anonyme", async () => {
    const res = await runProxy(null);
    expect(res.status).toBe(404);
    expect(res.headers.get("x-middleware-rewrite")).toContain("/__introuvable");
  });

  it("repond 404 a un connecte non admin, y compris sur une sous-page", async () => {
    const res = await runProxy({ user: { email: "visiteur@gmail.com" } }, "/pixee-admin/x");
    expect(res.status).toBe(404);
  });

  it("laisse passer un admin (email insensible a la casse)", async () => {
    const res = await runProxy({ user: { email: "Admin@France-Finances.com" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("ne s'applique qu'a /pixee-admin", async () => {
    mockAuth(null);
    const { config } = await import("@/proxy");
    expect(config.matcher).toEqual(["/pixee-admin", "/pixee-admin/:path*"]);
  });
});
