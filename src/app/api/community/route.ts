import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { votes } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/community
 * Returns aggregated vote counts per card.
 * Response: { [cardId]: { keep: N, cut: N, reinforce: N, unjustified: N, total: N } }
 */
export async function GET() {
  if (!isDbAvailable() || !db) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    const rows = await db
      .select({
        cardId: votes.cardId,
        direction: votes.direction,
        count: sql<number>`count(*)::int`,
      })
      .from(votes)
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

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch community votes:", error);
    return NextResponse.json({}, { status: 200 });
  }
}
