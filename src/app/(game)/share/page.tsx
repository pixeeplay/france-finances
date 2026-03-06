import { redirect } from "next/navigation";
import type { Metadata } from "next";

const SITE_URL = "https://nicoquipaie.pixeeplay.fr";

const ARCHETYPES: Record<string, string> = {
  austeritaire: "L'Austéritaire",
  gardien: "Le Gardien",
  equilibriste: "L'Équilibriste",
  speedrunner: "Le Speedrunner",
  stratege: "Le Stratège",
  reformateur: "Le Réformateur",
  demolisseur: "Le Démolisseur",
  conservateur: "Le Conservateur",
  sceptique: "Le Sceptique",
  chirurgien: "Le Chirurgien",
  auditeur_rigoureux: "L'Auditeur rigoureux",
  liquidateur_en_chef: "Le Liquidateur en chef",
  investisseur_public: "L'Investisseur public",
  optimisateur: "L'Optimisateur",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; k?: string; c?: string; n?: string }>;
}): Promise<Metadata> {
  const { a, k, c, n } = await searchParams;
  const archetypeId = a ?? "equilibriste";
  const keepPercent = k ?? "50";
  const cutPercent = c ?? "50";
  const totalCards = n ?? "10";
  const name = ARCHETYPES[archetypeId] ?? "L'Équilibriste";

  const ogImageUrl = `${SITE_URL}/api/og?archetype=${archetypeId}&keepPercent=${keepPercent}&cutPercent=${cutPercent}&totalCards=${totalCards}`;

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
