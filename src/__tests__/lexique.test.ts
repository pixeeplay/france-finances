import { describe, it, expect } from "vitest";
import decksData from "@/data";
import { ACRONYMS } from "@/data/acronyms";
import { ALIASES, DEFINITIONS, LEXICON_SOURCES, TERMS } from "@/data/lexique";
import * as chiffres from "@/data/chiffres";
import * as fiscal from "@/data/fiscal-2026";
import {
  findLexiconMatches,
  findUndefinedAcronyms,
  getLexiconEntries,
  getLexiconEntry,
  lexiconLetter,
  lexiconSlug,
} from "@/lib/lexique";

const CARD_TEXT_FIELDS = ["title", "subtitle", "description", "equivalence"] as const;

/**
 * Sigles des sources (citations) qui ne sont pas des sigles à expliquer :
 * nom d'association écrit en capitales, titre de presse, sigle non identifié
 * dans la référence d'origine.
 */
const SOURCE_ALLOWLIST = new Set(["AMORCE", "ASH", "FOB"]);

/** Toutes les chaînes d'une valeur (objets, tableaux), sauf identifiants techniques et URL. */
function collectStrings(value: unknown, out: string[] = [], key = ""): string[] {
  if (typeof value === "string") {
    if (!["url", "code", "id", "slug", "color", "tone"].includes(key) && !value.startsWith("http")) out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out, key);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectStrings(v, out, k);
  }
  return out;
}

describe("lexique : couverture des contenus", () => {
  it("chaque sigle du texte des cartes a une définition", () => {
    const missing: string[] = [];
    for (const card of decksData.cards) {
      for (const field of CARD_TEXT_FIELDS) {
        const text = card[field];
        if (!text) continue;
        for (const word of findUndefinedAcronyms(text)) missing.push(`${card.id}.${field} : ${word}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("chaque sigle des sources des cartes a une définition (hors noms propres listés)", () => {
    const missing: string[] = [];
    for (const card of decksData.cards) {
      for (const word of findUndefinedAcronyms(card.source)) {
        if (!SOURCE_ALLOWLIST.has(word)) missing.push(`${card.id}.source : ${word}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("chaque sigle des données des pages Chiffres et Simulateur a une définition", () => {
    const strings = collectStrings({ ...chiffres, ...fiscal });
    expect(strings.length).toBeGreaterThan(20);
    const missing = strings.flatMap((s) => findUndefinedAcronyms(s).map((w) => `${w} (« ${s.slice(0, 60)} »)`));
    expect(missing).toEqual([]);
  });
});

describe("lexique : cohérence du dictionnaire", () => {
  it("chaque explication, alias et source pointe vers une entrée existante", () => {
    const keys = new Set([...Object.keys(ACRONYMS), ...Object.keys(TERMS)]);
    for (const key of Object.keys(DEFINITIONS)) expect(keys, `DEFINITIONS.${key}`).toContain(key);
    for (const [alias, key] of Object.entries(ALIASES)) expect(keys, `ALIASES.${alias}`).toContain(key);
    for (const key of Object.keys(LEXICON_SOURCES)) expect(keys, `LEXICON_SOURCES.${key}`).toContain(key);
  });

  it("aucun sigle n'est aussi un terme (une seule entrée par mot)", () => {
    for (const term of Object.keys(TERMS)) expect(ACRONYMS[term]).toBeUndefined();
  });

  it("les ancres sont uniques et non vides", () => {
    const entries = getLexiconEntries();
    const slugs = entries.map((e) => e.slug);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("les entrées sont triées de A à Z et toutes ont un contenu", () => {
    const entries = getLexiconEntries();
    expect(entries.length).toBe(Object.keys(ACRONYMS).length + Object.keys(TERMS).length);
    for (const e of entries) expect(e.expansion ?? e.definition).toBeTruthy();
    const letters = entries.map((e) => lexiconLetter(e.key));
    const order = [...new Set(letters)];
    expect(order[0]).toBe("0-9");
    expect(order.slice(1)).toEqual([...order.slice(1)].sort());
  });
});

describe("lexique : repérage dans un texte", () => {
  it("reconnaît sigles, termes et formes en minuscules", () => {
    const matches = findLexiconMatches("Selon l'Insee, les niches fiscales et la CSG pèsent sur le PIB.");
    expect(matches.map((m) => [m.value, m.key])).toEqual([
      ["Insee", "INSEE"],
      ["niches fiscales", "Niche fiscale"],
      ["CSG", "CSG"],
      ["PIB", "PIB"],
    ]);
  });

  it("préfère la forme la plus longue et respecte les mots entiers accentués", () => {
    expect(findLexiconMatches("le PSR-UE").map((m) => m.key)).toEqual(["PSR-UE"]);
    expect(findLexiconMatches("missile ASMP-A rénové").map((m) => m.key)).toEqual(["ASMP-A"]);
    expect(findLexiconMatches("Péréquation entre communes").map((m) => m.key)).toEqual(["Péréquation"]);
    expect(findLexiconMatches("CSGé")).toEqual([]);
  });

  it("signale un sigle inconnu et ignore les mots ordinaires", () => {
    expect(findUndefinedAcronyms("Le XYZW finance la CSG.")).toEqual(["XYZW"]);
    expect(findUndefinedAcronyms("Les blindés AMX-10 RC et la classe de CE1.")).toEqual([]);
    expect(findUndefinedAcronyms("Une phrase sans sigle, en 2026.")).toEqual([]);
  });

  it("construit des ancres lisibles", () => {
    expect(lexiconSlug("CO₂")).toBe("co2");
    expect(lexiconSlug("Prélèvement sur recettes")).toBe("prelevement-sur-recettes");
    expect(lexiconSlug("SAMP/T")).toBe("samp-t");
    expect(getLexiconEntry("ONDAM")?.definition).toBeTruthy();
    expect(getLexiconEntry("inconnu")).toBeNull();
  });
});
