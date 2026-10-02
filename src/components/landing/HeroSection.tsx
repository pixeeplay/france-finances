import Link from "next/link";
import { HEADLINE_FIGURE, headlinePerCapita } from "@/data/headline";
import { formatEuros } from "@/lib/format";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { PublicStatsLine } from "./PublicStatsLine";

const frInteger = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function HeroSection() {
  const total = frInteger.format(HEADLINE_FIGURE.amountBillions);

  return (
    <section id="hero" aria-labelledby="hero-title" className="pt-14 pb-16 md:pt-24 md:pb-24 xl:pt-28 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1
          id="hero-title"
          className="font-heading font-black text-[2.75rem] leading-[1.05] sm:text-6xl xl:text-7xl tracking-tight text-brand-fg"
        >
          Où va l&apos;argent public&nbsp;?
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Dépense publique {HEADLINE_FIGURE.year} (État, Sécurité sociale, collectivités). Source&nbsp;: {HEADLINE_FIGURE.source}.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/jeu"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-3 min-h-[56px] px-9 rounded-2xl bg-brand text-white font-heading font-bold text-lg shadow-lg hover:bg-brand-hover hover-lift active:scale-95 transition-all"
          >
            Jouer à Budget Swipe
            <ChainsawIcon size={24} variant="white" />
          </Link>
          <Link
            href="/#categories"
            className="inline-flex w-full sm:w-auto items-center justify-center min-h-[56px] px-9 rounded-2xl border-2 border-brand-fg/40 dark:border-muted-foreground/50 text-brand-fg dark:text-foreground font-heading font-bold text-lg hover:bg-muted/60 hover-lift transition-all"
          >
            Explorer les catégories
          </Link>
        </div>

        <div className="mt-8">
          <PublicStatsLine />
        </div>
      </div>
    </section>
  );
}
