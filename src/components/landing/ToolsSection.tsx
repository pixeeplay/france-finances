import Image from "next/image";
import Link from "next/link";

function IconChart() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <rect x="5" y="11" width="3" height="7" rx="1" />
      <rect x="10.5" y="6" width="3" height="12" rx="1" />
      <rect x="16" y="3" width="3" height="15" rx="1" />
    </svg>
  );
}

function IconCalculator() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <path d="M8.5 6h7" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M8.5 18h3.5M15.5 14.5V18" />
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
    illustration: "/les-chiffres.svg",
    chip: "bg-danger/15 text-danger",
    link: "text-danger",
  },
  {
    href: "/simulateur",
    title: "Le simulateur",
    description: "Estimez l'impôt sur le revenu, les cotisations sociales et la taxe sur la valeur ajoutée (TVA) prélevés sur un salaire, barème 2026.",
    cta: "Lancer le simulateur",
    Icon: IconCalculator,
    illustration: null,
    chip: "bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-blue-700/30",
    link: "text-info",
  },
];

export function ToolsSection() {
  return (
    <section id="outils" aria-labelledby="outils-title" className="section-padding bg-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="outils-title" className="text-3xl md:text-4xl text-center mb-2 text-brand-fg dark:text-foreground">
          Pour aller plus loin
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          Deux outils pour replacer chaque carte dans le budget de la France.
        </p>

        <ul className="grid md:grid-cols-2 gap-6">
          {tools.map(({ href, title, description, cta, Icon, illustration, chip, link }) => (
            <li key={href}>
              <Link
                href={href}
                className="hover-lift group flex h-full flex-col items-center text-center gap-3 rounded-3xl bg-card border border-border p-7"
              >
                {illustration ? (
                  <Image src={illustration} alt="" width={80} height={80} className="h-20 w-20" aria-hidden="true" />
                ) : (
                  <span className={`w-20 h-20 rounded-3xl flex items-center justify-center ${chip}`} aria-hidden="true">
                    <Icon />
                  </span>
                )}
                <span className="font-heading text-2xl font-extrabold text-foreground">{title}</span>
                <span className="text-sm text-muted-foreground leading-relaxed max-w-sm">{description}</span>
                <span className={`mt-auto pt-2 text-sm font-bold ${link}`}>
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
