import Link from "next/link";

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="5" y="11" width="3" height="6" />
      <rect x="10.5" y="7" width="3" height="10" />
      <rect x="16" y="4" width="3" height="13" />
    </svg>
  );
}

function IconCalculator() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <section id="outils" aria-labelledby="outils-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <header className="mb-6 border-b-2 border-foreground pb-3">
          <p className="kicker text-muted-foreground mb-2">Pour aller plus loin</p>
          <h2 id="outils-title" className="text-3xl md:text-4xl font-semibold leading-tight">
            Deux outils pour replacer chaque carte
          </h2>
        </header>

        <ul className="grid md:grid-cols-2 md:divide-x divide-border">
          {tools.map(({ href, title, description, cta, Icon }) => (
            <li key={href} className="border-b border-border md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
              <Link href={href} className="group flex flex-col gap-3 py-5 min-h-[44px]">
                <span className="text-muted-foreground">
                  <Icon />
                </span>
                <span className="font-serif text-2xl font-semibold leading-tight group-hover:underline underline-offset-4 decoration-1">
                  {title}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{description}</span>
                <span className="kicker text-foreground">
                  {cta} <span aria-hidden="true">&#8594;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
