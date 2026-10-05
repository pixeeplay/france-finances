import type { MetadataRoute } from "next";
import decksData from "@/data";
import { getVisibleDossiers } from "@/data/dossiers";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://france-finances.com";
  const decks = decksData.decks;

  const now = new Date();
  // Dossiers publiés seulement (le sitemap est généré au build de production)
  const dossiers = getVisibleDossiers().filter((d) => d.status === "publie");

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/jeu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/jeu/quotidien`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/chiffres`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulateur`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...(dossiers.length > 0
      ? [
          { url: `${baseUrl}/dossiers`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
          ...dossiers.map((d) => ({
            url: `${baseUrl}/dossiers/${d.slug}`,
            lastModified: new Date(d.updatedAt),
            changeFrequency: "monthly" as const,
            priority: 0.7,
          })),
        ]
      : []),
    { url: `${baseUrl}/lexique`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/classement`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/categories`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...decks.map((deck) => ({
      url: `${baseUrl}/categories/${deck.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/contribuer`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/profil`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/infos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/infos/confidentialite`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
