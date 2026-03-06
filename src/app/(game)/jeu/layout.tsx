import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jouer — La Tronçonneuse de Poche",
  description: "Choisis une catégorie et swipe les dépenses publiques.",
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
