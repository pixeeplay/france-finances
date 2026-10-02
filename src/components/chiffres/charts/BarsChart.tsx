"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "framer-motion";
import { barsChartHeight, datumColor, type ChartDatum } from "@/lib/chiffresCharts";
import {
  DISPLAY_FONT,
  TOOLTIP_CONTENT_STYLE, TOOLTIP_ITEM_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_WRAPPER_STYLE } from "./chartStyles";

interface LabelContentProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
}

/**
 * Barres horizontales, libellé complet au-dessus de chaque barre et valeur au
 * bout : lisible à 375 px sans tronquer ni faire défiler horizontalement.
 * Porté de MissionBarChart / PublicSpendingChart (nicoquipaie).
 */
export function BarsChart({ data, valueName = "Montant" }: { data: readonly ChartDatum[]; valueName?: string }) {
  const reduceMotion = useReducedMotion();
  const rows = [...data];
  const max = Math.max(...rows.map((d) => d.value), 0);

  const renderName = ({ x, y, index }: LabelContentProps) => {
    const d = index === undefined ? undefined : rows[index];
    if (!d) return null;
    return (
      <text x={Number(x)} y={Number(y) - 6} fill="var(--foreground)" fontSize={13} fontWeight={d.highlight ? 700 : 500}>
        {d.shortLabel}
      </text>
    );
  };

  const renderValue = ({ x, y, width, index }: LabelContentProps) => {
    const d = index === undefined ? undefined : rows[index];
    if (!d) return null;
    return (
      <text
        x={Number(x) + Number(width) + 8}
        y={Number(y) + 12}
        fill="var(--foreground)"
        fontFamily={DISPLAY_FONT}
        fontSize={13}
        fontWeight={800}
      >
        {d.display}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={barsChartHeight(rows.length)}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 84, bottom: 4, left: 0 }}
        barCategoryGap={0}
        accessibilityLayer={false}
      >
        <XAxis type="number" hide domain={[0, max]} />
        <YAxis type="category" dataKey="shortLabel" hide />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          wrapperStyle={TOOLTIP_WRAPPER_STYLE}
          formatter={(_value, _name, item) => {
            const d = item?.payload as ChartDatum | undefined;
            return [d?.display ?? "", valueName];
          }}
          labelFormatter={(_label, payload) => {
            const d = payload?.[0]?.payload as ChartDatum | undefined;
            return d?.label ?? "";
          }}
        />
        <Bar
          dataKey="value"
          barSize={14}
          radius={[0, 7, 7, 0]}
          minPointSize={2}
          isAnimationActive={!reduceMotion}
          animationDuration={700}
        >
          {rows.map((d) => (
            <Cell key={d.label} fill={datumColor(d)} />
          ))}
          <LabelList dataKey="shortLabel" content={renderName} />
          <LabelList dataKey="display" content={renderValue} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
