# france-finances.com (La Tronconneuse de Poche)

Mini-jeu mobile-first "Tinder des depenses publiques" — [france-finances.com](https://france-finances.com)

Le joueur swipe des cartes de depenses budgetaires francaises :

- Gauche = Garder (bouclier)
- Droite = A revoir (tronconneuse)

## Contenu

- **379 cartes** reparties en **19 decks** (16 categories + 3 thematiques), niveaux L1=130, L2=133, L3=116
- **18 archetypes** budgetaires (8 L1, 6 L2, 4 L3)
- **19 badges** de categorie + **12 achievements** generaux + **3 badges** de comprehension (quiz)

## 3 niveaux de profondeur

- **Niveau 1** : 2 directions (garder / couper)
- **Niveau 2** : 4 directions (OK / reduire / renforcer / injustifie)
- **Niveau 3** : micro-audit (diagnostics + prescription)

Les niveaux 2 et 3 se debloquent en jouant (2 sessions du niveau precedent).

## Modes et pages

| Route                     | Contenu                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                       | Landing (chiffre d'ouverture, entree directe dans le jeu, outils)                             |
| `/jeu`, `/jeu/[deckId]`   | Choix du deck et session de swipe (retour apres chaque swipe, mini-quiz sur les montants)     |
| `/jeu/quotidien`          | Deck du jour : meme tirage pour tous, serie de jours, partage du resultat                     |
| `/jeu/random?mode=budget` | Defi « Trouve 50 Md€ » (objectif d'economies, `&target=` de 1 a 200)                          |
| `/chiffres`               | Les finances publiques en chiffres (dette, deficit, budget de l'Etat, comparaisons UE)        |
| `/simulateur`             | Simulateur fiscal (IR, cotisations, TVA estimee), calcul dans le navigateur, lien partageable |
| `/profil`, `/classement`  | Stats, badges, archetypes, classements                                                        |
| `/pixee-admin`            | Dashboard analytics, reserve aux emails de `ADMIN_EMAILS` (404 sinon)                         |

## Stack technique

- **Framework** : Next.js 16 (App Router, RSC) + React 19
- **UI** : Tailwind CSS 4, composants maison, design tokens dans `src/app/globals.css` (direction data-journalisme, sombre par defaut + theme clair)
- **Polices** : Source Serif 4 (titres, chiffres), Schibsted Grotesk (texte), IBM Plex Mono (etiquettes), via `next/font`
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand (store de session de jeu)
- **Auth** : NextAuth.js v5 (Google + GitHub), trustHost: true
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline fallback ; build prod via webpack)
- **Monitoring** : Sentry
- **Tests** : Vitest + Testing Library (485 tests) + E2E Playwright (14 tests)
- **CI** : GitHub Actions (lint + type-check + build + test --coverage + E2E + docker), Husky + lint-staged + commitlint, `npm run data:check`
- **Deploy** : Docker (output: standalone) via Coolify

## Demarrage

```bash
npm install
cp .env.example .env.local   # puis completer les variables
npm run dev
```

Le serveur de dev demarre sur http://localhost:3000. Sans `DATABASE_URL`, le jeu fonctionne en mode localStorage.

## Variables d'environnement

Voir `.env.example`. A noter :

| Variable                      | Role                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL (optionnelle)                                                                                             |
| `AUTH_SECRET`                 | Secret NextAuth                                                                                                      |
| `GOOGLE_CLIENT_*`, `GITHUB_*` | Fournisseurs OAuth                                                                                                   |
| `ADMIN_EMAILS`                | Emails autorises sur `/pixee-admin` et les routes analytics admin (virgules, insensible a la casse). Vide = personne |
| `ANALYTICS_SECRET`            | Acces programmatique (cron) a `/api/analytics/dashboard` et `/api/analytics/purge`                                   |

## Scripts

| Commande              | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Serveur de dev (Turbopack)                       |
| `npm run build`       | Build production (webpack, requis par serwist)   |
| `npm run start`       | Serveur de production                            |
| `npm run lint`        | ESLint                                           |
| `npm run test`        | Tests Vitest (+ coverage v8)                     |
| `npm run type-check`  | TypeScript (tsc --noEmit)                        |
| `npm run data:check`  | Controle des donnees (voir `src/data/README.md`) |
| `npm run test:e2e`    | Tests E2E Playwright (`E2E_PROD=1` : build prod) |
| `npm run db:generate` | Generer une migration Drizzle                    |
| `npm run db:migrate`  | Appliquer les migrations Drizzle (manuel)        |

## Build Docker

```bash
docker build -t france-finances .
docker run -p 3000:3000 france-finances
```

## Structure

```
src/
  app/              # Pages (App Router, route group (game))
    api/            # API routes (health, sessions, ranking, community, me, stats, analytics, og)
    (game)/         # Game pages (jeu, jeu/[deckId] dont jeu/quotidien, profil, classement, resultats, infos, partage)
    chiffres/       # Les finances publiques en chiffres
    simulateur/     # Simulateur fiscal
    categories/     # Pages categorie
    contribuer/     # Page contribuer (guide contributeur)
    a-propos/       # Page a propos
    page.tsx        # Landing page
    pixee-admin/    # Dashboard analytics (ADMIN_EMAILS)
  components/       # Composants React (SwipeCard, SwipeStack, CardDetail...)
    landing/        # Composants landing page
    icons/          # Pictogrammes SVG (CategoryIcon, UiIcon)
  data/             # Cartes (cards/*.json) et decks (decks-meta.json)
  db/               # Schema Drizzle (migrations dans drizzle/)
  stores/           # Zustand stores
  hooks/            # Hooks custom (barrel export)
  lib/              # Utils, analytics, achievements (barrel export)
  types/            # Types TypeScript
```

## Donnees

379 cartes, 19 decks (16 categories + 3 thematiques). Montants en milliards d'euros (Md EUR), sources officielles (PLF/LFSS 2025-2026, Cour des comptes, Senat, DREES). 377 cartes ont une `sourceUrl` precise. Dans l'interface, les compteurs sont calcules a partir des donnees (`TOTAL_CARD_COUNT`, `CATEGORY_COUNT` dans `src/lib/deckMeta.ts`). Regles et controles : `src/data/README.md` et `npm run data:check`.

Le PLF / PLFSS 2027 (presente le 1er octobre 2026) n'est pas encore integre.

## Deploy

Heberge sur france-finances.com via Coolify (Docker, VPS OVH). DNS Cloudflare (DNS only).

Avant le deploiement de la refonte : definir `ADMIN_EMAILS` dans Coolify, et exporter la table `waitlist` avant tout `npm run db:migrate` (voir `PLAN-REFONTE.md`, section 5).
