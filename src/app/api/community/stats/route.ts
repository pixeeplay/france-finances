import type { NextRequest } from "next/server";
import { db } from "@/db";
import { sessions, votes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError, rateLimit } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/community/stats
 * Returns:
 * - archetypeDistribution: { archetypeId, count, percent }[]
 * - categoryStats: { deckId, keepCount, cutCount, total }[]
 * - topCut: { cardId, cutPercent }[]
 * - topProtected: { cardId, keepPercent }[]
 * - totalSessions: number
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "community-stats", 30);
  if (limited) return limited;

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  try {
    // Archetype distribution
    const archetypeRows = await db!
      .select({
        archetypeId: sessions.archetypeId,
        archetypeName: sessions.archetypeName,
        count: sql<number>`count(*)::int`,
      })
      .from(sessions)
      .groupBy(sessions.archetypeId, sessions.archetypeName);

    const totalSessions = archetypeRows.reduce((s, r) => s + r.count, 0);
    const archetypeDistribution = archetypeRows.map((r) => ({
      archetypeId: r.archetypeId,
      archetypeName: r.archetypeName,
      count: r.count,
      percent: totalSessions > 0 ? Math.round((r.count / totalSessions) * 100) : 0,
    }));

    // Per-category stats (from sessions table)
    const categoryRows = await db!
      .select({
        deckId: sessions.deckId,
        keepCount: sql<number>`sum(keep_count)::int`,
        cutCount: sql<number>`sum(cut_count)::int`,
        total: sql<number>`sum(total_cards)::int`,
      })
      .from(sessions)
      .groupBy(sessions.deckId);

    const categoryStats = categoryRows.map((r) => ({
      deckId: r.deckId,
      keepCount: r.keepCount,
      cutCount: r.cutCount,
      total: r.total,
      cutPercent: r.total > 0 ? Math.round((r.cutCount / r.total) * 100) : 0,
    }));

    // Top cut cards (most "à revoir")
    const topCutRows = await db!
      .select({
        cardId: votes.cardId,
        total: sql<number>`count(*)::int`,
        cutCount: sql<number>`count(*) filter (where direction = 'cut' or direction = 'unjustified')::int`,
      })
      .from(votes)
      .groupBy(votes.cardId)
      .having(sql`count(*) >= 5`)
      .orderBy(sql`count(*) filter (where direction = 'cut' or direction = 'unjustified')::float / count(*) desc`)
      .limit(5);

    const topCut = topCutRows.map((r) => ({
      cardId: r.cardId,
      cutPercent: r.total > 0 ? Math.round((r.cutCount / r.total) * 100) : 0,
      totalVotes: r.total,
    }));

    // Top protected cards (most "OK")
    const topProtectedRows = await db!
      .select({
        cardId: votes.cardId,
        total: sql<number>`count(*)::int`,
        keepCount: sql<number>`count(*) filter (where direction = 'keep' or direction = 'reinforce')::int`,
      })
      .from(votes)
      .groupBy(votes.cardId)
      .having(sql`count(*) >= 5`)
      .orderBy(sql`count(*) filter (where direction = 'keep' or direction = 'reinforce')::float / count(*) desc`)
      .limit(5);

    const topProtected = topProtectedRows.map((r) => ({
      cardId: r.cardId,
      keepPercent: r.total > 0 ? Math.round((r.keepCount / r.total) * 100) : 0,
      totalVotes: r.total,
    }));

    return jsonOk({
      archetypeDistribution,
      categoryStats,
      topCut,
      topProtected,
      totalSessions,
    }, 60);
  } catch (error) {
    console.error("[GET /api/community/stats]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
