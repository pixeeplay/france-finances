import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="font-heading font-bold text-slate-900 mb-1">
              france-finances<span className="text-landing-primary">.com</span>
            </div>
            <p className="text-xs text-slate-500">
              Comprendre les finances publiques de manière interactive et accessible.
            </p>
            <p className="text-xs text-landing-primary font-heading font-semibold mt-1">
              Chaque Euro compte. Chaque citoyen aussi.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/jeu" className="hover:text-landing-primary transition-colors">
              Jouer
            </Link>
            <a href="#paris" className="hover:text-landing-primary transition-colors">
              Paris
            </a>
            <a href="#sources" className="hover:text-landing-primary transition-colors">
              Sources
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://nicoquipaie.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-landing-primary/30 text-landing-primary text-sm font-heading font-semibold hover:bg-landing-primary/5 transition-colors"
            >
              🤝 Contribuer
            </a>
            <a
              href="https://nicoquipaie.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-landing-primary text-white text-sm font-heading font-semibold hover:bg-landing-primary-light transition-colors"
            >
              💎 Devenez sponsor
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-8">
          <p>
            Fait avec rigueur, ❤️ (et un peu de tronçonneuse 🪚) par{" "}
            <a
              href="https://pixeeplay.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-landing-primary hover:underline"
            >
              PixeePlay
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} france-finances.com</p>
        </div>
      </div>
    </footer>
  );
}
