/**
 * Paramètres fiscaux et sociaux utilisés par le simulateur (/simulateur).
 *
 * - Impôt sur le revenu : barème de la loi de finances pour 2026,
 *   applicable aux revenus 2025 (déclarés au printemps 2026).
 * - Cotisations salariales : taux en vigueur en 2026 (salarié du secteur privé,
 *   non cadre, hors Alsace-Moselle).
 *
 * Porté depuis notre contribution à nicoquipaie (branche feat/simulateur,
 * mars 2026), puis vérifié et mis à jour en octobre 2026 : plafond du quotient
 * familial (1 759 → 1 807 €), décote (seuils 2024 → 2026), abattement de 10 %
 * (495-14 171 → 509-14 555 €), PASS (47 100 → 48 060 €), SMIC (revalorisé au
 * 1er juin 2026), Agirc-Arrco détaillé par tranche.
 */

import type { DataSource, TaxBracket } from "@/types/simulator";

// === IMPÔT SUR LE REVENU (revenus 2025) ===

export const IR_YEAR = 2026;
export const IR_INCOME_YEAR = 2025;

/** Barème progressif, appliqué au revenu imposable par part. */
export const IR_BRACKETS: readonly TaxBracket[] = [
  { min: 0, max: 11_600, rate: 0 },
  { min: 11_600, max: 29_579, rate: 0.11 },
  { min: 29_579, max: 84_577, rate: 0.3 },
  { min: 84_577, max: 181_917, rate: 0.41 },
  { min: 181_917, max: null, rate: 0.45 },
];

/** Plafond de l'avantage procuré par chaque demi-part supplémentaire. */
export const QF_CEILING_PER_HALF_PART = 1_807;

/** Plafond de l'avantage procuré par la part entière du 1er enfant d'un parent isolé (case T). */
export const QF_CEILING_SINGLE_PARENT_FIRST_CHILD = 4_262;

/**
 * Décote : décote = forfait − 45,25 % × impôt brut,
 * applicable si l'impôt brut est inférieur au seuil.
 */
export const DECOTE = {
  rate: 0.4525,
  single: { forfait: 897, threshold: 1_982 },
  couple: { forfait: 1_483, threshold: 3_277 },
} as const;

/** Déduction forfaitaire de 10 % pour frais professionnels (revenus 2025). */
export const PROFESSIONAL_EXPENSES = {
  rate: 0.1,
  min: 509,
  max: 14_555,
} as const;

/** Seuil de mise en recouvrement : l'impôt n'est pas recouvré en dessous. */
export const IR_COLLECTION_THRESHOLD = 61;

// === COTISATIONS SALARIALES (2026) ===

/** Plafond annuel de la Sécurité sociale 2026. */
export const PASS_2026 = 48_060;

export const CONTRIBUTION_RATES = {
  /** CSG/CRDS : assiette de 98,25 % du brut dans la limite de 4 PASS, 100 % au-delà. */
  csgCrdsBaseRate: 0.9825,
  csgCrdsBaseCapInPass: 4,
  /** CSG : 9,2 % dont 6,8 % déductible du revenu imposable. */
  csg: 0.092,
  csgDeductible: 0.068,
  /** CRDS : 0,5 %, non déductible. */
  crds: 0.005,
  /** Assurance vieillesse de base : 6,90 % plafonné au PASS + 0,40 % sur la totalité. */
  vieillessePlafonnee: 0.069,
  vieillesseDeplafonnee: 0.004,
  /** Agirc-Arrco tranche 1 (jusqu'à 1 PASS) : 3,15 % + CEG 0,86 %. */
  agircArrcoT1: 0.0315,
  cegT1: 0.0086,
  /** Agirc-Arrco tranche 2 (de 1 à 8 PASS) : 8,64 % + CEG 1,08 %. */
  agircArrcoT2: 0.0864,
  cegT2: 0.0108,
  /** CET : 0,14 % sur T1 + T2, dû seulement si le salaire dépasse 1 PASS. */
  cet: 0.0014,
  agircArrcoCapInPass: 8,
} as const;

// === TVA (hypothèse simplificatrice) ===

/**
 * Part du revenu disponible consacrée à la consommation.
 * Le taux d'épargne des ménages est d'environ 18 % en 2025 (Insee) : on retient 80 %.
 */
export const CONSUMPTION_SHARE = 0.8;

/**
 * Taux moyen apparent de TVA sur la consommation d'un ménage.
 * Ordre de grandeur : une partie de la consommation est taxée à 5,5 % ou 10 %
 * (alimentation, transports, travaux) ou exonérée (loyers, santé).
 * Hypothèse documentée, pas un chiffre officiel.
 */
export const TVA_EFFECTIVE_RATE = 0.13;

// === SALAIRES DE RÉFÉRENCE ===

export const REFERENCE_SALARIES = {
  /** SMIC brut annuel, 35 h, au 1er juin 2026 (1 867,02 € × 12). */
  smic: 22_404,
} as const;

export const FISCAL_SOURCES: readonly DataSource[] = [
  {
    label: "Service-public.fr — Barème de l'impôt sur le revenu (revenus 2025)",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419",
    date: "2026-04-15",
  },
  {
    label: "economie.gouv.fr — Pouvez-vous bénéficier de la décote ?",
    url: "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/pouvez-vous-beneficier-de-la-decote-de-limpot-sur-le-revenu",
    date: "2026",
  },
  {
    label: "Urssaf — Plafond annuel de la Sécurité sociale 2026",
    url: "https://www.urssaf.fr/accueil/actualites/plafond-annuel-securite-sociale.html",
    date: "2025-12",
  },
  {
    label: "Arrêté du 22 mai 2026 relatif au relèvement du SMIC",
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054126589",
    date: "2026-05-22",
  },
  {
    label: "Agirc-Arrco — Taux de cotisation",
    url: "https://www.agirc-arrco.fr/entreprises/gerer-les-salaries/calcul-des-cotisations/",
    date: "2026",
  },
];
