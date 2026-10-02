"use client";

import dynamic from "next/dynamic";

/**
 * Graphiques recharts chargés à la demande, côté client uniquement : recharts
 * n'entre que dans le bundle de /chiffres. La place est réservée par
 * ChartFigure (hauteur fixe) pour éviter tout décalage de mise en page.
 * Équivalent de BudgetDynamicCharts (nicoquipaie).
 */
function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-xl bg-muted/40" />;
}

export const BarsChart = dynamic(() => import("./charts/BarsChart").then((m) => m.BarsChart), {
  ssr: false,
  loading: ChartSkeleton,
});

export const DebtAreaChart = dynamic(() => import("./charts/DebtAreaChart").then((m) => m.DebtAreaChart), {
  ssr: false,
  loading: ChartSkeleton,
});

export const RevenueDonutChart = dynamic(() => import("./charts/RevenueDonutChart").then((m) => m.RevenueDonutChart), {
  ssr: false,
  loading: ChartSkeleton,
});
