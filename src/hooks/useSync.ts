"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  getSessions,
  getGlobalStats,
  getPlayerProfile,
  type StoredSession,
  type GlobalStats,
  type PlayerProfile,
} from "@/lib/stats";

const SYNC_KEY = "trnc:lastSync";

/**
 * useSync — merges localStorage data with server DB when user is authenticated.
 *
 * On login (session status changes to "authenticated"):
 * 1. Fetches user's sessions from DB
 * 2. Merges any DB sessions missing from localStorage
 * 3. Recomputes global stats from merged session list
 * 4. Syncs profile (username/avatar) to DB
 *
 * This runs once per login, not on every render.
 */
export function useSync() {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || hasSynced.current) return;
    hasSynced.current = true;

    // Check if we've synced recently (within 5 minutes)
    const lastSync = localStorage.getItem(SYNC_KEY);
    if (lastSync && Date.now() - parseInt(lastSync, 10) < 5 * 60 * 1000) return;

    syncData();
  }, [status, session?.user?.id]);
}

async function syncData() {
  try {
    // 1. Fetch sessions from DB
    const sessionsController = new AbortController();
    const sessionsTimeout = setTimeout(() => sessionsController.abort(), 10_000);
    const res = await fetch("/api/me/sessions", { signal: sessionsController.signal });
    clearTimeout(sessionsTimeout);
    if (!res.ok) return;
    const { sessions: dbSessions } = await res.json() as {
      sessions: {
        id: string;
        deckId: string;
        level: 1 | 2 | 3;
        archetypeId: string;
        archetypeName: string;
        totalDurationMs: number;
        keepCount: number;
        cutCount: number;
        totalCards: number;
        totalKeptBillions: number;
        totalCutBillions: number;
        date: string;
        votes: { cardId: string; direction: string; duration: number }[];
      }[];
    };

    // 2. Get local sessions
    const localSessions = getSessions();
    const localIds = new Set(localSessions.map((s) => s.id));

    // 3. Find DB sessions not in localStorage
    const newSessions: StoredSession[] = [];
    for (const dbs of dbSessions) {
      if (localIds.has(dbs.id)) continue;
      newSessions.push({
        id: dbs.id,
        deckId: dbs.deckId,
        level: dbs.level,
        archetypeId: dbs.archetypeId,
        archetypeName: dbs.archetypeName,
        totalDurationMs: dbs.totalDurationMs,
        keepCount: dbs.keepCount,
        cutCount: dbs.cutCount,
        totalCards: dbs.totalCards,
        totalKeptBillions: dbs.totalKeptBillions,
        totalCutBillions: dbs.totalCutBillions,
        votes: dbs.votes.map((v) => ({
          cardId: v.cardId,
          direction: v.direction as "keep" | "cut" | "reinforce" | "unjustified",
          duration: v.duration,
          timestamp: 0,
        })),
        date: dbs.date,
      });
    }

    if (newSessions.length > 0) {
      // Merge into localStorage
      const merged = [...localSessions, ...newSessions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      localStorage.setItem("trnc:sessions", JSON.stringify(merged));

      // Recompute global stats from merged sessions
      recomputeStats(merged);
    }

    // 4. Sync profile to DB (username + avatar)
    const profile = getPlayerProfile();
    if (profile.username) {
      const profileController = new AbortController();
      const profileTimeout = setTimeout(() => profileController.abort(), 10_000);
      fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profile.username,
          image: profile.customAvatar,
        }),
        signal: profileController.signal,
      }).catch(() => {}).finally(() => clearTimeout(profileTimeout));
    }

    localStorage.setItem(SYNC_KEY, String(Date.now()));
  } catch {
    // Sync failure is non-blocking
  }
}

/** Recompute global stats from the full session list */
function recomputeStats(sessions: StoredSession[]) {
  const stats: GlobalStats = {
    xp: 0,
    totalSessions: sessions.length,
    totalCards: 0,
    categoriesPlayed: [],
    sessionsPerDeck: {},
    auditsN3: 0,
    totalKeptBillions: 0,
    totalCutBillions: 0,
  };

  for (const s of sessions) {
    // XP formula matches lib/stats.ts computeSessionXP
    let xp = s.totalCards * 10 + 50;
    if (s.archetypeId === "speedrunner") xp += 100;
    if (s.level === 3) xp += 100;
    if (s.budgetTargetReached) xp += 150;
    stats.xp += xp;

    stats.totalCards += s.totalCards;
    stats.totalKeptBillions = Math.round((stats.totalKeptBillions + s.totalKeptBillions) * 10) / 10;
    stats.totalCutBillions = Math.round((stats.totalCutBillions + s.totalCutBillions) * 10) / 10;

    if (!stats.categoriesPlayed.includes(s.deckId)) {
      stats.categoriesPlayed.push(s.deckId);
    }
    stats.sessionsPerDeck[s.deckId] = (stats.sessionsPerDeck[s.deckId] || 0) + 1;

    if (s.level === 3) stats.auditsN3 += 1;
  }

  localStorage.setItem("trnc:stats", JSON.stringify(stats));

  // Update profile level
  const rawProfile = localStorage.getItem("trnc:profile");
  if (rawProfile) {
    try {
      const profile = JSON.parse(rawProfile) as PlayerProfile;
      profile.level = Math.floor(stats.xp / 500) + 1;
      if (sessions.length > 0) {
        const last = sessions[sessions.length - 1];
        profile.archetypeId = last.archetypeId;
        profile.archetypeName = last.archetypeName;
      }
      localStorage.setItem("trnc:profile", JSON.stringify(profile));
    } catch (error) {
      console.error("[useSync] Failed to recompute profile:", error instanceof Error ? error.message : error);
    }
  }
}
