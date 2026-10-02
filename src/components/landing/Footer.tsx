import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background pb-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 border-t-2 border-foreground pt-6">
          <div>
            <p className="font-serif text-xl tracking-tight">
              <span className="font-semibold">france-finances</span>
              <span className="text-muted-foreground">.com</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Comprendre les finances publiques de manière interactive et accessible.
            </p>
          </div>

          <nav aria-label="Liens de pied de page">
            <ul className="flex flex-wrap gap-x-6 text-sm">
              <li>
                <Link href="/jeu" className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4">Jouer</Link>
              </li>
              <li>
                <Link href="/a-propos" className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4">À propos</Link>
              </li>
              <li>
                <Link href="/contribuer" className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4">Contribuer</Link>
              </li>
              <li>
                <a
                  href="https://pixeeplay.fr/play/?intent=sponsoriser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4"
                >
                  Devenir sponsor
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-2 font-mono text-xs text-muted-foreground">
          <p>
            Conçu par{" "}
            <a
              href="https://pixeeplay.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              PixeePlay
            </a>
          </p>
          <p>&copy; {new Date().getFullYear()} france-finances.com</p>
        </div>
      </div>
    </footer>
  );
}
