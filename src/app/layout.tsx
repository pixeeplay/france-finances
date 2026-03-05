import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nicoquipaie.pixeeplay.fr"),
  title: "La Tronçonneuse de Poche",
  description:
    "270 cartes, 17 catégories — Swipe les dépenses publiques et découvre ton profil budgétaire",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tronçonneuse",
  },
  openGraph: {
    title: "La Tronçonneuse de Poche",
    description:
      "270 cartes de dépenses publiques. Swipe, tranche, découvre ton profil budgétaire.",
    url: "https://nicoquipaie.pixeeplay.fr",
    siteName: "La Tronçonneuse de Poche",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "La Tronçonneuse de Poche",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Tronçonneuse de Poche",
    description:
      "270 cartes de dépenses publiques. Swipe, tranche, découvre ton profil budgétaire.",
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh flex items-center justify-center`}
      >
        <AuthProvider>
          <div className="mx-auto max-w-md w-full min-h-dvh lg:min-h-0 lg:h-[900px] lg:max-h-[90vh] lg:rounded-3xl lg:border lg:border-border lg:shadow-2xl lg:overflow-hidden flex flex-col relative">
            {children}
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
