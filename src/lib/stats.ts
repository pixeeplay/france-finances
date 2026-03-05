import type { Session, Vote, Archetype } from "@/types";
import { computeStats, determineArchetype } from "@/lib/archetype";

// === Storage Keys ===
const SESSIONS_KEY = "trnc:sessions";
const STATS_KEY = "trnc:stats";
const PROFILE_KEY = "trnc:profile";

// === Types ===
export interface StoredSession {
  id: string;
  deckId: string;
  level: 1 | 2 | 3;
  votes: Vote[];
  archetypeId: string;
  archetypeName: string;
  totalDurationMs: number;
  keepCount: number;
  cutCount: number;
  totalCards: number;
  totalKeptBillions: number;
  totalCutBillions: number;
  date: string; // ISO string
}

export interface GlobalStats {
  xp: number;
  totalSessions: number;
  totalCards: number;
  categoriesPlayed: string[];
  auditsN3: number;
  totalKeptBillions: number;
  totalCutBillions: number;
}

export interface PlayerProfile {
  archetypeId: string;
  archetypeName: string;
  archetypeIcon: string;
  level: number;
  username: string;
}

// === Helpers ===
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/** Generate a random anonymous username */
function generateUsername(): string {
  const adjectives = [
    "Brave", "Agile", "Rusé", "Vif", "Calme",
    "Malin", "Discret", "Hardi", "Lucide", "Tenace",
    "Furtif", "Alerte", "Sagace", "Austère", "Rigoureux",
  ];
  const nouns = [
    "Renard", "Faucon", "Lynx", "Loup", "Aigle",
    "Tigre", "Puma", "Ours", "Cerf", "Lion",
    "Bison", "Vautour", "Cobra", "Requin", "Coyote",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

// === Public API ===

export function getSessions(): StoredSession[] {
  return getItem<StoredSession[]>(SESSIONS_KEY, []);
}

export function getGlobalStats(): GlobalStats {
  return getItem<GlobalStats>(STATS_KEY, {
    xp: 0,
    totalSessions: 0,
    totalCards: 0,
    categoriesPlayed: [],
    auditsN3: 0,
    totalKeptBillions: 0,
    totalCutBillions: 0,
  });
}

export function getPlayerProfile(): PlayerProfile {
  const profile = getItem<PlayerProfile>(PROFILE_KEY, {
    archetypeId: "",
    archetypeName: "",
    archetypeIcon: "",
    level: 1,
    username: "",
  });
  // Generate and persist a random username if none exists
  if (!profile.username) {
    profile.username = generateUsername();
    setItem(PROFILE_KEY, profile);
  }
  return profile;
}

/** Compute XP for a single session */
function computeSessionXP(session: StoredSession): number {
  let xp = 0;
  xp += session.totalCards * 10; // +10 per card
  xp += 50; // +50 for completing a session
  if (session.archetypeId === "speedrunner") xp += 100; // bonus
  if (session.level === 3) xp += 100; // Level 3 audit bonus
  return xp;
}

/** Save a completed session and update global stats */
export function saveCompletedSession(session: Session): void {
  if (!session.completed || !session.totalDuration) return;

  const keepVotes = session.votes.filter((v) => v.direction === "keep");
  const cutVotes = session.votes.filter((v) => v.direction === "cut");

  const totalKeptBillions = session.cards
    .filter((c) => keepVotes.some((v) => v.cardId === c.id))
    .reduce((sum, c) => sum + c.amountBillions, 0);
  const totalCutBillions = session.cards
    .filter((c) => cutVotes.some((v) => v.cardId === c.id))
    .reduce((sum, c) => sum + c.amountBillions, 0);

  // Determine archetype
  const rawStats = computeStats(session.votes, session.totalDuration);
  const archetype = determineArchetype(rawStats, session.level);

  const stored: StoredSession = {
    id: session.id,
    deckId: session.deckId,
    level: session.level,
    votes: session.votes,
    archetypeId: archetype.id,
    archetypeName: archetype.name,
    totalDurationMs: session.totalDuration,
    keepCount: keepVotes.length,
    cutCount: cutVotes.length,
    totalCards: session.votes.length,
    totalKeptBillions: Math.round(totalKeptBillions * 10) / 10,
    totalCutBillions: Math.round(totalCutBillions * 10) / 10,
    date: new Date().toISOString(),
  };

  // Save session
  const sessions = getSessions();
  sessions.push(stored);
  setItem(SESSIONS_KEY, sessions);

  // Update global stats
  const stats = getGlobalStats();
  const sessionXP = computeSessionXP(stored);
  stats.xp += sessionXP;
  stats.totalSessions += 1;
  stats.totalCards += stored.totalCards;
  stats.totalKeptBillions =
    Math.round((stats.totalKeptBillions + stored.totalKeptBillions) * 10) / 10;
  stats.totalCutBillions =
    Math.round((stats.totalCutBillions + stored.totalCutBillions) * 10) / 10;
  if (!stats.categoriesPlayed.includes(stored.deckId)) {
    stats.categoriesPlayed.push(stored.deckId);
  }
  if (stored.level === 3) {
    stats.auditsN3 += 1;
  }
  setItem(STATS_KEY, stats);

  // Update profile
  const profile = getPlayerProfile();
  profile.archetypeId = archetype.id;
  profile.archetypeName = archetype.name;
  profile.archetypeIcon = archetype.icon;
  profile.level = Math.floor(stats.xp / 500) + 1;
  setItem(PROFILE_KEY, profile);
}

/** Get decks that have been played */
export function getPlayedDeckIds(): string[] {
  const sessions = getSessions();
  return [...new Set(sessions.map((s) => s.deckId))];
}
