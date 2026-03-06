import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/ranking/speed
 * Returns top players ranked by average decision speed (ms per card).
 * Only includes players with at least 3 sessions.
 */
export async function GET() {
  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  try {
    const rows = await db!
      .select({
        userId: sessions.userId,
        username: users.name,
        avgMsPerCard: sql<number>`(sum(${sessions.totalDurationMs})::float / nullif(sum(${sessions.totalCards}), 0))::int`,
        totalSessions: sql<number>`count(*)::int`,
        totalCards: sql<number>`sum(${sessions.totalCards})::int`,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.userId, users.id))
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

    return jsonOk({ players }, 60);
  } catch (error) {
    console.error("[GET /api/ranking/speed]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
