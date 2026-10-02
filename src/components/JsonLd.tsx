export function JsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "france-finances.com",
    url: "https://france-finances.com",
    logo: "https://france-finances.com/favicon.ico",
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://france-finances.com" },
      { "@type": "ListItem", position: 2, name: "Jouer", item: "https://france-finances.com/jeu" },
      { "@type": "ListItem", position: 3, name: "Catégories", item: "https://france-finances.com/categories" },
      { "@type": "ListItem", position: 4, name: "Classement", item: "https://france-finances.com/classement" },
      { "@type": "ListItem", position: 5, name: "Contribuer", item: "https://france-finances.com/contribuer" },
    ],
  };

  const game = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "La Tronçonneuse de Poche",
    url: "https://france-finances.com/jeu",
    description:
      "Mini-jeu interactif pour explorer les dépenses publiques françaises. Swipez pour garder ou remettre en question chaque poste budgétaire.",
    genre: "Educational",
    gamePlatform: "Web",
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    inLanguage: "fr",
    isAccessibleForFree: true,
  };

  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "La Tronçonneuse de Poche",
    url: "https://france-finances.com",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    description:
      "Explorez le budget de la France de manière interactive. 369 cartes de dépenses publiques à découvrir.",
    inLanguage: "fr",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(game) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
