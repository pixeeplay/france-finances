import type { Metadata, Viewport } from "next";
import { Outfit, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AppInit } from "@/components/AppInit";
import { PageviewTracker } from "@/components/PageviewTracker";
import { JsonLd } from "@/components/JsonLd";
import { THEME_COLORS } from "@/lib/theme";
import "./globals.css";

// Police d'affichage ronde et très grasse : titres et chiffres-clés.
// Seules les graisses utilisées : 700 (bold), 800 (titres), 900 (hero).
const display = Outfit({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

// Texte courant et interface (un seul fichier variable).
const sans = Geist({
  variable: "--ff-sans",
  subsets: ["latin"],
  display: "swap",
});

// Mono : rares usages (sources, tableaux). Non préchargée : le repli
// système suffit le temps du chargement.
const mono = Geist_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://france-finances.com"),
  title: "france-finances.com — Comprendre les finances publiques",
  description:
    "Explorez le budget de la France de manière interactive. 369 cartes, 16 catégories — Comprenez où vont vos impôts.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "France Finances",
  },
  openGraph: {
    title: "france-finances.com — Comprendre les finances publiques",
    description:
      "Explorez le budget de la France de manière interactive. 369 cartes de dépenses publiques à découvrir.",
    url: "https://france-finances.com",
    siteName: "france-finances.com",
    // Images : fichiers opengraph-image.tsx (racine et pages dédiées), repris
    // automatiquement pour Twitter/X. Ne pas les fixer ici, sinon chaque page
    // hériterait de l'image de l'accueil sur Twitter/X.
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "france-finances.com — Comprendre les finances publiques",
    description:
      "Explorez le budget de la France de manière interactive. 369 cartes de dépenses publiques.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLORS.dark,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            // Thème sombre par défaut ; le clair n'est appliqué que sur choix explicite.
            __html: `(function(){try{if(localStorage.getItem('theme')==='light'){var d=document.documentElement;d.classList.remove('dark');var c=function(){var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content','${THEME_COLORS.light}')};c();document.addEventListener('DOMContentLoaded',c)}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
      >
        <AuthProvider>
          <AppInit />
          <PageviewTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
