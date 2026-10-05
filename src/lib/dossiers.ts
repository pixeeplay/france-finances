/**
 * Dossiers éditoriaux : visibilité (brouillon / publié), lecture, sources.
 *
 * N'importe que le catalogue (métadonnées) : utilisable par la navigation
 * côté client sans embarquer le texte des articles. Le corps des dossiers
 * se lit avec `getDossier` (src/data/dossiers).
 */
import { DOSSIER_CATALOG } from "@/data/dossiers/catalog";
import type { Dossier, DossierBlock, DossierMeta, DossierSource } from "@/data/dossiers/types";

/** Les brouillons s'affichent en développement (et en test), jamais en production. */
export function draftsVisible(nodeEnv: string | undefined = process.env.NODE_ENV): boolean {
  return nodeEnv !== "production";
}

export function isDossierVisible(meta: Pick<DossierMeta, "status">, showDrafts: boolean = draftsVisible()): boolean {
  return meta.status === "publie" || showDrafts;
}

/** Dossiers visibles, dans l'ordre du catalogue. */
export function getVisibleDossierMetas(
  showDrafts: boolean = draftsVisible(),
  catalog: readonly DossierMeta[] = DOSSIER_CATALOG,
): DossierMeta[] {
  return catalog.filter((d) => isDossierVisible(d, showDrafts));
}

/** Au moins un dossier à montrer : la navigation pointe alors vers /dossiers. */
export function hasVisibleDossiers(showDrafts: boolean = draftsVisible()): boolean {
  return getVisibleDossierMetas(showDrafts).length > 0;
}

const WORDS_PER_MINUTE = 220;

function blockText(block: DossierBlock): string {
  switch (block.type) {
    case "p":
      return block.text;
    case "list":
      return block.items.join(" ");
    case "chiffre":
      return `${block.value} ${block.label} ${block.detail ?? ""}`;
    case "chart":
      return "";
  }
}

/** Nombre de mots du texte courant (titres de section, paragraphes, listes, encadrés). */
export function dossierWordCount(dossier: Pick<Dossier, "sections">): number {
  const text = dossier.sections
    .flatMap((s) => [s.title, ...s.blocks.map(blockText)])
    .join(" ");
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Temps de lecture arrondi à la minute (au moins 1). */
export function readingMinutes(dossier: Pick<Dossier, "sections">): number {
  return Math.max(1, Math.round(dossierWordCount(dossier) / WORDS_PER_MINUTE));
}

/** Numéro d'appel (1, 2, 3…) de chaque source, dans l'ordre de la liste. */
export function sourceNumbers(sources: readonly DossierSource[]): Map<string, number> {
  return new Map(sources.map((s, i) => [s.id, i + 1]));
}

/** Identifiants de sources cités dans le dossier (renvois et graphiques). */
export function citedSourceIds(dossier: Pick<Dossier, "sections">): Set<string> {
  const ids = new Set<string>();
  for (const section of dossier.sections) {
    for (const block of section.blocks) {
      if (block.type === "chart") {
        if (block.chart.kind === "bars") ids.add(block.chart.source);
      } else {
        for (const ref of block.refs ?? []) ids.add(ref);
      }
    }
  }
  return ids;
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** « 2026-10-05 » -> « 5 octobre 2026 ». */
export function formatDossierDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? isoDate : DATE_FORMAT.format(date);
}
