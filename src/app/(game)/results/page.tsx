import { ResultScreen } from "@/components/ResultScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résultats — La Tronçonneuse de Poche",
  description:
    "Découvre ton archétype budgétaire et tes stats après ta session de swipe des dépenses publiques.",
};

export default function ResultsPage() {
  return <ResultScreen />;
}
