import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import decksData from "@/data";
import type { Card, Deck } from "@/types";

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
  return {
    title: `${deck.icon} ${deck.name} — La Tronçonneuse de Poche`,
    description: deck.description,
    alternates: {
      canonical: `/categories/${deckId}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { deckId } = await params;
  const deck = decksData.decks.find((d): d is Deck => d.id === deckId);
  if (!deck) notFound();

  const cards = decksData.cards.filter((c) => c.deckId === deckId);
  const totalBillions = cards.reduce((sum, c) => sum + c.amountBillions, 0);

  return (
    <>
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <Link
            href="/#categories"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
          >
            <span>&larr;</span> Toutes les cat&eacute;gories
          </Link>

          <div className="flex items-start gap-4">
            {deck.image ? (
              <Image src={deck.image} alt={deck.name} width={56} height={56} />
            ) : (
              <span className="text-5xl">{deck.icon}</span>
            )}
            <div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 dark:text-white">
                {deck.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
                {deck.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-8">
            <Stat label="Cartes" value={String(cards.length)} />
            <Stat label="Budget total" value={`${totalBillions.toFixed(1)} Md€`} />
            <Stat
              label="Coût moyen/citoyen"
              value={`${Math.round(cards.reduce((s, c) => s + c.costPerCitizen, 0) / cards.length)} €`}
            />
          </div>

          <div className="mt-8">
            <Link
              href="/jeu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold transition-colors"
              style={{ backgroundColor: deck.color }}
            >
              Lancer le jeu <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Card list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-heading font-bold text-xl mb-6 text-slate-900 dark:text-white">
          {cards.length} d&eacute;penses &agrave; passer en revue
        </h2>

        <div className="grid gap-3">
          {cards.map((card) => (
            <CardRow key={card.id} card={card} color={deck.color} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/jeu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold transition-colors"
            style={{ backgroundColor: deck.color }}
          >
            Tron&ccedil;onner cette cat&eacute;gorie <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-heading font-bold text-2xl text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function CardRow({ card, color }: { card: Card; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <span className="text-2xl flex-shrink-0">{card.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">
          {card.title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {card.subtitle}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-heading font-bold text-sm" style={{ color }}>
          {card.amountBillions} Md&euro;
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {card.costPerCitizen} &euro;/citoyen
        </div>
      </div>
    </div>
  );
}
