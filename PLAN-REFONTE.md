# Plan de refonte -- france-finances.com

**Date :** 2026-09-30
**Contexte :** projet en pause depuis mars 2026 (Sprint 35). Le partenaire nicoquipaie.co est hors ligne et son responsable injoignable. Objectifs : récupérer nos contributions à nicoquipaie, moderniser le site (sortir du look "IA générique"), enrichir le jeu.

> Mise à jour du 2026-10-02 : la Phase 0 initiale (rapatriement par archives web) est abandonnée. Voir section 1.

---

## 1. Nos contributions à nicoquipaie (déjà en local)

### Constat

- Le code source complet de nicoquipaie est en local : `/work/projects/NICOLAS/CestNicolasQuiPaye` (fork `beuzzleklair/CestNicolasQuiPaye`, upstream `lezardoloris/CestNicolasQuiPaye`).
- **Nos contributions étaient du code, pas des publications.** 18 commits `smiollis` / `beuzzleklair` (28/02 → 05/03/2026) :

| Contribution                                                     | Branche / commit                                                    | Réutilisation ici                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| Page « Les Chiffres » (finances publiques)                       | `feat/les-chiffres` (`ef34d4e`), `src/lib/constants/budget-2026.ts` | Portage → `/chiffres`            |
| Simulateur fiscal (IR, cotisations, TVA, répartition budgétaire) | `feat/simulateur` (`52bff80`)                                       | Portage → `/simulateur`          |
| Archive des sources officielles (68+ URL institutionnelles)      | `9d2c87e`                                                           | Agent B : `sourceUrl` précises   |
| Infobulles d'acronymes, mode clair/sombre                        | `feat/light-mode-acronyms`                                          | Déjà présent ici (`AcronymText`) |
| Audit (12 rapports) + 575 tests                                  | `feat/audits-et-tests-v1`                                           | Référence méthodologique         |

- Les publications du site (`scripts/seed.ts`, 80 signalements « Nicolas Paie ») ont été rédigées par lezardoloris, en partie issues d'une recherche Gemini. Ce n'est pas notre contenu. Elles peuvent servir d'idées de cartes, à condition de tout re-sourcer à partir de documents officiels. Les publications ajoutées ensuite par les visiteurs n'existaient que dans la base Railway (pas d'accès).

### Nettoyage des références à nicoquipaie.co

- `src/components/landing/EcosystemSection.tsx` : section à supprimer ou à remplacer par « Les Chiffres / Le Simulateur » une fois portés.
- `src/app/a-propos/page.tsx`, `src/app/api/og/route.tsx`, `src/app/(game)/infos/page.tsx`.
- `public/les-chiffres.svg`, `le-feed.svg`, `le-simulateur.svg` : à supprimer s'ils ne sont plus utilisés.

---

## 2. Analyse de l'existant

### Points forts

- Stack moderne : Next 16, React 19, Tailwind 4, Drizzle, NextAuth v5, PWA serwist.
- Environ 275 tests Vitest, E2E Playwright, CI complète, Sentry.
- 369 cartes réparties en 19 decks, 16 archétypes, badges et achievements.

### Jeu : ce qui est superficiel

| Constat                                      | Détail                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Les niveaux n'existent que dans la mécanique | Les 369 cartes ont `"level": 1`. L2 et L3 ne changent que les directions de swipe (4 directions, audit). On y accède uniquement par `?level=` (`src/app/(game)/jeu/[deckId]/page.tsx:66-68`). |
| Aucun retour après un swipe                  | `SwipeStack.tsx` passe à la carte suivante sans révéler le vote de la communauté ni la conséquence budgétaire.                                                                                |
| Aucune rétention                             | Pas de deck du jour, pas de série de jours, et le tirage aléatoire n'a pas de seed (`src/lib/deckUtils.ts`).                                                                                  |
| Archétype déclaratif                         | `src/lib/archetype.ts` se base seulement sur les pourcentages cut/keep. Il ne tient compte ni des montants ni des catégories coupées.                                                         |
| Badges de volume                             | `src/lib/achievements.ts` : 19 badges « jouer N sessions du deck X » copiés-collés. Rien ne récompense la compréhension.                                                                      |
| Pédagogie passive                            | Aucun quiz ni aucune vérification de connaissances.                                                                                                                                           |

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
Phase 1  [D Assainissement] ─► [A Design] [B Données] [C Game design] [E Portage Chiffres/Simulateur]  (en parallèle)
Phase 2  [Fact-check] [Code review] [Audit a11y/perf]
Phase 3  (plus tard) Feed / dossiers éditoriaux
```

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

**E. Portage Chiffres / Simulateur** (en parallèle de A, B et C)

- Reprendre notre code de `/work/projects/NICOLAS/CestNicolasQuiPaye` (`feat/les-chiffres`, `feat/simulateur`) et l'adapter à la stack et aux conventions de ce repo (pas de shadcn, Zustand, mobile-first, dark).
- Routes `/chiffres` et `/simulateur`, liens depuis la landing à la place de `EcosystemSection`, sitemap, tests.

### Phase 2 : Relecture croisée

- **Fact-check** : un agent contradictoire vérifie les montants et les sources des cartes (B) et du portage (E). Il signale aussi le ton militant.
- **Code review** des branches A et C (`/code-review`).
- **Audit accessibilité et performance mobile** : Playwright + Lighthouse sur 375px, swipe à 60 fps, `prefers-reduced-motion`.

### Phase 3 : Plus tard

- **Le Feed / Dossiers** : rubrique éditoriale native, avec nos propres contenus sourcés.

---

## 4. Pour reprendre

1. « Lance le workflow multi-agents des Phases 1 et 2 de PLAN-REFONTE.md ». Garder l'ordre D, puis A, B, C et E en parallèle.

## 5. Avant le déploiement de la refonte

1. **Exporter la table `waitlist` en prod** avant tout `npm run db:migrate`. La migration `drizzle/0002_drop_waitlist.sql` fait un `DROP TABLE IF EXISTS "waitlist"` et efface définitivement les emails inscrits. Exemple : `psql "$DATABASE_URL" -c "\copy waitlist TO 'waitlist-$(date +%F).csv' CSV HEADER"`, puis conserver le fichier hors du serveur.
2. Seulement ensuite, appliquer les migrations (`npm run db:migrate`), qui restent manuelles : elles ne sont pas lancées au déploiement.
