import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getArchetypeById } from "@/lib/archetypeNames";
import { OG_COLORS, OgChainsaw, OgCta, OgFigure, OgFrame, OgPill, OgShield, OgTitle, ogImageOptions } from "@/lib/og";

export const runtime = "edge";

function clampInt(raw: string | null, fallback: number, max: number): number {
  const n = parseInt(raw ?? String(fallback), 10);
  return Math.max(0, Math.min(max, isNaN(n) ? fallback : n));
}

/**
 * Image de partage d'un profil budgétaire (pages /partage et /profil).
 * Paramètres : archetype, keepPercent, cutPercent, totalCards.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const archetype = getArchetypeById(searchParams.get("archetype"));

  // Valeurs bornées : l'URL est publique et modifiable à la main
  const keepPercent = clampInt(searchParams.get("keepPercent"), 50, 100);
  const cutPercent = clampInt(searchParams.get("cutPercent"), 50, 100);
  const totalCards = clampInt(searchParams.get("totalCards"), 10, 9999);
  const barTotal = keepPercent + cutPercent || 1;

  return new ImageResponse(
    (
      <OgFrame
        pill={<OgPill color={OG_COLORS.title}>Mon profil budgétaire</OgPill>}
        footerLeft={
          <div style={{ display: "flex", fontSize: 28, color: OG_COLORS.subtle }}>
            {totalCards > 0 ? `${totalCards} dépenses publiques triées` : "Dépenses publiques triées"}
          </div>
        }
        footerRight={<OgCta>Et vous ?</OgCta>}
      >
        <OgTitle size={archetype.name.length > 18 ? 84 : 100}>{archetype.name}</OgTitle>
        <div style={{ display: "flex", fontSize: 36, color: OG_COLORS.text, marginTop: 14 }}>{archetype.tagline}</div>

        {/* Répartition garder / à revoir */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <OgShield size={56} />
              <OgFigure value={`${keepPercent} %`} size={64} color={OG_COLORS.keepLight} />
              <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: OG_COLORS.keepLight }}>gardé</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: OG_COLORS.amount }}>à revoir</div>
              <OgFigure value={`${cutPercent} %`} size={64} />
              <OgChainsaw size={56} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              height: 22,
              width: "100%",
              marginTop: 18,
              borderRadius: 999,
              overflow: "hidden",
              backgroundColor: OG_COLORS.rule,
            }}
          >
            <div style={{ display: "flex", height: "100%", width: `${(keepPercent / barTotal) * 100}%`, backgroundColor: OG_COLORS.keep }} />
            <div style={{ display: "flex", height: "100%", width: `${(cutPercent / barTotal) * 100}%`, backgroundColor: OG_COLORS.cut }} />
          </div>
        </div>
      </OgFrame>
    ),
    await ogImageOptions(),
  );
}
