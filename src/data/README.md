# Données du jeu

- `decks-meta.json` : les 19 decks (16 catégories + 3 thématiques).
- `cards/<deckId>.json` : les cartes d'un deck. Le nom du fichier est l'`id` du deck.
- `data-check-exceptions.json` : cartes dont le coût par habitant n'est pas dérivé du montant, avec la raison.
- Schéma : `src/lib/cardSchema.ts` (Zod). Contrôle : `src/lib/dataCheck.ts`, lancé par `npm run data:check` (CI, après le lint).

## Champs d'une carte

| Champ            | Obligatoire | Règle                                                                                                   |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `id`             | oui         | `xxx-00`, unique                                                                                        |
| `title`          | oui         | unique (comparaison sans casse, accents ni ponctuation)                                                 |
| `amountBillions` | oui         | milliards d'euros, ≥ 0                                                                                  |
| `costPerCitizen` | oui         | euros par habitant ≈ `amountBillions × 1e9 / 69,1e6` (tolérance 1 € ou 5 %), sinon exception documentée |
| `source`         | oui         | institutions citées, dont celle de `sourceUrl`                                                          |
| `sourceUrl`      | non         | `https://`, domaine ASCII (pas de `défense.gouv.fr`), document ou page précise                          |
| `year`           | non         | année budgétaire du montant (ex. `2026` pour la LFI 2026)                                               |
| `sourceDate`     | non         | date de publication de la source : `AAAA`, `AAAA-MM` ou `AAAA-MM-JJ`                                    |
| `level`          | oui         | 1, 2 ou 3 (voir ci-dessous)                                                                             |
| `kind`           | oui         | `depense`, `recette` ou `agregat` (voir « Nature » ci-dessous)                                          |

Les champs optionnels sont absents plutôt que `null`. Toute clé non prévue par le schéma est une erreur.

L'ancien champ `trend` (« évolution sur 5 ans », 62 cartes) a été retiré en octobre 2026 : aucune carte n'en citait la
source. Une évolution ne revient sur une carte que si une source officielle précise la chiffre, et elle est alors écrite
dans la description, avec sa période et sa source.

## Nature (`kind`)

Le champ dit ce que représente le montant de la carte. Seules les dépenses alimentent le deck du jour, le défi
« Trouve 50 Md€ », l'archétype de fin de partie et le cumul « tronçonné » : couper une recette ou une fraude estimée
n'est pas une économie. En jeu normal, les autres cartes restent jouables et portent un petit libellé « Recette » ou
« Indicateur » ; leur montant s'intitule « Montant annuel » ou « Montant », jamais « Coût annuel ».

| Valeur    | Critère                                                                                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `depense` | Dépense publique que l'on peut décider : crédits de l'État, Sécurité sociale, collectivités, opérateurs, part française du budget européen. Les dépenses fiscales (niches, crédits d'impôt) et les allègements de cotisations comptent comme des dépenses, comme dans les documents budgétaires. |
| `recette` | Ressource publique : impôt, taxe, cotisation, prélèvement, dividendes, amendes, subventions reçues de l'UE.                                                                                                                                                                                      |
| `agregat` | Indicateur qui n'est ni une dépense ni une recette décidable : fraude estimée, dette, déficit, coût social ou sanitaire, facture énergétique, flux privés, investissements d'entreprises (EDF, RTE, Enedis), économies attendues d'une réforme, objectif ou bilan chiffré.                       |

Règle de tri : on regarde le montant affiché, pas le sujet. « Fraude aux prestations sociales » parle de dépenses, mais
son montant est une estimation de fraude : `agregat`. Le deck `recettes` ne contient que des recettes (`data:check` le
vérifie).

Deux règles complètent ce critère :

- Un montant cumulé sur plusieurs années (bilan d'une crise, total d'une aide depuis 2022) ou une opération ponctuelle
  (rachat d'EDF) n'est pas un coût annuel : `agregat`. Sinon la carte s'afficherait « Coût annuel » et pourrait être
  « coupée » dans le défi comme une économie récurrente.
- Le rendement attendu d'une mesure seulement proposée (non votée, ou abandonnée) est un `agregat`, comme les économies
  attendues d'une réforme. Une recette est une ressource réellement perçue ou votée.

Une même somme ne doit être jouable qu'une fois : `data:check` signale en avertissement deux cartes jouables de même
montant et de même source (« doublon probable »). On garde la carte la plus précise et on passe l'autre hors jeu
(`playable: false`, montant à 0), comme `fre-04` (doublon de `ukr-02`, contribution à la Facilité européenne pour la
paix).

Répartition (octobre 2026) : 274 dépenses, 31 recettes et 60 agrégats parmi les 365 cartes jouables ; hors jeu,
6 dépenses et 6 agrégats.

Cas limites, tranchés ainsi :

- Restent des dépenses : `eta-01` (intérêts de la dette, une ligne du budget même si elle est peu pilotable),
  `cre-04` (rachat d'EDF, opération financière de l'État), `zom-02` (pertes sur les prêts garantis, payées par l'État),
  `zom-05` (compensation de la taxe d'habitation, supportée par le budget de l'État), `fre-11` (hausse proposée de la
  contribution européenne), `ene-06`, `ene-14` et `ene-18` (aides décidées par l'État mais financées par les
  certificats d'économies d'énergie), `emp-01` (formation professionnelle, financement mêlant État et entreprises),
  `soc-17`, `log-17`, `emp-18`, `san-13` (politiques publiques dont le montant agrège plusieurs dispositifs).
- Recettes : `emp-04` (CVAE, un impôt en cours de suppression), `emp-19` (prélèvement de l'État sur l'assurance
  chômage), `fre-03` (subventions européennes reçues),
  `log-15` (prélèvement SRU payé par les communes), `cre-08` (reversements des énergies renouvelables à l'État).
- Agrégats : `col-06` (Dilico, une mise en réserve de recettes locales, ni dépense ni recette définitive), `col-16`
  (surcoût estimé du mille-feuille), `col-19` (bilan de la décentralisation), `def-10` (objectif OTAN pour 2035),
  `def-21` (factures reportées, un stock d'impayés), `log-12` (baisse de loyer imposée aux bailleurs sociaux),
  `log-09` (Action Logement, contribution des employeurs hors budget), `fre-02` (dépenses de l'UE en France),
  `agr-18` (achats de la restauration collective, publique et privée), `env-07` (gestion des déchets, collectivités et
  entreprises), `ene-03`, `ene-05`, `ene-08`, `ene-17` (investissements d'EDF et des réseaux, payés par les factures),
  `san-14` (coût des addictions), `soc-02` et `ret-06` (économies attendues de la réforme des retraites), `ret-10`
  (comparaison internationale), `cre-10` (coût de la crise énergétique cumulé sur 2021-2024), `ukr-09` (soutien
  militaire à l'Ukraine cumulé sur 2022-2024), `ukr-02` (contribution à la Facilité européenne pour la paix depuis
  2022), `cre-04` (rachat d'EDF, opération ponctuelle de 2022-2023), `eta-15` (rendement attendu de la suppression de
  deux jours fériés, proposée en 2025 et abandonnée), `fre-09` (part envisagée de la taxe carbone aux frontières pour
  le budget européen).

## Sources

Une `sourceUrl` désigne le document qui traite du sujet de la carte : rapport, chapitre, délibération, texte de loi.
Une page d'accueil de site ne compte pas (`data:check` l'affiche en avertissement).

Ordre de préférence :

1. Documents budgétaires et de contrôle : rapports du Sénat sur le PLF / PLFSS (rapports spéciaux par mission et avis),
   Cour des comptes (rapports publics, RALFSS, notes d'exécution budgétaire), Assemblée nationale.
2. Organismes publics producteurs de la donnée : DREES, COR, CRE, RTE, SDES, Assurance maladie, OFGL, HCFiPS, ADEME, etc.
3. Ministères et institutions européennes pour les dispositifs qu'ils pilotent.

Chaque URL ajoutée doit avoir été ouverte et son contenu vérifié (le sujet de la carte y figure). On n'écrit jamais une URL de mémoire.
Si aucune source précise n'est trouvée, on laisse la source existante et la carte reste à traiter.

`sourceDate` vaut la date de publication du document (rapports du Sénat sur le PLF 2026 : 24 novembre 2025 ; sur le PLFSS 2026 : 15 novembre 2025).
`year` n'est renseigné que lorsque la source citée nomme explicitement une loi de finances (`PLF 2026`, `LFSS 2025`…).

## Niveaux (`level`)

Le niveau décrit la profondeur de la carte. Il est distinct du niveau de jeu de la session (`Session.level`, qui fixe les directions de swipe).
Le jeu ne filtre pas encore les cartes par niveau.

| Niveau | Nature             | Critère                                                                                                       |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1      | Grand poste        | montant ≥ 10 Md€, ou carte qui présente un budget entier (titre « Budget… », « Mission… », « budget global ») |
| 2      | Dispositif         | 1 Md€ ≤ montant < 10 Md€                                                                                      |
| 3      | Niche, micro-audit | montant < 1 Md€                                                                                               |

Budgets entiers classés en L1 malgré un montant < 10 Md€ : `agr-02`, `cul-01`, `imm-01`, `num-01`.

Équilibrage : chaque deck garde au moins 2 cartes par niveau (`data:check` le vérifie). Quand le critère de montant
ne le permet pas, on déplace la carte la plus proche du seuil. Cartes déplacées lors de la répartition initiale :
`col-20`, `fre-07`, `rec-08`, `san-13`, `soc-18` (L2 → L3) et `zom-01` (L1 → L2).

Répartition obtenue : 135 cartes L1, 132 L2, 102 L3. Après la correction des montants lors du fact-check (octobre 2026),
les niveaux ont été réalignés sur le critère de montant : 130 cartes L1, 130 L2, 109 L3.
Après la reprise des sources et l'ajout de 10 cartes (octobre 2026) : 368 cartes jouables (130 L1, 133 L2, 105 L3), num-10 et num-18 supprimées (sans source chiffrée), 9 cartes sans montant officiel conservées hors jeu (`playable: false`, filtrées dans `src/data/index.ts`). Le minimum de 2 cartes par niveau et par deck est un avertissement, pas une erreur.
Après la relecture d'octobre 2026 : 365 cartes jouables (130 L1, 130 L2, 105 L3) ; `hop-10` et `cul-14` (montants sans source officielle) et `fre-04` (doublon de `ukr-02`) passent hors jeu, soit 12 cartes hors jeu.

Des cartes peuvent afficher un montant de 0 quand aucune source officielle ne chiffre le sujet : la description le dit
explicitement (« pas de chiffrage officiel »). Le nombre total de cartes affiché dans l'interface est calculé
(`TOTAL_CARD_COUNT` dans `src/lib/deckMeta.ts`) : ne pas l'écrire en dur.

Pour un futur filtrage par niveau de jeu, tirer les cartes de niveau ≤ au niveau de la session : les petits decks
(10 cartes) n'ont pas assez de cartes d'un seul niveau pour remplir une session.

## Coût par habitant

Le coût par habitant est dérivé du montant (population de référence : 69,1 millions, Insee au 1er janvier 2026).
Les écarts sont admis seulement s'ils sont listés dans `data-check-exceptions.json` avec leur raison :

- « non budgétaire » : le montant n'est pas une dépense publique (flux privés, avoirs gelés, investissement privé…) ;
- « budget européen » : le montant est un budget de l'UE ; le coût par habitant est la part française du financement
  (clé de contribution de la France), rapportée à 69,1 millions d'habitants ;
- « à vérifier » : montant et coût par habitant ne portent pas sur la même grandeur ; à trancher lors du fact-check.

`data:check` signale aussi une exception devenue inutile.

Doublons retirés le 2026-10-06 (`playable: false`, `offPlayFrom: "2026-10-07"`) : `hop-01` (= `san-02`), `soc-16` (= `emp-17`), `cre-05` (= `zom-03`), `soc-02` (= `ret-06`), `ret-10` (comparaison internationale reportée dans `soc-01`). Les autres « doublons probables » de `data:check` sont des sujets différents au montant identique (coïncidence) : `ret-09`, `log-09`/`log-17`, `emp-08`/`san-06`, `def-03`/`ukr-11`, `col-20`/`emp-03`, `agr-06`/`agr-11`, `cul-12`/`cul-15`. Résultat : 360 cartes jouables (126 L1, 129 L2, 105 L3), 17 hors jeu.

`offPlayFrom` : une carte passée hors jeu reste dans le tirage du deck du jour jusqu'à la veille de cette date, pour qu'un deck déjà servi ne change pas. Toujours la fixer au lendemain du déploiement.
