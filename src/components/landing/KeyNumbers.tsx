import Link from "next/link";
import decksData from "@/data";
import { HEADLINE_FIGURE } from "@/data/headline";
import { formatBillions } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import type { Card } from "@/types";

/**
 * Cartes du jeu comparées sur une même échelle linéaire.
 * Mappées par id : si une carte disparaît ou change de montant, le graphique suit les données.
 */
const CARD_IDS = ["soc-01", "san-01", "eta-02", "edu-01", "soc-05", "eta-01", "sec-01", "def-01"];

/** Grille des montants chocs : cartes du jeu, libellé court. */
const TILE_CARDS: { id: string; label: string }[] = [
  { id: "soc-01", label: "Retraites" },
  { id: "san-01", label: "Assurance maladie" },
  { id: "eta-02", label: "Salaires de l'État" },
  { id: "edu-01", label: "Éducation nationale" },
  { id: "eta-01", label: "Intérêts de la dette" },
];

function findCard(id: string): Card | undefined {
  return decksData.cards.find((c) => c.id === id);
}

export function KeyNumbers() {
  const rows = CARD_IDS
    .map(findCard)
    .filter((c): c is Card => Boolean(c))
    .sort((a, b) => b.amountBillions - a.amountBillions);
  const max = rows[0]?.amountBillions ?? 1;
  const min = rows[rows.length - 1]?.amountBillions ?? 1;
  const ratio = min > 0 ? Math.round(max / min).toLocaleString("fr-FR") : "…";

  const tiles = [
    {
      key: "total",
      value: formatBillions(HEADLINE_FIGURE.amountBillions),
      label: `Dépenses publiques ${HEADLINE_FIGURE.year}`,
      href: "/chiffres",
      deckId: null as string | null,
    },
    ...TILE_CARDS.flatMap(({ id, label }) => {
      const card = findCard(id);
      return card
        ? [{ key: id, value: formatBillions(card.amountBillions), label, href: `/categories/${card.deckId}`, deckId: card.deckId }]
        : [];
    }),
  ];

  return (
    <section id="chiffres-cles" aria-labelledby="chiffres-title" className="section-padding section-tint-red">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="chiffres-title" className="text-3xl md:text-4xl text-center mb-3 text-brand-fg dark:text-foreground">
          Les chiffres clés
        </h2>
        <p className="text-center text-muted-foreground mb-10">Ce que coûtent chaque année les grandes politiques publiques.</p>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {tiles.map((t) => (
            <li key={t.key} style={t.deckId ? catStyle(t.deckId) : undefined}>
              <Link
                href={t.href}
                className="flex h-full flex-col items-center justify-center text-center px-3 py-6 rounded-2xl bg-card border border-border hover-lift hover:border-danger/50 transition-colors"
              >
                {t.deckId ? (
                  <CategoryBadge deckId={t.deckId} size={40} solid className="mb-3" />
                ) : (
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-danger text-white text-lg font-heading font-black shadow-lg shadow-danger/30" aria-hidden="true">
                    €
                  </span>
                )}
                <span className="numeral text-[1.9rem] md:text-4xl leading-none text-danger whitespace-nowrap">{t.value}</span>
                <span className="text-sm text-muted-foreground mt-2">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Ordres de grandeur */}
        <div id="ordres-de-grandeur" className="mt-14 rounded-3xl bg-card border border-border p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
            <div>
              <p className="kicker text-warning">Ordres de grandeur</p>
              <h3 className="mt-1 text-2xl md:text-3xl leading-tight">
                De {formatBillions(min).replace(/\s?Md€$/, "")} à {formatBillions(max)}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground md:max-w-xs">
              Un rapport de <strong className="text-foreground">1 à {ratio}</strong> entre ces huit cartes du jeu.
            </p>
          </div>

          <ol className="flex flex-col gap-1">
            {rows.map((card) => {
              const width = Math.max((card.amountBillions / max) * 100, 0.8);
              return (
                <li key={card.id} style={catStyle(card.deckId)}>
                  <Link
                    href={`/categories/${card.deckId}`}
                    className="group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 min-h-[44px] hover:bg-muted/50 transition-colors"
                  >
                    <CategoryBadge deckId={card.deckId} size={32} className="row-span-2" />
                    <span className="min-w-0 font-semibold leading-snug">
                      {card.title}
                      <span className="sr-only"> ({getDeckName(card.deckId)})</span>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${width}%`, backgroundColor: "var(--cat)" }}
                        />
                      </span>
                      <span className="numeral w-[4.75rem] shrink-0 text-right text-base text-danger">
                        {formatBillions(card.amountBillions)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Montants annuels, échelle linéaire. Sources&nbsp;: celles de chaque carte.
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
