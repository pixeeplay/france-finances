"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import {
  getGlobalStats,
  getPlayerProfile,
  getSessions,
  updatePlayerAvatar,
  type GlobalStats,
  type PlayerProfile,
  type StoredSession,
} from "@/lib/stats";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";
import Image from "next/image";
import decksData from "@/data";
import type { Deck } from "@/types";

const decks = decksData.decks as Deck[];
const deckById = Object.fromEntries(decks.map((d) => [d.id, d]));

const tabs = ["Vue d'ensemble", "Mesures Détaillées", "Journal"] as const;
type Tab = (typeof tabs)[number];

const AVATAR_EMOJIS = [
  "\uD83D\uDC64", "\uD83E\uDD8A", "\uD83E\uDD85", "\uD83D\uDC3A", "\uD83E\uDD81",
  "\uD83D\uDC2F", "\uD83D\uDC3B", "\uD83E\uDD8C", "\uD83E\uDD88", "\uD83D\uDC09",
  "\uD83E\uDD89", "\uD83E\uDD87", "\uD83D\uDC0D", "\uD83E\uDD85", "\uD83D\uDC3C",
  "\uD83D\uDE80", "\u2694\uFE0F", "\uD83D\uDEE1\uFE0F", "\uD83C\uDFAF", "\uD83D\uDD25",
  "\u2702\uFE0F", "\uD83D\uDCCA", "\uD83D\uDCB0", "\uD83C\uDFF4\u200D\u2620\uFE0F",
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: authSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Vue d'ensemble");
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    setGlobalStats(getGlobalStats()); // eslint-disable-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setProfile(getPlayerProfile());  
    setSessions(getSessions());  
  }, []);

  const stats = globalStats ?? {
    xp: 0,
    totalSessions: 0,
    totalCards: 0,
    categoriesPlayed: [],
    sessionsPerDeck: {},
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

  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const completedIds = checkAchievements(stats, sessions);
  const generalAchievements = ACHIEVEMENTS.filter((a) => a.category !== "category");
  const categoryBadges = ACHIEVEMENTS.filter((a) => a.category === "category");
  const completedGeneral = generalAchievements.filter((a) => completedIds.includes(a.id));
  const completedCategory = categoryBadges.filter((a) => completedIds.includes(a.id));

  return (
    <>
      {/* Sticky Header — compact */}
      <header className="pt-4 px-4 flex flex-col border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        {/* Row 1: Avatar + Pseudo + Auth */}
        <div className="flex items-center gap-3 w-full mb-3">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-11 h-11 rounded-xl bg-card border border-primary/20 flex items-center justify-center text-xl hover:border-primary/50 transition-colors"
            >
              {authSession?.user?.image ? (
                <Image
                  src={authSession.user.image}
                  alt=""
                  width={44}
                  height={44}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                profile?.customAvatar || profile?.archetypeIcon || "\uD83D\uDC64"
              )}
            </button>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded ring-2 ring-background pointer-events-none">
              {playerLevel}
            </div>
            <div className="absolute -top-1 -left-1 bg-card border border-border text-[8px] w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
              &#9998;
            </div>
            {showAvatarPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl p-3 shadow-2xl w-56">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                  Choisis ton avatar
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVATAR_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        updatePlayerAvatar(emoji);
                        setProfile((p) => p ? { ...p, customAvatar: emoji } : p);
                        setShowAvatarPicker(false);
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-primary/20 flex items-center justify-center text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {authSession?.user?.image && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePlayerAvatar("");
                      setProfile((p) => p ? { ...p, customAvatar: "" } : p);
                      setShowAvatarPicker(false);
                    }}
                    className="mt-2 w-full text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Utiliser ma photo Google/GitHub
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold leading-tight truncate">
              {authSession?.user?.name || profile?.username || "Chargement..."}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary">
                {stats.totalSessions > 0 ? "Opérationnel" : "Recrue"}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {stats.xp.toLocaleString("fr-FR")} XP
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {authSession ? (
              <button
                onClick={() => signOut()}
                className="text-[10px] font-bold text-muted-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                Déconnexion
              </button>
            ) : (
              <div className="flex gap-1.5">
                {process.env.NEXT_PUBLIC_AUTH_GOOGLE && (
                  <button
                    onClick={() => signIn("google")}
                    className="flex items-center gap-1 text-[10px] font-bold text-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                )}
                {process.env.NEXT_PUBLIC_AUTH_GITHUB && (
                  <button
                    onClick={() => signIn("github")}
                    className="flex items-center gap-1 text-[10px] font-bold text-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-1 p-1 bg-card/50 rounded-lg mb-3">
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
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-6">
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
                    label: "Audits (Niveau 3)",
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

            {/* Category Badges */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Badges Catégories
                </h3>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {completedCategory.length} / {categoryBadges.length}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {categoryBadges.map((a) => {
                  const completed = completedIds.includes(a.id);
                  const prog = completed ? 100 : a.progress(stats, sessions);
                  const deckId = a.id.replace("badge_", "").replace("_", "-");
                  const deck = deckById[deckId];
                  return (
                    <div
                      key={a.id}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        completed
                          ? "bg-primary/10 border-primary/30"
                          : "bg-card border-border opacity-50"
                      }`}
                    >
                      {deck?.image ? (
                        <Image src={deck.image} alt={deck.name} width={32} height={32} className={completed ? "" : "grayscale"} />
                      ) : (
                        <span className="text-2xl">{a.icon}</span>
                      )}
                      <span className="text-[9px] font-bold text-center leading-tight">
                        {a.title.replace("Expert ", "")}
                      </span>
                      {!completed && (
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/50"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                      )}
                      {completed && (
                        <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center">
                          &#10003;
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Journal des Hauts Faits */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Journal des Hauts Faits
                </h3>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {completedGeneral.length} / {generalAchievements.length}
                </span>
              </div>

              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {generalAchievements.map((a) => {
                  const completed = completedIds.includes(a.id);
                  const prog = completed ? 100 : a.progress(stats, sessions);
                  const showTip = !completed && tooltipId === a.id;
                  return (
                    <div
                      key={a.id}
                      className={`relative p-3 flex items-center gap-4 ${
                        completed ? "bg-primary/5" : "opacity-40 cursor-pointer"
                      }`}
                      onClick={() => !completed && setTooltipId(showTip ? null : a.id)}
                      onMouseEnter={() => !completed && setTooltipId(a.id)}
                      onMouseLeave={() => !completed && setTooltipId(null)}
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
                              &#128274;
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
                      {showTip && (
                        <div className="absolute left-4 right-4 bottom-full mb-2 z-[100] bg-slate-900 border border-primary/40 rounded-xl p-3 shadow-2xl shadow-black/60 pointer-events-none">
                          <p className="text-sm text-slate-100 font-medium leading-snug">
                            {a.description}
                          </p>
                        </div>
                      )}
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

        {activeTab === "Journal" && (
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
                  .map((s) => {
                    const levelParam = s.level > 1 ? `?level=${s.level}` : "";
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          {s.archetypeId === "austeritaire"
                            ? "\u2702\uFE0F"
                            : s.archetypeId === "gardien"
                              ? "\uD83D\uDEE1"
                              : s.archetypeId === "speedrunner"
                                ? "\uD83D\uDD25"
                                : "\u2696\uFE0F"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="text-xs font-bold truncate">
                              {s.archetypeName}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {new Date(s.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {s.totalCards} cartes &middot; {s.deckId} &middot; N{s.level} &middot;{" "}
                            {Math.round(s.totalDurationMs / 1000)}s
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/jeu/${s.deckId}${levelParam}`)}
                          className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          Rejouer
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
