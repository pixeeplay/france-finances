import { z } from "zod";
import { auth } from "@/auth";
import { db, isDbAvailable } from "@/db";
import { sessions, votes, auditResponses } from "@/db/schema";
import { dbUnavailableResponse, jsonOk, jsonError } from "@/lib/api-utils";

const VALID_DIRECTIONS = ["keep", "cut", "reinforce", "unjustified"] as const;
const VALID_RECOMMENDATIONS = ["maintenir", "reduire", "fusionner", "externaliser", "supprimer"] as const;

/** Card IDs follow the pattern: 2-4 lowercase letters, hyphen, 2-3 digits (e.g. "def-01", "fre-10") */
const CARD_ID_REGEX = /^[a-z]{2,4}-\d{2,3}$/;

const voteSchema = z.object({
  cardId: z.string().min(1).max(50).regex(CARD_ID_REGEX, "Invalid cardId format. Expected pattern: xx-00 (e.g. def-01)"),
  direction: z.enum(VALID_DIRECTIONS),
  durationMs: z.number().int().min(0).max(600000),
});

const auditResponseSchema = z.object({
  cardId: z.string().min(1).max(50).regex(CARD_ID_REGEX, "Invalid cardId format"),
  diagnostics: z.record(z.string(), z.boolean()),
  recommendation: z.enum(VALID_RECOMMENDATIONS),
});

const sessionSchema = z.object({
  id: z.string().uuid(),
  deckId: z.string().min(1).max(50),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  archetypeId: z.string().min(1).max(50),
  archetypeName: z.string().min(1).max(100),
  totalDurationMs: z.number().int().min(0).max(3600000),
  totalCards: z.number().int().min(1).max(50),
  keepCount: z.number().int().min(0),
  cutCount: z.number().int().min(0),
  reinforceCount: z.number().int().min(0).optional().default(0),
  unjustifiedCount: z.number().int().min(0).optional().default(0),
  totalKeptBillions: z.number().min(0),
  totalCutBillions: z.number().min(0),
  votes: z.array(voteSchema).min(1).max(50),
  auditResponses: z.array(auditResponseSchema).optional(),
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests
const RATE_WINDOW = 60_000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonError("Too many requests", 429);
  }

  if (!isDbAvailable() || !db) {
    return dbUnavailableResponse();
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error("[POST /api/sessions] Invalid JSON:", error instanceof Error ? error.message : error);
    return jsonError("Invalid JSON", 400);
  }

  const parsed = sessionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError("Validation failed", 400);
  }

  const body = parsed.data;

  try {
    // Link session to authenticated user if available
    const authSession = await auth();
    const userId = authSession?.user?.id ?? null;

    await db.transaction(async (tx) => {
      await tx.insert(sessions).values({
        id: body.id,
        userId,
        deckId: body.deckId,
        level: body.level,
        archetypeId: body.archetypeId,
        archetypeName: body.archetypeName,
        totalDurationMs: body.totalDurationMs,
        totalCards: body.totalCards,
        keepCount: body.keepCount,
        cutCount: body.cutCount,
        reinforceCount: body.reinforceCount,
        unjustifiedCount: body.unjustifiedCount,
        totalKeptBillions: body.totalKeptBillions,
        totalCutBillions: body.totalCutBillions,
      }).onConflictDoNothing();

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

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("[POST /api/sessions]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
