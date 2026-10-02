import Link from "next/link";
import decksData from "@/data";
import { HEADLINE_FIGURE, headlinePerCapita } from "@/data/headline";
import { formatBillions, formatEuros } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import type { Card } from "@/types";

/**
 * Cartes du jeu comparées sur une même échelle linéaire.
 * Mappées par id : si une carte disparaît ou change de montant, le graphique suit les données.
 */
const CARD_IDS = ["soc-01", "san-01", "eta-02", "edu-01", "soc-05", "eta-01", "sec-01", "def-01"];

const totalCards = decksData.cards.length;
const totalCategories = decksData.decks.filter((d) => d.type !== "thematic").length;

export function KeyNumbers() {
  const rows = CARD_IDS
    .map((id) => decksData.cards.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c))
    .sort((a, b) => b.amountBillions - a.amountBillions);
  const max = rows[0]?.amountBillions ?? 1;
  const min = rows[rows.length - 1]?.amountBillions ?? 1;
  const ratio = min > 0 ? Math.round(max / min).toLocaleString("fr-FR") : "…";

  const tiles = [
    { value: formatBillions(HEADLINE_FIGURE.amountBillions), label: `Dépenses publiques ${HEADLINE_FIGURE.year}`, color: "text-danger" },
    { value: formatEuros(headlinePerCapita()), label: "Par habitant et par an", color: "text-danger" },
    { value: String(totalCards), label: "Cartes à découvrir", color: "text-brand-fg" },
    { value: String(totalCategories), label: "Catégories de dépenses", color: "text-brand-fg" },
  ];

  return (
    <section id="chiffres-cles" aria-labelledby="chiffres-title" className="section-padding">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="chiffres-title" className="text-3xl md:text-4xl text-center mb-12 text-brand-fg dark:text-foreground">
          Les chiffres clés
        </h2>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {tiles.map((t) => (
            <li
              key={t.label}
              className="text-center px-3 py-6 rounded-2xl bg-card border border-border hover-lift"
            >
              <p className={`numeral text-3xl md:text-4xl leading-none ${t.color}`}>{t.value}</p>
              <p className="text-sm text-muted-foreground mt-3">{t.label}</p>
            </li>
          ))}
        </ul>

        {/* Ordres de grandeur */}
        <div id="ordres-de-grandeur" className="mt-14 rounded-3xl bg-card border border-border p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
            <div>
              <p className="kicker text-warning">Ordres de grandeur</p>
              <h3 className="mt-1 text-2xl md:text-3xl leading-tight">
                De {formatBillions(min)} à {formatBillions(max)}&nbsp;: un rapport de 1 à {ratio}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground md:max-w-xs">
              Huit cartes du jeu sur la même échelle.
            </p>
          </div>

          <ol className="flex flex-col gap-1">
            {rows.map((card) => {
              const width = Math.max((card.amountBillions / max) * 100, 0.8);
              return (
                <li key={card.id} style={catStyle(card.deckId)}>
                  <Link
                    href={`/categories/${card.deckId}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 min-h-[44px] hover:bg-muted/50 transition-colors"
                  >
                    <CategoryBadge deckId={card.deckId} size={32} className="row-span-2" />
                    <span className="min-w-0 truncate font-semibold">
                      {card.title}
                      <span className="sr-only"> ({getDeckName(card.deckId)})</span>
                    </span>
                    <span className="numeral text-lg text-danger">{formatBillions(card.amountBillions)}</span>
                    <span className="col-span-2 h-2.5 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${width}%`, backgroundColor: "var(--cat)" }}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Montants annuels en milliards d&apos;euros, échelle linéaire. Sources&nbsp;: celles de chaque carte (
            {rows.map((c) => c.source.split(",")[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join(", ")}…).
          </p>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/chiffres"
            className="inline-flex items-center gap-2 min-h-[48px] px-7 rounded-full bg-brand text-white font-heading font-bold hover:bg-brand-hover transition-colors"
          >
            Voir tous les chiffres
            <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
