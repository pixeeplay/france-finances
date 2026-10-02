import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetChallengeEntry, BudgetChallengeSummary, BUDGET_CHALLENGE_HREF } from "@/components/BudgetChallenge";
import type { Card, Session } from "@/types";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

function card(id: string, amountBillions: number): Card {
  return {
    id,
    title: id,
    subtitle: "",
    description: "",
    amountBillions,
    costPerCitizen: 0,
    deckId: "defense",
    icon: "",
    source: "test",
    level: 1,
  };
}

function budgetSession(directions: ("cut" | "keep")[]): Session {
  const cards = [card("def-01", 20), card("def-02", 20), card("def-03", 15), card("def-04", 5)];
  return {
    id: "s",
    deckId: "random",
    level: 1,
    gameMode: "budget",
    budgetTarget: 50,
    cards,
    votes: directions.map((direction, i) => ({ cardId: cards[i].id, direction, duration: 0, timestamp: i })),
    currentIndex: 3,
    startedAt: 0,
    completed: true,
    totalDuration: 1,
  };
}

describe("BudgetChallengeEntry", () => {
  it("links to the 50 Md€ challenge", () => {
    render(<BudgetChallengeEntry />);
    expect(screen.getByRole("link", { name: "Relever le défi" })).toHaveAttribute("href", BUDGET_CHALLENGE_HREF);
    expect(BUDGET_CHALLENGE_HREF).toBe("/jeu/random?mode=budget&target=50");
  });
});

describe("BudgetChallengeSummary", () => {
  it("explains when more cuts than necessary were made", () => {
    render(<BudgetChallengeSummary session={budgetSession(["cut", "cut", "cut", "cut"])} />);
    expect(screen.getByTestId("budget-challenge-summary")).toHaveTextContent("Objectif franchi à ta 3e coupe");
    expect(screen.getByTestId("budget-challenge-summary")).toHaveTextContent("3 coupes bien choisies suffisaient");
  });

  it("shows what was missing", () => {
    render(<BudgetChallengeSummary session={budgetSession(["cut", "keep", "keep", "cut"])} />);
    expect(screen.getByTestId("budget-challenge-summary")).toHaveTextContent("Il manquait 25");
  });
});
