import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AmountQuiz } from "@/components/AmountQuiz";
import type { Card } from "@/types";

const card = {
  id: "test-01",
  title: "Dépense de test",
  amountBillions: 12,
  costPerCitizen: 174,
  deckId: "etat",
  source: "Test",
} as unknown as Card;

describe("AmountQuiz — Passer", () => {
  it("permet de passer le quiz sans répondre", () => {
    const onAnswer = vi.fn();
    const onContinue = vi.fn();
    render(<AmountQuiz card={card} onAnswer={onAnswer} onContinue={onContinue} />);
    fireEvent.click(screen.getByRole("button", { name: "Passer" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("explique que la carte n'est pas encore révélée", () => {
    render(<AmountQuiz card={card} onAnswer={() => {}} onContinue={() => {}} />);
    expect(screen.getByText(/avant de voir la carte/i)).toBeTruthy();
  });
});
