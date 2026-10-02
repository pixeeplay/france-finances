const sources = [
  { name: "PLF 2026", title: "Projet de loi de finances 2026", url: "https://www.budget.gouv.fr/budget-etat/plf-2026" },
  { name: "Cour des comptes", title: "Cour des comptes", url: "https://www.ccomptes.fr" },
  { name: "Sénat", title: "Sénat", url: "https://www.senat.fr" },
  { name: "DREES", title: "Direction de la recherche, des études, de l’évaluation et des statistiques", url: "https://drees.solidarites-sante.gouv.fr" },
  { name: "vie-publique.fr", title: "vie-publique.fr", url: "https://www.vie-publique.fr" },
  { name: "INSEE", title: "Institut national de la statistique et des études économiques", url: "https://www.insee.fr" },
  { name: "ADEME", title: "Agence de l’environnement et de la maîtrise de l’énergie", url: "https://www.ademe.fr" },
  { name: "DGFiP", title: "Direction générale des finances publiques", url: "https://www.economie.gouv.fr/dgfip" },
  { name: "DARES", title: "Direction de l’animation de la recherche, des études et des statistiques", url: "https://dares.travail-emploi.gouv.fr" },
  { name: "Commission européenne", title: "Commission européenne", url: "https://commission.europa.eu/index_fr" },
];

export function SourcesSection() {
  return (
    <section id="sources" aria-labelledby="sources-title" className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid gap-8 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="kicker text-muted-foreground mb-3">Méthode</p>
          <h2 id="sources-title" className="text-3xl md:text-4xl font-semibold leading-tight">
            Des chiffres sourcés, sans parti pris
          </h2>
        </header>
        <div className="lg:col-span-8">
          <p className="leading-relaxed max-w-prose">
            Chaque carte cite ses sources officielles. Les montants sont exprimés en milliards
            d&apos;euros par an&nbsp;; le coût par habitant est calculé sur une base d&apos;environ
            68&nbsp;millions d&apos;habitants. Le jeu ne dit pas ce qu&apos;il faut couper&nbsp;:
            il montre ce que coûte chaque politique publique.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
            {sources.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.title}
                  className="inline-flex items-center min-h-[44px] font-mono text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground transition-colors"
                >
                  {s.name}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
