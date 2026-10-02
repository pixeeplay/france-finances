"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
// SwipeCard uses drag gestures → requires full `motion` (not `m` + LazyMotion/domAnimation)
import { motion, animate as fmAnimate, useReducedMotion } from "framer-motion";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ChainsawIcon } from "./ChainsawIcon";
import { ReinforceIcon } from "./ReinforceIcon";
import { StopIcon } from "./StopIcon";
import { ShieldIcon } from "./ShieldIcon";
import { AcronymText } from "./AcronymText";
import { AmountScale } from "./AmountScale";
import { CategoryBadge, catStyle } from "./icons/CategoryBadge";
import type { Card, VoteDirection } from "@/types";
import { formatBillions, formatEuros } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { UiIcon } from "./icons/UiIcon";
import { SPRING_SWIPE, TWEEN_INSTANT } from "@/lib/motion-constants";

export interface SwipeCardHandle {
  triggerSwipe: (direction: VoteDirection) => void;
}

interface SwipeCardProps {
  card: Card;
  isTop: boolean;
  onSwipe: (direction: VoteDirection) => void;
  onTap?: () => void;
  level?: 1 | 2 | 3;
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ card, isTop, onSwipe, onTap, level = 1 }, ref) {
  const prefersReducedMotion = useReducedMotion();
  const didDrag = useRef(false);

  const {
    x, y, rotate,
    keepOpacity, cutOpacity, reinforceOpacity, unjustifiedOpacity,
    greenTint, redTint, blueTint, redBottomTint,
    handleDragEnd,
  } = useSwipeGesture({ onSwipe, level });

  useImperativeHandle(ref, () => ({
    triggerSwipe(direction: VoteDirection) {
      const springConfig = prefersReducedMotion ? TWEEN_INSTANT : SPRING_SWIPE;
      const isVertical = direction === "reinforce" || direction === "unjustified";
      if (isVertical) {
        const exitY = direction === "reinforce" ? -500 : 500;
        fmAnimate(y, exitY, {
          ...springConfig,
          onComplete: () => onSwipe(direction),
        });
      } else {
        const exitX = direction === "keep" ? -500 : 500;
        fmAnimate(x, exitX, {
          ...springConfig,
          onComplete: () => onSwipe(direction),
        });
      }
    },
  }), [x, y, onSwipe, prefersReducedMotion]);

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-3xl bg-card border border-border shadow-xl overflow-hidden"
        style={{ scale: 0.95, opacity: 0.7, y: 16 }}
        aria-hidden="true"
        inert
      >
        <CardContent card={card} />
      </motion.div>
    );
  }

  return (
    <motion.div
      role="article"
      aria-label={`${card.title} \u2014 ${formatBillions(card.amountBillions)}. Swipez pour voter.`}
      className="absolute inset-0 rounded-3xl bg-card border border-primary/30 shadow-(--shadow-card) overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none will-change-transform"
      style={{ x, y: level >= 2 ? y : undefined, rotate }}
      drag={level >= 2 ? true : "x"}
      dragConstraints={level >= 2 ? { left: -200, right: 200, top: -200, bottom: 200 } : { left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => { didDrag.current = true; }}
      onDragEnd={(e, info) => { handleDragEnd(e, info); }}
      onTap={() => {
        if (!didDrag.current && onTap) onTap();
        didDrag.current = false;
      }}
      onPointerDown={() => { didDrag.current = false; }}
    >
      {/* Green tint (keep/left) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
        style={{ backgroundColor: greenTint }}
      />
      {/* Orange/Red tint (cut/right) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
        style={{ backgroundColor: redTint }}
      />
      {/* Blue tint (reinforce/up) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
          style={{ backgroundColor: blueTint }}
        />
      )}
      {/* Red tint (unjustified/down) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
          style={{ backgroundColor: redBottomTint }}
        />
      )}

      {/* KEEP stamp (swipe left) */}
      <motion.div
        className="absolute top-8 right-6 z-20 pointer-events-none"
        style={{ opacity: keepOpacity }}
      >
        <div className="border-4 border-primary bg-card/90 rounded-xl px-4 py-2 rotate-12">
          <span className="text-primary font-heading font-black text-2xl uppercase tracking-wider flex items-center gap-2">
            <ShieldIcon size={28} /> OK
          </span>
        </div>
      </motion.div>

      {/* CUT stamp (swipe right) */}
      <motion.div
        className="absolute top-8 left-6 z-20 pointer-events-none"
        style={{ opacity: cutOpacity }}
      >
        <div className={`border-4 bg-card/90 rounded-xl px-4 py-2 -rotate-12 ${level >= 2 ? "border-warning" : "border-danger"}`}>
          <span className={`font-heading font-black text-2xl uppercase tracking-wider flex items-center gap-2 ${level >= 2 ? "text-warning" : "text-danger"}`}>
            <ChainsawIcon size={28} variant={level >= 2 ? "orange" : "red"} /> {level >= 2 ? "Réduire" : "À revoir"}
          </span>
        </div>
      </motion.div>

      {/* REINFORCE stamp (swipe up) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ opacity: reinforceOpacity }}
        >
          <div className="border-4 border-info bg-card/90 rounded-xl px-4 py-2">
            <span className="text-info font-heading font-black text-xl uppercase tracking-wider flex items-center gap-2">
              <ReinforceIcon size={24} /> Renforcer
            </span>
          </div>
        </motion.div>
      )}

      {/* UNJUSTIFIED stamp (swipe down) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ opacity: unjustifiedOpacity }}
        >
          <div className="border-4 border-danger bg-card/90 rounded-xl px-4 py-2">
            <span className="text-danger font-heading font-black text-xl uppercase tracking-wider flex items-center gap-2">
              <StopIcon size={24} /> Injustifié
            </span>
          </div>
        </motion.div>
      )}

      <CardContent card={card} onTapDetail={onTap} />
    </motion.div>
  );
});

/** Inner card content */
function CardContent({
  card,
  onTapDetail,
}: {
  card: Card;
  onTapDetail?: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={catStyle(card.deckId)}>
      {/* Liseré de la couleur de la catégorie */}
      <div className="h-1.5 shrink-0" style={{ backgroundColor: "var(--cat)" }} aria-hidden="true" />

      <div className="flex flex-col flex-1 min-h-0 p-5 gap-4">
        {/* Catégorie (pastille colorée) + bouton détail */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CategoryBadge deckId={card.deckId} size={36} />
            <span className="kicker cat-text truncate">{getDeckName(card.deckId)}</span>
          </div>
          {onTapDetail && (
            <button
              onClick={(e) => { e.stopPropagation(); onTapDetail(); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Voir le détail de cette dépense"
              data-card-detail
              className="-my-1 -mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-foreground"
            >
              <span className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-lg font-bold leading-none transition-colors" aria-hidden="true">+</span>
            </button>
          )}
        </div>

        <h1 className="text-[1.625rem] font-extrabold leading-[1.15] text-foreground">
          {card.title}
        </h1>

        {/* Chiffres */}
        <div className="grid grid-cols-[1.25fr_1fr] gap-2">
          <div className="flex flex-col rounded-2xl bg-background/60 border border-border px-3 py-2.5">
            <span className="kicker text-[10px] text-muted-foreground">Coût annuel</span>
            <span className="numeral text-[1.75rem] leading-tight text-danger">
              {formatBillions(card.amountBillions)}
            </span>
          </div>
          <div className="flex flex-col rounded-2xl bg-background/60 border border-border px-3 py-2.5">
            <span className="kicker text-[10px] text-muted-foreground">Par habitant</span>
            <span className="numeral text-[1.75rem] leading-tight text-primary">
              {formatEuros(card.costPerCitizen)}
            </span>
          </div>
        </div>

        {/* Échelle masquée sur les écrans très bas : priorité au texte de la carte */}
        <AmountScale amountBillions={card.amountBillions} className="[@media(max-height:699px)]:hidden" />

        <AcronymText
          text={card.description}
          className="shrink-0 text-sm leading-relaxed text-muted-foreground line-clamp-3 [@media(min-height:700px)]:line-clamp-4 [@media(min-height:800px)]:line-clamp-6 [@media(min-height:960px)]:line-clamp-8"
        />

        {card.equivalence && (
          <div className="mt-auto flex items-center gap-3 rounded-2xl bg-warning/10 border border-warning/25 px-3 py-2.5">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-warning/15 text-warning flex items-center justify-center" aria-hidden="true">
              <UiIcon name="balance" size={20} />
            </span>
            <div className="min-w-0">
              <span className="kicker text-[10px] text-warning block mb-0.5">Équivalence</span>
              <AcronymText
                text={card.equivalence}
                className="text-sm font-semibold text-foreground leading-snug line-clamp-2 [@media(min-height:960px)]:line-clamp-3"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
