// Section provisoire : l'agent E la remplace par les liens vers /chiffres et /simulateur.
// Seul le style a été aligné sur la direction artistique (contenu inchangé).

const items = [
  {
    title: "Les Chiffres",
    description: "Toutes les données budgétaires françaises en un coup d’œil.",
    url: "https://nicoquipaie.co/chiffres",
  },
  {
    title: "Le Feed",
    description: "Débats, analyses et réactions de la communauté.",
    url: "https://nicoquipaie.co",
  },
  {
    title: "Le Simulateur",
    description: "Simulez votre contribution aux finances publiques.",
    url: "https://nicoquipaie.co/simulateur",
  },
];

export function EcosystemSection() {
  return (
    <section aria-labelledby="ecosystem-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <header className="mb-6 border-b-2 border-foreground pb-3">
          <p className="kicker text-muted-foreground mb-2">Pour aller plus loin</p>
          <h2 id="ecosystem-title" className="text-3xl md:text-4xl font-semibold leading-tight">
            Avec NicoQuiPaie
          </h2>
        </header>

        <ul className="grid md:grid-cols-3 md:divide-x divide-border">
          {items.map((item) => (
            <li key={item.title} className="border-b border-border md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 py-5 min-h-[44px]"
              >
                <span className="font-serif text-xl font-semibold group-hover:underline underline-offset-4 decoration-1">
                  {item.title}
                  <span aria-hidden="true" className="ml-1 text-muted-foreground">&#8599;</span>
                  <span className="sr-only"> (nouvel onglet)</span>
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{item.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
