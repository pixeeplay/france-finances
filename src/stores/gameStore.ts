import { create } from "zustand";
import type { Card, Vote, VoteDirection, Session, SessionStats } from "@/types";
import { computeStats, determineArchetype } from "@/lib/archetype";
import { saveCompletedSession } from "@/lib/stats";

interface GameState {
  /** Session en cours */
  session: Session | null;

  // === Actions ===
  /** Démarrer une nouvelle session */
  startSession: (deckId: string, cards: Card[], level?: 1 | 2 | 3) => void;
  /** Enregistrer un vote pour la carte courante */
  recordVote: (cardId: string, direction: VoteDirection) => void;
  /** Passer à la carte suivante */
  nextCard: () => void;
  /** Terminer la session et calculer l'archétype */
  completeSession: () => void;
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

export const useGameStore = create<GameState>((set, get) => ({
  session: null,

  startSession: (deckId, cards, level = 1) => {
    set({
      session: {
        id: crypto.randomUUID(),
        deckId,
        level,
        cards,
        votes: [],
        currentIndex: 0,
        startedAt: Date.now(),
        completed: false,
      },
    });
  },

  recordVote: (cardId, direction) => {
    const { session } = get();
    if (!session || session.completed) return;

    const newVote: Vote = {
      cardId,
      direction,
      duration: 0, // TODO: track per-card duration
      timestamp: Date.now(),
    };

    set({
      session: {
        ...session,
        votes: [...session.votes, newVote],
      },
    });
  },

  nextCard: () => {
    const { session } = get();
    if (!session || session.completed) return;

    const nextIndex = session.currentIndex + 1;
    set({
      session: {
        ...session,
        currentIndex: nextIndex,
      },
    });
  },

  completeSession: () => {
    const { session } = get();
    if (!session) return;

    const endedAt = Date.now();
    const completed: Session = {
      ...session,
      completed: true,
      endedAt,
      totalDuration: endedAt - session.startedAt,
    };

    set({ session: completed });

    // Persist to localStorage
    saveCompletedSession(completed);
  },

  reset: () => set({ session: null }),

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
    const { session } = get();
    if (!session || !session.completed || !session.totalDuration) return null;

    const rawStats = computeStats(session.votes, session.totalDuration);
    const archetype = determineArchetype(rawStats, session.level);

    return { ...rawStats, archetype };
  },
}));
