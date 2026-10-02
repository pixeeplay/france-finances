/**
 * Image de partage par défaut (celle de l'accueil, src/app/opengraph-image.tsx).
 *
 * Next ne fusionne pas `openGraph` : une page qui définit son propre bloc
 * `openGraph` perd l'image héritée. Les pages sans image dédiée la reprennent
 * donc explicitement via cette constante.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Où va l'argent public ? Le budget de la France à trier, sur france-finances.com",
} as const;
