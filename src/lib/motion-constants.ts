/**
 * Shared framer-motion animation presets.
 * Only values used 3+ times across the codebase are extracted here.
 */

/** Standard spring for swipe exits, slide transitions, and drag completions */
export const SPRING_SWIPE = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/** Stiffer spring for snap-back (cancelled swipe / drag reset) */
export const SPRING_SNAP = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

/** Instant (no animation) for reduced-motion users */
export const TWEEN_INSTANT = {
  type: "tween" as const,
  duration: 0,
};
