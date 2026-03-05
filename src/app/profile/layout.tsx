import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — La Tronçonneuse de Poche",
  description: "Ton archetype budgetaire, tes stats et tes badges.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
