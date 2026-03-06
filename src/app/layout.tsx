import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AppInit } from "@/components/AppInit";
import { PageviewTracker } from "@/components/PageviewTracker";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nicoquipaie.pixeeplay.fr"),
  title: "\uD83C\uDDEB\uD83C\uDDF7 france-finances.com — Comprendre les finances publiques",
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
    title: "\uD83C\uDDEB\uD83C\uDDF7 france-finances.com — Comprendre les finances publiques",
    description:
      "Explorez le budget de la France de manière interactive. 370 cartes de dépenses publiques à découvrir.",
    url: "https://nicoquipaie.pixeeplay.fr",
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
    title: "\uD83C\uDDEB\uD83C\uDDF7 france-finances.com — Comprendre les finances publiques",
    description:
      "Explorez le budget de la France de manière interactive. 370 cartes de dépenses publiques.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
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
