import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Simulator } from "@/components/simulateur/Simulator";
import { STATE_MISSIONS_2026 } from "@/data/chiffres";
import { FISCAL_SOURCES, IR_INCOME_YEAR, IR_YEAR } from "@/data/fiscal-2026";
import { parseSimulatorParams } from "@/lib/taxCalculator";

const TITLE = "Simulateur : impôts et cotisations sur un salaire";
const DESCRIPTION =
  "Estimez l'impôt sur le revenu, la CSG, les cotisations retraite et la TVA prélevés sur un salaire, avec le barème 2026, puis leur répartition indicative dans le budget de l'État.";

export const metadata: Metadata = {
  title: `${TITLE} — france-finances.com`,
  description: DESCRIPTION,
  alternates: { canonical: "/simulateur" },
  openGraph: {
    title: `${TITLE} — france-finances.com`,
    description: DESCRIPTION,
    url: "https://france-finances.com/simulateur",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function SimulateurPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialInput = parseSimulatorParams(await searchParams);

  return (
    <PageShell>
      <header className="pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Barème {IR_YEAR} · revenus {IR_INCOME_YEAR}
        </p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Ce qui est prélevé sur un salaire
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Une estimation pédagogique, calculée dans votre navigateur : aucune donnée n&apos;est
          envoyée ni conservée. Pour votre impôt réel, utilisez le{" "}
          <a
            href="https://www.impots.gouv.fr/simulateurs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            simulateur officiel de la DGFiP
          </a>
          .
        </p>
      </header>

      <Simulator initialInput={initialInput} budgetItems={STATE_MISSIONS_2026.items} />

      <section aria-labelledby="sim-method-title" className="mt-12 border-t border-border pt-8">
        <h2 id="sim-method-title" className="font-heading text-lg font-bold text-foreground mb-3">
          Hypothèses et limites
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            Salarié du secteur privé, non cadre, hors Alsace-Moselle. Les cotisations patronales ne
            sont pas comptées.
          </li>
          <li>
            Un seul revenu par foyer, sans revenus du capital, réductions ou crédits d&apos;impôt.
            Une personne seule avec enfant est considérée comme parent isolé (case T).
          </li>
          <li>
            Impôt sur le revenu : barème, quotient familial et décote de la loi de finances pour{" "}
            {IR_YEAR}, applicables aux revenus {IR_INCOME_YEAR}.
          </li>
          <li>
            TVA : on suppose que 80 % du revenu net est consommé, avec un taux moyen apparent de
            13 %. C&apos;est un ordre de grandeur, pas une donnée officielle.
          </li>
          <li>
            La répartition par mission est une illustration : le budget de l&apos;État ne flèche pas
            une recette vers une dépense.
          </li>
        </ul>

        <h3 className="mt-6 mb-2 font-heading text-base font-semibold text-foreground">Sources</h3>
        <ul className="space-y-2 text-sm">
          {[...FISCAL_SOURCES, STATE_MISSIONS_2026.source].map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-foreground hover:text-primary"
              >
                {s.label}
              </a>{" "}
              <span className="text-muted-foreground">({s.date})</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted-foreground">
          Pour aller plus loin :{" "}
          <Link href="/chiffres" className="underline underline-offset-2 hover:text-foreground">
            les chiffres des finances publiques
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
