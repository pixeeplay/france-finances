import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AppInit } from "@/components/AppInit";
import { PageviewTracker } from "@/components/PageviewTracker";
import { JsonLd } from "@/components/JsonLd";
import { THEME_COLORS } from "@/lib/theme";
import "./globals.css";

// Serif éditoriale : titres et chiffres forts, toujours en semibold.
// Une seule graisse statique, sans l'axe optique : bien plus léger à
// précharger que le fichier variable complet (graisses 200-900 + opsz).
const serif = Source_Serif_4({
  variable: "--ff-serif",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

// Grotesk : texte courant et interface
const grotesk = Schibsted_Grotesk({
  variable: "--ff-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// Mono : étiquettes, axes, sources. Non préchargée : elle ne sert qu'aux
// petits textes (kicker), le repli système suffit le temps du chargement.
const mono = IBM_Plex_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://france-finances.com"),
  title: "france-finances.com — Comprendre les finances publiques",
  description:
    "Explorez le budget de la France de manière interactive. 370 cartes, 16 catégories — Comprenez où vont vos impôts.",
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
      "Explorez le budget de la France de manière interactive. 370 cartes de dépenses publiques à découvrir.",
    url: "https://france-finances.com",
    siteName: "france-finances.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "france-finances.com — Comprendre les finances publiques",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "france-finances.com — Comprendre les finances publiques",
    description:
      "Explorez le budget de la France de manière interactive. 370 cartes de dépenses publiques.",
    images: ["/opengraph-image"],
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
        className={`${serif.variable} ${grotesk.variable} ${mono.variable} antialiased`}
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
