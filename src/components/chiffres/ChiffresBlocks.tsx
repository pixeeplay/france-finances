import type { ReactNode } from "react";
import type { DataSource } from "@/types/simulator";
import { coinsPer100, type ChartTone, type Per1000Slice, type ShareDatum } from "@/lib/chiffresCharts";
import { SourceNote } from "./DataBlocks";
import { TONE_CLASSES } from "./palette";

/** Section thématique : pastille colorée, surtitre, titre accrocheur, intro. */
export function ThemeSection({
  id,
  tone,
  icon,
  kicker,
  title,
  punch,
  intro,
  children,
}: {
  id: string;
  tone: ChartTone;
  icon: ReactNode;
  kicker: string;
  title: string;
  /** Phrase-choc affichée en grand sous le titre */
  punch?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36 pt-12">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${t.solid}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className={`text-xs font-bold uppercase tracking-wider ${t.text}`}>{kicker}</p>
      </div>
      <h2
        id={`${id}-title`}
        className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight text-foreground mb-3"
      >
        {title}
      </h2>
      {punch ? (
        <p className={`mb-3 rounded-2xl border-l-4 ${t.border} ${t.soft} px-4 py-3 font-heading text-xl sm:text-2xl font-extrabold leading-snug text-foreground`}>
          {punch}
        </p>
      ) : null}
      {intro ? <div className="text-sm text-muted-foreground leading-relaxed mb-5">{intro}</div> : null}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Chiffre clé en grand et en couleur, dans une carte arrondie. */
export function BigStat({
  label,
  value,
  detail,
  tone,
  className = "",
}: {
  label: string;
  value: string;
  detail?: string;
  tone: ChartTone;
  className?: string;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      <p className="text-xs font-semibold text-muted-foreground leading-snug">{label}</p>
      <p
        className={`mt-1.5 font-heading text-[1.65rem] sm:text-4xl font-extrabold leading-none tabular-nums ${t.text}`}
      >
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs text-muted-foreground leading-snug">{detail}</p> : null}
    </div>
  );
}

export interface TableColumn {
  header: string;
  /** Aligner à droite (colonnes numériques) */
  numeric?: boolean;
}

/** Tableau de données alternatif (lecteurs d'écran, lecture précise). */
export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly TableColumn[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="-mx-2">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-muted-foreground">
              {columns.map((c) => (
                <th
                  key={c.header}
                  scope="col"
                  className={`px-2 py-2 text-xs font-semibold ${c.numeric ? "text-right" : "text-left"}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-border align-top">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-2 py-2 text-left font-normal text-foreground">
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={i}
                      className={`px-2 py-2 tabular-nums whitespace-nowrap text-foreground ${columns[i]?.numeric ? "text-right" : ""}`}
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

/**
 * Carte de graphique : titre, sous-titre court, zone de tracé à hauteur
 * réservée (masquée aux lecteurs d'écran, qui ont le tableau), légende.
 * La note de méthode et le tableau sont repliés dans « Données et méthode » ;
 * la source tient sur une ligne.
 */
export function ChartFigure({
  id,
  title,
  subtitle,
  description,
  height,
  chart,
  legend,
  table,
  source,
  period,
  note,
}: {
  id: string;
  title: string;
  /** Unité et périmètre en quelques mots, visibles */
  subtitle?: string;
  /** Note de méthode, repliée avec le tableau */
  description: string;
  height?: number;
  chart: ReactNode;
  legend?: ReactNode;
  table: ReactNode;
  source: DataSource;
  period?: string;
  /** Précision repliée avec le tableau */
  note?: ReactNode;
}) {
  return (
    <figure
      aria-labelledby={`${id}-fig-title`}
      aria-describedby={`${id}-fig-desc`}
      className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm"
    >
      <h3 id={`${id}-fig-title`} className="font-heading text-lg sm:text-xl font-bold leading-snug text-foreground">
        {title}
      </h3>
      {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      <div aria-hidden="true" style={height ? { height } : undefined} className="mt-4 w-full min-w-0">
        {chart}
      </div>
      {legend ? <div className="mt-4">{legend}</div> : null}
      <details className="group mt-4 rounded-xl border border-border bg-background/40">
        <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 px-4 text-sm font-semibold text-foreground">
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
          Données et méthode
        </summary>
        <div className="space-y-3 px-4 pb-4">
          <p id={`${id}-fig-desc`} className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {note ? <div className="text-xs text-muted-foreground leading-relaxed">{note}</div> : null}
          {table}
        </div>
      </details>
      <figcaption>
        <SourceNote source={source} period={period} />
      </figcaption>
    </figure>
  );
}

/** Légende textuelle : pastille de couleur + libellé + valeur (+ part). */
export function ShareLegend({ items }: { items: readonly ShareDatum[] }) {
  return (
    <ul className="space-y-2">
      {items.map((d) => (
        <li key={d.label} className="flex items-center gap-3 text-sm">
          <span className={`size-3 shrink-0 rounded-full ${TONE_CLASSES[d.tone].dot}`} aria-hidden="true" />
          <span className="flex-1 min-w-0 text-foreground">{d.label}</span>
          <span className="shrink-0 font-semibold tabular-nums text-foreground">{d.display}</span>
          <span className={`w-11 shrink-0 text-right text-xs font-bold tabular-nums ${TONE_CLASSES[d.tone].text}`}>
            {d.pct} %
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * « Sur 1 000 € de dépense publique » : 100 pièces de 10 €, colorées par
 * fonction (couleur de la catégorie du jeu), puis une tuile par fonction.
 * Rendu serveur (HTML/CSS), aucune bibliothèque.
 */
export function Per1000Coins({
  slices,
  colorFor,
}: {
  slices: readonly Per1000Slice[];
  colorFor: (s: Per1000Slice) => string;
}) {
  const coins = coinsPer100(slices);
  const cells = slices.flatMap((s, i) => Array.from({ length: coins[i] }, () => colorFor(s)));
  return (
    <div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5" aria-hidden="true">
        {cells.map((color, i) => (
          <span key={i} className="aspect-square rounded-full" style={{ backgroundColor: color }} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Une pastille = 10 €.</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {slices.map((s) => (
          <li
            key={s.label}
            className="flex flex-col rounded-2xl border border-border bg-background/40 px-3 py-2.5"
            style={{ borderLeft: `4px solid ${colorFor(s)}` }}
          >
            <span className="font-heading text-xl font-extrabold leading-tight tabular-nums text-foreground">
              {s.euros}&nbsp;€
            </span>
            <span className="text-xs leading-snug text-muted-foreground">{s.label.replace(/\s*\(.*\)$/, "")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Passage pas à pas d'un montant à un autre (ex. des impôts encaissés aux
 * recettes nettes de l'État). Les étapes négatives sont en rouge.
 */
export function BridgeList({
  title,
  steps,
  totalLabel,
  totalM,
  format,
}: {
  title: string;
  steps: readonly { label: string; amountM: number }[];
  totalLabel: string;
  totalM: number;
  format: (amountBn: number) => string;
}) {
  return (
    <figure className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <figcaption className="font-heading text-base sm:text-lg font-bold text-foreground mb-3">{title}</figcaption>
      <ol className="space-y-2">
        {steps.map((step, idx) => {
          const negative = step.amountM < 0;
          return (
            <li key={step.label} className="flex items-baseline gap-3 text-sm">
              <span
                className={`w-5 shrink-0 text-center font-bold ${negative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                aria-hidden="true"
              >
                {idx === 0 ? "" : negative ? "−" : "+"}
              </span>
              <span className="flex-1 min-w-0 text-foreground">{step.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                <span className="sr-only">{negative ? "moins " : idx === 0 ? "" : "plus "}</span>
                {format(Math.abs(step.amountM) / 1000)}
              </span>
            </li>
          );
        })}
        <li className="flex items-baseline gap-3 border-t border-border pt-2 text-sm">
          <span className="w-5 shrink-0 text-center font-bold text-foreground" aria-hidden="true">=</span>
          <span className="flex-1 min-w-0 font-bold text-foreground">{totalLabel}</span>
          <span className="shrink-0 font-heading text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {format(totalM / 1000)}
          </span>
        </li>
      </ol>
    </figure>
  );
}
