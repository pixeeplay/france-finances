import Link from "next/link";
import decksData from "@/data";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";

/** Decks thématiques présentés comme des dossiers. */
export function DossiersSection() {
  const dossiers = decksData.decks
    .filter((d) => d.type === "thematic")
    .map((deck) => ({
      deck,
      count: decksData.cards.filter((c) => c.deckId === deck.id).length,
    }));

  if (dossiers.length === 0) return null;

  return (
    <section id="dossiers" aria-labelledby="dossiers-title" className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="dossiers-title" className="text-3xl md:text-4xl text-center mb-2 text-brand-fg dark:text-foreground">
          Trois dossiers à la loupe
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          Des decks thématiques qui traversent les catégories budgétaires.
        </p>

        <ul className="grid md:grid-cols-3 gap-4 md:gap-6">
          {dossiers.map(({ deck, count }) => (
            <li key={deck.id} style={catStyle(deck.id)}>
              <Link
                href={`/categories/${deck.id}`}
                className="hover-lift group flex h-full flex-col gap-3 rounded-3xl bg-card border border-border p-6"
              >
                <span className="flex items-center justify-between">
                  <CategoryBadge deckId={deck.id} size={52} />
                  <span className="kicker cat-text">{count} cartes</span>
                </span>
                <span className="font-heading text-2xl font-extrabold leading-tight text-foreground">{deck.name}</span>
                <span className="text-sm text-muted-foreground leading-relaxed">{deck.description}</span>
                <span className="mt-auto pt-2 text-sm font-bold cat-text">
                  Ouvrir le dossier <span aria-hidden="true">&#8594;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
