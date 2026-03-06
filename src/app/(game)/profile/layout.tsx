import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, isDbAvailable } from "@/db";
import { sessions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const SITE_URL = "https://nicoquipaie.pixeeplay.fr";

const ARCHETYPE_NAMES: Record<string, string> = {
  austeritaire: "L'Austenitaire",
  gardien: "Le Gardien",
  tranchant: "Le Tranchant",
  protecteur: "Le Protecteur",
  equilibriste: "L'Equilibriste",
  speedrunner: "Le Speedrunner",
  stratege: "Le Stratege",
  reformateur: "Le Reformateur",
  demolisseur: "Le Demolisseur",
  conservateur: "Le Conservateur",
  sceptique: "Le Sceptique",
  chirurgien: "Le Chirurgien",
  auditeur_rigoureux: "L'Auditeur rigoureux",
  liquidateur_en_chef: "Le Liquidateur en chef",
  investisseur_public: "L'Investisseur public",
  optimisateur: "L'Optimisateur",
};

export async function generateMetadata(): Promise<Metadata> {
  // Try to get authenticated user's stats for dynamic OG
  let archetypeId = "equilibriste";
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
        archetypeId = row.archetypeId;
        totalCards = String(row.totalCards);
        const total = row.keepCount + row.cutCount;
        keepPercent = String(Math.round((row.keepCount / total) * 100));
        cutPercent = String(Math.round((row.cutCount / total) * 100));
      }
    }
  } catch {
    // Fallback to defaults
  }

  const name = ARCHETYPE_NAMES[archetypeId] ?? "L'Équilibriste";
  const ogImageUrl = `${SITE_URL}/api/og?archetype=${archetypeId}&keepPercent=${keepPercent}&cutPercent=${cutPercent}&totalCards=${totalCards}`;

  return {
    title: `${name} — Profil — La Tronçonneuse de Poche`,
    description: `Archétype : ${name}. ${totalCards} cartes analysées, ${cutPercent}% à revoir. Découvre ton profil budgétaire !`,
    openGraph: {
      title: `${name} — La Tronçonneuse de Poche`,
      description: `${cutPercent}% du budget à revoir ! Mon archétype : ${name}. Et toi ?`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — La Tronçonneuse de Poche`,
      description: `${cutPercent}% du budget à revoir ! Mon archétype : ${name}. Et toi ?`,
      images: [ogImageUrl],
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
