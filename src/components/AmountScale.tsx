import { amountScalePosition, formatBillions } from "@/lib/format";

/** Graduations de l'échelle (en Md€) et leur libellé court. */
const TICKS: { value: number; label: string }[] = [
  { value: 0.01, label: "10 M" },
  { value: 0.1, label: "100 M" },
  { value: 1, label: "1 Md" },
  { value: 10, label: "10 Md" },
  { value: 100, label: "100 Md" },
  // Dernière graduation non libellée, faute de place à 375 px
  { value: 1000, label: "" },
];

interface AmountScaleProps {
  amountBillions: number;
  className?: string;
}

/**
 * Ordre de grandeur d'un montant : repère sur une échelle logarithmique
 * graduée par décades (10 M€ -> 1 000 Md€). Chaque graduation vaut x10.
 */
export function AmountScale({ amountBillions, className }: AmountScaleProps) {
  const position = amountScalePosition(amountBillions) * 100;

  return (
    <figure
      className={className}
      aria-label={`Ordre de grandeur : ${formatBillions(amountBillions)} sur une échelle de 10 millions à 1 000 milliards d'euros`}
    >
      <figcaption className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <span>Ordre de grandeur</span>
        <span className="normal-case tracking-normal">échelle ×10</span>
      </figcaption>
      <div className="relative mt-2 h-4" aria-hidden="true">
        {/* Axe */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* Portion parcourue */}
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-foreground/70"
          style={{ width: `${position}%` }}
        />
        {/* Graduations */}
        {TICKS.map((t) => (
          <div
            key={t.value}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-muted-foreground/60"
            style={{ left: `${amountScalePosition(t.value) * 100}%` }}
          />
        ))}
        {/* Repère */}
        <div
          className="absolute top-0 h-4 w-[3px] -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="relative mt-1 h-3 font-mono text-[9px] tabular-nums text-muted-foreground" aria-hidden="true">
        {TICKS.filter((t) => t.label).map((t, i) => (
          <span
            key={t.value}
            className={`absolute whitespace-nowrap ${i === 0 ? "" : "-translate-x-1/2"}`}
            style={{ left: `${amountScalePosition(t.value) * 100}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
