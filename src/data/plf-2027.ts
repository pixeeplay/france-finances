/**
 * Projet de budget pour 2027 (PLF et PLFSS 2027), présenté en Conseil des
 * ministres le 1er octobre 2026.
 *
 * PROJET : textes déposés au Parlement, non votés. Les montants peuvent
 * évoluer pendant la discussion parlementaire (vote attendu avant le
 * 31 décembre 2026). À remplacer par la loi votée une fois promulguée.
 *
 * Sources (relevées le 5 octobre 2026) :
 * - dossier de presse officiel « Budget 2027 » (PLF et PLFSS), chiffres clés
 *   et synthèse : cadrage, solde de l'État, périmètre des dépenses de l'État,
 *   crédits des 31 missions, Ondam, soldes de la Sécurité sociale, mesures ;
 * - avis n° 2026-5 du Haut Conseil des finances publiques (25 septembre 2026) :
 *   répartition de l'effort de 43 Md€ entre recettes et dépenses, appréciation
 *   de la prévision de croissance.
 *
 * Montants en milliards d'euros, arrondis à 0,1 Md€ comme dans les sources.
 */

import type { DataSource } from "@/types/simulator";

/** Date de dernière mise à jour des données de ce fichier (AAAA-MM-JJ). */
export const PLF_2027_UPDATED = "2026-10-05";

/** Date de présentation en Conseil des ministres. */
export const PLF_2027_PRESENTED = "2026-10-01";

export const PLF_2027_PRESS_KIT: DataSource = {
  label: "Gouvernement — Dossier de presse « Budget 2027 » (PLF et PLFSS 2027)",
  url: "https://solidarites.gouv.fr/sites/solidarite/files/2026-10/DP-BUDGET-2027.pdf",
  date: "2026-10-01",
};

export const HCFP_AVIS_2026_5: DataSource = {
  label: "Haut Conseil des finances publiques — Avis n° 2026-5 sur les PLF et PLFSS pour 2027",
  url: "https://www.hcfp.fr/liste-avis/avis-ndeg2026-5-lois-de-finances-2027",
  date: "2026-09-25",
};

export const PLF_2027_SOURCES: readonly DataSource[] = [PLF_2027_PRESS_KIT, HCFP_AVIS_2026_5];

// === TRAJECTOIRE (toutes administrations publiques, comptabilité nationale) ===

export interface TrajectoryPoint {
  year: number;
  /** « exécution », « prévision révisée » ou « projet » */
  status: string;
  /** Solde public, en % du PIB (négatif = déficit) */
  balancePctGdp: number;
  /** Dette publique au sens de Maastricht, en % du PIB */
  debtPctGdp: number;
  /** Dépenses publiques hors crédits d'impôt, en % du PIB */
  spendingPctGdp: number;
  /** Croissance du PIB en volume, en % */
  growthPct: number;
}

export const PLF_2027_TRAJECTORY: readonly TrajectoryPoint[] = [
  { year: 2025, status: "exécution", balancePctGdp: -5.1, debtPctGdp: 115.7, spendingPctGdp: 56.6, growthPct: 0.9 },
  { year: 2026, status: "prévision révisée", balancePctGdp: -5.4, debtPctGdp: 119.3, spendingPctGdp: 57.1, growthPct: 0.5 },
  { year: 2027, status: "projet", balancePctGdp: -5.0, debtPctGdp: 121.7, spendingPctGdp: 56.9, growthPct: 1.0 },
];

// === EFFORT ANNONCÉ ===

export const PLF_2027_EFFORT = {
  /** Effort total de redressement en 2027, y compris le plein effet des mesures de 2026 */
  totalBn: 54,
  /** Mesures nouvelles portées par le PLF et le PLFSS 2027 */
  newMeasuresBn: 43,
  /** Part des mesures nouvelles en recettes (avis du HCFP) */
  newRevenueBn: 18,
  /** Part des mesures nouvelles en dépenses (avis du HCFP) */
  newSpendingBn: 25,
  /**
   * Effort structurel calculé par le HCFP selon sa propre méthode
   * (variation par rapport à 2026 et non par rapport à une évolution
   * « à politique inchangée ») : 0,9 point de PIB.
   */
  hcfpStructuralBn: 28,
  hcfpStructuralPctGdp: 0.9,
  /** Répartition de cet effort structurel selon le HCFP : recettes / dépenses */
  hcfpStructuralRevenueBn: 17,
  hcfpStructuralSpendingBn: 11,
} as const;

// === BUDGET DE L'ÉTAT ===

export interface StateBalance {
  /** Dépenses nettes, prélèvements sur recettes (collectivités, UE) inclus */
  netExpenditureBn: number;
  netRevenueBn: number;
  annexBudgetsBalanceBn: number;
  specialAccountsBalanceBn: number;
  /** Solde général du budget de l'État */
  balanceBn: number;
}

/** Solde général du budget de l'État, comptabilité budgétaire (loi de finances 2026 et projet 2027). */
export const PLF_2027_STATE_BALANCE: { lfi2026: StateBalance; plf2027: StateBalance } = {
  lfi2026: {
    netExpenditureBn: 526.0,
    netRevenueBn: 392.5,
    annexBudgetsBalanceBn: 0.4,
    specialAccountsBalanceBn: -1.5,
    balanceBn: -134.6,
  },
  plf2027: {
    netExpenditureBn: 548.9,
    netRevenueBn: 392.4,
    annexBudgetsBalanceBn: 0.2,
    specialAccountsBalanceBn: 0.0,
    balanceBn: -156.4,
  },
};

export interface PdeComponent {
  label: string;
  lfi2026Bn: number;
  plf2027Bn: number;
}

/**
 * Périmètre des dépenses de l'État (PDE), la « norme » de dépenses pilotée par
 * le Gouvernement : budget général hors pensions, taxes affectées plafonnées,
 * budgets annexes et comptes spéciaux, versements aux collectivités et à l'UE.
 * Hors charge de la dette.
 */
export const PLF_2027_PDE = {
  lfi2026Bn: 503,
  plf2027Bn: 511,
  /** PDE hors Défense et hors prélèvements sur recettes : stable */
  excludingDefenseAndLeviesLfi2026Bn: 373,
  excludingDefenseAndLeviesPlf2027Bn: 373,
  components: [
    { label: "Crédits des ministères (budget général)", lfi2026Bn: 337.2, plf2027Bn: 344.7 },
    { label: "Taxes affectées plafonnées", lfi2026Bn: 22.5, plf2027Bn: 21.9 },
    { label: "Budgets annexes et comptes spéciaux", lfi2026Bn: 76.9, plf2027Bn: 76.8 },
    { label: "Versements aux collectivités locales (prélèvements sur recettes)", lfi2026Bn: 44.8, plf2027Bn: 43.1 },
    { label: "Versement au budget de l'Union européenne", lfi2026Bn: 28.4, plf2027Bn: 30.9 },
    { label: "Retraitement des flux internes à l'État", lfi2026Bn: -6.8, plf2027Bn: -6.7 },
  ] satisfies PdeComponent[],
} as const;

// === CHARGE DE LA DETTE ===

export const PLF_2027_DEBT_INTEREST = {
  /** Intérêts de toutes les administrations publiques */
  publicSector: { y2026Bn: 79.2, y2027Bn: 91.2 },
  /** Charge de la dette inscrite au budget de l'État */
  state: { lfi2026Bn: 59.3, plf2027Bn: 72.9 },
} as const;

// === CRÉDITS DES MISSIONS ===

export interface MissionComparison {
  label: string;
  lfi2026Bn: number;
  plf2027Bn: number;
  /** Mission portant la charge de la dette */
  debt?: boolean;
}

/**
 * Crédits de paiement des 31 missions du budget général, hors contributions au
 * compte « Pensions » et hors remboursements et dégrèvements, loi de finances
 * 2026 (au format du PLF 2027) et projet 2027. Périmètre différent de
 * STATE_MISSIONS_2026 (chiffres.ts), qui inclut les pensions.
 */
export const PLF_2027_MISSIONS: readonly MissionComparison[] = [
  { label: "Engagements financiers de l'État (dont intérêts de la dette)", lfi2026Bn: 60.3, plf2027Bn: 74.5, debt: true },
  { label: "Enseignement scolaire", lfi2026Bn: 64.4, plf2027Bn: 65.5 },
  { label: "Défense", lfi2026Bn: 57.0, plf2027Bn: 63.4 },
  { label: "Solidarité, insertion et égalité des chances", lfi2026Bn: 31.3, plf2027Bn: 32.2 },
  { label: "Recherche et enseignement supérieur", lfi2026Bn: 31.3, plf2027Bn: 31.8 },
  { label: "Cohésion des territoires", lfi2026Bn: 22.5, plf2027Bn: 22.5 },
  { label: "Écologie, développement et mobilité durables", lfi2026Bn: 22.1, plf2027Bn: 22.5 },
  { label: "Travail, emploi et administration des ministères sociaux", lfi2026Bn: 20.5, plf2027Bn: 18.6 },
  { label: "Sécurités", lfi2026Bn: 17.6, plf2027Bn: 18.2 },
  { label: "Justice", lfi2026Bn: 10.5, plf2027Bn: 11.0 },
  { label: "Gestion des finances publiques et lutte contre les fraudes", lfi2026Bn: 8.2, plf2027Bn: 8.3 },
  { label: "Régimes sociaux et de retraite", lfi2026Bn: 6.1, plf2027Bn: 5.6 },
  { label: "Administration générale et territoriale de l'État", lfi2026Bn: 4.2, plf2027Bn: 4.7 },
  { label: "Investir pour la France de 2030", lfi2026Bn: 4.4, plf2027Bn: 4.0 },
  { label: "Relations avec les collectivités territoriales", lfi2026Bn: 4.0, plf2027Bn: 4.0 },
  { label: "Outre-mer", lfi2026Bn: 3.4, plf2027Bn: 3.7 },
  { label: "Culture", lfi2026Bn: 3.5, plf2027Bn: 3.4 },
  { label: "Agriculture et alimentation", lfi2026Bn: 3.5, plf2027Bn: 3.3 },
  { label: "Action extérieure de l'État", lfi2026Bn: 3.2, plf2027Bn: 3.3 },
  { label: "Économie", lfi2026Bn: 3.3, plf2027Bn: 3.2 },
  { label: "Aide publique au développement", lfi2026Bn: 3.6, plf2027Bn: 3.2 },
  { label: "Immigration, asile et intégration", lfi2026Bn: 2.1, plf2027Bn: 2.1 },
  { label: "Santé", lfi2026Bn: 1.9, plf2027Bn: 1.8 },
  { label: "Monde combattant, mémoire et liens avec la Nation", lfi2026Bn: 1.7, plf2027Bn: 1.6 },
  { label: "Pouvoirs publics", lfi2026Bn: 1.1, plf2027Bn: 1.2 },
  { label: "Sport, jeunesse et vie associative", lfi2026Bn: 1.2, plf2027Bn: 1.2 },
  { label: "Direction de l'action du Gouvernement", lfi2026Bn: 1.0, plf2027Bn: 0.9 },
  { label: "Conseil et contrôle de l'État", lfi2026Bn: 0.7, plf2027Bn: 0.7 },
  { label: "Médias, livre et industries culturelles", lfi2026Bn: 0.7, plf2027Bn: 0.7 },
  { label: "Transformation et fonction publiques", lfi2026Bn: 0.5, plf2027Bn: 0.5 },
  { label: "Crédits non répartis", lfi2026Bn: 0.5, plf2027Bn: 0.2 },
];

// === MESURES ===

export type MeasureKind = "economie" | "recette" | "hausse";

export interface Plf2027Measure {
  label: string;
  detail: string;
  kind: MeasureKind;
  /** Montant en 2027 (Md€) quand la source le chiffre ; absent sinon */
  amountBn?: number;
}

/**
 * Principales mesures, telles que décrites dans le dossier de presse. Les
 * montants sont ceux annoncés pour 2027 ; « non chiffré » quand le document
 * ne donne pas de montant.
 */
export const PLF_2027_MEASURES: readonly Plf2027Measure[] = [
  {
    label: "Gel du point d'indice des fonctionnaires",
    detail: "Rémunérations de l'État et de ses opérateurs ; hausses par métier « extrêmement limitées ». Effectifs stables hors créations prévues (enseignants, armées).",
    kind: "economie",
  },
  {
    label: "Pensions de retraite revalorisées moins que l'inflation au-dessus de 1 260 € par mois",
    detail: "Taux fixé par décret, inférieur à l'inflation mais sans baisse des pensions ; petites retraites revalorisées comme l'inflation.",
    kind: "economie",
    amountBn: 4,
  },
  {
    label: "Contribution des collectivités locales à l'effort budgétaire",
    detail: "Contribution progressive selon les capacités financières ; petites communes très majoritairement exonérées, ainsi que les collectivités fragiles financièrement ; collectivités d'outre-mer exonérées.",
    kind: "economie",
    amountBn: 2.5,
  },
  {
    label: "Remboursement de TVA aux collectivités (FCTVA) recentré",
    detail: "Taux de base abaissé de 5 points, taux majoré pour les dépenses de transition écologique, de mobilité et de voirie.",
    kind: "economie",
    amountBn: 2.1,
  },
  {
    label: "Baisse des taxes affectées à France compétences",
    detail: "Recentrage du compte personnel de formation (CPF) et du plan d'investissement dans les compétences.",
    kind: "economie",
    amountBn: 1,
  },
  {
    label: "Indemnités journalières des arrêts maladie",
    detail: "Objectif de moindre dépense, à négocier avec les partenaires sociaux.",
    kind: "economie",
    amountBn: 1,
  },
  {
    label: "Aides au logement (APL) et prime d'activité gelées",
    detail: "Pas de revalorisation en 2027 ; RSA, AAH et minimum vieillesse revalorisés comme l'inflation.",
    kind: "economie",
  },
  {
    label: "Abattement de 10 % des retraités plafonné à 3 000 €",
    detail: "Coût de cet avantage fiscal réduit d'un quart ; un tiers des foyers comptant un retraité concernés.",
    kind: "recette",
  },
  {
    label: "Lutte contre la fraude fiscale et sociale",
    detail: "Objectif de recettes supplémentaires effectivement recouvrées.",
    kind: "recette",
    amountBn: 1,
  },
  {
    label: "Défense (mission « Défense » à 63,4 Md€)",
    detail: "Hausse prévue par la loi de programmation militaire actualisée.",
    kind: "hausse",
    amountBn: 6.4,
  },
  {
    label: "Hôpital",
    detail: "Enveloppe des établissements de santé en hausse de 3 % dans l'objectif de dépenses d'assurance maladie.",
    kind: "hausse",
    amountBn: 3,
  },
  {
    label: "Éducation nationale",
    detail: "Dont réforme de la formation des enseignants et accompagnants d'élèves en situation de handicap.",
    kind: "hausse",
    amountBn: 1.1,
  },
  {
    label: "Intérieur",
    detail: "Sécurité intérieure et lutte contre les feux de forêt.",
    kind: "hausse",
    amountBn: 1,
  },
  { label: "Recherche", detail: "Crédits de la mission recherche et enseignement supérieur.", kind: "hausse", amountBn: 0.5 },
  { label: "Justice", detail: "Crédits du ministère portés à 11,0 Md€.", kind: "hausse", amountBn: 0.4 },
];

// === SÉCURITÉ SOCIALE ===

export interface OndamItem {
  label: string;
  y2026Bn: number;
  y2027Bn: number;
}

/** Objectif national de dépenses d'assurance maladie : 2026 révisé, 2027 projet. */
export const PLF_2027_ONDAM: readonly OndamItem[] = [
  { label: "Soins de ville", y2026Bn: 117.1, y2027Bn: 118.3 },
  { label: "Établissements de santé (hôpital)", y2026Bn: 112.6, y2027Bn: 116.0 },
  { label: "Établissements pour personnes âgées", y2026Bn: 18.2, y2027Bn: 18.8 },
  { label: "Établissements pour personnes handicapées", y2026Bn: 16.0, y2027Bn: 16.3 },
  { label: "Fonds d'intervention régional et investissement", y2026Bn: 6.1, y2027Bn: 5.9 },
  { label: "Autres prises en charge", y2026Bn: 3.3, y2027Bn: 3.4 },
];

export const PLF_2027_ONDAM_TOTAL = { y2026Bn: 273.3, y2027Bn: 278.7, growthPct: 2.0 } as const;

/**
 * Solde des régimes obligatoires de base de la Sécurité sociale : 2026 tel que
 * prévu dans le PLFSS 2027 (le dossier de presse titre la colonne « LFSS 2026 »
 * mais présente -21,8 Md€ comme la prévision 2026, recettes moins dynamiques
 * que prévu par la loi votée), et projet 2027.
 */
export const PLF_2027_SOCIAL_SECURITY = {
  forecast2026: { revenueBn: 661.3, expenditureBn: 683.1, balanceBn: -21.8 },
  plfss2027: { revenueBn: 683.7, expenditureBn: 696.4, balanceBn: -12.7 },
  /** Déficit 2027 « spontané », sans les mesures du PLFSS */
  spontaneousDeficit2027Bn: 22.6,
} as const;

export function plf2027Delta(m: { lfi2026Bn: number; plf2027Bn: number }): number {
  return Math.round((m.plf2027Bn - m.lfi2026Bn) * 10) / 10;
}
