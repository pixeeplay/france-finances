"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getLevelCounts } from "@/lib/stats";
import { computeUnlockedLevel, type GameLevel, type LevelCounts } from "@/lib/progression";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Snapshot serialise : valeur primitive stable entre deux lectures identiques
const getSnapshot = () => JSON.stringify(getLevelCounts());
const getServerSnapshot = () => null;

/**
 * Compteurs de sessions par niveau et niveau debloque, lus dans le localStorage.
 * null pendant le rendu serveur et l'hydratation.
 */
export function useProgression(): { counts: LevelCounts; unlockedLevel: GameLevel } | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (snapshot === null) return null;
    const counts = JSON.parse(snapshot) as LevelCounts;
    return { counts, unlockedLevel: computeUnlockedLevel(counts) };
  }, [snapshot]);
}
