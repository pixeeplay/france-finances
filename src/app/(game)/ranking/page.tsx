"use client";

import { useState, useEffect, useRef } from "react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { getGlobalStats, getPlayerProfile, getSessions, type GlobalStats, type PlayerProfile } from "@/lib/stats";
import { RadarChart } from "@/components/RadarChart";
import { computeRadarFromHistory } from "@/lib/radarData";
import { useCommunityStats, type CommunityStats } from "@/hooks/useCommunityStats";
import decksData from "@/data";
import archetypesJson from "@/data/archetypes.json";

type Tab = "archetypes" | "top" | "vitesse" | "semaine";

interface SpeedPlayer {
  rank: number;
  userId?: string;
  username: string;
  avgMsPerCard: number;
  totalSessions: number;
  totalCards: number;
  isCurrentPlayer?: boolean;
}

interface LeaderboardPlayer {
  rank: number;
  userId?: string;
  username: string;
  xp: number;
  archetypeId: string;
  archetypeName: string;
  level: number;
  isCurrentPlayer?: boolean;
}

// Archetype icon lookup from archetypes.json
const archetypeIcons: Record<string, string> = {};
for (const a of archetypesJson.archetypes) {
  archetypeIcons[a.id] = a.icon;
}

// Fallback mock data (shown when API unavailable and no real data)
const FALLBACK_DISTRIBUTION = [
  { icon: "⚖️", name: "Equilibristes", percent: 34, ids: ["equilibriste"] },
  { icon: "✂️", name: "Austenitaires", percent: 23, ids: ["austeritaire", "demolisseur", "liquidateur_en_chef", "tranchant"] },
  { icon: "🛡️", name: "Gardiens", percent: 18, ids: ["gardien", "conservateur", "investisseur_public", "protecteur"] },
  { icon: "🎯", name: "Chirurgiens", percent: 15, ids: ["chirurgien", "stratege", "reformateur", "optimisateur"] },
  { icon: "🔍", name: "Sceptiques", percent: 10, ids: ["sceptique", "auditeur_rigoureux", "speedrunner"] },
];

const FALLBACK_CUT = [
  { title: "Retraites fonctionnaires", percent: 78 },
  { title: "Subventions eolien", percent: 71 },
  { title: "Audiovisuel public", percent: 69 },
];

const FALLBACK_PROTECTED = [
  { title: "Hôpital public", percent: 89 },
  { title: "Éducation nationale", percent: 84 },
  { title: "Sécurité civile (pompiers)", percent: 82 },
];

// All cards for lookup by ID
const allCards = (decksData as { cards: { id: string; title: string; deckId: string }[] }).cards;

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>("archetypes");
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [leaderboardFallback, setLeaderboardFallback] = useState(true);
  const [speedBoard, setSpeedBoard] = useState<SpeedPlayer[]>([]);
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(null);
  const [myStats, setMyStats] = useState<GlobalStats | null>(null);
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
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background/90 backdrop-blur-md z-10 border-b border-border">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          Communaut&eacute;
        </h1>
      </header>

      {/* My profile vs community */}
      {myProfile && myStats && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 rounded-xl p-3 bg-primary/10 border border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-card border border-primary/20 flex items-center justify-center text-xl shrink-0">
              {myProfile.archetypeIcon || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary truncate">
                  {myProfile.username}
                </span>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  N{myProfile.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {myProfile.archetypeName || "Pas encore d'archetype"} · {myStats.xp.toLocaleString("fr-FR")} XP · {myStats.totalSessions} sessions
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-mono font-bold text-primary">
                #{myRank ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Rang</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex h-10 items-center justify-center rounded-lg bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 h-full flex items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors ${
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
            Stats communautaires anonymisees.
          </p>
        </div>
      </div>

      {/* Scroll chevron */}
      {showChevron && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce">
          <div className="w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg">
            <span className="text-muted-foreground text-sm">&darr;</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchetypesTab({
  playerArchetypeId,
  radarAxes,
  communityStats,
}: {
  playerArchetypeId?: string;
  radarAxes: { label: string; playerValue: number; communityValue: number }[];
  communityStats: CommunityStats;
}) {
  // Build distribution from real API data or use fallback
  const distribution = (() => {
    if (communityStats.isFallback || communityStats.archetypeDistribution.length === 0) {
      return FALLBACK_DISTRIBUTION;
    }

    // Group archetypes into families for display
    const families: { name: string; icon: string; ids: string[]; count: number }[] = [
      { name: "Equilibristes", icon: "⚖️", ids: ["equilibriste"], count: 0 },
      { name: "Coupeurs", icon: "✂️", ids: ["austeritaire", "demolisseur", "liquidateur_en_chef", "tranchant"], count: 0 },
      { name: "Gardiens", icon: "🛡️", ids: ["gardien", "conservateur", "investisseur_public", "protecteur"], count: 0 },
      { name: "Strateges", icon: "🎯", ids: ["chirurgien", "stratege", "reformateur", "optimisateur"], count: 0 },
      { name: "Analystes", icon: "🔍", ids: ["sceptique", "auditeur_rigoureux", "speedrunner"], count: 0 },
    ];

    for (const arch of communityStats.archetypeDistribution) {
      const family = families.find((f) => f.ids.includes(arch.archetypeId));
      if (family) {
        family.count += arch.count;
      } else {
        // Unknown archetype — add to closest match or create misc
        families[0].count += arch.count;
      }
    }

    const total = families.reduce((s, f) => s + f.count, 0);
    return families
      .filter((f) => f.count > 0)
      .map((f) => ({
        icon: f.icon,
        name: f.name,
        percent: total > 0 ? Math.round((f.count / total) * 100) : 0,
        ids: f.ids,
      }))
      .sort((a, b) => b.percent - a.percent);
  })();

  return (
    <div className="px-4 py-2 flex flex-col gap-6">
      {/* Data source indicator */}
      {!communityStats.isFallback && communityStats.totalSessions > 0 && (
        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Donnees reelles ({communityStats.totalSessions} sessions)
          </span>
        </div>
      )}

      {/* Radar: Tes choix vs la communaute */}
      {radarAxes.length >= 3 && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-bold">Tes choix vs la communaute</h2>
            <p className="text-sm text-muted-foreground mt-1">
              % de coupes par categorie
            </p>
          </div>
          <RadarChart axes={radarAxes} size={240} />
        </div>
      )}

      {/* Distribution */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-bold">Distribution de la communaute</h2>
          <p className="text-sm text-muted-foreground mt-1">
            L&apos;equilibre des forces budgetaires
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {distribution.map((a) => {
            const isPlayer = !!(playerArchetypeId && a.ids.includes(playerArchetypeId));
            return (
              <div key={a.name} className={`flex flex-col gap-1.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors ${isPlayer ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}>
                <div className="flex justify-between items-end text-sm font-medium">
                  <span>
                    {a.icon} {a.name}
                    {isPlayer && <span className="ml-2 text-[10px] font-bold text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">Toi</span>}
                  </span>
                  <span className="font-bold">{a.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-info rounded-full"
                    style={{ width: `${a.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TopXPTab({ players, isFallback }: { players: LeaderboardPlayer[]; isFallback: boolean }) {
  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      {!isFallback && players.length > 1 && (
        <div className="flex items-center justify-center mb-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Classement reel
          </span>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Aucun joueur classe pour l&apos;instant.</p>
          <p className="text-muted-foreground text-xs mt-1">Joue des sessions pour apparaitre ici !</p>
        </div>
      )}

      {players.map((player) => {
        const rank = player.rank;
        const isMe = player.isCurrentPlayer;
        const icon = archetypeIcons[player.archetypeId] ?? "🎮";

        return (
          <div
            key={player.userId ?? (isMe ? "current" : player.username)}
            className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
              isMe
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border"
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                rank === 1
                  ? "bg-yellow-500/20 text-yellow-500"
                  : rank === 2
                    ? "bg-muted text-muted-foreground"
                    : rank === 3
                      ? "bg-warning/20 text-warning"
                      : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {rank}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
              {icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold truncate ${isMe ? "text-primary" : ""}`}>
                  {isMe ? "Toi" : player.username}
                </span>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  N{player.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {player.archetypeName}
              </p>
            </div>

            {/* XP */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${isMe ? "text-primary" : ""}`}>
                {player.xp.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">XP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpeedTab({
  players,
  localSessions,
  localProfile,
}: {
  players: SpeedPlayer[];
  localSessions: { totalDurationMs: number; totalCards: number }[];
  localProfile: PlayerProfile | null;
}) {
  // Merge local player into speed board
  const merged: SpeedPlayer[] = (() => {
    // Compute local player speed from sessions with valid duration
    const validSessions = localSessions.filter((s) => s.totalDurationMs > 0 && s.totalCards > 0);
    if (validSessions.length < 3 && players.length > 0) {
      // Not enough sessions — show API list only with note
      return players.map((p, i) => ({ ...p, rank: i + 1 }));
    }

    if (validSessions.length >= 3) {
      const totalMs = validSessions.reduce((s, sess) => s + sess.totalDurationMs, 0);
      const totalCards = validSessions.reduce((s, sess) => s + sess.totalCards, 0);
      const avgMs = Math.round(totalMs / totalCards);

      const localPlayer: SpeedPlayer = {
        rank: 0,
        username: localProfile?.username || "Toi",
        avgMsPerCard: avgMs,
        totalSessions: validSessions.length,
        totalCards,
        isCurrentPlayer: true,
      };

      const all = [...players.filter((p) => !p.isCurrentPlayer), localPlayer]
        .sort((a, b) => a.avgMsPerCard - b.avgMsPerCard)
        .map((p, i) => ({ ...p, rank: i + 1 }));

      return all;
    }

    return players.map((p, i) => ({ ...p, rank: i + 1 }));
  })();

  const formatSpeed = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      {merged.length > 1 && (
        <div className="flex items-center justify-center mb-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Classement par vitesse (min. 3 sessions)
          </span>
        </div>
      )}

      {merged.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Aucun joueur classe pour l&apos;instant.</p>
          <p className="text-muted-foreground text-xs mt-1">Complete au moins 3 sessions pour apparaitre ici !</p>
        </div>
      )}

      {merged.map((player) => {
        const rank = player.rank;
        const isMe = player.isCurrentPlayer;

        return (
          <div
            key={player.userId ?? (isMe ? "speed-current" : player.username)}
            className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
              isMe
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border"
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                rank === 1
                  ? "bg-yellow-500/20 text-yellow-500"
                  : rank === 2
                    ? "bg-muted text-muted-foreground"
                    : rank === 3
                      ? "bg-warning/20 text-warning"
                      : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {rank}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
              {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : "⚡"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-bold truncate block ${isMe ? "text-primary" : ""}`}>
                {isMe ? "Toi" : player.username}
              </span>
              <p className="text-xs text-muted-foreground">
                {player.totalCards} cartes · {player.totalSessions} sessions
              </p>
            </div>

            {/* Speed */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-mono font-bold ${isMe ? "text-primary" : ""}`}>
                {formatSpeed(player.avgMsPerCard)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">/ carte</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TendancesTab({
  communityStats,
  allCards,
}: {
  communityStats: CommunityStats;
  allCards: { id: string; title: string }[];
}) {
  const cutItems = !communityStats.isFallback && communityStats.topCut.length > 0
    ? communityStats.topCut.map((c) => ({
        title: allCards.find((card) => card.id === c.cardId)?.title ?? c.cardId,
        percent: c.cutPercent ?? 0,
      }))
    : FALLBACK_CUT;

  const protectedItems = !communityStats.isFallback && communityStats.topProtected.length > 0
    ? communityStats.topProtected.map((c) => ({
        title: allCards.find((card) => card.id === c.cardId)?.title ?? c.cardId,
        percent: c.keepPercent ?? 0,
      }))
    : FALLBACK_PROTECTED;

  return (
    <div className="px-4 py-2 flex flex-col gap-6">
      {/* Data source indicator */}
      {!communityStats.isFallback && (
        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Donnees reelles ({communityStats.totalSessions} sessions)
          </span>
        </div>
      )}

      {/* Most cut */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChainsawIcon size={20} />
          <h3 className="text-lg font-bold">Depenses les plus coupees</h3>
        </div>
        <div className="flex flex-col gap-3">
          {cutItems.map((item, i) => (
            <div
              key={item.title}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border-l-4 border-l-danger border border-border"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0
                    ? "bg-yellow-500/20 text-yellow-500"
                    : i === 1
                      ? "bg-muted text-muted-foreground"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                <p className="text-xs text-danger font-medium">{item.percent}% &quot;a revoir&quot;</p>
              </div>
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most protected */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldIcon size={20} className="text-primary" />
          <h3 className="text-lg font-bold">Depenses les plus protegees</h3>
        </div>
        <div className="flex flex-col gap-3">
          {protectedItems.map((item, i) => (
            <div
              key={item.title}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border-l-4 border-l-primary border border-border"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0
                    ? "bg-yellow-500/20 text-yellow-500"
                    : i === 1
                      ? "bg-muted text-muted-foreground"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                <p className="text-xs text-primary font-medium">{item.percent}% &quot;OK&quot;</p>
              </div>
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
