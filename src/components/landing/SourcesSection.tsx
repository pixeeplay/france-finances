const sources = ["vie-publique.fr", "Sénat", "Cour des comptes", "INSEE"];

export function SourcesSection() {
  return (
    <section id="sources" className="section-padding bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-landing-primary mb-6">
          Toutes nos données sont sourcées.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {sources.map((s) => (
            <div
              key={s}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-500"
            >
              {s}
            </div>
          ))}
        </div>

        <p className="text-slate-500 text-sm">
          <strong className="text-slate-700">340 cartes</strong>,{" "}
          <strong className="text-slate-700">1 200+ sources</strong>. Aucun parti pris.
        </p>
      </div>
    </section>
  );
}
