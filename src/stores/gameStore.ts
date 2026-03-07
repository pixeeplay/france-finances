import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Card, Vote, VoteDirection, Session, SessionStats, AuditResponse, GameMode } from "@/types";
import { computeStats, determineArchetype } from "@/lib/archetype";
import { saveCompletedSession } from "@/lib/stats";
import { track } from "@/lib/analytics";

interface GameState {
  /** Session en cours */
  session: Session | null;
  /** Timestamp when the current card was shown */
  cardShownAt: number;
  /** Cached stats (computed once at session completion) */
  _cachedStats: SessionStats | null;

  // === Actions ===
  /** Démarrer une nouvelle session */
  startSession: (deckId: string, cards: Card[], level?: 1 | 2 | 3, gameMode?: GameMode, budgetTarget?: number) => void;
  /** Vote + advance atomique. Retourne true si la session est terminée */
  voteAndAdvance: (cardId: string, direction: VoteDirection) => boolean;
  /** Terminer la session et calculer l'archétype */
  completeSession: () => void;
  /** Record an audit response (Level 3) */
  recordAudit: (response: AuditResponse) => void;
  /** Reset complet */
  reset: () => void;

  // === Computed ===
  /** Carte courante */
  currentCard: () => Card | null;
  /** Carte suivante (pour l'affichage en dessous) */
  nextCardInPile: () => Card | null;
  /** Progression (0 à 1) */
  progress: () => number;
  /** Stats de la session */
  sessionStats: () => SessionStats | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  session: null,
  cardShownAt: 0,
  _cachedStats: null,

  startSession: (deckId, cards, level = 1, gameMode = "classic", budgetTarget) => {
    set({
      session: {
        id: crypto.randomUUID(),
        deckId,
        level,
        gameMode,
        budgetTarget,
        cards,
        votes: [],
        currentIndex: 0,
        startedAt: Date.now(),
        completed: false,
      },
      cardShownAt: Date.now(),
      _cachedStats: null,
    });
  },

  voteAndAdvance: (cardId, direction) => {
    const { session, cardShownAt } = get();
    if (!session || session.completed) return false;
    if (session.votes.some((v) => v.cardId === cardId)) return false;

    const now = Date.now();
    const duration = cardShownAt > 0 ? now - cardShownAt : 0;
    const newVote: Vote = { cardId, direction, duration, timestamp: now };
    const newVotes = [...session.votes, newVote];
    const isLast = session.currentIndex >= session.cards.length - 1;

    if (isLast) {
      set({
        session: { ...session, votes: newVotes },
        cardShownAt: now,
      });
    } else {
      set({
        session: { ...session, votes: newVotes, currentIndex: session.currentIndex + 1 },
        cardShownAt: now,
      });
    }
    return isLast;
  },

  completeSession: () => {
    const { session } = get();
    if (!session || session.completed) return;

    const endedAt = Date.now();
    const completed: Session = {
      ...session,
      completed: true,
      endedAt,
      totalDuration: endedAt - session.startedAt,
    };

    // Compute stats once and cache
    const rawStats = computeStats(completed.votes, completed.totalDuration ?? 0);
    const archetype = determineArchetype(rawStats, completed.level);
    const cachedStats: SessionStats = { ...rawStats, archetype };

    set({ session: completed, _cachedStats: cachedStats });

    // Persist to localStorage
    saveCompletedSession(completed);

    // Track analytics
    track("session_complete", {
      deckId: completed.deckId,
      archetype: archetype.id,
      keepPercent: Math.round(rawStats.keepPercent),
      cutPercent: Math.round(rawStats.cutPercent),
      totalDurationMs: completed.totalDuration,
    });
  },

  recordAudit: (response) => {
    const { session } = get();
    if (!session) return;
    const existing = session.auditResponses ?? [];
    set({
      session: {
        ...session,
        auditResponses: [...existing, response],
      },
    });
  },

  reset: () => set({ session: null, _cachedStats: null }),

  // === Computed (fonctions, pas des valeurs réactives) ===

  currentCard: () => {
    const { session } = get();
    if (!session) return null;
    return session.cards[session.currentIndex] ?? null;
  },

  nextCardInPile: () => {
    const { session } = get();
    if (!session) return null;
    return session.cards[session.currentIndex + 1] ?? null;
  },

  progress: () => {
    const { session } = get();
    if (!session || session.cards.length === 0) return 0;
    return session.currentIndex / session.cards.length;
  },

  sessionStats: () => {
    const { _cachedStats, session } = get();
    if (_cachedStats) return _cachedStats;
    if (!session || !session.completed || !session.totalDuration) return null;

    // Fallback: compute if cache was lost (shouldn't happen in normal flow)
    const rawStats = computeStats(session.votes, session.totalDuration);
    const archetype = determineArchetype(rawStats, session.level);
    return { ...rawStats, archetype };
  },
}),
    {
      name: "trnc:game-session",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        session: state.session,
        _cachedStats: state._cachedStats,
      }),
      merge: (persisted, current) => {
        const state = persisted as Partial<GameState> | undefined;
        // Validate rehydrated session shape — reset to initial if corrupted
        if (state?.session != null) {
          const s = state.session;
          const isValid =
            typeof s.deckId === "string" &&
            Array.isArray(s.cards) &&
            Array.isArray(s.votes) &&
            typeof s.currentIndex === "number" &&
            Number.isFinite(s.currentIndex);
          if (!isValid) {
            return { ...current, session: null, _cachedStats: null };
          }
        }
        return { ...current, ...state };
      },
      migrate: (persisted: unknown, version: number) => {
        // Version 0 -> 1: initial schema, no migration needed
        // Future migrations can be chained here:
        // if (version < 2) { ... }
        if (version < 1) {
          return persisted as GameState;
        }
        return persisted as GameState;
      },
    },
  ),
);
