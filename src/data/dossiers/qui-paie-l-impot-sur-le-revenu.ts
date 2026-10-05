import { PLF_2027_PRESS_KIT } from "@/data/plf-2027";
import { formatEuros } from "@/lib/format";
import type { DossierBody } from "./types";

/**
 * « Qui paie l'impôt sur le revenu ? »
 *
 * Données : DGFiP Statistiques n° 41 (novembre 2025), revenus 2024, données
 * provisoires (3e émission). Impôt moyen après réductions et crédits d'impôt
 * par dixième de revenu fiscal de référence par part : tableau 4.
 */
const DECILES: readonly (readonly [string, number])[] = [
  ["1er dixième", -31],
  ["2e dixième", -73],
  ["3e dixième", -112],
  ["4e dixième", -139],
  ["5e dixième", -73],
  ["6e dixième", 280],
  ["7e dixième", 843],
  ["8e dixième", 1650],
  ["9e dixième", 3320],
  ["Dernier dixième", 16395],
];

export const irDossier: DossierBody = {
  slug: "qui-paie-l-impot-sur-le-revenu",
  cardIds: ["rec-02", "eta-05", "emp-02", "rec-01"],
  sections: [
    {
      id: "foyers",
      title: "Moins d'un foyer sur deux",
      blocks: [
        {
          type: "chiffre",
          value: "47 %",
          label: "des foyers fiscaux ont payé un impôt sur leurs revenus de 2024",
          detail: "19,6 millions de foyers sur 41,5 millions.",
          tone: "blue",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "En 2025, 41,5 millions de foyers fiscaux ont déclaré leurs revenus de 2024. Parmi eux, 19,6 millions ont payé un impôt sur le revenu, soit 47,2 % des foyers. Les autres ne paient rien, ou reçoivent même de l'argent lorsque leurs crédits d'impôt dépassent l'impôt dû.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Le nombre de foyers imposés a augmenté de 5,1 % en un an, soit 900 000 de plus. La raison : les tranches du barème ont été relevées de 1,8 %, alors que les revenus déclarés ont progressé de 4,9 %. Des foyers jusque-là non imposés ont donc franchi le seuil de la première tranche.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Au total, l'impôt sur le revenu établi sur les revenus de 2024 atteint 92 Md€ (données provisoires), en hausse de 9,9 %. C'est la plus forte progression depuis dix ans. Les revenus déclarés, eux, s'élèvent à 1 541 Md€ : 60,5 % de salaires et 26 % de pensions et rentes.",
          refs: ["dgfip-41"],
        },
      ],
    },
    {
      id: "concentration",
      title: "Un impôt très concentré",
      blocks: [
        {
          type: "p",
          text: "L'impôt sur le revenu est progressif : le taux augmente par tranches de revenu. Pour les revenus de 2025, le barème compte cinq tranches, appliquées au revenu par part : 0 % jusqu'à 11 600 €, puis 11 %, 30 %, 41 % et enfin 45 % au-delà de 181 917 €.",
          refs: ["service-public-bareme"],
        },
        {
          type: "p",
          text: "La charge se concentre donc en haut de l'échelle. Les 10 % de foyers aux revenus les plus élevés paient en moyenne 16 395 € d'impôt et acquittent à eux seuls près des trois quarts de l'impôt sur le revenu, selon la Direction générale des finances publiques (DGFiP).",
          refs: ["dgfip-41"],
        },
        {
          type: "chart",
          chart: {
            kind: "bars",
            id: "impot-moyen",
            title: "Impôt moyen par foyer, du 6e au dernier dixième",
            subtitle: "Euros par an, revenus 2024, après réductions et crédits d'impôt",
            description:
              "Foyers fiscaux classés en dix groupes de même taille selon leur revenu fiscal de référence par part (dixièmes). Impôt sur le revenu net moyen, après réductions et crédits d'impôt. Les cinq premiers dixièmes reçoivent en moyenne un versement net (montants négatifs), indiqué dans le tableau. Données provisoires.",
            valueName: "Impôt moyen",
            columns: ["Dixième de revenu", "Impôt moyen"],
            rows: DECILES.filter(([, v]) => v > 0).map(([label, v]) => ({
              label,
              value: v,
              display: formatEuros(v),
              tone: label.startsWith("Dernier") ? "red" : "blue",
              highlight: label.startsWith("Dernier"),
            })),
            tableRows: DECILES.map(([label, v]) => [label, formatEuros(v)] as const),
            source: "dgfip-41",
            period: "revenus 2024",
          },
        },
        {
          type: "p",
          text: "À l'autre bout, les foyers des cinq premiers dixièmes reçoivent en moyenne un peu d'argent, entre 31 € et 139 € par an, grâce aux crédits d'impôt, remboursés même quand aucun impôt n'est dû. Pour le 6e dixième, l'impôt moyen est de 280 € par an.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Les réductions et crédits d'impôt jouent un grand rôle. En 2024, 12,8 millions de foyers, soit près d'un sur trois, en ont bénéficié, pour 1 500 € en moyenne et 20 Md€ au total. Le crédit d'impôt pour l'emploi d'un salarié à domicile est l'un des deux dispositifs qui ont le plus progressé. Les foyers non imposés reçoivent 45 % des crédits d'impôt.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Le taux moyen d'imposition, après réductions et crédits d'impôt, reste modeste pour la plupart des foyers : 2,6 % du revenu pour le 7e dixième, 4,3 % pour le 8e, 6,9 % pour le 9e et 15,6 % pour le dernier. Il atteint 19,7 % pour le centième le plus aisé, mais redescend à 18,7 % pour le dernier millième, en raison notamment des réductions et crédits d'impôt.",
          refs: ["dgfip-41"],
        },
      ],
    },
    {
      id: "limites",
      title: "Ce que ces chiffres ne disent pas",
      blocks: [
        {
          type: "p",
          text: "L'impôt sur le revenu n'est qu'un prélèvement parmi d'autres. Tout le monde paie la TVA sur ses achats, et la CSG est prélevée dès le premier euro de salaire (voir notre dossier « Où va 1 euro de CSG ? »). Dans la loi de finances pour 2026, l'impôt sur le revenu net rapporte 99,8 Md€ à l'État, autant que sa part de la TVA. En cours d'année, le Gouvernement a revu ces montants à 96,8 Md€ pour l'impôt sur le revenu et 99,7 Md€ pour la TVA. Le projet de budget pour 2027, pas encore voté, prévoit 102,5 Md€ et 107,0 Md€.",
          refs: ["dp-budget-2027"],
        },
        {
          type: "p",
          text: "Les deux montants, 92 Md€ et 99,8 Md€, ne mesurent pas la même chose : le premier additionne les avis d'imposition sur les revenus de 2024, le second correspond aux recettes votées dans le budget de l'année 2026.",
          refs: ["dgfip-41", "dp-budget-2027"],
        },
        {
          type: "p",
          text: "Le revenu retenu pour classer les foyers n'est pas non plus le revenu complet : le revenu fiscal de référence n'inclut pas les prestations sociales non imposables, qui comptent beaucoup pour les ménages modestes.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Les revenus de l'épargne sont pour l'essentiel imposés à part, au prélèvement forfaitaire unique : en 2024, 30 % au total, dont 12,8 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux. Cet impôt « hors barème » a atteint 10 Md€, dont 92 % payés par le dernier dixième.",
          refs: ["dgfip-41"],
        },
        {
          type: "p",
          text: "Enfin, depuis les revenus de 2025, une contribution différentielle impose un taux minimum de 20 % aux plus hauts revenus : au-delà de 250 000 € pour une personne seule et de 500 000 € pour un couple.",
          refs: ["dgfip-41"],
        },
      ],
    },
  ],
  sources: [
    {
      id: "dgfip-41",
      label: "DGFiP Statistiques n° 41 — L'impôt sur le revenu 2024 a été plus dynamique que les revenus",
      url: "https://www.impots.gouv.fr/sites/default/files/media/9_statistiques/0_etudes_et_stats/0_publications/dgfip_statistiques/2025/num41_11/dgfip_stat_41.pdf",
      date: "2025-11",
    },
    {
      id: "service-public-bareme",
      label: "Service-public.fr — Barème de l'impôt sur le revenu (revenus 2025)",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419",
      date: "2026-04-15",
    },
    {
      id: "dp-budget-2027",
      label: `${PLF_2027_PRESS_KIT.label}, solde général du budget de l'État (loi de finances 2026, 2026 révisé, projet 2027)`,
      url: PLF_2027_PRESS_KIT.url,
      date: PLF_2027_PRESS_KIT.date,
    },
  ],
};
