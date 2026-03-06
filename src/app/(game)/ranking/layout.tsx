import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communaute — La Tronçonneuse de Poche",
  description: "Decouvre les statistiques de la communaute des joueurs.",
};

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
