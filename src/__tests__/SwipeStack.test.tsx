import React, { act } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Card, VoteDirection } from "@/types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { style, className, onClick, "aria-label": ariaLabel, role, tabIndex } = props as Record<string, unknown>;
      return (
        <div
          style={style as React.CSSProperties}
          className={className as string}
          onClick={onClick as React.MouseEventHandler}
          aria-label={ariaLabel as string}
          role={role as string}
          tabIndex={tabIndex as number}
        >
          {children as React.ReactNode}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  }),
  useTransform: () => ({
    get: () => 0,
    set: vi.fn(),
    onChange: vi.fn(),
  }),
  animate: vi.fn((_mv, _target, opts?: { onComplete?: () => void }) => {
    opts?.onComplete?.();
    return { stop: vi.fn() };
  }),
  useReducedMotion: () => false,
}));

// Mock SwipeCard with forwardRef so it can accept ref from SwipeStack
vi.mock("@/components/SwipeCard", () => ({
  SwipeCard: React.forwardRef(function MockSwipeCard(
    { card, onSwipe, isTop }: { card: Card; onSwipe: (d: VoteDirection) => void; isTop: boolean },
    ref: React.Ref<{ triggerSwipe: (d: VoteDirection) => void }>
  ) {
    React.useImperativeHandle(ref, () => ({
      triggerSwipe(direction: VoteDirection) {
        onSwipe(direction);
      },
    }));
    return (
      <div data-testid={`swipe-card-${card.id}`} data-is-top={isTop}>
        <span>{card.title}</span>
        <button data-testid={`swipe-keep-${card.id}`} onClick={() => onSwipe("keep")}>
          Keep
        </button>
        <button data-testid={`swipe-cut-${card.id}`} onClick={() => onSwipe("cut")}>
          Cut
        </button>
      </div>
    );
  }),
}));

// Mock ChainsawIcon and ShieldIcon
vi.mock("@/components/ChainsawIcon", () => ({
  ChainsawIcon: ({ size }: { size: number }) => <span data-testid="chainsaw-icon" data-size={size} />,
}));
vi.mock("@/components/ShieldIcon", () => ({
  ShieldIcon: ({ size }: { size: number }) => <span data-testid="shield-icon" data-size={size} />,
}));

function makeCard(id: string, deckId: string = "defense"): Card {
  return {
    id,
    title: `Card ${id}`,
    subtitle: "Subtitle",
    description: "Description",
    amountBillions: 2.0,
    costPerCitizen: 29,
    deckId,
    icon: "🎯",
    source: "Test",
    level: 1,
  };
}

describe("SwipeStack", () => {
  let useGameStore: typeof import("@/stores/gameStore").useGameStore;
  let SwipeStack: typeof import("@/components/SwipeStack").SwipeStack;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPush.mockClear();

    // Reset modules to get fresh store
    vi.resetModules();

    // Re-mock localStorage for Zustand
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
      };
    })();
    Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

    // Stub sessionStorage for Zustand persist
    const sessionStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
      };
    })();
    Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorageMock });

    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-1234" });
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }))));

    const storeMod = await import("@/stores/gameStore");
    useGameStore = storeMod.useGameStore;
    useGameStore.getState().reset();

    const stackMod = await import("@/components/SwipeStack");
    SwipeStack = stackMod.SwipeStack;
  });

  describe("session initialization", () => {
    it("calls startSession on mount", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      await waitFor(() => {
        const session = useGameStore.getState().session;
        expect(session).not.toBeNull();
        expect(session!.deckId).toBe("defense");
        expect(session!.cards).toHaveLength(3);
        expect(session!.level).toBe(1);
        expect(session!.gameMode).toBe("classic");
      });
    });

    it("initializes session with custom level and game mode", async () => {
      const cards = [makeCard("c1"), makeCard("c2")];

      render(
        <SwipeStack
          cards={cards}
          deckId="sante"
          deckName="Sante"
          level={2}
          gameMode="budget"
          budgetTarget={10}
        />
      );

      await waitFor(() => {
        const session = useGameStore.getState().session;
        expect(session).not.toBeNull();
        expect(session!.level).toBe(2);
        expect(session!.gameMode).toBe("budget");
        expect(session!.budgetTarget).toBe(10);
      });
    });

    it("displays deck name and progress counter", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      expect(screen.getByText("Defense")).toBeInTheDocument();
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });
  });

  describe("quit confirmation", () => {
    it("shows quit button with correct aria-label", () => {
      const cards = [makeCard("c1"), makeCard("c2")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      const quitButton = screen.getByRole("button", { name: "Quitter la session" });
      expect(quitButton).toBeInTheDocument();
    });

    it("shows confirm dialog when quitting with votes recorded", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      // Wait for session to initialize
      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      // Record a vote directly via store, wrapped in act to trigger re-render
      act(() => {
        useGameStore.getState().voteAndAdvance("c1", "keep");
      });

      // Click quit
      const quitButton = screen.getByRole("button", { name: "Quitter la session" });
      fireEvent.click(quitButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        "Quitter la session ? Votre progression sera perdue."
      );
      // User cancelled, should NOT navigate
      expect(mockPush).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it("navigates to /jeu when quit is confirmed", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      // Record a vote, wrapped in act to trigger re-render
      act(() => {
        useGameStore.getState().voteAndAdvance("c1", "keep");
      });

      const quitButton = screen.getByRole("button", { name: "Quitter la session" });
      fireEvent.click(quitButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/jeu");

      confirmSpy.mockRestore();
    });

    it("quits without confirm dialog when no votes recorded", async () => {
      const cards = [makeCard("c1"), makeCard("c2")];
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      const quitButton = screen.getByRole("button", { name: "Quitter la session" });
      fireEvent.click(quitButton);

      // No confirm needed since no votes
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/jeu");

      confirmSpy.mockRestore();
    });
  });

  describe("keyboard navigation", () => {
    it("triggers keep on ArrowLeft key", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      fireEvent.keyDown(window, { key: "ArrowLeft" });

      // The keyboard handler calls handleButtonVote which calls triggerSwipe or handleSwipe
      // With our mock SwipeCard, we verify the store was updated
      await waitFor(() => {
        const session = useGameStore.getState().session;
        expect(session!.votes.length).toBeGreaterThanOrEqual(1);
        expect(session!.votes[0].direction).toBe("keep");
      });
    });

    it("triggers cut on ArrowRight key", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      fireEvent.keyDown(window, { key: "ArrowRight" });

      await waitFor(() => {
        const session = useGameStore.getState().session;
        expect(session!.votes.length).toBeGreaterThanOrEqual(1);
        expect(session!.votes[0].direction).toBe("cut");
      });
    });

    it("ignores ArrowUp/ArrowDown at level 1", async () => {
      const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" level={1} />
      );

      await waitFor(() => {
        expect(useGameStore.getState().session).not.toBeNull();
      });

      fireEvent.keyDown(window, { key: "ArrowUp" });
      fireEvent.keyDown(window, { key: "ArrowDown" });

      // No votes should be recorded
      const session = useGameStore.getState().session;
      expect(session!.votes).toHaveLength(0);
    });
  });

  describe("screen reader", () => {
    it("renders an sr-only live region with card info", () => {
      const cards = [makeCard("c1"), makeCard("c2")];

      render(
        <SwipeStack cards={cards} deckId="defense" deckName="Defense" />
      );

      const liveRegion = screen.getByText(/Carte 1 sur 2/);
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });
  });
});
