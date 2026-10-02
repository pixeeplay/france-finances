import type { DataSource } from "@/types/simulator";

/** Libellé court d'une source (avant le tiret) : « Insee Première n° 2093 ». */
export function shortSourceLabel(label: string): string {
  return label.split(" — ")[0].trim();
}

const SOURCE_LINK =
  "underline decoration-muted-foreground/40 underline-offset-2 hover:text-foreground hover:decoration-foreground";

/** Mention de source sous un bloc de données : une ligne, discrète. */
export function SourceNote({ source, period }: { source: DataSource; period?: string }) {
  return (
    <p className="mt-3 truncate text-xs text-muted-foreground" title={`${source.label}${period ? ` (${period})` : ""}`}>
      Source :{" "}
      <a href={source.url} target="_blank" rel="noopener noreferrer" className={SOURCE_LINK}>
        {shortSourceLabel(source.label)}
      </a>
      {period ? <span>, {period}</span> : null}
    </p>
  );
}

/** Plusieurs sources sur une seule ligne. */
export function SourcesLine({ sources }: { sources: readonly DataSource[] }) {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      Sources :{" "}
      {sources.map((src, i) => (
        <span key={src.url}>
          {i > 0 ? " · " : null}
          <a href={src.url} target="_blank" rel="noopener noreferrer" title={src.label} className={SOURCE_LINK}>
            {shortSourceLabel(src.label)}
          </a>
        </span>
      ))}
    </p>
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

/** Teintes des barres, en rotation (accents de l'identité). */
const BAR_TONES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-orange-500",
] as const;

/**
 * Liste de barres horizontales proportionnelles (pas de bibliothèque de graphiques).
 * Les valeurs négatives ou nulles donnent une barre vide.
 */
export function BarList({ items, caption, max }: { items: readonly BarItem[]; caption: string; max?: number }) {
  const top = max ?? Math.max(...items.map((i) => i.value), 0);
  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="flex flex-col gap-3">
        {items.map((item, index) => {
          const width = top > 0 ? Math.max(0, (item.value / top) * 100) : 0;
          return (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={item.highlight ? "font-bold text-foreground" : "font-medium text-foreground"}>
                  {item.label}
                </span>
                <span className="shrink-0 font-heading text-base font-extrabold tabular-nums text-foreground">
                  {item.display}
                </span>
              </div>
              <div className="mt-1.5 h-3 rounded-full bg-muted" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${BAR_TONES[index % BAR_TONES.length]}`}
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
