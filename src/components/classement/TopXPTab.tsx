import { RankBadge } from "./RankBadge";
import { DataSourceBadge } from "./DataSourceBadge";
import { ArchetypeIcon } from "@/components/icons/ArchetypeIcon";
import { type LeaderboardPlayer } from "./types";

interface TopXPTabProps {
  players: LeaderboardPlayer[];
  isFallback: boolean;
}

export function TopXPTab({ players, isFallback }: TopXPTabProps) {
  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      {!isFallback && players.length > 1 && (
        <div className="mb-2">
          <DataSourceBadge label="Classement réel" />
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Aucun joueur classé pour l&apos;instant.</p>
          <p className="text-muted-foreground text-xs mt-1">Joue des sessions pour apparaître ici !</p>
        </div>
      )}

      {players.map((player) => {
        const rank = player.rank;
        const isMe = player.isCurrentPlayer;

        return (
          <div
            key={player.userId ?? (isMe ? "current" : player.username)}
            className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
              isMe
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border"
            }`}
          >
            {/* Rank */}
            <RankBadge rank={rank} />

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ArchetypeIcon archetypeId={player.archetypeId} size={20} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold truncate ${isMe ? "text-primary" : ""}`}>
                  {isMe ? "Toi" : player.username}
                </span>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  N{player.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {player.archetypeName}
              </p>
            </div>

            {/* XP */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${isMe ? "text-primary" : ""}`}>
                {player.xp.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">XP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
