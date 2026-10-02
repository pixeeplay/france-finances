import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";

export const metadata: Metadata = {
  title: "Communauté — france-finances.com",
  description: "Découvre les statistiques de la communauté des joueurs.",
  alternates: {
    canonical: "/classement",
  },
  openGraph: {
    title: "Communauté — france-finances.com",
    description: "Découvre les statistiques de la communauté des joueurs.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Communauté — france-finances.com",
    description: "Découvre les statistiques de la communauté des joueurs.",
  },
};

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
