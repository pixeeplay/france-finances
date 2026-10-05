import { describe, expect, it } from "vitest";
import decksData from "@/data";
import { ALL_DOSSIERS, DOSSIER_CATALOG, getDossier, getVisibleDossiers } from "@/data/dossiers";
import {
  citedSourceIds,
  dossierWordCount,
  draftsVisible,
  formatDossierDate,
  getVisibleDossierMetas,
  hasVisibleDossiers,
  isDossierVisible,
  readingMinutes,
  sourceNumbers,
} from "@/lib/dossiers";

describe("visibilité des dossiers", () => {
  it("cache les brouillons en production uniquement", () => {
    expect(draftsVisible("production")).toBe(false);
    expect(draftsVisible("development")).toBe(true);
    expect(draftsVisible("test")).toBe(true);
    expect(isDossierVisible({ status: "brouillon" }, false)).toBe(false);
    expect(isDossierVisible({ status: "brouillon" }, true)).toBe(true);
    expect(isDossierVisible({ status: "publie" }, false)).toBe(true);
  });

  it("filtre le catalogue selon le statut", () => {
    const published = DOSSIER_CATALOG.filter((d) => d.status === "publie");
    expect(getVisibleDossierMetas(false)).toHaveLength(published.length);
    expect(getVisibleDossierMetas(true)).toHaveLength(DOSSIER_CATALOG.length);
    expect(getVisibleDossiers(false)).toHaveLength(published.length);
    expect(hasVisibleDossiers(true)).toBe(true);
    expect(hasVisibleDossiers(false)).toBe(published.length > 0);
  });

  it("ne renvoie un brouillon par son adresse qu'hors production", () => {
    const draft = ALL_DOSSIERS.find((d) => d.status === "brouillon");
    if (!draft) return;
    expect(getDossier(draft.slug, true)?.slug).toBe(draft.slug);
    expect(getDossier(draft.slug, false)).toBeUndefined();
    expect(getDossier("adresse-inconnue", true)).toBeUndefined();
  });
});

describe("contenu des dossiers", () => {
  const cardsById = new Map(decksData.cards.map((c) => [c.id, c]));
  const deckIds = new Set(decksData.decks.map((d) => d.id));

  it("a des adresses uniques et lisibles", () => {
    const slugs = ALL_DOSSIERS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(ALL_DOSSIERS.map((d) => [d.slug, d] as const))("%s : format court (600 à 900 mots)", (_slug, dossier) => {
    const words = dossierWordCount(dossier);
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(900);
    expect(readingMinutes(dossier)).toBeGreaterThanOrEqual(3);
  });

  it.each(ALL_DOSSIERS.map((d) => [d.slug, d] as const))("%s : sources citées, précises et en https", (_slug, dossier) => {
    const known = new Set(dossier.sources.map((s) => s.id));
    expect(known.size).toBe(dossier.sources.length);
    const cited = citedSourceIds(dossier);
    for (const id of cited) expect(known, `source inconnue : ${id}`).toContain(id);
    for (const s of dossier.sources) {
      expect(cited, `source jamais citée : ${s.id}`).toContain(s.id);
      const url = new URL(s.url);
      expect(url.protocol).toBe("https:");
      expect(url.pathname.length, `page d'accueil : ${s.url}`).toBeGreaterThan(1);
      expect(s.date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
    }
  });

  it.each(ALL_DOSSIERS.map((d) => [d.slug, d] as const))("%s : chaque chiffre renvoie à une source", (_slug, dossier) => {
    for (const section of dossier.sections) {
      for (const block of section.blocks) {
        if ((block.type === "p" || block.type === "list") && /\d/.test(block.type === "p" ? block.text : block.items.join(" "))) {
          expect(block.refs?.length ?? 0, `paragraphe chiffré sans source dans « ${section.title} »`).toBeGreaterThan(0);
        }
      }
    }
  });

  it.each(ALL_DOSSIERS.map((d) => [d.slug, d] as const))("%s : cartes jouables et catégorie existantes", (_slug, dossier) => {
    expect(deckIds).toContain(dossier.deckId);
    expect(dossier.cardIds.length).toBeGreaterThan(0);
    for (const id of dossier.cardIds) {
      const card = cardsById.get(id);
      expect(card, `carte inconnue : ${id}`).toBeDefined();
      expect(card?.playable, `carte hors jeu : ${id}`).not.toBe(false);
    }
  });

  it("numérote les sources dans l'ordre", () => {
    const numbers = sourceNumbers(ALL_DOSSIERS[0].sources);
    expect(numbers.get(ALL_DOSSIERS[0].sources[0].id)).toBe(1);
    expect(numbers.size).toBe(ALL_DOSSIERS[0].sources.length);
  });

  it("formate les dates en toutes lettres", () => {
    expect(formatDossierDate("2026-10-05")).toBe("5 octobre 2026");
    expect(formatDossierDate("pas une date")).toBe("pas une date");
  });
});
