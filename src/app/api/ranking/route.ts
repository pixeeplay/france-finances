import type { NextRequest } from "next/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError, rateLimit } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/ranking
 * Returns top players ranked by XP computed from their sessions.
 * XP formula: per session = (totalCards * 10) + 50 + (level3 ? 100 : 0) + (speedrunner ? 100 : 0)
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "ranking", 30);
  if (limited) return limited;

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  try {
    const rows = await db!
      .select({
        userId: sessions.userId,
        username: users.name,
        xp: sql<number>`sum(
          (${sessions.totalCards} * 10) + 50
          + (case when ${sessions.level} = 3 then 100 else 0 end)
          + (case when ${sessions.archetypeId} = 'speedrunner' then 100 else 0 end)
        )::int`,
        totalSessions: sql<number>`count(*)::int`,
        totalCards: sql<number>`sum(${sessions.totalCards})::int`,
        lastArchetypeId: sql<string>`(array_agg(${sessions.archetypeId} order by ${sessions.createdAt} desc))[1]`,
        lastArchetypeName: sql<string>`(array_agg(${sessions.archetypeName} order by ${sessions.createdAt} desc))[1]`,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.userId, users.id))
      .groupBy(sessions.userId, users.name)
      .orderBy(desc(sql`sum(
        (${sessions.totalCards} * 10) + 50
        + (case when ${sessions.level} = 3 then 100 else 0 end)
        + (case when ${sessions.archetypeId} = 'speedrunner' then 100 else 0 end)
      )`))
      .limit(50);

    const players = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      username: r.username ?? "Anonyme",
      xp: r.xp,
      level: Math.floor(r.xp / 500) + 1,
      archetypeId: r.lastArchetypeId,
      archetypeName: r.lastArchetypeName,
      totalSessions: r.totalSessions,
      totalCards: r.totalCards,
    }));

    return jsonOk({ players }, 60);
  } catch (error) {
    console.error("[GET /api/ranking]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
