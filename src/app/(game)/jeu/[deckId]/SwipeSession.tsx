"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SwipeStack } from "@/components/SwipeStack";
import { CardDetail } from "@/components/CardDetail";
import { AuditScreen } from "@/components/AuditScreen";
import { useGameStore } from "@/stores/gameStore";
import { useShallow } from "zustand/react/shallow";
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
  const { session, recordAudit, voteAndAdvance, completeSession } = useGameStore(
    useShallow((s) => ({
      session: s.session,
      recordAudit: s.recordAudit,
      voteAndAdvance: s.voteAndAdvance,
      completeSession: s.completeSession,
    }))
  );

  // Level 3: after swipe, show audit screen for the card
  const [auditCard, setAuditCard] = useState<{ card: Card; direction: VoteDirection } | null>(null);

  const advanceOrFinish = useCallback(() => {
    const currentIndex = session?.currentIndex ?? 0;
    const isLast = currentIndex >= cards.length - 1;
    // voteAndAdvance already advanced the index, so we just need to check and complete
    if (isLast) {
      completeSession();
      setTimeout(() => router.push("/results"), 300);
    }
  }, [session, completeSession, cards.length, router]);

  const handleCardTap = useCallback((card: Card) => {
    setDetailCard(card);
  }, []);

  // Called when Level 3 swipe completes — intercept to show audit
  // Don't record vote yet — wait for audit submit (fixes back button bug)
  const handleSwipeComplete = useCallback(
    (card: Card, direction: VoteDirection) => {
      setAuditCard({ card, direction });
    },
    []
  );

  const handleAuditSubmit = useCallback(
    (response: AuditResponse) => {
      if (!auditCard) return;
      // Record vote only on audit submit (not on swipe)
      const isLast = voteAndAdvance(auditCard.card.id, auditCard.direction);
      recordAudit(response);
      setAuditCard(null);
      if (isLast) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }
    },
    [auditCard, voteAndAdvance, recordAudit, completeSession, router]
  );

  const handleAuditBack = useCallback(() => {
    // No vote was recorded yet, so simply dismiss the audit screen
    setAuditCard(null);
  }, []);

  const handleDetailVote = useCallback(
    (direction: VoteDirection) => {
      if (!detailCard || !session) return;

      if (level === 3) {
        // Don't record vote yet — show audit screen first
        setDetailCard(null);
        setAuditCard({ card: detailCard, direction });
        return;
      }

      const isLast = voteAndAdvance(detailCard.id, direction);
      if (isLast) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }
      setDetailCard(null);
    },
    [detailCard, session, voteAndAdvance, completeSession, cards.length, router, level]
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
