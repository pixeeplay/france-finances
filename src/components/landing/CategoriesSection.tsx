import Link from "next/link";
import Image from "next/image";
import decksData from "@/data";
import type { Deck } from "@/types";

const mainDecks = (decksData.decks as Deck[]).filter((d) => d.type !== "thematic");

export function CategoriesSection() {
  return (
    <section id="categories" className="section-padding bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-2 text-landing-primary dark:text-white">
          Explorer les cat&eacute;gories
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          {mainDecks.length} cat&eacute;gories de d&eacute;penses publiques &agrave; passer &agrave; la tron&ccedil;onneuse
        </p>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4">
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
            Jouer maintenant
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
      href={`/categories/${deck.id}`}
      className="hover-lift flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 min-w-[140px] md:min-w-0 text-center"
    >
      {deck.image ? (
        <Image src={deck.image} alt={deck.name} width={40} height={40} />
      ) : (
        <span className="text-3xl">{deck.icon}</span>
      )}
      <span className="text-sm font-semibold text-foreground leading-tight">
        {deck.name}
      </span>
      <span className="text-xs text-muted-foreground">
        {deck.cardCount} cartes
      </span>
    </Link>
  );
}
