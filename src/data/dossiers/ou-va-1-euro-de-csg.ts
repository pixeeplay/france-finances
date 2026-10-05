import type { DossierBody } from "./types";

/**
 * « Où va 1 euro de CSG ? »
 *
 * Répartition de la CSG sur les revenus d'activité : article L131-8 du code de
 * la sécurité sociale (3°), 1° du I de l'article L136-8 (9,2 points au total).
 * Centimes par euro arrondis au plus fort reste (total 100) :
 * maladie 4,25 / 9,2 = 46,2 ; autonomie 2,08 / 9,2 = 22,6 ; Unédic 1,47 / 9,2 = 16,0 ;
 * famille 0,95 / 9,2 = 10,3 ; Cades 0,45 / 9,2 = 4,9.
 * CSG des régimes de base par branche : PLFSS 2026, annexe 3, tableau 5
 * (prévision 2026) ; pour 100 € (total des branches, 130,4 Md€) : 44 / 28 / 18 / 10.
 */
export const csgDossier: DossierBody = {
  slug: "ou-va-1-euro-de-csg",
  cardIds: ["rec-04", "soc-15", "soc-04", "soc-05"],
  sections: [
    {
      id: "prelevement",
      title: "Un prélèvement sur presque tous les revenus",
      blocks: [
        {
          type: "p",
          text: "La contribution sociale généralisée (CSG) apparaît sur chaque fiche de paie, mais aussi sur les relevés de pension, les allocations chômage et les revenus de l'épargne. Contrairement à l'impôt sur le revenu, elle ne dépend ni du nombre d'enfants ni d'un barème par tranches : c'est un pourcentage du revenu, prélevé à la source.",
        },
        {
          type: "p",
          text: "Son taux dépend de la nature du revenu. Il est de 9,2 % sur les salaires et les autres revenus d'activité. Les pensions de retraite et d'invalidité sont prélevées à 8,3 %, 6,6 % ou 3,8 % selon le revenu fiscal de référence, et les retraités les plus modestes en sont exonérés. Les allocations chômage sont prélevées à 6,2 % ou 3,8 %, ou exonérées.",
          refs: ["l131-8", "dss-2026"],
        },
        {
          type: "chiffre",
          value: "130 Md€",
          label: "de CSG attendus par les régimes de base de la Sécurité sociale en 2026",
          detail: "Prévision du projet de loi de financement de la Sécurité sociale (octobre 2025), hors part de l'Unédic et de la Cades.",
          tone: "violet",
          refs: ["plfss-annexe3"],
        },
        {
          type: "p",
          text: "C'est la deuxième ressource de la Sécurité sociale, après les cotisations. Sur 659,5 Md€ de recettes nettes prévues en 2026 pour les régimes de base, 336,1 Md€ viennent des cotisations sociales et 130,1 Md€ de la CSG, soit environ un cinquième.",
          refs: ["plfss-annexe3"],
        },
      ],
    },
    {
      id: "salaire",
      title: "Sur un salaire, cinq destinataires",
      blocks: [
        {
          type: "p",
          text: "La loi fixe le partage au centième de point près. L'article L131-8 du code de la sécurité sociale découpe les 9,2 points de CSG prélevés sur les revenus d'activité en cinq parts :",
          refs: ["l131-8"],
        },
        {
          type: "list",
          items: [
            "4,25 points pour l'assurance maladie ;",
            "2,08 points pour la Caisse nationale de solidarité pour l'autonomie (CNSA), qui finance l'aide aux personnes âgées dépendantes et aux personnes handicapées ;",
            "1,47 point pour l'Unédic, qui gère l'assurance chômage ;",
            "0,95 point pour la Caisse nationale des allocations familiales (CNAF) ;",
            "0,45 point pour la Caisse d'amortissement de la dette sociale (Cades), chargée de rembourser la dette accumulée par la Sécurité sociale.",
          ],
          refs: ["l131-8"],
        },
        {
          type: "chart",
          chart: {
            kind: "bars",
            id: "csg-salaire",
            title: "Sur 1 € de CSG prélevé sur un salaire",
            subtitle: "En centimes, selon la loi en vigueur en 2026",
            description:
              "Part de chaque organisme dans les 9,2 points de CSG sur les revenus d'activité (article L131-8 du code de la sécurité sociale), ramenée à 1 €. Arrondis au centime, total 100 centimes.",
            valueName: "Sur 1 €",
            columns: ["Organisme", "Sur 1 €"],
            rows: [
              { label: "Assurance maladie", value: 46, display: "46 c", tone: "cyan", highlight: true },
              { label: "Autonomie (CNSA)", value: 23, display: "23 c", tone: "violet" },
              { label: "Assurance chômage (Unédic)", value: 16, display: "16 c", tone: "amber" },
              { label: "Allocations familiales (CNAF)", value: 10, display: "10 c", tone: "emerald" },
              { label: "Remboursement de la dette sociale (Cades)", value: 5, display: "5 c", tone: "red" },
            ],
            source: "l131-8",
            period: "2026",
          },
        },
        {
          type: "p",
          text: "Autrement dit, sur 1 euro de CSG retenu sur un salaire, 46 centimes vont à l'assurance maladie, 23 centimes à l'autonomie, 16 centimes à l'assurance chômage, 10 centimes aux allocations familiales et 5 centimes au remboursement de la dette sociale.",
          refs: ["l131-8"],
        },
        {
          type: "p",
          text: "La part de l'Unédic a une origine précise : elle a été attribuée à l'assurance chômage pour compenser la suppression des cotisations salariales d'assurance chômage. Elle a représenté 17,3 Md€ en 2024.",
          refs: ["plfss-annexe3"],
        },
      ],
    },
    {
      id: "retraite",
      title: "Sur une retraite, une part pour les pensions",
      blocks: [
        {
          type: "p",
          text: "Le partage change avec le revenu taxé. Sur une pension de retraite prélevée au taux de 8,3 %, il n'y a pas de part pour l'assurance chômage. En revanche, 2,94 points vont à la branche vieillesse, celle qui verse les retraites du régime général. L'assurance maladie reçoit 2,53 points, l'autonomie 2,08, la Cades 0,45 et la branche famille 0,3.",
          refs: ["l131-8"],
        },
      ],
    },
    {
      id: "total",
      title: "Au total, d'abord la santé et l'autonomie",
      blocks: [
        {
          type: "p",
          text: "Tous revenus confondus, la CSG des régimes de base irait en 2026 pour 57,4 Md€ à la branche maladie, 37,1 Md€ à la branche autonomie, 22,8 Md€ à la branche vieillesse et 13,1 Md€ à la branche famille. Pour 100 € de CSG reçus par ces régimes, 44 € vont donc à la maladie, 28 € à l'autonomie, 18 € à la vieillesse et 10 € à la famille.",
          refs: ["plfss-annexe3"],
        },
        {
          type: "chart",
          chart: {
            kind: "bars",
            id: "csg-branches",
            title: "La CSG des régimes de base, par branche",
            subtitle: "Milliards d'euros, prévision 2026",
            description:
              "Produit de la CSG affecté aux régimes obligatoires de base de la Sécurité sociale, par branche, tel que prévu par le projet de loi de financement pour 2026 (annexe 3, tableau 5). Hors CSG versée à l'Unédic et à la Cades. La branche accidents du travail ne reçoit pas de CSG. Le total des branches (130,4 Md€) diffère du total publié (130,1 Md€) en raison des arrondis.",
            valueName: "CSG",
            columns: ["Branche", "Montant"],
            rows: [
              { label: "Maladie", value: 57.4, display: "57,4 Md€", tone: "cyan", highlight: true },
              { label: "Autonomie", value: 37.1, display: "37,1 Md€", tone: "violet" },
              { label: "Vieillesse (retraites)", value: 22.8, display: "22,8 Md€", tone: "blue" },
              { label: "Famille", value: 13.1, display: "13,1 Md€", tone: "emerald" },
            ],
            source: "plfss-annexe3",
            period: "2026 (prévision, octobre 2025)",
          },
        },
        {
          type: "p",
          text: "Ces clés de répartition bougent presque chaque année, au gré des lois de financement. Le projet de loi pour 2026 prévoyait par exemple de transférer 0,69 point de CSG sur les revenus de remplacement de la branche famille vers l'assurance maladie, soit 1,4 Md€.",
          refs: ["plfss-annexe3"],
        },
      ],
    },
    {
      id: "debat",
      title: "Un prélèvement qui évolue",
      blocks: [
        {
          type: "p",
          text: "Sur les salaires, la CSG est proportionnelle : chacun paie le même pourcentage, quel que soit son niveau de revenu. C'est ce qui la distingue de l'impôt sur le revenu, dont le taux augmente par tranches. Ce choix nourrit un débat récurrent sur sa progressivité, voire sur un rapprochement des deux prélèvements.",
        },
        {
          type: "p",
          text: "Le Parlement en ajuste régulièrement les taux. La loi de financement de la Sécurité sociale pour 2026 relève de 9,2 % à 10,6 % la CSG sur une partie des produits d'épargne financière, pour un rendement estimé à 1,2 Md€. Les recettes de CSG reculeraient pourtant légèrement en 2026 (- 0,3 %, après + 2,2 %), sous l'effet de la réforme de l'assiette des travailleurs indépendants.",
          refs: ["senat-acss-2025"],
        },
        {
          type: "p",
          text: "Enfin, la CSG ne doit pas être confondue avec la CRDS, une autre contribution de 0,5 % prélevée sur les mêmes revenus. Elle est versée à la Cades, comme une partie de la CSG, pour rembourser la dette sociale.",
          refs: ["dss-2026", "plfss-annexe3"],
        },
      ],
    },
  ],
  sources: [
    {
      id: "l131-8",
      label: "Légifrance — Code de la sécurité sociale, article L131-8 (version en vigueur au 1er février 2026)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053538201",
      date: "2026-02",
    },
    {
      id: "dss-2026",
      label:
        "Direction de la sécurité sociale — Instruction du 11 décembre 2025 sur les prélèvements sociaux applicables aux revenus de remplacement au 1er janvier 2026",
      url: "https://legislation.lassuranceretraite.fr/Pdf/instruction_ministerielle_11122025.pdf",
      date: "2025-12-11",
    },
    {
      id: "plfss-annexe3",
      label:
        "Assemblée nationale — PLFSS 2026, annexe 3 : équilibre des finances sociales (recettes, dépenses et soldes des régimes de base)",
      url: "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1089896/file/PLFSS2026-Annexe3-20251015-103900-55-4.pdf",
      date: "2025-10",
    },
    {
      id: "senat-acss-2025",
      label:
        "Sénat — Avis n° 747 (2025-2026) sur le projet de loi d'approbation des comptes de la sécurité sociale de 2025, recettes 2026",
      url: "https://www.senat.fr/rap/a25-747/a25-7474.html",
      date: "2026-06",
    },
  ],
};
