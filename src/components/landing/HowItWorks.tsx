import type { ReactNode } from "react";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ChainsawIcon } from "@/components/ChainsawIcon";
import { ReinforceIcon } from "@/components/ReinforceIcon";
import { StopIcon } from "@/components/StopIcon";

interface Direction {
  gesture: string;
  arrow: string;
  label: string;
  meaning: string;
  icon: ReactNode;
  /** Couleur de sens (pastille) */
  swatch: string;
  level: string;
}

// Reflète les couleurs réellement utilisées en jeu (SwipeCard, SwipeStack).
const DIRECTIONS: Direction[] = [
  {
    gesture: "la gauche",
    arrow: "\u2190",
    label: "OK",
    meaning: "La dépense vous paraît justifiée.",
    icon: <ShieldIcon size={18} className="text-primary" />,
    swatch: "bg-primary",
    level: "Tous niveaux",
  },
  {
    gesture: "la droite",
    arrow: "\u2192",
    label: "À revoir",
    meaning: "Elle mérite d\u2019être réexaminée.",
    icon: <ChainsawIcon size={18} />,
    swatch: "bg-danger",
    level: "Niveau 1",
  },
  {
    gesture: "la droite",
    arrow: "\u2192",
    label: "Réduire",
    meaning: "Son montant pourrait baisser.",
    icon: <ChainsawIcon size={18} variant="orange" />,
    swatch: "bg-warning",
    level: "Niveau 2",
  },
  {
    gesture: "le haut",
    arrow: "\u2191",
    label: "Renforcer",
    meaning: "Il faudrait y consacrer davantage.",
    icon: <ReinforceIcon size={18} />,
    swatch: "bg-info",
    level: "Niveau 2",
  },
  {
    gesture: "le bas",
    arrow: "\u2193",
    label: "Injustifié",
    meaning: "Elle ne devrait pas exister sous cette forme.",
    icon: <StopIcon size={18} />,
    swatch: "bg-danger",
    level: "Niveau 2",
  },
];

/** Mode d'emploi : la légende des couleurs est aussi celle du jeu. */
export function HowItWorks() {
  return (
    <section id="comment-ca-marche" aria-labelledby="howto-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid gap-8 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="kicker text-muted-foreground mb-3">Mode d&apos;emploi</p>
          <h2 id="howto-title" className="text-3xl md:text-4xl font-semibold leading-tight">
            Une carte, une dépense, un geste
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Chaque partie compte dix à douze cartes. À la fin, vous obtenez votre profil
            budgétaire et la comparaison avec les autres joueurs. Le niveau&nbsp;3 ajoute
            un micro-audit de chaque dépense.
          </p>
        </header>

        <dl className="lg:col-span-8 grid sm:grid-cols-2 sm:gap-x-8 border-t border-border">
          {DIRECTIONS.map((d) => (
            <div key={d.label} className="py-4 border-b border-border">
              <dt className="flex items-center gap-2">
                <span className={`mr-2 h-3 w-3 shrink-0 rounded-[2px] ${d.swatch}`} aria-hidden="true" />
                {d.icon}
                <span className="font-serif text-xl font-semibold">{d.label}</span>
              </dt>
              <dd className="mt-1 pl-7 text-sm text-muted-foreground">{d.meaning}</dd>
              <dd className="mt-2 pl-7 kicker text-muted-foreground">
                <span aria-hidden="true">{d.arrow} </span>
                Glisser vers {d.gesture} · {d.level}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
