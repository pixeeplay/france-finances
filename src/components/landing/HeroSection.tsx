import Link from "next/link";
import decksData from "@/data";
import { HEADLINE_FIGURE, headlinePerCapita } from "@/data/headline";
import { formatBillions, formatEuros } from "@/lib/format";
import { getDeckName } from "@/lib/deckMeta";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ShieldIcon } from "@/components/ShieldIcon";
import { CategoryBadge, catStyle } from "@/components/icons/CategoryBadge";
import { PublicStatsLine } from "./PublicStatsLine";

const frInteger = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

const totalCards = decksData.cards.length;
const totalCategories = decksData.decks.filter((d) => d.type !== "thematic").length;
/** Carte d'exemple de l'aperçu animé */
const previewCard = decksData.cards.find((c) => c.id === "soc-01") ?? decksData.cards[0];

export function HeroSection() {
  const total = frInteger.format(HEADLINE_FIGURE.amountBillions);

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="section-tint-blue pt-12 pb-14 md:pt-20 md:pb-20 xl:pt-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.6fr_1fr] items-center gap-10">
        <div className="text-center lg:text-left">
          <h1
            id="hero-title"
            className="font-heading font-black text-[2.75rem] leading-[1.05] sm:text-6xl xl:text-7xl text-brand-fg"
          >
            Où va l&apos;argent public&nbsp;?
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            La France dépense{" "}
            <strong className="font-bold text-danger whitespace-nowrap">{total}&nbsp;milliards d&apos;euros</strong>{" "}
            par an.
            <br />
            Soit{" "}
            <strong className="font-bold text-danger whitespace-nowrap">
              {formatEuros(headlinePerCapita())} par habitant
            </strong>
            .
            <br />
            Savez-vous à quoi ils servent&nbsp;?
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              href="/jeu"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 min-h-[56px] px-8 whitespace-nowrap rounded-2xl bg-brand text-white font-heading font-bold text-lg shadow-lg hover:bg-brand-hover hover-lift active:scale-95 transition-all"
            >
              Jouer à Budget Swipe
              <ChainsawIcon size={24} variant="white" />
            </Link>
            <Link
              href="/#categories"
              className="inline-flex w-full sm:w-auto items-center justify-center min-h-[56px] px-8 whitespace-nowrap rounded-2xl border-2 border-brand-fg/40 dark:border-muted-foreground/50 text-brand-fg dark:text-foreground font-heading font-bold text-lg hover:bg-muted/60 hover-lift transition-all"
            >
              Explorer les catégories
            </Link>
          </div>

          <p className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm">
            <span className="rounded-full bg-brand-fg/15 px-3 py-1 font-bold text-brand-fg">{totalCards} cartes</span>
            <span className="rounded-full bg-primary/15 px-3 py-1 font-bold text-primary">{totalCategories} catégories</span>
            <span className="rounded-full bg-warning/15 px-3 py-1 font-bold text-warning">3 niveaux</span>
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            Dépense publique {HEADLINE_FIGURE.year} de l&apos;État, de la Sécurité sociale et des collectivités. Source&nbsp;: {HEADLINE_FIGURE.source}.
          </p>

          <div className="mt-4">
            <PublicStatsLine />
          </div>
        </div>

        {previewCard && <HeroCardPreview />}
      </div>
    </section>
  );
}

/** Aperçu décoratif du jeu : une carte qui oscille entre « garder » et « à revoir ». */
function HeroCardPreview() {
  return (
    <div className="relative mx-auto h-[300px] w-[240px] sm:h-[340px] sm:w-[270px]" aria-hidden="true">
      <div className="absolute inset-0 translate-y-4 scale-95 rounded-3xl bg-card/70 border border-border" />
      <div
        className="hero-swipe absolute inset-0 overflow-hidden rounded-3xl bg-card border border-border shadow-(--shadow-card)"
        style={catStyle(previewCard.deckId)}
      >
        <div
          className="absolute inset-x-0 top-0 h-28"
          style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--cat) 25%, transparent), transparent)" }}
        />
        <div className="relative flex h-full flex-col gap-3 p-5 text-left">
          <div className="flex items-center gap-2">
            <CategoryBadge deckId={previewCard.deckId} size={32} />
            <span className="kicker cat-text">{getDeckName(previewCard.deckId)}</span>
          </div>
          <p className="font-heading text-2xl font-extrabold leading-tight text-foreground">{previewCard.title}</p>
          <p className="numeral text-4xl text-danger">{formatBillions(previewCard.amountBillions)}</p>
          <p className="text-sm text-muted-foreground">
            soit <span className="font-bold text-primary">{formatEuros(previewCard.costPerCitizen)}</span> par habitant
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-primary text-primary">
              <ShieldIcon size={22} />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-danger">
              <ChainsawIcon size={22} />
            </span>
          </div>
        </div>
        <span className="hero-stamp-keep absolute right-4 top-5 rotate-12 rounded-lg border-[3px] border-primary bg-card/90 px-2 py-0.5 font-heading text-lg font-black uppercase text-primary">
          Garder
        </span>
        <span className="hero-stamp-cut absolute left-4 top-5 -rotate-12 rounded-lg border-[3px] border-danger bg-card/90 px-2 py-0.5 font-heading text-lg font-black uppercase text-danger">
          À revoir
        </span>
      </div>
    </div>
  );
}
