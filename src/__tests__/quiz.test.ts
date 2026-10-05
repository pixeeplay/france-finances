import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import {
  applyQuizAnswer,
  buildQuizOptions,
  EMPTY_QUIZ_STATS,
  getQuizIndexes,
  QUIZ_OPTION_COUNT,
  roundSignificant,
} from "@/lib/quiz";
import { getGlobalStats, recordQuizAnswer } from "@/lib/stats";
import { formatBillions } from "@/lib/format";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AmountQuiz } from "@/components/AmountQuiz";
import type { GlobalStats } from "@/lib/stats";
import decksData from "@/data";
import type { Card } from "@/types";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

function card(id: string, amountBillions: number): Card {
  return {
    id,
    title: `Carte ${id}`,
    subtitle: "",
    description: "",
    amountBillions,
    costPerCitizen: 0,
    deckId: "defense",
    icon: "",
    source: "Cour des comptes",
    level: 1,
    kind: "depense",
  };
}

describe("roundSignificant / labels", () => {
  it("rounds to 2 significant digits", () => {
    expect(roundSignificant(12.345)).toBe(12);
    expect(roundSignificant(0.04567)).toBe(0.046);
    expect(roundSignificant(1260)).toBe(1300);
    expect(roundSignificant(0)).toBe(0);
  });

  it("labels amounts with the same formatter as the cards", () => {
    const label = (b: number) => buildQuizOptions(card("c-01", b)).find((o) => o.correct)?.label;
    expect(label(0.0456)).toBe(formatBillions(0.0456));
    expect(label(0.45)).toBe(formatBillions(0.45));
    expect(label(12.5)).toBe(formatBillions(12.5));
    expect(label(0.0456)?.replace(/\u00a0/g, " ")).toBe("46 M€");
  });
});

describe("getQuizIndexes", () => {
  it("returns no quiz for short sessions", () => {
    expect(getQuizIndexes(Array.from({ length: 5 }, (_, i) => card(`c-0${i}`, 1)))).toEqual([]);
  });

  it("uses the configured positions", () => {
    expect(getQuizIndexes(Array.from({ length: 10 }, (_, i) => card(`c-0${i}`, 1)))).toEqual([1, 5]);
  });

  it("skips cards without a usable amount", () => {
    const cards = Array.from({ length: 10 }, (_, i) => card(`c-0${i}`, i === 1 ? 0 : 1));
    expect(getQuizIndexes(cards)).toEqual([2, 5]);
  });
});

describe("buildQuizOptions", () => {
  it("returns 4 distinct options with exactly one correct, deterministically", () => {
    const c = card("def-01", 13);
    const options = buildQuizOptions(c);
    expect(options).toHaveLength(QUIZ_OPTION_COUNT);
    expect(options.filter((o) => o.correct)).toHaveLength(1);
    expect(new Set(options.map((o) => o.label)).size).toBe(QUIZ_OPTION_COUNT);
    expect(buildQuizOptions(c)).toEqual(options);
    const correctIndex = options.findIndex((o) => o.correct);
    expect(correctIndex).toBeGreaterThanOrEqual(0);
  });

  it("works for every real card with a positive amount", () => {
    for (const c of (decksData.cards as Card[]).filter((x) => x.amountBillions > 0)) {
      const options = buildQuizOptions(c);
      expect(options).toHaveLength(QUIZ_OPTION_COUNT);
      expect(new Set(options.map((o) => o.label)).size).toBe(QUIZ_OPTION_COUNT);
      expect(options.every((o) => o.billions > 0)).toBe(true);
    }
  });
});

describe("quiz stats", () => {
  it("tracks streaks", () => {
    let s = EMPTY_QUIZ_STATS;
    for (const ok of [true, true, false, true, true, true]) s = applyQuizAnswer(s, ok);
    expect(s).toEqual({ answered: 6, correct: 5, currentStreak: 3, bestStreak: 3 });
  });

  it("is persisted in the global stats", () => {
    localStorage.clear();
    recordQuizAnswer(true);
    recordQuizAnswer(false);
    expect(getGlobalStats().quiz).toEqual({ answered: 2, correct: 1, currentStreak: 0, bestStreak: 1 });
  });
});

describe("comprehension badges", () => {
  const base: GlobalStats = {
    xp: 0,
    totalSessions: 0,
    totalCards: 0,
    categoriesPlayed: [],
    sessionsPerDeck: {},
    auditsN3: 0,
    totalKeptBillions: 0,
    totalCutBillions: 0,
  };
  const badge = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;

  it("unlocks on correct answers and streaks", () => {
    const stats = { ...base, quiz: { answered: 8, correct: 5, currentStreak: 2, bestStreak: 4 } };
    expect(badge("quiz_ordre_grandeur").check(stats, [])).toBe(true);
    expect(badge("quiz_serie").check(stats, [])).toBe(false);
    expect(badge("quiz_serie").progress(stats, [])).toBe(80);
    expect(badge("quiz_expert").progress(stats, [])).toBe(20);
    expect(badge("quiz_expert").category).toBe("comprehension");
  });

  it("handles players without quiz data", () => {
    expect(badge("quiz_ordre_grandeur").check(base, [])).toBe(false);
    expect(badge("quiz_ordre_grandeur").progress(base, [])).toBe(0);
  });
});

describe("AmountQuiz", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reveals the answer once and lets the player continue", () => {
    const c = card("def-01", 13);
    const onAnswer = vi.fn();
    const onContinue = vi.fn();
    render(createElement(AmountQuiz, { card: c, onAnswer, onContinue }));

    const heading = screen.getByRole("heading", { name: "À ton avis, combien ?" });
    // Focus moved into the quiz when it appears
    expect(heading).toHaveFocus();
    const wrong = buildQuizOptions(c).find((o) => !o.correct)!;
    fireEvent.click(screen.getByRole("button", { name: wrong.label }));
    expect(onAnswer).toHaveBeenCalledWith(false);
    // Choices stay focusable (aria-disabled), focus goes to the continue button
    expect(screen.getByRole("button", { name: wrong.label })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Voir la carte" })).toHaveFocus();
    expect(screen.getByTestId("amount-quiz")).toHaveTextContent("c'était 13");

    // Second click is ignored
    fireEvent.click(screen.getByRole("button", { name: wrong.label }));
    expect(onAnswer).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Voir la carte" }));
    expect(onContinue).toHaveBeenCalled();
  });
});
