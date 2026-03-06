"use client";

import Link from "next/link";
import decksData from "@/data";
import type { Deck } from "@/types";

const mainDecks = (decksData.decks as Deck[]).filter((d) => d.type !== "thematic");

export function CategoriesSection() {
  return (
    <section id="categories" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            17 catégories à explorer
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Du budget de la Défense aux dépenses sociales, plongez dans chaque secteur
          </p>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {mainDecks.map((deck) => (
              <CategoryCard key={deck.id} deck={deck} />
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
          {mainDecks.map((deck) => (
            <CategoryCard key={deck.id} deck={deck} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/jeu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-landing-primary text-white font-semibold hover:bg-landing-primary-light transition-all"
          >
            Explorer toutes les catégories
            <span>&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ deck }: { deck: Deck }) {
  return (
    <Link
      href={`/jeu/${deck.id}`}
      className="hover-lift flex flex-col items-center gap-2 bg-slate-50 rounded-xl p-5 border border-slate-100 min-w-[140px] md:min-w-0 text-center"
    >
      <span className="text-3xl">{deck.icon}</span>
      <span className="text-sm font-semibold text-slate-900 leading-tight">
        {deck.name}
      </span>
      <span className="text-xs text-slate-500">
        {deck.cardCount} cartes
      </span>
    </Link>
  );
}
