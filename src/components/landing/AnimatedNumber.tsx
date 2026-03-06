"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  /** Replay interval in ms (0 = no replay) */
  replayInterval?: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function AnimatedNumber({
  value,
  suffix = "",
  className,
  replayInterval = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const animate = useCallback(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        if (ref.current) ref.current.textContent = `${formatNumber(value)}${suffix}`;
        clearInterval(timer);
      } else {
        if (ref.current) ref.current.textContent = `${formatNumber(Math.round(increment * step))}${suffix}`;
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, suffix]);

  // Initial animation on view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);  
      const cleanup = animate();
      return cleanup;
    }
  }, [isInView, hasAnimated, animate]);

  // Replay loop
  useEffect(() => {
    if (!hasAnimated || !replayInterval) return;
    const interval = setInterval(() => {
      if (ref.current) ref.current.textContent = `0${suffix}`;
      animate();
    }, replayInterval);
    return () => clearInterval(interval);
  }, [hasAnimated, replayInterval, animate, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
