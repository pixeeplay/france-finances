/**
 * Formatage éditorial des montants (convention française).
 * - virgule décimale, espace fine insécable pour les milliers (U+202F)
 * - espace insécable entre le nombre et l'unité (U+00A0)
 */

const NBSP = " ";

const frInteger = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const frOneDecimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

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
