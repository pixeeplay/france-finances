import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDbAvailable } from "@/db";

/**
 * Returns a 503 JSON response when the database is not available.
 * Usage: if (!isDbAvailable() || !db) return dbUnavailableResponse();
 */
export function dbUnavailableResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Database not configured" },
    { status: 503 }
  );
}

/**
 * Checks DB availability and returns a 503 response if unavailable, or null if DB is ready.
 * Usage:
 *   const unavailable = withDbCheck();
 *   if (unavailable) return unavailable;
 */
export function withDbCheck(): NextResponse | null {
  if (!isDbAvailable()) {
    return dbUnavailableResponse();
  }
  return null;
}

/**
 * Returns a JSON success response with optional Cache-Control header.
 * @param data - The response payload
 * @param cacheSeconds - If provided, sets `public, s-maxage={cacheSeconds}, stale-while-revalidate={cacheSeconds * 5}`
 */
export function jsonOk<T>(data: T, cacheSeconds?: number): NextResponse {
  const headers: HeadersInit = {};
  if (cacheSeconds !== undefined && cacheSeconds > 0) {
    headers["Cache-Control"] = `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 5}`;
  }
  return NextResponse.json(data, { headers });
}

/**
 * Returns a JSON error response.
 * @param message - Error message
 * @param status - HTTP status code (default 500)
 */
export function jsonError(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    { ok: false, error: message },
    { status }
  );
}

// --- Rate limiter (in-memory, per-process) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMaps = new Map<string, Map<string, RateLimitEntry>>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const map of rateLimitMaps.values()) {
    for (const [key, entry] of map) {
      if (entry.resetAt < now) map.delete(key);
    }
  }
}

/**
 * Simple in-memory rate limiter. Returns a 429 response if limit exceeded, or null if OK.
 * @param request - NextRequest (uses x-forwarded-for or fallback IP)
 * @param name - Unique identifier for the rate limit bucket
 * @param maxRequests - Max requests per window (default 30)
 * @param windowMs - Window duration in ms (default 60_000)
 */
export function rateLimit(
  request: NextRequest,
  name: string,
  maxRequests: number = 30,
  windowMs: number = 60_000,
): NextResponse | null {
  cleanupStaleEntries();

  if (!rateLimitMaps.has(name)) {
    rateLimitMaps.set(name, new Map());
  }
  const map = rateLimitMaps.get(name)!;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || entry.resetAt < now) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return jsonError("Too many requests", 429);
  }
  return null;
}
