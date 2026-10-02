import { ACRONYMS } from "@/data/acronyms";
import { ALIASES, DEFINITIONS, LEXICON_SOURCES, TERMS, type LexiconSource } from "@/data/lexique";

/** Une entrée du lexique : sigle (avec son nom développé) ou terme du jargon. */
export interface LexiconEntry {
  /** Clé canonique (sigle ou terme), telle qu'affichée dans le lexique */
  key: string;
  /** Ancre de l'entrée dans la page /lexique */
  slug: string;
  /** Nom développé du sigle (absent pour un terme) */
  expansion?: string;
  /** Explication en français courant */
  definition?: string;
  source?: LexiconSource;
}

/** Ancre stable : minuscules, sans accents, tirets. « CO₂ » → « co2 », « Agirc-Arrco » → « agirc-arrco ». */
export function lexiconSlug(key: string): string {
  return key
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEntry(key: string): LexiconEntry | null {
  const expansion = ACRONYMS[key];
  const termDefinition = TERMS[key];
  if (expansion === undefined && termDefinition === undefined) return null;
  return {
    key,
    slug: lexiconSlug(key),
    ...(expansion !== undefined ? { expansion } : {}),
    ...(DEFINITIONS[key] ?? termDefinition ? { definition: DEFINITIONS[key] ?? termDefinition } : {}),
    ...(LEXICON_SOURCES[key] ? { source: LEXICON_SOURCES[key] } : {}),
  };
}

/** Toutes les formes reconnues dans un texte → clé canonique du lexique. */
function buildForms(): Map<string, string> {
  const forms = new Map<string, string>();
  for (const key of Object.keys(ACRONYMS)) forms.set(key, key);
  for (const [alias, key] of Object.entries(ALIASES)) {
    forms.set(alias, key);
    const first = alias.charAt(0);
    if (first !== first.toUpperCase()) forms.set(first.toUpperCase() + alias.slice(1), key);
  }
  return forms;
}

const FORMS = buildForms();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

// Les formes les plus longues d'abord (« PSR-UE » avant « PSR »), en mot entier
// au sens Unicode (\b ne gère pas les lettres accentuées).
const FORM_PATTERN = [...FORMS.keys()]
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

export interface LexiconMatch {
  /** Texte trouvé tel qu'écrit */
  value: string;
  /** Clé canonique de l'entrée du lexique */
  key: string;
  index: number;
}

/** Repère dans un texte tous les sigles et termes qui ont une entrée dans le lexique. */
export function findLexiconMatches(text: string): LexiconMatch[] {
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])(?:${FORM_PATTERN})(?![\\p{L}\\p{N}])`, "gu");
  const matches: LexiconMatch[] = [];
  for (const m of text.matchAll(regex)) {
    const key = FORMS.get(m[0]);
    if (key !== undefined) matches.push({ value: m[0], key, index: m.index });
  }
  return matches;
}

/** Entrée du lexique pour une clé canonique (sigle ou terme). */
export function getLexiconEntry(key: string): LexiconEntry | null {
  return buildEntry(key);
}

/** Lettre de rangement : première lettre sans accent, « 0-9 » pour les chiffres. */
export function lexiconLetter(key: string): string {
  const first = lexiconSlug(key).charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "0-9";
}

/** Toutes les entrées, triées de A à Z (ordre alphabétique français, sans tenir compte de la casse). */
export function getLexiconEntries(): LexiconEntry[] {
  const keys = new Set([...Object.keys(ACRONYMS), ...Object.keys(TERMS)]);
  const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });
  return [...keys]
    .map((key) => buildEntry(key))
    .filter((entry): entry is LexiconEntry => entry !== null)
    .sort((a, b) => collator.compare(a.key, b.key));
}

/**
 * Sigles d'un texte (mots d'au moins deux majuscules, chiffres et tirets
 * admis : « CSG », « AT-MP », « CE1 », « CO₂ ») qui ne sont couverts par
 * aucune entrée du lexique. Sert aux tests de couverture des contenus.
 */
export function findUndefinedAcronyms(text: string): string[] {
  const covered: Array<[number, number]> = findLexiconMatches(text).map((m) => [m.index, m.index + m.value.length]);
  const sigle = /(?<![\p{L}\p{N}])[\p{Lu}\p{N}][\p{Lu}\p{N}₀-₉-]*(?![\p{L}\p{N}₀-₉])/gu;
  const missing: string[] = [];
  for (const m of text.matchAll(sigle)) {
    const word = m[0].replace(/-+$/, "");
    if ((word.match(/\p{Lu}/gu) ?? []).length < 2) continue;
    const start = m.index;
    const end = start + word.length;
    if (covered.some(([s, e]) => s <= start && end <= e)) continue;
    missing.push(word);
  }
  return missing;
}
