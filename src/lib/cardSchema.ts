/**
 * Schémas Zod des données du jeu (cartes et decks).
 *
 * Ce fichier n'importe rien via l'alias "@/" : il est aussi chargé par le
 * script `npm run data:check` (scripts/data-check.ts), exécuté hors de Next.
 *
 * Règles documentées dans src/data/README.md.
 */
import { z } from "zod";

/**
 * Population de référence unique du site (coût par habitant des cartes, accroche
 * de l'accueil, page /chiffres) : population au 1er janvier 2026, France entière
 * (Insee, bilan démographique 2025).
 */
export const POPULATION_REFERENCE = 69_100_000;

/** Coût par habitant attendu (en euros) pour un montant en milliards d'euros. */
export function expectedCostPerCitizen(amountBillions: number): number {
  return (amountBillions * 1e9) / POPULATION_REFERENCE;
}

/**
 * Vrai si le nom d'hôte est en ASCII pur. Un domaine accentué
 * (ex. "www.défense.gouv.fr") n'existe pas : le vrai domaine est sans accent.
 */
export function isAsciiHostname(hostname: string): boolean {
  return /^[a-z0-9.-]+$/i.test(hostname);
}

/** Extrait le nom d'hôte brut (avant conversion punycode par l'API URL). */
function rawHostname(url: string): string {
  const match = /^https?:\/\/([^/?#:]+)/i.exec(url);
  return match ? match[1] : "";
}

/** URL de source : https obligatoire, domaine ASCII, URL analysable. */
export const sourceUrlSchema = z
  .string()
  .refine((value) => URL.canParse(value), { message: "URL invalide" })
  .refine((value) => value.startsWith("https://"), {
    message: "L'URL doit être en https",
  })
  .refine((value) => isAsciiHostname(rawHostname(value)), {
    message: "Domaine accentué ou non ASCII (ex. défense.gouv.fr → defense.gouv.fr)",
  });

/** Date de la source : "AAAA", "AAAA-MM" ou "AAAA-MM-JJ". */
export const sourceDateSchema = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, {
    message: "sourceDate doit être au format AAAA, AAAA-MM ou AAAA-MM-JJ",
  });

const nonEmpty = z.string().trim().min(1);

export const cardSchema = z.strictObject({
  id: z.string().regex(/^[a-z]{3}-\d{2}$/, { message: "id attendu : xxx-00" }),
  title: nonEmpty,
  subtitle: nonEmpty,
  description: nonEmpty,
  /** Montant en milliards d'euros (0 autorisé pour les cartes non chiffrées). */
  amountBillions: z.number().finite().nonnegative(),
  /** Coût annuel par habitant en euros. */
  costPerCitizen: z.number().finite().nonnegative(),
  deckId: nonEmpty,
  icon: nonEmpty,
  /** Évolution sur 5 ans en %. */
  trend: z.number().finite().optional(),
  source: nonEmpty,
  sourceUrl: sourceUrlSchema.optional(),
  /** Année budgétaire du montant (ex. 2026 pour la LFI 2026). */
  year: z.number().int().min(2000).max(2100).optional(),
  /** Date de publication de la source principale. */
  sourceDate: sourceDateSchema.optional(),
  /** 1 = grand poste, 2 = dispositif, 3 = niche / micro-audit. */
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(nonEmpty).optional(),
  equivalence: z.string().optional(),
});

export const deckSchema = z.strictObject({
  id: z.string().regex(/^[a-z]+(-[a-z]+)*$/),
  name: nonEmpty,
  description: nonEmpty,
  icon: nonEmpty,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  cardCount: z.number().int().nonnegative(),
  image: z.string().startsWith("/").optional(),
  type: z.enum(["main", "thematic"]).optional(),
});

export const decksMetaSchema = z.strictObject({
  decks: z.array(deckSchema).min(1),
});

export type CardData = z.infer<typeof cardSchema>;
export type DeckData = z.infer<typeof deckSchema>;
