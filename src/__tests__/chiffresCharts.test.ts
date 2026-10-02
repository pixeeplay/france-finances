import { describe, it, expect } from "vitest";
import { getDeckColor } from "@/lib/deckMeta";
import {
  DEBT_TIMELINE,
  EU_COMPARISON,
  POPULATION_2026,
  PUBLIC_SPENDING_BY_FUNCTION,
  STATE_MISSIONS_2026,
  STATE_TAX_REVENUE_2026,
  getChiffresSources,
} from "@/data/chiffres";
import {
  BAR_ROW_HEIGHT,
  COFOG_DECK,
  barsChartHeight,
  coinsPer100,
  cofogColor,
  datumColor,
  debtChangePoints,
  debtSeries,
  euDebtBars,
  perCapita,
  perCapitaComparison,
  periodToTime,
  shortenLabel,
  splitPer1000,
  sumAmounts,
  toBarData,
  toShares,
  toneColor,
  topWithRest,
} from "@/lib/chiffresCharts";

const fmt = (v: number) => `${v}`;

describe("splitPer1000", () => {
  it("répartit exactement 1 000 € sur la dépense par fonction", () => {
    const slices = splitPer1000(PUBLIC_SPENDING_BY_FUNCTION.items);
    expect(slices).toHaveLength(PUBLIC_SPENDING_BY_FUNCTION.items.length);
    expect(slices.reduce((s, x) => s + x.euros, 0)).toBe(1000);
    // Protection sociale : 693 / 1 671 Md€ ≈ 414,7 €
    expect(slices[0]).toMatchObject({ label: "Protection sociale" });
    expect(slices[0].euros).toBeGreaterThanOrEqual(414);
    expect(slices[0].euros).toBeLessThanOrEqual(415);
    expect(slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100, 6);
  });

  it("chaque part arrondie reste à moins d'un euro de la valeur exacte", () => {
    const items = [
      { label: "a", amountBn: 1 },
      { label: "b", amountBn: 1 },
      { label: "c", amountBn: 1 },
    ];
    const slices = splitPer1000(items);
    expect(slices.map((s) => s.euros).sort()).toEqual([333, 333, 334]);
    for (const s of slices) expect(Math.abs(s.euros - 1000 / 3)).toBeLessThan(1);
  });

  it("renvoie une liste vide si le total est nul", () => {
    expect(splitPer1000([])).toEqual([]);
    expect(splitPer1000([{ label: "x", amountBn: 0 }])).toEqual([]);
  });

  it("attribue des teintes distinctes dans l'ordre de la palette", () => {
    const tones = splitPer1000(PUBLIC_SPENDING_BY_FUNCTION.items).map((s) => s.tone);
    expect(new Set(tones).size).toBe(tones.length);
  });
});

describe("perCapita", () => {
  it("convertit des Md€ en euros par habitant", () => {
    expect(perCapita(69.1, 69_100_000)).toBeCloseTo(1000, 6);
    expect(perCapita(1, 0)).toBe(0);
    expect(perCapita(Number.NaN, POPULATION_2026)).toBe(0);
  });

  it("compare les intérêts à d'autres postes, triés et mis en évidence", () => {
    const rows = perCapitaComparison(
      [
        { label: "Intérêts", amountBn: 64.7, year: 2025, highlight: true },
        { label: "Défense", amountBn: 54, year: "2024" },
        { label: "Enseignement", amountBn: 149, year: "2024" },
      ],
      POPULATION_2026,
      (e) => `${e} €`,
    );
    expect(rows.map((r) => r.label)).toEqual(["Enseignement (2024)", "Intérêts (2025)", "Défense (2024)"]);
    expect(rows[1]).toMatchObject({ tone: "red", highlight: true, value: 936, display: "936 €" });
    expect(rows[2].tone).toBe("blue");
  });
});

describe("topWithRest", () => {
  it("garde les N premières missions et regroupe le reste sans perdre de montant", () => {
    const rows = topWithRest(STATE_MISSIONS_2026.items, 10, (n) => `${n} autres missions`);
    expect(rows).toHaveLength(11);
    expect(rows[0].label).toBe("Enseignement scolaire");
    expect(rows[10].label).toBe(`${STATE_MISSIONS_2026.items.length - 10} autres missions`);
    expect(sumAmounts(rows)).toBeCloseTo(sumAmounts(STATE_MISSIONS_2026.items), 6);
    for (let i = 1; i < 10; i++) expect(rows[i - 1].amountBn).toBeGreaterThanOrEqual(rows[i].amountBn);
  });

  it("n'ajoute pas de ligne de reste quand tout tient", () => {
    const items = [
      { label: "a", amountBn: 2 },
      { label: "b", amountBn: 1 },
    ];
    expect(topWithRest(items, 5, () => "reste")).toEqual([items[0], items[1]]);
  });
});

describe("shortenLabel", () => {
  it("retire la précision entre parenthèses", () => {
    expect(shortenLabel("Services publics généraux (dont intérêts de la dette)")).toBe("Services publics généraux");
  });

  it("tronque sur un mot avec une ellipse", () => {
    const s = shortenLabel("Travail, emploi et administration des ministères sociaux", 30);
    expect(s.length).toBeLessThanOrEqual(30);
    expect(s.endsWith("…")).toBe(true);
    expect(s).toBe("Travail, emploi et…");
  });

  it("laisse intacts les libellés courts", () => {
    expect(shortenLabel("Défense")).toBe("Défense");
  });
});

describe("toBarData / toShares", () => {
  it("formate et colore chaque barre", () => {
    const bars = toBarData(PUBLIC_SPENDING_BY_FUNCTION.items, fmt);
    expect(bars[0]).toMatchObject({ label: "Protection sociale", value: 693, display: "693", tone: "emerald" });
    expect(bars[2].shortLabel).toBe("Services publics généraux");
  });

  it("calcule les parts des recettes fiscales 2026", () => {
    const shares = toShares(STATE_TAX_REVENUE_2026.items, fmt, ["emerald", "blue", "violet", "amber"]);
    expect(shares.map((s) => s.pct)).toEqual([29, 28, 16, 27]);
    expect(shares.map((s) => s.tone)).toEqual(["emerald", "blue", "violet", "amber"]);
  });

  it("les recettes fiscales nettes 2026 somment à 372,9 Md€ et la source est listée", () => {
    expect(sumAmounts(STATE_TAX_REVENUE_2026.items)).toBeCloseTo(372.9, 6);
    expect(getChiffresSources().map((s) => s.url)).toContain(STATE_TAX_REVENUE_2026.source.url);
  });
});

describe("série de dette", () => {
  it("place les périodes sur un axe temporel proportionnel", () => {
    expect(periodToTime("2019")).toBe(2020);
    expect(periodToTime("T2 2026")).toBe(2026.5);
    expect(periodToTime("T4 2025")).toBe(2026);
    expect(periodToTime("n/a")).toBeNaN();
  });

  it("conserve tous les points, croissants dans le temps", () => {
    const s = debtSeries(DEBT_TIMELINE.items);
    expect(s).toHaveLength(DEBT_TIMELINE.items.length);
    for (let i = 1; i < s.length; i++) expect(s[i].t).toBeGreaterThan(s[i - 1].t);
    expect(s[0].amountBn).toBeNull();
    expect(s[s.length - 1]).toMatchObject({ period: "T2 2026", pctGdp: 119, amountBn: 3595.5 });
  });

  it("ignore les périodes non reconnues", () => {
    expect(debtSeries([{ period: "bientôt", pctGdp: 1 }])).toEqual([]);
  });

  it("calcule la hausse en points de PIB", () => {
    expect(debtChangePoints(DEBT_TIMELINE.items)).toBe(21.1);
    expect(debtChangePoints([{ period: "2019", pctGdp: 1 }])).toBe(0);
  });
});

describe("comparaison européenne", () => {
  it("trie par dette décroissante et colore France / agrégats", () => {
    const bars = euDebtBars(EU_COMPARISON.items, fmt);
    expect(bars[0].label).toBe("Italie");
    for (let i = 1; i < bars.length; i++) expect(bars[i - 1].value).toBeGreaterThanOrEqual(bars[i].value);
    expect(bars.find((b) => b.label === "France")).toMatchObject({ tone: "red", highlight: true });
    expect(bars.find((b) => b.label === "Zone euro")?.tone).toBe("amber");
    expect(bars.find((b) => b.label === "Allemagne")?.tone).toBe("blue");
  });
});

describe("utilitaires", () => {
  it("hauteur des graphiques en barres et variables de couleur", () => {
    expect(barsChartHeight(10)).toBe(10 * BAR_ROW_HEIGHT + 8);
    expect(barsChartHeight(0)).toBe(BAR_ROW_HEIGHT + 8);
    expect(toneColor("red")).toBe("var(--chart-red)");
  });
});

describe("débuts de série et trous de la dette", () => {
  it("trace en pointillé le segment où des années manquent (2019 -> 2022)", () => {
    const s = debtSeries(DEBT_TIMELINE.items);
    const y2019 = s.find((p) => p.period === "2019");
    const y2022 = s.find((p) => p.period === "2022");
    const last = s[s.length - 1];
    expect(y2019).toMatchObject({ solid: null, gap: y2019?.pctGdp });
    expect(y2022?.gap).toBe(y2022?.pctGdp);
    expect(y2022?.solid).toBe(y2022?.pctGdp);
    expect(last.solid).toBe(last.pctGdp);
    expect(last.gap).toBeNull();
  });
});

describe("pièces de 10 € et couleurs COFOG", () => {
  it("répartit exactement 100 pièces", () => {
    const coins = coinsPer100(splitPer1000(PUBLIC_SPENDING_BY_FUNCTION.items));
    expect(coins.reduce((a, b) => a + b, 0)).toBe(100);
    expect(coins[0]).toBeGreaterThanOrEqual(41);
    expect(coinsPer100([{ euros: 333 }, { euros: 333 }, { euros: 334 }])).toEqual([33, 33, 34]);
  });

  it("donne à chaque fonction COFOG la couleur de sa catégorie du jeu", () => {
    for (const item of PUBLIC_SPENDING_BY_FUNCTION.items) {
      expect(COFOG_DECK[item.label]).toBeDefined();
      expect(cofogColor(item.label)).toBe(getDeckColor(COFOG_DECK[item.label]));
    }
    const colors = PUBLIC_SPENDING_BY_FUNCTION.items.map((i) => cofogColor(i.label));
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("préfère la couleur explicite à la teinte", () => {
    expect(datumColor({ tone: "blue" })).toBe("var(--chart-blue)");
    expect(datumColor({ tone: "blue", color: "#123456" })).toBe("#123456");
  });
});
