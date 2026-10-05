import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { VoteDirection } from "@/types";

// Track animate calls
const animateMock = vi.fn((_mv, _target, opts?: { onComplete?: () => void }) => {
  // Immediately invoke onComplete to simulate animation finishing
  opts?.onComplete?.();
  return { stop: vi.fn() };
});

// prefers-reduced-motion simule, et appels a .set() des motion values
const motionState = vi.hoisted(() => ({
  reducedMotion: false as boolean | null,
  setCalls: [] as number[],
}));

// Mock framer-motion
vi.mock("framer-motion", () => {
  return {
    useReducedMotion: () => motionState.reducedMotion,
    useMotionValue: (initial: number) => {
      return {
        get: () => initial,
        set: (v: number) => {
          motionState.setCalls.push(v);
        },
        onChange: vi.fn(() => vi.fn()),
        destroy: vi.fn(),
        _value: initial,
      };
    },
    useTransform: (_mv: unknown, _inputRange: number[], outputRange: unknown[]) => ({
      get: () => outputRange[1], // return middle value
      set: vi.fn(),
      onChange: vi.fn(() => vi.fn()),
      destroy: vi.fn(),
    }),
    animate: animateMock,
  };
});

describe("useSwipeGesture", () => {
  let useSwipeGesture: typeof import("@/hooks/useSwipeGesture").useSwipeGesture;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    motionState.reducedMotion = false;
    motionState.setCalls = [];
    const mod = await import("@/hooks/useSwipeGesture");
    useSwipeGesture = mod.useSwipeGesture;
  });

  describe("swipe thresholds", () => {
    it("does not trigger onSwipe for small horizontal drags", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      // Simulate drag end with small offset (below 100px threshold)
      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 50, y: 0 } });
      });

      expect(onSwipe).not.toHaveBeenCalled();
      // Should animate back to 0 (snap back)
      expect(animateMock).toHaveBeenCalledWith(
        expect.anything(),
        0,
        expect.objectContaining({ type: "spring" })
      );
    });

    it("does not trigger onSwipe for small vertical drags at level 2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 0, y: 50 } });
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("triggers keep for left swipe exceeding threshold", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: -150, y: 0 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("keep");
    });

    it("triggers cut for right swipe exceeding threshold", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 150, y: 0 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("cut");
    });

    it("triggers exit animation to 500px distance on valid swipe", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: -150, y: 0 } });
      });

      expect(animateMock).toHaveBeenCalledWith(
        expect.anything(),
        -500, // EXIT_DISTANCE
        expect.objectContaining({
          type: "spring",
          stiffness: 300,
          damping: 30,
        })
      );
    });
  });

  describe("4-direction logic for level 2", () => {
    it("triggers reinforce for upward swipe at level 2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        // Vertical swipe: absY > absX * 1.2 (not horizontal)
        result.current.handleDragEnd(null, { offset: { x: 10, y: -150 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("reinforce");
    });

    it("triggers unjustified for downward swipe at level 2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 10, y: 150 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("unjustified");
    });

    it("ignores vertical swipes at level 1", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 10, y: -150 } });
      });

      // At level 1, vertical is not horizontal, and vertical logic requires level >= 2
      // So it snaps back
      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("still handles horizontal swipes at level 2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        // Clearly horizontal: absX > absY * 1.2
        result.current.handleDragEnd(null, { offset: { x: -200, y: 10 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("keep");
    });
  });

  describe("diagonal swipe handling", () => {
    it("treats diagonal as horizontal when absX > absY * 1.2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      // absX=150, absY=100 -> 150 > 100 * 1.2 (120) -> horizontal
      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 150, y: -100 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("cut");
    });

    it("treats diagonal as vertical when absX <= absY * 1.2", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      // absX=100, absY=150 -> 100 > 150 * 1.2 (180)? NO -> not horizontal
      // Then check vertical: level >= 2 && !isHorizontal && absY > 100 -> yes
      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 100, y: -150 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("reinforce");
    });

    it("snaps back for ambiguous diagonal below thresholds", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      // Both below threshold (100)
      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 60, y: -60 } });
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("snaps back at level 1 for diagonal that is not clearly horizontal", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      // absX=100, absY=150 -> not horizontal (100 <= 180)
      // Not level 2+ vertical either
      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 100, y: -150 } });
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });
  });

  describe("returned values", () => {
    it("returns threshold and level", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      expect(result.current.threshold).toBe(100);
      expect(result.current.level).toBe(2);
    });

    it("defaults to level 1", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe }));

      expect(result.current.level).toBe(1);
    });

    it("returns motion values and opacity transforms", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      expect(result.current.x).toBeDefined();
      expect(result.current.y).toBeDefined();
      expect(result.current.rotate).toBeDefined();
      expect(result.current.keepOpacity).toBeDefined();
      expect(result.current.cutOpacity).toBeDefined();
      expect(result.current.reinforceOpacity).toBeDefined();
      expect(result.current.unjustifiedOpacity).toBeDefined();
      expect(result.current.greenTint).toBeDefined();
      expect(result.current.redTint).toBeDefined();
      expect(result.current.blueTint).toBeDefined();
      expect(result.current.redBottomTint).toBeDefined();
    });
  });
  describe("prefers-reduced-motion au relachement", () => {
    beforeEach(() => {
      motionState.reducedMotion = true;
    });

    it("vote immediatement sans animation d'envol (horizontal)", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: -150, y: 0 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("keep");
      expect(animateMock).not.toHaveBeenCalled();
      expect(motionState.setCalls).toContain(-500);
    });

    it("vote immediatement sans animation d'envol (vertical, niveau 2)", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 0, y: 150 } });
      });

      expect(onSwipe).toHaveBeenCalledWith("unjustified");
      expect(animateMock).not.toHaveBeenCalled();
      expect(motionState.setCalls).toContain(500);
    });

    it("revient au centre sans ressort sous le seuil", () => {
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 2 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 40, y: 30 } });
      });

      expect(onSwipe).not.toHaveBeenCalled();
      expect(animateMock).not.toHaveBeenCalled();
      expect(motionState.setCalls).toEqual([0, 0]);
    });

    it("garde l'animation quand la preference est inconnue (null)", () => {
      motionState.reducedMotion = null;
      const onSwipe = vi.fn();
      const { result } = renderHook(() => useSwipeGesture({ onSwipe, level: 1 }));

      act(() => {
        result.current.handleDragEnd(null, { offset: { x: 150, y: 0 } });
      });

      expect(animateMock).toHaveBeenCalledWith(
        expect.anything(),
        500,
        expect.objectContaining({ type: "spring" })
      );
      expect(onSwipe).toHaveBeenCalledWith("cut");
    });
  });
});
