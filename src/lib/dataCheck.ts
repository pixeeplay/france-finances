/**
 * Contrôle de cohérence des données (cartes + decks).
 * Logique pure, utilisée par `npm run data:check` et par les tests Vitest.
 * Pas d'import "@/" : ce module est aussi exécuté hors de Next (jiti).
 */
import {
  cardSchema,
  decksMetaSchema,
  expectedCostPerCitizen,
  type CardData,
  type CardKindData,
} from "./cardSchema";

/** Deck dont toutes les cartes doivent être des recettes. */
export const REVENUE_DECK_ID = "recettes";

/** Écart toléré entre costPerCitizen et montant / 69,1 M : 1 € ou 5 %. */
export const COST_TOLERANCE_ABSOLUTE = 1;
export const COST_TOLERANCE_RELATIVE = 0.05;

/** Nombre minimum de cartes par niveau dans chaque deck. */
export const MIN_CARDS_PER_LEVEL = 2;

export interface DataCheckInput {
  /** Contenu brut de decks-meta.json */
  decksMeta: unknown;
  /** Contenu brut de chaque fichier de cartes, indexé par nom de fichier sans extension */
  cardFiles: Record<string, unknown>;
  /**
   * Cartes dont le coût par habitant n'est pas dérivé du montant
   * (id → justification). Voir src/data/data-check-exceptions.json.
   */
  costExceptions?: Record<string, string>;
}

export interface DataCheckReport {
  errors: string[];
  warnings: string[];
  stats: {
    decks: number;
    cards: number;
    withSourceUrl: number;
    homepageSourceUrl: number;
    withYear: number;
    levels: Record<1 | 2 | 3, number>;
    /** Répartition des cartes jouables par nature (dépense / recette / agrégat). */
    kinds: Record<CardKindData, number>;
  };
}

/** Normalise un titre pour détecter les doublons (casse, accents, ponctuation). */
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Vrai si l'URL pointe vers la racine d'un site (page d'accueil). */
export function isHomepageUrl(url: string): boolean {
  try {
    const { pathname, search } = new URL(url);
    return (pathname === "/" || pathname === "") && search === "";
  } catch {
    return false;
  }
}

/** Vrai si le coût par habitant est cohérent avec le montant (tolérance incluse). */
export function isCostCoherent(amountBillions: number, costPerCitizen: number): boolean {
  const expected = expectedCostPerCitizen(amountBillions);
  const tolerance = Math.max(COST_TOLERANCE_ABSOLUTE, expected * COST_TOLERANCE_RELATIVE);
  return Math.abs(costPerCitizen - expected) <= tolerance;
}

function formatIssues(prefix: string, issues: { path: PropertyKey[]; message: string }[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.map(String).join(".") : "(racine)";
    return `${prefix} ${path} : ${issue.message}`;
  });
}

export function checkData({ decksMeta, cardFiles, costExceptions = {} }: DataCheckInput): DataCheckReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const levels: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
  const kinds: Record<CardKindData, number> = { depense: 0, recette: 0, agregat: 0 };
  let withSourceUrl = 0;
  let homepageSourceUrl = 0;
  let withYear = 0;

  // --- decks-meta.json ---
  const metaResult = decksMetaSchema.safeParse(decksMeta);
  const decks = metaResult.success ? metaResult.data.decks : [];
  if (!metaResult.success) {
    errors.push(...formatIssues("decks-meta.json", metaResult.error.issues));
  }
  const deckIds = new Set<string>();
  for (const deck of decks) {
    if (deckIds.has(deck.id)) errors.push(`decks-meta.json : deck "${deck.id}" en double`);
    deckIds.add(deck.id);
  }

  // --- cartes ---
  const cards: CardData[] = [];
  for (const [fileName, content] of Object.entries(cardFiles)) {
    if (!Array.isArray(content)) {
      errors.push(`cards/${fileName}.json : un tableau de cartes est attendu`);
      continue;
    }
    if (!deckIds.has(fileName)) {
      errors.push(`cards/${fileName}.json : aucun deck "${fileName}" dans decks-meta.json`);
    }
    content.forEach((raw, index) => {
      const result = cardSchema.safeParse(raw);
      const rawId =
        raw && typeof raw === "object" && "id" in raw ? String((raw as { id: unknown }).id) : `#${index}`;
      if (!result.success) {
        errors.push(...formatIssues(`cards/${fileName}.json [${rawId}]`, result.error.issues));
        return;
      }
      const card = result.data;
      if (card.deckId !== fileName) {
        errors.push(`Carte ${card.id} : deckId "${card.deckId}" mais rangée dans cards/${fileName}.json`);
      }
      cards.push(card);
    });
  }

  // Fichiers manquants pour un deck déclaré
  for (const id of deckIds) {
    if (!(id in cardFiles)) errors.push(`Deck "${id}" : fichier cards/${id}.json introuvable`);
  }

  // Identifiants uniques
  const seenIds = new Map<string, number>();
  for (const card of cards) seenIds.set(card.id, (seenIds.get(card.id) ?? 0) + 1);
  for (const [id, count] of seenIds) {
    if (count > 1) errors.push(`Carte ${id} : identifiant présent ${count} fois`);
  }

  // Titres en double
  const titles = new Map<string, string[]>();
  for (const card of cards) {
    const key = normalizeTitle(card.title);
    titles.set(key, [...(titles.get(key) ?? []), card.id]);
  }
  for (const [, ids] of titles) {
    if (ids.length > 1) errors.push(`Titre en double : ${ids.join(", ")}`);
  }

  // Doublons probables : deux cartes jouables avec le même montant et la même
  // source décrivent souvent le même argent (que l'on pourrait « couper » deux fois)
  const sameAmountAndSource = new Map<string, string[]>();
  for (const card of cards) {
    if (card.playable === false || card.amountBillions === 0 || !card.sourceUrl) continue;
    const key = `${card.amountBillions}|${card.sourceUrl}`;
    sameAmountAndSource.set(key, [...(sameAmountAndSource.get(key) ?? []), card.id]);
  }
  for (const [key, ids] of sameAmountAndSource) {
    if (ids.length > 1) {
      warnings.push(`Doublon probable (même montant, ${key.split("|")[0]} Md€, et même source) : ${ids.join(", ")}`);
    }
  }

  // Exceptions de coût : doivent viser des cartes existantes
  for (const id of Object.keys(costExceptions)) {
    if (!seenIds.has(id)) errors.push(`data-check-exceptions.json : carte ${id} inconnue`);
  }

  for (const card of cards) {
    levels[card.level] += 1;
    if (card.playable !== false) kinds[card.kind] += 1;
    if (card.year !== undefined) withYear += 1;

    // Nature : le deck des recettes ne contient que des recettes
    if (card.deckId === REVENUE_DECK_ID && card.kind !== "recette") {
      errors.push(`Carte ${card.id} : kind="${card.kind}" dans le deck des recettes (attendu "recette")`);
    }

    // Cohérence coût par habitant / montant
    if (isCostCoherent(card.amountBillions, card.costPerCitizen)) {
      if (costExceptions[card.id]) {
        warnings.push(`Carte ${card.id} : exception de coût inutile (le coût par habitant est cohérent)`);
      }
    } else {
      if (costExceptions[card.id]) {
        warnings.push(`Carte ${card.id} : coût par habitant non dérivé du montant (exception : ${costExceptions[card.id]})`);
      } else {
        const expected = expectedCostPerCitizen(card.amountBillions);
        errors.push(
          `Carte ${card.id} : costPerCitizen=${card.costPerCitizen} incohérent avec ${card.amountBillions} Md€ / 69,1 M hab. (attendu ≈ ${expected.toFixed(1)})`,
        );
      }
    }

    // Sources
    if (card.sourceUrl) {
      withSourceUrl += 1;
      if (isHomepageUrl(card.sourceUrl)) {
        homepageSourceUrl += 1;
        warnings.push(`Carte ${card.id} : sourceUrl pointe vers une page d'accueil (${card.sourceUrl})`);
      }
    } else {
      warnings.push(`Carte ${card.id} : pas de sourceUrl`);
    }
  }

  // Decks : nombre de cartes et répartition par niveau
  for (const deck of decks) {
    // Les cartes hors jeu (playable: false) ne comptent ni dans cardCount ni dans les niveaux.
    const deckCards = cards.filter((card) => card.deckId === deck.id && card.playable !== false);
    if (deckCards.length !== deck.cardCount) {
      errors.push(`Deck "${deck.id}" : cardCount=${deck.cardCount} mais ${deckCards.length} cartes trouvées`);
    }
    for (const level of [1, 2, 3] as const) {
      const count = deckCards.filter((card) => card.level === level).length;
      // Avertissement seulement : le jeu ne filtre pas encore les cartes par niveau,
      // et certains decks n'ont pas assez de petits montants (ex. France-Europe).
      if (count < MIN_CARDS_PER_LEVEL) {
        warnings.push(`Deck "${deck.id}" : ${count} carte(s) de niveau ${level} (minimum ${MIN_CARDS_PER_LEVEL})`);
      }
    }
  }

  return {
    errors,
    warnings,
    stats: {
      decks: decks.length,
      cards: cards.length,
      withSourceUrl,
      homepageSourceUrl,
      withYear,
      levels,
      kinds,
    },
  };
}
