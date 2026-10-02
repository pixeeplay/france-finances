"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false pendant le rendu serveur et l'hydratation, true ensuite.
 * Permet d'afficher des donnees issues du localStorage sans erreur d'hydratation.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
