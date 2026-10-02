import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/ogMeta";

export const metadata: Metadata = {
  title: "Jouer — La Tronçonneuse de Poche",
  description: "Choisis une catégorie et swipe les dépenses publiques.",
  alternates: {
    canonical: "/jeu",
  },
  openGraph: {
    title: "Jouer — La Tronçonneuse de Poche",
    description: "Choisis une catégorie et swipe les dépenses publiques.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jouer — La Tronçonneuse de Poche",
    description: "Choisis une catégorie et swipe les dépenses publiques.",
  },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
