import Link from "next/link";
import decksData from "@/data";
import type { DossierMeta, DossierSource } from "@/data/dossiers/types";
import type { Card } from "@/types";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { cardKindLabel, isSpendingCard } from "@/lib/cardKind";
import { getDeckName } from "@/lib/deckMeta";
import { formatDossierDate } from "@/lib/dossiers";
import { formatBillions, formatEuros } from "@/lib/format";

/** Bandeau des brouillons (visibles hors production seulement). */
export function DraftBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center rounded-full border border-warning bg-warning/15 px-2.5 py-0.5 kicker text-[11px] text-warning">
        Brouillon
      </span>
    );
  }
  return (
    <div
      role="note"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-dashed border-warning bg-warning/10 px-4 py-3 text-sm text-foreground"
    >
      <span className="rounded-full border border-warning bg-warning/15 px-2.5 py-0.5 kicker text-[11px] text-warning">Brouillon</span>
      <span>Ce dossier n&apos;est pas publié : il n&apos;apparaît pas sur le site en production.</span>
    </div>
  );
}

/** Carte d'un dossier dans la liste : titre en h2, nom du lien = titre. */
export function DossierCard({
  dossier,
  minutes,
  headingLevel = 2,
}: {
  dossier: DossierMeta;
  minutes: number;
  /** 2 dans la liste /dossiers, 3 sous un intertitre (« Autres dossiers ») */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const titleId = `dossier-${dossier.slug}-title`;
  return (
    <Link
      href={`/dossiers/${dossier.slug}`}
      style={catStyle(dossier.deckId)}
      aria-labelledby={titleId}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      <div className="cat-solid relative flex h-28 items-center justify-between px-6" aria-hidden="true">
        <CategoryIcon deckId={dossier.deckId} size={52} strokeWidth={1.8} />
        <span className="font-heading text-3xl font-black tabular-nums">{dossier.ogFigure.value}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="flex flex-wrap items-center gap-2">
          <span className="kicker cat-text">{dossier.kicker}</span>
          {dossier.status === "brouillon" ? <DraftBanner compact /> : null}
        </p>
        <Heading id={titleId} className="font-heading text-2xl font-extrabold leading-tight text-foreground">
          {dossier.title}
        </Heading>
        <p className="text-sm leading-relaxed text-muted-foreground">{dossier.description}</p>
        <p className="mt-auto flex items-center justify-between gap-3 pt-2 text-sm">
          <span className="text-muted-foreground">{minutes} min de lecture</span>
          <span className="font-bold cat-text" aria-hidden="true">
            Lire &#8594;
          </span>
        </p>
      </div>
    </Link>
  );
}

/** « Joue ces cartes » : les cartes du jeu liées au dossier. */
export function RelatedCards({ cardIds }: { cardIds: readonly string[] }) {
  const cards = cardIds
    .map((id) => decksData.cards.find((c) => c.id === id))
    .filter((c): c is Card => c !== undefined && c.playable !== false);
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="cartes-title" className="mt-14 rounded-3xl border border-border bg-card p-5 sm:p-7">
      <p className="kicker text-brand-fg">Budget Swipe</p>
      <h2 id="cartes-title" className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
        Joue ces cartes
      </h2>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Garder ou passer à la tronçonneuse ? Ces dépenses et recettes sont dans le jeu : à toi de trancher.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {cards.map((card) => (
          <li key={card.id} style={catStyle(card.deckId)}>
            <Link
              href={`/jeu/${card.deckId}`}
              className="group flex h-full min-h-[44px] items-center gap-3 rounded-2xl border border-border bg-background/50 p-3 transition-colors hover:border-foreground/30"
            >
              <CategoryBadge deckId={card.deckId} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug text-foreground">{card.title}</span>
                <span className="block text-xs text-muted-foreground">
                  Deck {getDeckName(card.deckId)} · {formatEuros(card.costPerCitizen)}/hab.
                </span>
              </span>
              <span className="shrink-0 text-right">
                {cardKindLabel(card) ? (
                  <span className="block kicker text-[10px] text-muted-foreground">{cardKindLabel(card)}</span>
                ) : null}
                <span className={`block numeral text-lg ${isSpendingCard(card) ? "text-danger" : "text-foreground"}`}>
                  {formatBillions(card.amountBillions)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sources numérotées en bas de page (cibles des appels de note). */
export function SourcesList({ sources }: { sources: readonly DossierSource[] }) {
  return (
    <section aria-labelledby="sources-title" className="mt-14 border-t border-border pt-8">
      <h2 id="sources-title" className="font-heading text-xl font-extrabold text-foreground">
        Sources
      </h2>
      <ol className="mt-4 space-y-3">
        {sources.map((s, i) => (
          <li key={s.id} id={`source-${i + 1}`} className="flex scroll-mt-24 gap-3 text-sm">
            <span className="w-6 shrink-0 text-right font-heading font-bold tabular-nums text-brand-fg">{i + 1}.</span>
            <span className="min-w-0 text-muted-foreground">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words text-foreground underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground"
              >
                {s.label}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
              <span className="whitespace-nowrap"> · {formatSourceDate(s.date)}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** « 2025-11 » -> « novembre 2025 » ; « 2025-11-24 » -> « 24 novembre 2025 ». */
function formatSourceDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return formatDossierDate(date);
  const m = /^(\d{4})-(\d{2})$/.exec(date);
  if (!m) return date;
  return `${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}
