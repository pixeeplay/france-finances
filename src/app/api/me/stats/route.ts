import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDbAvailable } from "@/db";
import { sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/stats
 * Returns aggregated stats for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!isDbAvailable() || !db) {
    return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  }

  try {
    const userId = session.user.id;

    const [row] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalCards: sql<number>`coalesce(sum(${sessions.totalCards}), 0)::int`,
        totalKeptBillions: sql<number>`coalesce(sum(${sessions.totalKeptBillions}), 0)::real`,
        totalCutBillions: sql<number>`coalesce(sum(${sessions.totalCutBillions}), 0)::real`,
        auditsN3: sql<number>`count(*) filter (where ${sessions.level} = 3)::int`,
        xp: sql<number>`coalesce(sum(
          (${sessions.totalCards} * 10) + 50
          + (case when ${sessions.level} = 3 then 100 else 0 end)
          + (case when ${sessions.archetypeId} = 'speedrunner' then 100 else 0 end)
        ), 0)::int`,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId));

    const categoryRows = await db
      .select({
        deckId: sessions.deckId,
        count: sql<number>`count(*)::int`,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .groupBy(sessions.deckId);

    const categoriesPlayed = categoryRows.map((r) => r.deckId);
    const sessionsPerDeck: Record<string, number> = {};
    for (const r of categoryRows) {
      sessionsPerDeck[r.deckId] = r.count;
    }

    return NextResponse.json({
      xp: row.xp,
      totalSessions: row.totalSessions,
      totalCards: row.totalCards,
      totalKeptBillions: Math.round(row.totalKeptBillions * 10) / 10,
      totalCutBillions: Math.round(row.totalCutBillions * 10) / 10,
      auditsN3: row.auditsN3,
      categoriesPlayed,
      sessionsPerDeck,
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
  }
}
