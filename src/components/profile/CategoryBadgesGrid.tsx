import Image from "next/image";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { Achievement } from "@/lib/achievements";
import type { GlobalStats, StoredSession } from "@/lib/stats";
import type { Deck } from "@/types";

interface CategoryBadgesGridProps {
  categoryBadges: Achievement[];
  completedIds: string[];
  stats: GlobalStats;
  sessions: StoredSession[];
  deckById: Record<string, Deck>;
}

export function CategoryBadgesGrid({
  categoryBadges,
  completedIds,
  stats,
  sessions,
  deckById,
}: CategoryBadgesGridProps) {
  const completedCategory = categoryBadges.filter((a) => completedIds.includes(a.id));

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="kicker text-muted-foreground">
          Badges Catégories
        </h3>
        <span className="numeral text-sm font-semibold text-foreground">
          {completedCategory.length} / {categoryBadges.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {categoryBadges.map((a) => {
          const completed = completedIds.includes(a.id);
          const prog = completed ? 100 : a.progress(stats, sessions);
          const deckId = a.id.replace("badge_", "").replace("_", "-");
          const deck = deckById[deckId];
          return (
            <div
              key={a.id}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
                completed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border opacity-50"
              }`}
            >
              {deck?.image ? (
                <Image src={deck.image} alt="" width={32} height={32} className={completed ? "" : "grayscale"} />
              ) : (
                <CategoryIcon deckId={deckId} size={28} className={completed ? "text-primary" : "text-muted-foreground"} />
              )}
              <span className="text-[9px] font-bold text-center leading-tight">
                {a.title.replace("Expert ", "")}
              </span>
              {!completed && (
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/50"
                    style={{ width: `${prog}%` }}
                  />
                </div>
              )}
              {completed && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center">
                  &#10003;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
