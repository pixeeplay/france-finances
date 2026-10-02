"use client";

import { usePublicStats } from "@/hooks/usePublicStats";

/** Compteur public (sessions / cartes). Masqué tant qu'il n'y a pas de données. */
export function PublicStatsLine() {
  const { totalSessions, totalSwipes } = usePublicStats();
  if (totalSessions <= 0 && totalSwipes <= 0) return null;

  return (
    <p className="kicker text-muted-foreground tabular-nums">
      {totalSessions.toLocaleString("fr-FR")} parties · {totalSwipes.toLocaleString("fr-FR")} cartes jouées
    </p>
  );
}
