import { db, isDbAvailable } from "@/db";
import { sessions, votes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats/public
 * Returns public stats for the landing page (no auth required).
 * Gracefully degrades if DB is unavailable.
 */
export async function GET() {
  if (!isDbAvailable() || !db) {
    return jsonOk({ totalSessions: 0, totalSwipes: 0 }, 60);
  }

  try {
    const [sessionRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessions);

    const [voteRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(votes);

    return jsonOk({
      totalSessions: sessionRow?.count ?? 0,
      totalSwipes: voteRow?.count ?? 0,
    }, 60);
  } catch (error) {
    console.error("[GET /api/stats/public]", error instanceof Error ? error.message : error);
    return jsonOk({ totalSessions: 0, totalSwipes: 0 });
  }
}
