import { NextRequest } from "next/server";
import { db, isDbAvailable } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { sql, gte, and } from "drizzle-orm";
import { auth } from "@/auth";
import { dbUnavailableResponse, jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/dashboard?days=7
 * Returns aggregated analytics: pageviews, unique visitors, top events, top pages.
 * Protected by NextAuth session, with ANALYTICS_SECRET as fallback for programmatic access.
 */
export async function GET(request: NextRequest) {
  // Primary auth: NextAuth session
  const session = await auth();
  if (!session?.user) {
    // Fallback: ANALYTICS_SECRET header/query param (for cron jobs, programmatic access)
    const secret = process.env.ANALYTICS_SECRET;
    if (!secret) {
      return jsonError("Unauthorized", 401);
    }
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

  const days = Math.min(
    parseInt(request.nextUrl.searchParams.get("days") ?? "7", 10) || 7,
    90
  );
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const dateFilter = gte(analyticsEvents.createdAt, since);

    // Total events
    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(dateFilter);

    // Unique visitors (by IP)
    const [visitorsRow] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.ip})::int` })
      .from(analyticsEvents)
      .where(dateFilter);

    // Pageviews (event = 'pageview')
    const [pageviewsRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(and(dateFilter, sql`${analyticsEvents.event} = 'pageview'`));

    // Top events
    const topEvents = await db
      .select({
        event: analyticsEvents.event,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(dateFilter)
      .groupBy(analyticsEvents.event)
      .orderBy(sql`count(*) desc`)
      .limit(15);

    // Top pages
    const topPages = await db
      .select({
        page: analyticsEvents.page,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(and(dateFilter, sql`${analyticsEvents.page} is not null`))
      .groupBy(analyticsEvents.page)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    // Events per day
    const perDay = await db
      .select({
        date: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${analyticsEvents.ip})::int`,
      })
      .from(analyticsEvents)
      .where(dateFilter)
      .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

    return jsonOk({
      period: { days, since: since.toISOString() },
      totalEvents: totalRow.count,
      uniqueVisitors: visitorsRow.count,
      pageviews: pageviewsRow.count,
      topEvents,
      topPages,
      perDay,
    });
  } catch (error) {
    console.error("[GET /api/analytics/dashboard]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
