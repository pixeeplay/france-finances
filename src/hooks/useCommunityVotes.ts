"use client";

import { useEffect, useState } from "react";
import type { CardVoteCounts, CommunityCounts } from "@/lib/sessionFeedback";

export interface CommunityVotesState {
  /** Compteurs par carte (vide si indisponible) */
  counts: CommunityCounts;
  /** true si l'API a repondu avec des donnees exploitables */
  available: boolean;
}

const EMPTY: CommunityVotesState = { counts: {}, available: false };

function isCounts(value: unknown): value is CardVoteCounts {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return ["keep", "cut", "reinforce", "unjustified", "total"].every(
    (k) => typeof v[k] === "number" && Number.isFinite(v[k]),
  );
}

/** Garde uniquement les entrees bien formees d'une reponse JSON */
export function sanitizeCommunityResponse(json: unknown): CommunityCounts | null {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return null;
  const obj = json as Record<string, unknown>;
  if (obj.ok === false) return null;
  const result: CommunityCounts = {};
  for (const [cardId, value] of Object.entries(obj)) {
    if (isCounts(value)) result[cardId] = value;
  }
  return result;
}

/**
 * Charge une fois les votes agreges de la communaute pour les cartes de la session.
 * Degrade silencieusement (counts vide) si la base est absente ou l'API en erreur.
 */
export function useCommunityVotes(cardIds: readonly string[]): CommunityVotesState {
  const key = cardIds.join(",");
  const [state, setState] = useState<{ key: string; value: CommunityVotesState }>({
    key: "",
    value: EMPTY,
  });

  useEffect(() => {
    if (!key || typeof fetch !== "function") return;
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    fetch(`/api/community?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: unknown) => {
        if (cancelled) return;
        const counts = sanitizeCommunityResponse(json);
        setState({ key, value: counts ? { counts, available: true } : EMPTY });
      })
      .catch(() => {
        // Pas de DB / hors ligne : on garde l'etat vide
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [key]);

  return state.key === key ? state.value : EMPTY;
}
