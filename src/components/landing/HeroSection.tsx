import Link from "next/link";
import decksData from "@/data";
import { HEADLINE_FIGURE, headlinePerCapita } from "@/data/headline";
import { formatBillions, formatEuros } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { AmountScale } from "@/components/AmountScale";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { PublicStatsLine } from "./PublicStatsLine";

/** Carte d'exemple affichée en ouverture (mappée par id, sans dépendre de sa position). */
const SAMPLE_CARD_ID = "soc-01";

export function HeroSection() {
  const sample = decksData.cards.find((c) => c.id === SAMPLE_CARD_ID) ?? decksData.cards[0];
  const playHref = `/jeu/${sample.deckId}`;
  const [whole, unit] = formatBillions(HEADLINE_FIGURE.amountBillions).split(" ");

  return (
    <section id="hero" aria-labelledby="hero-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Le chiffre */}
        <div className="lg:col-span-7 flex flex-col">
          <p className="kicker text-muted-foreground mb-4">
            Budget de la France · le jeu des dépenses publiques
          </p>
          <h1 id="hero-title" className="text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[1.05] max-w-[18ch]">
            Où va l&apos;argent public&nbsp;?
          </h1>

          <div className="mt-8 border-t-2 border-foreground pt-4">
            <p className="numeral font-semibold leading-none text-[4.5rem] sm:text-[6rem] xl:text-[7.5rem]">
              {whole}
              <span className="text-[0.4em] font-normal text-muted-foreground ml-2">{unit}</span>
            </p>
            <p className="mt-3 text-lg leading-snug max-w-prose">
              de dépenses publiques en {HEADLINE_FIGURE.year} (État, Sécurité sociale, collectivités),
              soit environ <strong className="font-semibold tabular-nums">{formatEuros(headlinePerCapita())}</strong> par habitant.
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Source&nbsp;: {HEADLINE_FIGURE.source}.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={playHref}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-md bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
            >
              Commencer une partie
              <span aria-hidden="true">&#8594;</span>
            </Link>
            <Link
              href="/jeu"
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-md border border-foreground/40 text-foreground font-semibold hover:bg-muted transition-colors"
            >
              Choisir un thème
            </Link>
          </div>
          <div className="mt-4">
            <PublicStatsLine />
          </div>
        </div>

        {/* Entrée directe : une carte du jeu */}
        <div className="lg:col-span-5">
          <Link
            href={playHref}
            aria-label={`Jouer : ${sample.title}, ${formatBillions(sample.amountBillions)} par an`}
            className="group block rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) hover:border-foreground/40 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CategoryIcon deckId={sample.deckId} size={20} />
                <span className="kicker">{getDeckName(sample.deckId)}</span>
              </span>
              <span className="kicker text-muted-foreground">Exemple de carte</span>
            </div>
            <p className="font-serif text-3xl font-semibold mt-4">{sample.title}</p>
            <div className="grid grid-cols-[1.4fr_1fr] gap-4 mt-4">
              <div>
                <p className="kicker text-muted-foreground">Coût annuel</p>
                <p className="numeral text-3xl font-semibold">{formatBillions(sample.amountBillions)}</p>
              </div>
              <div className="border-l border-border pl-4">
                <p className="kicker text-muted-foreground">Par habitant</p>
                <p className="numeral text-3xl font-semibold">{formatEuros(sample.costPerCitizen)}</p>
              </div>
            </div>
            <AmountScale amountBillions={sample.amountBillions} className="mt-5" />
            <div className="mt-5 grid grid-cols-2 border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-2 text-primary font-medium">
                <span aria-hidden="true">&#8592;</span>
                <ShieldIcon size={16} /> OK
              </span>
              <span className="flex items-center justify-end gap-2 text-danger font-medium">
                <ChainsawIcon size={16} /> À revoir
                <span aria-hidden="true">&#8594;</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Glissez la carte à gauche pour la garder, à droite pour la remettre en question.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
