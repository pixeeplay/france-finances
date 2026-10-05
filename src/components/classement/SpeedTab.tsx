import type { PlayerProfile } from "@/lib/stats";
import { UiIcon } from "@/components/icons/UiIcon";
import { RankBadge } from "./RankBadge";
import { DataSourceBadge } from "./DataSourceBadge";
import type { SpeedPlayer } from "./types";

interface SpeedTabProps {
  players: SpeedPlayer[];
  localSessions: { totalDurationMs: number; totalCards: number }[];
  localProfile: PlayerProfile | null;
}

function formatSpeed(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function SpeedTab({
  players,
  localSessions,
  localProfile,
}: SpeedTabProps) {
  // Merge local player into speed board
  const merged: SpeedPlayer[] = (() => {
    // Compute local player speed from sessions with valid duration
    const validSessions = localSessions.filter((s) => s.totalDurationMs > 0 && s.totalCards > 0);
    if (validSessions.length < 3 && players.length > 0) {
      // Not enough sessions — show API list only with note
      return players.map((p, i) => ({ ...p, rank: i + 1 }));
    }

    if (validSessions.length >= 3) {
      const totalMs = validSessions.reduce((s, sess) => s + sess.totalDurationMs, 0);
      const totalCards = validSessions.reduce((s, sess) => s + sess.totalCards, 0);
      const avgMs = Math.round(totalMs / totalCards);

      const localPlayer: SpeedPlayer = {
        rank: 0,
        username: localProfile?.username || "Toi",
        avgMsPerCard: avgMs,
        totalSessions: validSessions.length,
        totalCards,
        isCurrentPlayer: true,
      };

      const all = [...players.filter((p) => !p.isCurrentPlayer), localPlayer]
        .sort((a, b) => a.avgMsPerCard - b.avgMsPerCard)
        .map((p, i) => ({ ...p, rank: i + 1 }));

      return all;
    }

    return players.map((p, i) => ({ ...p, rank: i + 1 }));
  })();

  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      {merged.length > 1 && (
        <div className="mb-2">
          <DataSourceBadge label="Classement par vitesse (min. 3 sessions)" />
        </div>
      )}

      {merged.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Aucun joueur classé pour l&apos;instant.</p>
          <p className="text-muted-foreground text-xs mt-1">Complète au moins 3 sessions pour apparaître ici !</p>
        </div>
      )}

      {merged.map((player) => {
        const rank = player.rank;
        const isMe = player.isCurrentPlayer;

        return (
          <div
            key={player.userId ?? (isMe ? "speed-current" : player.username)}
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
              <UiIcon
                name={rank <= 3 ? "medal" : "bolt"}
                size={20}
                className={rank <= 3 ? "text-warning" : "text-muted-foreground"}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-bold truncate block ${isMe ? "text-primary" : ""}`}>
                {isMe ? "Toi" : player.username}
              </span>
              <p className="text-xs text-muted-foreground">
                {player.totalCards} cartes · {player.totalSessions} sessions
              </p>
            </div>

            {/* Speed */}
            <div className="text-right shrink-0">
              <p className={`text-sm numeral ${isMe ? "text-primary" : ""}`}>
                {formatSpeed(player.avgMsPerCard)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">/ carte</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
