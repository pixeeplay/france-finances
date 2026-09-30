# Plan de refonte -- france-finances.com

**Date :** 2026-09-30
**Contexte :** projet en pause depuis mars 2026 (Sprint 35). Le partenaire nicoquipaie.co est hors ligne et son responsable injoignable. Objectifs : rapatrier nos publications nicoquipaie, moderniser le site (sortir du look "IA générique"), enrichir le jeu.

> Ce document est destiné à être repris depuis un environnement ayant accès au réseau (voir Phase 0).

---

## 1. Rapatriement des publications nicoquipaie (priorité 0)

### Ce qu'on sait

- Les publications suivent le format `https://nicoquipaie.co/s/<uuid>`. Exemple indexé : `https://nicoquipaie.co/s/94f61d94-78e3-48b7-b35f-aecbd2b354fb`.
- Autres pages indexées : `https://nicoquipaie.co/feed/hot` (Tendances), `/chiffres`, `/simulateur`.
- Les contenus étaient documentés par des sources officielles (rapports parlementaires, Cour des comptes, presse vérifiée). Exemples vus dans les résultats de recherche : la dérive de 259 M€ du projet de facturation électronique (AIFE), le budget de fonctionnement du Sénat (340 M€/an).
- Aucune trace dans la boîte Gmail (recherche « nicoquipaie » et « Nicolas qui paie » : 0 résultat).

### Accès réseau requis

Il faut autoriser ces domaines dans les paramètres réseau de l'environnement :

- `nicoquipaie.co`
- `web.archive.org` et `archive.org` (API CDX Wayback)
- `archive.ph`

### Procédure

1. **Inventaire.** Via l'API CDX, lister toutes les URL archivées :
   `http://web.archive.org/cdx/search/cdx?url=nicoquipaie.co*&output=json&fl=original,timestamp,statuscode,mimetype&collapse=urlkey`.
   Compléter avec `archive.ph/nicoquipaie.co` et le site lui-même s'il répond encore partiellement.
2. **Détection de l'API.** Si le site était une SPA (pages vides dans l'archive), chercher dans les bundles JS archivés les endpoints de l'API (`/api/...`, Supabase, Firebase…). Les réponses JSON archivées sont souvent plus complètes que le HTML.
3. **Filtrage.** Garder uniquement nos publications, identifiées par auteur ou profil. Si l'auteur n'est pas identifiable, tout archiver et trier à la main.
4. **Extraction.** Pour chaque publication : titre, texte, montants, sources (URL), date, catégorie, images.
5. **Stockage dans le repo.**
   - Données dans `src/data/publications/<slug>.json`, validées par un schéma Zod dans `src/types/`.
   - Pages HTML brutes dans `archive/nicoquipaie/` (hors bundle) pour la traçabilité.
6. **Publication.** Nouvelle rubrique `/dossiers` (liste) et `/dossiers/[slug]`, avec JSON-LD `Article`, sitemap et lien vers les cartes liées.
7. **Nettoyage des références à nicoquipaie.co :**
   - `src/components/landing/EcosystemSection.tsx` : section à supprimer ou à remplacer par « Dossiers ».
   - `src/app/a-propos/page.tsx:72-77`
   - `src/app/api/og/route.tsx:186` : texte de l'image OG.
   - `src/app/(game)/infos/page.tsx:28`
   - `public/les-chiffres.svg`, `le-feed.svg`, `le-simulateur.svg` : à supprimer s'ils ne sont plus utilisés.

**Plan B :** si l'archive est vide, chercher des sauvegardes locales (brouillons, exports, Drive) ou des posts X qui reprenaient les publications.

---

## 2. Analyse de l'existant

### Points forts

- Stack moderne : Next 16, React 19, Tailwind 4, Drizzle, NextAuth v5, PWA serwist.
- Environ 275 tests Vitest, E2E Playwright, CI complète, Sentry.
- 369 cartes réparties en 19 decks, 16 archétypes, badges et achievements.

### Jeu : ce qui est superficiel

| Constat | Détail |
| --- | --- |
| Les niveaux n'existent que dans la mécanique | Les 369 cartes ont `"level": 1`. L2 et L3 ne changent que les directions de swipe (4 directions, audit). On y accède uniquement par `?level=` (`src/app/(game)/jeu/[deckId]/page.tsx:66-68`). |
| Aucun retour après un swipe | `SwipeStack.tsx` passe à la carte suivante sans révéler le vote de la communauté ni la conséquence budgétaire. |
| Aucune rétention | Pas de deck du jour, pas de série de jours, et le tirage aléatoire n'a pas de seed (`src/lib/deckUtils.ts`). |
| Archétype déclaratif | `src/lib/archetype.ts` se base seulement sur les pourcentages cut/keep. Il ne tient compte ni des montants ni des catégories coupées. |
| Badges de volume | `src/lib/achievements.ts` : 19 badges « jouer N sessions du deck X » copiés-collés. Rien ne récompense la compréhension. |
| Pédagogie passive | Aucun quiz ni aucune vérification de connaissances. |

### Design : signes d'un look « IA générique »

- Un emoji comme visuel principal sur 369 cartes sur 369 (`SwipeCard.tsx:182`, `text-[90px]`), avec beaucoup de doublons (🏠 ×18, 🌾 ×15). Ça contredit la règle « pas d'emoji » de CLAUDE.md.
- Thème shadcn par défaut (`--radius: 0.625rem`), ombres néon « glow » (`globals.css` l.144-148), dégradés de texte (`globals.css` l.343-373).
- Polices Geist, Geist Mono et Outfit : le combo par défaut de Next.
- Landing en enchaînement standard (Hero, KeyNumbers, HowItWorks, Categories, Sources, Footer), avec dégradés et flous dans `HeroSection`, `NavbarLanding`, `SwipeCard` et `ResultScreen`.

### Données

- `sourceUrl` n'est renseignée que sur 101 cartes sur 369, et 93 de ces 101 pointent vers une page d'accueil (vie-publique.fr ×23, defense.gouv.fr ×15, budget.gouv.fr ×14…).
- 22 URL ont un domaine accentué, donc invalide (`www.défense.gouv.fr`, `économie.gouv.fr`, `écologie.gouv.fr`).
- Fraîcheur : les chiffres reposent surtout sur le PLF 2026 (115 mentions). Le PLF 2027 est publié début octobre 2026.
- CLAUDE.md et le README annoncent 370 cartes ; il y en a 369.

### Sécurité et code mort

- ⚠️ **`src/app/pixee-admin/layout.tsx` ne vérifie que la connexion, pas le rôle** : tout utilisateur Google ou GitHub connecté accède à l'admin. Le lien est aussi exposé dans `BottomNav.tsx:56`.
- Code mort :
  - La waitlist : `src/app/api/waitlist/route.ts` et la table dans `src/db/schema.ts`.
  - `ParisTeaser`, avec `public/PSG-PARIS.svg` et `public/paris.svg`.
  - Les SVG de démo : `public/vercel.svg`, `next.svg`, `file.svg`, `window.svg`, `globe.svg`.
- CLAUDE.md est périmé : il annonce Next 15 au lieu de 16, un dossier `src/components/ui` (shadcn) qui n'existe pas, et 248 tests.

---

## 3. Plan multi-agents

Environ 8 agents. Chacun travaille sur sa propre branche ou worktree, et on les fusionne dans l'ordre indiqué.

```
Phase 0  [Rapatriement] ─────────────────────────────┐
Phase 1  [D Assainissement] ─► [A Design] [B Données] [C Game design]  (A, B, C en parallèle)
Phase 2  [Fact-check] [Code review] [Audit a11y/perf]
Phase 3  (plus tard) Chiffres / Simulateur / Feed natifs
```

### Phase 0 : Rapatriement (1 agent, réseau requis)

Voir la section 1. Livrables : `src/data/publications/`, `archive/nicoquipaie/`, les routes `/dossiers`, les références à nicoquipaie.co supprimées.

### Phase 1

**D. Assainissement** (en premier, car A et C touchent aux mêmes composants)

- Contrôle de rôle admin sur `pixee-admin` : un champ `role` sur `users` ou une variable d'env `ADMIN_EMAILS`. Retirer le lien de `BottomNav`.
- Supprimer la waitlist, `ParisTeaser` et les SVG de démo.
- Vérifier que Next 16, NextAuth beta, serwist et Sentry fonctionnent ensemble. `npm run lint`, `type-check`, `test` et `build` doivent passer.
- Remettre CLAUDE.md et le README en accord avec la réalité.

**A. Direction artistique** (après D)

- Direction « data-journalisme » (références : Les Décodeurs, FT Visual, Our World in Data) : typographie éditoriale (une serif pour les titres, une grotesk pour le texte, des chiffres tabulaires), grille rigoureuse, palette sobre avec la couleur réservée au sens (garder / couper / renforcer / injustifié).
- Supprimer les dégradés de texte, les ombres néon et les flous décoratifs.
- Remplacer les emojis des cartes par un pictogramme SVG par catégorie (au moins 16) ou par une visualisation du montant (barre proportionnelle, équivalence).
- Refaire la landing : entrée directe dans le jeu, un chiffre fort, les dossiers mis en avant.
- Livrables : design tokens (`globals.css`), `SwipeCard`, `ResultScreen`, landing, OG image.

**B. Données** (en parallèle de A et C)

- Une `sourceUrl` précise (document ou page exacte) pour chaque carte, et correction des 22 domaines accentués.
- Mise à jour PLF 2027 / LFSS 2027 dès leur publication ; ajouter les champs `year` et `sourceDate`.
- Répartition réelle des cartes par niveau : L1 pour les grands postes, L2 pour les dispositifs, L3 pour les niches et les micro-audits.
- Schéma Zod des cartes et script `npm run data:check` (schéma, doublons, URL valides, cohérence entre `costPerCitizen` et `amountBillions` sur 68 M d'habitants), lancé en CI.

**C. Game design** (en parallèle de A et B)

- Retour après chaque swipe : pourcentage de la communauté du même avis, un fait marquant, et le montant cumulé « tronçonné ».
- Deck du jour : même tirage pour tous (seed = date), avec série de jours et partage du résultat façon Wordle.
- Mode « Trouve 50 Md€ » : objectif budgétaire à atteindre, en s'appuyant sur `gameMode: "budget"` qui existe déjà dans `gameStore`.
- Archétype calculé à partir du contenu (catégories et montants coupés), pas seulement des pourcentages.
- Remplacer les badges de volume par des badges de compréhension (mini-quiz « à ton avis, combien ? » avant de révéler le montant).
- Progression L1 → L2 → L3 débloquée par le jeu, pas par l'URL.

### Phase 2 : Relecture croisée

- **Fact-check** : un agent contradictoire vérifie les montants et les sources des cartes (B) et des dossiers (Phase 0). Il signale aussi le ton militant.
- **Code review** des branches A et C (`/code-review`).
- **Audit accessibilité et performance mobile** : Playwright + Lighthouse sur 375px, swipe à 60 fps, `prefers-reduced-motion`.

### Phase 3 : Plus tard

Reconstruire en natif les rubriques de l'ex-écosystème nicoquipaie :

- **Les Chiffres** : vue d'ensemble du budget.
- **Le Simulateur** : « ta contribution aux finances publiques ».
- **Le Feed** : dossiers et débats.

---

## 4. Pour reprendre

1. Ouvrir une session dont l'environnement autorise les domaines de la section 1.
2. Pointer l'agent sur ce fichier : « Exécute la Phase 0 de PLAN-REFONTE.md ».
3. Enchaîner avec « Lance le workflow multi-agents des Phases 1 et 2 de PLAN-REFONTE.md ». Garder l'ordre D, puis A, B et C en parallèle.
