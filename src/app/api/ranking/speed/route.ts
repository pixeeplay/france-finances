import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { sessions, users } from "@/db/schema";
import { sql, eq, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/ranking/speed
 * Returns top players ranked by average decision speed (ms per card).
 * Only includes players with at least 3 sessions.
 */
export async function GET() {
  if (!isDbAvailable() || !db) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const rows = await db
      .select({
        userId: sessions.userId,
        username: users.name,
        avgMsPerCard: sql<number>`(sum(${sessions.totalDurationMs})::float / nullif(sum(${sessions.totalCards}), 0))::int`,
        totalSessions: sql<number>`count(*)::int`,
        totalCards: sql<number>`sum(${sessions.totalCards})::int`,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .groupBy(sessions.userId, users.name)
      .having(sql`count(*) >= 3`)
      .orderBy(sql`sum(${sessions.totalDurationMs})::float / nullif(sum(${sessions.totalCards}), 0) asc`)
      .limit(50);

    const players = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      username: r.username ?? "Anonyme",
      avgMsPerCard: r.avgMsPerCard,
      totalSessions: r.totalSessions,
      totalCards: r.totalCards,
    }));

    return NextResponse.json(
      { players },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch speed ranking:", error);
    return NextResponse.json(
      { ok: false, error: "Database error" },
      { status: 500 }
    );
  }
}
