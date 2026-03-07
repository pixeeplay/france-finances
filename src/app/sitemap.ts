import type { MetadataRoute } from "next";
import decksData from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://france-finances.com";
  const decks = decksData.decks;

  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/jeu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/classement`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/categories`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...decks.map((deck) => ({
      url: `${baseUrl}/categories/${deck.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/profil`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/infos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/infos/confidentialite`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
