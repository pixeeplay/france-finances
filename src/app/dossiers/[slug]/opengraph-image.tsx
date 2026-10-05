import { ImageResponse } from "next/og";
import { getDossier } from "@/data/dossiers";
import { getDeckColor } from "@/lib/deckMeta";
import { OG_COLORS, OG_SIZE, OgCategoryBadge, OgCta, OgFigure, OgFrame, OgPill, OgTitle, ogImageOptions } from "@/lib/og";

export const runtime = "edge";
export const alt = "Un dossier de france-finances.com : chiffres officiels et sources";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Image de partage d'un dossier : surtitre coloré, titre, chiffre-clé.
 * Un brouillon donne, en production, l'image générique des dossiers.
 */
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Dossiers visibles seulement : rien ne fuite d'un brouillon en production
  const dossier = getDossier(slug);
  const color = getDeckColor(dossier?.deckId ?? "etat");

  return new ImageResponse(
    (
      <OgFrame
        pill={<OgPill color={color}>{`Dossier · ${dossier?.kicker ?? "Finances publiques"}`}</OgPill>}
        footerLeft={
          <div style={{ display: "flex", fontSize: 26, color: OG_COLORS.subtle }}>Chiffres officiels, sources citées</div>
        }
        footerRight={<OgCta>Lire le dossier</OgCta>}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <OgTitle size={dossier && dossier.title.length > 34 ? 62 : 72}>{dossier?.title ?? "Les dossiers"}</OgTitle>
            {dossier ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 34 }}>
                <OgFigure value={dossier.ogFigure.value} size={64} />
                <div style={{ display: "flex", fontSize: 28, color: OG_COLORS.muted, maxWidth: 560 }}>
                  {dossier.ogFigure.label}
                </div>
              </div>
            ) : null}
          </div>
          {dossier ? <OgCategoryBadge deckId={dossier.deckId} size={150} /> : null}
        </div>
      </OgFrame>
    ),
    await ogImageOptions(),
  );
}
