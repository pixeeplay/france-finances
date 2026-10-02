import type { ReactNode } from "react";
import type { DataSource } from "@/types/simulator";
import type { ChartTone, Per1000Slice, ShareDatum } from "@/lib/chiffresCharts";
import { SourceNote } from "./DataBlocks";
import { TONE_CLASSES } from "./palette";

/** Section thématique : pastille colorée, surtitre, titre accrocheur, intro. */
export function ThemeSection({
  id,
  tone,
  icon,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  tone: ChartTone;
  icon: ReactNode;
  kicker: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 pt-12">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ${t.soft} ${t.text}`}
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
      {intro ? <div className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">{intro}</div> : null}
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
    <details className="group mt-3 rounded-xl border border-border bg-background/40">
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
        Voir les données en tableau
      </summary>
      <div className="px-2 pb-3">
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
    </details>
  );
}

/**
 * Carte de graphique : titre, description, zone de tracé à hauteur réservée
 * (masquée aux lecteurs d'écran, qui ont le tableau), légende, source.
 */
export function ChartFigure({
  id,
  title,
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
  description: string;
  height?: number;
  chart: ReactNode;
  legend?: ReactNode;
  table: ReactNode;
  source: DataSource;
  period?: string;
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
      <p id={`${id}-fig-desc`} className="mt-1 mb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div aria-hidden="true" style={height ? { height } : undefined} className="w-full min-w-0">
        {chart}
      </div>
      {legend ? <div className="mt-4">{legend}</div> : null}
      {note ? <div className="mt-4 text-sm text-foreground leading-relaxed">{note}</div> : null}
      {table}
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
 * « Sur 1 000 € de dépense publique » : barre empilée colorée + légende
 * chiffrée. Rendu serveur (HTML/CSS), aucune bibliothèque.
 */
export function Per1000Bar({
  slices,
  labelFor,
}: {
  slices: readonly Per1000Slice[];
  labelFor?: (s: Per1000Slice) => string;
}) {
  return (
    <div>
      <div className="flex h-12 w-full overflow-hidden rounded-2xl" aria-hidden="true">
        {slices.map((s) => (
          <div
            key={s.label}
            className={`${TONE_CLASSES[s.tone].dot} flex items-center justify-center whitespace-nowrap border-r-2 border-card last:border-r-0 text-[11px] font-bold text-white dark:text-slate-950`}
            style={{ width: `${s.euros / 10}%` }}
            title={`${s.label} : ${s.euros} €`}
          >
            {s.euros >= 105 ? `${s.euros} €` : ""}
          </div>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span className={`size-3 shrink-0 rounded-full ${TONE_CLASSES[s.tone].dot}`} aria-hidden="true" />
            <span className="flex-1 min-w-0 text-foreground">{labelFor ? labelFor(s) : s.label}</span>
            <span
              className={`shrink-0 font-heading text-base font-extrabold tabular-nums ${TONE_CLASSES[s.tone].text}`}
            >
              {s.euros} €
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
