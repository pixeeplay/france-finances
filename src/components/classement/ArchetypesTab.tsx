"use client";

import dynamic from "next/dynamic";
import type { CommunityStats } from "@/hooks/useCommunityStats";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { UiIcon } from "@/components/icons/UiIcon";
import { FALLBACK_DISTRIBUTION, type ArchetypeFamilyIcon, type ArchetypeFamilyShare } from "./types";
import { DataSourceBadge } from "./DataSourceBadge";

function FamilyIcon({ icon }: { icon: ArchetypeFamilyIcon }) {
  if (icon === "chainsaw") return <ChainsawIcon size={16} />;
  if (icon === "shield") return <ShieldIcon size={16} className="text-primary" />;
  return <UiIcon name={icon} size={16} className="text-muted-foreground" />;
}

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
    const families: { name: string; icon: ArchetypeFamilyIcon; ids: string[]; count: number }[] = [
      { name: "Équilibristes", icon: "balance", ids: ["equilibriste"], count: 0 },
      { name: "Coupeurs", icon: "chainsaw", ids: ["austeritaire", "demolisseur", "liquidateur_en_chef", "tranchant", "bucheron"], count: 0 },
      { name: "Gardiens", icon: "shield", ids: ["gardien", "conservateur", "investisseur_public", "protecteur"], count: 0 },
      { name: "Stratèges", icon: "target", ids: ["chirurgien", "stratege", "reformateur", "optimisateur", "elagueur"], count: 0 },
      { name: "Analystes", icon: "search", ids: ["sceptique", "auditeur_rigoureux", "speedrunner"], count: 0 },
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
        <div className="flex flex-col gap-4 border-t-2 border-foreground pt-3">
          <div>
            <h2 className="text-xl font-semibold">Tes choix vs la communauté</h2>
            <p className="text-sm text-muted-foreground mt-1">
              % de coupes par catégorie
            </p>
          </div>
          <RadarChart axes={radarAxes} size={240} />
        </div>
      )}

      {/* Distribution */}
      <div className="flex flex-col gap-4 border-t-2 border-foreground pt-3">
        <div>
          <h2 className="text-xl font-semibold">Distribution de la communauté</h2>
          <p className="text-sm text-muted-foreground mt-1">
            L&apos;équilibre des forces budgétaires
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {distribution.map((a) => {
            const isPlayer = !!(playerArchetypeId && a.ids.includes(playerArchetypeId));
            return (
              <div key={a.name} className={`flex flex-col gap-1.5 rounded-md px-2 py-1.5 -mx-2 transition-colors ${isPlayer ? "bg-muted/60" : ""}`}>
                <div className="flex justify-between items-baseline text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="shrink-0"><FamilyIcon icon={a.icon} /></span>
                    {a.name}
                    {isPlayer && <span className="kicker text-primary border border-primary/50 px-1.5 rounded-sm">Toi</span>}
                  </span>
                  <span className="numeral text-base font-semibold">{a.percent}&nbsp;%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-[1px] overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full bg-foreground/70 rounded-[1px]"
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
