import Link from "next/link";

const ecosystem = [
  {
    title: "france-finances.com",
    description: "Explorez le budget de mani\u00E8re interactive avec le jeu de swipe",
    icon: "\uD83C\uDCCF",
    href: "/jeu",
    external: false,
  },
  {
    title: "nicoquipaie.co",
    description: "Le m\u00E9dia qui d\u00E9cortique les finances publiques fran\u00E7aises",
    icon: "\uD83D\uDCF0",
    href: "https://nicoquipaie.co",
    external: true,
  },
  {
    title: "Communaut\u00E9",
    description: "Rejoignez la communaut\u00E9, comparez vos r\u00E9sultats et progressez",
    icon: "\uD83D\uDC65",
    href: "/ranking",
    external: false,
  },
];

const cardClass = "hover-lift bg-white rounded-2xl p-8 border border-slate-200 text-center block";

function CardContent({ item }: { item: typeof ecosystem[number] }) {
  return (
    <>
      <div className="text-4xl mb-4">{item.icon}</div>
      <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
        {item.title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        {item.description}
      </p>
    </>
  );
}

export function EcosystemSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            L&apos;écosystème NicoQuiPaie
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Des outils pour comprendre et agir sur les finances publiques
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ecosystem.map((item) =>
            item.external ? (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                <CardContent item={item} />
              </a>
            ) : (
              <Link key={item.title} href={item.href} className={cardClass}>
                <CardContent item={item} />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
