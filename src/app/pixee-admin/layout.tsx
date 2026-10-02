import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin — La Tronçonneuse de Poche",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin area guard: only users whose email is listed in ADMIN_EMAILS can see it.
 * Anyone else (anonymous or signed-in non-admin) gets a 404, so the route's
 * existence is not revealed. Admins sign in from /profil.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isAdmin(session)) notFound();
  return <>{children}</>;
}
