import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { NavbarLanding } from "@/components/landing/NavbarLanding";

export const metadata: Metadata = {
  title: "À propos — france-finances.com",
  description: "Découvrez le projet france-finances.com et l'équipe derrière cette initiative citoyenne.",
};

export default function AProposPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NavbarLanding />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-8 text-brand-fg">
          À propos
        </h1>

        <div className="max-w-prose space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">france-finances.com</strong> est un projet citoyen
            qui rend les finances publiques françaises accessibles et compréhensibles par tous.
          </p>

          <h2 className="text-2xl font-extrabold text-foreground mt-8 mb-3">
            Notre mission
          </h2>
          <p>
            Le budget de la France représente 1 671 milliards d&apos;euros de dépenses publiques par an (2024, Insee).
            Pourtant, peu de citoyens savent précisément où va cet argent.
            Notre objectif est de démocratiser l&apos;accès à cette information
            grâce à un format interactif et ludique.
          </p>

          <h2 className="text-2xl font-extrabold text-foreground mt-8 mb-3">
            Les données
          </h2>
          <p>
            Toutes nos données sont issues de sources publiques officielles :
            Projet de Loi de Finances (PLF), Loi de Financement de la Sécurité Sociale (LFSS),
            rapports de la Cour des comptes, du Sénat et des ministères.
            Les montants sont exprimés en milliards d&apos;euros et le coût par citoyen
            est calculé sur la base de 69,1 millions d&apos;habitants (Insee, population au 1er janvier 2026).
          </p>

          <h2 className="text-2xl font-extrabold text-foreground mt-8 mb-3">
            Neutralité
          </h2>
          <p>
            Ce projet n&apos;a aucune affiliation politique.
            Les données sont présentées de manière factuelle et neutre.
            L&apos;utilisateur se forge sa propre opinion.
          </p>

          <h2 className="text-2xl font-extrabold text-foreground mt-8 mb-3">
            L&apos;équipe
          </h2>
          <p>
            france-finances.com est développé par{" "}
            <a
              href="https://pixeeplay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              PixeePlay
            </a>
            .
          </p>

          <h2 className="text-2xl font-extrabold text-foreground mt-8 mb-3">
            Les outils
          </h2>
          <p>
            En plus du jeu, le site propose{" "}
            <Link href="/chiffres" className="underline underline-offset-4 hover:text-foreground">
              les chiffres des finances publiques
            </Link>{" "}
            (dette, déficit, budget de l&apos;État, dépense publique) et{" "}
            <Link href="/simulateur" className="underline underline-offset-4 hover:text-foreground">
              un simulateur
            </Link>{" "}
            des impôts et cotisations prélevés sur un salaire.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/jeu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-2xl bg-brand text-white font-heading font-bold text-sm hover:bg-brand-hover transition-colors"
          >
            Commencer à jouer
            <span aria-hidden="true">&#8594;</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-2xl border-2 border-border bg-card text-foreground font-heading font-bold text-sm hover:bg-muted transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
