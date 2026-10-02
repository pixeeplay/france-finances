"use client";

import { useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_CHART_HEIGHT, toneColor, type ShareDatum } from "@/lib/chiffresCharts";
import { TOOLTIP_CONTENT_STYLE, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_WRAPPER_STYLE } from "./chartStyles";

/**
 * Donut des recettes, parts en % sur les tranches et total au centre.
 * Porté de RevenueBreakdownChart (nicoquipaie) ; la légende textuelle
 * (libellés, montants, parts) est rendue à côté par la page.
 */
export function RevenueDonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: readonly ShareDatum[];
  centerValue: string;
  centerLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const rows = [...data];

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-xl font-extrabold leading-none text-foreground">{centerValue}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{centerLabel}</span>
      </div>
      <ResponsiveContainer width="100%" height={DONUT_CHART_HEIGHT}>
        <PieChart accessibilityLayer={false}>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={3}
            cornerRadius={6}
            isAnimationActive={!reduceMotion}
            animationDuration={800}
            label={({ percent }: { percent?: number }) => {
              const p = (percent ?? 0) * 100;
              return p < 5 ? "" : `${Math.round(p)} %`;
            }}
            labelLine={false}
          >
            {rows.map((d) => (
              <Cell key={d.label} fill={toneColor(d.tone)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            wrapperStyle={TOOLTIP_WRAPPER_STYLE}
            formatter={(_value, _name, item) => {
              const d = item?.payload as ShareDatum | undefined;
              return d ? [`${d.display} (${d.pct} %)`, d.label] : ["", ""];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
