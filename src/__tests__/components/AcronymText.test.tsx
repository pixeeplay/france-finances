import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AcronymText } from "@/components/AcronymText";

describe("AcronymText", () => {
  it("garde les parentheses collees a l'acronyme (pas de retour a la ligne apres « ( »)", () => {
    render(<AcronymText text="la loi de financement de la Sécurité sociale (LFSS), couvrant" />);
    const btn = screen.getByRole("button", { name: "LFSS" });
    const wrapper = btn.parentElement;
    expect(wrapper).toHaveClass("whitespace-nowrap");
    expect(wrapper?.textContent).toBe("(LFSS),");
  });

  it("conserve tout le texte", () => {
    const text = "Le CHU et le CHR (dont l'AP-HP) : 32 établissements.";
    const { container } = render(<AcronymText text={text} />);
    expect(container.textContent).toBe(text);
  });
});

describe("AcronymText : infobulle et lexique", () => {
  it("ouvre une infobulle avec le nom développé, l'explication et le lien vers le lexique", () => {
    render(<AcronymText text="L'ONDAM est voté chaque année." />);
    fireEvent.click(screen.getByRole("button", { name: "ONDAM" }));
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Objectif National de Dépenses d'Assurance Maladie");
    expect(tooltip.textContent).toContain("Plafond de dépenses");
    const link = screen.getByRole("link", { name: "Voir le lexique" });
    expect(link).toHaveAttribute("href", "/lexique#ondam");
    expect(link).not.toHaveAttribute("target");
  });

  it("explique aussi les termes du jargon, avec le lexique dans un nouvel onglet dans le jeu", () => {
    render(<AcronymText lexiconInNewTab text="Les niches fiscales coûtent cher." />);
    fireEvent.click(screen.getByRole("button", { name: "niches fiscales" }));
    expect(screen.getByRole("tooltip").textContent).toContain("Réduction, crédit ou exonération d'impôt");
    const link = screen.getByRole("link", { name: /Voir le lexique/ });
    expect(link).toHaveAttribute("href", "/lexique#niche-fiscale");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("ferme l'infobulle au second appui", () => {
    render(<AcronymText text="La CSG finance la Sécurité sociale." />);
    const btn = screen.getByRole("button", { name: "CSG" });
    fireEvent.click(btn);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("reconnaît les sigles écrits en minuscules", () => {
    render(<AcronymText text="Selon l'Insee et l'Unédic." />);
    expect(screen.getByRole("button", { name: "Insee" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unédic" })).toBeInTheDocument();
  });
});
