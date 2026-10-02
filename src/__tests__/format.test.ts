import { describe, it, expect } from "vitest";
import { formatBillions, formatEuros, formatPercent, amountScalePosition } from "@/lib/format";

/** Normalise les espaces insécables pour comparer facilement. */
const n = (s: string) => s.replace(/[  ]/g, " ");

describe("formatBillions", () => {
  it("formate les milliards avec virgule décimale", () => {
    expect(n(formatBillions(47.2))).toBe("47,2 Md€");
    expect(n(formatBillions(16))).toBe("16 Md€");
  });

  it("arrondit à l'entier au-delà de 100 Md€ avec séparateur de milliers", () => {
    expect(n(formatBillions(1260))).toBe("1 260 Md€");
    expect(n(formatBillions(370))).toBe("370 Md€");
  });

  it("bascule en millions sous 1 Md€", () => {
    expect(n(formatBillions(0.03))).toBe("30 M€");
    expect(n(formatBillions(0.0045))).toBe("4,5 M€");
  });

  it("gère zéro et les valeurs invalides", () => {
    expect(n(formatBillions(0))).toBe("0 €");
    expect(n(formatBillions(Number.NaN))).toBe("0 €");
  });
});

describe("formatEuros / formatPercent", () => {
  it("formate les euros entiers", () => {
    expect(n(formatEuros(5440))).toBe("5 440 €");
    expect(n(formatEuros(243.6))).toBe("244 €");
  });

  it("formate les pourcentages", () => {
    expect(n(formatPercent(42.4))).toBe("42 %");
  });
});

describe("amountScalePosition", () => {
  it("place les décades à intervalles réguliers", () => {
    expect(amountScalePosition(0.01)).toBe(0);
    expect(amountScalePosition(1)).toBeCloseTo(0.4);
    expect(amountScalePosition(100)).toBeCloseTo(0.8);
    expect(amountScalePosition(1000)).toBe(1);
  });

  it("borne les valeurs hors domaine", () => {
    expect(amountScalePosition(0)).toBe(0);
    expect(amountScalePosition(5000)).toBe(1);
  });
});

describe("séparateur de milliers", () => {
  it("utilise l'espace insécable (pas l'espace fine, quasi invisible en Outfit)", () => {
    expect(formatEuros(52030)).toBe("52\u00a0030\u00a0€");
    expect(formatBillions(1671)).toBe("1\u00a0671\u00a0Md€");
    expect(formatEuros(52030)).not.toContain("\u202f");
  });
});
