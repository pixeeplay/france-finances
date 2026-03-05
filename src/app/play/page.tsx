"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import decksData from "@/data/decks.json";
import { getPlayedDeckIds, getGlobalStats } from "@/lib/stats";
import { track } from "@/lib/analytics";
import type { Deck } from "@/types";

const allDecks = decksData.decks as Deck[];
const mainDecks = allDecks.filter((d) => d.type !== "thematic");
const thematicDecks = allDecks.filter((d) => d.type === "thematic");

const LEVEL_UNLOCK = {
  2: { sessions: 3, label: "3 sessions au Niveau 1" },
  3: { sessions: 5, label: "5 sessions au Niveau 2" },
} as const;

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLevel = (Number(searchParams.get("level")) || 1) as 1 | 2 | 3;
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [randomMode, setRandomMode] = useState(false);
  const [playedDecks, setPlayedDecks] = useState<string[]>([]);
  const [level, setLevel] = useState<1 | 2 | 3>(initialLevel);
  const [tooltip, setTooltip] = useState<2 | 3 | null>(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showChevron, setShowChevron] = useState(false);

  useEffect(() => {
    setPlayedDecks(getPlayedDeckIds());
    setSessionsCount(getGlobalStats().totalSessions);
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

  const isLevel2Unlocked = sessionsCount >= LEVEL_UNLOCK[2].sessions;
  const isLevel3Unlocked = sessionsCount >= LEVEL_UNLOCK[3].sessions;

  const levelOptions: { value: 1 | 2 | 3; label: string; locked: boolean; unlockHint: string }[] = [
    { value: 1, label: "Niveau 1", locked: false, unlockHint: "" },
    { value: 2, label: "Niveau 2", locked: !isLevel2Unlocked, unlockHint: LEVEL_UNLOCK[2].label },
    { value: 3, label: "Niveau 3", locked: !isLevel3Unlocked, unlockHint: LEVEL_UNLOCK[3].label },
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
    track("deck_selected", { deckId, level });
    const levelParam = level > 1 ? `?level=${level}` : "";
    router.push(`/play/${deckId}${levelParam}`);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
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
            <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-primary shrink-0">
              <span className="text-xl">&#128256;</span>
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
              onChange={(e) => {
                setRandomMode(e.target.checked);
                if (e.target.checked) setSelectedDeck(null);
              }}
            />
          </label>
        </div>

        {/* Level Selector */}
        <div className="px-4 py-4 relative">
          <div className="flex h-12 items-center justify-center rounded-xl bg-card p-1">
            {levelOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleLevelClick(opt)}
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
                  {opt.locked && <span className="text-xs">&#128274;</span>}
                </span>
              </button>
            ))}
          </div>
          {/* Tooltip */}
          {tooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 z-20">
              <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs text-muted-foreground whitespace-nowrap">
                <span className="text-warning font-bold">&#128274;</span>{" "}
                Déblocage : {levelOptions.find((o) => o.value === tooltip)?.unlockHint}
              </div>
            </div>
          )}
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
              onSelect={() => {
                setRandomMode(false);
                setTooltip(null);
                setSelectedDeck(selectedDeck === deck.id ? null : deck.id);
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
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {thematicDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isSelected={selectedDeck === deck.id}
                  isPlayed={playedDecks.includes(deck.id)}
                  onSelect={() => {
                    setRandomMode(false);
                    setTooltip(null);
                    setSelectedDeck(selectedDeck === deck.id ? null : deck.id);
                  }}
                />
              ))}
            </div>
          </>
        )}
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
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 z-20">
        <button
          onClick={handleLaunch}
          disabled={!selectedDeck && !randomMode}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-xl">&#9654;</span>
          Lancer la session {level > 1 ? `(N${level})` : ""}
        </button>
      </div>
    </div>
  );
}

function DeckCard({
  deck,
  isSelected,
  isPlayed,
  onSelect,
}: {
  deck: Deck;
  isSelected: boolean;
  isPlayed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`bg-card rounded-xl p-4 flex flex-col gap-3 text-left border-2 relative overflow-hidden group transition-all duration-200 ${
        isSelected
          ? "border-primary shadow-[0_0_12px_rgba(16,185,129,0.3)]"
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
          style={{ width: isPlayed ? "100%" : "0%" }}
        />
      </div>
    </button>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Chargement...</div>}>
      <PlayPageContent />
    </Suspense>
  );
}
