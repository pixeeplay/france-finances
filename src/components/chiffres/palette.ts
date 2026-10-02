import type { ChartTone } from "@/lib/chiffresCharts";

/**
 * Palette des graphiques de /chiffres, définie en variables CSS locales
 * (--chart-<teinte>) sur le conteneur de la page : teintes soutenues en clair,
 * plus lumineuses en sombre (fond #0F172A). Ne modifie pas les tokens globaux.
 */
export const CHART_PALETTE_CLASS = [
  "[--chart-emerald:#059669] dark:[--chart-emerald:#34d399]",
  "[--chart-blue:#2563eb] dark:[--chart-blue:#60a5fa]",
  "[--chart-amber:#d97706] dark:[--chart-amber:#fbbf24]",
  "[--chart-red:#dc2626] dark:[--chart-red:#f87171]",
  "[--chart-violet:#7c3aed] dark:[--chart-violet:#a78bfa]",
  "[--chart-cyan:#0891b2] dark:[--chart-cyan:#22d3ee]",
  "[--chart-pink:#db2777] dark:[--chart-pink:#f472b6]",
  "[--chart-lime:#65a30d] dark:[--chart-lime:#a3e635]",
  "[--chart-orange:#ea580c] dark:[--chart-orange:#fb923c]",
  "[--chart-teal:#0d9488] dark:[--chart-teal:#2dd4bf]",
  "[--chart-slate:#64748b] dark:[--chart-slate:#94a3b8]",
].join(" ");

/** Classes Tailwind par teinte (texte, fond doux, pastille). */
export const TONE_CLASSES: Record<ChartTone, { text: string; soft: string; dot: string; border: string }> = {
  emerald: {
    text: "text-emerald-700 dark:text-emerald-400",
    soft: "bg-emerald-500/10",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    border: "border-emerald-500/40",
  },
  blue: {
    text: "text-blue-700 dark:text-blue-400",
    soft: "bg-blue-500/10",
    dot: "bg-blue-600 dark:bg-blue-400",
    border: "border-blue-500/40",
  },
  amber: {
    text: "text-amber-700 dark:text-amber-400",
    soft: "bg-amber-500/10",
    dot: "bg-amber-600 dark:bg-amber-400",
    border: "border-amber-500/40",
  },
  red: {
    text: "text-red-700 dark:text-red-400",
    soft: "bg-red-500/10",
    dot: "bg-red-600 dark:bg-red-400",
    border: "border-red-500/40",
  },
  violet: {
    text: "text-violet-700 dark:text-violet-400",
    soft: "bg-violet-500/10",
    dot: "bg-violet-600 dark:bg-violet-400",
    border: "border-violet-500/40",
  },
  cyan: {
    text: "text-cyan-700 dark:text-cyan-400",
    soft: "bg-cyan-500/10",
    dot: "bg-cyan-600 dark:bg-cyan-400",
    border: "border-cyan-500/40",
  },
  pink: {
    text: "text-pink-700 dark:text-pink-400",
    soft: "bg-pink-500/10",
    dot: "bg-pink-600 dark:bg-pink-400",
    border: "border-pink-500/40",
  },
  lime: {
    text: "text-lime-700 dark:text-lime-400",
    soft: "bg-lime-500/10",
    dot: "bg-lime-600 dark:bg-lime-400",
    border: "border-lime-500/40",
  },
  orange: {
    text: "text-orange-700 dark:text-orange-400",
    soft: "bg-orange-500/10",
    dot: "bg-orange-600 dark:bg-orange-400",
    border: "border-orange-500/40",
  },
  teal: {
    text: "text-teal-700 dark:text-teal-400",
    soft: "bg-teal-500/10",
    dot: "bg-teal-600 dark:bg-teal-400",
    border: "border-teal-500/40",
  },
  slate: {
    text: "text-slate-600 dark:text-slate-300",
    soft: "bg-slate-500/10",
    dot: "bg-slate-500 dark:bg-slate-400",
    border: "border-slate-500/40",
  },
};
