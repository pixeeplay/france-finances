# CLAUDE.md -- france-finances.com (jeu : Budget Swipe)

## Projet

Mini-jeu mobile-first "Tinder des depenses publiques" — france-finances.com
Le joueur swipe des cartes de depenses budgetaires francaises : gauche = garder, droite = a revoir.
3 niveaux de profondeur : Niv.1 (2 directions), Niv.2 (4 directions), Niv.3 (micro-audit).
Les niveaux se debloquent en jouant (2 sessions N1 -> N2, 2 sessions N2 -> N3, `src/lib/progression.ts`), plus par `?level=`.
A la fin d'une session (10-12 cartes), le joueur obtient un archetype budgetaire (calcule sur les categories et montants coupes) et ses stats.
Apres chaque swipe : retour (avis de la communaute, fait marquant, montant cumule). Mini-quiz « a ton avis, combien ? » avant certains montants.
Modes : deck du jour `/jeu/quotidien` (meme tirage pour tous, seed = date Paris, serie de jours, partage facon Wordle) et defi « Trouve 50 Md€ » (mode budget).
Outils : `/chiffres` (les finances publiques en chiffres) et `/simulateur` (simulateur fiscal IR/cotisations/TVA, 100 % client), portes depuis nos contributions a nicoquipaie.

Repo : https://github.com/pixeeplay/france-finances/
Deploy : france-finances.com (Coolify, Docker, VPS OVH)
DNS : Cloudflare (DNS only, pas de proxy)

## Contenu

- **368 cartes jouables** (+ 9 hors jeu `playable: false`, sans montant officiel) reparties en **19 decks** (16 categories + 3 thematiques), niveaux L1=130, L2=133, L3=105
- **18 archetypes** budgetaires (8 L1, 6 L2, 4 L3) dans `src/data/archetypes.json`
- **19 badges** de categorie + **3 badges** de comprehension (quiz) + **12 achievements** generaux (`src/lib/achievements.ts`)

## Stack technique

- **Framework** : Next.js 16 (App Router, RSC) + React 19
- **UI** : Tailwind CSS 4, composants maison (pas de dossier shadcn/ui ; seuls `components.json` et `cn()` subsistent)
- **Animations** : framer-motion (drag, spring, transforms)
- **State** : Zustand (store de session de jeu)
- **Auth** : NextAuth.js v5 (Google + GitHub), trustHost: true
- **DB** : PostgreSQL + Drizzle ORM (graceful degradation sans DB)
- **PWA** : serwist (service worker, offline fallback). Plugin webpack : le build prod tourne en `next build --webpack`, serwist est desactive en dev (Turbopack)
- **Monitoring** : Sentry (`src/instrumentation.ts` serveur/edge, `src/instrumentation-client.ts` client)
- **Tests** : Vitest + Testing Library (545 tests) + E2E Playwright (14 tests, `e2e/`, `E2E_PROD=1` pour tester un build de prod)
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
- Pas d'emoji d'interface : pictogrammes SVG `CategoryIcon` (par categorie) et `UiIcon` (`src/components/icons/`)
- Formatage des montants : uniquement via `src/lib/format.ts` (`formatBillions`, `formatEuros`, `formatPercent` ; `formatBillionsExact`, `formatRatio`, `formatNumber` pour les tableaux)
- Desktop containment : `lg:h-[900px] lg:max-h-[90vh] lg:rounded-3xl`
- pb-safe sur BottomNav et footers pour iOS safe area
- aria-hidden sur SVGs et emojis decoratifs
- min-h-[44px] sur elements interactifs
- API responses standardisees : jsonOk(), jsonError(), withDbCheck()
- Admin (`/pixee-admin`, `/api/analytics/dashboard`, `/api/analytics/purge`) : controle via `isAdmin(session)` (`src/lib/admin.ts`, env `ADMIN_EMAILS`). Non-admin -> `notFound()` cote page, 401/403 cote API. Toute nouvelle route admin DOIT utiliser ce helper. `src/lib/admin.ts` importe `crypto` : ne pas l'ajouter au barrel `src/lib/index.ts` (importe cote client)

## Direction artistique et design tokens

Identite **coloree et ludique** (retour a l'identite d'avant la refonte, validee par le proprietaire le 2026-10-02 apres le rejet d'une version « data-journalisme » serif et grise jugee « tres triste ») :
gros titres bleu vif en police ronde tres grasse, montants cles en rouge, boutons pleins bleus arrondis, drapeau tricolore dans le logo (« france-finances » + « .com » rouge), une couleur par categorie (`getDeckColor`, `src/lib/deckMeta.ts`) dans des pastilles, pages de donnees avec graphiques (recharts, charge seulement sur `/chiffres`).
Ne jamais revenir a un style gris/serif/monochrome. Montrer des captures avant de deployer un changement visuel.
Pas de degrades de texte criards ni d'ombres neon ; contrastes AA ; contenu desktop aligne sur la largeur du header (`max-w-6xl`), texte courant en `max-w-prose`.

Tokens dans `src/app/globals.css` (`@theme inline`), toujours passer par eux (`bg-background`, `bg-card`, `bg-brand`, `text-brand-fg`, `text-muted-foreground`, `text-primary-foreground`, `text-danger`...), jamais de `slate-*` ou `text-white` en dur sur fond colore (sauf `text-white` sur `bg-brand`).
Theme sombre par defaut (classe `dark` sur `<html>`), theme clair disponible (`localStorage.theme`, `meta theme-color` synchronisee par `src/lib/theme.ts`).

| Token                       | Sombre  | Clair   | Sens                            |
| --------------------------- | ------- | ------- | ------------------------------- |
| `--background`              | #0F172A | #FFFFFF | Fond                            |
| `--card`                    | #1E293B | #F8FAFC | Cartes                          |
| `--foreground`              | #F8FAFC | #0F172A | Texte principal                 |
| `--muted-foreground`        | #CBD5E1 | #475569 | Texte secondaire                |
| `--brand`                   | #0A33B0 | #0A33B0 | Boutons pleins (CTA)            |
| `--brand-fg`                | #5B84FF | #0A33B0 | Titres bleus, liens             |
| `--primary` (`keep`)        | #10B981 | #047857 | Garder / OK                     |
| `--danger` (`cut`)          | #F87171 | #DC2626 | A revoir, montants cles         |
| `--info` (`reinforce`)      | #60A5FA | #2563EB | Renforcer                       |
| `--warning` (`unjustified`) | #F59E0B | #B45309 | Reduire (niveau 2), equivalence |
| `--community`               | #94A3B8 | #64748B | Avis de la communaute           |

Rayon de base `--radius: 0.75rem` (arrondis genereux : `rounded-2xl` / `rounded-3xl` sur cartes et boutons).
En jeu au niveau 2 : « Reduire » en amber, « Injustifie » en rouge (statu quo valide le 2026-10-02).

Polices (`next/font/google`, `src/app/layout.tsx`) :

- Titres et chiffres cles : **Outfit** 700/800/900 (`--ff-display`, classes `font-heading` / `font-serif`, h1-h3 par defaut)
- Texte : **Geist** (`--ff-sans`, `font-sans`)
- Rares usages techniques (sources, tableaux) : Geist Mono (`--ff-mono`, non prechargee)
- Images de partage (OG, `src/lib/og.tsx`) : Outfit embarquee dans `src/assets/fonts` (pas de telechargement Google)
- Utilitaires : `kicker` (surtitre capitales) et `numeral` (chiffres tabulaires)

## Structure des fichiers

```
src/
  app/              # Pages (App Router, route group (game))
    api/            # API routes (health, sessions, ranking, community, me, stats, analytics, og)
    (game)/         # Game pages (jeu, jeu/[deckId] dont jeu/quotidien, profil, classement, resultats, infos, partage)
    chiffres/       # Les finances publiques en chiffres (donnees : src/data/chiffres.ts)
    simulateur/     # Simulateur fiscal (calculs : src/lib/taxCalculator.ts, baremes : src/data/fiscal-2026.ts)
    categories/     # Category pages
    contribuer/     # Contributor guide page
    a-propos/       # About page
    page.tsx        # Landing page (home)
    pixee-admin/    # Dashboard analytics (admins ADMIN_EMAILS uniquement)
    offline/        # Offline fallback
  components/
    landing/        # Landing page components (Hero, Navbar, Footer, Categories, Sources, ToolsSection, etc.)
    icons/          # CategoryIcon, UiIcon (pictogrammes SVG)
    chiffres/       # DataBlocks (/chiffres)
    simulateur/     # Simulator (/simulateur)
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
    archetypes.json # 18 archetypes
    data-check-exceptions.json # Exceptions documentees cout/habitant
    index.ts        # Barrel export
  db/
    schema.ts       # Tables: users, accounts, authSessions, verificationTokens, sessions, votes, communityVotes, analyticsEvents, auditResponses
    index.ts        # Drizzle client + pool
  stores/
    gameStore.ts    # Zustand (voteAndAdvance, useShallow, gameMode budget)
    dailyStore.ts   # Deck du jour (serie, resultats)
  hooks/            # useSwipeGesture, useArchetype, useInstallPrompt, useSync, etc.
  lib/              # deckUtils, archetype, stats, achievements, api-utils, admin, format, progression, daily, budgetChallenge, quiz, sessionFeedback, taxCalculator, theme
  types/
```

## Commandes

- `npm run dev` -- dev server (Turbopack, port 3000)
- `npm run build` -- build production (`next build --webpack`, requis par serwist)
- `npm run lint` -- ESLint
- `npm run test` -- Vitest
- `npm run test:e2e` -- Playwright (`E2E_PROD=1 E2E_PORT=xxxx` apres `npm run build` pour tester le build de prod)
- `npm run type-check` -- tsc --noEmit
- `npm run data:check` -- Controle des cartes (schema Zod, doublons, URL, cout/habitant, niveaux), lance en CI. Regles : `src/data/README.md`
- `npm run db:generate` -- Generer une migration Drizzle (dossier `drizzle/`)
- `npm run db:migrate` -- Migrations Drizzle (manuel ; avant 0002_drop_waitlist, exporter la table waitlist en prod, voir PLAN-REFONTE.md)

## Donnees

368 cartes jouables (+ 9 hors jeu), 19 decks (16 categories + 3 thematiques). Nom du jeu : Budget Swipe ; marque : france-finances.com ; « vous » sur le site, « tu » dans le jeu.
Ne jamais ecrire le nombre de cartes en dur dans le code : utiliser `TOTAL_CARD_COUNT` / `CARDS_AND_CATEGORIES` (`src/lib/deckMeta.ts`).
Donnees factuelles, sourcees, neutres. Pas de ton militant.
Montants en milliards d'euros, cout par habitant base sur 69,1 M habitants (Insee, 1er janvier 2026) : population unique `POPULATION_REFERENCE` (src/lib/cardSchema.ts), reprise par `data:check`, l'accueil et `/chiffres`.
Sources : PLF/LFSS 2025-2026 (PLF/PLFSS 2027 presentes le 1er octobre 2026, pas encore integres), Cour des comptes, Senat, ministeres, vie-publique.fr.
Chaque `sourceUrl` pointe vers un document precis (jamais une page d'accueil), en https et sans domaine accentue.
Champ `level` des cartes : 1 grand poste, 2 dispositif, 3 niche/micro-audit (critere dans `src/data/README.md`).
Champ `kind` des cartes : `depense`, `recette` ou `agregat` (critere et cas limites dans `src/data/README.md`). Seules les depenses comptent dans le deck du jour, le defi 50 Md€, l'archetype et le cumul « tronconne » (`isSpendingCard`, `src/lib/cardKind.ts`). Pas de champ `trend` (evolution non sourcee, retiree).

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
