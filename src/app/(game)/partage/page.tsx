import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DEFAULT_ARCHETYPE_ID, getArchetypeById, isArchetypeId } from "@/lib/archetypeNames";

const SITE_URL = "https://france-finances.com";

/** Entier borné lu dans l'URL (lien de partage modifiable à la main). */
function toCount(raw: string | undefined, fallback: number, max: number): number {
  const value = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : fallback;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; k?: string; c?: string; n?: string }>;
}): Promise<Metadata> {
  const { a, k, c, n } = await searchParams;
  const archetypeId = isArchetypeId(a) ? a : DEFAULT_ARCHETYPE_ID;
  const keepPercent = toCount(k, 50, 100);
  const cutPercent = toCount(c, 50, 100);
  const totalCards = toCount(n, 10, 9999);
  const { name } = getArchetypeById(archetypeId);

  const ogImageUrl = `${SITE_URL}/api/og?${new URLSearchParams({
    archetype: archetypeId,
    keepPercent: String(keepPercent),
    cutPercent: String(cutPercent),
    totalCards: String(totalCards),
  })}`;

  return {
    title: `${name} — La Tronçonneuse de Poche`,
    description: `J'ai tronçonné ${cutPercent}% du budget ! Mon archétype : ${name}. Et toi, quel serait le tien ?`,
    openGraph: {
      title: `${name} — La Tronçonneuse de Poche`,
      description: `J'ai tronçonné ${cutPercent}% du budget sur ${totalCards} dépenses. Et toi ?`,
      url: SITE_URL,
      siteName: "La Tronçonneuse de Poche",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Archétype budgétaire : ${name}`,
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — La Tronçonneuse de Poche`,
      description: `J'ai tronçonné ${cutPercent}% du budget ! Et toi ?`,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: "/partage",
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  // If a bot/crawler visits, they get the metadata above.
  // Human visitors get redirected to the main site.
  const params = await searchParams;
  void params;
  redirect("/");
}
