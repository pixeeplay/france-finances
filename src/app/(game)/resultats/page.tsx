import { ResultScreen } from "@/components/ResultScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résultats — france-finances.com",
  description:
    "Découvre ton archétype budgétaire et tes stats après ta session de swipe des dépenses publiques.",
  alternates: {
    canonical: "/resultats",
  },
};

export default function ResultsPage() {
  return <ResultScreen />;
}
