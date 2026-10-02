import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
