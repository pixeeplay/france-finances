"use client";

import { useMotionValue, useTransform, useReducedMotion, animate } from "framer-motion";
import { useCallback } from "react";
import type { VoteDirection } from "@/types";
import { SPRING_SWIPE, SPRING_SNAP } from "@/lib/motion-constants";

const SWIPE_THRESHOLD = 100;
const EXIT_DISTANCE = 500;
const MAX_ROTATION = 15;

interface UseSwipeGestureOptions {
  onSwipe: (direction: VoteDirection) => void;
  level?: 1 | 2 | 3;
}

/**
 * Logique de swipe. Niveau 1 : gauche/droite. Niveau 2+ : 4 directions.
 * Avec « réduire les animations » (prefers-reduced-motion), le relâchement ne
 * lance ni envol ni ressort : la carte part (ou revient) immédiatement.
 */
export function useSwipeGesture({ onSwipe, level = 1 }: UseSwipeGestureOptions) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const rotate = useTransform(x, [-300, 0, 300], [-MAX_ROTATION, 0, MAX_ROTATION]);

  // Horizontal stamps
  const keepOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20, 0], [1, 0, 0]);
  const cutOpacity = useTransform(x, [0, 20, SWIPE_THRESHOLD], [0, 0, 1]);

  // Vertical stamps (Level 2+)
  const reinforceOpacity = useTransform(y, [-SWIPE_THRESHOLD, -20, 0], [1, 0, 0]);
  const unjustifiedOpacity = useTransform(y, [0, 20, SWIPE_THRESHOLD], [0, 0, 1]);

  // Horizontal tints
  const greenTint = useTransform(
    x,
    [-SWIPE_THRESHOLD * 1.5, -20, 0],
    ["rgba(16,185,129,0.15)", "rgba(16,185,129,0)", "rgba(16,185,129,0)"]
  );
  const redTint = useTransform(
    x,
    [0, 20, SWIPE_THRESHOLD * 1.5],
    level >= 2
      ? ["rgba(249,115,22,0)", "rgba(249,115,22,0)", "rgba(249,115,22,0.15)"]
      : ["rgba(239,68,68,0)", "rgba(239,68,68,0)", "rgba(239,68,68,0.15)"]
  );

  // Vertical tints (Level 2+)
  const blueTint = useTransform(
    y,
    [-SWIPE_THRESHOLD * 1.5, -20, 0],
    ["rgba(59,130,246,0.15)", "rgba(59,130,246,0)", "rgba(59,130,246,0)"]
  );
  const redBottomTint = useTransform(
    y,
    [0, 20, SWIPE_THRESHOLD * 1.5],
    ["rgba(239,68,68,0)", "rgba(239,68,68,0)", "rgba(239,68,68,0.15)"]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      const absX = Math.abs(info.offset.x);
      const absY = Math.abs(info.offset.y);
      const isHorizontal = absX > absY * 1.2; // dead-zone diagonale

      if (level >= 2 && !isHorizontal && absY > SWIPE_THRESHOLD) {
        const direction: VoteDirection = info.offset.y < 0 ? "reinforce" : "unjustified";
        const exitY = info.offset.y < 0 ? -EXIT_DISTANCE : EXIT_DISTANCE;
        if (prefersReducedMotion) {
          y.set(exitY);
          onSwipe(direction);
          return;
        }
        animate(y, exitY, {
          ...SPRING_SWIPE,
          onComplete: () => onSwipe(direction),
        });
      } else if (isHorizontal && absX > SWIPE_THRESHOLD) {
        const direction: VoteDirection = info.offset.x < 0 ? "keep" : "cut";
        const exitX = info.offset.x < 0 ? -EXIT_DISTANCE : EXIT_DISTANCE;
        if (prefersReducedMotion) {
          x.set(exitX);
          onSwipe(direction);
          return;
        }
        animate(x, exitX, {
          ...SPRING_SWIPE,
          onComplete: () => onSwipe(direction),
        });
      } else if (prefersReducedMotion) {
        x.set(0);
        y.set(0);
      } else {
        animate(x, 0, SPRING_SNAP);
        if (level >= 2) animate(y, 0, SPRING_SNAP);
      }
    },
    [x, y, onSwipe, level, prefersReducedMotion]
  );

  return {
    x, y, rotate,
    keepOpacity, cutOpacity, reinforceOpacity, unjustifiedOpacity,
    greenTint, redTint, blueTint, redBottomTint,
    handleDragEnd, threshold: SWIPE_THRESHOLD, level,
  };
}
