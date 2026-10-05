import type { Card, CardKind } from "@/types";

/**
 * Vrai si la carte est une dépense publique (`kind: "depense"`).
 * Seules les dépenses comptent dans le deck du jour, le défi budget,
 * l'archétype et le cumul « tronçonné » : couper une recette ou un
 * indicateur (fraude estimée, dette...) n'est pas une économie.
 */
export function isSpendingCard(card: Pick<Card, "kind">): boolean {
  return card.kind === "depense";
}

/** Libellé discret affiché sur les cartes qui ne sont pas des dépenses. */
export const CARD_KIND_LABELS: Record<Exclude<CardKind, "depense">, string> = {
  recette: "Recette",
  agregat: "Indicateur",
};

/**
 * Intitulé du montant : seule une dépense est un « coût annuel ». Un indicateur
 * peut être un stock (dette) ou une estimation (fraude) : simple « montant ».
 */
export function cardAmountLabel(card: Pick<Card, "kind">): string {
  if (card.kind === "depense") return "Coût annuel";
  return card.kind === "recette" ? "Montant annuel" : "Montant";
}

/** Libellé de nature de la carte, `null` pour une dépense (cas courant, rien à signaler). */
export function cardKindLabel(card: Pick<Card, "kind">): string | null {
  return card.kind === "depense" ? null : CARD_KIND_LABELS[card.kind];
}
