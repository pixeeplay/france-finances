import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { sessions, users } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/ranking
 * Returns top players ranked by XP computed from their sessions.
 * XP formula: per session = (totalCards * 10) + 50 + (level3 ? 100 : 0) + (speedrunner ? 100 : 0)
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
      .innerJoin(users, eq(sessions.userId, users.id))
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

    return NextResponse.json(
      { players },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch ranking:", error);
    return NextResponse.json(
      { ok: false, error: "Database error" },
      { status: 500 }
    );
  }
}
