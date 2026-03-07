"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SPRING_SWIPE, SPRING_SNAP } from "@/lib/motion-constants";

/** Draggable slide-to-play button */
export function SlideToPlay() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(200);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setMaxDrag(containerRef.current.offsetWidth - 56 - 8);
    }
  }, []);

  const textOpacity = useTransform(x, [0, maxDrag * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxDrag], [0, 0.3]);

  const handleDragEnd = useCallback(() => {
    if (triggered) return;
    const currentX = x.get();
    if (currentX > maxDrag * 0.7) {
      setTriggered(true);
      animate(x, maxDrag, {
        ...SPRING_SWIPE,
        onComplete: () => router.push("/jeu"),
      });
    } else {
      animate(x, 0, SPRING_SNAP);
    }
  }, [x, maxDrag, triggered, router]);

  return (
    <div className="mt-auto w-full">
      <div
        ref={containerRef}
        className="relative h-16 w-full bg-background/60 rounded-2xl border border-border/30 flex items-center overflow-hidden"
      >
        {/* Green fill behind thumb */}
        <motion.div
          className="absolute inset-0 bg-primary rounded-2xl"
          style={{ opacity: bgOpacity }}
        />

        {/* Label */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-primary text-xs font-[900] uppercase tracking-[0.25em] pointer-events-none pl-12"
          style={{ opacity: textOpacity }}
        >
          Glisse pour jouer
        </motion.span>

        {/* Draggable thumb */}
        <motion.div
          className="relative left-1 w-14 h-[calc(100%-8px)] bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 cursor-grab active:cursor-grabbing z-10 touch-none"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0}
          onDragEnd={handleDragEnd}
        >
          <span className="text-primary-foreground font-black text-xl">
            &#8594;
          </span>
        </motion.div>
      </div>
    </div>
  );
}
