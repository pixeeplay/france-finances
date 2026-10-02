/**
 * Calculateur fiscal simplifié (salarié du privé) — fonctions pures.
 *
 * Paramètres : src/data/fiscal-2026.ts (barème IR sur les revenus 2025,
 * cotisations 2026). Limites assumées : un seul salaire par foyer, pas de
 * revenus du capital, pas de réductions ni crédits d'impôt, pas de
 * prélèvements patronaux, TVA estimée par une hypothèse de consommation.
 */

import {
  CONSUMPTION_SHARE,
  CONTRIBUTION_RATES as R,
  DECOTE,
  IR_BRACKETS,
  IR_COLLECTION_THRESHOLD,
  PASS_2026,
  PROFESSIONAL_EXPENSES,
  QF_CEILING_PER_HALF_PART,
  QF_CEILING_SINGLE_PARENT_FIRST_CHILD,
  TVA_EFFECTIVE_RATE,
} from "@/data/fiscal-2026";
import type {
  BudgetShare,
  IRResult,
  SimulatorInput,
  SocialContributions,
  TaxBracketResult,
  TaxSimulationResult,
  TVAResult,
} from "@/types/simulator";

export const SIMULATOR_LIMITS = {
  minGross: 0,
  maxGross: 500_000,
  maxChildren: 10,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// === QUOTIENT FAMILIAL ===

/**
 * Nombre de parts : 1 (seul) ou 2 (couple) ; +0,5 pour chacun des deux premiers
 * enfants, +1 à partir du 3e. Une personne seule avec enfant(s) est considérée
 * comme parent isolé (case T) : +0,5 part supplémentaire.
 */
export function calculateQFParts(isSingle: boolean, nbChildren: number): number {
  const children = Math.max(0, Math.floor(nbChildren));
  const base = isSingle ? 1 : 2;
  let childParts = Math.min(children, 2) * 0.5 + Math.max(0, children - 2);
  if (isSingle && children >= 1) childParts += 0.5;
  return base + childParts;
}

/** Avantage maximal procuré par les demi-parts au-delà de 1 (seul) ou 2 (couple). */
export function calculateQFCeiling(isSingle: boolean, nbChildren: number): number {
  const base = isSingle ? 1 : 2;
  const extraHalfParts = (calculateQFParts(isSingle, nbChildren) - base) * 2;
  if (isSingle && nbChildren >= 1) {
    // La part entière du 1er enfant d'un parent isolé a un plafond spécifique.
    return QF_CEILING_SINGLE_PARENT_FIRST_CHILD + (extraHalfParts - 2) * QF_CEILING_PER_HALF_PART;
  }
  return extraHalfParts * QF_CEILING_PER_HALF_PART;
}

// === COTISATIONS SOCIALES ===

function csgCrdsBase(gross: number): number {
  const cap = R.csgCrdsBaseCapInPass * PASS_2026;
  return Math.min(gross, cap) * R.csgCrdsBaseRate + Math.max(0, gross - cap);
}

function pensionContributions(gross: number): { base: number; complementaire: number } {
  const t1 = Math.min(gross, PASS_2026);
  const t2 = clamp(gross - PASS_2026, 0, (R.agircArrcoCapInPass - 1) * PASS_2026);
  const base = t1 * R.vieillessePlafonnee + gross * R.vieillesseDeplafonnee;
  const cet = gross > PASS_2026 ? (t1 + t2) * R.cet : 0;
  const complementaire = t1 * (R.agircArrcoT1 + R.cegT1) + t2 * (R.agircArrcoT2 + R.cegT2) + cet;
  return { base, complementaire };
}

export function calculateSocialContributions(annualGross: number): SocialContributions {
  const gross = Math.max(0, annualGross);
  const base = csgCrdsBase(gross);
  const csg = base * R.csg;
  const crds = base * R.crds;
  const pensions = pensionContributions(gross);
  return {
    csg,
    crds,
    retraiteBase: pensions.base,
    retraiteComplementaire: pensions.complementaire,
    total: csg + crds + pensions.base + pensions.complementaire,
  };
}

// === REVENU NET IMPOSABLE ===

/** Salaire brut − cotisations − CSG déductible − abattement de 10 % (plancher et plafond). */
export function calculateNetImposable(annualGross: number): number {
  const gross = Math.max(0, annualGross);
  if (gross === 0) return 0;
  const pensions = pensionContributions(gross);
  const csgDeductible = csgCrdsBase(gross) * R.csgDeductible;
  const netFiscal = gross - pensions.base - pensions.complementaire - csgDeductible;
  const abattement = Math.min(
    netFiscal,
    clamp(netFiscal * PROFESSIONAL_EXPENSES.rate, PROFESSIONAL_EXPENSES.min, PROFESSIONAL_EXPENSES.max),
  );
  return Math.max(0, netFiscal - abattement);
}

// === IMPÔT SUR LE REVENU ===

function taxPerPart(incomePerPart: number): number {
  return IR_BRACKETS.reduce((sum, b) => {
    const max = b.max ?? Infinity;
    return sum + Math.max(0, Math.min(incomePerPart, max) - b.min) * b.rate;
  }, 0);
}

function marginalRateFor(incomePerPart: number): number {
  const bracket = IR_BRACKETS.find((b) => incomePerPart > b.min && (b.max === null || incomePerPart <= b.max));
  return bracket?.rate ?? 0;
}

/** Montant de la décote pour un impôt brut donné. */
export function calculateDecote(irBrut: number, isSingle: boolean): number {
  const params = isSingle ? DECOTE.single : DECOTE.couple;
  if (irBrut <= 0 || irBrut >= params.threshold) return 0;
  return clamp(params.forfait - DECOTE.rate * irBrut, 0, irBrut);
}

export function calculateIR(netImposable: number, isSingle: boolean, nbChildren: number): IRResult {
  const income = Math.max(0, netImposable);
  const nbParts = calculateQFParts(isSingle, nbChildren);
  const baseParts = isSingle ? 1 : 2;

  const irAvecQF = taxPerPart(income / nbParts) * nbParts;
  const irSansQF = taxPerPart(income / baseParts) * baseParts;
  const ceiling = calculateQFCeiling(isSingle, nbChildren);
  const qfCapped = irSansQF - irAvecQF > ceiling;
  const irBrut = qfCapped ? irSansQF - ceiling : irAvecQF;

  const decote = calculateDecote(irBrut, isSingle);
  const irRounded = Math.round(irBrut - decote);
  const irTotal = irRounded < IR_COLLECTION_THRESHOLD ? 0 : irRounded;

  const incomePerPart = income / nbParts;
  const brackets: TaxBracketResult[] = IR_BRACKETS.map((b) => {
    const max = b.max ?? Infinity;
    const taxableInBracket = Math.max(0, Math.min(incomePerPart, max) - b.min);
    return { ...b, taxableInBracket, taxInBracket: taxableInBracket * b.rate };
  });

  return {
    brackets,
    irBrut: Math.round(irBrut),
    decote: Math.round(decote),
    irTotal,
    effectiveRate: income > 0 ? irTotal / income : 0,
    marginalRate: irTotal > 0 ? marginalRateFor(qfCapped ? income / baseParts : incomePerPart) : 0,
    nbParts,
    revenuImposable: income,
    qfCapped,
  };
}

// === TVA ===

/**
 * TVA estimée : on suppose que 80 % du revenu disponible est consommé et que
 * cette dépense (TTC) supporte un taux moyen apparent de 13 % (rapporté au HT).
 */
export function estimateTVA(disposableIncome: number): TVAResult {
  const consumption = Math.max(0, disposableIncome) * CONSUMPTION_SHARE;
  const estimatedTVA = (consumption * TVA_EFFECTIVE_RATE) / (1 + TVA_EFFECTIVE_RATE);
  return {
    consumption: Math.round(consumption),
    estimatedTVA: Math.round(estimatedTVA),
    effectiveRate: TVA_EFFECTIVE_RATE,
  };
}

// === RÉPARTITION BUDGÉTAIRE ===

export interface BudgetItem {
  label: string;
  amountBn: number;
}

/**
 * Ventile un montant au prorata des crédits de chaque poste, en gardant les
 * `topN` premiers postes et en regroupant le reste dans « Autres missions ».
 */
export function allocateByBudget(total: number, items: readonly BudgetItem[], topN = 8): BudgetShare[] {
  const sum = items.reduce((s, i) => s + i.amountBn, 0);
  if (sum <= 0) return [];
  const sorted = [...items].sort((a, b) => b.amountBn - a.amountBn);
  const head = sorted.slice(0, topN);
  const restBn = sorted.slice(topN).reduce((s, i) => s + i.amountBn, 0);
  const groups = restBn > 0 ? [...head, { label: "Autres postes du budget", amountBn: restBn }] : head;
  return groups.map((g) => ({
    label: g.label,
    percentage: (g.amountBn / sum) * 100,
    amount: Math.round((Math.max(0, total) * g.amountBn) / sum),
  }));
}

// === SIMULATION COMPLÈTE ===

export function runFullSimulation(input: SimulatorInput, budgetItems: readonly BudgetItem[]): TaxSimulationResult {
  const annualGross = clamp(input.annualGross, SIMULATOR_LIMITS.minGross, SIMULATOR_LIMITS.maxGross);
  const nbChildren = clamp(Math.floor(input.nbChildren), 0, SIMULATOR_LIMITS.maxChildren);
  const normalized: SimulatorInput = { annualGross, isSingle: input.isSingle, nbChildren };

  const cotisations = calculateSocialContributions(annualGross);
  const netAvantIR = annualGross - cotisations.total;
  const netImposable = calculateNetImposable(annualGross);
  const ir = calculateIR(netImposable, input.isSingle, nbChildren);
  const netApresIR = netAvantIR - ir.irTotal;
  const tva = estimateTVA(netApresIR);
  const totalPrelevements = cotisations.total + ir.irTotal + tva.estimatedTVA;

  return {
    input: normalized,
    nbParts: ir.nbParts,
    netAvantIR,
    netImposable,
    ir,
    cotisations,
    tva,
    totalPrelevements,
    netApresIR,
    tauxEffectifGlobal: annualGross > 0 ? totalPrelevements / annualGross : 0,
    // Les cotisations financent la Sécurité sociale : seuls l'IR et la TVA sont ventilés.
    budgetAllocation: allocateByBudget(ir.irTotal + tva.estimatedTVA, budgetItems),
  };
}

// === PARAMÈTRES D'URL ===

type ParamValue = string | string[] | undefined;

function first(value: ParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const DEFAULT_SIMULATOR_INPUT: SimulatorInput = {
  annualGross: 36_000,
  isSingle: true,
  nbChildren: 0,
};

/** Lit et borne les paramètres `brut`, `situation` (seul|couple) et `enfants`. */
export function parseSimulatorParams(params: Record<string, ParamValue>): SimulatorInput {
  const gross = Number.parseInt(first(params.brut) ?? "", 10);
  const children = Number.parseInt(first(params.enfants) ?? "", 10);
  const situation = first(params.situation);
  return {
    annualGross: Number.isFinite(gross)
      ? clamp(gross, SIMULATOR_LIMITS.minGross, SIMULATOR_LIMITS.maxGross)
      : DEFAULT_SIMULATOR_INPUT.annualGross,
    isSingle: situation === "couple" ? false : true,
    nbChildren: Number.isFinite(children)
      ? clamp(children, 0, SIMULATOR_LIMITS.maxChildren)
      : DEFAULT_SIMULATOR_INPUT.nbChildren,
  };
}

/** Vue d'affichage des montants du simulateur */
export type SimulatorPeriod = "an" | "mois";

/** Lit la vue (`?vue=mois`) ; annuelle par défaut. */
export function parseSimulatorPeriod(params: Record<string, ParamValue>): SimulatorPeriod {
  return first(params.vue) === "mois" ? "mois" : "an";
}

export function serializeSimulatorParams(input: SimulatorInput, period: SimulatorPeriod = "an"): string {
  const params = new URLSearchParams({
    brut: String(Math.round(input.annualGross)),
    situation: input.isSingle ? "seul" : "couple",
    enfants: String(input.nbChildren),
  });
  if (period === "mois") params.set("vue", "mois");
  return params.toString();
}
