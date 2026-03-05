"use client";

import { useState, useEffect, useRef } from "react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import leaderboardData from "@/data/leaderboard.json";
import { getGlobalStats, getPlayerProfile } from "@/lib/stats";

type Tab = "archetypes" | "top" | "semaine";

interface LeaderboardPlayer {
  id: string;
  username: string;
  xp: number;
  archetypeId: string;
  archetypeName: string;
  archetypeIcon: string;
  level: number;
  isCurrentPlayer?: boolean;
}

// Fake community distribution
const archetypeDistribution = [
  { icon: "⚖️", name: "Équilibristes", percent: 34, color: "bg-info" },
  { icon: "🪚", name: "Austéritaires", percent: 23, color: "bg-info" },
  { icon: "🛡️", name: "Gardiens", percent: 18, color: "bg-primary" },
  { icon: "🎯", name: "Chirurgiens", percent: 15, color: "bg-danger" },
  { icon: "📈", name: "Investisseurs", percent: 10, color: "bg-warning" },
];

// Fake most cut/protected
const mostCut = [
  { title: "Retraites fonctionnaires", percent: 78 },
  { title: "Subventions éolien", percent: 71 },
  { title: "Audiovisuel public", percent: 69 },
];

const mostProtected = [
  { title: "Hôpital public", percent: 89 },
  { title: "Éducation nationale", percent: 84 },
  { title: "Sécurité civile (pompiers)", percent: 82 },
];

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>("archetypes");
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showChevron, setShowChevron] = useState(false);

  useEffect(() => {
    const profile = getPlayerProfile();
    const stats = getGlobalStats();

    const currentPlayer: LeaderboardPlayer = {
      id: "current",
      username: profile.username || "Toi",
      xp: stats.xp,
      archetypeId: profile.archetypeId || "equilibriste",
      archetypeName: profile.archetypeName || "Nouveau",
      archetypeIcon: profile.archetypeIcon || "🎮",
      level: profile.level || 1,
      isCurrentPlayer: true,
    };

    const allPlayers = [...leaderboardData.players, currentPlayer]
      .sort((a, b) => b.xp - a.xp)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    setPlayers(allPlayers);
  }, []);

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
    { value: "archetypes", label: "Archétypes" },
    { value: "top", label: "Top XP" },
    { value: "semaine", label: "Tendances" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-center bg-background/90 backdrop-blur-md z-10 border-b border-border">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          Classement & Tendances
        </h1>
      </header>

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
        {tab === "archetypes" && <ArchetypesTab />}
        {tab === "top" && <TopXPTab players={players} />}
        {tab === "semaine" && <TendancesTab />}

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
          <div className="w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg">
            <span className="text-muted-foreground text-sm">&darr;</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchetypesTab() {
  return (
    <div className="px-4 py-2 flex flex-col gap-6">
      {/* Distribution */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-bold">Distribution de la communauté</h2>
          <p className="text-sm text-muted-foreground mt-1">
            L&apos;équilibre des forces budgétaires
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {archetypeDistribution.map((a) => (
            <div key={a.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end text-sm font-medium">
                <span>{a.icon} {a.name}</span>
                <span className="font-bold">{a.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${a.color} rounded-full`}
                  style={{ width: `${a.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopXPTab({ players }: { players: LeaderboardPlayer[] }) {
  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      {players.map((player, index) => {
        const rank = index + 1;
        const isMe = player.isCurrentPlayer;

        return (
          <div
            key={player.id}
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

            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
              {player.archetypeIcon}
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

function TendancesTab() {
  return (
    <div className="px-4 py-2 flex flex-col gap-6">
      {/* Most cut */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChainsawIcon size={20} />
          <h3 className="text-lg font-bold">Dépenses les plus coupées</h3>
        </div>
        <div className="flex flex-col gap-3">
          {mostCut.map((item, i) => (
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
                <p className="text-xs text-danger font-medium">{item.percent}% &quot;à revoir&quot;</p>
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
          <h3 className="text-lg font-bold">Dépenses les plus protégées</h3>
        </div>
        <div className="flex flex-col gap-3">
          {mostProtected.map((item, i) => (
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
