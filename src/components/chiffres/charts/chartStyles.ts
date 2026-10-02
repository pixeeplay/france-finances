import type { CSSProperties } from "react";

/** Styles partagés des info-bulles recharts (tokens du thème). */
export const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--foreground)",
  fontSize: "12px",
  maxWidth: "240px",
  whiteSpace: "normal",
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "var(--foreground)",
  fontWeight: 600,
};

export const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "var(--foreground)",
};

export const TOOLTIP_WRAPPER_STYLE: CSSProperties = {
  zIndex: 40,
};

export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 } as const;
