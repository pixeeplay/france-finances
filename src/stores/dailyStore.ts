import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  applyDailyResult,
  INITIAL_DAILY_PROGRESS,
  type DailyProgress,
  type DailyResult,
} from "@/lib/daily";

interface DailyState extends DailyProgress {
  /** Enregistre le resultat du jour (idempotent : seule la premiere partie compte) */
  recordResult: (result: DailyResult) => void;
  /** Reinitialise la progression (tests / suppression des donnees) */
  resetDaily: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      ...INITIAL_DAILY_PROGRESS,

      recordResult: (result) => {
        const { lastPlayedDate, currentStreak, bestStreak, results } = get();
        const next = applyDailyResult({ lastPlayedDate, currentStreak, bestStreak, results }, result);
        if (next.results !== results) set(next);
      },

      resetDaily: () => set({ ...INITIAL_DAILY_PROGRESS }),
    }),
    {
      name: "trnc:daily",
      version: 1,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : noopStorage)),
      partialize: (state) => ({
        lastPlayedDate: state.lastPlayedDate,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        results: state.results,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DailyProgress> | undefined;
        if (
          !p ||
          typeof p.currentStreak !== "number" ||
          typeof p.bestStreak !== "number" ||
          typeof p.results !== "object" ||
          p.results === null
        ) {
          return current;
        }
        return {
          ...current,
          lastPlayedDate: typeof p.lastPlayedDate === "string" ? p.lastPlayedDate : null,
          currentStreak: p.currentStreak,
          bestStreak: p.bestStreak,
          results: p.results,
        };
      },
    },
  ),
);
