import { auth } from "@/auth";
import { db } from "@/db";
import { sessions, votes } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/sessions
 * Returns the authenticated user's session history with votes.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Not authenticated", 401);
  }

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  try {
    const userId = session.user.id;

    // Get all sessions
    const sessionRows = await db!
      .select({
        id: sessions.id,
        deckId: sessions.deckId,
        level: sessions.level,
        archetypeId: sessions.archetypeId,
        archetypeName: sessions.archetypeName,
        totalDurationMs: sessions.totalDurationMs,
        totalCards: sessions.totalCards,
        keepCount: sessions.keepCount,
        cutCount: sessions.cutCount,
        reinforceCount: sessions.reinforceCount,
        unjustifiedCount: sessions.unjustifiedCount,
        totalKeptBillions: sessions.totalKeptBillions,
        totalCutBillions: sessions.totalCutBillions,
        createdAt: sessions.createdAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt))
      .limit(100);

    if (sessionRows.length === 0) {
      return jsonOk({ sessions: [] });
    }

    // Get votes for all sessions in one query
    const sessionIds = sessionRows.map((s) => s.id);
    const voteRows = await db!
      .select({
        sessionId: votes.sessionId,
        cardId: votes.cardId,
        direction: votes.direction,
        durationMs: votes.durationMs,
      })
      .from(votes)
      .where(sql`${votes.sessionId} = any(${sessionIds})`);

    // Group votes by session
    const votesBySession: Record<string, typeof voteRows> = {};
    for (const v of voteRows) {
      if (!votesBySession[v.sessionId]) votesBySession[v.sessionId] = [];
      votesBySession[v.sessionId].push(v);
    }

    const result = sessionRows.map((s) => ({
      id: s.id,
      deckId: s.deckId,
      level: s.level,
      archetypeId: s.archetypeId,
      archetypeName: s.archetypeName,
      totalDurationMs: s.totalDurationMs,
      keepCount: s.keepCount,
      cutCount: s.cutCount,
      totalCards: s.totalCards,
      totalKeptBillions: s.totalKeptBillions,
      totalCutBillions: s.totalCutBillions,
      date: s.createdAt.toISOString(),
      votes: (votesBySession[s.id] ?? []).map((v) => ({
        cardId: v.cardId,
        direction: v.direction,
        duration: v.durationMs,
      })),
    }));

    return jsonOk({ sessions: result });
  } catch (error) {
    console.error("[GET /api/me/sessions]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
