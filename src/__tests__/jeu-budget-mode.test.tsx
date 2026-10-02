import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactElement } from "react";
import type { Card } from "@/types";

// --- Mocks ---
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/app/(game)/jeu/[deckId]/SwipeSession", () => ({
  SwipeSession: () => null,
}));

import SwipePage from "@/app/(game)/jeu/[deckId]/page";
import PlayPage from "@/app/(game)/jeu/page";

interface SwipeSessionProps {
  deckId: string;
  cards: Card[];
  gameMode?: string;
  budgetTarget?: number;
}

async function renderSwipePage(deckId: string, search: Record<string, string>) {
  const el = (await SwipePage({
    params: Promise.resolve({ deckId }),
    searchParams: Promise.resolve(search),
  })) as ReactElement<SwipeSessionProps>;
  return el.props;
}

describe("/jeu/[deckId] budget mode", () => {
  it("ignores budget mode on the revenue deck and plays a classic session", async () => {
    const props = await renderSwipePage("recettes", { mode: "budget", target: "20" });
    expect(props.gameMode).toBe("classic");
    expect(props.budgetTarget).toBeUndefined();
    expect(props.cards.length).toBeGreaterThan(0);
    expect(props.cards.every((c) => c.deckId === "recettes")).toBe(true);
  });

  it("keeps budget mode on a spending deck", async () => {
    const props = await renderSwipePage("random", { mode: "budget", target: "20" });
    expect(props.gameMode).toBe("budget");
    expect(props.budgetTarget).toBe(20);
    expect(props.cards.length).toBeGreaterThan(0);
  });
});

describe("/jeu deck picker", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    localStorage.setItem("trnc:onboarded", "true");
    // Level 2 unlocked: the budget mode toggle is available
    localStorage.setItem(
      "trnc:stats",
      JSON.stringify({
        xp: 0,
        totalSessions: 2,
        totalCards: 20,
        categoriesPlayed: [],
        sessionsPerDeck: {},
        auditsN3: 0,
        totalKeptBillions: 0,
        totalCutBillions: 0,
        sessionsPerLevel: { "1": 2 },
      }),
    );
  });

  it("turns budget mode off when a deck is selected", () => {
    render(<PlayPage />);
    const toggle = screen.getByRole("checkbox", { name: "Mode Budget" });
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Recettes/ }));
    expect(toggle).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Lancer la session/ }));
    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toMatch(/^\/jeu\/recettes/);
    expect(push.mock.calls[0][0]).not.toContain("mode=budget");
  });
});
