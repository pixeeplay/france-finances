/** Formatage des montants et pourcentages (locale fr-FR). */

const eurosFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** 1234.5 → « 1 235 € » */
export function formatEuros(value: number): string {
  return eurosFormatter.format(Math.round(value));
}

/** 0.1234 → « 12,3 % » */
export function formatPercent(ratio: number, digits = 1): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

/** 89.645 → « 89,6 Md€ » */
export function formatBillions(valueBn: number, digits = 1): string {
  const n = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(valueBn);
  return `${n} Md€`;
}

/** 3_595.5 → « 3 595,5 » */
export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}
