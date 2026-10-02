import Link from "next/link";
import decksData from "@/data";
import { formatBillions } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { Card } from "@/types";

/**
 * Cartes du jeu comparées sur une même échelle linéaire.
 * Mappées par id : si une carte disparaît ou change de montant, le graphique suit les données.
 */
const CARD_IDS = ["soc-01", "san-01", "eta-02", "edu-01", "soc-05", "eta-01", "sec-01", "def-01"];

export function MagnitudeSection() {
  const rows = CARD_IDS
    .map((id) => decksData.cards.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c))
    .sort((a, b) => b.amountBillions - a.amountBillions);

  if (rows.length === 0) return null;
  const max = rows[0].amountBillions;
  const min = rows[rows.length - 1].amountBillions;
  const ratio = min > 0 ? Math.round(max / min).toLocaleString("fr-FR") : "…";

  return (
    <section id="ordres-de-grandeur" aria-labelledby="magnitude-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid gap-8 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="kicker text-muted-foreground mb-3">Ordres de grandeur</p>
          <h2 id="magnitude-title" className="text-3xl md:text-4xl font-semibold leading-tight">
            De {formatBillions(min)} à {formatBillions(max)}&nbsp;: un rapport de 1 à {ratio}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Huit cartes du jeu sur la même échelle. Les écarts entre postes de dépense
            sont souvent plus grands qu&apos;on ne l&apos;imagine.
          </p>
        </header>

        <figure className="lg:col-span-8">
          <ol className="flex flex-col">
            {rows.map((card) => {
              const width = Math.max((card.amountBillions / max) * 100, 0.5);
              return (
                <li key={card.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/categories/${card.deckId}`}
                    className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 py-3 min-h-[44px]"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <CategoryIcon deckId={card.deckId} size={16} className="shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium group-hover:underline underline-offset-4">{card.title}</span>
                      <span className="sr-only">({getDeckName(card.deckId)})</span>
                    </span>
                    <span className="numeral text-lg font-semibold">{formatBillions(card.amountBillions)}</span>
                    <span className="col-span-2 h-2.5 bg-muted rounded-[1px]" aria-hidden="true">
                      <span className="block h-full bg-foreground/80 rounded-[1px]" style={{ width: `${width}%` }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <figcaption className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed">
            Montants annuels en milliards d&apos;euros, échelle linéaire. Sources&nbsp;: celles de chaque
            carte ({rows.map((c) => c.source.split(",")[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join(", ")}…).
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
