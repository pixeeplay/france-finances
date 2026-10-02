import type { ReactNode } from "react";
import type { DataSource } from "@/types/simulator";

/** Mention de source sous un bloc de données. */
export function SourceNote({ source, period }: { source: DataSource; period?: string }) {
  return (
    <p className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed">
      {period ? <span>Données {period}. </span> : null}
      Source :{" "}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        {source.label}
      </a>
    </p>
  );
}

/** Section de page avec ancre, titre et introduction. */
export function DataSection({
  id,
  title,
  kicker,
  intro,
  children,
}: {
  id: string;
  title: string;
  /** Surtitre éditorial (rubrique) */
  kicker?: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-10 border-t border-border">
      {kicker ? <p className="kicker text-muted-foreground mb-2">{kicker}</p> : null}
      <h2 id={`${id}-title`} className="text-2xl sm:text-3xl font-semibold leading-tight text-foreground mb-3">
        {title}
      </h2>
      {intro ? <div className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">{intro}</div> : null}
      {children}
    </section>
  );
}

/** Chiffre clé : valeur en grand, libellé et précision. */
export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="border-t border-border pt-3 pb-1">
      <p className="kicker text-muted-foreground">{label}</p>
      <p className="mt-1 numeral text-2xl sm:text-3xl font-semibold leading-tight text-foreground">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground leading-snug">{detail}</p> : null}
    </div>
  );
}

export interface BarItem {
  label: string;
  value: number;
  /** Valeur affichée à droite de la barre */
  display: string;
  /** Mettre la ligne en évidence */
  highlight?: boolean;
}

/**
 * Liste de barres horizontales proportionnelles (pas de bibliothèque de graphiques).
 * Les valeurs négatives ou nulles donnent une barre vide.
 */
export function BarList({ items, caption, max }: { items: readonly BarItem[]; caption: string; max?: number }) {
  const top = max ?? Math.max(...items.map((i) => i.value), 0);
  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="flex flex-col">
        {items.map((item) => {
          const width = top > 0 ? Math.max(0, (item.value / top) * 100) : 0;
          return (
            <li key={item.label} className="border-t border-border first:border-t-0 py-2.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={item.highlight ? "font-semibold text-foreground" : "text-foreground"}>
                  {item.label}
                </span>
                <span className="shrink-0 numeral text-base font-semibold text-foreground">{item.display}</span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-[1px] bg-muted" aria-hidden="true">
                <div
                  className={`h-full rounded-[1px] ${item.highlight ? "bg-foreground" : "bg-foreground/70"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
