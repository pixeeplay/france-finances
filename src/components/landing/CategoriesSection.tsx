import Link from "next/link";

const categories = [
  { icon: "🛡️", name: "Défense", stat: "55 Md€/an", deckId: "def" },
  { icon: "🏥", name: "Santé", stat: "1 Français sur 5 en ALD", deckId: "san" },
  { icon: "🏠", name: "Logement", stat: "1,4M ménages en attente", deckId: "log" },
  { icon: "🌍", name: "Immigration", stat: "40% des ADP naturalisés", deckId: "imm" },
  { icon: "👴", name: "Retraites", stat: "Revenu moyen 1 837 €/m", deckId: "soc" },
  { icon: "💰", name: "Recettes", stat: "53% du PIB en prélèvements", deckId: "rec" },
  { icon: "📚", name: "Éducation", stat: "12 élèves/prof", deckId: "edu" },
  { icon: "🚄", name: "Transports", stat: "15 Md€ de train SNCF", deckId: "ene" },
];

export function CategoriesSection() {
  return (
    <section id="categories" className="section-padding bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10 text-landing-primary">
          Explorer les catégories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.deckId}
              href={`/jeu/${cat.deckId}`}
              className="hover-lift flex flex-col items-center gap-2 bg-white rounded-2xl p-5 border border-slate-200 text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-heading font-bold text-slate-900">
                {cat.name}
              </span>
              <span className="text-xs text-slate-500">{cat.stat}</span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/jeu"
            className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-landing-primary hover:underline"
          >
            Voir les catégories détaillées
            <span>&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
