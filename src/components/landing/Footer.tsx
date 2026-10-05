import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pb-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <Logo size="sm" />
            <p className="mt-2 text-sm text-muted-foreground">
              Comprendre les finances publiques de manière interactive et accessible.
            </p>
            <p className="mt-1 text-sm font-heading font-bold text-brand-fg dark:text-foreground">
              Chaque euro compte. Chaque citoyen aussi.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contribuer"
              className="inline-flex items-center min-h-[44px] px-5 rounded-xl border border-brand-fg/40 dark:border-muted-foreground/50 text-brand-fg dark:text-foreground text-sm font-heading font-bold hover:bg-muted/60 transition-colors"
            >
              Contribuer
            </Link>
            <a
              href="https://pixeeplay.fr/play/?intent=sponsoriser"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] px-5 rounded-xl bg-brand text-white text-sm font-heading font-bold hover:bg-brand-hover transition-colors"
            >
              Devenir sponsor
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </div>

        <nav aria-label="Liens de pied de page" className="mt-8">
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 text-sm text-muted-foreground">
            <li>
              <Link href="/jeu" className="inline-flex items-center min-h-[44px] hover:text-foreground">Jouer</Link>
            </li>
            <li>
              <Link href="/chiffres" className="inline-flex items-center min-h-[44px] hover:text-foreground">Chiffres clés</Link>
            </li>
            <li>
              <Link href="/simulateur" className="inline-flex items-center min-h-[44px] hover:text-foreground">Simulateur</Link>
            </li>
            <li>
              <Link href="/lexique" className="inline-flex items-center min-h-[44px] hover:text-foreground">Lexique</Link>
            </li>
            <li>
              <Link href="/a-propos" className="inline-flex items-center min-h-[44px] hover:text-foreground">À propos</Link>
            </li>
            <li>
              <Link href="/infos/confidentialite" className="inline-flex items-center min-h-[44px] hover:text-foreground">Confidentialité</Link>
            </li>
          </ul>
        </nav>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            Fait avec rigueur par{" "}
            <a
              href="https://pixeeplay.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] -my-[14px] font-semibold text-brand-fg hover:underline"
            >
              PixeePlay
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} france-finances.com</p>
        </div>
      </div>
    </footer>
  );
}
