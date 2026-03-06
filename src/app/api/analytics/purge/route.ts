import { NextRequest } from "next/server";
import { db, isDbAvailable } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { lt } from "drizzle-orm";
import { dbUnavailableResponse, jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/analytics/purge
 * Removes analytics_events older than 90 days.
 * Protected by ANALYTICS_SECRET header (same pattern as dashboard endpoint).
 */
export async function DELETE(request: NextRequest) {
  // Auth: require ANALYTICS_SECRET header
  const secret = process.env.ANALYTICS_SECRET;
  if (secret) {
    const provided =
      request.headers.get("x-analytics-secret") ??
      request.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return jsonError("Unauthorized", 401);
    }
  }

  if (!isDbAvailable() || !db) {
    return dbUnavailableResponse();
  }

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  try {
    const result = await db
      .delete(analyticsEvents)
      .where(lt(analyticsEvents.createdAt, cutoff))
      .returning({ id: analyticsEvents.id });

    const deletedCount = result.length;

    return jsonOk({
      ok: true,
      deleted: deletedCount,
      cutoffDate: cutoff.toISOString(),
    });
  } catch (error) {
    console.error("[DELETE /api/analytics/purge]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
