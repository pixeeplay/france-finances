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
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-8">
          À propos
        </h1>

        <div className="max-w-prose space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">france-finances.com</strong> est un projet citoyen
            qui rend les finances publiques françaises accessibles et compréhensibles par tous.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">
            Notre mission
          </h2>
          <p>
            Le budget de la France représente plus de 1 600 milliards d&apos;euros par an.
            Pourtant, peu de citoyens savent précisément où va cet argent.
            Notre objectif est de démocratiser l&apos;accès à cette information
            grâce à un format interactif et ludique.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">
            Les données
          </h2>
          <p>
            Toutes nos données sont issues de sources publiques officielles :
            Projet de Loi de Finances (PLF), Loi de Financement de la Sécurité Sociale (LFSS),
            rapports de la Cour des comptes, du Sénat et des ministères.
            Les montants sont exprimés en milliards d&apos;euros et le coût par citoyen
            est calculé sur la base de 68 millions d&apos;habitants.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">
            Neutralité
          </h2>
          <p>
            Ce projet n&apos;a aucune affiliation politique.
            Les données sont présentées de manière factuelle et neutre.
            L&apos;utilisateur se forge sa propre opinion.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">
            L&apos;équipe
          </h2>
          <p>
            france-finances.com est développé par{" "}
            <a
              href="https://pixeeplay.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              PixeePlay
            </a>
            , en partenariat avec{" "}
            <a
              href="https://nicoquipaie.co"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              nicoquipaie.co
            </a>
            .
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/jeu"
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-md bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Commencer à jouer
            <span>&#8594;</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 min-h-[44px] rounded-md border border-foreground/40 text-foreground font-semibold text-sm hover:bg-muted transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
