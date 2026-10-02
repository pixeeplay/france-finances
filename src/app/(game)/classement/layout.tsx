import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";

export const metadata: Metadata = {
  title: "Communauté — La Tronçonneuse de Poche",
  description: "Découvre les statistiques de la communauté des joueurs.",
  alternates: {
    canonical: "/classement",
  },
  openGraph: {
    title: "Communauté — La Tronçonneuse de Poche",
    description: "Découvre les statistiques de la communauté des joueurs.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Communauté — La Tronçonneuse de Poche",
    description: "Découvre les statistiques de la communauté des joueurs.",
  },
};

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
