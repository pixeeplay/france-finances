import { describe, it, expect } from "vitest";
import {
  PLF_2027_DEBT_INTEREST,
  PLF_2027_EFFORT,
  PLF_2027_MEASURES,
  PLF_2027_MISSIONS,
  PLF_2027_ONDAM,
  PLF_2027_ONDAM_TOTAL,
  PLF_2027_PDE,
  PLF_2027_SOCIAL_SECURITY,
  PLF_2027_SOURCES,
  PLF_2027_STATE_BALANCE,
  PLF_2027_TRAJECTORY,
  PLF_2027_UPDATED,
  plf2027Delta,
} from "@/data/plf-2027";
import { getChiffresSources } from "@/data/chiffres";

const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const mission = (prefix: string) => {
  const m = PLF_2027_MISSIONS.find((i) => i.label.startsWith(prefix));
  if (!m) throw new Error(`mission introuvable : ${prefix}`);
  return m;
};

describe("données du projet de budget 2027", () => {
  it("porte une date de mise à jour et des sources officielles en https", () => {
    expect(PLF_2027_UPDATED).toMatch(/^2026-\d{2}-\d{2}$/);
    for (const s of PLF_2027_SOURCES) {
      const url = new URL(s.url);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toMatch(/(^|\.)(gouv\.fr|hcfp\.fr|assemblee-nationale\.fr|senat\.fr)$/);
    }
  });

  it("les sources figurent dans la liste des sources de /chiffres", () => {
    const urls = getChiffresSources().map((s) => s.url);
    for (const s of PLF_2027_SOURCES) expect(urls).toContain(s.url);
  });

  it("les mesures nouvelles se répartissent entre recettes et dépenses, dans l'effort total", () => {
    expect(PLF_2027_EFFORT.newRevenueBn + PLF_2027_EFFORT.newSpendingBn).toBe(PLF_2027_EFFORT.newMeasuresBn);
    expect(PLF_2027_EFFORT.newMeasuresBn).toBeLessThanOrEqual(PLF_2027_EFFORT.totalBn);
  });

  it("les mesures d'économie et de recette chiffrées restent dans les 43 Md€", () => {
    const savings = PLF_2027_MEASURES.filter((m) => m.kind !== "hausse").map((m) => m.amountBn ?? 0);
    expect(sum(savings)).toBeLessThanOrEqual(PLF_2027_EFFORT.newMeasuresBn);
    expect(new Set(PLF_2027_MEASURES.map((m) => m.label)).size).toBe(PLF_2027_MEASURES.length);
  });

  it("le solde de l'État égale recettes - dépenses + budgets annexes + comptes spéciaux (à 0,2 Md€ près)", () => {
    for (const b of [PLF_2027_STATE_BALANCE.lfi2026, PLF_2027_STATE_BALANCE.plf2027]) {
      const computed = b.netRevenueBn - b.netExpenditureBn + b.annexBudgetsBalanceBn + b.specialAccountsBalanceBn;
      expect(Math.abs(computed - b.balanceBn)).toBeLessThanOrEqual(0.2);
    }
  });

  it("les composantes du périmètre des dépenses de l'État somment au total (à 0,5 Md€ près)", () => {
    const c = PLF_2027_PDE.components;
    expect(Math.abs(sum(c.map((i) => i.lfi2026Bn)) - PLF_2027_PDE.lfi2026Bn)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(sum(c.map((i) => i.plf2027Bn)) - PLF_2027_PDE.plf2027Bn)).toBeLessThanOrEqual(0.5);
  });

  it("les 31 missions somment aux crédits des ministères plus la charge de la dette (à 0,5 Md€ près)", () => {
    expect(PLF_2027_MISSIONS).toHaveLength(31);
    expect(new Set(PLF_2027_MISSIONS.map((m) => m.label)).size).toBe(31);
    const ministries = PLF_2027_PDE.components[0];
    const debt = PLF_2027_DEBT_INTEREST.state;
    expect(Math.abs(sum(PLF_2027_MISSIONS.map((m) => m.lfi2026Bn)) - (ministries.lfi2026Bn + debt.lfi2026Bn))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(sum(PLF_2027_MISSIONS.map((m) => m.plf2027Bn)) - (ministries.plf2027Bn + debt.plf2027Bn))).toBeLessThanOrEqual(0.5);
    expect(PLF_2027_MISSIONS.filter((m) => m.debt)).toHaveLength(1);
  });

  it("les hausses annoncées correspondent aux écarts de crédits des missions", () => {
    const byLabel = (l: string) => PLF_2027_MEASURES.find((m) => m.label.startsWith(l))?.amountBn;
    expect(plf2027Delta(mission("Défense"))).toBe(byLabel("Défense"));
    expect(mission("Défense").plf2027Bn).toBe(63.4);
    expect(plf2027Delta(mission("Enseignement scolaire"))).toBe(byLabel("Éducation"));
    expect(plf2027Delta(mission("Recherche"))).toBe(byLabel("Recherche"));
    expect(mission("Justice").plf2027Bn).toBe(11.0);
  });

  it("l'Ondam somme ses sous-objectifs et progresse de 2,0 %", () => {
    expect(sum(PLF_2027_ONDAM.map((i) => i.y2026Bn))).toBeCloseTo(PLF_2027_ONDAM_TOTAL.y2026Bn, 1);
    expect(sum(PLF_2027_ONDAM.map((i) => i.y2027Bn))).toBeCloseTo(PLF_2027_ONDAM_TOTAL.y2027Bn, 1);
    const growth = (PLF_2027_ONDAM_TOTAL.y2027Bn / PLF_2027_ONDAM_TOTAL.y2026Bn - 1) * 100;
    expect(growth).toBeCloseTo(PLF_2027_ONDAM_TOTAL.growthPct, 1);
  });

  it("le solde de la Sécurité sociale égale recettes - dépenses", () => {
    for (const y of [PLF_2027_SOCIAL_SECURITY.forecast2026, PLF_2027_SOCIAL_SECURITY.plfss2027]) {
      expect(y.revenueBn - y.expenditureBn).toBeCloseTo(y.balanceBn, 1);
    }
  });

  it("la trajectoire couvre 2025-2027 avec un déficit visé de 5,0 % et des intérêts en hausse", () => {
    expect(PLF_2027_TRAJECTORY.map((p) => p.year)).toEqual([2025, 2026, 2027]);
    expect(PLF_2027_TRAJECTORY[2].balancePctGdp).toBe(-5.0);
    expect(PLF_2027_TRAJECTORY[2].status).toBe("projet");
    expect(PLF_2027_DEBT_INTEREST.publicSector.y2027Bn).toBeGreaterThan(PLF_2027_DEBT_INTEREST.publicSector.y2026Bn);
  });
});
