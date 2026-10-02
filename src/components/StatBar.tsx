import type { ReactNode } from "react";

export function StatBar({ icon, label, count, percent, colorClass }: {
  icon: ReactNode;
  label: string;
  count: number;
  percent: number;
  /** Couleur de sens (bg-primary, bg-danger, bg-info, bg-warning) */
  colorClass: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="kicker flex items-center gap-1.5 text-muted-foreground">{icon} {label}</span>
        <span className="text-sm tabular-nums text-foreground">
          <span className="font-semibold">{Math.round(percent)}&nbsp;%</span>
          <span className="text-muted-foreground"> · {count} carte{count > 1 ? "s" : ""}</span>
        </span>
      </div>
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div
          className={`${colorClass} h-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
