"use client";

import { usePublicStats } from "@/hooks/usePublicStats";

/** Compteur public (sessions / cartes). Masqué tant qu'il n'y a pas de données. */
export function PublicStatsLine() {
  const { totalSessions, totalSwipes } = usePublicStats();
  if (totalSessions <= 0 && totalSwipes <= 0) return null;

  return (
    <p className="text-sm text-muted-foreground tabular-nums">
      <span className="font-semibold text-foreground">{totalSessions.toLocaleString("fr-FR")}</span> parties jouées
      {" · "}
      <span className="font-semibold text-foreground">{totalSwipes.toLocaleString("fr-FR")}</span> cartes swipées
    </p>
  );
}
