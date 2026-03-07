import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const ARCHETYPES: Record<string, { icon: string; name: string }> = {
  // Level 1
  austeritaire: { icon: "✂️", name: "L'Austéritaire" },
  gardien: { icon: "🛡️", name: "Le Gardien" },
  tranchant: { icon: "🔪", name: "Le Tranchant" },
  protecteur: { icon: "🏰", name: "Le Protecteur" },
  equilibriste: { icon: "⚖️", name: "L'Équilibriste" },
  speedrunner: { icon: "🔥", name: "Le Speedrunner" },
  // Level 2
  stratege: { icon: "🧠", name: "Le Stratège" },
  reformateur: { icon: "🔧", name: "Le Réformateur" },
  demolisseur: { icon: "💣", name: "Le Démolisseur" },
  conservateur: { icon: "🏛️", name: "Le Conservateur" },
  sceptique: { icon: "🤔", name: "Le Sceptique" },
  chirurgien: { icon: "🔬", name: "Le Chirurgien" },
  // Level 3
  auditeur_rigoureux: { icon: "📋", name: "L'Auditeur rigoureux" },
  liquidateur_en_chef: { icon: "🗑️", name: "Le Liquidateur en chef" },
  investisseur_public: { icon: "📈", name: "L'Investisseur public" },
  optimisateur: { icon: "⚙️", name: "L'Optimisateur" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const archetype = searchParams.get("archetype") ?? "balanced";
  const keepRaw = parseInt(searchParams.get("keepPercent") ?? "50", 10);
  const cutRaw = parseInt(searchParams.get("cutPercent") ?? "50", 10);
  const cardsRaw = parseInt(searchParams.get("totalCards") ?? "10", 10);

  // Clamp numeric values to valid ranges
  const keepPercent = String(Math.max(0, Math.min(100, isNaN(keepRaw) ? 50 : keepRaw)));
  const cutPercent = String(Math.max(0, Math.min(100, isNaN(cutRaw) ? 50 : cutRaw)));
  const totalCards = String(Math.max(0, Math.min(999, isNaN(cardsRaw) ? 10 : cardsRaw)));

  const arch = ARCHETYPES[archetype] ?? ARCHETYPES.equilibriste;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F172A",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top decorative bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #10B981, #34D399, #10B981)",
            display: "flex",
          }}
        />

        {/* Archetype icon */}
        <div
          style={{
            fontSize: 96,
            marginBottom: 16,
            display: "flex",
          }}
        >
          {arch.icon}
        </div>

        {/* Archetype name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "#F8FAFC",
            marginBottom: 12,
            display: "flex",
          }}
        >
          {arch.name}
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700, color: "#10B981", display: "flex" }}>
              {keepPercent}%
            </div>
            <div style={{ fontSize: 18, color: "#94A3B8", marginTop: 4, display: "flex" }}>
              OK
            </div>
          </div>

          <div
            style={{
              width: 2,
              height: 60,
              backgroundColor: "#334155",
              display: "flex",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700, color: "#EF4444", display: "flex" }}>
              {cutPercent}%
            </div>
            <div style={{ fontSize: 18, color: "#94A3B8", marginTop: 4, display: "flex" }}>
              A revoir
            </div>
          </div>

          <div
            style={{
              width: 2,
              height: 60,
              backgroundColor: "#334155",
              display: "flex",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700, color: "#F8FAFC", display: "flex" }}>
              {totalCards}
            </div>
            <div style={{ fontSize: 18, color: "#94A3B8", marginTop: 4, display: "flex" }}>
              cartes
            </div>
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#94A3B8",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              display: "flex",
            }}
          >
            La Tronçonneuse de Poche — nicoquipaie.co
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
