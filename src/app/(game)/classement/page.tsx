"use client";

import { useState, useEffect, useRef } from "react";
import { getGlobalStats, getPlayerProfile, getSessions } from "@/lib/stats";
import { computeRadarFromHistory } from "@/lib/radarData";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import decksData from "@/data";
import {
  ArchetypesTab,
  TopXPTab,
  SpeedTab,
  TendancesTab,
  PlayerProfileCard,
  type LeaderboardPlayer,
  type SpeedPlayer,
} from "@/components/classement";

type Tab = "archetypes" | "top" | "vitesse" | "semaine";

// All cards for lookup by ID
const allCards = (decksData as { cards: { id: string; title: string; deckId: string }[] }).cards;

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>("archetypes");
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [leaderboardFallback, setLeaderboardFallback] = useState(true);
  const [speedBoard, setSpeedBoard] = useState<SpeedPlayer[]>([]);
  const [myProfile, setMyProfile] = useState<ReturnType<typeof getPlayerProfile> | null>(null);
  const [myStats, setMyStats] = useState<ReturnType<typeof getGlobalStats> | null>(null);
  const [radarAxes, setRadarAxes] = useState<{ label: string; playerValue: number; communityValue: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showChevron, setShowChevron] = useState(false);
  const communityStats = useCommunityStats();

  useEffect(() => {
    const profile = getPlayerProfile();
    const stats = getGlobalStats();
    const sessions = getSessions();
    setMyProfile(profile); // eslint-disable-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setMyStats(stats);

    // Build community averages from API data for radar
    const communityAverages: Record<string, number> | undefined =
      !communityStats.isFallback && communityStats.categoryStats.length > 0
        ? Object.fromEntries(
            communityStats.categoryStats.map((c) => [c.deckId, c.cutPercent])
          )
        : undefined;

    setRadarAxes(computeRadarFromHistory(sessions, communityAverages));
  }, [communityStats]);

  // Fetch real leaderboard
  useEffect(() => {
    let cancelled = false;

    fetch("/api/ranking")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json.players) return;
        setLeaderboard(json.players);
        setLeaderboardFallback(false);
      })
      .catch(() => {
        if (!cancelled) setLeaderboardFallback(true);
      });

    return () => { cancelled = true; };
  }, []);

  // Fetch speed leaderboard
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ranking/speed")
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        if (!cancelled && json?.players) setSpeedBoard(json.players);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Merge current player into leaderboard
  const players: LeaderboardPlayer[] = (() => {
    const profile = myProfile;
    const stats = myStats;
    if (!profile || !stats) return leaderboard;

    const currentPlayer: LeaderboardPlayer = {
      rank: 0,
      username: profile.username || "Toi",
      xp: stats.xp,
      archetypeId: profile.archetypeId || "equilibriste",
      archetypeName: profile.archetypeName || "Nouveau",
      level: profile.level || 1,
      isCurrentPlayer: true,
    };

    const merged = [...leaderboard.filter((p) => !p.isCurrentPlayer), currentPlayer]
      .sort((a, b) => b.xp - a.xp)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    return merged;
  })();

  const myRank = players.find((p) => p.isCurrentPlayer)?.rank;

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
  }, [tab]);

  const tabs: { value: Tab; label: string }[] = [
    { value: "archetypes", label: "Archetypes" },
    { value: "top", label: "Top XP" },
    { value: "vitesse", label: "Vitesse" },
    { value: "semaine", label: "Tendances" },
  ];

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background z-10 border-b border-border">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          Communaut&eacute;
        </h1>
      </header>

      {/* My profile vs community */}
      {myProfile && myStats && (
        <PlayerProfileCard profile={myProfile} stats={myStats} rank={myRank} />
      )}

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex h-10 items-center justify-center rounded-lg bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 h-full flex items-center justify-center rounded-xl px-2 text-sm font-semibold transition-colors ${
                tab === t.value
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {tab === "archetypes" && (
          <ArchetypesTab
            playerArchetypeId={myProfile?.archetypeId}
            radarAxes={radarAxes}
            communityStats={communityStats}
          />
        )}
        {tab === "top" && <TopXPTab players={players} isFallback={leaderboardFallback} />}
        {tab === "vitesse" && <SpeedTab players={speedBoard} localSessions={getSessions()} localProfile={myProfile} />}
        {tab === "semaine" && <TendancesTab communityStats={communityStats} allCards={allCards} />}

        {/* Footer */}
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Stats communautaires anonymisées.
          </p>
        </div>
      </div>

      {/* Scroll chevron */}
      {showChevron && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce">
          <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <span className="text-muted-foreground text-sm">&darr;</span>
          </div>
        </div>
      )}
    </main>
  );
}
