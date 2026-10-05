"use client";

import dynamic from "next/dynamic";
import type { CommunityStats } from "@/hooks/useCommunityStats";
import { ARCHETYPE_FAMILIES, FamilyIcon } from "@/components/icons/ArchetypeIcon";
import { FALLBACK_DISTRIBUTION, type ArchetypeFamilyShare } from "./types";
import { DataSourceBadge } from "./DataSourceBadge";

const RadarChart = dynamic(() => import("@/components/RadarChart").then((m) => m.RadarChart), { ssr: false });

interface ArchetypesTabProps {
  playerArchetypeId?: string;
  radarAxes: { label: string; playerValue: number; communityValue: number }[];
  communityStats: CommunityStats;
}

export function ArchetypesTab({
  playerArchetypeId,
  radarAxes,
  communityStats,
}: ArchetypesTabProps) {
  // Build distribution from real API data or use fallback
  const distribution = ((): ArchetypeFamilyShare[] => {
    if (communityStats.isFallback || communityStats.archetypeDistribution.length === 0) {
      return FALLBACK_DISTRIBUTION;
    }

    // Group archetypes into families for display
    const families = ARCHETYPE_FAMILIES.map((f) => ({ ...f, count: 0 }));

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
        <DataSourceBadge label={`Données réelles (${communityStats.totalSessions} sessions)`} />
      )}

      {/* Radar: Tes choix vs la communauté */}
      {radarAxes.length >= 3 && (
        <div className="flex flex-col gap-4 border-t border-border pt-3">
          <div>
            <h2 className="text-xl font-extrabold">Tes choix vs la communauté</h2>
            <p className="text-sm text-muted-foreground mt-1">
              % de coupes par catégorie
            </p>
          </div>
          <RadarChart axes={radarAxes} size={240} />
        </div>
      )}

      {/* Distribution */}
      <div className="flex flex-col gap-4 border-t border-border pt-3">
        <div>
          <h2 className="text-xl font-extrabold">Distribution de la communauté</h2>
          <p className="text-sm text-muted-foreground mt-1">
            L&apos;équilibre des forces budgétaires
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {distribution.map((a) => {
            const isPlayer = !!(playerArchetypeId && a.ids.includes(playerArchetypeId));
            return (
              <div key={a.name} className={`flex flex-col gap-1.5 rounded-xl px-2 py-1.5 -mx-2 transition-colors ${isPlayer ? "bg-muted/60" : ""}`}>
                <div className="flex justify-between items-baseline text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="shrink-0"><FamilyIcon icon={a.icon} /></span>
                    {a.name}
                    {isPlayer && <span className="kicker text-primary border border-primary/50 px-1.5 rounded-full">Toi</span>}
                  </span>
                  <span className="numeral text-base">{a.percent}&nbsp;%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full bg-primary rounded-full"
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
