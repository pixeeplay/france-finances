import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/AuthProvider";
import { AppInit } from "@/components/AppInit";
import { PageviewTracker } from "@/components/PageviewTracker";
import { JsonLd } from "@/components/JsonLd";
import { THEME_COLORS } from "@/lib/theme";
import "./globals.css";
import { CARDS_AND_CATEGORIES, TOTAL_CARD_COUNT } from "@/lib/deckMeta";

// Polices embarquées (src/assets/fonts, licence OFL) : aucun appel à Google
// Fonts, ni au build ni en dev. Ce sont les fichiers variables du
// sous-ensemble latin que servait Google Fonts, avec la même plage unicode
// (next/font exige des valeurs littérales : elle est répétée à chaque police).

// Police d'affichage ronde et très grasse : titres et chiffres-clés.
// Seules les graisses utilisées : 700 (bold), 800 (titres), 900 (hero).
const display = localFont({
  src: "../assets/fonts/Outfit-latin.woff2",
  weight: "700 900",
  style: "normal",
  variable: "--ff-display",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

// Texte courant et interface (un seul fichier variable).
const sans = localFont({
  src: "../assets/fonts/Geist-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--ff-sans",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

// Mono : rares usages (sources, tableaux). Non préchargée : le repli
// système suffit le temps du chargement.
const mono = localFont({
  src: "../assets/fonts/GeistMono-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--ff-mono",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://france-finances.com"),
  title: "france-finances.com — Comprendre les finances publiques",
  description:
    `Explorez le budget de la France de manière interactive. ${CARDS_AND_CATEGORIES} — Comprenez où vont vos impôts.`,
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
      `Explorez le budget de la France de manière interactive. ${TOTAL_CARD_COUNT} cartes de dépenses publiques à découvrir.`,
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
      `Explorez le budget de la France de manière interactive. ${TOTAL_CARD_COUNT} cartes de dépenses publiques.`,
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
