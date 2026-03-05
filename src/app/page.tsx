"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { Onboarding, useOnboarding } from "@/components/Onboarding";
import { getGlobalStats } from "@/lib/stats";
import decksData from "@/data/decks.json";
import type { Deck } from "@/types";

const decks = (decksData.decks as Deck[]).filter((d) => d.type !== "thematic");

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showOnboarding, dismissOnboarding } = useOnboarding();
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    setSessionCount(getGlobalStats().totalSessions);
  }, []);

  // Auto-scroll categories
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let scrollPos = 0;
    const speed = 0.3; // px per frame
    let paused = false;
    let pauseTimeout: ReturnType<typeof setTimeout>;

    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        scrollPos += speed;
        if (scrollPos >= el.scrollWidth - el.clientWidth) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      }
      animId = requestAnimationFrame(step);
    };

    const handleTouch = () => {
      paused = true;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        scrollPos = el.scrollLeft;
        paused = false;
      }, 3000);
    };

    el.addEventListener("touchstart", handleTouch, { passive: true });
    el.addEventListener("pointerdown", handleTouch);
    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(pauseTimeout);
      el.removeEventListener("touchstart", handleTouch);
      el.removeEventListener("pointerdown", handleTouch);
    };
  }, []);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onDone={dismissOnboarding} />}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between z-20">
        <span className="text-xs font-black tracking-[0.2em] text-foreground uppercase opacity-90">
          la tronçonneuse de poche
        </span>
        {sessionCount > 0 && (
          <div className="flex items-center gap-1 bg-card/50 px-3 py-1 rounded-full border border-border/30">
            <span className="text-primary text-sm">&#9889;</span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {sessionCount} {sessionCount === 1 ? "SESSION" : "SESSIONS"}
            </span>
          </div>
        )}
      </header>

      {/* Category chips — auto-scroll + swipeable */}
      <div className="px-6 mb-6">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6"
        >
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/play/${deck.id}`}
              className="bg-card/70 backdrop-blur text-muted-foreground px-5 py-2 rounded-full flex items-center gap-2 shrink-0 border border-border/30"
            >
              <span className="text-sm">{deck.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {deck.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Launcher card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="launcher-card w-full aspect-[4/5] max-h-[500px] rounded-[40px] border border-border/30 p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10" />

          {/* Timer hint */}
          <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
            <span className="text-xs">&#9201;</span>
            <span className="text-[10px] font-bold uppercase">~3 min</span>
          </div>

          {/* Chainsaw icon */}
          <div className="w-20 h-20 bg-card/80 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-border/30">
            <ChainsawIcon size={48} />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-[900] text-foreground leading-tight mb-3 uppercase tracking-tight">
            Prêt à trancher ?
          </h2>
          <p className="text-muted-foreground text-sm font-medium mb-12 max-w-[200px]">
            230 cartes, 17 catégories. Swipe pour trancher le budget.
          </p>

          {/* Slide to play CTA */}
          <SlideToPlay />
        </div>

        {/* Stats */}
        <div className="mt-8 flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex flex-col items-center gap-1">
            <span className="text-foreground">12 847</span>
            <span>Sessions</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-foreground">154K+</span>
            <span>Swipes</span>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Draggable slide-to-play button */
function SlideToPlay() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(200);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      // track width = container width - thumb width (56px) - padding (8px)
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
        type: "spring",
        stiffness: 300,
        damping: 30,
        onComplete: () => router.push("/play"),
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
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
