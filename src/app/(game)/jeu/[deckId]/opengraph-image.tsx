import { ImageResponse } from "next/og";
import decksMeta from "@/data/decks-meta.json";

export const runtime = "edge";
export const alt = "france-finances.com — Deck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage({ params }: { params: { deckId: string } }) {
  const deck = decksMeta.decks.find((d) => d.id === params.deckId);
  const name = deck?.name ?? "Deck inconnu";
  const description = deck?.description ?? "";
  const icon = deck?.icon ?? "🎴";
  const cardCount = deck?.cardCount ?? 0;
  const color = deck?.color ?? "#3B82F6";

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
          position: "relative",
        }}
      >
        {/* French flag stripes at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            display: "flex",
          }}
        >
          <div style={{ flex: 1, backgroundColor: "#002395", display: "flex" }} />
          <div style={{ flex: 1, backgroundColor: "#FFFFFF", display: "flex" }} />
          <div style={{ flex: 1, backgroundColor: "#ED2939", display: "flex" }} />
        </div>

        {/* Deck icon */}
        <div
          style={{
            fontSize: 96,
            marginBottom: 24,
            display: "flex",
          }}
        >
          {icon}
        </div>

        {/* Deck name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#F8FAFC",
            display: "flex",
            marginBottom: 12,
          }}
        >
          {name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "#94A3B8",
            display: "flex",
            marginBottom: 36,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          {description}
        </div>

        {/* Card count badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#1E293B",
            borderRadius: 16,
            padding: "14px 32px",
            border: `2px solid ${color}`,
          }}
        >
          <span style={{ fontSize: 28, display: "flex" }}>🎴</span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#F8FAFC",
              display: "flex",
            }}
          >
            {cardCount} cartes
          </span>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#64748B",
              display: "flex",
            }}
          >
            france-finances
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#EF4444",
              display: "flex",
            }}
          >
            .com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
