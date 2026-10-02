import { AcronymText } from "@/components/AcronymText";

const sources = [
  { name: "Projet de budget 2026 (PLF)", title: "Projet de loi de finances 2026", url: "https://www.budget.gouv.fr/budget-etat/plf-2026" },
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
    <section id="sources" aria-labelledby="sources-title" className="section-padding section-deep">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="sources-title" className="text-3xl md:text-4xl text-brand-fg dark:text-foreground mb-4">
          Toutes nos données sont sourcées.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          <AcronymText
            text={"Chaque carte cite ses sources officielles. Montants en milliards d'euros par an, coût par habitant calculé sur 69,1\u00a0millions d'habitants (Insee, 1er janvier 2026). Le jeu ne dit pas ce qu'il faut couper\u00a0: il montre ce que coûte chaque politique publique."}
          />
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-3">
          {sources.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:border-brand-fg/60 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-brand-fg" aria-hidden="true" />
                {s.name}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-muted-foreground text-sm">
          <strong className="text-foreground">400+ sources.</strong> Aucun parti pris.
        </p>
      </div>
    </section>
  );
}
