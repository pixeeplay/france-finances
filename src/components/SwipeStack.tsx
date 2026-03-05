"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { SwipeCardHandle } from "./SwipeCard";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { useGameStore } from "@/stores/gameStore";
import type { Card, VoteDirection } from "@/types";

interface SwipeStackProps {
  cards: Card[];
  deckId: string;
  deckName: string;
  level?: 1 | 2 | 3;
  onCardTap?: (card: Card) => void;
}

export function SwipeStack({
  cards,
  deckId,
  deckName,
  level = 1,
  onCardTap,
}: SwipeStackProps) {
  const router = useRouter();
  const { session, startSession, recordVote, nextCard, completeSession } =
    useGameStore();
  const [initialized, setInitialized] = useState(false);
  const cardRef = useRef<SwipeCardHandle>(null);

  if (!initialized) {
    startSession(deckId, cards, level);
    setInitialized(true);
  }

  const currentIndex = session?.currentIndex ?? 0;
  const totalCards = cards.length;

  const handleSwipe = useCallback(
    (direction: VoteDirection) => {
      const card = cards[currentIndex];
      if (!card) return;
      recordVote(card.id, direction);
      nextCard();
      if (currentIndex + 1 >= totalCards) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }
    },
    [recordVote, nextCard, completeSession, currentIndex, totalCards, cards, router]
  );

  const handleButtonVote = useCallback(
    (direction: VoteDirection) => {
      if (!cards[currentIndex]) return;
      if (cardRef.current) {
        cardRef.current.triggerSwipe(direction);
      } else {
        handleSwipe(direction);
      }
    },
    [currentIndex, cards, handleSwipe]
  );

  const currentCard = cards[currentIndex];
  const nextCardInPile = cards[currentIndex + 1];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {deckName}
          </span>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            N{level}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: totalCards }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
            {currentIndex + 1}/{totalCards}
          </span>
        </div>
        <button
          onClick={() => router.push("/play")}
          className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:bg-danger hover:text-white transition-colors shadow-sm shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Direction hints for Level 2 */}
      {level >= 2 && (
        <>
          <div className="flex justify-center pt-1 pb-0 opacity-60">
            <span className="text-[10px] font-bold text-info tracking-wider">▲ RENFORCER</span>
          </div>
        </>
      )}

      {/* Card stack */}
      <div className="flex-1 relative mx-4 mb-2" style={{ perspective: 1000 }}>
        {/* Level 2 side hints */}
        {level >= 2 && (
          <>
            <div className="absolute inset-y-0 left-0 flex items-center z-30 pointer-events-none -ml-3">
              <span className="text-[10px] font-bold text-primary tracking-wider -rotate-90 opacity-60">🛡️ OK</span>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center z-30 pointer-events-none -mr-3">
              <span className="text-[10px] font-bold text-warning tracking-wider rotate-90 opacity-60">🪚 RÉDUIRE</span>
            </div>
          </>
        )}

        <AnimatePresence>
          {nextCardInPile && (
            <SwipeCard
              key={nextCardInPile.id}
              card={nextCardInPile}
              isTop={false}
              onSwipe={() => {}}
              level={level}
            />
          )}
          {currentCard && (
            <SwipeCard
              ref={cardRef}
              key={currentCard.id}
              card={currentCard}
              isTop={true}
              onSwipe={handleSwipe}
              onTap={() => onCardTap?.(currentCard)}
              level={level}
            />
          )}
        </AnimatePresence>
        {!currentCard && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Session terminée !</p>
          </div>
        )}
      </div>

      {/* Level 2 bottom hint */}
      {level >= 2 && (
        <div className="flex justify-center pb-1 opacity-60">
          <span className="text-[10px] font-bold text-danger tracking-wider">❌ INJUSTIFIÉ ▼</span>
        </div>
      )}

      {/* Bottom action buttons */}
      {level >= 2 ? (
        <Level2Buttons
          currentCard={currentCard}
          onVote={handleButtonVote}
        />
      ) : (
        <div className="px-6 pb-4 flex items-center justify-between">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleButtonVote("keep")}
              disabled={!currentCard}
              className="w-20 h-20 rounded-full bg-card border-[3px] border-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-90 disabled:opacity-40"
            >
              <ShieldIcon size={40} className="text-primary" />
            </button>
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              Valider
            </span>
          </div>

          <div className="flex flex-col items-center justify-center opacity-60">
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2">
              Swipez pour décider
            </span>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleButtonVote("cut")}
              disabled={!currentCard}
              className="w-20 h-20 rounded-full bg-card border-[3px] border-danger flex items-center justify-center shadow-lg shadow-danger/30 transition-transform active:scale-90 disabled:opacity-40"
            >
              <ChainsawIcon size={40} />
            </button>
            <span className="text-xs font-bold text-danger tracking-wider uppercase">
              À Revoir
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** 4-button layout for Level 2 */
function Level2Buttons({
  currentCard,
  onVote,
}: {
  currentCard: Card | undefined;
  onVote: (d: VoteDirection) => void;
}) {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onVote("keep")}
          disabled={!currentCard}
          className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-card border-2 border-primary transition-transform active:scale-90 disabled:opacity-40"
        >
          <ShieldIcon size={24} className="text-primary" />
          <span className="text-[9px] font-bold text-primary uppercase">OK</span>
        </button>
        <button
          onClick={() => onVote("cut")}
          disabled={!currentCard}
          className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-card border-2 border-warning transition-transform active:scale-90 disabled:opacity-40"
        >
          <ChainsawIcon size={24} />
          <span className="text-[9px] font-bold text-warning uppercase">Réduire</span>
        </button>
        <button
          onClick={() => onVote("reinforce")}
          disabled={!currentCard}
          className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-card border-2 border-info transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="text-lg">📈</span>
          <span className="text-[9px] font-bold text-info uppercase">Renforcer</span>
        </button>
        <button
          onClick={() => onVote("unjustified")}
          disabled={!currentCard}
          className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-card border-2 border-danger transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="text-lg">❌</span>
          <span className="text-[9px] font-bold text-danger uppercase">Injustifié</span>
        </button>
      </div>
    </div>
  );
}
