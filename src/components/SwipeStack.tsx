"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { SwipeCardHandle } from "./SwipeCard";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { useGameStore } from "@/stores/gameStore";
import { useShallow } from "zustand/react/shallow";
import { track } from "@/lib/analytics";
import { useKeyboardSwipe } from "@/hooks/useKeyboardSwipe";
import type { Card, VoteDirection, GameMode } from "@/types";

interface SwipeStackProps {
  cards: Card[];
  deckId: string;
  deckName: string;
  level?: 1 | 2 | 3;
  gameMode?: GameMode;
  budgetTarget?: number;
  onCardTap?: (card: Card) => void;
  /** Level 3: delegate swipe handling to parent (card + direction) */
  onSwipeComplete?: (card: Card, direction: VoteDirection) => void;
}

export function SwipeStack({
  cards,
  deckId,
  deckName,
  level = 1,
  gameMode = "classic",
  budgetTarget,
  onCardTap,
  onSwipeComplete,
}: SwipeStackProps) {
  const router = useRouter();
  const { session, cardShownAt, startSession, voteAndAdvance, completeSession } =
    useGameStore(useShallow((s) => ({
      session: s.session,
      cardShownAt: s.cardShownAt,
      startSession: s.startSession,
      voteAndAdvance: s.voteAndAdvance,
      completeSession: s.completeSession,
    })));
  const [initialized, setInitialized] = useState(false);
  const cardRef = useRef<SwipeCardHandle>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!initialized) {
      startSession(deckId, cards, level, gameMode, budgetTarget);
      track("session_start", { deckId, level, gameMode });
      setInitialized(true); // eslint-disable-line react-hooks/set-state-in-effect -- one-time init guard
    }
  }, [initialized, startSession, deckId, cards, level, gameMode, budgetTarget]);

  // Warn before leaving mid-session (browser navigation)
  useEffect(() => {
    if (!session || session.completed) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session]);

  const reset = useGameStore((s) => s.reset);

  const handleQuitSession = useCallback(() => {
    if (session && !session.completed && session.votes.length > 0) {
      if (!window.confirm("Quitter la session ? Votre progression sera perdue.")) {
        return;
      }
    }
    reset();
    router.push("/jeu");
  }, [session, router, reset]);

  const currentIndex = session?.currentIndex ?? 0;
  const totalCards = cards.length;

  const handleSwipe = useCallback(
    (direction: VoteDirection) => {
      const card = cards[currentIndex];
      if (!card || isAnimating.current) return;

      const durationMs = cardShownAt > 0 ? Date.now() - cardShownAt : 0;
      track("card_vote", { cardId: card.id, direction, durationMs });

      // Level 3: delegate to parent for audit flow
      if (onSwipeComplete) {
        onSwipeComplete(card, direction);
        return;
      }

      const isLast = voteAndAdvance(card.id, direction);
      if (isLast) {
        completeSession();
        setTimeout(() => router.push("/results"), 300);
      }
      isAnimating.current = false;
    },
    [voteAndAdvance, completeSession, currentIndex, totalCards, cards, router, onSwipeComplete, cardShownAt]
  );

  const handleButtonVote = useCallback(
    (direction: VoteDirection) => {
      if (!cards[currentIndex] || isAnimating.current) return;
      isAnimating.current = true;
      if (cardRef.current) {
        cardRef.current.triggerSwipe(direction);
      } else {
        handleSwipe(direction);
      }
    },
    [currentIndex, cards, handleSwipe]
  );

  useKeyboardSwipe({
    onVote: handleButtonVote,
    enabled: !!cards[currentIndex],
    level,
  });

  const currentCard = cards[currentIndex];
  const nextCardInPile = cards[currentIndex + 1];

  // Budget mode: compute current savings from cut votes
  const currentSavings = gameMode === "budget" && session
    ? session.votes
        .filter((v) => v.direction === "cut" || v.direction === "unjustified")
        .reduce((sum, v) => {
          const card = cards.find((c) => c.id === v.cardId);
          return sum + (card?.amountBillions ?? 0);
        }, 0)
    : 0;
  const savingsProgress = budgetTarget ? Math.min(currentSavings / budgetTarget, 1) : 0;
  const targetReached = budgetTarget ? currentSavings >= budgetTarget : false;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {deckName}
          </span>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            {gameMode === "budget" ? "Budget" : `N${level}`}
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
          onClick={handleQuitSession}
          aria-label="Quitter la session"
          className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:bg-danger hover:text-white transition-colors shadow-sm shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Budget tracker */}
      {gameMode === "budget" && budgetTarget && (
        <div className="px-4 pb-2">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Objectif economies
              </span>
              <span className={`text-xs font-bold ${targetReached ? "text-primary" : "text-foreground"}`}>
                {currentSavings.toFixed(1)} / {budgetTarget} Md&euro;
              </span>
            </div>
            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  targetReached
                    ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                }`}
                style={{ width: `${savingsProgress * 100}%` }}
              />
            </div>
            {targetReached && (
              <p className="text-[10px] font-bold text-primary mt-1 text-center">
                Objectif atteint !
              </p>
            )}
          </div>
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentCard
          ? `Carte ${currentIndex + 1} sur ${totalCards} : ${currentCard.title}, ${currentCard.amountBillions} milliards d'euros.`
          : "Session terminee."}
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
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary tracking-wider -rotate-90 opacity-60" aria-hidden="true"><ShieldIcon size={10} className="text-primary" /> OK</span>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center z-30 pointer-events-none -mr-3">
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-warning tracking-wider rotate-90 opacity-60" aria-hidden="true"><ChainsawIcon size={10} /> RÉDUIRE</span>
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
          <span className="text-[10px] font-bold text-danger tracking-wider" aria-hidden="true">❌ INJUSTIFIÉ ▼</span>
        </div>
      )}

      {/* Bottom action buttons */}
      {level >= 2 ? (
        <Level2Buttons
          currentCard={currentCard}
          onVote={handleButtonVote}
        />
      ) : (
        <div className="px-6 pb-4 pb-safe flex items-center justify-between">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleButtonVote("keep")}
              disabled={!currentCard}
              aria-label="Valider cette dépense"
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
              aria-label="Remettre en question cette dépense"
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
    <div className="px-4 pb-4 pb-safe">
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onVote("keep")}
          disabled={!currentCard}
          aria-label="Valider cette depense"
          className="flex flex-col items-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-card border-2 border-primary transition-transform active:scale-90 disabled:opacity-40"
        >
          <ShieldIcon size={24} className="text-primary" />
          <span className="text-[9px] font-bold text-primary uppercase">OK</span>
        </button>
        <button
          onClick={() => onVote("cut")}
          disabled={!currentCard}
          aria-label="Reduire cette depense"
          className="flex flex-col items-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-card border-2 border-warning transition-transform active:scale-90 disabled:opacity-40"
        >
          <ChainsawIcon size={24} />
          <span className="text-[9px] font-bold text-warning uppercase">Réduire</span>
        </button>
        <button
          onClick={() => onVote("reinforce")}
          disabled={!currentCard}
          aria-label="Renforcer cette depense"
          className="flex flex-col items-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-card border-2 border-info transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="text-lg" aria-hidden="true">📈</span>
          <span className="text-[9px] font-bold text-info uppercase">Renforcer</span>
        </button>
        <button
          onClick={() => onVote("unjustified")}
          disabled={!currentCard}
          aria-label="Marquer comme injustifie"
          className="flex flex-col items-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-card border-2 border-danger transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="text-lg" aria-hidden="true">❌</span>
          <span className="text-[9px] font-bold text-danger uppercase">Injustifié</span>
        </button>
      </div>
    </div>
  );
}
