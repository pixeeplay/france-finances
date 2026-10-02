import { describe, it, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Simulator } from "@/components/simulateur/Simulator";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DailySquares } from "@/components/DailyDeck";
import { STATE_MISSIONS_2026 } from "@/data/chiffres";

describe("Simulator live announcement", () => {
  afterEach(() => vi.useRealTimers());

  it("announces a short debounced summary instead of a live summary section", () => {
    vi.useFakeTimers();
    render(
      <Simulator
        initialInput={{ annualGross: 30_000, isSingle: true, nbChildren: 0 }}
        budgetItems={STATE_MISSIONS_2026.items}
      />,
    );

    const section = screen.getByRole("heading", { name: "Estimation annuelle" }).closest("section");
    expect(section).not.toHaveAttribute("aria-live");

    const live = section!.querySelector("[aria-live='polite']");
    expect(live).not.toBeNull();
    expect(live).toHaveClass("sr-only");
    // Nothing announced on first render
    expect(live!.textContent).toBe("");

    const slider = screen.getByLabelText("Ajuster le salaire annuel brut");
    fireEvent.change(slider, { target: { value: "40000" } });
    fireEvent.change(slider, { target: { value: "45000" } });
    // Still silent while the slider moves
    expect(live!.textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(live!.textContent).toMatch(/^Prélèvements estimés .+, taux global .+/);
  });
});

describe("HowItWorks legend", () => {
  it("keeps dt/dd as direct children of a single wrapper inside the dl", () => {
    const { container } = render(<HowItWorks />);
    const dl = container.querySelector("dl")!;
    for (const row of Array.from(dl.children)) {
      expect(row.tagName).toBe("DIV");
      for (const child of Array.from(row.children)) {
        expect(["DT", "DD"]).toContain(child.tagName);
      }
    }
    expect(dl.querySelectorAll("dt")).toHaveLength(dl.children.length);
  });
});

describe("DailySquares", () => {
  it("adds a glyph per square so the result is not conveyed by colour alone", () => {
    const { container } = render(<DailySquares directions={["keep", "cut", "unjustified"]} />);
    expect(screen.getByRole("img", { name: /Carte 1 gardée, Carte 2 à revoir/ })).toBeInTheDocument();
    const paths = Array.from(container.querySelectorAll("path")).map((p) => p.getAttribute("d"));
    expect(new Set(paths).size).toBe(3);
    // Injustifié uses the danger colour, like the game legend
    expect(container.querySelectorAll(".bg-danger")).toHaveLength(2);
  });
});
