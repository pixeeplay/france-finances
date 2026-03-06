import { z } from "zod";
import { db, isDbAvailable } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
  page: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(20),
});

// Rate limit: 30 requests/minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// Common bot patterns to filter from analytics
const BOT_PATTERNS = /bot|crawl|spider|slurp|mediapartners|lighthouse|pagespeed|headless/i;

/**
 * POST /api/analytics
 * Ingests analytics events in batches. Accepts up to 20 events per request.
 */
export async function POST(request: Request) {
  // Filter bots early, before rate limiting
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_PATTERNS.test(ua)) {
    return jsonOk({ ok: true }); // silently skip bot traffic
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonError("Too many requests", 429);
  }

  if (!isDbAvailable() || !db) {
    return jsonOk({ ok: true }); // Silently accept, don't block client
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error("[POST /api/analytics] Invalid JSON:", error instanceof Error ? error.message : error);
    return jsonError("Invalid JSON", 400);
  }

  const parsed = batchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError("Validation failed", 400);
  }

  // RGPD: anonymize IP (zero last octet) and drop raw User-Agent
  const anonymizedIp = ip.includes(".")
    ? ip.split(".").slice(0, 3).join(".") + ".0"
    : ip.includes(":")
      ? ip.replace(/:[\da-f]+$/i, ":0")
      : "unknown";

  try {
    await db.insert(analyticsEvents).values(
      parsed.data.events.map((e) => ({
        event: e.event,
        properties: e.properties,
        page: e.page,
        referrer: e.referrer,
        userAgent: undefined,
        ip: anonymizedIp,
      }))
    );

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("[POST /api/analytics]", error instanceof Error ? error.message : error);
    return jsonOk({ ok: true }); // Don't expose errors to client
  }
}
