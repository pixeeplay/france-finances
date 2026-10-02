import { describe, it, expect } from "vitest";
import {
  CURRENT_DEBT,
  DEBT_TIMELINE,
  EU_COMPARISON,
  HEALTH_SPENDING,
  PUBLIC_SPENDING_BY_FUNCTION,
  SOCIAL_PROTECTION,
  STATE_BUDGET_2026,
  STATE_MISSIONS_2026,
  getChiffresSources,
} from "@/data/chiffres";
import { FISCAL_SOURCES } from "@/data/fiscal-2026";
import { formatBillions, formatEuros, formatNumber, formatPercent } from "@/lib/format";

const normalize = (s: string) => s.replace(/[  ]/g, " ");

describe("données /chiffres", () => {
  it("toutes les sources sont des URL https sans domaine accentué", () => {
    for (const s of [...getChiffresSources(), ...FISCAL_SOURCES]) {
      const url = new URL(s.url);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toMatch(/^[a-z0-9.-]+$/);
      expect(s.label.length).toBeGreaterThan(5);
      expect(s.date).toMatch(/^\d{4}(-\d{2}){0,2}$/);
    }
  });

  it("déduplique les sources", () => {
    const urls = getChiffresSources().map((s) => s.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("le solde de l'État est cohérent avec recettes et dépenses (à 2 Md€ près)", () => {
    const diff = STATE_BUDGET_2026.netRevenueM - STATE_BUDGET_2026.netExpenditureM;
    expect(Math.abs(diff - STATE_BUDGET_2026.balanceM)).toBeLessThan(2_000);
  });

  it("les crédits par mission somment à environ 447,5 Md€ (hors remboursements et dégrèvements)", () => {
    const sum = STATE_MISSIONS_2026.items.reduce((s, i) => s + i.amountBn, 0);
    expect(sum).toBeCloseTo(447.5, 0);
  });

  it("les jeux de données n'ont que des montants positifs et des libellés uniques", () => {
    for (const ds of [STATE_MISSIONS_2026, PUBLIC_SPENDING_BY_FUNCTION, SOCIAL_PROTECTION, HEALTH_SPENDING]) {
      expect(ds.items.every((i) => i.amountBn > 0)).toBe(true);
      expect(new Set(ds.items.map((i) => i.label)).size).toBe(ds.items.length);
    }
  });

  it("la protection sociale détaillée somme au total COFOG", () => {
    const sum = SOCIAL_PROTECTION.items.reduce((s, i) => s + i.amountBn, 0);
    const total = PUBLIC_SPENDING_BY_FUNCTION.items.find((i) => i.label === "Protection sociale")?.amountBn;
    expect(sum).toBeCloseTo(total ?? 0, 0);
  });

  it("le dernier point de la série de dette correspond à la dette actuelle", () => {
    const last = DEBT_TIMELINE.items[DEBT_TIMELINE.items.length - 1];
    expect(last.pctGdp).toBe(CURRENT_DEBT.pctGdp);
    expect(last.amountBn).toBe(CURRENT_DEBT.amountBn);
  });

  it("la France est mise en évidence dans la comparaison européenne", () => {
    expect(EU_COMPARISON.items.filter((c) => c.highlight).map((c) => c.code)).toEqual(["FR"]);
  });
});

describe("format", () => {
  it("formate euros, pourcentages et milliards en fr-FR", () => {
    expect(normalize(formatEuros(1234.6))).toBe("1 235 €");
    expect(normalize(formatPercent(0.1234))).toBe("12,3 %");
    expect(normalize(formatBillions(89.645))).toBe("89,6 Md€");
    expect(normalize(formatNumber(3595.5, 1))).toBe("3 595,5");
  });
});
