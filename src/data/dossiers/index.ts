import { isDossierVisible, draftsVisible } from "@/lib/dossiers";
import { DOSSIER_CATALOG } from "./catalog";
import { csgDossier } from "./ou-va-1-euro-de-csg";
import { detteDossier } from "./pourquoi-la-dette-coute-de-plus-en-plus-cher";
import { irDossier } from "./qui-paie-l-impot-sur-le-revenu";
import type { Dossier, DossierBody } from "./types";

export { DOSSIER_CATALOG } from "./catalog";
export type * from "./types";

const BODIES: readonly DossierBody[] = [csgDossier, detteDossier, irDossier];

/** Tous les dossiers (métadonnées + texte), brouillons compris, dans l'ordre du catalogue. */
export const ALL_DOSSIERS: readonly Dossier[] = DOSSIER_CATALOG.map((meta) => {
  const body = BODIES.find((b) => b.slug === meta.slug);
  if (!body) throw new Error(`Dossier sans contenu : ${meta.slug}`);
  return { ...meta, ...body };
});

/** Dossiers visibles (publiés, plus les brouillons hors production). */
export function getVisibleDossiers(showDrafts: boolean = draftsVisible()): Dossier[] {
  return ALL_DOSSIERS.filter((d) => isDossierVisible(d, showDrafts));
}

/** Dossier visible par son adresse, ou undefined (brouillon en production, adresse inconnue). */
export function getDossier(slug: string, showDrafts: boolean = draftsVisible()): Dossier | undefined {
  return getVisibleDossiers(showDrafts).find((d) => d.slug === slug);
}
