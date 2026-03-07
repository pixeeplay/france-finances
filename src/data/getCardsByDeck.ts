import type { Card } from "@/types";

/**
 * Lazy-load cards for a single deck using dynamic import().
 * This avoids bundling all 370 cards when only one deck is needed.
 *
 * Usage:
 *   const cards = await getDeckCards("defense");
 */

 
const deckImportMap: Record<string, () => Promise<{ default: any[] }>> = {
  defense: () => import("./cards/defense.json"),
  energie: () => import("./cards/energie.json"),
  sante: () => import("./cards/sante.json"),
  social: () => import("./cards/social.json"),
  education: () => import("./cards/education.json"),
  securite: () => import("./cards/securite.json"),
  etat: () => import("./cards/etat.json"),
  culture: () => import("./cards/culture.json"),
  agriculture: () => import("./cards/agriculture.json"),
  logement: () => import("./cards/logement.json"),
  immigration: () => import("./cards/immigration.json"),
  numerique: () => import("./cards/numerique.json"),
  recettes: () => import("./cards/recettes.json"),
  emploi: () => import("./cards/emploi.json"),
  environnement: () => import("./cards/environnement.json"),
  collectivites: () => import("./cards/collectivites.json"),
  "france-europe": () => import("./cards/france-europe.json"),
  zombies: () => import("./cards/zombies.json"),
  ukraine: () => import("./cards/ukraine.json"),
};

/**
 * Dynamically load cards for a specific deck.
 * Returns an empty array if the deckId is unknown.
 */
export async function getDeckCards(deckId: string): Promise<Card[]> {
  const loader = deckImportMap[deckId];
  if (!loader) {
    console.warn(`[getDeckCards] Unknown deckId: "${deckId}"`);
    return [];
  }
  const mod = await loader();
  return mod.default as Card[];
}

/** Get all valid deck IDs that can be lazy-loaded */
export const DECK_IDS = Object.keys(deckImportMap);
