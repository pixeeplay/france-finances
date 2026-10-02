/**
 * Lexique du site : complète le dictionnaire des sigles (acronyms.ts).
 *
 * - TERMS : mots du jargon budgétaire sans sigle, avec leur définition.
 * - DEFINITIONS : explication en français courant pour les sigles les plus
 *   utiles (le nom développé seul ne suffit pas toujours).
 * - ALIASES : autres façons d'écrire une entrée dans les textes (casse,
 *   pluriel, sigle écrit en minuscules), reliées à l'entrée du lexique.
 * - LEXICON_SOURCES : document officiel qui fonde une définition, quand utile.
 *
 * Les définitions restent courtes, neutres et sans chiffre.
 */

export interface LexiconSource {
  label: string;
  url: string;
}

/** Termes du jargon budgétaire (sans sigle). Clé = entrée affichée dans le lexique. */
export const TERMS: Record<string, string> = {
  "Allègements généraux":
    "Réductions de cotisations sociales payées par les employeurs sur les bas et moyens salaires. L'État compense ce manque à gagner à la Sécurité sociale.",
  "Autorisation d'engagement":
    "Montant maximal que l'État peut s'engager à payer dans l'année (contrats, subventions), même si les paiements s'étalent ensuite sur plusieurs années. Sur ce site : « engagements autorisés ».",
  "Bloc communal": "Ensemble formé par les communes et les intercommunalités.",
  "Branche de la Sécurité sociale":
    "Chacune des grandes parties de la Sécurité sociale : maladie, vieillesse (retraites), famille, accidents du travail et maladies professionnelles, autonomie.",
  "Concours financiers de l'État":
    "Ensemble des versements de l'État aux collectivités locales : dotations, compensations d'impôts supprimés, subventions.",
  "Contributeur net":
    "Pays qui verse au budget européen davantage qu'il n'en reçoit.",
  "Crédits de paiement":
    "Sommes que l'État peut effectivement payer pendant l'année. Sur ce site : « dépenses prévues pour l'année ».",
  Dégrèvement:
    "Réduction ou annulation d'un impôt déjà calculé. Pour les impôts locaux, c'est souvent l'État qui en paie le coût à la place du contribuable.",
  "Déficit public":
    "Écart, sur une année, entre les dépenses et les recettes de l'ensemble des administrations publiques (État, Sécurité sociale, collectivités locales).",
  "Dette publique":
    "Total des emprunts des administrations publiques qui ne sont pas encore remboursés, selon la définition européenne dite « de Maastricht ».",
  Dotation:
    "Somme versée chaque année par l'État à une collectivité ou à un organisme public pour financer son fonctionnement ou ses investissements.",
  "Loi de finances":
    "Loi votée chaque année par le Parlement qui autorise les recettes et les dépenses de l'État : c'est le « budget de l'État ».",
  "Loi de programmation":
    "Loi qui fixe une trajectoire de dépenses sur plusieurs années pour un domaine (armées, justice, intérieur, recherche). Chaque budget annuel doit ensuite voter les montants.",
  "Mission budgétaire":
    "Grand poste du budget de l'État qui regroupe les dépenses d'une politique publique (Défense, Enseignement scolaire, Justice…). Le Parlement vote le budget poste par poste.",
  "Niche fiscale":
    "Réduction, crédit ou exonération d'impôt accordé à certains contribuables ou à certaines activités. Les documents budgétaires parlent de « dépense fiscale », car l'État renonce à une recette.",
  "Opérateur de l'État":
    "Organisme public distinct de l'État (agence, établissement public : France Travail, universités, CNRS…) qui exerce une mission de service public et qu'il finance en grande partie.",
  Péréquation:
    "Redistribution de ressources entre collectivités locales pour réduire les écarts de richesse entre territoires.",
  "Plafond d'emplois":
    "Nombre maximal d'agents, comptés en équivalents temps plein travaillé (ETPT), qu'un ministère ou un organisme public peut rémunérer dans l'année.",
  "Point d'indice":
    "Valeur de référence qui sert à calculer le salaire de base des fonctionnaires. Quand il augmente, tous les salaires publics augmentent.",
  "Prélèvement sur recettes":
    "Somme retirée directement des recettes de l'État, avant toute dépense, pour être versée aux collectivités locales ou au budget de l'Union européenne.",
  "Prélèvements obligatoires":
    "Ensemble des impôts et cotisations sociales obligatoires versés aux administrations publiques et à l'Union européenne. Leur poids est souvent exprimé en pourcentage du PIB.",
  "Programme budgétaire":
    "Subdivision d'un grand poste du budget de l'État, désignée par un numéro (par exemple « programme 146 » pour l'équipement des armées) et confiée à un responsable dans un ministère.",
  "Régime spécial de retraite":
    "Régime de retraite propre à une entreprise ou à une profession (SNCF, RATP, industries électriques et gazières, marins…), distinct du régime général des salariés.",
  "Report de charges":
    "Dépenses dues en fin d'année mais pas encore payées, dont le paiement est repoussé à l'année suivante : factures en attente ou impayées faute de budget disponible.",
  "Sincérité budgétaire":
    "Principe selon lequel le budget doit présenter honnêtement les recettes et les dépenses prévisibles, sans les sous-estimer ni les surestimer.",
  "Taxe affectée":
    "Impôt dont le produit est réservé à un organisme précis (par exemple le CNC pour le cinéma) au lieu d'alimenter le budget général de l'État.",
};

/** Explications en français courant pour les sigles les plus utiles. */
export const DEFINITIONS: Record<string, string> = {
  // Budget et finances publiques
  PLF: "Le projet de budget de l'État présenté chaque automne par le gouvernement au Parlement, qui le modifie puis le vote.",
  PLFSS:
    "Le projet de budget de la Sécurité sociale présenté chaque automne par le gouvernement au Parlement.",
  LFSS: "Le budget de la Sécurité sociale voté par le Parlement pour l'année : il fixe notamment l'objectif de dépenses d'assurance maladie.",
  LFI: "Le budget de l'État voté par le Parlement, normalement avant le 1er janvier, pour l'année suivante (celui de 2026 a été voté en février 2026). Sur ce site : « budget voté ».",
  LFR: "Loi qui modifie en cours d'année le budget voté, par exemple pour ajouter ou annuler des dépenses.",
  PLFR: "Projet de loi qui modifie en cours d'année le budget voté.",
  LOLF: "Loi de 2001 qui fixe les règles de présentation et de vote du budget de l'État.",
  LPFP: "Loi qui fixe une trajectoire pluriannuelle pour le déficit et la dette publics.",
  HCFP: "Organisme indépendant, rattaché à la Cour des comptes, qui donne un avis sur le réalisme des prévisions du gouvernement.",
  PIB: "Valeur de toutes les richesses produites en France en un an. On l'utilise pour comparer le poids de la dette, du déficit ou des impôts.",
  RNB: "Revenus perçus par les habitants et les entreprises du pays en un an, y compris ceux venant de l'étranger.",
  APU: "Ensemble des administrations publiques : État, organismes nationaux, Sécurité sociale et collectivités locales.",
  APUC: "L'État et les organismes publics nationaux (agences, établissements publics).",
  APUL: "Les collectivités locales (communes, départements, régions) et leurs organismes.",
  ASSO: "La Sécurité sociale, l'assurance chômage, les retraites complémentaires et les hôpitaux publics.",
  ODAC: "Agences et établissements publics nationaux financés par l'État (universités, CNRS, France Travail…).",
  COFOG:
    "Classement international des dépenses publiques par grande fonction (santé, éducation, défense…), utilisé pour comparer les pays.",
  CAS: "Compte tenu à part dans le budget de l'État, dont les recettes sont réservées à une dépense précise (par exemple le compte « Pensions » pour les retraites des fonctionnaires).",
  PSR: "Somme retirée directement des recettes de l'État et reversée aux collectivités locales ou à l'Union européenne.",
  "PSR-UE":
    "La contribution de la France au budget de l'Union européenne, prise directement sur les recettes de l'État.",
  ETP: "Nombre d'emplois ramené à des postes à temps plein : deux personnes à mi-temps comptent pour un ETP.",
  ETPT: "Nombre d'emplois ramené à des temps pleins et à la durée travaillée dans l'année : un agent à temps plein présent six mois compte pour 0,5.",
  DILICO:
    "Mécanisme qui retient une partie des recettes des collectivités une année, puis la leur reverse les années suivantes (en trois fois pour le dispositif de 2025).",
  PGE: "Prêts bancaires aux entreprises garantis par l'État pendant la crise sanitaire : si l'entreprise ne peut pas payer, l'État rembourse à la banque la plus grande partie du prêt (70 à 90 %).",
  APE: "Service de l'État qui gère ses participations dans les entreprises (EDF, SNCF, Renault, Airbus…).",
  CADES:
    "Caisse publique chargée de rembourser la dette accumulée par la Sécurité sociale, financée surtout par la CRDS et une part de la CSG.",
  FRR: "Fonds public créé en 1999 pour financer les retraites futures, qui verse aujourd'hui chaque année une somme à la CADES.",
  FSV: "Fonds de la Sécurité sociale qui finance les prestations de retraite non contributives, comme le minimum vieillesse.",

  // Impôts et prélèvements
  TVA: "Impôt payé par le consommateur sur la plupart des achats, inclus dans le prix. C'est la première recette de l'État.",
  IR: "Impôt payé par les foyers sur leurs revenus, calculé selon un barème progressif.",
  IS: "Impôt payé par les entreprises sur leurs bénéfices.",
  CSG: "Prélèvement sur presque tous les revenus (salaires, retraites, revenus du patrimoine) qui finance la Sécurité sociale.",
  CRDS: "Petit prélèvement sur les revenus qui sert à rembourser la dette de la Sécurité sociale.",
  IFI: "Impôt annuel sur le patrimoine immobilier des ménages les plus aisés, qui a remplacé l'ISF en 2018.",
  ISF: "Impôt annuel sur l'ensemble du patrimoine des ménages les plus aisés, supprimé en 2018.",
  CVAE: "Impôt local payé par les entreprises sur la richesse qu'elles produisent, en cours de suppression.",
  CFE: "Impôt local payé par les entreprises sur la valeur des locaux qu'elles utilisent.",
  DMTO: "Taxes payées lors de l'achat d'un bien immobilier (l'essentiel des « frais de notaire »), qui financent surtout les départements.",
  TICPE:
    "Taxe sur les carburants et les combustibles (essence, gazole, fioul).",
  CICE: "Crédit d'impôt accordé aux entreprises de 2013 à 2018, transformé en 2019 en baisse de cotisations patronales.",
  CIR: "Crédit d'impôt pour les entreprises qui font de la recherche et développement : il diminue leur impôt, et l'excédent peut leur être remboursé.",
  CSPE: "Deux sens. D'abord une ancienne taxe sur la consommation d'électricité (contribution au service public de l'électricité), devenue l'accise sur l'électricité. Aujourd'hui, le sigle désigne aussi les charges de service public de l'énergie : le soutien de l'État aux énergies renouvelables et aux territoires non reliés au réseau.",

  // Social et santé
  ONDAM:
    "Plafond de dépenses d'assurance maladie (soins de ville, hôpitaux, établissements médico-sociaux) voté chaque année par le Parlement.",
  RSA: "Revenu minimum versé aux personnes sans ressources ou à faibles revenus, financé par les départements.",
  APL: "Aide versée aux locataires modestes pour réduire leur loyer.",
  AAH: "Revenu minimum versé aux adultes en situation de handicap qui ne peuvent pas ou peu travailler.",
  ASPA: "Le « minimum vieillesse » : complément de revenu pour les retraités aux faibles ressources.",
  AME: "Prise en charge des soins des étrangers en situation irrégulière, résidant en France depuis plus de trois mois, aux faibles ressources.",
  APA: "Aide versée par les départements aux personnes âgées en perte d'autonomie, à domicile ou en établissement.",
  PCH: "Aide versée par les départements pour financer les besoins liés au handicap (aide humaine, aménagements).",
  ASE: "Service des départements qui protège les enfants en danger ou en difficulté (placements, aides aux familles).",
  ALD: "Maladie grave ou chronique (diabète, cancer…) dont les soins sont remboursés à 100 % par l'Assurance maladie.",
  IJ: "Revenu de remplacement versé par la Sécurité sociale pendant un arrêt maladie, un congé maternité ou après un accident du travail.",
  "AT-MP":
    "La branche de la Sécurité sociale qui indemnise les accidents du travail et les maladies professionnelles, financée par les employeurs.",
  T2A: "Mode de financement des hôpitaux selon le nombre et le type de soins réalisés.",
  EHPAD: "Maison de retraite médicalisée pour les personnes âgées dépendantes.",
  CHU: "Hôpital qui associe soins, enseignement de la médecine et recherche.",
  CNAM: "La caisse nationale qui gère l'Assurance maladie.",
  CNAF: "La caisse nationale qui gère les allocations familiales et les aides au logement.",
  CAF: "Caisse locale qui verse les allocations familiales, les aides au logement et le RSA.",
  URSSAF:
    "Organismes qui collectent les cotisations sociales et la CSG pour financer la Sécurité sociale.",
  "Agirc-Arrco":
    "Régime géré par les syndicats et le patronat qui verse une retraite complémentaire aux anciens salariés du privé, en plus de la retraite de base.",
  Unédic:
    "Association gérée par les syndicats et le patronat qui pilote l'assurance chômage ; France Travail verse les allocations pour son compte.",
  PUMA: "Droit à la prise en charge des frais de santé pour toute personne qui travaille ou réside en France de façon stable et régulière.",
  CMU: "Ancienne couverture maladie des personnes sans droits, remplacée par la PUMA (2016) et la complémentaire santé solidaire (2019).",

  // Collectivités
  DGF: "Principale somme versée chaque année par l'État aux communes, intercommunalités et départements pour leur fonctionnement.",
  DETR: "Aide de l'État aux investissements des communes rurales (écoles, voirie, équipements).",
  DSIL: "Aide de l'État aux investissements des communes et intercommunalités.",
  DSU: "Part de la dotation de l'État réservée aux communes urbaines les plus défavorisées.",
  DSR: "Part de la dotation de l'État réservée aux communes rurales.",
  EPCI: "Regroupement de communes (communauté de communes, d'agglomération, métropole) qui exercent ensemble certaines compétences.",
  FPIC: "Fonds qui prélève une partie des ressources des territoires les plus riches pour la reverser aux moins riches.",

  // Défense et sécurité
  LPM: "Loi qui fixe pour plusieurs années la trajectoire du budget des armées et leurs grands équipements.",
  LOPMI:
    "Loi qui fixe pour 2023-2027 la trajectoire du budget du ministère de l'Intérieur (police, gendarmerie, sécurité civile).",
  OPEX: "Interventions de l'armée française hors du territoire national.",
  SNLE: "Sous-marin à propulsion nucléaire qui porte les missiles de la dissuasion nucléaire.",
  OQTF: "Décision administrative qui ordonne à un étranger en situation irrégulière de quitter la France.",

  // Europe et international
  UE: "Union de 27 pays européens dotée d'un budget commun financé en partie par les contributions des États.",
  PAC: "Politique européenne de soutien aux agriculteurs et au monde rural, l'un des deux premiers postes du budget européen avec la politique de cohésion.",
  FEAGA:
    "Fonds européen qui verse les aides directes de la PAC aux agriculteurs.",
  APD: "Aide financière des pays riches aux pays en développement (dons, prêts aidés).",
  OTAN: "Alliance militaire entre l'Amérique du Nord et des pays européens, dont la France.",
  OCDE: "Organisation internationale qui réunit 38 pays développés et publie des comparaisons économiques.",

  // Énergie, logement, environnement
  ARENH:
    "Dispositif qui obligeait EDF à vendre une partie de son électricité nucléaire à prix fixe à ses concurrents, jusqu'à fin 2025.",
  CEE: "Obligation faite aux fournisseurs d'énergie de financer des économies d'énergie chez leurs clients (isolation, chauffage).",
  MaPrimeRénov:
    "Aide de l'État, gérée par l'Anah, pour financer les travaux de rénovation énergétique des logements.",
  DPE: "Étiquette de A à G qui mesure la performance énergétique d'un logement.",
  RLS: "Baisse de loyer que les bailleurs sociaux doivent accorder à leurs locataires qui touchent l'APL ; l'État réduit d'autant l'APL.",
  PTZ: "Prêt sans intérêts, aidé par l'État, pour l'achat d'un premier logement.",
  ZFE: "Zone urbaine où la circulation des véhicules les plus polluants est restreinte.",
  ETS: "Marché européen où les industriels achètent des droits à émettre du CO₂.",

  // Emploi
  SMIC: "Salaire horaire minimum légal, revalorisé au moins une fois par an.",
  CPF: "Compte qui permet à chaque actif de financer des formations, crédité chaque année en euros.",
};

/**
 * Autres formes d'une entrée telles qu'elles apparaissent dans les textes.
 * Les formes en minuscules sont aussi reconnues avec une majuscule initiale.
 */
export const ALIASES: Record<string, string> = {
  // Sigles écrits en minuscules
  Ademe: "ADEME",
  Anah: "ANAH",
  Bpifrance: "BPI",
  DGFIP: "DGFiP",
  "PNACC-3": "PNACC3",
  Dilico: "DILICO",
  Ehpad: "EHPAD",
  Inria: "INRIA",
  Insee: "INSEE",
  Inserm: "INSERM",
  Lodeom: "LODEOM",
  "MaPrimeRénov'": "MaPrimeRénov",

  // Termes du jargon
  "niche fiscale": "Niche fiscale",
  "niches fiscales": "Niche fiscale",
  "dépense fiscale": "Niche fiscale",
  "dépenses fiscales": "Niche fiscale",
  "prélèvement sur recettes": "Prélèvement sur recettes",
  "prélèvements obligatoires": "Prélèvements obligatoires",
  "report de charges": "Report de charges",
  péréquation: "Péréquation",
  "point d'indice": "Point d'indice",
  "régime spécial": "Régime spécial de retraite",
  "régimes spéciaux": "Régime spécial de retraite",
  "allègements généraux": "Allègements généraux",
  "concours financiers": "Concours financiers de l'État",
  "équivalent temps plein": "ETP",
  "équivalents temps plein": "ETP",
  "dotation globale de fonctionnement": "DGF",
  "crédits de paiement": "Crédits de paiement",
  "autorisations d'engagement": "Autorisation d'engagement",
  "contributeur net": "Contributeur net",
  "taxes affectées": "Taxe affectée",
  "taxe affectée": "Taxe affectée",
};

/** Documents officiels qui fondent certaines définitions. */
export const LEXICON_SOURCES: Record<string, LexiconSource> = {
  "Niche fiscale": {
    label:
      "Cour des comptes, note d'analyse de l'exécution budgétaire 2025 : les dépenses fiscales",
    url: "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Depenses-fiscales.pdf",
  },
  "Report de charges": {
    label:
      "Sénat, rapport sur le projet de loi de finances pour 2026 (Défense)",
    url: "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
  },
  "Prélèvement sur recettes": {
    label:
      "Sénat, rapport sur le projet de loi de finances pour 2026 (participation de la France au budget de l'UE)",
    url: "https://www.senat.fr/rap/l25-139-22/l25-139-22_mono.html",
  },
  DILICO: {
    label:
      "Sénat, rapport sur le projet de loi de finances pour 2026 (Relations avec les collectivités territoriales)",
    url: "https://www.senat.fr/rap/l25-139-325/l25-139-325_mono.html",
  },
  "Concours financiers de l'État": {
    label:
      "Sénat, rapport sur le projet de loi de finances pour 2026 (Relations avec les collectivités territoriales)",
    url: "https://www.senat.fr/rap/l25-139-325/l25-139-325_mono.html",
  },
};
