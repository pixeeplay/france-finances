# france-finances.com (La Tronconneuse de Poche)

Mini-jeu mobile-first "Tinder des depenses publiques" — [france-finances.com](https://france-finances.com)

Le joueur swipe des cartes de depenses budgetaires francaises :

- Gauche = Garder (bouclier)
- Droite = A revoir (tronconneuse)

## Contenu

- **330 cartes** reparties en **17 categories** (14 principales + 3 thematiques)
- **16 archetypes** budgetaires (6 L1, 6 L2, 4 L3)
- **14 badges** de categorie + **12 achievements** generaux

## 3 niveaux de profondeur

- **Niveau 1** : 2 directions (garder / couper)
- **Niveau 2** : 4 directions (OK / reduire / renforcer / injustifie)
- **Niveau 3** : micro-audit (diagnostics + prescription)

## Stack technique

- **Framework** : Next.js 15 (App Router, RSC)
- **UI** : Tailwind CSS 4 + shadcn/ui
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand
- **Auth** : NextAuth.js v5 (Google + GitHub)
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline)
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
| `npm run test`       | Tests Vitest                     |
| `npm run db:migrate` | Appliquer les migrations Drizzle |

## Build Docker

```bash
docker build -t tronconneuse .
docker run -p 3000:3000 tronconneuse
```

## Structure

```
src/
  app/          # Pages (App Router)
  components/   # Composants React
  data/         # Cartes et decks JSON
  db/           # Schema Drizzle + migrations
  stores/       # Zustand stores
  hooks/        # Hooks custom
  lib/          # Utils, analytics, achievements
  types/        # Types TypeScript
```

## Donnees

330 cartes, 17 categories. Montants en milliards d'euros (Md EUR), sources officielles (PLF/LFSS 2025-2026, Cour des comptes, Senat, DREES).

## Deploy

Heberge sur france-finances.com via Coolify (Docker).
