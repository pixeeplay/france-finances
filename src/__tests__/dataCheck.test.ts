import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cardSchema, expectedCostPerCitizen, isAsciiHostname, sourceUrlSchema } from "@/lib/cardSchema";
import { checkData, isCostCoherent, isHomepageUrl, normalizeTitle } from "@/lib/dataCheck";

const validCard = {
  id: "def-01",
  title: "Dissuasion nucléaire",
  subtitle: "Force de dissuasion",
  description: "Description factuelle.",
  amountBillions: 6.8,
  costPerCitizen: 100,
  deckId: "defense",
  icon: "☢️",
  source: "Sénat (PLF 2026)",
  sourceUrl: "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
  year: 2026,
  sourceDate: "2025-11-24",
  level: 2,
  tags: ["militaire"],
  equivalence: "",
};

const deck = {
  id: "defense",
  name: "Défense",
  description: "Budget des armées",
  icon: "⚔️",
  color: "#3B82F6",
  cardCount: 6,
  type: "main",
};

/** Deck de 6 cartes cohérentes : 2 par niveau. */
function makeDeckCards() {
  return [1, 2, 3, 4, 5, 6].map((n) => ({
    ...validCard,
    id: `def-0${n}`,
    title: `Carte ${n}`,
    level: ((n % 3) + 1) as 1 | 2 | 3,
  }));
}

describe("cardSchema", () => {
  it("accepte une carte valide", () => {
    expect(cardSchema.safeParse(validCard).success).toBe(true);
  });

  it("refuse une clé inconnue", () => {
    expect(cardSchema.safeParse({ ...validCard, souceUrl: "x" }).success).toBe(false);
  });

  it("refuse un niveau hors 1-3 et une sourceDate mal formée", () => {
    expect(cardSchema.safeParse({ ...validCard, level: 4 }).success).toBe(false);
    expect(cardSchema.safeParse({ ...validCard, sourceDate: "24/11/2025" }).success).toBe(false);
  });

  it("refuse null sur un champ optionnel", () => {
    expect(cardSchema.safeParse({ ...validCard, trend: null }).success).toBe(false);
  });
});

describe("sourceUrlSchema", () => {
  it("refuse un domaine accentué", () => {
    expect(sourceUrlSchema.safeParse("https://www.défense.gouv.fr").success).toBe(false);
    expect(isAsciiHostname("www.défense.gouv.fr")).toBe(false);
  });

  it("refuse http et les URL invalides", () => {
    expect(sourceUrlSchema.safeParse("http://www.senat.fr/rap/x.html").success).toBe(false);
    expect(sourceUrlSchema.safeParse("pas une url").success).toBe(false);
  });

  it("accepte une URL https précise", () => {
    expect(sourceUrlSchema.safeParse("https://www.ccomptes.fr/fr/publications/la-filiere-epr").success).toBe(true);
  });
});

describe("helpers", () => {
  it("calcule le coût par habitant sur 68 M d'habitants", () => {
    expect(expectedCostPerCitizen(6.8)).toBeCloseTo(100);
    expect(isCostCoherent(6.8, 100)).toBe(true);
    expect(isCostCoherent(6.8, 104)).toBe(true); // tolérance 5 %
    expect(isCostCoherent(6.8, 120)).toBe(false);
    expect(isCostCoherent(0.03, 1)).toBe(true); // tolérance 1 €
  });

  it("détecte les pages d'accueil", () => {
    expect(isHomepageUrl("https://www.vie-publique.fr")).toBe(true);
    expect(isHomepageUrl("https://www.vie-publique.fr/")).toBe(true);
    expect(isHomepageUrl("https://www.senat.fr/rap/r22-800/r22-800.html")).toBe(false);
  });

  it("normalise les titres (accents, casse, ponctuation)", () => {
    expect(normalizeTitle("Politique agricole commune (PAC)")).toBe(normalizeTitle("politique agricole COMMUNE – pac"));
  });
});

describe("checkData", () => {
  it("valide un jeu de données cohérent", () => {
    const report = checkData({ decksMeta: { decks: [deck] }, cardFiles: { defense: makeDeckCards() } });
    expect(report.errors).toEqual([]);
    expect(report.stats.cards).toBe(6);
    expect(report.stats.levels).toEqual({ 1: 2, 2: 2, 3: 2 });
  });

  it("signale ids et titres en double", () => {
    const cards = makeDeckCards();
    cards[1] = { ...cards[1], id: cards[0].id, title: cards[0].title.toUpperCase() };
    const report = checkData({ decksMeta: { decks: [deck] }, cardFiles: { defense: cards } });
    expect(report.errors.some((e) => e.includes("identifiant présent 2 fois"))).toBe(true);
    expect(report.errors.some((e) => e.includes("Titre en double"))).toBe(true);
  });

  it("signale un coût par habitant incohérent sauf exception documentée", () => {
    const cards = makeDeckCards();
    cards[0] = { ...cards[0], costPerCitizen: 500 };
    const without = checkData({ decksMeta: { decks: [deck] }, cardFiles: { defense: cards } });
    expect(without.errors.some((e) => e.includes("costPerCitizen=500"))).toBe(true);

    const withException = checkData({
      decksMeta: { decks: [deck] },
      cardFiles: { defense: cards },
      costExceptions: { [cards[0].id]: "non budgétaire" },
    });
    expect(withException.errors).toEqual([]);
    expect(withException.warnings.some((w) => w.includes("non budgétaire"))).toBe(true);
  });

  it("signale une exception sur une carte inconnue ou devenue inutile", () => {
    const report = checkData({
      decksMeta: { decks: [deck] },
      cardFiles: { defense: makeDeckCards() },
      costExceptions: { "zzz-99": "x", "def-01": "y" },
    });
    expect(report.errors.some((e) => e.includes("zzz-99"))).toBe(true);
    expect(report.warnings.some((w) => w.includes("def-01") && w.includes("inutile"))).toBe(true);
  });

  it("vérifie decks-meta : cardCount, fichier manquant, deckId et niveaux", () => {
    const cards = makeDeckCards().map((c) => ({ ...c, level: 1 }));
    cards[0] = { ...cards[0], deckId: "sante" };
    const report = checkData({
      decksMeta: { decks: [deck, { ...deck, id: "sante", name: "Santé", cardCount: 0 }] },
      cardFiles: { defense: cards },
    });
    expect(report.errors.some((e) => e.includes("cards/sante.json introuvable"))).toBe(true);
    expect(report.errors.some((e) => e.includes("rangée dans cards/defense.json"))).toBe(true);
    expect(report.errors.some((e) => e.includes("cardCount=6 mais 5"))).toBe(true);
    expect(report.errors.some((e) => e.includes("niveau 2"))).toBe(true);
  });

  it("signale les sources manquantes ou en page d'accueil en avertissement", () => {
    const cards: Record<string, unknown>[] = makeDeckCards();
    const { sourceUrl: _unused, ...withoutUrl } = cards[0];
    void _unused;
    cards[0] = withoutUrl;
    cards[1] = { ...cards[1], sourceUrl: "https://www.vie-publique.fr" };
    const report = checkData({ decksMeta: { decks: [deck] }, cardFiles: { defense: cards } });
    expect(report.errors).toEqual([]);
    expect(report.stats.homepageSourceUrl).toBe(1);
    expect(report.warnings.some((w) => w.includes("pas de sourceUrl"))).toBe(true);
  });
});

describe("données réelles (src/data)", () => {
  const dataDir = join(process.cwd(), "src/data");
  const cardFiles: Record<string, unknown> = {};
  for (const file of readdirSync(join(dataDir, "cards"))) {
    if (file.endsWith(".json")) {
      cardFiles[file.replace(/\.json$/, "")] = JSON.parse(readFileSync(join(dataDir, "cards", file), "utf8"));
    }
  }
  const exceptions = JSON.parse(readFileSync(join(dataDir, "data-check-exceptions.json"), "utf8")) as {
    costPerCitizen: Record<string, string>;
  };

  it("passent le contrôle sans erreur", () => {
    const report = checkData({
      decksMeta: JSON.parse(readFileSync(join(dataDir, "decks-meta.json"), "utf8")),
      cardFiles,
      costExceptions: exceptions.costPerCitizen,
    });
    expect(report.errors).toEqual([]);
    expect(report.stats.cards).toBeGreaterThan(300);
  });
});
