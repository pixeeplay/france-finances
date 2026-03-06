import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withDbCheck, jsonOk, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  username: z.string().min(1).max(30).optional(),
  image: z.string().max(10).optional(), // emoji avatar
});

/**
 * GET /api/me/profile
 * Returns the authenticated user's profile from DB.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Not authenticated", 401);
  }

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  try {
    const [user] = await db!
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return jsonError("User not found", 404);
    }

    return jsonOk({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
    });
  } catch (error) {
    console.error("[GET /api/me/profile]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}

/**
 * PUT /api/me/profile
 * Update the authenticated user's username and/or avatar.
 */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Not authenticated", 401);
  }

  const unavailable = withDbCheck();
  if (unavailable) return unavailable;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error("[PUT /api/me/profile] Invalid JSON:", error instanceof Error ? error.message : error);
    return jsonError("Invalid JSON", 400);
  }

  const parsed = profileSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError("Validation failed", 400);
  }

  try {
    const updates: Partial<{ name: string; username: string; image: string }> = {};
    if (parsed.data.username) {
      updates.username = parsed.data.username;
      updates.name = parsed.data.username;
    }
    if (parsed.data.image) {
      updates.image = parsed.data.image;
    }

    if (Object.keys(updates).length > 0) {
      await db!.update(users).set(updates).where(eq(users.id, session.user.id));
    }

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("[PUT /api/me/profile]", error instanceof Error ? error.message : error);
    return jsonError("Database error");
  }
}
