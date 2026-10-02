import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";

export const metadata: Metadata = {
  title: "Infos — La Tronçonneuse de Poche",
  description: "Comment fonctionne le jeu, les règles et les sources.",
  alternates: {
    canonical: "/infos",
  },
  openGraph: {
    title: "Infos — La Tronçonneuse de Poche",
    description: "Comment fonctionne le jeu, les règles et les sources.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infos — La Tronçonneuse de Poche",
    description: "Comment fonctionne le jeu, les règles et les sources.",
  },
};

export default function InfosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
