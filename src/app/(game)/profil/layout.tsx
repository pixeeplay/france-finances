import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, isDbAvailable } from "@/db";
import { sessions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { DEFAULT_ARCHETYPE_ID, getArchetypeById, isArchetypeId } from "@/lib/archetypeNames";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";

const SITE_URL = "https://france-finances.com";

export async function generateMetadata(): Promise<Metadata> {
  // Try to get authenticated user's stats for dynamic OG
  let archetypeId = DEFAULT_ARCHETYPE_ID;
  let keepPercent = "50";
  let cutPercent = "50";
  let totalCards = "0";

  try {
    const session = await auth();
    if (session?.user?.id && isDbAvailable() && db) {
      const [row] = await db
        .select({
          archetypeId: sessions.archetypeId,
          totalCards: sql<number>`coalesce(sum(${sessions.totalCards}), 0)::int`,
          keepCount: sql<number>`coalesce(sum(${sessions.keepCount}), 0)::int`,
          cutCount: sql<number>`coalesce(sum(${sessions.cutCount}), 0)::int`,
        })
        .from(sessions)
        .where(eq(sessions.userId, session.user.id))
        .groupBy(sessions.archetypeId)
        .orderBy(desc(sql`count(*)`))
        .limit(1);

      if (row && row.totalCards > 0) {
        archetypeId = isArchetypeId(row.archetypeId) ? row.archetypeId : DEFAULT_ARCHETYPE_ID;
        totalCards = String(row.totalCards);
        const total = row.keepCount + row.cutCount;
        keepPercent = String(Math.round((row.keepCount / total) * 100));
        cutPercent = String(Math.round((row.cutCount / total) * 100));
      }
    }
  } catch {
    // Fallback to defaults
  }

  const { name } = getArchetypeById(archetypeId);
  const ogImageUrl = `${SITE_URL}/api/og?archetype=${archetypeId}&keepPercent=${keepPercent}&cutPercent=${cutPercent}&totalCards=${totalCards}`;
  // Sans partie jouée (visiteur anonyme, robot d'aperçu), pas de faux profil 50/50
  const hasPlayed = totalCards !== "0";
  const ogImage = hasPlayed ? { url: ogImageUrl, width: 1200, height: 630 } : DEFAULT_OG_IMAGE;

  return {
    title: `${name} — Profil — france-finances.com`,
    description: `Archétype : ${name}. ${totalCards} cartes analysées, ${cutPercent}% à revoir. Découvre ton profil budgétaire !`,
    alternates: {
      canonical: "/profil",
    },
    openGraph: {
      title: `${name} — france-finances.com`,
      description: `${cutPercent}% du budget à revoir ! Mon archétype : ${name}. Et toi ?`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — france-finances.com`,
      description: `${cutPercent}% du budget à revoir ! Mon archétype : ${name}. Et toi ?`,
      images: [ogImage.url],
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
