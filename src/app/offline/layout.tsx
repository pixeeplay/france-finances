import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors connexion — france-finances.com",
  description: "Vous êtes actuellement hors connexion. Vérifiez votre réseau et réessayez.",
  robots: { index: false, follow: false },
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
