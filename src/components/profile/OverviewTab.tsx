import type { GlobalStats, StoredSession, PlayerProfile } from "@/lib/stats";
import type { Achievement } from "@/lib/achievements";
import type { Deck } from "@/types";
import { CategoryBadgesGrid } from "./CategoryBadgesGrid";
import { AchievementsList } from "./AchievementsList";

interface OverviewTabProps {
  stats: GlobalStats;
  profile: PlayerProfile | null;
  playerLevel: number;
  xpPercent: number;
  keptPercent: number;
  keptDashoffset: number;
  sessions: StoredSession[];
  completedIds: string[];
  generalAchievements: Achievement[];
  categoryBadges: Achievement[];
  deckById: Record<string, Deck>;
}

export function OverviewTab({
  stats,
  profile,
  playerLevel,
  xpPercent,
  keptPercent,
  keptDashoffset,
  sessions,
  completedIds,
  generalAchievements,
  categoryBadges,
  deckById,
}: OverviewTabProps) {
  return (
    <section className="p-4 space-y-4">
      {/* XP + Archetype */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border p-3 rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
            XP Cumulée
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl numeral text-primary">
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
          <span className="text-[10px] tabular-nums text-muted-foreground">
            CYCLE ACTIF
          </span>
        </div>

        {/* Budget Tronçonné */}
        <div className="bg-card border border-danger/20 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-danger/70 uppercase">
              Budget Tronçonné
            </p>
            <p className="text-2xl numeral text-danger">
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
            <p className="text-2xl numeral text-primary">
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
            <span className="absolute text-[9px] numeral">
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
                <p className="text-lg numeral">{stat.value}</p>
              </div>
              <span className="text-sm opacity-50">{stat.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Badges */}
      <CategoryBadgesGrid
        categoryBadges={categoryBadges}
        completedIds={completedIds}
        stats={stats}
        sessions={sessions}
        deckById={deckById}
      />

      {/* Achievements */}
      <AchievementsList
        generalAchievements={generalAchievements}
        completedIds={completedIds}
        stats={stats}
        sessions={sessions}
      />
    </section>
  );
}
