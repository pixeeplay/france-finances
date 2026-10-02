import { notFound } from "next/navigation";
import { SwipeSession } from "./SwipeSession";
import decksData from "@/data";
import { drawCards, filterByDeck } from "@/lib/deckUtils";
import { DAILY_DECK_ID, drawDailyCards, getDailyNumber, getParisDateKey } from "@/lib/daily";
import { validateDecksData } from "@/lib/validateData";
import type { Card, Deck, GameMode } from "@/types";
import type { Metadata } from "next";

// Validate data at module load (runs once at build/start)
const validation = validateDecksData(decksData as { decks: Deck[]; cards: Card[] });
if (!validation.valid && process.env.NODE_ENV !== "production") {
  console.error("[DATA] Validation errors:", validation.errors);
}
if (validation.warnings.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[DATA] Validation warnings:", validation.warnings);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string }>;
}): Promise<Metadata> {
  const { deckId } = await params;
  const deck = decksData.decks.find((d) => d.id === deckId);

  if (deckId === DAILY_DECK_ID) {
    return {
      title: "Deck du jour — La Tronçonneuse de Poche",
      description:
        "Les mêmes 10 dépenses publiques pour tout le monde, chaque jour. Garde ou remets en question, puis compare ton résultat.",
      alternates: {
        canonical: `/jeu/${DAILY_DECK_ID}`,
      },
    };
  }

  if (!deck) {
    return {
      title: "Mode aléatoire — La Tronçonneuse de Poche",
      description:
        "Swipe des dépenses publiques piochées au hasard : garde ou remet en question chaque poste budgétaire.",
      alternates: {
        canonical: `/jeu/${deckId}`,
      },
    };
  }

  const description = deck.description
    ? `${deck.description} — Swipe pour garder ou remettre en question chaque poste.`
    : `Swipe les dépenses ${deck.name.toLowerCase()} : garde ou remet en question chaque poste budgétaire.`;

  return {
    title: `${deck.name} — La Tronçonneuse de Poche`,
    description,
    alternates: {
      canonical: `/jeu/${deckId}`,
    },
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
  if (deckId !== "random" && deckId !== DAILY_DECK_ID && !deck) {
    notFound();
  }

  const allCards = decksData.cards as Card[];

  // Daily deck: same draw for everyone (seed = date in Europe/Paris), always level 1 classic
  if (deckId === DAILY_DECK_ID) {
    const dailyKey = getParisDateKey();
    return (
      <SwipeSession
        deckId={DAILY_DECK_ID}
        deckName={`Deck du jour n°${getDailyNumber(dailyKey)}`}
        cards={drawDailyCards(allCards, dailyKey)}
        level={1}
        dailyKey={dailyKey}
      />
    );
  }

  // Clamp level to 1-3
  const rawLevel = Number(levelStr) || 1;
  const level = Math.min(Math.max(rawLevel, 1), 3) as 1 | 2 | 3;

  const gameMode: GameMode = mode === "budget" ? "budget" : "classic";
  const budgetTarget = gameMode === "budget" ? (Number(target) || 15) : undefined;

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
