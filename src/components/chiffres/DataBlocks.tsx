import type { ReactNode } from "react";
import type { DataSource } from "@/types/simulator";

/** Mention de source sous un bloc de données. */
export function SourceNote({ source, period }: { source: DataSource; period?: string }) {
  return (
    <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
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
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-10 border-t border-border">
      <h2 id={`${id}-title`} className="font-heading text-2xl font-bold text-foreground mb-2">
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
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
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
      <ul className="space-y-3">
        {items.map((item) => {
          const width = top > 0 ? Math.max(0, (item.value / top) * 100) : 0;
          return (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={item.highlight ? "font-semibold text-foreground" : "text-foreground/90"}>
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">{item.display}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted" aria-hidden="true">
                <div
                  className={`h-2 rounded-full ${item.highlight ? "bg-foreground" : "bg-primary"}`}
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
