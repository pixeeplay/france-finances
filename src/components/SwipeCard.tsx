"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
// TODO PERF-08: framer-motion v12+ supports `import { m } from "framer-motion/m"`
// for a smaller, tree-shakeable motion component (~30% smaller). Also consider
// `import { LazyMotion, domAnimation } from "framer-motion"` for deferred feature loading.
// Not switching now to avoid breaking drag/animate/AnimatePresence interactions.
import { motion, animate as fmAnimate, useReducedMotion } from "framer-motion";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { AcronymText } from "./AcronymText";
import type { Card, VoteDirection } from "@/types";

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
      const springConfig = prefersReducedMotion
        ? { type: "tween" as const, duration: 0 }
        : { type: "spring" as const, stiffness: 300, damping: 30 };
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
        className="absolute inset-0 rounded-[1.5rem] bg-card border border-border shadow-xl overflow-hidden"
        style={{ scale: 0.95, opacity: 0.7, y: 16 }}
        aria-hidden="true"
      >
        <CardContent card={card} />
      </motion.div>
    );
  }

  return (
    <motion.div
      role="article"
      aria-label={`${card.title} \u2014 ${card.amountBillions} Md\u20AC. Swipez pour voter.`}
      className="absolute inset-0 rounded-[1.5rem] bg-card border border-primary/30 shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none will-change-transform"
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
        className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
        style={{ backgroundColor: greenTint }}
      />
      {/* Orange/Red tint (cut/right) */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
        style={{ backgroundColor: redTint }}
      />
      {/* Blue tint (reinforce/up) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
          style={{ backgroundColor: blueTint }}
        />
      )}
      {/* Red tint (unjustified/down) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
          style={{ backgroundColor: redBottomTint }}
        />
      )}

      {/* KEEP stamp (swipe left) */}
      <motion.div
        className="absolute top-8 right-6 z-20 pointer-events-none"
        style={{ opacity: keepOpacity }}
      >
        <div className="border-4 border-primary rounded-lg px-4 py-2 rotate-12">
          <span className="text-primary font-black text-2xl tracking-wider flex items-center gap-2">
            <ShieldIcon size={28} /> OK
          </span>
        </div>
      </motion.div>

      {/* CUT stamp (swipe right) */}
      <motion.div
        className="absolute top-8 left-6 z-20 pointer-events-none"
        style={{ opacity: cutOpacity }}
      >
        <div className={`border-4 rounded-lg px-4 py-2 -rotate-12 ${level >= 2 ? "border-warning" : "border-danger"}`}>
          <span className={`font-black text-2xl tracking-wider flex items-center gap-2 ${level >= 2 ? "text-warning" : "text-danger"}`}>
            <ChainsawIcon size={28} /> {level >= 2 ? "RÉDUIRE" : "À REVOIR"}
          </span>
        </div>
      </motion.div>

      {/* REINFORCE stamp (swipe up) — Level 2+ */}
      {level >= 2 && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ opacity: reinforceOpacity }}
        >
          <div className="border-4 border-info rounded-lg px-4 py-2">
            <span className="text-info font-black text-xl tracking-wider flex items-center gap-2">
              📈 RENFORCER
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
          <div className="border-4 border-danger rounded-lg px-4 py-2">
            <span className="text-danger font-black text-xl tracking-wider flex items-center gap-2">
              ❌ INJUSTIFIÉ
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
    <div className="flex flex-col h-full">
      <div className="h-[140px] relative w-full overflow-hidden bg-gradient-to-br from-card via-background to-card shrink-0">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="text-[90px]">{card.icon}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        <div className="absolute top-3 left-4 right-4 flex justify-between items-start z-10">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {card.deckId}
          </span>
          {onTapDetail && (
            <button
              onClick={(e) => { e.stopPropagation(); onTapDetail(); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Voir le détail de cette dépense"
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-card transition-colors border border-white/20 shadow-sm"
            >
              <span className="text-sm font-bold">+</span>
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h1 className="text-xl font-bold text-foreground leading-tight drop-shadow-md">
            {card.title}
          </h1>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1 rounded-t-[1.5rem] -mt-3 bg-card relative z-20 overflow-hidden">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/50 p-2.5 rounded-xl flex flex-col justify-center border border-border">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              Coût Annuel
            </span>
            <span className="text-xl font-black text-primary">
              {card.amountBillions} Md€
            </span>
          </div>
          <div className="bg-background/50 p-2.5 rounded-xl flex flex-col justify-center border border-border">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              Par Citoyen
            </span>
            <span className="text-xl font-black text-primary">
              {card.costPerCitizen}€
            </span>
          </div>
        </div>

        <AcronymText
          text={card.description}
          className="text-sm leading-relaxed text-muted-foreground font-medium line-clamp-8 sm:line-clamp-5 lg:line-clamp-none"
        />

        {card.equivalence && (
          <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 text-warning border border-warning/20">
              <span className="text-base" aria-hidden="true">📊</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-warning uppercase tracking-wider mb-0.5">
                Équivalence
              </span>
              <AcronymText
                text={card.equivalence}
                className="text-xs font-bold text-foreground/90 leading-snug line-clamp-2 lg:line-clamp-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
