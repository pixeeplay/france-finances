/**
 * Formatage éditorial des montants (convention française).
 * - virgule décimale, espace insécable pour les milliers (U+00A0) : la police
 *   d'affichage (Outfit) dessine l'espace fine U+202F de Intl avec une chasse
 *   quasi nulle (« 52030 € »), on la remplace donc par l'espace insécable
 * - espace insécable entre le nombre et l'unité (U+00A0)
 */

const NBSP = " ";

const NARROW_NBSP = /\u202f/g;

/** Formateur fr-FR dont le séparateur de milliers est l'espace insécable. */
function frFormatter(options: Intl.NumberFormatOptions): { format: (n: number) => string } {
  const fmt = new Intl.NumberFormat("fr-FR", options);
  return { format: (n: number) => fmt.format(n).replace(NARROW_NBSP, NBSP) };
}

const frInteger = frFormatter({ maximumFractionDigits: 0 });
const frOneDecimal = frFormatter({ maximumFractionDigits: 1 });

/**
 * Montant exprimé en milliards d'euros -> libellé lisible.
 * 47.2 -> "47,2 Md€" ; 1260 -> "1 260 Md€" ; 0.03 -> "30 M€" ; 0 -> "0 €".
 */
export function formatBillions(amountBillions: number): string {
  if (!Number.isFinite(amountBillions) || amountBillions <= 0) return `0${NBSP}€`;
  if (amountBillions < 1) {
    const millions = amountBillions * 1000;
    const fmt = millions < 10 ? frOneDecimal : frInteger;
    return `${fmt.format(millions)}${NBSP}M€`;
  }
  const fmt = amountBillions >= 100 ? frInteger : frOneDecimal;
  return `${fmt.format(amountBillions)}${NBSP}Md€`;
}

/** Montant en euros -> "5 440 €" (arrondi à l'euro). */
export function formatEuros(amount: number): string {
  if (!Number.isFinite(amount)) return `0${NBSP}€`;
  return `${frInteger.format(Math.round(amount))}${NBSP}€`;
}

/** Pourcentage -> "42 %" (arrondi à l'unité). */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return `0${NBSP}%`;
  return `${frInteger.format(Math.round(value))}${NBSP}%`;
}

/** Domaine de l'échelle des ordres de grandeur : 10 M€ -> 1 000 Md€. */
export const AMOUNT_SCALE_MIN = 0.01;
export const AMOUNT_SCALE_MAX = 1000;

/**
 * Position (0..1) d'un montant en Md€ sur une échelle logarithmique.
 * Les valeurs hors domaine sont bornées.
 */
export function amountScalePosition(
  amountBillions: number,
  min: number = AMOUNT_SCALE_MIN,
  max: number = AMOUNT_SCALE_MAX,
): number {
  if (!Number.isFinite(amountBillions) || amountBillions <= min) return 0;
  if (amountBillions >= max) return 1;
  return (Math.log10(amountBillions) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
}

/*
 * Formats « tableaux de chiffres » (pages /chiffres et /simulateur) :
 * précision fixe, valeurs négatives acceptées, pas de bascule en M€.
 */

/** Ratio -> pourcentage : 0.1234 -> « 12,3 % » */
export function formatRatio(ratio: number, digits = 1): string {
  return frFormatter({
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

/** Montant en Md€ à précision fixe : 89.645 -> « 89,6 Md€ » ; -170.5 -> « -170,5 Md€ » */
export function formatBillionsExact(valueBn: number, digits = 1): string {
  const n = frFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(valueBn);
  return `${n}${NBSP}Md€`;
}

/** 3_595.5 -> « 3 595,5 » */
export function formatNumber(value: number, digits = 0): string {
  return frFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}
