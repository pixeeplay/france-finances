import type { StoredSession } from "@/lib/stats";
import { UiIcon } from "@/components/icons/UiIcon";

interface SessionsTabProps {
  sessions: StoredSession[];
}

export function SessionsTab({ sessions }: SessionsTabProps) {
  if (sessions.length === 0) {
    return (
      <section className="p-4">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
          <UiIcon name="chart" size={40} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Joue une session pour voir tes mesures.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
          Répartition par session
        </h3>
        {sessions
          .slice()
          .reverse()
          .map((s) => {
            const keepPct =
              s.totalCards > 0
                ? Math.round((s.keepCount / s.totalCards) * 100)
                : 0;
            return (
              <div
                key={s.id}
                className="bg-card border border-border p-3 rounded-xl"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold">
                    {s.deckId.charAt(0).toUpperCase() + s.deckId.slice(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary rounded-full"
                    style={{ width: `${keepPct}%` }}
                  />
                  <div
                    className="bg-danger rounded-full"
                    style={{ width: `${100 - keepPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>
                    {s.keepCount} gardées · {s.cutCount} coupées
                  </span>
                  <span>{s.archetypeName}</span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
