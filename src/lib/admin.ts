import { timingSafeEqual } from "crypto";

/**
 * Minimal session shape needed for the admin check.
 * Compatible with the NextAuth `Session` returned by `auth()`.
 */
export interface SessionLike {
  user?: { email?: string | null } | null;
}

/**
 * Parses the ADMIN_EMAILS env variable (comma-separated list).
 * Entries are trimmed and lowercased; empty entries are ignored.
 */
export function getAdminEmails(raw: string | undefined = process.env.ADMIN_EMAILS): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Returns true when the session belongs to an admin, i.e. the user's email
 * is listed in ADMIN_EMAILS (case-insensitive).
 * Fails closed: no session, no email or empty/unset ADMIN_EMAILS -> false.
 */
export function isAdmin(
  session: SessionLike | null | undefined,
  adminEmails: string[] = getAdminEmails(),
): boolean {
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return false;
  return adminEmails.includes(email);
}

/**
 * Checks the ANALYTICS_SECRET shared secret (header `x-analytics-secret`
 * or `?secret=` query param) in constant time.
 * Fails closed when ANALYTICS_SECRET is unset.
 */
export function hasValidAnalyticsSecret(
  provided: string | null | undefined,
  secret: string | undefined = process.env.ANALYTICS_SECRET,
): boolean {
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
