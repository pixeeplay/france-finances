import { OG_SIZE } from "@/lib/og";
import { renderDeckOgImage } from "@/lib/ogDeck";

export const runtime = "edge";
export const alt = "Une catégorie de dépenses publiques sur france-finances.com";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  return renderDeckOgImage(deckId, "Voir les dépenses");
}
