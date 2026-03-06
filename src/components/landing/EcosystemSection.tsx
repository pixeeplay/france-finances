import Image from "next/image";

const items = [
  {
    image: "/les-chiffres.svg",
    title: "Les Chiffres",
    description: "Toutes les donn\u00E9es budg\u00E9taires fran\u00E7aises en un coup d\u2019\u0153il.",
    url: "https://nicoquipaie.co/chiffres",
  },
  {
    image: "/le-feed.svg",
    title: "Le Feed",
    description: "D\u00E9bats, analyses et r\u00E9actions de la communaut\u00E9.",
    url: "https://nicoquipaie.co",
  },
  {
    image: "/le-simulateur.svg",
    title: "Le Simulateur",
    description: "Simulez votre contribution aux finances publiques.",
    url: "https://nicoquipaie.co/simulateur",
  },
];

export function EcosystemSection() {
  return (
    <section className="section-padding">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-2 text-landing-primary dark:text-white">
          Avec{" "}
          <a href="https://nicoquipaie.co" target="_blank" rel="noopener noreferrer" className="text-landing-expense hover:scale-110 inline-block transition-transform">NicoQuiPaie</a>
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-sm md:text-base">
          La communaut&eacute; open-source pour tron&ccedil;onner les d&eacute;penses publiques
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover-lift group block text-center"
            >
              <div className="mb-4 flex justify-center">
                <Image src={item.image} alt={item.title} width={48} height={48} />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-50 mb-2 flex items-center justify-center gap-2">
                {item.title}
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
