/**
 * Fonctions pures des images Open Graph (couleurs, libellés, choix des cartes),
 * séparées du rendu (og.tsx, ogDeck.tsx) pour être testables sans next/og.
 */
import type { Card } from "@/types";

/** Mélange une couleur hex (#RRGGBB) avec du blanc ; ratio = part de la couleur (0..1). */
export function lighten(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = (n >> shift) & 0xff;
    return Math.round(c * ratio + 255 * (1 - ratio));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

/** Couleur hex (#RRGGBB) + opacité (0..1) au format #RRGGBBAA. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  return `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
}

/** Coupe un libellé trop long pour une vignette, au mot près, avec « … ». */
export function truncateLabel(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:(«-]+$/, "")}…`;
}

/**
 * Trois cartes d'exemple d'un deck : la plus grosse, une médiane et la plus
 * petite, pour montrer l'écart des montants. Les cartes sans montant
 * (indicateurs, ratios) sont écartées.
 */
export function pickSampleCards(cards: readonly Card[]): Card[] {
  const sorted = cards.filter((c) => c.amountBillions > 0).sort((a, b) => b.amountBillions - a.amountBillions);
  if (sorted.length <= 3) return sorted;
  return [sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted[sorted.length - 1]];
}
