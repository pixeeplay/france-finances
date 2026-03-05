import type { GlobalStats, StoredSession } from "@/lib/stats";
import { track } from "@/lib/analytics";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** Optional: "general" (default) or "category" for per-deck badges */
  category?: "general" | "category";
  check: (stats: GlobalStats, sessions: StoredSession[]) => boolean;
  progress: (stats: GlobalStats, sessions: StoredSession[]) => number;
}

const BADGE_THRESHOLD = 3;

function deckSessions(stats: GlobalStats, deckId: string): number {
  return stats.sessionsPerDeck?.[deckId] ?? 0;
}

/** Category badges — one per main deck, unlocked after BADGE_THRESHOLD sessions */
const CATEGORY_BADGES: Achievement[] = [
  { id: "badge_defense", icon: "\u2694\uFE0F", title: "Expert Defense", description: `Jouer ${BADGE_THRESHOLD} sessions Defense.`, category: "category", check: (s) => deckSessions(s, "defense") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "defense") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_energie", icon: "\u26A1", title: "Expert Energie", description: `Jouer ${BADGE_THRESHOLD} sessions Energie.`, category: "category", check: (s) => deckSessions(s, "energie") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "energie") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_sante", icon: "\uD83C\uDFE5", title: "Expert Sante", description: `Jouer ${BADGE_THRESHOLD} sessions Sante.`, category: "category", check: (s) => deckSessions(s, "sante") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "sante") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_social", icon: "\uD83E\uDD1D", title: "Expert Social", description: `Jouer ${BADGE_THRESHOLD} sessions Social.`, category: "category", check: (s) => deckSessions(s, "social") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "social") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_education", icon: "\uD83D\uDCDA", title: "Expert Education", description: `Jouer ${BADGE_THRESHOLD} sessions Education.`, category: "category", check: (s) => deckSessions(s, "education") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "education") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_securite", icon: "\u2696\uFE0F", title: "Expert Securite", description: `Jouer ${BADGE_THRESHOLD} sessions Securite.`, category: "category", check: (s) => deckSessions(s, "securite") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "securite") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_etat", icon: "\uD83C\uDFDB\uFE0F", title: "Expert Etat", description: `Jouer ${BADGE_THRESHOLD} sessions Fonctionnement de l'Etat.`, category: "category", check: (s) => deckSessions(s, "etat") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "etat") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_culture", icon: "\uD83C\uDFAD", title: "Expert Culture", description: `Jouer ${BADGE_THRESHOLD} sessions Culture.`, category: "category", check: (s) => deckSessions(s, "culture") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "culture") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_agriculture", icon: "\uD83C\uDF3E", title: "Expert Agriculture", description: `Jouer ${BADGE_THRESHOLD} sessions Agriculture.`, category: "category", check: (s) => deckSessions(s, "agriculture") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "agriculture") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_logement", icon: "\uD83C\uDFE0", title: "Expert Logement", description: `Jouer ${BADGE_THRESHOLD} sessions Logement.`, category: "category", check: (s) => deckSessions(s, "logement") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "logement") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_immigration", icon: "\uD83D\uDEC2", title: "Expert Immigration", description: `Jouer ${BADGE_THRESHOLD} sessions Immigration.`, category: "category", check: (s) => deckSessions(s, "immigration") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "immigration") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_numerique", icon: "\uD83D\uDE80", title: "Expert Numerique", description: `Jouer ${BADGE_THRESHOLD} sessions Numerique.`, category: "category", check: (s) => deckSessions(s, "numerique") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "numerique") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_recettes", icon: "\uD83D\uDCB0", title: "Expert Recettes", description: `Jouer ${BADGE_THRESHOLD} sessions Recettes.`, category: "category", check: (s) => deckSessions(s, "recettes") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "recettes") / BADGE_THRESHOLD) * 100)) },
  { id: "badge_emploi", icon: "\uD83C\uDFE2", title: "Expert Emploi", description: `Jouer ${BADGE_THRESHOLD} sessions Emploi.`, category: "category", check: (s) => deckSessions(s, "emploi") >= BADGE_THRESHOLD, progress: (s) => Math.min(100, Math.round((deckSessions(s, "emploi") / BADGE_THRESHOLD) * 100)) },
];

/** General (non-category) achievements */
const GENERAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_cut",
    icon: "chainsaw",
    title: "Premiere coupe",
    description: "Completer une session avec au moins 1 coupe.",
    check: (s) => s.totalSessions > 0 && s.totalCutBillions > 0,
    progress: (s) => (s.totalCutBillions > 0 ? 100 : 0),
  },
  {
    id: "fifty_fifty",
    icon: "⚖️",
    title: "50/50",
    description: "Terminer une session avec exactement 50% keep / 50% cut.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalCards > 0 && s.keepCount === s.cutCount),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const closest = sessions.reduce((best, s) => {
        if (s.totalCards === 0) return best;
        const ratio = Math.abs(s.keepCount / s.totalCards - 0.5);
        return ratio < best ? ratio : best;
      }, 1);
      return Math.round((1 - closest * 2) * 100);
    },
  },
  {
    id: "auditor",
    icon: "📋",
    title: "Auditeur",
    description: "Jouer 3 categories differentes.",
    check: (s) => s.categoriesPlayed.length >= 3,
    progress: (s) => Math.min(100, Math.round((s.categoriesPlayed.length / 3) * 100)),
  },
  {
    id: "globe_trotter",
    icon: "🗺️",
    title: "Globe-trotter",
    description: "Explorer toutes les categories (14 decks).",
    check: (s) => s.categoriesPlayed.length >= 14,
    progress: (s) => Math.round((s.categoriesPlayed.length / 14) * 100),
  },
  {
    id: "liquidator",
    icon: "💀",
    title: "Liquidateur",
    description: "Terminer une session avec 100% de coupes.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalCards > 0 && s.cutCount === s.totalCards),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const best = sessions.reduce(
        (max, s) =>
          s.totalCards > 0 ? Math.max(max, s.cutCount / s.totalCards) : max,
        0
      );
      return Math.round(best * 100);
    },
  },
  {
    id: "guardian",
    icon: "🛡",
    title: "Gardien supreme",
    description: "Terminer une session avec 100% de garder.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalCards > 0 && s.keepCount === s.totalCards),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const best = sessions.reduce(
        (max, s) =>
          s.totalCards > 0 ? Math.max(max, s.keepCount / s.totalCards) : max,
        0
      );
      return Math.round(best * 100);
    },
  },
  {
    id: "faithful",
    icon: "🏅",
    title: "Fidele",
    description: "Completer 10 sessions.",
    check: (s) => s.totalSessions >= 10,
    progress: (s) => Math.min(100, Math.round((s.totalSessions / 10) * 100)),
  },
  {
    id: "centurion",
    icon: "💯",
    title: "Centurion",
    description: "Swiper 100 cartes au total.",
    check: (s) => s.totalCards >= 100,
    progress: (s) => Math.min(100, Math.round((s.totalCards / 100) * 100)),
  },
  {
    id: "speedrunner",
    icon: "⚡",
    title: "Speedrunner",
    description: "Terminer une session en moins de 60 secondes.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalDurationMs > 0 && s.totalDurationMs < 60000),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const fastest = sessions.reduce(
        (min, s) => (s.totalDurationMs > 0 ? Math.min(min, s.totalDurationMs) : min),
        Infinity
      );
      return fastest === Infinity ? 0 : Math.min(100, Math.round((60000 / fastest) * 50));
    },
  },
  {
    id: "expert_n3",
    icon: "🔬",
    title: "Expert",
    description: "Completer 5 sessions en Niveau 3 (micro-audit).",
    check: (s) => s.auditsN3 >= 5,
    progress: (s) => Math.min(100, Math.round((s.auditsN3 / 5) * 100)),
  },
  {
    id: "millionnaire",
    icon: "💎",
    title: "Millionnaire",
    description: "Cumuler 100 Md\u20AC de coupes au total.",
    check: (s) => s.totalCutBillions >= 100,
    progress: (s) => Math.min(100, Math.round((s.totalCutBillions / 100) * 100)),
  },
  {
    id: "collectionneur",
    icon: "🏆",
    title: "Collectionneur",
    description: "Debloquer 10 badges ou achievements.",
    check: (s, sessions) => {
      const completed = GENERAL_ACHIEVEMENTS.filter((a) => a.id !== "collectionneur" && a.check(s, sessions));
      const badges = CATEGORY_BADGES.filter((a) => a.check(s, sessions));
      return completed.length + badges.length >= 10;
    },
    progress: (s, sessions) => {
      const completed = GENERAL_ACHIEVEMENTS.filter((a) => a.id !== "collectionneur" && a.check(s, sessions));
      const badges = CATEGORY_BADGES.filter((a) => a.check(s, sessions));
      return Math.min(100, Math.round(((completed.length + badges.length) / 10) * 100));
    },
  },
];

/** All achievements combined */
export const ACHIEVEMENTS: Achievement[] = [...GENERAL_ACHIEVEMENTS, ...CATEGORY_BADGES];

const UNLOCKED_KEY = "trnc:achievements";

function getUnlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUnlocked(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
  } catch {
    // storage full
  }
}

/**
 * Check achievements and track newly unlocked ones.
 * Returns the list of completed achievement IDs.
 */
export function checkAchievements(
  stats: GlobalStats,
  sessions: StoredSession[]
): string[] {
  const previouslyUnlocked = getUnlocked();
  const nowCompleted = ACHIEVEMENTS
    .filter((a) => a.check(stats, sessions))
    .map((a) => a.id);

  // Track newly unlocked
  const newlyUnlocked = nowCompleted.filter(
    (id) => !previouslyUnlocked.includes(id)
  );
  for (const achievementId of newlyUnlocked) {
    track("achievement_unlocked", { achievementId });
  }

  if (newlyUnlocked.length > 0) {
    saveUnlocked(nowCompleted);
  }

  return nowCompleted;
}
