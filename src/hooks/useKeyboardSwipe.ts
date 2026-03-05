"use client";

import { useEffect } from "react";
import type { VoteDirection } from "@/types";

interface UseKeyboardSwipeOptions {
  onVote: (direction: VoteDirection) => void;
  enabled: boolean;
  level?: 1 | 2 | 3;
}

/**
 * Keyboard navigation for swipe: Arrow keys to vote.
 * Level 1: Left (keep) / Right (cut)
 * Level 2+: Left (keep) / Right (cut) / Up (reinforce) / Down (unjustified)
 */
export function useKeyboardSwipe({ onVote, enabled, level = 1 }: UseKeyboardSwipeOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onVote("keep");
          break;
        case "ArrowRight":
          e.preventDefault();
          onVote("cut");
          break;
        case "ArrowUp":
          if (level >= 2) {
            e.preventDefault();
            onVote("reinforce");
          }
          break;
        case "ArrowDown":
          if (level >= 2) {
            e.preventDefault();
            onVote("unjustified");
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onVote, enabled, level]);
}
