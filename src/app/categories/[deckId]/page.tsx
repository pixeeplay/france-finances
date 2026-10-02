import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import decksData from "@/data";
import type { Card, Deck } from "@/types";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import { formatBillions, formatEuros } from "@/lib/format";

interface Props {
  params: Promise<{ deckId: string }>;
}

export async function generateStaticParams() {
  return decksData.decks.map((deck) => ({ deckId: deck.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deckId } = await params;
  const deck = decksData.decks.find((d) => d.id === deckId);
  if (!deck) return {};

  const cards = decksData.cards.filter((c) => c.deckId === deckId);
  const description = `Découvrez les dépenses publiques françaises en ${deck.name} : ${cards.length} postes budgétaires sourcés. ${deck.description}. Données PLF 2025-2026.`;

  return {
    title: `${deck.name} — france-finances.com`,
    description,
    alternates: {
      canonical: `/categories/${deckId}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { deckId } = await params;
  const deck = decksData.decks.find((d): d is Deck => d.id === deckId);
  if (!deck) notFound();

  const cards = decksData.cards
    .filter((c) => c.deckId === deckId)
    .sort((a, b) => b.amountBillions - a.amountBillions);
  const max = cards[0]?.amountBillions ?? 0;
  const min = cards[cards.length - 1]?.amountBillions ?? 0;
  const isDossier = deck.type === "thematic";

  return (
    <>
      {/* En-tête */}
      <header className="bg-section border-b border-border" style={catStyle(deck.id)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <Link
            href={isDossier ? "/#dossiers" : "/#categories"}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">&larr;</span> {isDossier ? "Tous les dossiers" : "Toutes les catégories"}
          </Link>

          <p className="mt-4 flex items-center gap-3">
            <CategoryBadge deckId={deck.id} size={56} />
            <span className="kicker cat-text">{isDossier ? "Dossier" : "Catégorie"}</span>
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-black leading-tight tracking-tight">{deck.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-prose">{deck.description}</p>

          <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            <Stat label="Cartes" value={String(cards.length)} tone="text-brand-fg" />
            <Stat label="Plus gros poste" value={formatBillions(max)} tone="text-danger" />
            <Stat label="Plus petit poste" value={formatBillions(min)} tone="text-primary" />
          </dl>

          <div className="mt-8">
            <Link
              href={`/jeu/${deck.id}`}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-brand text-white font-heading font-bold hover:bg-brand-hover transition-colors"
            >
              Jouer ce deck <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Liste des cartes, classées par montant */}
      <section aria-labelledby="cards-title" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <h2 id="cards-title" className="text-2xl font-extrabold">
            {cards.length} dépenses, de la plus lourde à la plus légère
          </h2>
        </div>

        <ol style={catStyle(deck.id)}>
          {cards.map((card, i) => (
            <CardRow key={card.id} card={card} rank={i + 1} max={max} />
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">
          Barres proportionnelles au montant annuel, échelle linéaire propre à ce deck.
          Les cartes peuvent se recouper&nbsp;: leurs montants ne s&apos;additionnent pas.
        </p>

        <div className="mt-10">
          <Link
            href={`/jeu/${deck.id}`}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl border-2 border-border bg-card font-heading font-bold hover:bg-muted transition-colors"
          >
            Passer ce deck à la tron&ccedil;onneuse <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-card border border-border p-3 sm:p-4">
      <dt className="kicker text-[10px] text-muted-foreground">{label}</dt>
      <dd className={`numeral text-xl sm:text-3xl truncate ${tone}`}>{value}</dd>
    </div>
  );
}

function CardRow({ card, rank, max }: { card: Card; rank: number; max: number }) {
  const width = max > 0 ? Math.max((card.amountBillions / max) * 100, 0.5) : 0;
  return (
    <li className="grid grid-cols-[2rem_1fr_auto] gap-x-3 gap-y-1 py-3 border-b border-border items-baseline">
      <span className="text-xs font-bold text-muted-foreground tabular-nums">{String(rank).padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{card.title}</p>
        <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
      </div>
      <div className="text-right">
        <p className="numeral text-lg text-danger">{formatBillions(card.amountBillions)}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{formatEuros(card.costPerCitizen)}/hab.</p>
      </div>
      <span className="col-start-2 col-span-2 h-2 rounded-full bg-muted overflow-hidden" aria-hidden="true">
        <span className="block h-full rounded-full" style={{ width: `${width}%`, backgroundColor: "var(--cat)" }} />
      </span>
    </li>
  );
}
