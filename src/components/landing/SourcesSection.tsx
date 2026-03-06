const sources = [
  {
    name: "Projet de Loi de Finances (PLF) 2025",
    url: "https://www.budget.gouv.fr/budget-etat/plf-2025",
  },
  {
    name: "Loi de Financement de la S\u00E9curit\u00E9 Sociale (LFSS) 2025",
    url: "https://www.assemblee-nationale.fr/dyn/16/dossiers/plfss_2025",
  },
  {
    name: "Cour des comptes \u2014 Rapport sur le budget de l'\u00C9tat",
    url: "https://www.ccomptes.fr/fr/publications",
  },
  {
    name: "S\u00E9nat \u2014 Commission des finances",
    url: "https://www.senat.fr/commission/fin/index.html",
  },
  {
    name: "vie-publique.fr \u2014 Fiches sur les finances publiques",
    url: "https://www.vie-publique.fr/fiches/finances-publiques",
  },
  {
    name: "INSEE \u2014 Comptes nationaux",
    url: "https://www.insee.fr/fr/statistiques?theme=16",
  },
  {
    name: "Direction du Budget \u2014 Forum de la performance",
    url: "https://www.performance-publique.budget.gouv.fr/",
  },
  {
    name: "Assembl\u00E9e nationale \u2014 Rapports sp\u00E9ciaux du PLF",
    url: "https://www.assemblee-nationale.fr/dyn/16/dossiers/plf_2025",
  },
];

export function SourcesSection() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Des donn\u00E9es sourc\u00E9es et v\u00E9rifi\u00E9es
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-10">
          Toutes nos donn\u00E9es proviennent de sources officielles et sont r\u00E9guli\u00E8rement mises \u00E0 jour.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
          {sources.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-slate-200 hover:bg-slate-100 transition-colors group"
            >
              <span className="text-landing-success mt-0.5 shrink-0">&#10003;</span>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                {source.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
