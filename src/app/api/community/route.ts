import type { NextRequest } from "next/server";
import { db } from "@/db";
import { votes } from "@/db/schema";
import { sql, inArray } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError, rateLimit } from "@/lib/api-utils";
import { parseCommunityCardIds } from "@/lib/sessionFeedback";

export const dynamic = "force-dynamic";

/**
 * GET /api/community
 * Returns aggregated vote counts per card.
 * Optional `?ids=def-01,san-02` restricts the result to these cards (max 50).
 * Response: { [cardId]: { keep: N, cut: N, reinforce: N, unjustified: N, total: N } }
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "community", 30);
  if (limited) return limited;

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  const ids = parseCommunityCardIds(new URL(request.url).searchParams.get("ids"));
  if (ids !== null && ids.length === 0) {
    return jsonOk({}, 60);
  }

  try {
    const rows = await db!
      .select({
        cardId: votes.cardId,
        direction: votes.direction,
        count: sql<number>`count(*)::int`,
      })
      .from(votes)
      .where(ids ? inArray(votes.cardId, ids) : undefined)
      .groupBy(votes.cardId, votes.direction);

    // Aggregate into a map
    const result: Record<
      string,
      { keep: number; cut: number; reinforce: number; unjustified: number; total: number }
    > = {};

    for (const row of rows) {
      if (!result[row.cardId]) {
        result[row.cardId] = { keep: 0, cut: 0, reinforce: 0, unjustified: 0, total: 0 };
      }
      const dir = row.direction as "keep" | "cut" | "reinforce" | "unjustified";
      if (dir in result[row.cardId]) {
        result[row.cardId][dir] = row.count;
      }
      result[row.cardId].total += row.count;
    }

    return jsonOk(result, 60);
  } catch (error) {
    console.error("[GET /api/community]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
