"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import { computeSessionResult } from "@/lib/archetype";
import type { Archetype, SessionStats } from "@/types";

/**
 * Retourne l'archétype et les stats basés sur les votes de la session.
 * Ne produit un résultat que quand la session est terminée.
 */
export function useArchetype(): {
  archetype: Archetype | null;
  stats: Omit<SessionStats, "archetype"> | null;
} {
  const session = useGameStore((s) => s.session);

  return useMemo(() => {
    if (!session || !session.completed || !session.totalDuration) {
      return { archetype: null, stats: null };
    }

    const { stats, archetype } = computeSessionResult(session);

    return { archetype, stats };
  }, [session]);
}
