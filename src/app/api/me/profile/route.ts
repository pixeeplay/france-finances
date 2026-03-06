import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db, isDbAvailable } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!isDbAvailable() || !db) {
    return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  }

  try {
    const [user] = await db
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
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
  }
}

/**
 * PUT /api/me/profile
 * Update the authenticated user's username and/or avatar.
 */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!isDbAvailable() || !db) {
    return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
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
      await db.update(users).set(updates).where(eq(users.id, session.user.id));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
  }
}
