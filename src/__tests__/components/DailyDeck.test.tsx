import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DailyDeckEntry, DailyResultPanel } from "@/components/DailyDeck";
import { useDailyStore } from "@/stores/dailyStore";
import { getParisDateKey } from "@/lib/daily";
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

function dailySession(dailyKey: string): Session {
  const cards = [card("def-01", 10), card("san-01", 5)];
  return {
    id: "s1",
    deckId: "quotidien",
    level: 1,
    gameMode: "classic",
    dailyKey,
    cards,
    votes: [
      { cardId: "def-01", direction: "cut", duration: 1, timestamp: 1 },
      { cardId: "san-01", direction: "keep", duration: 1, timestamp: 2 },
    ],
    currentIndex: 1,
    startedAt: 0,
    completed: true,
    totalDuration: 1000,
  };
}

describe("DailyResultPanel", () => {
  beforeEach(() => {
    useDailyStore.getState().resetDaily();
  });

  it("records the daily result and shares a Wordle-like text", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });

    render(<DailyResultPanel session={dailySession("2026-10-02")} />);

    await waitFor(() => {
      expect(useDailyStore.getState().results["2026-10-02"]).toBeDefined();
    });
    expect(useDailyStore.getState().results["2026-10-02"].cutBillions).toBe(10);
    expect(screen.getByText(/Deck du jour n°2/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Carte 1 à revoir, Carte 2 gardée/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Partager/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const calls = writeText.mock.calls as unknown as string[][];
    expect(calls[0][0]).toContain("🟥🟩");
  });
});

describe("DailyDeckEntry", () => {
  beforeEach(() => {
    useDailyStore.getState().resetDaily();
  });

  it("links to the daily deck", () => {
    render(<DailyDeckEntry />);
    expect(screen.getByRole("link", { name: "Jouer le deck du jour" })).toHaveAttribute("href", "/jeu/quotidien");
  });

  it("shows today's result and streak once played", () => {
    const today = getParisDateKey();
    useDailyStore.getState().recordResult({
      dateKey: today,
      directions: ["cut"],
      cutBillions: 4,
      totalBillions: 4,
    });
    render(<DailyDeckEntry />);
    expect(screen.getByRole("link", { name: /Rejouer/ })).toBeInTheDocument();
    expect(screen.getByTestId("daily-deck-entry")).toHaveTextContent("Joué aujourd");
  });
});
