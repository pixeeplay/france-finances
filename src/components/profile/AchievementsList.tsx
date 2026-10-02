"use client";

import { useState, type ReactNode } from "react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { UiIcon, type UiIconName } from "@/components/icons/UiIcon";
import type { Achievement } from "@/lib/achievements";
import type { GlobalStats, StoredSession } from "@/lib/stats";

interface AchievementsListProps {
  generalAchievements: Achievement[];
  completedIds: string[];
  stats: GlobalStats;
  sessions: StoredSession[];
}

/** Pictogramme SVG par haut fait (le champ `icon` des données reste un emoji pour le partage) */
const ACHIEVEMENT_ICONS: Record<string, UiIconName> = {
  quiz_ordre_grandeur: "target",
  quiz_serie: "bulb",
  quiz_expert: "chart",
  fifty_fifty: "balance",
  auditor: "clipboard",
  globe_trotter: "map",
  liquidator: "flame",
  faithful: "medal",
  centurion: "layers",
  speedrunner: "bolt",
  expert_n3: "search",
  millionnaire: "gem",
  collectionneur: "trophy",
};

function AchievementIcon({ achievement }: { achievement: Achievement }): ReactNode {
  if (achievement.icon === "chainsaw" || achievement.id === "first_cut") return <ChainsawIcon size={22} />;
  if (achievement.id === "guardian") return <ShieldIcon size={22} />;
  return <UiIcon name={ACHIEVEMENT_ICONS[achievement.id] ?? "medal"} size={22} />;
}

export function AchievementsList({
  generalAchievements,
  completedIds,
  stats,
  sessions,
}: AchievementsListProps) {
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const completedGeneral = generalAchievements.filter((a) => completedIds.includes(a.id));

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="kicker text-muted-foreground">Journal des hauts faits</h3>
        <span className="numeral text-sm text-foreground">
          {completedGeneral.length} / {generalAchievements.length}
        </span>
      </div>

      <ul className="border-y border-border divide-y divide-border">
        {generalAchievements.map((a) => {
          const completed = completedIds.includes(a.id);
          const prog = completed ? 100 : a.progress(stats, sessions);
          const showTip = !completed && tooltipId === a.id;
          const descriptionId = `achievement-${a.id}-desc`;

          const content = (
            <>
              <span
                className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${
                  completed ? "border-primary/50 text-primary" : "border-border text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                <AchievementIcon achievement={a} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex justify-between items-start gap-2">
                  <span className="text-sm font-semibold">{a.title}</span>
                  {completed ? (
                    <span className="kicker text-primary">Complété</span>
                  ) : (
                    <span className="text-muted-foreground">
                      <UiIcon name="lock" size={14} />
                      <span className="sr-only">Verrouillé</span>
                    </span>
                  )}
                </span>
                {completed ? (
                  <span className="block text-xs text-muted-foreground leading-snug">{a.description}</span>
                ) : showTip ? (
                  <span id={descriptionId} className="mt-1 block text-xs text-foreground leading-snug animate-fade-in">
                    {a.description}
                  </span>
                ) : (
                  <span className="mt-1.5 block h-1 w-full bg-muted rounded-full overflow-hidden" aria-hidden="true">
                    <span className="block h-full bg-muted-foreground" style={{ width: `${prog}%` }} />
                  </span>
                )}
              </span>
            </>
          );

          return (
            <li key={a.id}>
              {completed ? (
                <div className="p-3 flex items-center gap-4">{content}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => setTooltipId(showTip ? null : a.id)}
                  aria-expanded={showTip}
                  aria-controls={showTip ? descriptionId : undefined}
                  className="w-full min-h-[44px] p-3 flex items-center gap-4 text-left hover:bg-muted/40 transition-colors"
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
