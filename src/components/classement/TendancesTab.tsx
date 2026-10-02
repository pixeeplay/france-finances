import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import type { CommunityStats } from "@/hooks/useCommunityStats";
import { RankBadge } from "./RankBadge";
import { DataSourceBadge } from "./DataSourceBadge";
import { FALLBACK_CUT, FALLBACK_PROTECTED } from "./types";

interface TendancesTabProps {
  communityStats: CommunityStats;
  allCards: { id: string; title: string }[];
}

export function TendancesTab({
  communityStats,
  allCards,
}: TendancesTabProps) {
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
        <DataSourceBadge label={`Données réelles (${communityStats.totalSessions} sessions)`} />
      )}

      {/* Most cut */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChainsawIcon size={20} />
          <h3 className="text-lg font-bold">Dépenses les plus coupées</h3>
        </div>
        <div className="flex flex-col gap-3">
          {cutItems.map((item, i) => (
            <div
              key={item.title}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border-l-4 border-l-danger border border-border"
            >
              <RankBadge rank={i + 1} />
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
          {protectedItems.map((item, i) => (
            <div
              key={item.title}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border-l-4 border-l-primary border border-border"
            >
              <RankBadge rank={i + 1} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                <p className="text-xs text-primary font-medium">{item.percent}% &quot;OK&quot;quot;Garder&quot;OK&quot;quot;</p>
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
