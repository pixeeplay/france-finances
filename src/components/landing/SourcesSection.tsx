const sources = [
  { name: "PLF 2026", title: "Projet de Loi de Finances 2026", url: "https://www.budget.gouv.fr/budget-etat/plf-2026" },
  { name: "Cour des comptes", title: "Cour des comptes", url: "https://www.ccomptes.fr" },
  { name: "S\u00E9nat", title: "S\u00E9nat", url: "https://www.senat.fr" },
  { name: "DREES", title: "Direction de la Recherche, des \u00C9tudes, de l\u2019\u00C9valuation et des Statistiques", url: "https://drees.solidarites-sante.gouv.fr" },
  { name: "vie-publique.fr", title: "vie-publique.fr", url: "https://www.vie-publique.fr" },
  { name: "INSEE", title: "Institut National de la Statistique et des \u00C9tudes \u00C9conomiques", url: "https://www.insee.fr" },
  { name: "ADEME", title: "Agence de l\u2019Environnement et de la Ma\u00EEtrise de l\u2019\u00C9nergie", url: "https://www.ademe.fr" },
  { name: "DGFiP", title: "Direction G\u00E9n\u00E9rale des Finances Publiques", url: "https://www.economie.gouv.fr/dgfip" },
  { name: "DARES", title: "Direction de l\u2019Animation de la Recherche, des \u00C9tudes et des Statistiques", url: "https://dares.travail-emploi.gouv.fr" },
  { name: "Commission europ\u00E9enne", title: "Commission europ\u00E9enne", url: "https://commission.europa.eu/index_fr" },
];

export function SourcesSection() {
  return (
    <section id="sources" className="section-padding bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-landing-primary dark:text-white mb-6">
          Toutes nos donn&eacute;es sont sourc&eacute;es.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.title}
              className="group px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-landing-primary/40 dark:hover:border-landing-primary/40 hover:text-landing-primary dark:hover:text-white transition-colors"
            >
              {s.name}
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="inline-block ml-1.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ))}
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm">
          <strong className="text-slate-700 dark:text-slate-200">400+ sources</strong>.
          <br />
          Aucun parti pris.
        </p>
      </div>
    </section>
  );
}
