# CLAUDE.md -- La Tronconneuse de Poche (Budget Swipe)

## Projet

Mini-jeu mobile-first "Tinder des depenses publiques" — france-finances.com
Le joueur swipe des cartes de depenses budgetaires francaises : gauche = garder, droite = a revoir.
3 niveaux de profondeur : Niv.1 (2 directions), Niv.2 (4 directions), Niv.3 (micro-audit).
A la fin d'une session (10-12 cartes), le joueur obtient un archetype budgetaire et ses stats.

Repo : https://github.com/pixeeplay/france-finances/
Deploy : france-finances.com (Coolify, Docker, VPS OVH)
DNS : Cloudflare (DNS only, pas de proxy)

## Contenu

- **369 cartes** reparties en **19 decks** (16 categories + 3 thematiques)
- **16 archetypes** budgetaires (6 L1, 6 L2, 4 L3)
- **19 badges** de categorie + **12 achievements** generaux

## Stack technique

- **Framework** : Next.js 16 (App Router, RSC) + React 19
- **UI** : Tailwind CSS 4, composants maison (pas de dossier shadcn/ui ; seuls `components.json` et `cn()` subsistent)
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand (store de session de jeu)
- **Auth** : NextAuth.js v5 (Google + GitHub), trustHost: true
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline fallback). Plugin webpack : le build prod tourne en `next build --webpack`, serwist est desactive en dev (Turbopack)
- **Monitoring** : Sentry (`src/instrumentation.ts` serveur/edge, `src/instrumentation-client.ts` client)
- **Tests** : Vitest + Testing Library (294 tests, coverage lignes ~89%) + E2E Playwright
- **CI** : GitHub Actions (lint + type-check + test --coverage + build + E2E + docker), Husky + lint-staged + commitlint
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
- Admin (`/pixee-admin`, `/api/analytics/dashboard`, `/api/analytics/purge`) : controle via `isAdmin(session)` (`src/lib/admin.ts`, env `ADMIN_EMAILS`). Non-admin -> `notFound()` cote page, 401/403 cote API. Toute nouvelle route admin DOIT utiliser ce helper. `src/lib/admin.ts` importe `crypto` : ne pas l'ajouter au barrel `src/lib/index.ts` (importe cote client)

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
    api/            # API routes (health, sessions, ranking, community, me, stats, analytics, og)
    (game)/         # Game pages (jeu, profil, classement, resultats, infos, partage)
    categories/     # Category pages
    contribuer/     # Contributor guide page
    a-propos/       # About page
    page.tsx        # Landing page (home)
    pixee-admin/    # Dashboard analytics (admins ADMIN_EMAILS uniquement)
    offline/        # Offline fallback
  components/
    landing/        # Landing page components (Hero, Navbar, Footer, Categories, Sources, etc.)
    classement/     # Onglets du classement
    profile/        # Onglets et badges du profil
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
    schema.ts       # Tables: users, accounts, authSessions, verificationTokens, sessions, votes, communityVotes, analyticsEvents, auditResponses
    index.ts        # Drizzle client + pool
  stores/
    gameStore.ts    # Zustand (voteAndAdvance, useShallow)
  hooks/            # useSwipeGesture, useArchetype, useInstallPrompt, useSync, etc.
  lib/              # deckUtils, archetype, stats, achievements, api-utils, admin
  types/
```

## Commandes

- `npm run dev` -- dev server (Turbopack, port 3000)
- `npm run build` -- build production (`next build --webpack`, requis par serwist)
- `npm run lint` -- ESLint
- `npm run test` -- Vitest
- `npm run type-check` -- tsc --noEmit
- `npm run db:generate` -- Generer une migration Drizzle (dossier `drizzle/`)
- `npm run db:migrate` -- Migrations Drizzle

## Donnees

369 cartes, 19 decks (16 categories + 3 thematiques).
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
- Ne pas repasser `npm run build` sur Turbopack tant que serwist n'est pas migre (`@serwist/turbopack` ou mode configurator) : `public/sw.js` ne serait plus genere

## Variables d'environnement

Voir `.env.example`. Notables : `DATABASE_URL` (optionnelle), `AUTH_SECRET`, OAuth Google/GitHub, `ADMIN_EMAILS` (emails admin separes par des virgules, insensible a la casse ; vide = personne), `ANALYTICS_SECRET` (acces programmatique aux routes analytics admin).
