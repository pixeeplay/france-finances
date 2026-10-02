import Link from "next/link";

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="5" y="11" width="3" height="6" />
      <rect x="10.5" y="7" width="3" height="10" />
      <rect x="16" y="4" width="3" height="13" />
    </svg>
  );
}

function IconCalculator() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="11" x2="8" y2="11.01" />
      <line x1="12" y1="11" x2="12" y2="11.01" />
      <line x1="16" y1="11" x2="16" y2="11.01" />
      <line x1="8" y1="15" x2="8" y2="15.01" />
      <line x1="12" y1="15" x2="12" y2="15.01" />
      <line x1="16" y1="15" x2="16" y2="18" />
      <line x1="8" y1="18" x2="12" y2="18" />
    </svg>
  );
}

const tools = [
  {
    href: "/chiffres",
    title: "Les chiffres",
    description: "Dette, déficit, budget de l'État et dépense publique : les données officielles, sourcées.",
    cta: "Consulter les chiffres",
    Icon: IconChart,
  },
  {
    href: "/simulateur",
    title: "Le simulateur",
    description: "Estimez l'impôt, la CSG, les cotisations et la TVA prélevés sur un salaire, barème 2026.",
    cta: "Lancer le simulateur",
    Icon: IconCalculator,
  },
];

export function ToolsSection() {
  return (
    <section id="outils" className="section-padding">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-2 text-landing-primary dark:text-white">
          Aller plus loin
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          Deux outils pour replacer chaque carte dans l&apos;ensemble des finances publiques.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map(({ href, title, description, cta, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover-lift"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-landing-primary/10 text-landing-primary dark:bg-white/10 dark:text-white">
                <Icon />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-landing-primary dark:text-white">
                {cta}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&#8594;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
