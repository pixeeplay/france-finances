import type { MetadataRoute } from "next";
import decksData from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://france-finances.com";
  const decks = decksData.decks;

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/jeu`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/infos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/infos/confidentialite`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    ...decks.map((deck) => ({
      url: `${baseUrl}/categories/${deck.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
