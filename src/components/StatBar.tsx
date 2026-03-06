import type { ReactNode } from "react";

export function StatBar({ icon, label, count, percent, colorClass, glowClass }: {
  icon: ReactNode;
  label: string;
  count: number;
  percent: number;
  colorClass: string;
  glowClass: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span>{count} carte{count > 1 ? "s" : ""}</span>
      </div>
      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full ${glowClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
