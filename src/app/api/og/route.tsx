import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { OG_COLORS, OG_MONO, OG_SERIF, OG_SIZE, loadOgFonts } from "@/lib/og";

export const runtime = "edge";

const ARCHETYPES: Record<string, string> = {
  // Level 1
  austeritaire: "L'Austéritaire",
  gardien: "Le Gardien",
  tranchant: "Le Tranchant",
  protecteur: "Le Protecteur",
  equilibriste: "L'Équilibriste",
  speedrunner: "Le Speedrunner",
  bucheron: "Le Bûcheron",
  elagueur: "L'Élagueur",
  // Level 2
  stratege: "Le Stratège",
  reformateur: "Le Réformateur",
  demolisseur: "Le Démolisseur",
  conservateur: "Le Conservateur",
  sceptique: "Le Sceptique",
  chirurgien: "Le Chirurgien",
  // Level 3
  auditeur_rigoureux: "L'Auditeur rigoureux",
  liquidateur_en_chef: "Le Liquidateur en chef",
  investisseur_public: "L'Investisseur public",
  optimisateur: "L'Optimisateur",
};

function clampInt(raw: string | null, fallback: number, max: number): number {
  const n = parseInt(raw ?? String(fallback), 10);
  return Math.max(0, Math.min(max, isNaN(n) ? fallback : n));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const archetype = searchParams.get("archetype") ?? "equilibriste";

  // Clamp numeric values to valid ranges
  const keepPercent = clampInt(searchParams.get("keepPercent"), 50, 100);
  const cutPercent = clampInt(searchParams.get("cutPercent"), 50, 100);
  const totalCards = clampInt(searchParams.get("totalCards"), 10, 999);

  const name = ARCHETYPES[archetype] ?? ARCHETYPES.equilibriste;
  const barTotal = keepPercent + cutPercent || 1;

  const kicker = "PROFIL BUDGÉTAIRE";
  const brand = "france-finances.com";
  const fonts = await loadOgFonts(
    `${kicker} ${name} 0123456789 % OK À REVOIR cartes jouées Budget Swipe ${brand}`,
  );

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
        {/* Surtitre */}
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
          <span>{`${totalCards} cartes jouées`}</span>
        </div>

        {/* Archétype */}
        <div style={{ display: "flex", fontSize: 96, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {name}
        </div>

        {/* Répartition : barre empilée 100 % */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 20, width: "100%", backgroundColor: OG_COLORS.rule }}>
            <div style={{ display: "flex", height: "100%", width: `${(keepPercent / barTotal) * 100}%`, backgroundColor: OG_COLORS.keep }} />
            <div style={{ display: "flex", height: "100%", width: `${(cutPercent / barTotal) * 100}%`, backgroundColor: OG_COLORS.cut }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: OG_MONO, fontSize: 22, letterSpacing: "0.08em", color: OG_COLORS.keep }}>OK</span>
              <span style={{ fontSize: 64, fontWeight: 600 }}>{`${keepPercent} %`}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontFamily: OG_MONO, fontSize: 22, letterSpacing: "0.08em", color: OG_COLORS.cut }}>À REVOIR</span>
              <span style={{ fontSize: 64, fontWeight: 600 }}>{`${cutPercent} %`}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: OG_MONO,
            fontSize: 22,
            color: OG_COLORS.muted,
          }}
        >
          <span>Budget Swipe</span>
          <span>{brand}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
