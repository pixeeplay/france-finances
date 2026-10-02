/**
 * Transformations des données de /chiffres en séries prêtes à tracer.
 * Fonctions pures (pas de dépendance à recharts ni au DOM), testées.
 */

import type { AmountItem, DebtPoint, EuCountry } from "@/data/chiffres";

/** Teintes de la palette des graphiques (variables CSS --chart-<tone>). */
export const CHART_TONES = [
  "emerald",
  "blue",
  "amber",
  "red",
  "violet",
  "cyan",
  "pink",
  "lime",
  "orange",
  "teal",
  "slate",
] as const;

export type ChartTone = (typeof CHART_TONES)[number];

/** Couleur CSS d'une teinte (résolue selon le thème clair/sombre). */
export function toneColor(tone: ChartTone): string {
  return `var(--chart-${tone})`;
}

export interface ChartDatum {
  /** Libellé complet (tableau, info-bulle) */
  label: string;
  /** Libellé court pour le graphique */
  shortLabel: string;
  value: number;
  /** Valeur formatée affichée à côté de la barre */
  display: string;
  tone: ChartTone;
  /** Mise en évidence (ex. la France, les intérêts de la dette) */
  highlight?: boolean;
}

/** Hauteurs réservées des graphiques (px), partagées page serveur / composants client. */
export const DEBT_CHART_HEIGHT = 280;
export const DONUT_CHART_HEIGHT = 240;

/** Hauteur d'une ligne du graphique en barres (libellé au-dessus de la barre). */
export const BAR_ROW_HEIGHT = 46;

/** Hauteur totale du graphique en barres pour `rows` lignes (réservée avant chargement). */
export function barsChartHeight(rows: number): number {
  return Math.max(1, rows) * BAR_ROW_HEIGHT + 8;
}

export function sumAmounts(items: readonly AmountItem[]): number {
  return items.reduce((s, i) => s + i.amountBn, 0);
}

/**
 * Libellé court : retire la précision entre parenthèses puis tronque
 * proprement (sur un mot) au-delà de `max` caractères.
 */
export function shortenLabel(label: string, max = 40): string {
  const base = label.replace(/\s*\(.*\)\s*$/, "").trim();
  if (base.length <= max) return base;
  const cut = base.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[,\s]+$/, "")}…`;
}

/** Montant en euros par habitant (montant en Md€). */
export function perCapita(amountBn: number, population: number): number {
  if (!Number.isFinite(amountBn) || population <= 0) return 0;
  return (amountBn * 1e9) / population;
}

export interface Per1000Slice {
  label: string;
  amountBn: number;
  /** Euros sur 1 000 € de dépense, arrondis ; la somme vaut exactement 1 000 */
  euros: number;
  /** Part en % (non arrondie) */
  share: number;
  tone: ChartTone;
}

/**
 * Répartit 1 000 € proportionnellement aux montants (méthode du plus fort
 * reste) : chaque part est arrondie à l'euro et la somme vaut exactement 1 000.
 */
export function splitPer1000(items: readonly AmountItem[], tones: readonly ChartTone[] = CHART_TONES): Per1000Slice[] {
  const total = sumAmounts(items);
  if (total <= 0) return [];
  const raw = items.map((i) => (i.amountBn / total) * 1000);
  const floors = raw.map(Math.floor);
  let remaining = 1000 - floors.reduce((s, v) => s + v, 0);
  const order = raw
    .map((v, idx) => ({ idx, rest: v - Math.floor(v) }))
    .sort((a, b) => b.rest - a.rest || a.idx - b.idx);
  for (const { idx } of order) {
    if (remaining <= 0) break;
    floors[idx] += 1;
    remaining -= 1;
  }
  return items.map((i, idx) => ({
    label: i.label,
    amountBn: i.amountBn,
    euros: floors[idx],
    share: (i.amountBn / total) * 100,
    tone: tones[idx % tones.length],
  }));
}

/**
 * Missions triées par montant décroissant : les `top` premières, puis une
 * ligne « N autres missions » qui regroupe le reste.
 */
export function topWithRest(
  items: readonly AmountItem[],
  top: number,
  restLabel: (count: number) => string,
): AmountItem[] {
  const sorted = [...items].sort((a, b) => b.amountBn - a.amountBn);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top);
  if (rest.length === 0) return head;
  return [...head, { label: restLabel(rest.length), amountBn: sumAmounts(rest) }];
}

/** Données de barres à partir de montants, avec une teinte par ligne. */
export function toBarData(
  items: readonly AmountItem[],
  format: (amountBn: number) => string,
  tones: readonly ChartTone[] = CHART_TONES,
  maxLabel = 40,
): ChartDatum[] {
  return items.map((i, idx) => ({
    label: i.label,
    shortLabel: shortenLabel(i.label, maxLabel),
    value: i.amountBn,
    display: format(i.amountBn),
    tone: tones[idx % tones.length],
  }));
}

export interface ComparisonInput {
  label: string;
  amountBn: number;
  /** Année des données, affichée dans le libellé */
  year: string | number;
  highlight?: boolean;
}

/**
 * Comparaison « par habitant » : euros par habitant, triés décroissants.
 * L'élément mis en évidence est en rouge, les autres en bleu.
 */
export function perCapitaComparison(
  items: readonly ComparisonInput[],
  population: number,
  format: (euros: number) => string,
): ChartDatum[] {
  return items
    .map((i) => {
      const euros = Math.round(perCapita(i.amountBn, population));
      return {
        label: `${i.label} (${i.year})`,
        shortLabel: `${shortenLabel(i.label, 32)} (${i.year})`,
        value: euros,
        display: format(euros),
        tone: (i.highlight ? "red" : "blue") as ChartTone,
        highlight: i.highlight,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export interface DebtSeriesPoint {
  period: string;
  /** Position temporelle (date d'arrêté de la dette, en années décimales) */
  t: number;
  pctGdp: number;
  amountBn: number | null;
}

/**
 * Date d'arrêté d'une période, en années décimales, pour un axe temporel
 * proportionnel : « 2024 » (dette au 31 décembre) -> 2025 ; « T2 2026 »
 * (fin juin) -> 2026,5. NaN si le libellé n'est pas reconnu.
 */
export function periodToTime(period: string): number {
  const quarter = /^T([1-4])\s+(\d{4})$/.exec(period.trim());
  if (quarter) return Number(quarter[2]) + Number(quarter[1]) / 4;
  const year = /^(\d{4})$/.exec(period.trim());
  if (year) return Number(year[1]) + 1;
  return Number.NaN;
}

/** Série de dette pour le graphique en aires (montant null si non publié). */
export function debtSeries(points: readonly DebtPoint[]): DebtSeriesPoint[] {
  return points
    .map((p) => ({ period: p.period, t: periodToTime(p.period), pctGdp: p.pctGdp, amountBn: p.amountBn ?? null }))
    .filter((p) => Number.isFinite(p.t));
}

/** Variation en points de PIB entre le premier et le dernier point. */
export function debtChangePoints(points: readonly DebtPoint[]): number {
  if (points.length < 2) return 0;
  return Math.round((points[points.length - 1].pctGdp - points[0].pctGdp) * 10) / 10;
}

/**
 * Dette en % du PIB par pays, triée décroissante. La France est en rouge,
 * les agrégats (zone euro, UE) en ambre, les autres pays en bleu.
 */
export function euDebtBars(countries: readonly EuCountry[], format: (pct: number) => string): ChartDatum[] {
  const aggregates = new Set(["EA", "EU"]);
  return [...countries]
    .sort((a, b) => b.debtPctGdp - a.debtPctGdp)
    .map((c) => ({
      label: c.country,
      shortLabel: c.country,
      value: c.debtPctGdp,
      display: format(c.debtPctGdp),
      tone: c.highlight ? "red" : aggregates.has(c.code) ? "amber" : "blue",
      highlight: c.highlight,
    }));
}

export interface ShareDatum {
  label: string;
  value: number;
  /** Part arrondie à l'unité */
  pct: number;
  display: string;
  tone: ChartTone;
}

/** Parts d'un total (donut), en % arrondis. */
export function toShares(
  items: readonly AmountItem[],
  format: (amountBn: number) => string,
  tones: readonly ChartTone[] = CHART_TONES,
): ShareDatum[] {
  const total = sumAmounts(items);
  return items.map((i, idx) => ({
    label: i.label,
    value: i.amountBn,
    pct: total > 0 ? Math.round((i.amountBn / total) * 100) : 0,
    display: format(i.amountBn),
    tone: tones[idx % tones.length],
  }));
}
