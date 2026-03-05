"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SwipeStack } from "@/components/SwipeStack";
import { CardDetail } from "@/components/CardDetail";
import { useGameStore } from "@/stores/gameStore";
import type { Card, VoteDirection } from "@/types";

interface SwipeSessionProps {
  deckId: string;
  deckName: string;
  cards: Card[];
  level?: 1 | 2 | 3;
}

export function SwipeSession({ deckId, deckName, cards, level = 1 }: SwipeSessionProps) {
  const router = useRouter();
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const { session, recordVote, nextCard, completeSession } = useGameStore();

  const handleCardTap = useCallback((card: Card) => {
    setDetailCard(card);
  }, []);

  const handleDetailVote = useCallback(
    (direction: VoteDirection) => {
      if (!detailCard || !session) return;

      recordVote(detailCard.id, direction);
      nextCard();

      const currentIndex = session.currentIndex;
      if (currentIndex + 1 >= cards.length) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }

      setDetailCard(null);
    },
    [detailCard, session, recordVote, nextCard, completeSession, cards.length, router]
  );

  return (
    <main className="flex-1 flex flex-col min-h-0">
      <SwipeStack
        cards={cards}
        deckId={deckId}
        deckName={deckName}
        level={level}
        onCardTap={handleCardTap}
      />
      <CardDetail
        card={detailCard}
        level={level}
        onClose={() => setDetailCard(null)}
        onVote={handleDetailVote}
      />
    </main>
  );
}
