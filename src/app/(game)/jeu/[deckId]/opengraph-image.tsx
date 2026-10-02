import { ImageResponse } from "next/og";
import decksMeta from "@/data/decks-meta.json";
import { OG_COLORS, OG_MONO, OG_SERIF, loadOgFonts } from "@/lib/og";

export const runtime = "edge";
export const alt = "france-finances.com — Deck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** SEC-20: Strip HTML/script tags and limit length to prevent injection in OG image params. */
function sanitizeParam(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 200);
}

// Next 16 : `params` est une Promise pour les images de métadonnées.
export default async function OgImage({ params }: { params: Promise<{ deckId: string }> }) {
  const deckId = sanitizeParam((await params).deckId);
  const deck = decksMeta.decks.find((d) => d.id === deckId);
  const name = deck?.name ?? "Deck inconnu";
  const description = deck?.description ?? "";
  const cardCount = deck?.cardCount ?? 0;
  const kicker = deck?.type === "thematic" ? "DOSSIER" : "CATÉGORIE";
  const brand = "france-finances.com";
  const fonts = await loadOgFonts(`${kicker} ${name} ${description} ${cardCount} cartes Budget Swipe ${brand} 0123456789`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG_COLORS.background,
          color: OG_COLORS.text,
          padding: "64px 80px",
          fontFamily: OG_SERIF,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: `2px solid ${OG_COLORS.text}`,
            paddingBottom: 16,
            fontFamily: OG_MONO,
            fontSize: 22,
            letterSpacing: "0.08em",
            color: OG_COLORS.muted,
          }}
        >
          <span>{kicker}</span>
          <span>{`${cardCount} cartes`}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: OG_COLORS.muted, marginTop: 20, maxWidth: 900 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: OG_MONO, fontSize: 22, color: OG_COLORS.muted }}>
          <span>Budget Swipe</span>
          <span>{brand}</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
