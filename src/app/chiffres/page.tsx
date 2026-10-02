import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { BarList, DataSection, SourceNote, StatTile } from "@/components/chiffres/DataBlocks";
import {
  CURRENT_DEBT,
  DEBT_TIMELINE,
  EU_COMPARISON,
  HEALTH_SPENDING,
  POPULATION_2026,
  POPULATION_SOURCE,
  PUBLIC_FINANCES,
  PUBLIC_SPENDING_BY_FUNCTION,
  SOCIAL_PROTECTION,
  STATE_BUDGET_2026,
  STATE_MISSIONS_2026,
  getChiffresSources,
  type AmountItem,
} from "@/data/chiffres";
import { formatBillionsExact, formatEuros, formatNumber } from "@/lib/format";

const TITLE = "Les chiffres des finances publiques";
const DESCRIPTION =
  "Dette, déficit, budget de l'État 2026, dépense publique par fonction, protection sociale, santé et comparaison européenne : les chiffres officiels, sourcés.";

export const metadata: Metadata = {
  title: `${TITLE} — france-finances.com`,
  description: DESCRIPTION,
  alternates: { canonical: "/chiffres" },
  openGraph: {
    title: `${TITLE} — france-finances.com`,
    description: DESCRIPTION,
    url: "https://france-finances.com/chiffres",
    type: "article",
    locale: "fr_FR",
  },
};

const NAV = [
  { id: "essentiel", label: "L'essentiel" },
  { id: "etat", label: "Budget de l'État" },
  { id: "dette", label: "Dette" },
  { id: "depense", label: "Dépense publique" },
  { id: "protection-sociale", label: "Protection sociale" },
  { id: "sante", label: "Santé" },
  { id: "europe", label: "Europe" },
  { id: "sources", label: "Sources" },
];

const TOP_MISSIONS = 10;

function sum(items: readonly AmountItem[]): number {
  return items.reduce((s, i) => s + i.amountBn, 0);
}

function missionBars() {
  const sorted = [...STATE_MISSIONS_2026.items].sort((a, b) => b.amountBn - a.amountBn);
  const head = sorted.slice(0, TOP_MISSIONS);
  const rest = sorted.slice(TOP_MISSIONS);
  const bars = head.map((m) => ({ label: m.label, value: m.amountBn, display: formatBillionsExact(m.amountBn) }));
  const restBn = sum(rest);
  return [
    ...bars,
    { label: `${rest.length} autres missions`, value: restBn, display: formatBillionsExact(restBn) },
  ];
}

function amountBars(items: readonly AmountItem[]) {
  return items.map((i) => ({ label: i.label, value: i.amountBn, display: formatBillionsExact(i.amountBn) }));
}

export default function ChiffresPage() {
  const debtPerCapita = (CURRENT_DEBT.amountBn * 1e9) / POPULATION_2026;
  const spendingTotal = sum(PUBLIC_SPENDING_BY_FUNCTION.items);
  const missionsTotal = sum(STATE_MISSIONS_2026.items);

  return (
    <PageShell>
      <header className="pb-6 border-b-2 border-foreground">
        <p className="kicker text-muted-foreground">Données officielles · mise à jour octobre 2026</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold leading-[1.05] text-foreground">{TITLE}</h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Les grands agrégats des finances publiques françaises, tels que publiés par l&apos;Insee,
          le ministère chargé du budget, le Parlement, la DREES et Eurostat. Chaque bloc indique
          l&apos;année des données et sa source.
        </p>
      </header>

      <nav aria-label="Sommaire" className="-mx-4 px-4 sm:mx-0 sm:px-0 py-2 mb-2 overflow-x-auto scrollbar-hide">
        <ul className="flex gap-x-5 w-max sm:w-auto sm:flex-wrap">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex items-center min-h-[44px] text-sm font-medium text-foreground underline-offset-4 hover:underline whitespace-nowrap"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <DataSection id="essentiel" title="L'essentiel">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <StatTile
            label="Dette publique"
            value={formatBillionsExact(CURRENT_DEBT.amountBn)}
            detail={`${formatNumber(CURRENT_DEBT.pctGdp, 1)} % du PIB, ${CURRENT_DEBT.period}`}
          />
          <StatTile
            label="Dette par habitant"
            value={formatEuros(Math.round(debtPerCapita / 10) * 10)}
            detail={`Sur ${formatNumber(POPULATION_2026 / 1e6, 1)} millions d'habitants`}
          />
          <StatTile
            label={`Déficit public ${PUBLIC_FINANCES.year}`}
            value={formatBillionsExact(PUBLIC_FINANCES.deficitBn)}
            detail={`${formatNumber(PUBLIC_FINANCES.deficitPctGdp, 1)} % du PIB`}
          />
          <StatTile
            label={`Dépense publique ${PUBLIC_FINANCES.year}`}
            value={`${formatNumber(PUBLIC_FINANCES.spendingPctGdp, 1)} %`}
            detail="du PIB, toutes administrations publiques"
          />
          <StatTile
            label={`Prélèvements obligatoires ${PUBLIC_FINANCES.year}`}
            value={`${formatNumber(PUBLIC_FINANCES.leviesPctGdp, 1)} %`}
            detail="du PIB, nets des crédits d'impôt"
          />
          <StatTile
            label={`Intérêts de la dette ${PUBLIC_FINANCES.year}`}
            value={formatBillionsExact(PUBLIC_FINANCES.interestBn)}
            detail="charge d'intérêts des administrations publiques"
          />
        </div>
        <SourceNote source={PUBLIC_FINANCES.source} />
        <SourceNote source={CURRENT_DEBT.source} />
        <SourceNote source={POPULATION_SOURCE} />
      </DataSection>

      <DataSection
        id="etat"
        title={`Le budget de l'État ${STATE_BUDGET_2026.year}`}
        intro={
          <p>
            L&apos;État ne représente qu&apos;une partie de la dépense publique : la Sécurité sociale
            et les collectivités locales ont leurs propres budgets.
          </p>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
          <StatTile label="Recettes nettes" value={formatBillionsExact(STATE_BUDGET_2026.netRevenueM / 1000)} />
          <StatTile label="Dépenses nettes" value={formatBillionsExact(STATE_BUDGET_2026.netExpenditureM / 1000)} />
          <StatTile
            label="Solde budgétaire"
            value={formatBillionsExact(STATE_BUDGET_2026.balanceM / 1000)}
            detail="budget général, budgets annexes et comptes spéciaux"
          />
        </div>
        <SourceNote source={STATE_BUDGET_2026.source} period="loi de finances pour 2026" />

        <h3 className="mt-10 mb-1 text-xl font-semibold text-foreground">Crédits par mission</h3>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Crédits de paiement, {formatBillionsExact(missionsTotal, 0)} au total hors remboursements et
          dégrèvements d&apos;impôts. Ils incluent les cotisations versées pour les retraites des
          fonctionnaires de chaque mission. La charge de la dette de l&apos;État figure dans
          « Engagements financiers ».
        </p>
        <BarList items={missionBars()} caption="Crédits de paiement par mission du budget général, en milliards d'euros" />
        <SourceNote source={STATE_MISSIONS_2026.source} period={STATE_MISSIONS_2026.period} />
      </DataSection>

      <DataSection
        id="dette"
        title="La dette publique"
        intro={
          <p>
            Dette des administrations publiques au sens de Maastricht, en pourcentage du PIB
            (montant en milliards d&apos;euros quand la source le précise).
          </p>
        }
      >
        <BarList
          caption="Dette publique en pourcentage du PIB"
          items={DEBT_TIMELINE.items.map((p) => ({
            label: p.period,
            value: p.pctGdp,
            display: `${formatNumber(p.pctGdp, 1)} %${p.amountBn ? ` · ${formatBillionsExact(p.amountBn)}` : ""}`,
          }))}
        />
        <SourceNote source={DEBT_TIMELINE.source} period="annuelles 2019-2025" />
        <SourceNote source={CURRENT_DEBT.source} period="du 2e trimestre 2026" />
      </DataSection>

      <DataSection
        id="depense"
        title="À quoi sert la dépense publique"
        intro={
          <p>
            Dépense de l&apos;ensemble des administrations publiques (État, Sécurité sociale,
            collectivités) ventilée par fonction selon la nomenclature internationale COFOG.
            Total : {formatBillionsExact(spendingTotal, 0)}.
          </p>
        }
      >
        <BarList
          caption="Dépense publique par fonction, en milliards d'euros"
          items={PUBLIC_SPENDING_BY_FUNCTION.items.map((i) => ({
            label: i.label,
            value: i.amountBn,
            display: `${formatBillionsExact(i.amountBn, 0)} · ${Math.round((i.amountBn / spendingTotal) * 1000)} € sur 1 000 €`,
          }))}
        />
        <SourceNote source={PUBLIC_SPENDING_BY_FUNCTION.source} period={PUBLIC_SPENDING_BY_FUNCTION.period} />
      </DataSection>

      <DataSection
        id="protection-sociale"
        title="La protection sociale"
        intro={<p>Premier poste de dépense publique, hors santé, détaillé par risque.</p>}
      >
        <BarList caption="Dépense de protection sociale par risque" items={amountBars(SOCIAL_PROTECTION.items)} />
        <SourceNote source={SOCIAL_PROTECTION.source} period={SOCIAL_PROTECTION.period} />
      </DataSection>

      <DataSection
        id="sante"
        title="Les dépenses de santé"
        intro={
          <p>
            Dépense courante de santé au sens international ({formatBillionsExact(sum(HEALTH_SPENDING.items))}).
            Ce périmètre comprend aussi les dépenses des complémentaires santé et le reste à
            charge des ménages : il n&apos;est pas comparable avec la fonction « Santé » de la dépense
            publique ci-dessus.
          </p>
        }
      >
        <BarList caption="Dépense courante de santé par poste" items={amountBars(HEALTH_SPENDING.items)} />
        <SourceNote source={HEALTH_SPENDING.source} period={HEALTH_SPENDING.period} />
      </DataSection>

      <DataSection
        id="europe"
        title="Comparaison européenne"
        intro={<p>Dette, déficit et dépense publics, en pourcentage du PIB.</p>}
      >
        <div className="overflow-x-auto border-y-2 border-foreground">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Dette, déficit et dépense publics en {EU_COMPARISON.period}, en pourcentage du PIB
            </caption>
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="kicker px-3 py-2 text-left font-medium">Pays</th>
                <th scope="col" className="kicker px-3 py-2 text-right font-medium">Dette</th>
                <th scope="col" className="kicker px-3 py-2 text-right font-medium">Déficit</th>
                <th scope="col" className="kicker px-3 py-2 text-right font-medium">Dépense</th>
              </tr>
            </thead>
            <tbody>
              {EU_COMPARISON.items.map((c) => (
                <tr key={c.code} className={`border-t border-border ${c.highlight ? "font-semibold bg-muted/40" : ""}`}>
                  <th scope="row" className="px-3 py-2 text-left font-normal">
                    {c.highlight ? <strong>{c.country}</strong> : c.country}
                  </th>
                  <td className="numeral px-3 py-2 text-right">{formatNumber(c.debtPctGdp, 1)} %</td>
                  <td className="numeral px-3 py-2 text-right">{formatNumber(c.deficitPctGdp, 1)} %</td>
                  <td className="numeral px-3 py-2 text-right">{formatNumber(c.spendingPctGdp, 1)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote source={EU_COMPARISON.source} period={EU_COMPARISON.period} />
      </DataSection>

      <DataSection id="sources" title="Sources et méthode">
        <ul className="space-y-2 text-sm">
          {getChiffresSources().map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-foreground hover:text-primary"
              >
                {s.label}
              </a>{" "}
              <span className="font-mono text-xs text-muted-foreground">({s.date})</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          Les montants sont arrondis. La dette par habitant est un ratio indicatif (dette
          publique totale divisée par la population). Une erreur ? Signalez-la via la page{" "}
          <Link href="/contribuer" className="underline underline-offset-2 hover:text-foreground">
            Contribuer
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/simulateur"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-md bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Estimer ma contribution
          </Link>
          <Link
            href="/jeu"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-md border border-foreground/40 text-foreground font-semibold text-sm hover:bg-muted transition-colors"
          >
            Jouer à Budget Swipe
          </Link>
        </div>
      </DataSection>
    </PageShell>
  );
}
