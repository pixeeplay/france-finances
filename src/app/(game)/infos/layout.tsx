import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infos — La Tronçonneuse de Poche",
  description: "Comment fonctionne le jeu, les regles et les sources.",
};

export default function InfosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
