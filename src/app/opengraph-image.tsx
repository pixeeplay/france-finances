import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "france-finances.com — Comprendre les finances publiques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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

        {/* Flag icon (rendered as colored rectangles) */}
        <div
          style={{
            display: "flex",
            width: 120,
            height: 80,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ flex: 1, backgroundColor: "#002395", display: "flex" }} />
          <div style={{ flex: 1, backgroundColor: "#FFFFFF", display: "flex" }} />
          <div style={{ flex: 1, backgroundColor: "#ED2939", display: "flex" }} />
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#F8FAFC",
            display: "flex",
            alignItems: "baseline",
            marginBottom: 16,
          }}
        >
          <span>france-finances</span>
          <span style={{ color: "#EF4444" }}>.com</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94A3B8",
            display: "flex",
            marginBottom: 40,
          }}
        >
          Comprendre les finances publiques
        </div>

        {/* Stats badges */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#1E293B",
              borderRadius: 12,
              padding: "12px 24px",
              border: "1px solid #334155",
            }}
          >
            <span style={{ fontSize: 24, display: "flex" }}>🎴</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", display: "flex" }}>
              370 cartes
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#1E293B",
              borderRadius: 12,
              padding: "12px 24px",
              border: "1px solid #334155",
            }}
          >
            <span style={{ fontSize: 24, display: "flex" }}>📊</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", display: "flex" }}>
              17 categories
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#1E293B",
              borderRadius: 12,
              padding: "12px 24px",
              border: "1px solid #334155",
            }}
          >
            <span style={{ fontSize: 24, display: "flex" }}>🎮</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", display: "flex" }}>
              Interactif
            </span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            Chaque Euro compte. Chaque citoyen aussi.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
