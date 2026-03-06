import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { sessions, votes } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats/public
 * Returns public stats for the landing page (no auth required).
 * Gracefully degrades if DB is unavailable.
 */
export async function GET() {
  if (!isDbAvailable() || !db) {
    return NextResponse.json(
      { totalSessions: 0, totalSwipes: 0 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }

  try {
    const [sessionRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessions);

    const [voteRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(votes);

    return NextResponse.json(
      {
        totalSessions: sessionRow?.count ?? 0,
        totalSwipes: voteRow?.count ?? 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { totalSessions: 0, totalSwipes: 0 },
      { status: 200 }
    );
  }
}
