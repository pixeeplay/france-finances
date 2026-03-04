"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import type { Card, VoteDirection } from "@/types";

interface SwipeCardProps {
  card: Card;
  /** Is this the top (active) card? */
  isTop: boolean;
  onSwipe: (direction: VoteDirection) => void;
  onTap?: () => void;
}

export function SwipeCard({ card, isTop, onSwipe, onTap }: SwipeCardProps) {
  const didDrag = useRef(false);

  const {
    x,
    rotate,
    keepOpacity,
    cutOpacity,
    greenTint,
    redTint,
    handleDragEnd,
  } = useSwipeGesture({ onSwipe });

  // Back card styling
  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-[1.5rem] bg-card border border-border shadow-xl overflow-hidden"
        style={{ scale: 0.95, opacity: 0.7, y: 16 }}
      >
        <CardContent card={card} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-[1.5rem] bg-card border border-primary/30 shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => {
        didDrag.current = true;
      }}
      onDragEnd={(e, info) => {
        handleDragEnd(e, info);
      }}
      onTap={() => {
        // Only fire tap if we didn't just drag
        if (!didDrag.current && onTap) {
          onTap();
        }
        didDrag.current = false;
      }}
      onPointerDown={() => {
        didDrag.current = false;
      }}
    >
      {/* Green tint overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
        style={{ backgroundColor: greenTint }}
      />
      {/* Red tint overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none rounded-[1.5rem]"
        style={{ backgroundColor: redTint }}
      />

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
        <div className="border-4 border-danger rounded-lg px-4 py-2 -rotate-12">
          <span className="text-danger font-black text-2xl tracking-wider flex items-center gap-2">
            <ChainsawIcon size={28} /> À REVOIR
          </span>
        </div>
      </motion.div>

      <CardContent card={card} onTapDetail={onTap} />
    </motion.div>
  );
}

/** Inner card content — matches 2-SWIPE.html maquette */
function CardContent({
  card,
  onTapDetail,
}: {
  card: Card;
  onTapDetail?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Hero area with icon + gradient */}
      <div className="h-[140px] relative w-full overflow-hidden bg-gradient-to-br from-card via-background to-card shrink-0">
        {/* Large emoji background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="text-[90px]">{card.icon}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        {/* Category badge + detail button */}
        <div className="absolute top-3 left-4 right-4 flex justify-between items-start z-10">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {card.deckId}
          </span>
          {onTapDetail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTapDetail();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-card transition-colors border border-white/20 shadow-sm"
            >
              <span className="text-sm font-bold">+</span>
            </button>
          )}
        </div>

        {/* Title on image bottom */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h1 className="text-xl font-bold text-foreground leading-tight drop-shadow-md">
            {card.title}
          </h1>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 flex flex-col gap-3 flex-1 rounded-t-[1.5rem] -mt-3 bg-card relative z-20 overflow-y-auto">
        {/* Amount stats */}
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

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground font-medium">
          {card.description}
        </p>

        {/* Equivalence / Subtitle */}
        {card.subtitle && (
          <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 text-warning border border-warning/20">
              <span className="text-base">📊</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-warning uppercase tracking-wider mb-0.5">
                Équivalence
              </span>
              <p className="text-xs font-bold text-foreground/90 leading-snug">
                {card.subtitle}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
