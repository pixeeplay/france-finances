import Link from "next/link";
import decksData from "@/data";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import type { Deck } from "@/types";

const mainDecks = decksData.decks.filter((d) => d.type !== "thematic");

export function CategoriesSection() {
  return (
    <section id="categories" aria-labelledby="categories-title" className="section-padding bg-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="categories-title" className="text-3xl md:text-4xl text-center mb-2 text-brand-fg dark:text-foreground">
          Explorer les catégories
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          {mainDecks.length} catégories de dépenses publiques à explorer
        </p>

        {/* Mobile : défilement horizontal */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4">
          <ul className="grid grid-rows-2 grid-flow-col auto-cols-[128px] gap-3 w-max">
            {mainDecks.map((deck) => (
              <li key={deck.id}>
                <CategoryTile deck={deck} />
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop : grille */}
        <ul className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {mainDecks.map((deck) => (
            <li key={deck.id}>
              <CategoryTile deck={deck} />
            </li>
          ))}
        </ul>

        <div className="text-center mt-10">
          <Link
            href="/jeu"
            className="inline-flex items-center gap-2 min-h-[48px] px-8 rounded-full bg-brand text-white font-heading font-bold hover:bg-brand-hover transition-colors"
          >
            Jouer maintenant
            <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ deck }: { deck: Deck }) {
  return (
    <Link
      href={`/categories/${deck.id}`}
      style={catStyle(deck.id)}
      className="hover-lift flex h-full flex-col items-center gap-2 rounded-2xl bg-card border border-border hover:border-[color:var(--cat)] p-4 md:p-5 text-center transition-colors"
    >
      <CategoryBadge deckId={deck.id} size={56} solid />
      <span className="mt-1 text-sm font-bold text-foreground leading-tight">{deck.name}</span>
      <span className="text-xs text-muted-foreground">{deck.cardCount} cartes</span>
    </Link>
  );
}
