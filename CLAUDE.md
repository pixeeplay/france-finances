# CLAUDE.md -- La Tronconneuse de Poche (Budget Swipe)

## Projet

Mini-jeu mobile-first "Tinder des depenses publiques" — france-finances.com
Le joueur swipe des cartes de depenses budgetaires francaises : gauche = garder, droite = a revoir.
3 niveaux de profondeur : Niv.1 (2 directions), Niv.2 (4 directions), Niv.3 (micro-audit).
A la fin d'une session (10-12 cartes), le joueur obtient un archetype budgetaire et ses stats.

Repo : https://github.com/pixeeplay/tronconneuse/
Deploy : france-finances.com (Coolify, Docker, VPS OVH)
DNS : Cloudflare (DNS only, pas de proxy)

## Contenu

- **370 cartes** reparties en **19 decks** (16 categories + 3 thematiques)
- **16 archetypes** budgetaires (6 L1, 6 L2, 4 L3)
- **19 badges** de categorie + **12 achievements** generaux

## Stack technique

- **Framework** : Next.js 15 (App Router, RSC)
- **UI** : Tailwind CSS 4 + shadcn/ui
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand (store de session de jeu)
- **Auth** : NextAuth.js v5 (Google + GitHub), trustHost: true
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline fallback)
- **Tests** : Vitest + Testing Library (86 tests, coverage >60%)
- **CI** : GitHub Actions (lint + type-check + build + test + docker), Husky + lint-staged
- **Deploy** : Docker (output: standalone) via Coolify

## Conventions

- TypeScript strict, pas de `any`
- Composants dans `src/components/` (PascalCase)
- Pages dans `src/app/` (App Router, route group `(game)`)
- Types dans `src/types/`
- Data/cartes dans `src/data/`
- Stores Zustand dans `src/stores/`
- Hooks custom dans `src/hooks/` (barrel export)
- Utils dans `src/lib/` (barrel export)
- Mobile-first : designer pour 375px d'abord, responsive ensuite
- Dark theme par defaut
- TOUJOURS utiliser ChainsawIcon et ShieldIcon (pas d'emoji) pour cut/keep
- Desktop containment : `lg:h-[900px] lg:max-h-[90vh] lg:rounded-3xl`
- pb-safe sur BottomNav et footers pour iOS safe area
- aria-hidden sur SVGs et emojis decoratifs
- min-h-[44px] sur elements interactifs
- API responses standardisees : jsonOk(), jsonError(), withDbCheck()

## Palette de couleurs

- Fond principal : #0F172A (slate-950)
- Cards : #1E293B (slate-800)
- Garder/OK : #10B981 (emerald-500)
- Couper/A revoir : #EF4444 (red-500)
- Renforcer : #3B82F6 (blue-500)
- Injustifie : #F59E0B (amber-500)
- Texte principal : #F8FAFC (slate-50)
- Texte secondaire : #94A3B8 (slate-400)
- Accent neon (hover/CTA) : #34D399 (emerald-400)

## Structure des fichiers

```
src/
  app/              # Pages (App Router, route group (game))
    api/            # API routes (health, sessions, ranking, waitlist, analytics, etc.)
    (game)/         # Game pages (jeu, profile, ranking, results, infos, share)
    categories/     # Category pages
    landing/        # Landing page (home)
    offline/        # Offline fallback
  components/
    ui/             # shadcn/ui
    landing/        # Landing page components (Hero, Navbar, Footer, ParisTeaser, etc.)
    SwipeCard.tsx   # Carte swipable
    SwipeStack.tsx  # Pile de cartes + logique session
    CardDetail.tsx  # Bottom sheet detail
    ResultScreen.tsx # Resultats + archetype (split: StatBar, AuditReport, ShareIcon)
    BottomNav.tsx   # Navigation mobile
  data/
    decks-meta.json # 19 decks definitions
    cards/*.json    # Cartes par categorie (split)
    index.ts        # Barrel export
  db/
    schema.ts       # Tables: users, sessions, votes, communityVotes, analyticsEvents, waitlist, auditResponses
    index.ts        # Drizzle client + pool
  stores/
    gameStore.ts    # Zustand (voteAndAdvance, useShallow)
  hooks/            # useSwipeGesture, useArchetype, useInstallPrompt, useSync, etc.
  lib/              # deckUtils, archetype, stats, achievements, api-utils
  types/
```

## Commandes

- `npm run dev` -- dev server (Turbopack, port 3000)
- `npm run build` -- build production
- `npm run lint` -- ESLint
- `npm run test` -- Vitest
- `npm run db:migrate` -- Migrations Drizzle

## Donnees

370 cartes, 19 decks (16 categories + 3 thematiques).
Donnees factuelles, sourcees, neutres. Pas de ton militant.
Montants en milliards d'euros, cout par citoyen base sur ~68M habitants.
Sources : PLF/LFSS 2025-2026, Cour des comptes, Senat, ministeres, vie-publique.fr.

## Notes d'implementation

- Swipe fluide a 60fps sur mobile moyen de gamme
- Rotation proportionnelle au deplacement X (max +/-15 deg)
- Carte suivante visible en dessous (scale 0.95, opacity 0.7)
- Animation de sortie : spring + overshoot + fade
- Bottom sheet : drag-to-dismiss, focus trap, overlay semi-transparent
- Reduced motion respecte (prefers-reduced-motion)
- optimizePackageImports incompatible avec Turbopack (ne pas utiliser)
