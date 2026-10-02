import { describe, it, expect } from "vitest";
import {
  allocateByBudget,
  calculateDecote,
  calculateIR,
  calculateNetImposable,
  calculateQFCeiling,
  calculateQFParts,
  calculateSocialContributions,
  estimateTVA,
  parseSimulatorParams,
  runFullSimulation,
  serializeSimulatorParams,
  DEFAULT_SIMULATOR_INPUT,
  parseSimulatorPeriod,
} from "@/lib/taxCalculator";
import { IR_BRACKETS, PASS_2026, REFERENCE_SALARIES } from "@/data/fiscal-2026";
import { STATE_MISSIONS_2026 } from "@/data/chiffres";

const missions = STATE_MISSIONS_2026.items;

describe("barème 2026 (revenus 2025)", () => {
  it("contient les 5 tranches de la loi de finances pour 2026", () => {
    expect(IR_BRACKETS.map((b) => b.min)).toEqual([0, 11_600, 29_579, 84_577, 181_917]);
    expect(IR_BRACKETS.map((b) => b.rate)).toEqual([0, 0.11, 0.3, 0.41, 0.45]);
  });

  it("a des tranches contiguës", () => {
    for (let i = 1; i < IR_BRACKETS.length; i++) {
      expect(IR_BRACKETS[i].min).toBe(IR_BRACKETS[i - 1].max);
    }
    expect(IR_BRACKETS[IR_BRACKETS.length - 1].max).toBeNull();
  });
});

describe("calculateQFParts", () => {
  it.each([
    [true, 0, 1],
    [true, 1, 2],
    [true, 2, 2.5],
    [true, 3, 3.5],
    [false, 0, 2],
    [false, 1, 2.5],
    [false, 2, 3],
    [false, 3, 4],
    [false, 4, 5],
  ])("seul=%s, %i enfant(s) → %f parts", (isSingle, children, parts) => {
    expect(calculateQFParts(isSingle, children)).toBe(parts);
  });

  it("ignore les valeurs négatives ou décimales", () => {
    expect(calculateQFParts(false, -2)).toBe(2);
    expect(calculateQFParts(false, 1.7)).toBe(2.5);
  });
});

describe("calculateQFCeiling", () => {
  it("vaut 1 807 € par demi-part pour un couple", () => {
    expect(calculateQFCeiling(false, 0)).toBe(0);
    expect(calculateQFCeiling(false, 2)).toBe(2 * 1_807);
    expect(calculateQFCeiling(false, 3)).toBe(4 * 1_807);
  });

  it("applique le plafond parent isolé (4 262 €) sur le 1er enfant", () => {
    expect(calculateQFCeiling(true, 1)).toBe(4_262);
    expect(calculateQFCeiling(true, 2)).toBe(4_262 + 1_807);
  });
});

describe("calculateSocialContributions", () => {
  it("calcule les cotisations d'un salaire de 30 000 € brut", () => {
    const c = calculateSocialContributions(30_000);
    expect(c.csg).toBeCloseTo(30_000 * 0.9825 * 0.092, 2);
    expect(c.crds).toBeCloseTo(30_000 * 0.9825 * 0.005, 2);
    expect(c.retraiteBase).toBeCloseTo(30_000 * 0.073, 2);
    expect(c.retraiteComplementaire).toBeCloseTo(30_000 * 0.0401, 2);
    expect(c.total).toBeCloseTo(6_252.08, 1);
  });

  it("plafonne la vieillesse de base et applique la tranche 2 au-delà du PASS", () => {
    const gross = 60_000;
    const c = calculateSocialContributions(gross);
    expect(c.retraiteBase).toBeCloseTo(PASS_2026 * 0.069 + gross * 0.004, 2);
    const t2 = gross - PASS_2026;
    const expected = PASS_2026 * 0.0401 + t2 * 0.0972 + gross * 0.0014;
    expect(c.retraiteComplementaire).toBeCloseTo(expected, 2);
  });

  it("limite l'abattement CSG à 4 PASS et la tranche 2 à 8 PASS", () => {
    const gross = 500_000;
    const c = calculateSocialContributions(gross);
    const csgBase = 4 * PASS_2026 * 0.9825 + (gross - 4 * PASS_2026);
    expect(c.csg).toBeCloseTo(csgBase * 0.092, 2);
    const t2 = 7 * PASS_2026;
    const expected = PASS_2026 * 0.0401 + t2 * 0.0972 + (PASS_2026 + t2) * 0.0014;
    expect(c.retraiteComplementaire).toBeCloseTo(expected, 2);
  });

  it("renvoie zéro pour un salaire nul ou négatif", () => {
    expect(calculateSocialContributions(0).total).toBe(0);
    expect(calculateSocialContributions(-1_000).total).toBe(0);
  });
});

describe("calculateNetImposable", () => {
  it("déduit cotisations, CSG déductible et abattement de 10 %", () => {
    // 30 000 − 2 190 − 1 203 − 2 004,30 = 24 602,70 ; −10 % → 22 142,43
    expect(calculateNetImposable(30_000)).toBeCloseTo(22_142.43, 1);
  });

  it("applique le plancher de 509 €", () => {
    const gross = 3_000;
    const c = calculateSocialContributions(gross);
    const netFiscal = gross - c.retraiteBase - c.retraiteComplementaire - gross * 0.9825 * 0.068;
    expect(calculateNetImposable(gross)).toBeCloseTo(netFiscal - 509, 1);
  });

  it("applique le plafond de 14 555 €", () => {
    const gross = 400_000;
    const c = calculateSocialContributions(gross);
    const csgBase = 4 * PASS_2026 * 0.9825 + (gross - 4 * PASS_2026);
    const netFiscal = gross - c.retraiteBase - c.retraiteComplementaire - csgBase * 0.068;
    expect(calculateNetImposable(gross)).toBeCloseTo(netFiscal - 14_555, 1);
  });

  it("ne descend jamais sous zéro", () => {
    expect(calculateNetImposable(0)).toBe(0);
    expect(calculateNetImposable(200)).toBe(0);
  });
});

describe("calculateDecote", () => {
  it("décote = forfait − 45,25 % de l'impôt brut sous le seuil", () => {
    expect(calculateDecote(1_000, true)).toBeCloseTo(897 - 452.5, 2);
    expect(calculateDecote(2_000, false)).toBeCloseTo(1_483 - 905, 2);
  });

  it("ne s'applique pas au-delà du seuil", () => {
    expect(calculateDecote(1_982, true)).toBe(0);
    expect(calculateDecote(3_277, false)).toBe(0);
  });

  it("ne dépasse jamais l'impôt brut", () => {
    expect(calculateDecote(300, true)).toBe(300);
  });
});

describe("calculateIR", () => {
  it("personne seule, 22 142 € imposables : décote appliquée", () => {
    const ir = calculateIR(22_142.43, true, 0);
    expect(ir.irBrut).toBe(1_160);
    expect(ir.decote).toBe(372);
    expect(ir.irTotal).toBe(787);
    expect(ir.marginalRate).toBe(0.11);
  });

  it("personne seule, 50 000 € imposables", () => {
    const ir = calculateIR(50_000, true, 0);
    expect(ir.irTotal).toBe(8_104);
    expect(ir.decote).toBe(0);
    expect(ir.marginalRate).toBe(0.3);
    expect(ir.effectiveRate).toBeCloseTo(8_104 / 50_000, 4);
  });

  it("couple avec 2 enfants, 50 000 € : quotient familial puis décote", () => {
    const ir = calculateIR(50_000, false, 2);
    expect(ir.nbParts).toBe(3);
    expect(ir.qfCapped).toBe(false);
    expect(ir.irBrut).toBe(1_672);
    expect(ir.irTotal).toBe(946);
  });

  it("couple avec 2 enfants, 200 000 € : plafonnement du quotient familial", () => {
    const ir = calculateIR(200_000, false, 2);
    expect(ir.qfCapped).toBe(true);
    expect(ir.irTotal).toBe(45_987);
    expect(ir.marginalRate).toBe(0.41);
  });

  it("n'est pas recouvré sous 61 €", () => {
    expect(calculateIR(12_000, true, 0).irTotal).toBe(0);
    expect(calculateIR(0, true, 0).irTotal).toBe(0);
    expect(calculateIR(0, true, 0).marginalRate).toBe(0);
  });

  it("le détail par tranche reconstitue l'impôt par part", () => {
    const ir = calculateIR(50_000, true, 0);
    const sum = ir.brackets.reduce((s, b) => s + b.taxInBracket, 0);
    expect(Math.round(sum)).toBe(8_104);
  });

  it("l'impôt croît avec le revenu", () => {
    let previous = -1;
    for (let income = 0; income <= 300_000; income += 5_000) {
      const { irTotal } = calculateIR(income, false, 1);
      expect(irTotal).toBeGreaterThanOrEqual(previous);
      previous = irTotal;
    }
  });
});

describe("estimateTVA", () => {
  it("applique 13 % HT sur 80 % du revenu disponible", () => {
    const tva = estimateTVA(20_000);
    expect(tva.consumption).toBe(16_000);
    expect(tva.estimatedTVA).toBe(Math.round((16_000 * 0.13) / 1.13));
  });

  it("renvoie zéro pour un revenu nul ou négatif", () => {
    expect(estimateTVA(-5).estimatedTVA).toBe(0);
  });
});

describe("allocateByBudget", () => {
  it("regroupe au-delà des 8 premiers postes et somme à 100 %", () => {
    const shares = allocateByBudget(10_000, missions);
    expect(shares).toHaveLength(9);
    expect(shares[0].label).toBe("Enseignement scolaire");
    expect(shares[8].label).toBe("Autres postes du budget");
    const pct = shares.reduce((s, x) => s + x.percentage, 0);
    expect(pct).toBeCloseTo(100, 6);
    const total = shares.reduce((s, x) => s + x.amount, 0);
    expect(Math.abs(total - 10_000)).toBeLessThanOrEqual(shares.length);
  });

  it("gère les cas limites", () => {
    expect(allocateByBudget(100, [])).toEqual([]);
    expect(allocateByBudget(-50, missions).every((s) => s.amount === 0)).toBe(true);
    expect(allocateByBudget(100, missions.slice(0, 3), 8)).toHaveLength(3);
  });
});

describe("runFullSimulation", () => {
  it("reste cohérent au SMIC", () => {
    const r = runFullSimulation({ annualGross: REFERENCE_SALARIES.smic, isSingle: true, nbChildren: 0 }, missions);
    expect(r.ir.irTotal).toBeGreaterThanOrEqual(0);
    expect(r.netApresIR).toBeLessThan(REFERENCE_SALARIES.smic);
    expect(r.tauxEffectifGlobal).toBeGreaterThan(0.2);
    expect(r.tauxEffectifGlobal).toBeLessThan(0.4);
  });

  it("additionne cotisations, IR et TVA", () => {
    const r = runFullSimulation({ annualGross: 45_000, isSingle: false, nbChildren: 1 }, missions);
    expect(r.totalPrelevements).toBeCloseTo(r.cotisations.total + r.ir.irTotal + r.tva.estimatedTVA, 6);
    expect(r.netAvantIR).toBeCloseTo(45_000 - r.cotisations.total, 6);
    const allocated = r.budgetAllocation.reduce((s, x) => s + x.amount, 0);
    expect(Math.abs(allocated - (r.ir.irTotal + r.tva.estimatedTVA))).toBeLessThanOrEqual(9);
  });

  it("borne les entrées invalides", () => {
    const r = runFullSimulation({ annualGross: -10, isSingle: true, nbChildren: 99 }, missions);
    expect(r.input.annualGross).toBe(0);
    expect(r.input.nbChildren).toBe(10);
    expect(r.totalPrelevements).toBe(0);
    expect(r.tauxEffectifGlobal).toBe(0);
  });
});

describe("paramètres d'URL", () => {
  it("lit les paramètres valides", () => {
    expect(parseSimulatorParams({ brut: "52000", situation: "couple", enfants: "2" })).toEqual({
      annualGross: 52_000,
      isSingle: false,
      nbChildren: 2,
    });
  });

  it("revient aux valeurs par défaut ou borne les valeurs", () => {
    expect(parseSimulatorParams({})).toEqual(DEFAULT_SIMULATOR_INPUT);
    expect(parseSimulatorParams({ brut: "abc", enfants: "-3" })).toEqual({
      ...DEFAULT_SIMULATOR_INPUT,
      nbChildren: 0,
    });
    expect(parseSimulatorParams({ brut: ["9999999"], situation: "x" }).annualGross).toBe(500_000);
  });

  it("fait l'aller-retour sérialisation / lecture", () => {
    const input = { annualGross: 41_000, isSingle: false, nbChildren: 3 };
    const qs = new URLSearchParams(serializeSimulatorParams(input));
    expect(parseSimulatorParams(Object.fromEntries(qs))).toEqual(input);
  });
});

describe("vue mensuelle / annuelle", () => {
  it("lit ?vue=mois, annuel par défaut", () => {
    expect(parseSimulatorPeriod({ vue: "mois" })).toBe("mois");
    expect(parseSimulatorPeriod({ vue: "an" })).toBe("an");
    expect(parseSimulatorPeriod({})).toBe("an");
    expect(parseSimulatorPeriod({ vue: "n'importe" })).toBe("an");
  });

  it("n'ajoute vue=mois à l'URL qu'en vue mensuelle", () => {
    const input = { annualGross: 30_000, isSingle: true, nbChildren: 0 };
    expect(serializeSimulatorParams(input)).not.toContain("vue=");
    expect(serializeSimulatorParams(input, "mois")).toContain("vue=mois");
  });
});
