import type { CSSProperties } from "react";

/** Police d'affichage (Outfit) pour les valeurs et chiffres des graphiques. */
export const DISPLAY_FONT = "var(--ff-display), var(--ff-sans), ui-sans-serif, system-ui, sans-serif";

/** Styles partagés des info-bulles recharts (tokens du thème). */
export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
  color: "var(--foreground)",
  fontSize: "12px",
  maxWidth: "240px",
  whiteSpace: "normal",
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "var(--foreground)",
  fontFamily: DISPLAY_FONT,
  fontWeight: 800,
};

export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "var(--foreground)",
};

export const TOOLTIP_WRAPPER_STYLE: CSSProperties = {
  zIndex: 40,
};

export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 } as const;
