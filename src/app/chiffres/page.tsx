import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { UiIcon } from "@/components/icons/UiIcon";
import { SourceNote, SourcesLine } from "@/components/chiffres/DataBlocks";
import {
  BigStat,
  ChartFigure,
  DataTable,
  Per1000Coins,
  ShareLegend,
  ThemeSection,
} from "@/components/chiffres/ChiffresBlocks";
import { BarsChart, DebtAreaChart, RevenueDonutChart } from "@/components/chiffres/ChiffresCharts";
import { CHART_PALETTE_CLASS, TONE_CLASSES } from "@/components/chiffres/palette";
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
  STATE_TAX_REVENUE_2026,
  getChiffresSources,
} from "@/data/chiffres";
import {
  DEBT_CHART_HEIGHT,
  DONUT_CHART_HEIGHT,
  barsChartHeight,
  cofogColor,
  debtChangePoints,
  debtSeries,
  euDebtBars,
  perCapita,
  perCapitaComparison,
  splitPer1000,
  sumAmounts,
  toBarData,
  toShares,
  topWithRest,
  type ChartTone,
} from "@/lib/chiffresCharts";
import { formatBillionsExact, formatEuros, formatNumber } from "@/lib/format";

const TITLE = "Les chiffres des finances publiques";
const DESCRIPTION =
  "Dette, déficit, budget de l'État 2026, dépense publique par fonction, protection sociale, santé et comparaison européenne : les chiffres officiels, sourcés, en graphiques.";

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

const NAV: readonly { id: string; label: string; tone: ChartTone }[] = [
  { id: "essentiel", label: "L'essentiel", tone: "blue" },
  { id: "depense", label: "1 000 €", tone: "emerald" },
  { id: "etat", label: "État 2026", tone: "blue" },
  { id: "dette", label: "Dette", tone: "red" },
  { id: "protection-sociale", label: "Protection sociale", tone: "violet" },
  { id: "sante", label: "Santé", tone: "cyan" },
  { id: "europe", label: "Europe", tone: "amber" },
  { id: "sources", label: "Sources", tone: "slate" },
];

const TOP_MISSIONS = 10;
const REVENUE_TONES: readonly ChartTone[] = ["emerald", "blue", "violet", "amber"];

const fmtBn = (v: number) => formatBillionsExact(v);
const fmtBn0 = (v: number) => formatBillionsExact(v, 0);
const fmtPct = (v: number) => `${formatNumber(v, 1)} %`;

function cofogAmount(label: string): number {
  return PUBLIC_SPENDING_BY_FUNCTION.items.find((i) => i.label === label)?.amountBn ?? 0;
}

export default function ChiffresPage() {
  const debtPerCapita = Math.round(perCapita(CURRENT_DEBT.amountBn, POPULATION_2026) / 10) * 10;
  const interestPerCapita = perCapita(PUBLIC_FINANCES.interestBn, POPULATION_2026);
  const spendingTotal = sumAmounts(PUBLIC_SPENDING_BY_FUNCTION.items);
  const missionsTotal = sumAmounts(STATE_MISSIONS_2026.items);
  const taxTotal = sumAmounts(STATE_TAX_REVENUE_2026.items);
  const debtGain = debtChangePoints(DEBT_TIMELINE.items);
  const firstDebt = DEBT_TIMELINE.items[0];

  const per1000 = splitPer1000(PUBLIC_SPENDING_BY_FUNCTION.items);
  const missions = toBarData(
    topWithRest(STATE_MISSIONS_2026.items, TOP_MISSIONS, (n) => `${n} autres missions`),
    fmtBn,
    ["blue"],
    44,
  ).map((d) =>
    d.label.startsWith("Engagements financiers")
      ? { ...d, tone: "red" as const, highlight: true }
      : d.label.endsWith("autres missions")
        ? { ...d, tone: "slate" as const }
        : d,
  );
  const revenue = toShares(STATE_TAX_REVENUE_2026.items, fmtBn, REVENUE_TONES);
  const debt = debtSeries(DEBT_TIMELINE.items);
  const interestComparison = perCapitaComparison(
    [
      {
        label: "Intérêts de la dette publique",
        amountBn: PUBLIC_FINANCES.interestBn,
        year: PUBLIC_FINANCES.year,
        highlight: true,
      },
      { label: "Enseignement", amountBn: cofogAmount("Enseignement"), year: PUBLIC_SPENDING_BY_FUNCTION.period },
      { label: "Défense", amountBn: cofogAmount("Défense"), year: PUBLIC_SPENDING_BY_FUNCTION.period },
      {
        label: "Ordre et sécurité publics",
        amountBn: cofogAmount("Ordre et sécurité publics"),
        year: PUBLIC_SPENDING_BY_FUNCTION.period,
      },
      {
        label: "Culture, loisirs et culte",
        amountBn: cofogAmount("Loisirs, culture et culte"),
        year: PUBLIC_SPENDING_BY_FUNCTION.period,
      },
      {
        label: "Protection de l'environnement",
        amountBn: cofogAmount("Protection de l'environnement"),
        year: PUBLIC_SPENDING_BY_FUNCTION.period,
      },
    ],
    POPULATION_2026,
    formatEuros,
  );
  // Séries simples : une seule couleur, celle de la fonction (catégorie du jeu)
  const socialColor = cofogColor("Protection sociale");
  const healthColor = cofogColor("Santé");
  const social = toBarData(SOCIAL_PROTECTION.items, fmtBn0).map((d) => ({ ...d, color: socialColor }));
  const health = toBarData(HEALTH_SPENDING.items, fmtBn).map((d) => ({ ...d, color: healthColor }));
  const eu = euDebtBars(EU_COMPARISON.items, fmtPct);

  // Phrases-chocs (calculées sur les données affichées)
  const socialTotal = sumAmounts(SOCIAL_PROTECTION.items);
  const pensionShare = Math.round((SOCIAL_PROTECTION.items[0].amountBn / socialTotal) * 100);
  const healthTotal = sumAmounts(HEALTH_SPENDING.items);
  const hospitalPer100 = Math.round((HEALTH_SPENDING.items[0].amountBn / healthTotal) * 100);
  const statePer100 = Math.round((STATE_BUDGET_2026.netRevenueM / STATE_BUDGET_2026.netExpenditureM) * 100);
  const defensePerCapita = interestComparison.find((d) => d.label.startsWith("Défense"));
  const france = EU_COMPARISON.items.find((c) => c.highlight);
  const euroArea = EU_COMPARISON.items.find((c) => c.code === "EA");

  return (
    <PageShell>
      <div className={CHART_PALETTE_CLASS}>
        {/* En-tête */}
        <header className="pb-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
            <UiIcon name="chart" size={14} />
            Données officielles · mise à jour octobre 2026
          </p>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-black leading-[1.05] text-brand-fg">
            {TITLE}
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Dette, budget de l&apos;État, dépense publique : les chiffres officiels (Insee, Parlement, DREES,
            Eurostat), en graphiques.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <BigStat
              tone="red"
              label="Dette publique"
              value={formatBillionsExact(CURRENT_DEBT.amountBn, 0)}
              detail={`${formatNumber(CURRENT_DEBT.pctGdp, 1)} % du PIB, ${CURRENT_DEBT.period}`}
            />
            <BigStat
              tone="red"
              label="Par habitant"
              value={formatEuros(debtPerCapita)}
              detail={`${formatNumber(POPULATION_2026 / 1e6, 1)} M d'habitants`}
            />
          </div>
        </header>

        {/* Sommaire collant */}
        <nav
          aria-label="Sommaire"
          className="sticky top-16 z-30 -mx-4 sm:-mx-6 mt-6 border-y border-border bg-background/90 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/75"
        >
          <ul className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {NAV.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40 whitespace-nowrap"
                >
                  <span className={`size-2 rounded-full ${TONE_CLASSES[item.tone].dot}`} aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 1. L'essentiel */}
        <ThemeSection
          id="essentiel"
          tone="blue"
          icon={<UiIcon name="chart" size={22} />}
          kicker="L'essentiel"
          title={`Les comptes publics ${PUBLIC_FINANCES.year} en quatre chiffres`}
          punch={
            <>
              Plus de la moitié de la richesse produite passe par la dépense publique&nbsp;:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {formatNumber(PUBLIC_FINANCES.spendingPctGdp, 1)}&nbsp;% du PIB
              </span>
              .
            </>
          }
          intro={<p>État, Sécurité sociale et collectivités locales réunis (« administrations publiques »).</p>}
        >
          <div className="grid grid-cols-2 gap-3">
            <BigStat
              tone="amber"
              label={`Déficit public ${PUBLIC_FINANCES.year}`}
              value={formatBillionsExact(PUBLIC_FINANCES.deficitBn)}
              detail={`${formatNumber(PUBLIC_FINANCES.deficitPctGdp, 1)} % du PIB`}
            />
            <BigStat
              tone="blue"
              label={`Dépense publique ${PUBLIC_FINANCES.year}`}
              value={`${formatNumber(PUBLIC_FINANCES.spendingPctGdp, 1)} %`}
              detail="du PIB"
            />
            <BigStat
              tone="emerald"
              label={`Prélèvements obligatoires ${PUBLIC_FINANCES.year}`}
              value={`${formatNumber(PUBLIC_FINANCES.leviesPctGdp, 1)} %`}
              detail="du PIB, nets des crédits d'impôt"
            />
            <BigStat
              tone="violet"
              label="Dépense publique totale 2024"
              value={formatBillionsExact(spendingTotal, 0)}
              detail="toutes fonctions (COFOG)"
            />
          </div>
          <SourcesLine sources={[PUBLIC_FINANCES.source, PUBLIC_SPENDING_BY_FUNCTION.source, CURRENT_DEBT.source, POPULATION_SOURCE]} />
        </ThemeSection>

        {/* 2. 1 000 € de dépense publique */}
        <ThemeSection
          id="depense"
          tone="emerald"
          icon={<CategoryIcon deckId="social" size={22} />}
          kicker="Dépense publique"
          title="Sur 1 000 € de dépense publique, où va l'argent ?"
          punch={
            <>
              <span style={{ color: cofogColor(per1000[0].label) }}>{per1000[0].euros}&nbsp;€ sur 1&nbsp;000&nbsp;€</span>{" "}
              vont à la protection sociale&nbsp;; avec la santé, c&apos;est{" "}
              {per1000[0].euros + per1000[1].euros}&nbsp;€.
            </>
          }
          intro={
            <p>
              Dépense de l&apos;ensemble des administrations publiques en {PUBLIC_SPENDING_BY_FUNCTION.period} (
              {formatBillionsExact(spendingTotal, 0)}), ramenée à 1 000 €.
            </p>
          }
        >
          <ChartFigure
            id="mille"
            title="Vos 1 000 € de dépense publique"
            subtitle={`Euros par fonction, ${PUBLIC_SPENDING_BY_FUNCTION.period}`}
            description={`Répartition de 1 000 € de dépense publique selon la nomenclature internationale des fonctions (COFOG), ${PUBLIC_SPENDING_BY_FUNCTION.period}. Arrondis à l'euro, total 1 000 €. Les intérêts de la dette sont comptés dans « Services publics généraux ». Chaque fonction garde la couleur de la catégorie correspondante du jeu.`}
            chart={<Per1000Coins slices={per1000} colorFor={(sl) => cofogColor(sl.label)} />}
            table={
              <DataTable
                caption={`Dépense publique par fonction en ${PUBLIC_SPENDING_BY_FUNCTION.period}`}
                columns={[
                  { header: "Fonction" },
                  { header: "Sur 1 000 €", numeric: true },
                  { header: "Montant", numeric: true },
                  { header: "Part", numeric: true },
                ]}
                rows={per1000.map((sl) => [sl.label, `${sl.euros} €`, fmtBn0(sl.amountBn), fmtPct(sl.share)])}
              />
            }
            source={PUBLIC_SPENDING_BY_FUNCTION.source}
            period={PUBLIC_SPENDING_BY_FUNCTION.period}
          />
        </ThemeSection>

        {/* 3. Budget de l'État */}
        <ThemeSection
          id="etat"
          tone="blue"
          icon={<CategoryIcon deckId="etat" size={22} />}
          kicker={`Budget de l'État ${STATE_BUDGET_2026.year}`}
          title="Ce que l'État encaisse, ce qu'il dépense"
          punch={
            <>
              Pour 100&nbsp;€ dépensés, l&apos;État encaisse{" "}
              <span className="text-emerald-600 dark:text-emerald-400">{statePer100}&nbsp;€</span> de recettes.
            </>
          }
          intro={
            <p>
              L&apos;État n&apos;est qu&apos;une partie de la dépense publique : la Sécurité sociale et les
              collectivités locales ont leurs propres budgets.
            </p>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <BigStat
              tone="emerald"
              label="Recettes nettes"
              value={formatBillionsExact(STATE_BUDGET_2026.netRevenueM / 1000)}
            />
            <BigStat
              tone="blue"
              label="Dépenses nettes"
              value={formatBillionsExact(STATE_BUDGET_2026.netExpenditureM / 1000)}
            />
            <BigStat
              tone="red"
              label="Solde budgétaire"
              value={formatBillionsExact(STATE_BUDGET_2026.balanceM / 1000)}
              detail="tous budgets de l'État"
              className="col-span-2 sm:col-span-1"
            />
          </div>
          <SourceNote source={STATE_BUDGET_2026.source} period="loi de finances pour 2026" />

          <ChartFigure
            id="recettes"
            title="D'où viennent les impôts de l'État"
            subtitle={`Recettes fiscales nettes prévues pour 2026 : ${formatBillionsExact(taxTotal)}`}
            description={`Recettes fiscales nettes prévues pour 2026 : ${formatBillionsExact(taxTotal)}, après remboursements et dégrèvements. Une partie est ensuite reversée aux collectivités et à l'Union européenne.`}
            height={DONUT_CHART_HEIGHT}
            chart={<RevenueDonutChart data={revenue} centerValue={fmtBn0(taxTotal)} centerLabel="recettes fiscales" />}
            legend={<ShareLegend items={revenue} />}
            table={
              <DataTable
                caption="Recettes fiscales nettes de l'État prévues pour 2026"
                columns={[{ header: "Impôt" }, { header: "Montant", numeric: true }, { header: "Part", numeric: true }]}
                rows={revenue.map((r) => [r.label, r.display, `${r.pct} %`])}
              />
            }
            source={STATE_TAX_REVENUE_2026.source}
            period={STATE_TAX_REVENUE_2026.period}
          />

          <ChartFigure
            id="missions"
            title="Les dix premières missions de l'État"
            subtitle={`Crédits de paiement ${STATE_BUDGET_2026.year}, en milliards d'euros. Charge de la dette en rouge.`}
            description={`Crédits de paiement ${STATE_BUDGET_2026.year}, ${formatBillionsExact(missionsTotal, 0)} au total hors remboursements et dégrèvements d'impôts. Ils incluent les retraites des fonctionnaires de chaque mission. La charge de la dette figure dans « Engagements financiers » (en rouge).`}
            height={barsChartHeight(missions.length)}
            chart={<BarsChart data={missions} valueName="Crédits" />}
            table={
              <DataTable
                caption={`Crédits de paiement par mission du budget général ${STATE_BUDGET_2026.year}`}
                columns={[{ header: "Mission" }, { header: "Crédits", numeric: true }]}
                rows={[...STATE_MISSIONS_2026.items]
                  .sort((a, b) => b.amountBn - a.amountBn)
                  .map((m) => [m.label, formatBillionsExact(m.amountBn, 2)])}
              />
            }
            source={STATE_MISSIONS_2026.source}
            period={STATE_MISSIONS_2026.period}
          />
        </ThemeSection>

        {/* 4. Dette */}
        <ThemeSection
          id="dette"
          tone="red"
          icon={<UiIcon name="balance" size={22} />}
          kicker="Dette publique"
          title={`+${formatNumber(debtGain, 1)} points de PIB depuis ${firstDebt.period}`}
          punch={
            <>
              Les intérêts de la dette coûtent{" "}
              <span className="text-red-600 dark:text-red-400">
                {formatEuros(Math.round(interestPerCapita))} par habitant
              </span>{" "}
              et par an{defensePerCapita ? <>, plus que la défense ({defensePerCapita.display})</> : null}.
            </>
          }
          intro={
            <p>
              Dette des administrations publiques au sens de Maastricht : {formatNumber(firstDebt.pctGdp, 1)} % du
              PIB fin {firstDebt.period}, {formatNumber(CURRENT_DEBT.pctGdp, 1)} % à {CURRENT_DEBT.period}.
            </p>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <BigStat
              tone="red"
              label={`Intérêts de la dette ${PUBLIC_FINANCES.year}`}
              value={formatBillionsExact(PUBLIC_FINANCES.interestBn)}
              detail="toutes administrations"
            />
            <BigStat
              tone="red"
              label={`Intérêts par habitant ${PUBLIC_FINANCES.year}`}
              value={formatEuros(Math.round(interestPerCapita))}
              detail="ratio indicatif"
            />
          </div>

          <ChartFigure
            id="dette-courbe"
            title="La dette publique en % du PIB"
            subtitle="Fin d'année, et fin juin 2026"
            description="Dette en fin d'année (et fin juin 2026), en pourcentage du PIB. Les années sont placées à leur date réelle ; 2020 et 2021 ne figurent pas dans la série reprise ici : ce segment est tracé en pointillé. La ligne pointillée ambre marque le seuil de 60 % fixé par les règles budgétaires européennes."
            height={DEBT_CHART_HEIGHT}
            chart={<DebtAreaChart data={debt} />}
            legend={
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1 w-5 rounded-full bg-red-600 dark:bg-red-400" aria-hidden="true" />
                  Dette publique (% du PIB)
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block w-5 border-t-2 border-dashed border-amber-600 dark:border-amber-400"
                    aria-hidden="true"
                  />
                  Seuil européen de 60 %
                </li>
              </ul>
            }
            table={
              <DataTable
                caption="Dette publique au sens de Maastricht, en % du PIB et en milliards d'euros"
                columns={[
                  { header: "Période" },
                  { header: "% du PIB", numeric: true },
                  { header: "Montant", numeric: true },
                ]}
                rows={DEBT_TIMELINE.items.map((p) => [
                  p.period,
                  fmtPct(p.pctGdp),
                  p.amountBn ? formatBillionsExact(p.amountBn) : "non précisé",
                ])}
              />
            }
            source={DEBT_TIMELINE.source}
            period="annuelles 2019-2025"
            note={
              <p>
                Point de fin juin 2026 :{" "}
                <a
                  href={CURRENT_DEBT.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {CURRENT_DEBT.source.label}
                </a>
                .
              </p>
            }
          />

          <ChartFigure
            id="interets"
            title="Les intérêts de la dette, comparés à d'autres dépenses"
            subtitle="En euros par habitant et par an"
            description={`En euros par habitant. Intérêts payés par l'ensemble des administrations publiques en ${PUBLIC_FINANCES.year} ; autres postes : dépense publique par fonction en ${PUBLIC_SPENDING_BY_FUNCTION.period}. Ratios indicatifs rapportés à la population au 1er janvier 2026.`}
            height={barsChartHeight(interestComparison.length)}
            chart={<BarsChart data={interestComparison} valueName="Par habitant" />}
            table={
              <DataTable
                caption="Intérêts de la dette et autres dépenses publiques, en euros par habitant"
                columns={[{ header: "Poste" }, { header: "Par habitant", numeric: true }]}
                rows={interestComparison.map((d) => [d.label, d.display])}
              />
            }
            source={PUBLIC_FINANCES.source}
            period={`${PUBLIC_FINANCES.year} pour les intérêts`}
            note={
              <p>
                Autres postes :{" "}
                <a
                  href={PUBLIC_SPENDING_BY_FUNCTION.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {PUBLIC_SPENDING_BY_FUNCTION.source.label}
                </a>
                . Population : {POPULATION_SOURCE.label}.
              </p>
            }
          />
        </ThemeSection>

        {/* 5. Protection sociale */}
        <ThemeSection
          id="protection-sociale"
          tone="violet"
          icon={<CategoryIcon deckId="social" size={22} />}
          kicker="Protection sociale"
          title="Les retraites, premier poste de la protection sociale"
          punch={
            <>
              <span style={{ color: socialColor }}>{pensionShare}&nbsp;%</span> de la protection sociale va à la
              vieillesse, c&apos;est-à-dire aux retraites.
            </>
          }
        >
          <ChartFigure
            id="social"
            title="Dépense de protection sociale par risque"
            subtitle={`Milliards d'euros, ${SOCIAL_PROTECTION.period}`}
            description={`Administrations publiques, ${SOCIAL_PROTECTION.period}, en milliards d'euros. Total : ${formatBillionsExact(sumAmounts(SOCIAL_PROTECTION.items), 0)}.`}
            height={barsChartHeight(social.length)}
            chart={<BarsChart data={social} valueName="Dépense" />}
            table={
              <DataTable
                caption={`Dépense de protection sociale par risque en ${SOCIAL_PROTECTION.period}`}
                columns={[{ header: "Risque" }, { header: "Montant", numeric: true }]}
                rows={social.map((d) => [d.label, d.display])}
              />
            }
            source={SOCIAL_PROTECTION.source}
            period={SOCIAL_PROTECTION.period}
          />
        </ThemeSection>

        {/* 6. Santé */}
        <ThemeSection
          id="sante"
          tone="cyan"
          icon={<CategoryIcon deckId="sante" size={22} />}
          kicker="Santé"
          title="Hôpital, ville, médicaments : où va la dépense de santé"
          punch={
            <>
              Sur 100&nbsp;€ de dépense de santé,{" "}
              <span style={{ color: healthColor }}>{hospitalPer100}&nbsp;€</span> vont à l&apos;hôpital.
            </>
          }
        >
          <ChartFigure
            id="sante-postes"
            title="Dépense courante de santé par poste"
            subtitle={`Milliards d'euros, ${HEALTH_SPENDING.period}, tous financeurs`}
            description={`Dépense courante de santé au sens international (${formatBillionsExact(healthTotal)} en ${HEALTH_SPENDING.period}), tous financeurs confondus. Elle comprend aussi les complémentaires santé et le reste à charge des ménages : ce périmètre n'est pas comparable avec la fonction « Santé » de la dépense publique.`}
            height={barsChartHeight(health.length)}
            chart={<BarsChart data={health} valueName="Dépense" />}
            table={
              <DataTable
                caption={`Dépense courante de santé par poste en ${HEALTH_SPENDING.period}`}
                columns={[{ header: "Poste" }, { header: "Montant", numeric: true }]}
                rows={health.map((d) => [d.label, d.display])}
              />
            }
            source={HEALTH_SPENDING.source}
            period={HEALTH_SPENDING.period}
          />
        </ThemeSection>

        {/* 7. Europe */}
        <ThemeSection
          id="europe"
          tone="amber"
          icon={<CategoryIcon deckId="france-europe" size={22} />}
          kicker="Comparaison européenne"
          title="La France face à ses voisins européens"
          punch={
            france && euroArea ? (
              <>
                Dette publique&nbsp;: <span className="text-red-600 dark:text-red-400">{fmtPct(france.debtPctGdp)}</span> du
                PIB en France, {fmtPct(euroArea.debtPctGdp)} en moyenne dans la zone euro.
              </>
            ) : undefined
          }
        >
          <ChartFigure
            id="eu-dette"
            title="Dette publique en % du PIB"
            subtitle={`Fin ${EU_COMPARISON.period}. France en rouge, moyennes en ambre.`}
            description={`Fin ${EU_COMPARISON.period}. France en rouge, moyennes de la zone euro et de l'UE en ambre.`}
            height={barsChartHeight(eu.length)}
            chart={<BarsChart data={eu} valueName="Dette" />}
            table={
              <DataTable
                caption={`Dette, déficit et dépense publics en ${EU_COMPARISON.period}, en % du PIB`}
                columns={[
                  { header: "Pays" },
                  { header: "Dette", numeric: true },
                  { header: "Déficit", numeric: true },
                  { header: "Dépense", numeric: true },
                ]}
                rows={EU_COMPARISON.items.map((c) => [
                  c.country,
                  fmtPct(c.debtPctGdp),
                  fmtPct(c.deficitPctGdp),
                  fmtPct(c.spendingPctGdp),
                ])}
              />
            }
            source={EU_COMPARISON.source}
            period={EU_COMPARISON.period}
          />
          <div className="grid grid-cols-2 gap-3">
            {EU_COMPARISON.items
              .filter((c) => c.highlight || c.code === "EA")
              .map((c) => (
                <BigStat
                  key={c.code}
                  tone={c.highlight ? "red" : "amber"}
                  label={`Déficit public ${EU_COMPARISON.period} — ${c.country}`}
                  value={`${formatNumber(c.deficitPctGdp, 1)} %`}
                  detail={`de déficit ; dépense publique : ${formatNumber(c.spendingPctGdp, 1)} % du PIB`}
                />
              ))}
          </div>
        </ThemeSection>

        {/* 8. Sources */}
        <section id="sources" aria-labelledby="sources-title" className="scroll-mt-32 pt-12">
          <h2 id="sources-title" className="font-heading text-2xl font-extrabold text-foreground mb-4">
            Sources et méthode
          </h2>
          <ul className="flex flex-wrap gap-2">
            {getChiffresSources().map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center rounded-2xl border border-border bg-card px-3.5 py-2 text-sm text-foreground hover:border-foreground/40"
                >
                  <span>
                    {s.label} <span className="text-xs text-muted-foreground">({s.date})</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Les montants sont arrondis. Les montants « par habitant » sont des ratios indicatifs (total divisé par la
            population au 1er janvier 2026). Une erreur ? Signalez-la via la page{" "}
            <Link href="/contribuer" className="underline underline-offset-2 hover:text-foreground">
              Contribuer
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/simulateur"
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl bg-brand text-white font-heading font-bold text-sm shadow-lg hover:bg-brand-hover transition-colors"
            >
              Estimer ma contribution
            </Link>
            <Link
              href="/jeu"
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl border border-border bg-card text-foreground font-heading font-bold text-sm hover:border-foreground/40 transition-colors"
            >
              Jouer à Budget Swipe
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
