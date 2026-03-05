import { SwipeSession } from "./SwipeSession";
import decksData from "@/data/decks.json";
import { drawCards, filterByDeck } from "@/lib/deckUtils";
import type { Card } from "@/types";

export default async function SwipePage({
  params,
  searchParams,
}: {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ level?: string }>;
}) {
  const { deckId } = await params;
  const { level: levelStr } = await searchParams;
  const level = (Number(levelStr) || 1) as 1 | 2 | 3;

  const allCards = decksData.cards as Card[];
  const deckCards = deckId === "random" ? allCards : filterByDeck(allCards, deckId);
  const sessionCards = drawCards(deckCards, 10);

  const deck = decksData.decks.find((d) => d.id === deckId);

  return (
    <SwipeSession
      deckId={deckId}
      deckName={deck?.name ?? "Aléatoire"}
      cards={sessionCards}
      level={level}
    />
  );
}
