/**
 * Chiffre d'ouverture de la landing (« un chiffre fort »).
 * Dépense publique totale (APU : État, Sécurité sociale, collectivités),
 * reprise de la même série que la page /chiffres (dépense par fonction, COFOG)
 * et rapportée à la même population : un seul chiffre sur tout le site.
 */
import { POPULATION_2026, PUBLIC_SPENDING_BY_FUNCTION } from "./chiffres";

const total = PUBLIC_SPENDING_BY_FUNCTION.items.reduce((sum, item) => sum + item.amountBn, 0);

export const HEADLINE_FIGURE = {
  /** Montant en milliards d'euros */
  amountBillions: Math.round(total),
  /** Année des comptes */
  year: Number(PUBLIC_SPENDING_BY_FUNCTION.period),
  /** Population de référence du site (coût par habitant) */
  population: POPULATION_2026,
  source: "Insee, dépenses publiques par fonction en 2024",
} as const;

/** Coût par habitant arrondi à la centaine d'euros. */
export function headlinePerCapita(): number {
  const perCapita = (HEADLINE_FIGURE.amountBillions * 1e9) / HEADLINE_FIGURE.population;
  return Math.round(perCapita / 100) * 100;
}
