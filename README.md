# france-finances.com (La Tronconneuse de Poche)

Mini-jeu mobile-first "Tinder des depenses publiques" — [france-finances.com](https://france-finances.com)

Le joueur swipe des cartes de depenses budgetaires francaises :

- Gauche = Garder (bouclier)
- Droite = A revoir (tronconneuse)

## Contenu

- **370 cartes** reparties en **19 decks** (16 categories + 3 thematiques)
- **16 archetypes** budgetaires (6 L1, 6 L2, 4 L3)
- **19 badges** de categorie + **12 achievements** generaux

## 3 niveaux de profondeur

- **Niveau 1** : 2 directions (garder / couper)
- **Niveau 2** : 4 directions (OK / reduire / renforcer / injustifie)
- **Niveau 3** : micro-audit (diagnostics + prescription)

## Stack technique

- **Framework** : Next.js 15 (App Router, RSC)
- **UI** : Tailwind CSS 4 + shadcn/ui
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand (store de session de jeu)
- **Auth** : NextAuth.js v5 (Google + GitHub), trustHost: true
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline fallback)
- **Tests** : Vitest + Testing Library (86 tests, coverage >60%)
- **CI** : GitHub Actions (lint + type-check + build + test --coverage + docker), Husky + lint-staged
- **Deploy** : Docker (output: standalone) via Coolify

## Demarrage

```bash
npm install
npm run dev
```

Le serveur de dev demarre sur http://localhost:3000.

## Scripts

| Commande             | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Serveur de dev (Turbopack)       |
| `npm run build`      | Build production                 |
| `npm run start`      | Serveur de production            |
| `npm run lint`       | ESLint                           |
| `npm run test`       | Tests Vitest (+ coverage v8)     |
| `npm run db:migrate` | Appliquer les migrations Drizzle |

## Build Docker

```bash
docker build -t tronconneuse .
docker run -p 3000:3000 tronconneuse
```

## Structure

```
src/
  app/              # Pages (App Router, route group (game))
    api/            # API routes (health, sessions, ranking, analytics...)
    (game)/         # Game pages (jeu, profil, classement, resultats, partage)
    categories/     # Pages categorie
    landing/        # Landing page
  components/       # Composants React (SwipeCard, SwipeStack, CardDetail...)
    ui/             # shadcn/ui
    landing/        # Composants landing page
  data/             # Cartes (cards/*.json) et decks (decks-meta.json)
  db/               # Schema Drizzle + migrations
  stores/           # Zustand stores
  hooks/            # Hooks custom (barrel export)
  lib/              # Utils, analytics, achievements (barrel export)
  types/            # Types TypeScript
```

## Donnees

370 cartes, 19 decks (16 categories + 3 thematiques). Montants en milliards d'euros (Md EUR), sources officielles (PLF/LFSS 2025-2026, Cour des comptes, Senat, DREES).

## Deploy

Heberge sur france-finances.com via Coolify (Docker, VPS OVH). DNS Cloudflare (DNS only).
