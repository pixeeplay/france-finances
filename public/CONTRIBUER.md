# 🪚 Guide du contributeur — Budget Swipe

> **Comment proposer un deck de cartes pour Budget Swipe**
> Site : france-finances.com
> Contact : https://pixeeplay.com/play/?intent=contribuer

---

## Le projet en bref

Budget Swipe est un jeu citoyen mobile-first où les joueurs swipent des cartes de dépenses publiques pour les garder (🛡️) ou les remettre en question (🪚). Chaque carte est une dépense ou recette réelle, sourcée, neutre et factuelle.

**Tout le monde peut proposer des cartes ou des decks complets.**

---

## Périmètres du jeu

Le jeu couvre **4 échelles** de finances publiques :

| Échelle        | URL                                          | Exemple                                 |
| -------------- | -------------------------------------------- | --------------------------------------- |
| **National**   | france-finances.com/jeu                      | Budget de l'État, Sécu, dette           |
| **Ville**      | france-finances.com/paris/jeu                | Budget de Paris (commune + département) |
| **Région**     | france-finances.com/region/ile-de-france/jeu | Budget Île-de-France                    |
| **Thématique** | france-finances.com/jeu/[deckId]             | Deck "Crise énergétique", "Retraites"…  |

Chaque échelle a ses propres decks, catégories, cartes et archétypes.

---

## Ce qu'on cherche

- Des **cartes factuelles et sourcées** sur les finances publiques françaises (État, collectivités, Sécu)
- Des **decks régionaux** (chaque région de France mérite son deck de 20 cartes)
- Des **decks villes** (Paris existe, Lyon, Marseille, Toulouse, Bordeaux à créer)
- Des **decks thématiques** sur un sujet précis (ex : "Coût du nucléaire", "JOP héritage")
- Des **mises à jour** de cartes existantes quand les chiffres changent (chaque PLF/PLFSS)
- Des **corrections** si une donnée est erronée ou périmée

---

## Format JSON d'une carte

Chaque carte est un objet JSON avec les champs suivants :

```json
{
  "id": "san-11",
  "category": "Santé & Hôpital",
  "categoryEmoji": "🏥",
  "categoryId": "sante",
  "title": "Télémédecine et numérique en santé",
  "subtitle": "Ségur numérique · Mon espace santé · Téléconsultations",
  "amountLabel": "~2 Md€ / an",
  "amountValue": 2000000000,
  "perCitizenLabel": "~29€ / Français / an",
  "perCitizenValue": 29,
  "context": "Le Ségur du numérique en santé investit 2 Md€ pour moderniser les systèmes d'information hospitaliers et déployer Mon espace santé (75 millions de comptes créés mais usage faible). Les téléconsultations représentent 5% des consultations. La France a 10 ans de retard sur l'Estonie en e-santé.",
  "equivalence": "2 Md€ investis mais 60% des hôpitaux utilisent encore des systèmes informatiques des années 2000",
  "sources": [
    {
      "label": "ANS (Agence du numérique en santé)",
      "url": "https://esante.gouv.fr"
    },
    {
      "label": "Ministère de la Santé",
      "url": "https://sante.gouv.fr"
    }
  ],
  "locale": "national",
  "year": 2026,
  "tags": ["numérique", "hôpital", "modernisation"],
  "difficulty": 1,
  "polarity": "neutral"
}
```

### Champs obligatoires

| Champ             | Type   | Description                                                                 |
| ----------------- | ------ | --------------------------------------------------------------------------- |
| `id`              | string | Identifiant unique (voir convention de nommage ci-dessous)                  |
| `category`        | string | Nom complet de la catégorie                                                 |
| `categoryEmoji`   | string | Un seul emoji                                                               |
| `categoryId`      | string | Slug de la catégorie (minuscules, sans accent)                              |
| `title`           | string | Titre court de la dépense/recette (3-6 mots)                                |
| `amountLabel`     | string | Montant lisible humain : `"~7 Md€ / an"` ou `"~500 M€ / an"`                |
| `amountValue`     | number | Montant en euros (pas en milliards) : `7000000000`                          |
| `perCitizenLabel` | string | Coût par habitant : `"~103€ / Français / an"` ou `"~67€ / Francilien / an"` |
| `perCitizenValue` | number | Coût par habitant en euros : `103`                                          |
| `context`         | string | 2-4 phrases factuelles. Pas d'opinion. Max 500 caractères.                  |
| `equivalence`     | string | Comparaison concrète et parlante. Max 200 caractères.                       |
| `sources`         | array  | Au moins 1 source, idéalement 2-3.                                          |
| `locale`          | string | Voir table des locales ci-dessous                                           |
| `year`            | number | Année de référence des données (2025 ou 2026)                               |

### Champs optionnels

| Champ        | Type   | Description                                         |
| ------------ | ------ | --------------------------------------------------- |
| `subtitle`   | string | Sous-titre explicatif                               |
| `tags`       | array  | Mots-clés pour le filtrage                          |
| `difficulty` | number | 1 = grand public, 2 = intermédiaire, 3 = expert     |
| `polarity`   | string | `"expense"`, `"revenue"`, `"neutral"`, `"positive"` |

---

## Format JSON d'une source

```json
{
  "label": "Cour des comptes, rapport annuel 2025",
  "url": "https://www.ccomptes.fr/fr/publications/rapport-public-annuel-2025"
}
```

### Sources acceptées (par ordre de préférence)

1. **Sources officielles** : vie-publique.fr, PLF/PLFSS (budget.gouv.fr), Sénat, Assemblée nationale, Cour des comptes, INSEE, DREES, DARES
2. **Sites des collectivités** : maregionsud.fr, iledefrance.fr, paris.fr, etc. (budgets primitifs, ROB)
3. **Opérateurs publics** : ADEME, OFB, CNAF, CNAM, CNAV, France Travail, Banque de France
4. **Rapports parlementaires** : rapports de commission, avis budgétaires
5. **Presse de référence** : Le Monde, Les Échos, Public Sénat, La Gazette des Communes

### Sources refusées

- Blogs personnels, forums, réseaux sociaux
- Sites militants sans données sourcées
- Partis politiques (sauf pour citer une proposition chiffrée officielle)
- Contenus derrière un paywall inaccessible sans source libre alternative

---

## Table des locales et populations

### National et villes

| Locale      | Code ID     | Population | Diviseur   | Format citoyen           |
| ----------- | ----------- | ---------- | ---------- | ------------------------ |
| `national`  | `[cat]-XX`  | 68 M       | 68 000 000 | "~X€ / Français / an"    |
| `paris`     | `par-pX-XX` | 2,1 M      | 2 100 000  | "~X€ / Parisien / an"    |
| `lyon`      | `lyon-XX`   | 520 000    | 520 000    | "~X€ / Lyonnais / an"    |
| `marseille` | `mrs-XX`    | 870 000    | 870 000    | "~X€ / Marseillais / an" |
| `toulouse`  | `tls-XX`    | 500 000    | 500 000    | "~X€ / Toulousain / an"  |
| `bordeaux`  | `bdx-XX`    | 260 000    | 260 000    | "~X€ / Bordelais / an"   |

### Régions

| Région                     | Locale        | Code ID       | Population | Diviseur   | Format citoyen                   |
| -------------------------- | ------------- | ------------- | ---------- | ---------- | -------------------------------- |
| Île-de-France              | `region-idf`  | `reg-idf-XX`  | 12,3 M     | 12 300 000 | "~X€ / Francilien / an"          |
| Provence-Alpes-Côte d'Azur | `region-paca` | `reg-paca-XX` | 5,1 M      | 5 100 000  | "~X€ / habitant PACA / an"       |
| Auvergne-Rhône-Alpes       | `region-ara`  | `reg-ara-XX`  | 8,1 M      | 8 100 000  | "~X€ / habitant ARA / an"        |
| Occitanie                  | `region-occ`  | `reg-occ-XX`  | 6,0 M      | 6 000 000  | "~X€ / Occitan / an"             |
| Nouvelle-Aquitaine         | `region-naq`  | `reg-naq-XX`  | 6,0 M      | 6 000 000  | "~X€ / Néo-Aquitain / an"        |
| Hauts-de-France            | `region-hdf`  | `reg-hdf-XX`  | 6,0 M      | 6 000 000  | "~X€ / habitant HdF / an"        |
| Grand Est                  | `region-ges`  | `reg-ges-XX`  | 5,6 M      | 5 600 000  | "~X€ / habitant Grand Est / an"  |
| Bretagne                   | `region-bzh`  | `reg-bzh-XX`  | 3,4 M      | 3 400 000  | "~X€ / Breton / an"              |
| Pays de la Loire           | `region-pdl`  | `reg-pdl-XX`  | 3,8 M      | 3 800 000  | "~X€ / Ligérien / an"            |
| Normandie                  | `region-nor`  | `reg-nor-XX`  | 3,3 M      | 3 300 000  | "~X€ / Normand / an"             |
| Bourgogne-Franche-Comté    | `region-bfc`  | `reg-bfc-XX`  | 2,8 M      | 2 800 000  | "~X€ / Bourguignon-Comtois / an" |
| Centre-Val de Loire        | `region-cvl`  | `reg-cvl-XX`  | 2,6 M      | 2 600 000  | "~X€ / habitant CVL / an"        |
| Corse                      | `region-cor`  | `reg-cor-XX`  | 350 000    | 350 000    | "~X€ / Corse / an"               |

---

## Convention de nommage des IDs

```
Format général : [scope]-[numéro à 2 chiffres]

NATIONAL (16 catégories) :
def-XX  = Défense                san-XX  = Santé
ene-XX  = Énergie                soc-XX  = Social/Retraites
edu-XX  = Éducation              sec-XX  = Sécurité/Justice
eta-XX  = État/Fonctionnement    cul-XX  = Culture/Transport
agr-XX  = Agriculture            log-XX  = Logement
imm-XX  = Immigration            num-XX  = Numérique
rec-XX  = Recettes               emp-XX  = Emploi
env-XX  = Environnement          col-XX  = Collectivités

PARIS (8 catégories) :
par-p1-XX = Social               par-p5-XX = Propreté/Environnement
par-p2-XX = Logement             par-p6-XX = Culture/Sport
par-p3-XX = Transport            par-p7-XX = Sécurité
par-p4-XX = Éducation            par-p8-XX = Fonctionnement/Dette

RÉGIONS :
reg-idf-XX  = Île-de-France
reg-paca-XX = Provence-Alpes-Côte d'Azur
reg-ara-XX  = Auvergne-Rhône-Alpes
(etc.)

Exemples :
def-01      = 1re carte Défense nationale
par-p3-05   = 5e carte Transport Paris
reg-idf-12  = 12e carte Île-de-France
reg-paca-07 = 7e carte PACA
```

---

## Format JSON d'un deck complet

```json
{
  "id": "region-idf",
  "name": "Budget Île-de-France",
  "emoji": "🏙️",
  "description": "5,8 Md€ pour 12 millions de Franciliens. Transports, lycées, sécurité, climat.",
  "locale": "region-idf",
  "author": "pixeeplay",
  "version": "1.0.0",
  "lastUpdated": "2026-03-07",
  "population": 12300000,
  "citizenLabel": "Francilien",
  "totalBudget": 5800000000,
  "cardIds": ["reg-idf-01", "reg-idf-02", "..."],
  "cards": [ ... ]
}
```

| Champ          | Type   | Description                             |
| -------------- | ------ | --------------------------------------- |
| `id`           | string | Slug unique du deck                     |
| `name`         | string | Nom affiché                             |
| `emoji`        | string | Un seul emoji                           |
| `description`  | string | 1-2 phrases. Max 200 caractères.        |
| `locale`       | string | Voir table des locales                  |
| `author`       | string | Pseudo GitHub du contributeur           |
| `version`      | string | Semver (1.0.0 pour première soumission) |
| `lastUpdated`  | string | Date ISO (YYYY-MM-DD)                   |
| `population`   | number | Population du territoire                |
| `citizenLabel` | string | Gentilé ("Francilien", "Parisien"…)     |
| `totalBudget`  | number | Budget total en euros                   |
| `cardIds`      | array  | Liste ordonnée des IDs                  |
| `cards`        | array  | Les objets carte complets               |

---

## Structure des fichiers

```
src/data/
├── decks.json                    ← decks nationaux
├── decks-paris.json              ← deck Paris
├── archetypes.json               ← archétypes nationaux
├── archetypes-paris.json         ← archétypes Paris
├── regions/
│   ├── idf.json                  ← deck Île-de-France
│   ├── paca.json                 ← deck PACA
│   ├── ara.json                  ← deck ARA (futur)
│   └── ...
├── archetypes-regions/
│   ├── idf.json
│   ├── paca.json
│   └── ...
└── community/                    ← contributions externes
    ├── deck-lyon.json
    └── cartes-complement-defense.json
```

### Structure URL

```
france-finances.com/                               ← landing nationale
france-finances.com/jeu                            ← jeu national
france-finances.com/paris                          ← landing Paris
france-finances.com/paris/jeu                      ← jeu Paris
france-finances.com/region/ile-de-france           ← landing IDF
france-finances.com/region/ile-de-france/jeu       ← jeu IDF
france-finances.com/region/paca                    ← landing PACA
france-finances.com/region/paca/jeu               ← jeu PACA
```

---

## Spécificités des decks régionaux

Les régions ont des **compétences spécifiques** qui structurent les catégories de cartes :

| Compétence                                        | Obligatoire               | Exemples                                   |
| ------------------------------------------------- | ------------------------- | ------------------------------------------ |
| Lycées (construction, rénovation, fonctionnement) | ✅                        | Bâti, cantine, numérique, agents TOS       |
| Transports (TER, cars, ports, aéroports)          | ✅                        | TER, cars Macron, matériel roulant         |
| Formation professionnelle et apprentissage        | ✅                        | CFA, missions locales, NEET                |
| Développement économique et innovation            | ✅                        | Aides entreprises, pôles compétitivité     |
| Aménagement du territoire et environnement        | ✅                        | SRADDET, biodiversité, climat              |
| Budget, recettes et relations avec l'État         | ✅                        | Péréquation, DILICO, autonomie fiscale     |
| Culture et patrimoine                             | ❌ co-compétence          | Festivals, patrimoine, spectacle vivant    |
| Santé et déserts médicaux                         | ❌ co-compétence          | Maisons de santé, formations infirmiers    |
| Tourisme                                          | ❌ selon la région        | Plans tourisme, promotion, surtourisme     |
| Agriculture                                       | ❌ co-compétence          | FEADER, filières, installation             |
| Sécurité                                          | ❌ spécifique à certaines | Brigades régionales (IDF), vidéoprotection |

Chaque deck régional doit contenir **20 cartes minimum** pour offrir 2 sessions complètes sans répétition.

---

## Règles éditoriales

### Le ton

- **Factuel, pas militant.** La carte présente les faits et les deux côtés du débat quand il y en a un.
- **Concret, pas abstrait.** Toujours ramener au coût par habitant et à une équivalence parlante.
- **Compréhensible en 5 secondes.** Le titre et le montant doivent suffire à comprendre.
- **Sourcé, toujours.** Pas de "on estime que" sans dire qui estime.

### Ce qui fait une bonne carte

✅ Un sujet que 80% des citoyens ne connaissent pas (ou dont ils ne connaissent pas le montant)
✅ Un montant significatif (>100 M€ national, >10 M€ ville/région)
✅ Un potentiel de débat (les gens ne seront pas d'accord entre eux)
✅ Des sources officielles et vérifiables
✅ Une équivalence concrète et mémorable

### Ce qui fait une mauvaise carte

❌ Un sujet trop technique (personne ne comprend en 5 secondes)
❌ Un montant invérifiable ou contesté sans le dire
❌ Un ton sarcastique, méprisant ou partisan
❌ Pas de source ou source douteuse
❌ Un doublon d'une carte existante

### L'équivalence : l'art de rendre concret

**Bonnes équivalences :**

- "= le budget de X ministères"
- "= Y€ par habitant et par jour"
- "= le prix de Z piscines olympiques"
- "X fois plus/moins que [autre dépense connue]"

**Mauvaises équivalences :**

- "= beaucoup d'argent"
- "= le PIB du Burkina Faso" (condescendant)
- "= X fois le salaire d'un député" (partisan)

### Montants : conventions

| Format            | Quand                             | Exemple            |
| ----------------- | --------------------------------- | ------------------ |
| `~X Md€ / an`     | Montants > 1 milliard, récurrents | `~7 Md€ / an`      |
| `~X M€ / an`      | Montants < 1 milliard, récurrents | `~500 M€ / an`     |
| `~X Md€ au total` | Investissements ponctuels         | `~44 Md€ au total` |

Toujours utiliser `~` (tilde) car les montants budgétaires sont des estimations.

---

## Comment soumettre

### Option 1 : Nous contacter

Envoyez-nous vos propositions via le formulaire de contact :
https://pixeeplay.com/play/?intent=contribuer

Vous pouvez envoyer :

- Un fichier JSON formaté selon le schéma ci-dessus
- Ou simplement les informations brutes (titre, montant, contexte, sources) — nous nous chargeons de la mise en forme

### Option 2 : Proposition simplifiée

Si vous n'êtes pas à l'aise avec le JSON, envoyez-nous au minimum :

- Titre de la dépense
- Montant approximatif
- Pourquoi c'est intéressant (1-2 phrases)
- Source(s) web
- Votre nom ou pseudo (optionnel)

---

## Checklist de validation

Chaque carte proposée passe par cette checklist :

- [ ] **Format** : le JSON est valide et respecte le schéma
- [ ] **ID** : unique, respecte la convention de nommage
- [ ] **Titre** : compréhensible en 5 secondes
- [ ] **Montant** : vérifié dans au moins 1 source officielle
- [ ] **Coût par citoyen** : calcul correct (montant ÷ population)
- [ ] **Contexte** : factuel, neutre, 2-4 phrases, pas d'opinion
- [ ] **Équivalence** : concrète, mémorable, pas condescendante
- [ ] **Sources** : au moins 1 source officielle, URLs valides
- [ ] **Pas de doublon** : le sujet n'est pas déjà couvert
- [ ] **Année** : les données sont à jour (2024-2026)
- [ ] **Ton** : pas de sarcasme, pas de militantisme

---

## Schéma JSON complet (validation automatique)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "id",
    "category",
    "categoryEmoji",
    "categoryId",
    "title",
    "amountLabel",
    "amountValue",
    "perCitizenLabel",
    "perCitizenValue",
    "context",
    "equivalence",
    "sources",
    "locale",
    "year"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z]{2,4}(-[a-z0-9]{1,5})*-[0-9]{2}$"
    },
    "category": { "type": "string", "maxLength": 60 },
    "categoryEmoji": { "type": "string", "maxLength": 4 },
    "categoryId": { "type": "string", "pattern": "^[a-z-]+$" },
    "title": { "type": "string", "maxLength": 80 },
    "subtitle": { "type": "string", "maxLength": 120 },
    "amountLabel": { "type": "string", "maxLength": 40 },
    "amountValue": { "type": "number", "minimum": 0 },
    "perCitizenLabel": { "type": "string", "maxLength": 40 },
    "perCitizenValue": { "type": "number", "minimum": 0 },
    "context": { "type": "string", "minLength": 50, "maxLength": 600 },
    "equivalence": { "type": "string", "maxLength": 250 },
    "sources": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["label"],
        "properties": {
          "label": { "type": "string", "maxLength": 100 },
          "url": { "type": "string", "format": "uri" }
        }
      }
    },
    "locale": {
      "type": "string",
      "enum": [
        "national",
        "paris",
        "lyon",
        "marseille",
        "toulouse",
        "bordeaux",
        "region-idf",
        "region-paca",
        "region-ara",
        "region-occ",
        "region-naq",
        "region-hdf",
        "region-ges",
        "region-bzh",
        "region-pdl",
        "region-nor",
        "region-bfc",
        "region-cvl",
        "region-cor"
      ]
    },
    "year": { "type": "number", "minimum": 2024, "maximum": 2030 },
    "tags": { "type": "array", "items": { "type": "string", "maxLength": 30 } },
    "difficulty": { "type": "number", "enum": [1, 2, 3] },
    "polarity": {
      "type": "string",
      "enum": ["expense", "revenue", "neutral", "positive"]
    }
  }
}
```

---

## Decks à créer (appel à contributions)

### Régions (priorité haute)

| Région                  | Population | Intérêt                                     | Statut   |
| ----------------------- | ---------- | ------------------------------------------- | -------- |
| ✅ Île-de-France        | 12,3 M     | 1re région d'Europe, Grand Paris Express    | **Fait** |
| ✅ PACA                 | 5,1 M      | JOP 2030, tourisme, risques naturels        | **Fait** |
| Auvergne-Rhône-Alpes    | 8,1 M      | Co-organisateur JOP 2030, Lyon, industrie   | À créer  |
| Occitanie               | 6,0 M      | Toulouse, Airbus, croissance démographique  | À créer  |
| Hauts-de-France         | 6,0 M      | Industrie, reconversion, pauvreté           | À créer  |
| Nouvelle-Aquitaine      | 6,0 M      | Plus grande région, Bordeaux, forêt         | À créer  |
| Grand Est               | 5,6 M      | Frontalier, Strasbourg, reconversion        | À créer  |
| Bretagne                | 3,4 M      | Identité forte, agriculture, mer            | À créer  |
| Pays de la Loire        | 3,8 M      | Nantes, dynamisme, naval                    | À créer  |
| Normandie               | 3,3 M      | Ports, nucléaire, tourisme mémoire          | À créer  |
| Bourgogne-Franche-Comté | 2,8 M      | Industrie auto, TGV, vin                    | À créer  |
| Centre-Val de Loire     | 2,6 M      | Châteaux, nucléaire, ruralité               | À créer  |
| Corse                   | 350 000    | Autonomie, insularité, spéculation foncière | À créer  |

### Villes

| Ville     | Budget    | Statut   |
| --------- | --------- | -------- |
| ✅ Paris  | ~11,5 Md€ | **Fait** |
| Lyon      | ~2,5 Md€  | À créer  |
| Marseille | ~2 Md€    | À créer  |
| Toulouse  | ~1,5 Md€  | À créer  |
| Bordeaux  | ~900 M€   | À créer  |

### Thématiques

| Deck                                  | Description                           | Statut  |
| ------------------------------------- | ------------------------------------- | ------- |
| 🇪🇺 Budget UE                          | 10 catégories, 80 cartes              | À créer |
| 📱 Coût du numérique pour les ménages | Abonnements, données, équipements     | À créer |
| 🗳️ Programmes électoraux chiffrés     | Coût des promesses (municipales 2026) | À créer |

---

## Licence

Les cartes contribuées sont publiées sous **licence Creative Commons BY-SA 4.0**.
En soumettant une carte, vous acceptez cette licence.

---

## Questions fréquentes

**Q : Ma carte a été refusée, pourquoi ?**
Raisons fréquentes : source insuffisante, doublon, ton partisan, montant non vérifiable. Le reviewer expliquera dans la PR ou l'Issue.

**Q : Je ne suis pas d'accord avec une carte existante.**
Ouvrez une Issue "Contestation" avec vos sources alternatives.

**Q : Puis-je proposer une carte polémique ?**
Oui, si factuelle et sourcée. Les sujets clivants sont les meilleurs pour le jeu. Le contexte doit présenter les deux points de vue.

**Q : Je veux proposer un deck pour ma région mais je ne connais pas le budget.**
Commencez par le site de votre conseil régional (budget primitif, rapport d'orientation budgétaire). La DGCL publie les comptes de toutes les collectivités sur collectivites-locales.gouv.fr.

**Q : Combien de cartes minimum pour un deck régional ?**
20 cartes minimum (= 2 sessions complètes). Idéalement 20-30 pour permettre de la variété.

---

_Merci de contribuer à rendre les finances publiques accessibles à tous._
_Chaque carte est un petit pas vers une démocratie mieux informée._

_— L'équipe france-finances.com_
