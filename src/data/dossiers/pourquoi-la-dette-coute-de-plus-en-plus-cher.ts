import {
  CURRENT_DEBT,
  POPULATION_2026,
  POPULATION_SOURCE,
  PUBLIC_FINANCES,
  PUBLIC_SPENDING_BY_FUNCTION,
  STATE_MISSIONS_2026,
} from "@/data/chiffres";
import { formatBillionsExact } from "@/lib/format";
import type { DossierBarRow, DossierBody } from "./types";

/**
 * « Pourquoi la dette coûte de plus en plus cher »
 *
 * Intérêts des administrations publiques (Insee Première n° 2106) : 64,7 Md€
 * en 2025, + 6,5 Md€ sur un an, après + 7,1 Md€ en 2024. Les montants 2024
 * (58,2 Md€) et 2023 (51,1 Md€) sont déduits de ces évolutions publiées.
 * Par habitant : 64,7 Md€ / 69,1 M d'habitants = 936 €, arrondi à 940 €.
 */
const INTEREST_2025 = PUBLIC_FINANCES.interestBn;
const INTEREST_2024 = 58.2;
const INTEREST_2023 = 51.1;

const interestPerCapita = Math.round((INTEREST_2025 * 1e9) / POPULATION_2026 / 10) * 10;

/** Les cinq premières missions du budget de l'État 2026, intérêts en rouge. */
const TOP_MISSIONS: DossierBarRow[] = [...STATE_MISSIONS_2026.items]
  .sort((a, b) => b.amountBn - a.amountBn)
  .slice(0, 5)
  .map((m) => {
    const isDebt = m.label.startsWith("Intérêts de la dette");
    return {
      label: isDebt ? "Intérêts de la dette et autres engagements financiers" : m.label.replace(/\s*\(.*\)$/, ""),
      value: m.amountBn,
      display: formatBillionsExact(m.amountBn),
      tone: isDebt ? "red" : "blue",
      highlight: isDebt,
    };
  });

export const detteDossier: DossierBody = {
  slug: "pourquoi-la-dette-coute-de-plus-en-plus-cher",
  cardIds: ["eta-01", "eta-10", "soc-10", "col-12"],
  sections: [
    {
      id: "facture",
      title: "La facture en chiffres",
      blocks: [
        {
          type: "chiffre",
          value: formatBillionsExact(INTEREST_2025),
          label: `d'intérêts payés sur la dette publique en ${PUBLIC_FINANCES.year}`,
          detail: "État, Sécurité sociale et collectivités locales réunis.",
          tone: "red",
          refs: ["insee-apu-2025"],
        },
        {
          type: "p",
          text: "En 2025, l'État, la Sécurité sociale et les collectivités locales ont payé ensemble 64,7 Md€ d'intérêts sur leur dette, selon l'Insee. C'est 6,5 Md€ de plus qu'en 2024, année qui avait déjà connu une hausse de 7,1 Md€. En deux ans, la facture a augmenté de 13,6 Md€, soit plus d'un quart.",
          refs: ["insee-apu-2025"],
        },
        {
          type: "chart",
          chart: {
            kind: "bars",
            id: "interets",
            title: "Les intérêts de la dette publique",
            subtitle: "Milliards d'euros, ensemble des administrations publiques",
            description:
              "Intérêts versés par l'ensemble des administrations publiques (État, Sécurité sociale, collectivités locales), hors correction des services d'intermédiation financière (Sifim). Le montant 2025 est publié par l'Insee ; les montants 2024 et 2023 sont déduits des évolutions publiées dans la même étude (+ 6,5 Md€ en 2025, + 7,1 Md€ en 2024).",
            valueName: "Intérêts",
            columns: ["Année", "Intérêts"],
            rows: [
              { label: "2023", value: INTEREST_2023, display: formatBillionsExact(INTEREST_2023), tone: "amber" },
              { label: "2024", value: INTEREST_2024, display: formatBillionsExact(INTEREST_2024), tone: "orange" },
              { label: "2025", value: INTEREST_2025, display: formatBillionsExact(INTEREST_2025), tone: "red", highlight: true },
            ],
            source: "insee-apu-2025",
            period: "2023-2025",
          },
        },
        {
          type: "p",
          text: `L'État en paie l'essentiel : 53,3 Md€ pour les administrations centrales, loin devant les collectivités locales (6,0 Md€) et la Sécurité sociale (5,6 Md€). Ramenés à la population, ces intérêts représentent environ ${interestPerCapita} € par habitant.`,
          refs: ["insee-apu-2025", "insee-population"],
        },
        {
          type: "p",
          text: "Pour mesurer l'ordre de grandeur : en 2024, les administrations publiques ont consacré 54 Md€ à la défense et 30 Md€ à la protection de l'environnement. Avec 58,2 Md€, les intérêts de la dette dépassaient déjà chacun de ces deux budgets.",
          refs: ["insee-cofog-2024", "insee-apu-2025"],
        },
      ],
    },
    {
      id: "moteurs",
      title: "Deux moteurs : plus de dette, des taux plus hauts",
      blocks: [
        {
          type: "p",
          text: `La charge d'intérêts dépend de deux choses : la somme empruntée et le taux payé. Les deux augmentent. Fin juin 2026, la dette publique atteint ${formatBillionsExact(CURRENT_DEBT.amountBn)}, soit 119 % du produit intérieur brut (PIB), contre 112,6 % fin 2024 et 115,7 % fin 2025.`,
          refs: ["insee-dette-t2-2026", "insee-apu-2025"],
        },
        {
          type: "chart",
          chart: {
            kind: "debt",
            id: "dette-pib",
            title: "La dette publique depuis 2019",
            subtitle: "En % du PIB, fin d'année puis fin juin 2026",
            description:
              "Dette publique au sens de Maastricht, en pourcentage du produit intérieur brut, en fin d'année (fin juin pour 2026). 2020 et 2021 ne sont pas reprises : le trait pointillé relie 2019 à 2022.",
          },
        },
        {
          type: "p",
          text: "Chaque année de déficit ajoute de la dette : le déficit public a atteint 152,5 Md€ en 2025, soit 5,1 % du PIB.",
          refs: ["insee-apu-2025"],
        },
        {
          type: "p",
          text: "L'État porte l'essentiel de cette dette. Sa dette négociable, c'est-à-dire les titres qu'il émet sur les marchés financiers, atteignait 2 757 Md€ fin septembre 2025.",
          refs: ["senat-plf-2026"],
        },
        {
          type: "p",
          text: "Côté taux, le retournement date de 2022. Le taux moyen auquel l'État emprunte à moyen et long terme, avec les obligations assimilables du Trésor (OAT), est passé de 1,70 % en 2022 à 3,35 % en 2025. Au printemps 2026, le taux des OAT à 10 ans est monté de 3,2 % fin février à 3,9 % fin mars, avant de se stabiliser à 3,8 %, son plus haut niveau depuis 2011.",
          refs: ["senat-comptes-2025"],
        },
      ],
    },
    {
      id: "effet-retard",
      title: "Un effet qui s'étale sur des années",
      blocks: [
        {
          type: "p",
          text: "La dette ne se renouvelle pas d'un coup. Chaque année, l'État rembourse les titres qui arrivent à échéance et en émet de nouveaux : 310 Md€ d'émissions à moyen et long terme sont prévues en 2026. Les titres émis quand les taux étaient bas sont ainsi remplacés, peu à peu, par des titres plus coûteux.",
          refs: ["senat-plf-2026"],
        },
        {
          type: "p",
          text: "C'est pourquoi une hausse des taux pèse de plus en plus lourd avec le temps. Selon le rapport du Sénat sur le budget 2026, une hausse durable de 1 point de tous les taux augmenterait la charge de la dette de l'État de 3,2 Md€ la première année, de 23,5 Md€ au bout de cinq ans et de 33,5 Md€ au bout de neuf ans.",
          refs: ["senat-plf-2026"],
        },
        {
          type: "chiffre",
          value: "+ 23,5 Md€",
          label: "de charge de la dette au bout de cinq ans si les taux montent durablement de 1 point",
          detail: "Estimation pour l'État, sur l'ensemble des durées d'emprunt.",
          tone: "amber",
          refs: ["senat-plf-2026"],
        },
        {
          type: "p",
          text: "Une partie de la dette est indexée sur l'inflation : quand les prix montent vite, son coût grimpe aussi. La provision passée à ce titre dans le budget de l'État a atteint 15,8 Md€ en 2023, avant de redescendre à 6,9 Md€ en 2024, puis à 4,9 Md€ en 2025 avec le reflux de l'inflation.",
          refs: ["senat-comptes-2025"],
        },
      ],
    },
    {
      id: "budget",
      title: "Bientôt le premier poste du budget ?",
      blocks: [
        {
          type: "p",
          text: "Dans le budget de l'État, la charge de la dette atteindrait 58,0 Md€ en 2026, contre 53,5 Md€ votés pour 2025 (+ 7,5 %). Avec les autres engagements financiers, la mission correspondante pèse 60,3 Md€, juste derrière l'enseignement scolaire (89,7 Md€) et la défense (66,7 Md€).",
          refs: ["senat-plf-2026", "senat-etat-b"],
        },
        {
          type: "chart",
          chart: {
            kind: "bars",
            id: "missions",
            title: "Les cinq premières missions du budget de l'État",
            subtitle: "Crédits de paiement 2026, milliards d'euros",
            description:
              "Crédits de paiement des missions du budget général pour 2026 (état B, texte adopté par le Sénat en première lecture), hors remboursements et dégrèvements d'impôts. La mission « Engagements financiers de l'État » comprend la charge de la dette et d'autres engagements (garanties, appels en garantie).",
            valueName: "Crédits",
            columns: ["Mission", "Crédits 2026"],
            rows: TOP_MISSIONS,
            source: "senat-etat-b",
            period: STATE_MISSIONS_2026.period,
          },
        },
        {
          type: "p",
          text: "Le rapporteur du Sénat estime que la charge de la dette de l'État pourrait dépasser 70 Md€ en 2027 et 90 Md€ en 2029, la barre des 100 Md€ pouvant être atteinte autour de 2030. Elle deviendrait alors, à terme, le premier poste de dépenses du budget.",
          refs: ["senat-plf-2026"],
        },
        {
          type: "p",
          text: "Ces projections reposent sur des hypothèses de taux d'intérêt, d'inflation et de déficit. Elles seront revues à chaque nouveau budget : un déficit plus faible ou des taux en baisse les feraient reculer, l'inverse les alourdirait.",
        },
      ],
    },
  ],
  sources: [
    {
      id: "insee-apu-2025",
      label: "Insee Première n° 2106 — Le compte des administrations publiques en 2025",
      url: "https://www.insee.fr/fr/statistiques/8997691",
      date: "2026-05-29",
    },
    {
      id: "insee-dette-t2-2026",
      label: CURRENT_DEBT.source.label,
      url: CURRENT_DEBT.source.url,
      date: CURRENT_DEBT.source.date,
    },
    {
      id: "insee-cofog-2024",
      label: PUBLIC_SPENDING_BY_FUNCTION.source.label,
      url: PUBLIC_SPENDING_BY_FUNCTION.source.url,
      date: PUBLIC_SPENDING_BY_FUNCTION.source.date,
    },
    {
      id: "insee-population",
      label: POPULATION_SOURCE.label,
      url: POPULATION_SOURCE.url,
      date: POPULATION_SOURCE.date,
    },
    {
      id: "senat-comptes-2025",
      label:
        "Sénat — Rapport n° 736 (2025-2026) sur l'approbation des comptes de 2025, annexe 13 : engagements financiers de l'État",
      url: "https://www.senat.fr/rap/l25-736-213/l25-736-2131.pdf",
      date: "2026-06-17",
    },
    {
      id: "senat-plf-2026",
      label:
        "Sénat — Rapport général n° 139 (2025-2026) sur le PLF 2026, tome III, annexe 12 : engagements financiers de l'État",
      url: "https://www.senat.fr/rap/l25-139-312/l25-139-312_mono.html",
      date: "2025-11-24",
    },
    {
      id: "senat-etat-b",
      label: STATE_MISSIONS_2026.source.label,
      url: STATE_MISSIONS_2026.source.url,
      date: STATE_MISSIONS_2026.source.date,
    },
  ],
};
