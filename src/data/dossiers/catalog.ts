import type { DossierMeta } from "./types";

/**
 * Catalogue des dossiers (métadonnées seules), du plus récent au plus ancien.
 * Importé par la navigation du site : ne pas y mettre le corps des articles.
 *
 * Pour publier un dossier : passer `status` à "publie" après relecture.
 */
export const DOSSIER_CATALOG: readonly DossierMeta[] = [
  {
    slug: "ou-va-1-euro-de-csg",
    title: "Où va 1 euro de CSG ?",
    description:
      "Prélevée sur les salaires, les retraites, le chômage et l'épargne, la CSG ne finance pas l'État mais la Sécurité sociale, l'assurance chômage et le remboursement de la dette sociale. Suivons un euro.",
    kicker: "Sécurité sociale",
    deckId: "social",
    status: "publie",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    ogFigure: { value: "130 Md€", label: "de CSG pour la Sécurité sociale en 2026" },
  },
  {
    slug: "pourquoi-la-dette-coute-de-plus-en-plus-cher",
    title: "Pourquoi la dette coûte de plus en plus cher",
    description:
      "Les intérêts de la dette publique ont augmenté de plus d'un quart en deux ans. Plus de dette, des taux plus hauts et un effet qui s'étale sur des années : les mécanismes, chiffres officiels à l'appui.",
    kicker: "Dette publique",
    deckId: "etat",
    status: "publie",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    ogFigure: { value: "64,7 Md€", label: "d'intérêts payés en 2025" },
  },
  {
    slug: "qui-paie-l-impot-sur-le-revenu",
    title: "Qui paie l'impôt sur le revenu ?",
    description:
      "Moins d'un foyer sur deux paie l'impôt sur le revenu, et les 10 % les plus aisés en acquittent près des trois quarts. Ce que disent les dernières statistiques de l'administration fiscale.",
    kicker: "Impôts",
    deckId: "recettes",
    status: "publie",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    ogFigure: { value: "47 %", label: "des foyers paient l'impôt sur le revenu" },
  },
];
