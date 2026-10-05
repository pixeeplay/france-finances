import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import {
  computeUnlockedLevel,
  countSessionsByLevel,
  EMPTY_LEVEL_COUNTS,
  getLevelProgress,
  isLevelUnlocked,
  mergeLevelCounts,
  newlyUnlockedLevel,
  resolvePlayableLevel,
  sessionsAtOrAbove,
} from "@/lib/progression";
import { getLevelCounts, saveCompletedSession } from "@/lib/stats";
import { LevelLockedNotice, NextLevelCTA } from "@/components/LevelProgress";
import type { Session } from "@/types";

const getUnlockedLevel = () => computeUnlockedLevel(getLevelCounts());

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

describe("progression (pure)", () => {
  it("counts sessions per level and ignores invalid levels", () => {
    expect(countSessionsByLevel([{ level: 1 }, { level: 1 }, { level: 2 }, { level: 7 }])).toEqual({ 1: 2, 2: 1, 3: 0 });
  });

  it("merges the cumulative counter with the purged history", () => {
    expect(mergeLevelCounts({ "1": 5, "2": 1 }, { 1: 2, 2: 3, 3: 0 })).toEqual({ 1: 5, 2: 3, 3: 0 });
    expect(mergeLevelCounts(undefined, { 1: 1, 2: 0, 3: 0 })).toEqual({ 1: 1, 2: 0, 3: 0 });
    expect(mergeLevelCounts({ "1": -3, "2": Number.NaN }, EMPTY_LEVEL_COUNTS)).toEqual(EMPTY_LEVEL_COUNTS);
  });

  it("counts higher-level sessions toward lower requirements", () => {
    expect(sessionsAtOrAbove({ 1: 1, 2: 2, 3: 1 }, 1)).toBe(4);
    expect(sessionsAtOrAbove({ 1: 1, 2: 2, 3: 1 }, 2)).toBe(3);
  });

  it("unlocks L2 after 2 N1 sessions and L3 after 2 N2 sessions", () => {
    expect(computeUnlockedLevel(EMPTY_LEVEL_COUNTS)).toBe(1);
    expect(computeUnlockedLevel({ 1: 1, 2: 0, 3: 0 })).toBe(1);
    expect(computeUnlockedLevel({ 1: 2, 2: 0, 3: 0 })).toBe(2);
    expect(computeUnlockedLevel({ 1: 2, 2: 1, 3: 0 })).toBe(2);
    expect(computeUnlockedLevel({ 1: 2, 2: 2, 3: 0 })).toBe(3);
    // Legacy players who reached N2 through the URL
    expect(computeUnlockedLevel({ 1: 0, 2: 2, 3: 0 })).toBe(3);
    expect(isLevelUnlocked(EMPTY_LEVEL_COUNTS, 1)).toBe(true);
  });

  it("describes progress toward a level", () => {
    expect(getLevelProgress({ 1: 1, 2: 0, 3: 0 }, 2)).toEqual({
      level: 2,
      unlocked: false,
      done: 1,
      required: 2,
      remaining: 1,
      label: "2 sessions N1",
    });
    expect(getLevelProgress({ 1: 9, 2: 0, 3: 0 }, 2).done).toBe(2);
  });

  it("resolves the playable level", () => {
    expect(resolvePlayableLevel(3, 1)).toBe(1);
    expect(resolvePlayableLevel(2, 3)).toBe(2);
  });

  it("detects a level unlocked by the last session", () => {
    expect(newlyUnlockedLevel({ 1: 1, 2: 0, 3: 0 }, { 1: 2, 2: 0, 3: 0 })).toBe(2);
    expect(newlyUnlockedLevel({ 1: 2, 2: 0, 3: 0 }, { 1: 3, 2: 0, 3: 0 })).toBeNull();
  });
});

function completedSession(level: 1 | 2 | 3, id: string): Session {
  return {
    id,
    deckId: "defense",
    level,
    gameMode: "classic",
    cards: [
      {
        id: "def-01",
        title: "t",
        subtitle: "",
        description: "",
        amountBillions: 1,
        costPerCitizen: 0,
        deckId: "defense",
        icon: "",
        source: "s",
        level: 1,
        kind: "depense",
      },
    ],
    votes: [{ cardId: "def-01", direction: "cut", duration: 1, timestamp: 1 }],
    currentIndex: 0,
    startedAt: 0,
    completed: true,
    totalDuration: 1000,
  };
}

describe("progression (local storage)", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response("{}"))) as unknown as typeof fetch;
  });

  it("records sessions per level and unlocks levels", () => {
    expect(getUnlockedLevel()).toBe(1);
    saveCompletedSession(completedSession(1, "a"));
    expect(getLevelCounts()[1]).toBe(1);
    saveCompletedSession(completedSession(1, "b"));
    expect(getUnlockedLevel()).toBe(2);
    saveCompletedSession(completedSession(2, "c"));
    saveCompletedSession(completedSession(2, "d"));
    expect(getUnlockedLevel()).toBe(3);
  });

  it("keeps levels unlocked after the history is purged", () => {
    saveCompletedSession(completedSession(1, "a"));
    saveCompletedSession(completedSession(1, "b"));
    localStorage.setItem("trnc:sessions", "[]");
    expect(getUnlockedLevel()).toBe(2);
  });
});

describe("level components", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("LevelLockedNotice explains how to unlock and offers the playable level", () => {
    render(
      createElement(LevelLockedNotice, {
        requestedLevel: 3,
        unlockedLevel: 2,
        counts: { 1: 2, 2: 1, 3: 0 },
        deckId: "defense",
      }),
    );
    expect(screen.getByRole("heading", { name: "Niveau 3 verrouillé" })).toBeInTheDocument();
    expect(screen.getByTestId("level-locked")).toHaveTextContent("1/2");
    expect(screen.getByRole("link", { name: "Jouer ce deck en niveau 2" })).toHaveAttribute(
      "href",
      "/jeu/defense?level=2",
    );
  });

  it("LevelLockedNotice points to level 2 first when level 3 is requested from level 1", () => {
    render(
      createElement(LevelLockedNotice, {
        requestedLevel: 3,
        unlockedLevel: 1,
        counts: { 1: 1, 2: 0, 3: 0 },
        deckId: "defense",
      }),
    );
    const notice = screen.getByTestId("level-locked");
    expect(screen.getByRole("heading", { name: "Niveau 3 verrouillé" })).toBeInTheDocument();
    expect(notice).toHaveTextContent("Débloquez d'abord le niveau 2");
    expect(notice).toHaveTextContent("2 sessions N1 terminées (1/2)");
    expect(notice).toHaveTextContent("encore 1 session N1");
    expect(notice).not.toHaveTextContent("N2");
  });

  it("NextLevelCTA shows remaining sessions while locked", () => {
    localStorage.setItem("trnc:stats", JSON.stringify({ sessionsPerLevel: { "1": 1 } }));
    render(createElement(NextLevelCTA, { level: 1 }));
    expect(screen.getByTestId("next-level-progress")).toHaveTextContent("encore 1 session N1");
  });

  it("NextLevelCTA announces a freshly unlocked level", () => {
    localStorage.setItem("trnc:stats", JSON.stringify({ sessionsPerLevel: { "1": 2 } }));
    render(createElement(NextLevelCTA, { level: 1 }));
    expect(screen.getByRole("status")).toHaveTextContent("Niveau 2 débloqué");
    expect(screen.getByRole("link", { name: /Passer au Niveau 2/ })).toHaveAttribute("href", "/jeu?level=2");
  });

  it("NextLevelCTA renders nothing at level 3", () => {
    const { container } = render(createElement(NextLevelCTA, { level: 3 }));
    expect(container).toBeEmptyDOMElement();
  });
});
