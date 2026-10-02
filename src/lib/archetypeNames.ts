import archetypesData from "@/data/archetypes.json";

/**
 * Accès léger aux noms et accroches des archétypes (pages de partage,
 * images Open Graph), sans la logique de calcul de `archetype.ts`.
 */
export interface ArchetypeLabel {
  id: string;
  name: string;
  tagline: string;
}

const LABELS: ReadonlyMap<string, ArchetypeLabel> = new Map(
  archetypesData.archetypes.map((a) => [a.id, { id: a.id, name: a.name, tagline: a.tagline }]),
);

/** Archétype par défaut (lien sans paramètre ou identifiant inconnu). */
export const DEFAULT_ARCHETYPE_ID = "equilibriste";

/** Libellés d'un archétype ; retombe sur l'archétype par défaut si l'identifiant est inconnu. */
export function getArchetypeById(id: string | null | undefined): ArchetypeLabel {
  return (id ? LABELS.get(id) : undefined) ?? (LABELS.get(DEFAULT_ARCHETYPE_ID) as ArchetypeLabel);
}

/** Vrai si l'identifiant correspond à un archétype existant. */
export function isArchetypeId(id: string | null | undefined): id is string {
  return !!id && LABELS.has(id);
}
