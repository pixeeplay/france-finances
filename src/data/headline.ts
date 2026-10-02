/**
 * Chiffre d'ouverture de la landing (« un chiffre fort »).
 * Dépense publique totale (APU : État, Sécurité sociale, collectivités).
 * À vérifier/actualiser à chaque publication des comptes nationaux INSEE.
 */
export const HEADLINE_FIGURE = {
  /** Montant en milliards d'euros */
  amountBillions: 1670,
  /** Année des comptes */
  year: 2024,
  /** Population de référence du jeu (coût par habitant) */
  population: 68_000_000,
  source: "INSEE, comptes nationaux des administrations publiques 2024",
} as const;

/** Coût par habitant arrondi à la centaine d'euros. */
export function headlinePerCapita(): number {
  const perCapita = (HEADLINE_FIGURE.amountBillions * 1e9) / HEADLINE_FIGURE.population;
  return Math.round(perCapita / 100) * 100;
}
