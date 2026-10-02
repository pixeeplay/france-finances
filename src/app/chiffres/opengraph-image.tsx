import { ImageResponse } from "next/og";
import { CURRENT_DEBT, PUBLIC_FINANCES } from "@/data/chiffres";
import { formatBillions, formatBillionsExact, formatNumber } from "@/lib/format";
import { OG_COLORS, OG_SIZE, OgCta, OgFigure, OgFrame, OgPill, OgTitle, ogImageOptions } from "@/lib/og";

export const runtime = "edge";
export const alt = `Les finances publiques en chiffres : dette de ${formatBillionsExact(CURRENT_DEBT.amountBn)} ${CURRENT_DEBT.period}, déficit de ${formatBillionsExact(PUBLIC_FINANCES.deficitBn)} en ${PUBLIC_FINANCES.year}. Source : Insee.`;
export const size = OG_SIZE;
export const contentType = "image/png";

function Tile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "22px 26px",
        borderRadius: 24,
        backgroundColor: OG_COLORS.card,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: OG_COLORS.text }}>{label}</div>
      <div style={{ display: "flex", marginTop: 10 }}>
        <OgFigure value={value} size={54} />
      </div>
      <div style={{ display: "flex", fontSize: 24, color: OG_COLORS.muted, marginTop: 8 }}>{detail}</div>
    </div>
  );
}

export default async function OgImage() {
  const year = PUBLIC_FINANCES.year;
  return new ImageResponse(
    (
      <OgFrame
        pill={<OgPill color={OG_COLORS.title}>Chiffres officiels</OgPill>}
        footerLeft={
          <div style={{ display: "flex", fontSize: 26, color: OG_COLORS.subtle }}>
            Source : Insee (État, Sécurité sociale et collectivités)
          </div>
        }
        footerRight={<OgCta>Voir les graphiques</OgCta>}
      >
        <OgTitle size={60}>Les finances publiques en chiffres</OgTitle>
        <div style={{ display: "flex", gap: 20, marginTop: 36 }}>
          <Tile
            label="Dette publique"
            value={formatBillions(CURRENT_DEBT.amountBn)}
            detail={`${formatNumber(CURRENT_DEBT.pctGdp, 0)} % du PIB, ${CURRENT_DEBT.period}`}
          />
          <Tile
            label={`Déficit ${year}`}
            value={formatBillionsExact(PUBLIC_FINANCES.deficitBn)}
            detail={`${formatNumber(PUBLIC_FINANCES.deficitPctGdp, 1)} % du PIB`}
          />
          <Tile
            label={`Intérêts ${year}`}
            value={formatBillionsExact(PUBLIC_FINANCES.interestBn)}
            detail="de la dette publique"
          />
        </div>
      </OgFrame>
    ),
    await ogImageOptions(),
  );
}
