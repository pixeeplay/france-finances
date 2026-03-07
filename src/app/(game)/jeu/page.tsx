"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import decksData from "@/data";
import { getPlayedDeckIds, getGlobalStats, getSessions } from "@/lib/stats";
import { track } from "@/lib/analytics";
import { useOnboarding, Onboarding } from "@/components/Onboarding";
import type { Deck } from "@/types";

function RandomIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 128 128" fill="currentColor">
      <path d="m31.648 40h-19.648c-2.209 0-4-1.791-4-4s1.791-4 4-4h19.648c9.021 0 17.541 4.383 22.785 11.725l4.651 6.511-4.916 6.882-6.245-8.743c-3.745-5.244-9.829-8.375-16.275-8.375zm87.18 49.172-16-16c-1.563-1.563-4.094-1.563-5.656 0s-1.563 4.094 0 5.656l9.172 9.172h-9.992c-6.445 0-12.529-3.131-16.275-8.375l-6.245-8.743-4.916 6.882 4.651 6.511c5.244 7.342 13.763 11.725 22.785 11.725h9.992l-9.172 9.172c-1.563 1.563-1.563 4.094 0 5.656.781.781 1.805 1.172 2.828 1.172s2.047-.391 2.828-1.172l16-16c1.563-1.562 1.563-4.094 0-5.656zm0-56-16-16c-1.563-1.563-4.094-1.563-5.656 0s-1.563 4.094 0 5.656l9.172 9.172h-9.992c-9.021 0-17.541 4.383-22.787 11.727l-25.639 35.896c-3.748 5.246-9.832 8.377-16.278 8.377h-19.648c-2.209 0-4 1.791-4 4s1.791 4 4 4h19.648c9.021 0 17.541-4.383 22.787-11.727l25.639-35.896c3.748-5.246 9.832-8.377 16.278-8.377h9.992l-9.172 9.172c-1.563 1.563-1.563 4.094 0 5.656.781.781 1.805 1.172 2.828 1.172s2.047-.391 2.828-1.172l16-16c1.563-1.562 1.563-4.094 0-5.656z" />
    </svg>
  );
}

function CardsIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={`${className ?? ""} shrink-0`} width={size} height={size} viewBox="0 0 512 320">
      <path d="m152 16-120 48 112 240 99.411-41.421z" fill="currentColor" opacity=".6" />
      <path d="m296 59.294v-51.294h-144v256h104z" fill="currentColor" opacity=".8" />
      <path d="m354.508 254.044 101.492-150.044-136-80-136 200 124.253 80.684" fill="currentColor" />
    </svg>
  );
}

const allDecks = decksData.decks as Deck[];
const mainDecks = allDecks.filter((d) => d.type !== "thematic");
const thematicDecks = allDecks.filter((d) => d.type === "thematic");

/** Number of distinct main categories needed to unlock thematic decks */
const THEMATIC_UNLOCK_CATEGORIES = 3;

const LEVEL_UNLOCK = {
  2: { sessions: 1, label: "1 session N1 complétée" },
  3: { sessions: 2, label: "2 sessions N2 complétées" },
} as const;

const BUDGET_TARGETS = [5, 10, 15, 20, 30] as const;

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showOnboarding, dismissOnboarding } = useOnboarding();
  const initialLevel = (Number(searchParams.get("level")) || 1) as 1 | 2 | 3;
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [randomMode, setRandomMode] = useState(false);
  const [playedDecks, setPlayedDecks] = useState<string[]>([]);
  const [sessionsPerDeck, setSessionsPerDeck] = useState<Record<string, number>>({});
  const [level, setLevel] = useState<1 | 2 | 3>(initialLevel);
  const [tooltip, setTooltip] = useState<2 | 3 | null>(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [n1Sessions, setN1Sessions] = useState(0);
  const [n2Sessions, setN2Sessions] = useState(0);
  const [budgetMode, setBudgetMode] = useState(false);
  const [budgetTarget, setBudgetTarget] = useState<number>(15);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showChevron, setShowChevron] = useState(false);

  useEffect(() => {
    const stats = getGlobalStats();
    const sessions = getSessions();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount
    setPlayedDecks(getPlayedDeckIds());
    setSessionsCount(stats.totalSessions);
    setSessionsPerDeck(stats.sessionsPerDeck ?? {});
    setN1Sessions(sessions.filter((s) => s.level === 1).length);
    setN2Sessions(sessions.filter((s) => s.level === 2).length);
  }, []);

  // Show chevron if content is scrollable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const scrollable = el.scrollHeight > el.clientHeight + 20;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
      setShowChevron(scrollable && !atBottom);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, []);

  const isLevel2Unlocked = n1Sessions >= LEVEL_UNLOCK[2].sessions || initialLevel >= 2;
  const isLevel3Unlocked = n2Sessions >= LEVEL_UNLOCK[3].sessions || initialLevel >= 3;

  const mainCategoriesPlayed = playedDecks.filter((id) =>
    mainDecks.some((d) => d.id === id)
  ).length;
  const thematicsUnlocked = mainCategoriesPlayed >= THEMATIC_UNLOCK_CATEGORIES;

  const levelOptions: { value: 1 | 2 | 3; label: string; locked: boolean; unlockHint: string; progress: string }[] = [
    { value: 1, label: "Niveau 1", locked: false, unlockHint: "", progress: "" },
    { value: 2, label: "Niveau 2", locked: !isLevel2Unlocked, unlockHint: LEVEL_UNLOCK[2].label, progress: `${Math.min(n1Sessions, LEVEL_UNLOCK[2].sessions)}/${LEVEL_UNLOCK[2].sessions}` },
    { value: 3, label: "Niveau 3", locked: !isLevel3Unlocked, unlockHint: LEVEL_UNLOCK[3].label, progress: `${Math.min(n2Sessions, LEVEL_UNLOCK[3].sessions)}/${LEVEL_UNLOCK[3].sessions}` },
  ];

  function handleLevelClick(opt: typeof levelOptions[number]) {
    if (opt.locked) {
      const val = opt.value as 2 | 3;
      setTooltip(tooltip === val ? null : val);
      return;
    }
    setTooltip(null);
    setLevel(opt.value);
  }

  function handleLaunch() {
    const deckId = randomMode ? "random" : selectedDeck;
    if (!deckId) return;
    track("deck_selected", { deckId, level, mode: budgetMode ? "budget" : "classic" });
    const params = new URLSearchParams();
    if (level > 1) params.set("level", String(level));
    if (budgetMode) {
      params.set("mode", "budget");
      params.set("target", String(budgetTarget));
    }
    const qs = params.toString();
    router.push(`/jeu/${deckId}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <AnimatePresence>
        {showOnboarding && <Onboarding onDone={dismissOnboarding} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card transition-colors text-muted-foreground"
        >
          <span className="text-xl">&larr;</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">
          Choisir une catégorie
        </h2>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide pb-36"
      >
        {/* Random Mode Toggle */}
        <div className="flex items-center gap-4 px-4 py-4 justify-between border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <RandomIcon size={22} />
            </div>
            <div className="flex flex-col">
              <p className="text-base font-semibold leading-tight">
                Mode aléatoire
              </p>
              <p className="text-xs text-muted-foreground">
                Toutes les catégories confondues
              </p>
            </div>
          </div>
          <label className="relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300"
            style={{ backgroundColor: randomMode ? "var(--primary)" : "var(--muted)" }}
          >
            <div
              className="h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300"
              style={{ transform: randomMode ? "translateX(1.5rem)" : "translateX(0)" }}
            />
            <input
              className="invisible absolute"
              type="checkbox"
              checked={randomMode}
              aria-label="Mode aléatoire"
              onChange={(e) => {
                setRandomMode(e.target.checked);
                if (e.target.checked) {
                  setSelectedDeck(null);
                  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
                }
              }}
            />
          </label>
        </div>

        {/* Budget Mode Toggle — N2+ only */}
        {isLevel2Unlocked && <div className="flex flex-col border-b border-border">
          <div className="flex items-center gap-4 px-4 py-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center text-warning shrink-0">
                <span className="text-lg" aria-hidden="true">&#127919;</span>
              </div>
              <div className="flex flex-col">
                <p className="text-base font-semibold leading-tight">
                  Mode Budget
                </p>
                <p className="text-xs text-muted-foreground">
                  Atteignez un objectif d&apos;économies
                </p>
              </div>
            </div>
            <label className="relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300"
              style={{ backgroundColor: budgetMode ? "var(--color-warning)" : "var(--muted)" }}
            >
              <div
                className="h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ transform: budgetMode ? "translateX(1.5rem)" : "translateX(0)" }}
              />
              <input
                className="invisible absolute"
                type="checkbox"
                checked={budgetMode}
                aria-label="Mode Budget"
                onChange={(e) => {
                  setBudgetMode(e.target.checked);
                  if (e.target.checked) {
                    setRandomMode(true);
                    setSelectedDeck(null);
                  }
                }}
              />
            </label>
          </div>
          {budgetMode && (
            <div className="px-4 pb-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Objectif : {budgetTarget} Md&euro; d&apos;économies
              </p>
              <div className="flex gap-2">
                {BUDGET_TARGETS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setBudgetTarget(t)}
                    aria-label={`Objectif ${t} milliards d'euros`}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                      budgetTarget === t
                        ? "bg-warning text-white"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>}

        {/* Level Selector */}
        <div className="px-4 py-4 relative">
          <div className="flex h-12 items-center justify-center rounded-xl bg-card p-1">
            {levelOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleLevelClick(opt)}
                onMouseEnter={() => opt.locked && setTooltip(opt.value as 2 | 3)}
                onMouseLeave={() => opt.locked && setTooltip(null)}
                className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
                  !opt.locked && level === opt.value
                    ? "bg-primary text-primary-foreground"
                    : opt.locked
                      ? "opacity-50 text-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-muted/50 cursor-pointer"
                }`}
              >
                <span className="flex items-center gap-1">
                  {opt.label}
                  {opt.locked && <><span className="text-xs" aria-hidden="true">&#128683;</span><span className="sr-only">verrouillé</span></>}
                </span>
              </button>
            ))}
          </div>
          {/* Tooltip */}
          {tooltip && (() => {
            const opt = levelOptions.find((o) => o.value === tooltip);
            if (!opt) return null;
            return (
              <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 z-20 pointer-events-none">
                <div className="bg-slate-900 border border-primary/40 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 text-center min-w-[200px]">
                  <p className="text-sm font-bold text-slate-100 mb-1">
                    <span aria-hidden="true">&#128683;</span> {opt.label} verrouillé
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    Déblocage : {opt.unlockHint}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (sessionsCount / LEVEL_UNLOCK[opt.value as 2 | 3].sessions) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary">{opt.progress}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Categories Grid */}
        <div className="px-4 pt-2 pb-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Catégories
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {mainDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              isSelected={selectedDeck === deck.id}
              isPlayed={playedDecks.includes(deck.id)}
              deckSessions={sessionsPerDeck[deck.id] ?? 0}
              onSelect={() => {
                setRandomMode(false);
                setTooltip(null);
                const newSelection = selectedDeck === deck.id ? null : deck.id;
                setSelectedDeck(newSelection);
                if (newSelection) {
                  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
                }
              }}
            />
          ))}
        </div>

        {/* Thematic Decks */}
        {thematicDecks.length > 0 && (
          <>
            <div className="px-4 pt-2 pb-1 flex items-center gap-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Thématiques
              </h3>
              <span className="text-[10px] font-bold text-warning bg-warning/15 px-2 py-0.5 rounded-full uppercase">
                Event
              </span>
              {!thematicsUnlocked && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  <span aria-hidden="true">&#128274;</span> <span className="sr-only">Verrouillé,</span>{mainCategoriesPlayed}/{THEMATIC_UNLOCK_CATEGORIES} catégories
                </span>
              )}
            </div>
            <div className={`grid grid-cols-2 gap-3 px-4 pb-4 ${!thematicsUnlocked ? "opacity-40 pointer-events-none" : ""}`}>
              {thematicDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isSelected={selectedDeck === deck.id}
                  isPlayed={playedDecks.includes(deck.id)}
                  deckSessions={sessionsPerDeck[deck.id] ?? 0}
                  onSelect={() => {
                    setRandomMode(false);
                    setTooltip(null);
                    const newSelection = selectedDeck === deck.id ? null : deck.id;
                    setSelectedDeck(newSelection);
                    if (newSelection) {
                      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
                    }
                  }}
                />
              ))}
            </div>
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll chevron indicator */}
      {showChevron && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce">
          <div className="w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg">
            <span className="text-muted-foreground text-sm">&darr;</span>
          </div>
        </div>
      )}

      {/* Bottom Action Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-10 z-30">
        <button
          onClick={handleLaunch}
          disabled={!selectedDeck && !randomMode}
          className="relative w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-xl shadow-(--shadow-glow-green) transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CardsIcon size={24} />
          {budgetMode ? `Lancer le défi (${budgetTarget} Md\u20AC)` : `Lancer la session ${level > 1 ? `(N${level})` : ""}`}
        </button>
      </div>
    </div>
  );
}

function DeckCard({
  deck,
  isSelected,
  isPlayed,
  deckSessions = 0,
  onSelect,
}: {
  deck: Deck;
  isSelected: boolean;
  isPlayed: boolean;
  deckSessions?: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`bg-card rounded-xl p-4 flex flex-col gap-3 text-left border-2 relative overflow-hidden group transition-all duration-200 ${
        isSelected
          ? "border-primary shadow-(--shadow-glow-green)"
          : "border-border hover:border-primary/50"
      }`}
      style={isSelected ? { transform: "scale(0.97)" } : undefined}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-primary">
          <span className="text-lg">&#10003;</span>
        </div>
      )}
      <div className="mb-1">
        {deck.image ? (
          <Image
            src={deck.image}
            alt={deck.name}
            width={40}
            height={40}
            className="w-10 h-10"
          />
        ) : (
          <span className="text-3xl">{deck.icon}</span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-sm leading-tight mb-1">{deck.name}</h3>
        <p className="text-xs text-muted-foreground">{deck.cardCount} cartes</p>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mt-auto">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(100, isPlayed ? Math.max(33, (deckSessions / 3) * 100) : (deckSessions / 3) * 100)}%` }}
        />
      </div>
    </button>
  );
}

function PlayPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
      <div className="flex items-center p-4 justify-between border-b border-border">
        <div className="w-10 h-10 rounded-full bg-card" />
        <div className="h-5 w-40 bg-card rounded" />
        <div className="w-10" />
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center gap-4 py-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-card" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-card rounded" />
            <div className="h-3 w-48 bg-card rounded" />
          </div>
          <div className="w-14 h-8 bg-card rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 h-28 border-2 border-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayPageSkeleton />}>
      <PlayPageContent />
    </Suspense>
  );
}
