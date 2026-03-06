import { NextResponse } from "next/server";
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
