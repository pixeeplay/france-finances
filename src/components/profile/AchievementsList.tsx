"use client";

import { useState } from "react";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import type { Achievement } from "@/lib/achievements";
import type { GlobalStats, StoredSession } from "@/lib/stats";

interface AchievementsListProps {
  generalAchievements: Achievement[];
  completedIds: string[];
  stats: GlobalStats;
  sessions: StoredSession[];
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
                ) : showTip ? (
                  <p className="mt-1 text-[10px] text-primary font-medium leading-tight animate-fade-in">
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
  );
}
