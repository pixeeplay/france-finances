import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="font-heading font-bold text-landing-primary dark:text-white mb-1 flex items-center gap-2 justify-center md:justify-start">
              <Image src="/france.svg" alt="France" width={24} height={24} />
              <span>france-finances<span className="text-landing-expense">.com</span></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprendre les finances publiques de mani&egrave;re interactive et accessible.
            </p>
            <p className="text-xs text-landing-primary dark:text-slate-300 font-heading font-semibold mt-1">
              Chaque Euro compte. Chaque citoyen aussi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://pixeeplay.fr/?intent=contribuer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-landing-primary/30 dark:border-white/30 text-landing-primary dark:text-white text-sm font-heading font-semibold hover:bg-landing-primary/5 dark:hover:bg-white/5 transition-colors"
            >
              🤝 Contribuer
            </a>
            <a
              href="https://pixeeplay.fr/?intent=sponsoriser"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-landing-primary text-white text-sm font-heading font-semibold hover:bg-landing-primary-light transition-colors"
            >
              💎 Devenez sponsor
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          <p>
            Fait avec rigueur, ❤️ et un peu de tronçonneuse par{" "}
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
