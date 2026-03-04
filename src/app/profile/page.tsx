"use client";

import { useState, useEffect } from "react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import {
  getGlobalStats,
  getPlayerProfile,
  getSessions,
  type GlobalStats,
  type PlayerProfile,
  type StoredSession,
} from "@/lib/stats";

const tabs = ["Vue d'ensemble", "Mesures Détaillées", "Journal H.F."] as const;
type Tab = (typeof tabs)[number];

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  check: (stats: GlobalStats, sessions: StoredSession[]) => boolean;
  progress: (stats: GlobalStats, sessions: StoredSession[]) => number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_cut",
    icon: "chainsaw",
    title: "Première coupe",
    description: "Compléter une session avec au moins 1 coupe.",
    check: (s) => s.totalSessions > 0 && s.totalCutBillions > 0,
    progress: (s) => (s.totalCutBillions > 0 ? 100 : 0),
  },
  {
    id: "fifty_fifty",
    icon: "⚖️",
    title: "50/50",
    description: "Terminer une session avec exactement 50% keep / 50% cut.",
    check: (_, sessions) =>
      sessions.some(
        (s) => s.totalCards > 0 && s.keepCount === s.cutCount
      ),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const closest = sessions.reduce((best, s) => {
        if (s.totalCards === 0) return best;
        const ratio = Math.abs(s.keepCount / s.totalCards - 0.5);
        return ratio < best ? ratio : best;
      }, 1);
      return Math.round((1 - closest * 2) * 100);
    },
  },
  {
    id: "auditor",
    icon: "📋",
    title: "Auditeur",
    description: "Jouer 3 catégories différentes.",
    check: (s) => s.categoriesPlayed.length >= 3,
    progress: (s) => Math.min(100, Math.round((s.categoriesPlayed.length / 3) * 100)),
  },
  {
    id: "globe_trotter",
    icon: "🗺️",
    title: "Globe-trotter",
    description: "Explorer toutes les catégories (14 decks).",
    check: (s) => s.categoriesPlayed.length >= 14,
    progress: (s) => Math.round((s.categoriesPlayed.length / 14) * 100),
  },
  {
    id: "liquidator",
    icon: "💀",
    title: "Liquidateur",
    description: "Terminer une session avec 100% de coupes.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalCards > 0 && s.cutCount === s.totalCards),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const best = sessions.reduce(
        (max, s) =>
          s.totalCards > 0
            ? Math.max(max, s.cutCount / s.totalCards)
            : max,
        0
      );
      return Math.round(best * 100);
    },
  },
  {
    id: "guardian",
    icon: "🛡",
    title: "Gardien suprême",
    description: "Terminer une session avec 100% de garder.",
    check: (_, sessions) =>
      sessions.some((s) => s.totalCards > 0 && s.keepCount === s.totalCards),
    progress: (_, sessions) => {
      if (sessions.length === 0) return 0;
      const best = sessions.reduce(
        (max, s) =>
          s.totalCards > 0
            ? Math.max(max, s.keepCount / s.totalCards)
            : max,
        0
      );
      return Math.round(best * 100);
    },
  },
  {
    id: "faithful",
    icon: "🏅",
    title: "Fidèle",
    description: "Compléter 10 sessions.",
    check: (s) => s.totalSessions >= 10,
    progress: (s) => Math.min(100, Math.round((s.totalSessions / 10) * 100)),
  },
  {
    id: "centurion",
    icon: "💯",
    title: "Centurion",
    description: "Swiper 100 cartes au total.",
    check: (s) => s.totalCards >= 100,
    progress: (s) => Math.min(100, Math.round((s.totalCards / 100) * 100)),
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Vue d'ensemble");
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    setGlobalStats(getGlobalStats());
    setProfile(getPlayerProfile());
    setSessions(getSessions());
  }, []);

  const stats = globalStats ?? {
    xp: 0,
    totalSessions: 0,
    totalCards: 0,
    categoriesPlayed: [],
    auditsN3: 0,
    totalKeptBillions: 0,
    totalCutBillions: 0,
  };

  const playerLevel = Math.floor(stats.xp / 500) + 1;
  const xpInLevel = stats.xp % 500;
  const xpPercent = (xpInLevel / 500) * 100;
  const totalBudget = stats.totalKeptBillions + stats.totalCutBillions;
  const keptPercent =
    totalBudget > 0
      ? Math.round((stats.totalKeptBillions / totalBudget) * 100)
      : 0;
  const keptDashoffset =
    totalBudget > 0 ? 125 - (125 * keptPercent) / 100 : 125;

  const completedAchievements = ACHIEVEMENTS.filter((a) =>
    a.check(stats, sessions)
  );

  return (
    <>
      {/* Sticky Header */}
      <header className="pt-6 px-4 flex flex-col items-center border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="w-10 h-10" />
          <h1 className="text-xs font-black uppercase tracking-widest text-primary/80">
            Profil
          </h1>
          <div className="w-10 h-10" />
        </div>

        {/* Avatar + Username */}
        <div className="flex items-center gap-4 w-full mb-6 px-2">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-card border border-primary/20 flex items-center justify-center text-2xl">
              {profile?.archetypeIcon || "👤"}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1 rounded ring-2 ring-background">
              LVL {playerLevel}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold leading-tight">
              {profile?.username || "Username"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                ID: TRNC-2026-X
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-mono text-primary">
                Status: {stats.totalSessions > 0 ? "Opérationnel" : "Recrue"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-1 p-1 bg-card/50 rounded-lg mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-1 text-[10px] font-bold uppercase tracking-tight rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-6">
        {activeTab === "Vue d'ensemble" && (
          <section className="p-4 space-y-4">
            {/* XP + Archetype */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border p-3 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  XP Cumulée
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-bold text-primary">
                    {stats.xp.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">PTS</span>
                </div>
                <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
              <div className="bg-card border border-border p-3 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Archétype
                </p>
                <p className="text-sm font-bold text-foreground">
                  {profile?.archetypeName || "—"}
                </p>
                <p className="text-[10px] text-primary/60 font-medium">
                  Niveau {playerLevel}
                </p>
              </div>
            </div>

            {/* Impact & Mesures */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Impact &amp; Mesures
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  CYCLE ACTIF
                </span>
              </div>

              {/* Budget Tronçonné */}
              <div className="bg-card border border-danger/20 p-4 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-danger/70 uppercase">
                    Budget Tronçonné
                  </p>
                  <p className="text-2xl font-mono font-black text-danger">
                    {stats.totalCutBillions} Md€
                  </p>
                </div>
                <div className="w-16 h-12 flex items-end gap-[2px]">
                  <div className="flex-1 bg-danger/20 h-[40%] rounded-t-sm" />
                  <div className="flex-1 bg-danger/20 h-[60%] rounded-t-sm" />
                  <div className="flex-1 bg-danger/40 h-[85%] rounded-t-sm" />
                  <div className="flex-1 bg-danger h-[70%] rounded-t-sm" />
                  <div className="flex-1 bg-danger h-[95%] rounded-t-sm" />
                </div>
              </div>

              {/* Budget Préservé */}
              <div className="bg-card border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary/70 uppercase">
                    Budget Préservé
                  </p>
                  <p className="text-2xl font-mono font-black text-primary">
                    {stats.totalKeptBillions} Md€
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      className="text-muted"
                      cx="24"
                      cy="24"
                      fill="transparent"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      className="text-primary"
                      cx="24"
                      cy="24"
                      fill="transparent"
                      r="20"
                      stroke="currentColor"
                      strokeDasharray="125"
                      strokeDashoffset={keptDashoffset}
                      strokeWidth="4"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-bold">
                    {keptPercent}%
                  </span>
                </div>
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sessions", value: stats.totalSessions, icon: "🕐" },
                  { label: "Cartes Swipées", value: stats.totalCards, icon: "🃏" },
                  {
                    label: "Catégories",
                    value: String(stats.categoriesPlayed.length).padStart(2, "0"),
                    icon: "📊",
                  },
                  {
                    label: "Audits N3",
                    value: String(stats.auditsN3).padStart(2, "0"),
                    icon: "✅",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card/50 border border-border p-3 rounded-xl flex justify-between items-start"
                  >
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">
                        {stat.label}
                      </p>
                      <p className="text-lg font-mono font-bold">{stat.value}</p>
                    </div>
                    <span className="text-sm opacity-50">{stat.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal des Hauts Faits */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Journal des Hauts Faits
                </h3>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {completedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {ACHIEVEMENTS.map((a) => {
                  const completed = a.check(stats, sessions);
                  const prog = completed ? 100 : a.progress(stats, sessions);
                  return (
                    <div
                      key={a.id}
                      className={`p-3 flex items-center gap-4 ${
                        completed ? "bg-primary/5" : "opacity-40"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          completed ? "bg-primary/20" : "bg-muted grayscale"
                        }`}
                      >
                        {a.icon === "chainsaw" ? (
                          <ChainsawIcon size={24} />
                        ) : (
                          a.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold">{a.title}</h4>
                          {completed ? (
                            <span className="text-[8px] font-mono text-primary uppercase">
                              Complété
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              🔒
                            </span>
                          )}
                        </div>
                        {completed ? (
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            {a.description}
                          </p>
                        ) : (
                          <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-muted-foreground"
                              style={{ width: `${prog}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Mesures Détaillées" && (
          <section className="p-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                <span className="text-4xl">📊</span>
                <p className="text-muted-foreground text-sm">
                  Joue une session pour voir tes mesures.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                  Répartition par session
                </h3>
                {sessions
                  .slice()
                  .reverse()
                  .map((s) => {
                    const keepPct =
                      s.totalCards > 0
                        ? Math.round((s.keepCount / s.totalCards) * 100)
                        : 0;
                    return (
                      <div
                        key={s.id}
                        className="bg-card border border-border p-3 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold">
                            {s.deckId.charAt(0).toUpperCase() + s.deckId.slice(1)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(s.date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary rounded-full"
                            style={{ width: `${keepPct}%` }}
                          />
                          <div
                            className="bg-danger rounded-full"
                            style={{ width: `${100 - keepPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                          <span>
                            {s.keepCount} gardées · {s.cutCount} coupées
                          </span>
                          <span>{s.archetypeName}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}

        {activeTab === "Journal H.F." && (
          <section className="p-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                <span className="text-4xl">📜</span>
                <p className="text-muted-foreground text-sm">
                  Joue une session pour voir ton journal.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 mb-3">
                  Historique des sessions
                </h3>
                {sessions
                  .slice()
                  .reverse()
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        {s.archetypeId === "austenitaire"
                          ? "🪓"
                          : s.archetypeId === "gardien"
                            ? "🛡"
                            : s.archetypeId === "speedrunner"
                              ? "🔥"
                              : "⚖️"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold">
                            {s.archetypeName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(s.date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {s.totalCards} cartes · {s.deckId} ·{" "}
                          {Math.round(s.totalDurationMs / 1000)}s
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
