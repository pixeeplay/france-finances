import { ImageResponse } from "next/og";
import { IR_INCOME_YEAR, IR_YEAR } from "@/data/fiscal-2026";
import { OG_COLORS, OG_SIZE, OgCta, OgFrame, OgPill, OgTitle, ogImageOptions } from "@/lib/og";

export const runtime = "edge";
export const alt = `Simulateur : ce qui est prélevé sur un salaire (impôt sur le revenu, CSG, cotisations, TVA), barème ${IR_YEAR}. france-finances.com`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Les prélèvements estimés par le simulateur, aux couleurs de sens du site. */
const LEVIES: ReadonlyArray<{ label: string; color: string }> = [
  { label: "Impôt sur le revenu", color: "#3B82F6" },
  { label: "CSG", color: "#F59E0B" },
  { label: "Cotisations retraite", color: "#8B5CF6" },
  { label: "TVA", color: "#EF4444" },
];

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        pill={<OgPill color={OG_COLORS.title}>{`Barème ${IR_YEAR} · revenus ${IR_INCOME_YEAR}`}</OgPill>}
        footerLeft={
          <div style={{ display: "flex", fontSize: 26, color: OG_COLORS.subtle }}>
            Calcul dans votre navigateur, rien n&apos;est envoyé
          </div>
        }
        footerRight={<OgCta>Faire le calcul</OgCta>}
      >
        <OgTitle size={80}>Ce qui est prélevé sur un salaire</OgTitle>
        <div style={{ display: "flex", fontSize: 34, color: OG_COLORS.text, marginTop: 16, lineHeight: 1.25 }}>
          Une estimation, puis où va l&apos;argent dans le budget de l&apos;État.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 34 }}>
          {LEVIES.map((levy) => (
            <OgPill key={levy.label} color={levy.color} size={30}>
              {levy.label}
            </OgPill>
          ))}
        </div>
      </OgFrame>
    ),
    await ogImageOptions(),
  );
}
