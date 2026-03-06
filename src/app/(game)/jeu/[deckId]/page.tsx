import { notFound } from "next/navigation";
import { SwipeSession } from "./SwipeSession";
import decksData from "@/data";
import { drawCards, filterByDeck } from "@/lib/deckUtils";
import { validateDecksData } from "@/lib/validateData";
import type { Card, Deck, GameMode } from "@/types";
import type { Metadata } from "next";

// Validate data at module load (runs once at build/start)
const validation = validateDecksData(decksData as { decks: Deck[]; cards: Card[] });
if (!validation.valid) {
  console.error("[DATA] Validation errors:", validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn("[DATA] Validation warnings:", validation.warnings);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string }>;
}): Promise<Metadata> {
  const { deckId } = await params;
  const deck = decksData.decks.find((d) => d.id === deckId);
  const name = deck?.name ?? "Mode aléatoire";
  return {
    title: `${name} — La Tronçonneuse de Poche`,
    description: `Swipe les dépenses ${name.toLowerCase()} : garde ou remet en question chaque poste budgétaire.`,
  };
}

export default async function SwipePage({
  params,
  searchParams,
}: {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ level?: string; mode?: string; target?: string }>;
}) {
  const { deckId } = await params;
  const { level: levelStr, mode, target } = await searchParams;

  // Validate deckId
  const deck = decksData.decks.find((d) => d.id === deckId);
  if (deckId !== "random" && !deck) {
    notFound();
  }

  // Clamp level to 1-3
  const rawLevel = Number(levelStr) || 1;
  const level = Math.min(Math.max(rawLevel, 1), 3) as 1 | 2 | 3;

  const gameMode: GameMode = mode === "budget" ? "budget" : "classic";
  const budgetTarget = gameMode === "budget" ? (Number(target) || 15) : undefined;

  const allCards = decksData.cards as Card[];
  const deckCards = deckId === "random" ? allCards : filterByDeck(allCards, deckId);
  const sessionCards = drawCards(deckCards, 10);

  return (
    <SwipeSession
      deckId={deckId}
      deckName={deck?.name ?? "Aléatoire"}
      cards={sessionCards}
      level={level}
      gameMode={gameMode}
      budgetTarget={budgetTarget}
    />
  );
}
