"use client";

import dynamic from "next/dynamic";
import type { CommunityStats } from "@/hooks/useCommunityStats";
import { FALLBACK_DISTRIBUTION } from "./types";
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
  const distribution = (() => {
    if (communityStats.isFallback || communityStats.archetypeDistribution.length === 0) {
      return FALLBACK_DISTRIBUTION;
    }

    // Group archetypes into families for display
    const families: { name: string; icon: string; ids: string[]; count: number }[] = [
      { name: "Équilibristes", icon: "⚖️", ids: ["equilibriste"], count: 0 },
      { name: "Coupeurs", icon: "✂️", ids: ["austeritaire", "demolisseur", "liquidateur_en_chef", "tranchant", "bucheron"], count: 0 },
      { name: "Gardiens", icon: "🛡️", ids: ["gardien", "conservateur", "investisseur_public", "protecteur"], count: 0 },
      { name: "Stratèges", icon: "🎯", ids: ["chirurgien", "stratege", "reformateur", "optimisateur", "elagueur"], count: 0 },
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
        <DataSourceBadge label={`Données réelles (${communityStats.totalSessions} sessions)`} />
      )}

      {/* Radar: Tes choix vs la communauté */}
      {radarAxes.length >= 3 && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-bold">Tes choix vs la communauté</h2>
            <p className="text-sm text-muted-foreground mt-1">
              % de coupes par catégorie
            </p>
          </div>
          <RadarChart axes={radarAxes} size={240} />
        </div>
      )}

      {/* Distribution */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-bold">Distribution de la communauté</h2>
          <p className="text-sm text-muted-foreground mt-1">
            L&apos;équilibre des forces budgétaires
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
