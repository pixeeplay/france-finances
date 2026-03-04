# 🪚 Budget Swipe — La Tronçonneuse de Poche

> **Proposition de feature gaming pour [nicoquipaie.co](https://nicoquipaie.co)**
> Auteur : Seb · Date : Mars 2026 · Statut : RFC / Discussion communautaire

---

## Le concept en une phrase

Un mini-jeu mobile-first inspiré du swipe Tinder, où chaque citoyen passe les dépenses publiques à la tronçonneuse — ou les protège — en swipant des cartes, puis découvre comment ses choix se comparent à ceux de la communauté.

---

## Pourquoi c'est pertinent pour NicoQuiPaie

Aujourd'hui, la plateforme propose trois piliers complémentaires :

- **Le Feed** → s'informer et débattre (mode communautaire, contribution longue)
- **Les Chiffres** → comprendre le paysage global (mode consultation, passif)
- **Le Simulateur** → visualiser *sa* contribution personnelle : selon son foyer fiscal et son niveau de revenu, il estime le montant total de sa participation (charges sociales, TVA…) et sa ventilation concrète (X€ pour l'éducation, Y€ pour la défense, Z€ pour les retraites…), avec des équivalences parlantes (ma contribution = N étudiants financés, M retraités…)

Ce qui manque, c'est une **porte d'entrée rapide et engageante** — un format qui capte l'attention en 30 secondes et qui donne envie de creuser. Le Feed demande du temps de lecture, les Chiffres sont denses, le Simulateur suppose qu'on connaît déjà son foyer fiscal et qu'on veut un résultat chiffré.

**Budget Swipe comble ce vide** : c'est un 4ème pilier orienté *découverte* et *engagement rapide*. On swipe, on découvre des dépenses qu'on ne connaissait pas, on prend position instinctivement, et on se retrouve happé dans l'écosystème.

### La boucle vertueuse

```
Budget Swipe (découverte rapide, engagement)
    ↓ "Ah, je savais pas que ça existait..."
Feed (approfondissement, débat)
    ↓ "Combien ça me coûte à MOI ?"
Simulateur (ma contribution personnelle ventilée)
    ↓ "Et les autres, ils en pensent quoi ?"
Budget Swipe (comparaison communautaire)
```

---

## Gameplay détaillé

### Le problème du binaire "couper / garder"

On ne peut pas tout couper, et on ne veut pas tout garder à l'identique. Un swipe purement binaire produit des résultats absurdes ("j'ai supprimé 100% de l'éducation nationale") et donne un sentiment de superficialité.

La solution : **une progression en niveaux qui ajoute de la nuance à chaque palier**, tout en gardant le premier niveau ultra-accessible pour capter le joueur.

> 💡 Inspiration Tinder : au-delà de gauche/droite, Tinder a ajouté le "Super Like" (haut) et le "Nope" (bas). On reprend cette logique d'enrichissement progressif des gestes.

### Les 3 niveaux de jeu

```
NIVEAU 1 — "Première impression"        → Accessible, instinctif, 2 min
    ↓ débloqué après 1 session complète
NIVEAU 2 — "Nuances"                    → Plus de choix, plus de réflexion, 3-4 min
    ↓ débloqué après 3 sessions Niveau 2
NIVEAU 3 — "Mode Citoyen"               → Évaluation complète, mini-audit, 5-8 min
```

---

### 🟢 Niveau 1 — "Première impression"

**Objectif :** capter le joueur, zéro friction, réaction instinctive.

**Gestes disponibles :**

| Geste | Action | Icône |
|-------|--------|-------|
| **Swipe gauche** | 🛡️ "OK pour moi" — je valide cette dépense | Bouclier |
| **Swipe droite** | 🪚 "À revoir" — cette dépense me pose question | Tronçonneuse |
| **Tap sur la carte** | 📖 En savoir plus (lien Feed/Chiffres) | — |

**La carte Niveau 1 :**

```
┌─────────────────────────────────────────┐
│  🏷️  DÉFENSE                           │
│                                         │
│  Porte-avions Charles de Gaulle         │
│  Entretien annuel                       │
│                                         │
│  💰  1,2 Md€ / an                      │
│  👤  ~18€ par contribuable / an         │
│                                         │
│  💡  "Seul porte-avions français,       │
│   en service depuis 2001. Un 2ème       │
│   est prévu pour 2038."                 │
│                                         │
│       ← 🛡️ OK    À REVOIR 🪚 →        │
└─────────────────────────────────────────┘
```

**Session :** 10-12 cartes. ~2 minutes.

**Écran de fin :** résumé simple + double choix :
- "Continuer" → nouveau deck de 10-12 cartes au même Niveau 1 (autre catégorie ou aléatoire)
- "Passer au Niveau 2" → affiner ses choix avec plus de nuances

Cette transition douce laisse le joueur maître de son rythme. Certains voudront enchaîner 3-4 sessions Niveau 1 avant de monter, d'autres passeront directement.

> ⚠️ On ne dit pas "couper" au Niveau 1 mais **"à revoir"**. C'est plus honnête intellectuellement et ça prépare le terrain pour la nuance des niveaux suivants. Le joueur exprime un doute, pas un verdict.

---

### 🟡 Niveau 2 — "Nuances"

**Objectif :** introduire la granularité. Le joueur revient sur ses choix de Niveau 1 (ou joue un nouveau deck) avec plus d'options.

**Gestes disponibles :**

| Geste | Action | Icône |
|-------|--------|-------|
| **Swipe gauche** | 🛡️ "Montant OK" — proportionné, je valide | Bouclier |
| **Swipe droite** | 🪚 "À réduire" — le montant est trop élevé | Tronçonneuse |
| **Swipe haut** | 📈 "À renforcer" — il faudrait investir plus | Flèche haut |
| **Swipe bas** | ❌ "Injustifié" — cette dépense ne devrait pas exister | Croix |

**La carte Niveau 2** (enrichie) :

```
┌─────────────────────────────────────────┐
│  🏷️  DÉFENSE                           │
│                                         │
│  Porte-avions Charles de Gaulle         │
│  Entretien annuel                       │
│                                         │
│  💰  1,2 Md€ / an                      │
│  👤  ~18€ par contribuable / an         │
│                                         │
│  💡  "Seul porte-avions français,       │
│   en service depuis 2001. Un 2ème       │
│   est prévu pour 2038."                 │
│                                         │
│  📊  Équivalent : le budget annuel      │
│      de 15 000 profs des écoles         │
│                                         │
│  🗳️  Communauté Niveau 1 :             │
│      62% "à revoir" · 38% "OK"         │
│                                         │
│            📈 RENFORCER                  │
│    🛡️ OK        RÉDUIRE 🪚             │
│            ❌ INJUSTIFIÉ                 │
└─────────────────────────────────────────┘
```

**Nouveautés Niveau 2 :**

- **4 directions** au lieu de 2 (on peut maintenant nuancer entre "réduire" et "supprimer", et exprimer qu'on veut *plus* de moyens)
- **L'équivalence** apparaît (comparaison pédagogique)
- **Le résultat communautaire du Niveau 1** est affiché — ça crée de la tension : "tiens, la majorité veut revoir ça, moi je suis plutôt OK"

**Session :** 10-15 cartes. ~3-4 minutes.

**Pourquoi ça marche à ce stade :** le joueur a déjà fait un premier tour au Niveau 1. Ses gestes sont calibrés, il connaît les cartes. Les 4 directions ne sont plus confuses parce qu'il a un premier avis à raffiner, pas à former de zéro.

**Écran de fin enrichi :**

- Profil budgétaire détaillé : par catégorie, un graphe "réduire / OK / renforcer / injustifié"
- Comparaison avec la communauté Niveau 2
- Archétype mis à jour
- Double choix (même logique que Niv.1) :
  - "Continuer" → nouveau deck Niveau 2
  - "Passer au Niveau 3" → débloqué après 3 sessions Niv.2, "Prêt à jouer les auditeurs ?"

---

### 🔴 Niveau 3 — "Mode Citoyen" (le mini-audit)

**Objectif :** rapprocher le jeu du système d'évaluation existant sur le site, sans en reproduire la complexité complète. Le joueur devient un vrai "auditeur express".

**Ce niveau s'inspire directement du système actuel du Feed :**

| Système Feed actuel | Équivalent Niveau 3 Budget Swipe |
|---------------------|----------------------------------|
| Position : discutable / à améliorer / injustifié | Le swipe à 4 directions du Niv.2 |
| Montant proportionné ? (oui/non) | Question rapide post-swipe |
| Légitime ? (oui/non) | Question rapide post-swipe |
| Alternative moins coûteuse ? (oui/non) | Question rapide post-swipe |
| Solutions : diminuer, supprimer, externaliser, fusionner | Choix de solution post-swipe |

**Déroulement d'une carte Niveau 3 :**

```
ÉTAPE 1 — Le swipe (identique Niveau 2)
          Le joueur swipe : réduire / OK / renforcer / injustifié

ÉTAPE 2 — Le micro-audit (3 questions rapides, format toggle oui/non)
          ┌──────────────────────────────────────────────┐
          │  Tu as swipé 🪚 "À réduire"                 │
          │                                              │
          │  Le montant est proportionné ?    [OUI] [NON]│
          │  La mission est légitime ?        [OUI] [NON]│
          │  Une alternative existe ?         [OUI] [NON]│
          └──────────────────────────────────────────────┘

ÉTAPE 3 — La prescription (choix unique, seulement si "réduire" ou "injustifié")
          ┌──────────────────────────────────────────────┐
          │  Quelle solution ?                           │
          │                                              │
          │  [Réduire de moitié]  [Externaliser]         │
          │  [Fusionner]         [Supprimer]             │
          └──────────────────────────────────────────────┘

          → Carte suivante
```

**Le tout en 10-15 secondes par carte** (vs. 3-5 secondes au Niveau 1). Le format toggle/tap unique reste mobile-friendly.

**Session :** 8-10 cartes (moins de cartes car plus de temps par carte). ~5-8 minutes.

**Écran de fin Niveau 3 :**

- Rapport d'audit personnel complet : par dépense, ton verdict + ta prescription
- Agrégation : "Sur les 10 dépenses auditées, tu recommandes 4 réductions, 2 suppressions, 1 fusion, et tu renforces 3 postes"
- Impact chiffré estimé : "Tes recommandations représentent une économie de X Md€, soit Y€ par contribuable"
- **Passerelle Simulateur** : "Voir l'impact de tes coupes sur *ta* fiche de contribution →" (lien vers le simulateur avec les catégories pré-ajustées)
- **Passerelle Feed** : "Transformer cet audit en contribution sur le Feed (+XP Contributeur)"

---

### Progression & rejouabilité

```
┌───────────────────────────────────────────────────────────────┐
│                    PARCOURS DU JOUEUR                         │
│                                                               │
│  1ère visite                                                  │
│  └─ Niveau 1, catégorie aléatoire (10-12 cartes)             │
│     └─ Écran résultat → "Continuer (Niv.1)" ou              │
│                          "Passer au Niveau 2"                 │
│                                                               │
│  Sessions suivantes                                           │
│  └─ Le joueur choisit librement :                             │
│     · Niveau 1 sur un nouveau deck (autre catégorie)          │
│     · Niveau 2 sur les mêmes cartes OU un nouveau deck       │
│     └─ Fin de Niv.2 → "Continuer (Niv.2)" ou               │
│                         "Passer au Niveau 3" (après 3 sess.) │
│                                                               │
│  Joueur engagé                                                │
│  └─ Niveau 3 "Mode Citoyen"                                  │
│     └─ Résultats détaillés → conversion Feed/Simulateur       │
│     └─ Nouveaux decks thématiques débloqués                   │
│        (ex: "Spécial PLF 2026", "Dépenses COVID héritage")   │
│                                                               │
│  Rejouabilité                                                 │
│  └─ Decks par catégorie (8-9 catégories × 8-15 cartes)       │
│  └─ Decks événementiels (actualité budgétaire)                │
│  └─ "Rejouer mes anciennes cartes" pour voir si               │
│     son avis a changé (tracking d'évolution)                  │
└───────────────────────────────────────────────────────────────┘
```

**Mécanique de déblocage :**

- Niveau 2 se débloque après **1 session complète** de Niveau 1 — mais le joueur n'est jamais forcé d'y aller. Il peut enchaîner autant de sessions Niveau 1 qu'il veut.
- Niveau 3 se débloque après **3 sessions de Niveau 2** — même principe, le joueur monte quand il se sent prêt
- Les decks thématiques spéciaux se débloquent en ayant joué au moins une fois dans chaque catégorie de base
- À chaque écran de fin, le choix "Continuer" (même niveau, nouveau deck) est toujours proposé en premier, et "Passer au niveau suivant" en second — on ne pousse pas le joueur vers la complexité, on la rend disponible

Cette progression sert deux objectifs : garder le joueur dans la durée, et **s'assurer que les données de Niveau 3 sont produites par des joueurs qui ont déjà réfléchi** — ça améliore la qualité des audits citoyens collectés.

---

## Cohabitation avec la gamification existante

### Le système actuel de XP

La plateforme attribue déjà des points pour les contributions (signalement, vote, commentaire, contribution GitHub). C'est un système qui **récompense l'investissement éditorial** et la participation communautaire.

### Pourquoi Budget Swipe ne doit PAS cannibaliser ce système

Si un swipe rapporte autant de XP qu'un signalement documenté ou un commentaire argumenté, on dévalue le travail des contributeurs sérieux. Le risque : tout le monde swipe, personne ne contribue.

### La proposition : deux circuits complémentaires, un profil unifié

```
┌──────────────────────────────────────────────────────────┐
│                    PROFIL UTILISATEUR                     │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │  🏆 XP Contributeur │  │  🪚 Profil Tronçonneur     │ │
│  │  (système actuel)   │  │  (nouveau - Budget Swipe)  │ │
│  │                     │  │                            │ │
│  │  Points gagnés via: │  │  Stats personnelles :      │ │
│  │  · Signalements     │  │  · Nb sessions jouées     │ │
│  │  · Votes            │  │  · Total coupé (Md€)      │ │
│  │  · Commentaires     │  │  · Total gardé (Md€)      │ │
│  │  · Contributions GH │  │  · Catégories préférées   │ │
│  │                     │  │  · Badges débloqués       │ │
│  │  → Rang communauté  │  │  · Archétype budgétaire   │ │
│  └─────────────────────┘  └────────────────────────────┘ │
│                                                          │
│  Les XP Contributeur et le Profil Tronçonneur sont       │
│  visibles sur la même page profil mais restent distincts. │
└──────────────────────────────────────────────────────────┘
```

**Règle d'or : le swipe ne donne pas de XP contributeur.** Le jeu a son propre système de récompense (badges, archétype, stats) qui vit à côté. Pas de confusion, pas de parasitage.

**Passerelles naturelles entre les deux univers :**

- Depuis Budget Swipe → "Cette dépense t'intrigue ? Signale-la sur le Feed (+XP Contributeur)"
- Depuis Budget Swipe → "Voir combien TU payes pour cette dépense" → lien Simulateur personnalisé
- Depuis le Feed → "Cette dépense a été swipée 12 000 fois, 67% veulent la réduire"
- Badge spécial transversal : "Citoyen complet" (a contribué AU MOINS une fois dans chaque pilier)

---

## Les archétypes budgétaires (élément viral)

À la fin de chaque session (et en cumulé sur le profil), l'utilisateur obtient un archétype basé sur ses patterns. L'archétype **s'affine avec les niveaux** — au Niveau 1 c'est une étiquette fun, au Niveau 3 c'est un vrai profil d'auditeur.

### Archétypes de base (Niveau 1)

| Archétype | Profil | Phrase |
|-----------|--------|--------|
| 🪚 **L'Austéritaire** | "À revoir" > 80% | "Pour toi, tout est à revoir." |
| 🛡️ **Le Gardien** | "OK" > 80% | "Touche pas au service public, merci." |
| ⚖️ **L'Équilibriste** | ~50/50 | "Tu pèses le pour et le contre." |
| 🔥 **Le Speedrunner** | Session ultra rapide | "12 milliards arbitrés en 47 secondes." |

### Archétypes enrichis (Niveau 2 — grâce aux 4 directions)

| Archétype | Profil | Phrase |
|-----------|--------|--------|
| 🎯 **Le Chirurgien** | Réduit beaucoup, supprime peu | "Tu coupes dans le gras, pas dans l'os." |
| 📈 **L'Investisseur** | Renforce souvent | "Dépenser plus pour dépenser mieux." |
| 🎪 **Le Spécialiste** | Ultra clivé sur 1 catégorie | "Tu as trouvé ton ennemi budgétaire." |
| 🌀 **L'Indécis** | Beaucoup de temps par carte | "C'est pas si simple hein ?" |
| 💀 **Le Liquidateur** | Swipe "Injustifié" > 40% | "Radical." |

### Archétypes Niveau 3 (basés sur les prescriptions)

| Archétype | Profil | Phrase |
|-----------|--------|--------|
| 🔧 **L'Optimisateur** | Prescrit surtout "réduire de moitié" | "Pas supprimer, optimiser." |
| 🤝 **Le Mutualisateur** | Prescrit surtout "fusionner" | "Pourquoi 3 agences quand 1 suffit ?" |
| 🏪 **Le Libéral** | Prescrit surtout "externaliser" | "Le privé fera mieux et moins cher." |
| 📋 **L'Auditeur Complet** | A joué les 3 niveaux dans toutes les catégories | "Tu as tout passé au peigne fin." |

Ces archétypes sont faits pour être **partagés sur les réseaux sociaux** avec une image card générée (Open Graph / partage natif). L'archétype évolue au fil des sessions, ce qui incite à rejouer ("monte de niveau pour affiner ton profil").

---

## La donnée : quel dataset pour les cartes ?

### Approche recommandée : curated top 50-100

Plutôt que d'essayer de rendre swipable l'intégralité du budget de l'État, on sélectionne les dépenses les plus **compréhensibles, clivantes et mémorables**.

**Critères de sélection d'une bonne carte :**

1. **Compréhensible en 5 secondes** — le citoyen moyen doit comprendre de quoi il s'agit
2. **Montant significatif** — pas en-dessous de 100M€ (sinon effet "c'est rien")
3. **Clivante** — il y a matière à débat (pas de consensus évident)
4. **Sourcée** — montant vérifiable, source officielle disponible

**Répartition suggérée pour un deck de 80 cartes :**

| Catégorie | Nb cartes | Exemples |
|-----------|-----------|----------|
| Protection sociale (retraites, chômage, famille) | 15 | Minimum vieillesse, Alloc rentrée scolaire |
| Santé | 10 | Remboursement médicaments, Hôpital public |
| Éducation & Recherche | 10 | Budget universités, CNRS |
| Défense | 8 | Dissuasion nucléaire, OPEX |
| Sécurité & Justice | 8 | Police nationale, Administration pénitentiaire |
| Fonctionnement de l'État | 10 | Sénat, Parc auto ministériel, Frais de représentation |
| Culture & Sport | 5 | Audiovisuel public, JO héritage |
| Transports & Écologie | 7 | SNCF subventions, Bonus écologique |
| Économie & Entreprises | 7 | CIR, Aides sectorielles |

> 💡 Ce dataset est un **travail éditorial** à part entière. Il peut d'ailleurs être collaboratif : la communauté propose des cartes, les mainteneurs valident et sourcent.

### Alimentation depuis l'existant

Les données de la page **Chiffres** et du **Feed** sont les sources naturelles. On peut créer un flag `swipable: true` dans le modèle de données existant pour marquer les dépenses éligibles, avec les champs supplémentaires (phrase de contexte, équivalence).

---

## Données communautaires générées

Budget Swipe produit un dataset d'opinion inédit qui a de la valeur pour le site :

- **Taux de "coupe" par dépense** → classement des dépenses les plus contestées
- **Profils agrégés par catégorie** → "Les Français couperaient en priorité dans X"
- **Heatmap temporelle** → les opinions évoluent-elles avec l'actualité ?
- **Données démographiques** (si on collecte l'âge/CSP, optionnel) → "Les -30 ans veulent couper la défense, les +50 ans veulent couper le RSA"

Ces données agrégées peuvent alimenter :

- Un nouveau bloc dans la page **Chiffres** : "L'avis de la communauté"
- Des posts automatiques dans le **Feed** : "Cette semaine, la dépense la plus coupée est..."
- Des articles / infographies partageables

---

## Estimation technique

### Stack & intégration

Le jeu s'intègre dans l'existant Next.js + Drizzle + Tailwind. Pas de refonte nécessaire, c'est une nouvelle route `/jeu` (ou `/swipe`, `/tronconneuse`...).

### Composants à développer

| Composant | Complexité | Estimation |
|-----------|------------|------------|
| **SwipeCard Niv.1** — composant tactile 2 directions (framer-motion ou @use-gesture) | Élevée | 2-3 jours |
| **SwipeCard Niv.2** — extension 4 directions avec feedback visuel par axe | Moyenne | 1-2 jours |
| **MicroAudit Niv.3** — écran post-swipe (toggles oui/non + choix solution) | Moyenne | 1-2 jours |
| **GameSession** — logique de session, deck loading, progression, gestion des niveaux | Moyenne | 1-2 jours |
| **ResultScreen** — 3 variantes (simple → détaillé → rapport d'audit) | Moyenne | 2-3 jours |
| **Progression** — déblocage niveaux, tracking sessions, gestion des decks joués | Moyenne | 1 jour |
| **Schema Drizzle** — tables sessions, votes, audits Niv.3, stats agrégées | Faible-Moyenne | 1 jour |
| **API Routes** — deck aléatoire, enregistrement votes/audits, stats par niveau | Moyenne | 2 jours |
| **Intégration profil** — archétypes, stats par niveau, passerelles Feed/Simulateur | Moyenne | 1-2 jours |
| **Partage social** — génération d'image OG dynamique avec archétype (Next.js ImageResponse) | Moyenne | 1 jour |
| **Dataset éditorial** — rédaction et sourçage des 50-80 premières cartes (Niv.1+2), rédaction des questions d'audit Niv.3 | Élevée | 3-4 jours |

### Approche de livraison recommandée : itérative

Plutôt que de tout développer d'un bloc, on livre niveau par niveau :

| Phase | Contenu | Durée estimée |
|-------|---------|---------------|
| **Sprint 1 — Niveau 1 jouable** | SwipeCard 2 directions + session + résultat simple + dataset 50 cartes | 6-8 jours |
| **Sprint 2 — Niveau 2 + archétypes** | 4 directions + résultats enrichis + archétypes + partage social | 4-6 jours |
| **Sprint 3 — Niveau 3 + intégration** | Micro-audit + passerelles Feed/Simulateur + profil complet | 4-6 jours |
| **Total** | **14-20 jours** répartis sur 3 sprints |

> 💡 L'avantage de cette approche : le Niveau 1 est déployable seul et a déjà de la valeur. On peut le tester avec la communauté, itérer, puis décider de poursuivre vers le Niveau 2 selon l'engagement constaté.

### Évolutions post-MVP (v4+)

- Mode "duel" (2 joueurs swipent le même deck, on compare en temps réel)
- Cartes événementielles liées à l'actualité budgétaire (PLF, PLFSS, débats parlementaires)
- Intégration directe avec le Simulateur ("applique tes coupes à ton profil fiscal" — pré-remplissage)
- Mode "budget contraint" : tu as un objectif d'économie à atteindre, tu dois choisir où couper
- API ouverte pour que d'autres sites/apps puissent embarquer le jeu
- "Rejouer mes anciennes cartes" : tracker l'évolution de ses opinions dans le temps

---

## Risques et points de vigilance

### Neutralité éditoriale
Les cartes doivent être **factuelles et non orientées**. Si la phrase de contexte est sarcastique ou militante, le jeu perd sa crédibilité. Le ton du site (irrévérencieux mais sourcé) doit se retrouver dans les cartes, pas dans leur contexte factuel.

### Oversimplification
Le Niveau 1 est binaire par design — et c'est assumé. Mais la progression vers les Niveaux 2 et 3 résout le problème : on passe de "à revoir / OK" à un véritable mini-audit avec prescriptions. L'écran de résultats doit à chaque niveau renvoyer vers les contenus de fond (Feed, Simulateur) et rappeler que c'est un point de départ, pas une conclusion. Le Niveau 3 en particulier produit des données structurées proches du système d'évaluation du Feed — c'est la passerelle la plus directe.

### Modération du partage
Les archétypes et résultats partagés ne doivent pas être instrumentalisables politiquement. Éviter les formulations trop clivantes dans les cards de partage social.

### Performance mobile
Les animations de swipe doivent être fluides à 60fps sur des mobiles moyens de gamme. C'est un point technique non négociable — un swipe qui lag, c'est un utilisateur qui part. Attention particulière au Niveau 2 avec les 4 directions : le feedback visuel doit clairement indiquer la direction détectée pendant le geste (couleur + icône qui apparaît), sinon le joueur ne saura pas si son swipe a été lu comme "réduire" ou "injustifié".

---

## Résumé de la proposition

| | |
|---|---|
| **Quoi** | Mini-jeu de swipe à 3 niveaux de profondeur sur les dépenses publiques |
| **Pour qui** | Grand public, mobile-first, 18-45 ans |
| **Pourquoi** | Porte d'entrée ludique vers la plateforme, génération de données d'opinion structurées, viralité |
| **Progression** | Niv.1 "Première impression" (2 dir.) → Niv.2 "Nuances" (4 dir.) → Niv.3 "Mode Citoyen" (mini-audit) |
| **Coût** | Sprint 1 (Niv.1 jouable) : 6-8 jours · Total 3 niveaux : 14-20 jours |
| **Risque principal** | Qualité du dataset éditorial |
| **Cohabitation gamification** | Système séparé (pas de XP contributeur), profil unifié, passerelles naturelles |
| **Lien avec le Feed** | Les données de Niv.3 alimentent le système d'évaluation existant |
| **Lien avec le Simulateur** | "Voir l'impact de tes choix sur TA contribution" → lien personnalisé |
| **KPI de succès** | Sessions jouées/jour, taux de progression Niv.1→2→3, taux de partage social, conversion vers Feed/Simulateur |

---

*Ce document est une proposition ouverte à discussion. L'objectif est de recueillir les retours de la communauté avant tout développement. N'hésitez pas à commenter, challenger ou enrichir cette RFC.*

*— Seb · Contributeur NicoQuiPaie*
