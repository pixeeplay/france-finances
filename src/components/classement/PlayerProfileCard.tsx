import type { PlayerProfile } from "@/lib/stats";
import type { GlobalStats } from "@/lib/stats";
import { ArchetypeIcon } from "@/components/icons/ArchetypeIcon";

interface PlayerProfileCardProps {
  profile: PlayerProfile;
  stats: GlobalStats;
  rank?: number;
}

export function PlayerProfileCard({ profile, stats, rank }: PlayerProfileCardProps) {
  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-3 rounded-xl p-3 bg-primary/10 border border-primary/30">
        <div className="w-12 h-12 rounded-xl bg-card border border-primary/20 flex items-center justify-center shrink-0">
          <ArchetypeIcon archetypeId={profile.archetypeId} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary truncate">
              {profile.username}
            </span>
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
              N{profile.level}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {profile.archetypeName || "Pas encore d'archétype"} · {stats.xp.toLocaleString("fr-FR")} XP · {stats.totalSessions} sessions
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg numeral text-primary">
            #{rank ?? "—"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Rang</p>
        </div>
      </div>
    </div>
  );
}
