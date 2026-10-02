import { ImageResponse } from "next/og";
import { HEADLINE_FIGURE, headlinePerCapita } from "@/data/headline";
import { TOTAL_CARD_COUNT } from "@/lib/deckMeta";
import { formatBillions, formatEuros } from "@/lib/format";
import { OG_COLORS, OG_SIZE, OgCta, OgFigure, OgFrame, OgTitle, OgVoteLegend, ogImageOptions } from "@/lib/og";

export const runtime = "edge";
export const alt = `Où va l'argent public ? ${formatBillions(HEADLINE_FIGURE.amountBillions)} de dépense publique en ${HEADLINE_FIGURE.year}. france-finances.com`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        footerLeft={<OgVoteLegend />}
        footerRight={<OgCta>{`Trier ${TOTAL_CARD_COUNT} dépenses`}</OgCta>}
      >
        <OgTitle size={72}>Où va l&apos;argent public ?</OgTitle>
        <div style={{ display: "flex", marginTop: 18 }}>
          <OgFigure value={formatBillions(HEADLINE_FIGURE.amountBillions)} size={168} />
        </div>
        <div style={{ display: "flex", fontSize: 36, color: OG_COLORS.text, marginTop: 14 }}>
          {`de dépense publique en ${HEADLINE_FIGURE.year}, soit ${formatEuros(headlinePerCapita())} par habitant`}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: OG_COLORS.subtle, marginTop: 10 }}>
          Source : Insee (État, Sécurité sociale et collectivités)
        </div>
      </OgFrame>
    ),
    await ogImageOptions(),
  );
}
