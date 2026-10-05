"use client";

import { useRouter } from "next/navigation";
import type { StoredSession } from "@/lib/stats";
import { UiIcon } from "@/components/icons/UiIcon";
import { ArchetypeIcon } from "@/components/icons/ArchetypeIcon";

interface JournalTabProps {
  sessions: StoredSession[];
}

export function JournalTab({ sessions }: JournalTabProps) {
  const router = useRouter();

  if (sessions.length === 0) {
    return (
      <section className="p-4">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
          <UiIcon name="book" size={40} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Joue une session pour voir ton journal.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 mb-3">
          Historique des sessions
        </h3>
        {sessions
          .slice()
          .reverse()
          .map((s) => {
            const levelParam = s.level > 1 ? `?level=${s.level}` : "";
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ArchetypeIcon archetypeId={s.archetypeId} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold truncate">
                      {s.archetypeName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(s.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {s.totalCards} cartes &middot; {s.deckId} &middot; N{s.level} &middot;{" "}
                    {Math.round(s.totalDurationMs / 1000)}s
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/jeu/${s.deckId}${levelParam}`)}
                  className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Rejouer
                </button>
              </div>
            );
          })}
      </div>
    </section>
  );
}
