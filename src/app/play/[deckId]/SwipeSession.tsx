"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SwipeStack } from "@/components/SwipeStack";
import { CardDetail } from "@/components/CardDetail";
import { AuditScreen } from "@/components/AuditScreen";
import { useGameStore } from "@/stores/gameStore";
import type { Card, VoteDirection, AuditResponse, GameMode } from "@/types";

interface SwipeSessionProps {
  deckId: string;
  deckName: string;
  cards: Card[];
  level?: 1 | 2 | 3;
  gameMode?: GameMode;
  budgetTarget?: number;
}

export function SwipeSession({ deckId, deckName, cards, level = 1, gameMode = "classic", budgetTarget }: SwipeSessionProps) {
  const router = useRouter();
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const { session, recordVote, recordAudit, nextCard, completeSession } = useGameStore();

  // Level 3: after swipe, show audit screen for the card
  const [auditCard, setAuditCard] = useState<{ card: Card; direction: VoteDirection } | null>(null);

  const advanceOrFinish = useCallback(() => {
    const currentIndex = session?.currentIndex ?? 0;
    nextCard();
    if (currentIndex + 1 >= cards.length) {
      completeSession();
      setTimeout(() => router.push("/results"), 300);
    }
  }, [session, nextCard, completeSession, cards.length, router]);

  const handleCardTap = useCallback((card: Card) => {
    setDetailCard(card);
  }, []);

  // Called when Level 3 swipe completes — intercept to show audit
  const handleSwipeComplete = useCallback(
    (card: Card, direction: VoteDirection) => {
      recordVote(card.id, direction);
      setAuditCard({ card, direction });
    },
    [recordVote]
  );

  const handleAuditSubmit = useCallback(
    (response: AuditResponse) => {
      recordAudit(response);
      setAuditCard(null);
      advanceOrFinish();
    },
    [recordAudit, advanceOrFinish]
  );

  const handleAuditBack = useCallback(() => {
    setAuditCard(null);
  }, []);

  const handleDetailVote = useCallback(
    (direction: VoteDirection) => {
      if (!detailCard || !session) return;
      recordVote(detailCard.id, direction);

      if (level === 3) {
        setDetailCard(null);
        setAuditCard({ card: detailCard, direction });
        return;
      }

      nextCard();
      const currentIndex = session.currentIndex;
      if (currentIndex + 1 >= cards.length) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }
      setDetailCard(null);
    },
    [detailCard, session, recordVote, nextCard, completeSession, cards.length, router, level]
  );

  // Level 3 audit screen (shown after swipe)
  if (auditCard) {
    return (
      <main className="flex-1 flex flex-col min-h-0">
        <AuditScreen
          card={auditCard.card}
          cardIndex={session?.currentIndex ?? 0}
          totalCards={cards.length}
          initialDirection={auditCard.direction}
          onSubmit={handleAuditSubmit}
          onBack={handleAuditBack}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-0">
      <SwipeStack
        cards={cards}
        deckId={deckId}
        deckName={deckName}
        level={level}
        gameMode={gameMode}
        budgetTarget={budgetTarget}
        onCardTap={handleCardTap}
        onSwipeComplete={level === 3 ? handleSwipeComplete : undefined}
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
