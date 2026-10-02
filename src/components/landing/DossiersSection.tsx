import Link from "next/link";
import decksData from "@/data";
import { CategoryIcon } from "@/components/icons/CategoryIcon";

/** Decks thématiques présentés comme des dossiers éditoriaux. */
export function DossiersSection() {
  const dossiers = decksData.decks
    .filter((d) => d.type === "thematic")
    .map((deck) => ({
      deck,
      count: decksData.cards.filter((c) => c.deckId === deck.id).length,
    }));

  if (dossiers.length === 0) return null;

  return (
    <section id="dossiers" aria-labelledby="dossiers-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b-2 border-foreground pb-3">
          <div>
            <p className="kicker text-muted-foreground mb-2">Dossiers</p>
            <h2 id="dossiers-title" className="text-3xl md:text-4xl font-semibold leading-tight">
              Trois sujets à la loupe
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Des decks thématiques qui traversent les catégories budgétaires.
          </p>
        </header>

        <ol className="grid md:grid-cols-3 md:divide-x divide-border">
          {dossiers.map(({ deck, count }, i) => (
            <li key={deck.id} className="border-b border-border md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
              <Link href={`/categories/${deck.id}`} className="group flex flex-col gap-3 py-5 min-h-[44px]">
                <span className="flex items-center justify-between text-muted-foreground">
                  <span className="kicker tabular-nums">N°&nbsp;{String(i + 1).padStart(2, "0")}</span>
                  <CategoryIcon deckId={deck.id} size={28} strokeWidth={1.4} />
                </span>
                <span className="font-serif text-2xl font-semibold leading-tight group-hover:underline underline-offset-4 decoration-1">
                  {deck.name}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{deck.description}</span>
                <span className="kicker text-muted-foreground tabular-nums">
                  {count} cartes
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
