import { ImageResponse } from "next/og";
import { HEADLINE_FIGURE } from "@/data/headline";
import { formatBillions } from "@/lib/format";
import { OG_COLORS, OG_MONO, OG_SERIF, loadOgFonts } from "@/lib/og";

export const runtime = "edge";
export const alt = "france-finances.com — Comprendre les finances publiques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const figure = formatBillions(HEADLINE_FIGURE.amountBillions);
  const kicker = "BUDGET DE LA FRANCE";
  const title = "Où va l'argent public ?";
  const caption = `de dépenses publiques en ${HEADLINE_FIGURE.year}. Source : INSEE.`;
  const brand = "france-finances.com";
  const fonts = await loadOgFonts(`${kicker} ${title} ${figure} ${caption} ${brand} Budget Swipe 0123456789`);

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
          <span>Budget Swipe</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 160, fontWeight: 600, lineHeight: 1, marginTop: 24, letterSpacing: "-0.03em" }}>
            {figure}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: OG_COLORS.muted, marginTop: 12 }}>{caption}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: OG_MONO, fontSize: 22, color: OG_COLORS.muted }}>
          {brand}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
