import { Fragment } from "react";
import { AcronymText } from "@/components/AcronymText";
import { ChartFigure, DataTable } from "@/components/chiffres/ChiffresBlocks";
import { BarsChart, DebtAreaChart } from "@/components/chiffres/ChiffresCharts";
import { TONE_CLASSES } from "@/components/chiffres/palette";
import { DEBT_TIMELINE } from "@/data/chiffres";
import type { DossierBlock, DossierChart, DossierSource } from "@/data/dossiers/types";
import { DEBT_CHART_HEIGHT, barsChartHeight, debtSeries } from "@/lib/chiffresCharts";
import { formatBillionsExact, formatNumber } from "@/lib/format";

/** Appels de note vers les sources en bas de page : [1, 2]. */
export function SourceRefs({ refs, numbers }: { refs?: readonly string[]; numbers: Map<string, number> }) {
  const list = (refs ?? [])
    .map((id) => numbers.get(id))
    .filter((n): n is number => n !== undefined)
    .sort((a, b) => a - b);
  if (list.length === 0) return null;
  return (
    <sup className="ml-0.5 whitespace-nowrap text-[0.7em] font-semibold">
      {list.map((n, i) => (
        <Fragment key={n}>
          {i > 0 ? <span aria-hidden="true">,</span> : null}
          <a
            href={`#source-${n}`}
            className="inline-flex min-w-[1.4em] justify-center rounded px-0.5 text-brand-fg hover:bg-muted"
            aria-label={`Source ${n}`}
          >
            {n}
          </a>
        </Fragment>
      ))}
    </sup>
  );
}

function ChartBlock({ chart, sources }: { chart: DossierChart; sources: readonly DossierSource[] }) {
  if (chart.kind === "debt") {
    return (
      <ChartFigure
        id={chart.id}
        title={chart.title}
        subtitle={chart.subtitle}
        description={chart.description}
        height={DEBT_CHART_HEIGHT}
        chart={<DebtAreaChart data={debtSeries(DEBT_TIMELINE.items)} />}
        table={
          <DataTable
            caption={chart.title}
            columns={[{ header: "Période" }, { header: "% du PIB", numeric: true }, { header: "Montant", numeric: true }]}
            rows={DEBT_TIMELINE.items.map((p) => [
              p.period,
              `${formatNumber(p.pctGdp, 1)} %`,
              p.amountBn === undefined ? "–" : formatBillionsExact(p.amountBn),
            ])}
          />
        }
        source={DEBT_TIMELINE.source}
        period={DEBT_TIMELINE.period}
      />
    );
  }

  const source = sources.find((s) => s.id === chart.source);
  if (!source) return null;
  const data = chart.rows.map((r) => ({ ...r, shortLabel: r.label }));
  const tableRows = chart.tableRows ?? chart.rows.map((r) => [r.label, r.display] as const);
  return (
    <ChartFigure
      id={chart.id}
      title={chart.title}
      subtitle={chart.subtitle}
      description={chart.description}
      height={barsChartHeight(data.length)}
      chart={<BarsChart data={data} valueName={chart.valueName} />}
      table={
        <DataTable
          caption={chart.title}
          columns={[{ header: chart.columns[0] }, { header: chart.columns[1], numeric: true }]}
          rows={tableRows}
        />
      }
      source={source}
      period={chart.period}
    />
  );
}

/** Un bloc du corps de l'article. */
export function DossierBlockView({
  block,
  numbers,
  sources,
}: {
  block: DossierBlock;
  numbers: Map<string, number>;
  sources: readonly DossierSource[];
}) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-base sm:text-[1.0625rem] leading-relaxed text-foreground/90">
          <AcronymText text={block.text} />
          <SourceRefs refs={block.refs} numbers={numbers} />
        </p>
      );
    case "list":
      return (
        <div>
          <ul className="space-y-2 pl-1">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3 text-base sm:text-[1.0625rem] leading-relaxed text-foreground/90">
                <span className="mt-[0.6em] size-2 shrink-0 rounded-full bg-brand-fg" aria-hidden="true" />
                <span>
                  <AcronymText text={item} />
                </span>
              </li>
            ))}
          </ul>
          {block.refs?.length ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Source
              <SourceRefs refs={block.refs} numbers={numbers} />
            </p>
          ) : null}
        </div>
      );
    case "chiffre": {
      const t = TONE_CLASSES[block.tone];
      return (
        <aside
          aria-label="Le chiffre"
          className={`rounded-3xl border-l-8 ${t.border} ${t.soft} px-5 py-5 sm:px-7 sm:py-6`}
        >
          <p className={`kicker ${t.text}`}>Le chiffre</p>
          <p className={`mt-2 font-heading text-5xl sm:text-6xl font-black leading-none tabular-nums ${t.text}`}>
            {block.value}
          </p>
          <p className="mt-3 font-heading text-lg sm:text-xl font-bold leading-snug text-foreground">
            <AcronymText text={block.label} />
            <SourceRefs refs={block.refs} numbers={numbers} />
          </p>
          {block.detail ? (
            <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
              <AcronymText text={block.detail} />
            </p>
          ) : null}
        </aside>
      );
    }
    case "chart":
      return <ChartBlock chart={block.chart} sources={sources} />;
  }
}
