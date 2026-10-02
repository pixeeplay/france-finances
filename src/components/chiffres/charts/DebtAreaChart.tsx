"use client";

import { useId } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEBT_CHART_HEIGHT, type DebtSeriesPoint } from "@/lib/chiffresCharts";
import { formatBillionsExact, formatNumber } from "@/lib/format";
import {
  AXIS_TICK,
  DISPLAY_FONT,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_WRAPPER_STYLE,
} from "./chartStyles";

/**
 * Dette publique en % du PIB, sur un axe temporel proportionnel (les années
 * manquantes ne sont pas comprimées). Porté de DebtProjectionChart
 * (nicoquipaie), sans la projection « maison » non sourcée.
 */
export function DebtAreaChart({ data }: { data: readonly DebtSeriesPoint[] }) {
  const gradientId = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const rows = [...data];
  const byTime = new Map(rows.map((p) => [p.t, p]));
  const lastIndex = rows.length - 1;

  const renderPointLabel = ({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) => {
    const p = index === undefined ? undefined : rows[index];
    if (!p) return null;
    const isLast = index === lastIndex;
    return (
      <text
        x={Number(x)}
        y={Number(y) - (isLast ? 26 : 10)}
        textAnchor={isLast ? "end" : "middle"}
        fill={isLast ? "var(--chart-red)" : "var(--foreground)"}
        fontFamily={DISPLAY_FONT}
        fontSize={isLast ? 13 : 11}
        fontWeight={800}
      >
        {isLast ? `${formatNumber(p.pctGdp, 1)} % mi-2026` : formatNumber(p.pctGdp, 1)}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={DEBT_CHART_HEIGHT}>
      <AreaChart data={rows} margin={{ top: 36, right: 16, bottom: 4, left: -12 }} accessibilityLayer={false}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-red)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--chart-red)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          type="number"
          dataKey="t"
          domain={["dataMin", "dataMax"]}
          ticks={rows.filter((p) => /^\d{4}$/.test(p.period)).map((p) => p.t)}
          tickFormatter={(t: number) => byTime.get(t)?.period ?? ""}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          interval={0}
          padding={{ left: 14, right: 22 }}
        />
        <YAxis
          domain={[0, 130]}
          ticks={[0, 30, 60, 90, 120]}
          tickFormatter={(v: number) => `${v} %`}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <ReferenceLine
          y={60}
          stroke="var(--chart-amber)"
          strokeDasharray="6 4"
          label={{
            value: "Seuil européen : 60 %",
            fill: "var(--chart-amber)",
            fontSize: 11,
            fontWeight: 700,
            position: "insideBottomLeft",
          }}
        />
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          wrapperStyle={TOOLTIP_WRAPPER_STYLE}
          labelFormatter={(_label, payload) => {
            const p = payload?.[0]?.payload as DebtSeriesPoint | undefined;
            return p ? `Dette fin ${p.period.startsWith("T2") ? "juin 2026" : p.period}` : "";
          }}
          formatter={(_value, _name, item) => {
            const p = item?.payload as DebtSeriesPoint | undefined;
            if (!p) return ["", ""];
            const amount = p.amountBn ? ` (${formatBillionsExact(p.amountBn)})` : "";
            return [`${formatNumber(p.pctGdp, 1)} % du PIB${amount}`, "Dette"];
          }}
        />
        <Area
          type="monotone"
          dataKey="pctGdp"
          stroke="var(--chart-red)"
          strokeWidth={3}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: "var(--chart-red)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          isAnimationActive={!reduceMotion}
          animationDuration={900}
        >
          <LabelList dataKey="pctGdp" content={renderPointLabel} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}
