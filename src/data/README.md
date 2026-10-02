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

Les champs optionnels sont absents plutôt que `null`. Toute clé non prévue par le schéma est une erreur.

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
Après la reprise des sources et l'ajout de 10 cartes (octobre 2026) : 379 cartes, 130 L1, 133 L2, 116 L3.

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
