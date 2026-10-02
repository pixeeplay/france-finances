/**
 * Données de la page « Les chiffres » (/chiffres).
 *
 * Portées depuis notre contribution à nicoquipaie (branche feat/les-chiffres,
 * février 2026), puis revues en octobre 2026 :
 * - dette, déficit et dépense publique mis à jour avec les comptes 2025 de l'Insee
 *   et la dette à fin juin 2026 ;
 * - crédits par mission repris de l'état B publié par le Sénat (le tableau
 *   d'origine mélangeait missions et compte d'affectation spéciale) ;
 * - comparaison européenne mise à jour avec la notification Eurostat d'avril 2026 ;
 * - projections de dette « maison » retirées (non sourcées).
 *
 * Chaque jeu de données porte sa source et son année.
 */

import type { DataSource } from "@/types/simulator";
import { POPULATION_REFERENCE } from "@/lib/cardSchema";

export interface ChiffresDataset<T> {
  /** Année (ou période) à laquelle se rapportent les montants */
  period: string;
  source: DataSource;
  items: readonly T[];
}

export interface AmountItem {
  label: string;
  /** Montant en milliards d'euros */
  amountBn: number;
}

export interface DebtPoint {
  /** Libellé de la période (année ou trimestre) */
  period: string;
  /** Dette au sens de Maastricht, en % du PIB */
  pctGdp: number;
  /** Dette en milliards d'euros, si publiée dans la source citée */
  amountBn?: number;
}

export interface EuCountry {
  country: string;
  code: string;
  debtPctGdp: number;
  deficitPctGdp: number;
  spendingPctGdp: number;
  highlight?: boolean;
}

// === POPULATION ===

/** Population au 1er janvier 2026 (France entière, Insee, bilan démographique 2025). */
export const POPULATION_2026 = POPULATION_REFERENCE;

export const POPULATION_SOURCE: DataSource = {
  label: "Insee Première n° 2087 — Bilan démographique 2025",
  url: "https://www.insee.fr/fr/statistiques/8719824",
  date: "2026-01",
};

// === COMPTES PUBLICS (toutes administrations publiques) ===

const INSEE_APU_2025: DataSource = {
  label: "Insee Première n° 2106 — Le compte des administrations publiques en 2025",
  url: "https://www.insee.fr/fr/statistiques/8997691",
  date: "2026-05",
};

const INSEE_DETTE_T2_2026: DataSource = {
  label: "Insee — Dette des administrations publiques au 2e trimestre 2026",
  url: "https://www.insee.fr/fr/statistiques/9053525",
  date: "2026-09",
};

export const PUBLIC_FINANCES = {
  year: 2025,
  deficitBn: 152.5,
  deficitPctGdp: 5.1,
  spendingPctGdp: 57.3,
  /** Taux de prélèvements obligatoires, net des crédits d'impôt */
  leviesPctGdp: 43.6,
  /** Charge d'intérêts des administrations publiques */
  interestBn: 64.7,
  source: INSEE_APU_2025,
} as const;

export const CURRENT_DEBT = {
  period: "fin juin 2026",
  amountBn: 3_595.5,
  pctGdp: 119.0,
  source: INSEE_DETTE_T2_2026,
} as const;

export const DEBT_TIMELINE: ChiffresDataset<DebtPoint> = {
  period: "2019-2026",
  source: INSEE_APU_2025,
  items: [
    { period: "2019", pctGdp: 97.9 },
    { period: "2022", pctGdp: 111.4 },
    { period: "2023", pctGdp: 109.5 },
    { period: "2024", pctGdp: 112.6, amountBn: 3_306.1 },
    { period: "2025", pctGdp: 115.7, amountBn: 3_460.5 },
    { period: "T2 2026", pctGdp: 119.0, amountBn: 3_595.5 },
  ],
};

// === BUDGET DE L'ÉTAT 2026 ===

export const STATE_BUDGET_2026 = {
  year: 2026,
  /** Recettes nettes du budget général, en millions d'euros */
  netRevenueM: 325_382,
  /** Dépenses nettes du budget général, en millions d'euros */
  netExpenditureM: 458_859,
  /** Solde budgétaire de l'État (budget général, budgets annexes, comptes spéciaux) */
  balanceM: -134_627,
  source: {
    label: "budget.gouv.fr — Les chiffres clés du budget de l'État pour 2026",
    url: "https://www.budget.gouv.fr/reperes/loi_de_finances/articles/chiffres-cles-budget-etat-2026",
    date: "2026-02",
  } satisfies DataSource,
} as const;

/**
 * Du produit des impôts aux recettes nettes du budget général, loi de finances
 * pour 2026 (article d'équilibre, état A). En millions d'euros. La somme
 * retombe exactement sur STATE_BUDGET_2026.netRevenueM (325 382 M€).
 */
export const STATE_REVENUE_BRIDGE_2026 = {
  year: 2026,
  steps: [
    { label: "Impôts encaissés par l'État (nets des remboursements)", amountM: 363_603 },
    { label: "Recettes non fiscales (dividendes, amendes, redevances…)", amountM: 28_900 },
    { label: "Reversé aux collectivités locales", amountM: -44_824 },
    { label: "Reversé à l'Union européenne", amountM: -28_440 },
    { label: "Fonds de concours et attributions de produits", amountM: 6_143 },
  ],
  source: {
    label: "Légifrance — Loi n° 2026-103 du 19 février 2026 de finances pour 2026, article d'équilibre",
    url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053509625",
    date: "2026-02",
  } satisfies DataSource,
} as const;

/**
 * Recettes fiscales nettes de l'État prévues pour 2026 (projet de loi de
 * finances initial, avant navette), nettes des remboursements et dégrèvements.
 * « Autres recettes fiscales » regroupe les accises sur les énergies (ex-TICPE),
 * les droits de succession, etc. Total : 372,9 Md€. Les recettes nettes du
 * budget (STATE_BUDGET_2026) s'en déduisent après recettes non fiscales et
 * prélèvements sur recettes (collectivités, Union européenne).
 */
export const STATE_TAX_REVENUE_2026: ChiffresDataset<AmountItem> = {
  period: "2026 (PLF initial, octobre 2025)",
  source: {
    label: "Sénat — Rapport général sur le PLF 2026, tome I (le budget de 2026 et son contexte)",
    url: "https://www.senat.fr/rap/l25-139-1/l25-139-19.html",
    date: "2025-11",
  },
  items: [
    { label: "TVA nette", amountBn: 109.1 },
    { label: "Impôt sur le revenu net", amountBn: 104.0 },
    { label: "Impôt sur les sociétés net", amountBn: 59.0 },
    { label: "Autres recettes fiscales (dont accises sur les énergies)", amountBn: 100.8 },
  ],
};

/**
 * Crédits de paiement par mission du budget général (état B), hors mission
 * « Remboursements et dégrèvements » (143,3 Md€), qui correspond à des
 * restitutions d'impôts et non à des dépenses de politiques publiques.
 * Les crédits incluent les contributions au compte d'affectation spéciale
 * « Pensions » (retraites des fonctionnaires de chaque mission).
 */
export const STATE_MISSIONS_2026: ChiffresDataset<AmountItem> = {
  period: "2026 (PLF, texte adopté par le Sénat en première lecture)",
  source: {
    label: "Sénat — PLF 2026, récapitulatif des crédits par mission (état B)",
    url: "https://www.senat.fr/leg/annexes/pjlf2026_credits_senat_partiel.html",
    date: "2025-12",
  },
  items: [
    { label: "Enseignement scolaire", amountBn: 89.65 },
    { label: "Défense", amountBn: 66.73 },
    { label: "Engagements financiers de l'État (dont charge de la dette)", amountBn: 60.34 },
    { label: "Recherche et enseignement supérieur", amountBn: 31.5 },
    { label: "Solidarité, insertion et égalité des chances", amountBn: 29.8 },
    { label: "Sécurités", amountBn: 25.95 },
    { label: "Écologie, développement et mobilité durables", amountBn: 22.91 },
    { label: "Cohésion des territoires", amountBn: 22.46 },
    { label: "Travail, emploi et administration des ministères sociaux", amountBn: 22.12 },
    { label: "Justice", amountBn: 13.06 },
    { label: "Gestion des finances publiques", amountBn: 10.59 },
    { label: "Régimes sociaux et de retraite", amountBn: 6.07 },
    { label: "Administration générale et territoriale de l'État", amountBn: 5.12 },
    { label: "Investir pour la France de 2030", amountBn: 4.35 },
    { label: "Agriculture, alimentation, forêt et affaires rurales", amountBn: 4.08 },
    { label: "Relations avec les collectivités territoriales", amountBn: 4.01 },
    { label: "Culture", amountBn: 3.75 },
    { label: "Aide publique au développement", amountBn: 3.67 },
    { label: "Économie", amountBn: 3.53 },
    { label: "Action extérieure de l'État", amountBn: 3.46 },
    { label: "Outre-mer", amountBn: 3.29 },
    { label: "Immigration, asile et intégration", amountBn: 2.16 },
    { label: "Monde combattant, mémoire et liens avec la Nation", amountBn: 1.74 },
    { label: "Santé", amountBn: 1.48 },
    { label: "Sport, jeunesse et vie associative", amountBn: 1.25 },
    { label: "Pouvoirs publics", amountBn: 1.14 },
    { label: "Direction de l'action du Gouvernement", amountBn: 1.05 },
    { label: "Conseil et contrôle de l'État", amountBn: 0.86 },
    { label: "Médias, livre et industries culturelles", amountBn: 0.71 },
    { label: "Transformation et fonction publiques", amountBn: 0.52 },
    { label: "Crédits non répartis", amountBn: 0.13 },
  ],
};

// === DÉPENSE PUBLIQUE PAR FONCTION (COFOG) ===

export const PUBLIC_SPENDING_BY_FUNCTION: ChiffresDataset<AmountItem> = {
  period: "2024",
  source: {
    label: "Insee Première n° 2093 — Dépenses publiques par fonction en 2024 (COFOG)",
    url: "https://www.insee.fr/fr/statistiques/8735252",
    date: "2026-02",
  },
  items: [
    { label: "Protection sociale", amountBn: 693 },
    { label: "Santé", amountBn: 261 },
    { label: "Services publics généraux (dont intérêts de la dette)", amountBn: 181 },
    { label: "Affaires économiques", amountBn: 166 },
    { label: "Enseignement", amountBn: 149 },
    { label: "Défense", amountBn: 54 },
    { label: "Ordre et sécurité publics", amountBn: 52 },
    { label: "Loisirs, culture et culte", amountBn: 43 },
    { label: "Logement et équipements collectifs", amountBn: 42 },
    { label: "Protection de l'environnement", amountBn: 30 },
  ],
};

export const SOCIAL_PROTECTION: ChiffresDataset<AmountItem> = {
  period: "2024",
  source: PUBLIC_SPENDING_BY_FUNCTION.source,
  items: [
    { label: "Vieillesse (retraites)", amountBn: 375 },
    { label: "Maladie et invalidité", amountBn: 92 },
    { label: "Famille et enfants", amountBn: 67 },
    { label: "Chômage", amountBn: 49 },
    { label: "Survivants (pensions de réversion)", amountBn: 43 },
    { label: "Exclusion sociale (RSA, etc.)", amountBn: 35 },
    { label: "Logement (aides personnelles)", amountBn: 16 },
    { label: "Administration et autres", amountBn: 16 },
  ],
};

/** Dépense courante de santé au sens international (DCSi) : inclut complémentaires et reste à charge. */
export const HEALTH_SPENDING: ChiffresDataset<AmountItem> = {
  period: "2024",
  source: {
    label: "DREES — Les dépenses de santé en 2024 (édition 2025)",
    url: "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/250930-Panorama-d%C3%A9penses-de-sant%C3%A9",
    date: "2025-09",
  },
  items: [
    { label: "Soins hospitaliers", amountBn: 120.8 },
    { label: "Soins ambulatoires (ville)", amountBn: 77.8 },
    { label: "Soins de longue durée", amountBn: 52.2 },
    { label: "Médicaments", amountBn: 34.5 },
    { label: "Dispositifs médicaux", amountBn: 21.7 },
    { label: "Frais de gestion", amountBn: 16.9 },
    { label: "Prévention", amountBn: 8.7 },
  ],
};

// === COMPARAISON EUROPÉENNE ===

export const EU_COMPARISON: ChiffresDataset<EuCountry> = {
  period: "2025",
  source: {
    label: "Eurostat — Notification des déficits et dettes publics 2025 (avril 2026)",
    url: "https://ec.europa.eu/eurostat/fr/web/products-euro-indicators/w/2-22042026-ap",
    date: "2026-04-22",
  },
  items: [
    { country: "France", code: "FR", debtPctGdp: 115.6, deficitPctGdp: 5.1, spendingPctGdp: 57.2, highlight: true },
    { country: "Allemagne", code: "DE", debtPctGdp: 63.5, deficitPctGdp: 2.7, spendingPctGdp: 50.5 },
    { country: "Italie", code: "IT", debtPctGdp: 137.1, deficitPctGdp: 3.1, spendingPctGdp: 51.2 },
    { country: "Espagne", code: "ES", debtPctGdp: 100.7, deficitPctGdp: 2.4, spendingPctGdp: 45.3 },
    { country: "Pays-Bas", code: "NL", debtPctGdp: 44.4, deficitPctGdp: 1.6, spendingPctGdp: 44.9 },
    { country: "Belgique", code: "BE", debtPctGdp: 107.9, deficitPctGdp: 5.2, spendingPctGdp: 54.2 },
    { country: "Zone euro", code: "EA", debtPctGdp: 87.8, deficitPctGdp: 2.9, spendingPctGdp: 49.8 },
    { country: "UE à 27", code: "EU", debtPctGdp: 81.7, deficitPctGdp: 3.1, spendingPctGdp: 49.5 },
  ],
};

/** Toutes les sources citées sur la page, dédupliquées par URL. */
export function getChiffresSources(): DataSource[] {
  const all: DataSource[] = [
    STATE_BUDGET_2026.source,
    STATE_REVENUE_BRIDGE_2026.source,
    STATE_MISSIONS_2026.source,
    STATE_TAX_REVENUE_2026.source,
    INSEE_APU_2025,
    INSEE_DETTE_T2_2026,
    PUBLIC_SPENDING_BY_FUNCTION.source,
    HEALTH_SPENDING.source,
    EU_COMPARISON.source,
    POPULATION_SOURCE,
  ];
  const seen = new Set<string>();
  return all.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}
