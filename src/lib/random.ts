/**
 * Generateurs pseudo-aleatoires deterministes (seedes).
 *
 * Utilises pour les tirages qui doivent etre identiques pour tous les joueurs
 * (deck du jour) ou reproductibles en test. Ne pas utiliser pour de la crypto.
 */

/** Fonction aleatoire retournant un flottant dans [0, 1). */
export type Rng = () => number;

/** Hash 32 bits (FNV-1a) d'une chaine. Stable entre navigateurs et Node. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** PRNG mulberry32 : rapide, 32 bits d'etat, distribution suffisante pour un jeu. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cree un PRNG a partir d'une graine textuelle (ex. "daily:2026-10-02"). */
export function createSeededRng(seed: string): Rng {
  return mulberry32(hashString(seed));
}

/** Melange de Fisher-Yates avec un PRNG fourni (ne modifie pas l'entree). */
export function seededShuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
