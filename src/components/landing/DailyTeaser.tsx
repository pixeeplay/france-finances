import Link from "next/link";
import { DAILY_CARD_COUNT, DAILY_DECK_ID } from "@/lib/daily";

function IconCalendar() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

/** Encart « deck du jour » : même tirage pour tout le monde, renouvelé à minuit. */
export function DailyTeaser() {
  return (
    <section aria-labelledby="daily-teaser-title" className="px-4 sm:px-6 -mt-4 mb-4">
      <div className="max-w-4xl mx-auto rounded-3xl border border-primary/30 bg-primary/10 p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary/15 text-primary flex items-center justify-center" aria-hidden="true">
          <IconCalendar />
        </div>
        <div className="flex-1">
          <p className="kicker text-primary">Nouveau chaque jour</p>
          <h2 id="daily-teaser-title" className="mt-1 text-2xl text-foreground">
            Le deck du jour
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Les mêmes {DAILY_CARD_COUNT} dépenses pour tout le monde, renouvelées à minuit. Comparez-vous, enchaînez les jours.
          </p>
        </div>
        <Link
          href={`/jeu/${DAILY_DECK_ID}`}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full bg-primary text-primary-foreground font-heading font-bold hover:opacity-90 transition-opacity"
        >
          Jouer le deck du jour
          <span aria-hidden="true">&#8594;</span>
        </Link>
      </div>
    </section>
  );
}
