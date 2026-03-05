import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { sessions, votes, auditResponses } from "@/db/schema";
import type { VoteDirection, AuditRecommendation } from "@/types";

interface SessionPayload {
  id: string;
  deckId: string;
  level: 1 | 2 | 3;
  archetypeId: string;
  archetypeName: string;
  totalDurationMs: number;
  totalCards: number;
  keepCount: number;
  cutCount: number;
  reinforceCount?: number;
  unjustifiedCount?: number;
  totalKeptBillions: number;
  totalCutBillions: number;
  votes: Array<{
    cardId: string;
    direction: VoteDirection;
    durationMs: number;
  }>;
  auditResponses?: Array<{
    cardId: string;
    diagnostics: Record<string, boolean>;
    recommendation: AuditRecommendation;
  }>;
}

export async function POST(request: Request) {
  if (!isDbAvailable() || !db) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 }
    );
  }

  let body: SessionPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.deckId || !body.archetypeId) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      // Insert session
      await tx.insert(sessions).values({
        id: body.id,
        deckId: body.deckId,
        level: body.level,
        archetypeId: body.archetypeId,
        archetypeName: body.archetypeName,
        totalDurationMs: body.totalDurationMs,
        totalCards: body.totalCards,
        keepCount: body.keepCount,
        cutCount: body.cutCount,
        reinforceCount: body.reinforceCount ?? 0,
        unjustifiedCount: body.unjustifiedCount ?? 0,
        totalKeptBillions: body.totalKeptBillions,
        totalCutBillions: body.totalCutBillions,
      }).onConflictDoNothing();

      // Insert votes
      if (body.votes.length > 0) {
        await tx.insert(votes).values(
          body.votes.map((v) => ({
            sessionId: body.id,
            cardId: v.cardId,
            direction: v.direction,
            durationMs: v.durationMs,
          }))
        );
      }

      // Insert audit responses (Level 3)
      if (body.auditResponses && body.auditResponses.length > 0) {
        await tx.insert(auditResponses).values(
          body.auditResponses.map((r) => ({
            sessionId: body.id,
            cardId: r.cardId,
            diagnostics: r.diagnostics,
            recommendation: r.recommendation,
          }))
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save session:", error);
    return NextResponse.json(
      { ok: false, error: "Database error" },
      { status: 500 }
    );
  }
}
