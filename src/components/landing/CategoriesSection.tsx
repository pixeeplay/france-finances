import Link from "next/link";
import decksData from "@/data";
import { CategoryIcon } from "@/components/icons/CategoryIcon";

const mainDecks = decksData.decks.filter((d) => d.type !== "thematic");

/** Index typographique des catégories (sommaire plutôt que tuiles). */
export function CategoriesSection() {
  return (
    <section id="categories" aria-labelledby="categories-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b-2 border-foreground pb-3">
          <div>
            <p className="kicker text-muted-foreground mb-2">Sommaire</p>
            <h2 id="categories-title" className="text-3xl md:text-4xl font-semibold leading-tight">
              Les {mainDecks.length} catégories
            </h2>
          </div>
          <Link href="/jeu" className="text-sm font-semibold underline underline-offset-4 decoration-1 min-h-[44px] inline-flex items-center">
            Choisir un thème et jouer <span aria-hidden="true" className="ml-1">&#8594;</span>
          </Link>
        </header>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8">
          {mainDecks.map((deck) => (
            <li key={deck.id} className="border-b border-border">
              <Link
                href={`/categories/${deck.id}`}
                className="group flex items-center gap-3 py-3 min-h-[44px]"
              >
                <CategoryIcon deckId={deck.id} size={20} className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="flex-1 font-medium leading-tight group-hover:underline underline-offset-4 decoration-1">
                  {deck.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {deck.cardCount}
                  <span className="sr-only"> cartes</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
