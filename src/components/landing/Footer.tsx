import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">&#127467;&#127479;</span>
              <span className="font-heading text-lg font-bold text-white">
                france-finances
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Comprendre les finances publiques de manière interactive et accessible.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Navigation</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/jeu" className="hover:text-white transition-colors">
                Jouer
              </Link>
              <Link href="/ranking" className="hover:text-white transition-colors">
                Communauté
              </Link>
              <Link href="/a-propos" className="hover:text-white transition-colors">
                À propos
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Écosystème</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://nicoquipaie.co"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                nicoquipaie.co
              </a>
              <a
                href="https://pixeeplay.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                pixeeplay.fr
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} france-finances.com — Données publiques, usage citoyen.</p>
          <p>
            Fait avec &#10084;&#65039; par{" "}
            <a
              href="https://pixeeplay.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              PixeePlay
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
