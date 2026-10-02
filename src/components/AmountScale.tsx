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
 * L'axe se colore du vert (petits montants) au rouge (très gros montants).
 */
export function AmountScale({ amountBillions, className }: AmountScaleProps) {
  const position = amountScalePosition(amountBillions) * 100;

  return (
    <figure
      className={className}
      aria-label={`Ordre de grandeur : ${formatBillions(amountBillions)} sur une échelle de 10 millions à 1 000 milliards d'euros`}
    >
      <figcaption className="flex items-baseline justify-between kicker text-[10px] text-muted-foreground">
        <span>Ordre de grandeur</span>
        <span className="normal-case tracking-normal font-medium">échelle ×10</span>
      </figcaption>
      <div className="relative mt-2 h-4" aria-hidden="true">
        {/* Axe coloré, atténué au-delà du montant */}
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-25" />
        <div
          className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0 round 9999px)` }}
        />
        {/* Graduations */}
        {TICKS.map((t) => (
          <div
            key={t.value}
            className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/50"
            style={{ left: `${amountScalePosition(t.value) * 100}%` }}
          />
        ))}
        {/* Repère */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-card bg-foreground shadow"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="relative mt-1 h-3 text-[9px] font-medium tabular-nums text-muted-foreground" aria-hidden="true">
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
