import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communauté — La Tronçonneuse de Poche",
  description: "Découvre les statistiques de la communauté des joueurs.",
  alternates: {
    canonical: "/classement",
  },
};

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
