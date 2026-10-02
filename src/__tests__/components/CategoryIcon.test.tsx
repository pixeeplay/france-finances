import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import decksMeta from "@/data/decks-meta.json";
import { CategoryIcon, hasCategoryIcon } from "@/components/icons/CategoryIcon";

describe("CategoryIcon", () => {
  it("a un pictogramme dédié pour chaque deck", () => {
    const missing = decksMeta.decks.map((d) => d.id).filter((id) => !hasCategoryIcon(id));
    expect(missing).toEqual([]);
  });

  it("est décoratif (aria-hidden) et suit la couleur du texte", () => {
    const { container } = render(<CategoryIcon deckId="sante" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("retombe sur un pictogramme générique pour un deck inconnu", () => {
    const { container } = render(<CategoryIcon deckId="random" />);
    const svg = container.querySelector('svg[data-category-icon="random"]');
    expect(svg).not.toBeNull();
    expect(svg?.childNodes.length).toBeGreaterThan(0);
  });
});
