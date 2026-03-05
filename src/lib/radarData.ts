import type { Vote, Card } from "@/types";

/** Category labels for the radar axes */
const RADAR_CATEGORIES: { id: string; label: string }[] = [
  { id: "defense", label: "Défense" },
  { id: "sante", label: "Santé" },
  { id: "education", label: "Éducation" },
  { id: "social", label: "Social" },
  { id: "energie", label: "Énergie" },
  { id: "etat", label: "État" },
  { id: "securite", label: "Sécurité" },
  { id: "culture", label: "Culture" },
];

/** Mock community average "cut" percentages per category */
const COMMUNITY_AVERAGES: Record<string, number> = {
  defense: 45,
  sante: 22,
  education: 28,
  social: 35,
  energie: 52,
  etat: 61,
  securite: 38,
  culture: 48,
};

export interface RadarAxisData {
  label: string;
  playerValue: number;
  communityValue: number;
}

/**
 * Compute radar axes from session votes.
 * For each category that has at least 1 card in the session,
 * compute the player's "cut" percentage (cut + unjustified = cut-like).
 * Returns only categories present in the session (minimum 3 for radar).
 */
export function computeRadarFromSession(
  cards: Card[],
  votes: Vote[]
): RadarAxisData[] {
  const perCategory: Record<string, { total: number; cut: number }> = {};

  for (const vote of votes) {
    const card = cards.find((c) => c.id === vote.cardId);
    if (!card) continue;
    const cat = card.deckId;
    if (!perCategory[cat]) perCategory[cat] = { total: 0, cut: 0 };
    perCategory[cat].total += 1;
    if (vote.direction === "cut" || vote.direction === "unjustified") {
      perCategory[cat].cut += 1;
    }
  }

  const axes: RadarAxisData[] = [];
  for (const { id, label } of RADAR_CATEGORIES) {
    const data = perCategory[id];
    if (!data || data.total === 0) continue;
    axes.push({
      label,
      playerValue: Math.round((data.cut / data.total) * 100),
      communityValue: COMMUNITY_AVERAGES[id] ?? 40,
    });
  }

  return axes;
}

/**
 * Compute radar axes from all stored sessions.
 * Aggregates across all historical sessions.
 */
export function computeRadarFromHistory(
  sessions: { deckId: string; keepCount: number; cutCount: number; totalCards: number }[]
): RadarAxisData[] {
  const perCategory: Record<string, { total: number; cut: number }> = {};

  for (const s of sessions) {
    const cat = s.deckId;
    if (!perCategory[cat]) perCategory[cat] = { total: 0, cut: 0 };
    perCategory[cat].total += s.totalCards;
    perCategory[cat].cut += s.cutCount;
  }

  const axes: RadarAxisData[] = [];
  for (const { id, label } of RADAR_CATEGORIES) {
    const data = perCategory[id];
    if (!data || data.total === 0) continue;
    axes.push({
      label,
      playerValue: Math.round((data.cut / data.total) * 100),
      communityValue: COMMUNITY_AVERAGES[id] ?? 40,
    });
  }

  return axes;
}
