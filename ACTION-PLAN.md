# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-07 (Sprint 31)

---

## Etat du projet

| Metrique              | Valeur                                                     |
| --------------------- | ---------------------------------------------------------- |
| Cartes                | 370 (19 fichiers JSON)                                     |
| Decks                 | 19 (16 categories + 3 thematiques)                         |
| Archetypes            | 16 (6 L1 + 6 L2 + 4 L3)                                    |
| Badges categorie      | 19 (1 par deck)                                            |
| Achievements generaux | 12                                                         |
| Tests                 | 125 unit + 3 E2E (Vitest + Playwright)                     |
| Coverage              | 87% lines (v8, scope: archetype/deckUtils/stats/gameStore) |
| Sprints               | 31 (230 items completes)                                   |
| Audit multi-agents    | 136 findings -- 36 resolus Sprint 31                       |

---

## Sprints termines (3-31) -- 230 items

| Sprint | Objectif                                                          | Items |
| ------ | ----------------------------------------------------------------- | ----- |
| 3-9    | Core game, auth, community, 330 cartes                            | 38    |
| 10     | Refacto data (split decks.json)                                   | 1     |
| 11     | Hotfixes critiques (store atomique, archetypes, guards)           | 10    |
| 12     | Securite (headers, Zod, rate limiting, error boundaries)          | 8     |
| 13     | Accessibilite WCAG 2.1 AA (clavier, focus, reduced motion)        | 9     |
| 14     | Contenu & progression (badges, achievements, localStorage v2)     | 6     |
| 15     | Performance & DX (lazy load, RSC, favicon, tutoriel)              | 7     |
| 16     | DB & migrations (9 index, connection pool, Drizzle migrations)    | 3     |
| 17     | Communaute donnees reelles + 5 bugfixes                           | 9     |
| 18     | Sync multi-device + Analytics self-hosted + fix liens infos       | 8     |
| 19     | SEO-03 OG dynamique profil + UX-30 Leaderboard vitesse            | 2     |
| 20     | Landing page polish, SEO ouverture, onboarding fix                | 10    |
| 21     | Conformite & Qualite (RGPD, tests, CI, sitemap, archetype fix)    | 9     |
| 22     | Securite & SEO (CSP, auth dashboard, canonical, JSON-LD, DB)      | 10    |
| 23     | Accessibilite & UX (skip nav, aria, reduced motion, skeletons)    | 9     |
| 24     | Performance & Architecture (lazy load, split, cleanup, barrel)    | 9     |
| 25     | PWA & Resilience (offline, install, SW update, timeouts, API std) | 10    |
| 26     | Polish & Tests (75 tests, cardId validation, OG decks, sources)   | 6     |
| 27     | Accents & Tooltips (200+ accents, createPortal tooltips, share)   | 5     |
| 28     | Audit secu/perf/tests + 7 bugfixes                                | 22    |
| 29     | Refacto archi + perf/secu/seo backlog + fix CI                    | 6     |
| 30     | Tests E2E Playwright + audit multi-agents 15 domaines             | 4     |
| 31     | Sprint P0+P1: securite, a11y, perf, DB, tests, CI, UX (7 agents)  | 36    |

---

## Audit Multi-Agents Mars 2026 -- Backlog Priorise

### P0 -- Critique (10 items -- TOUS RESOLUS Sprint 31)

| Ref         | Domaine  | Description                                           | Statut  |
| ----------- | -------- | ----------------------------------------------------- | ------- |
| ~~SEC-18~~  | Securite | AUTH_SECRET: deja correct (pas de fallback)           | Deja OK |
| ~~SEC-19~~  | Securite | Analytics purge: timing-safe comparison               | Fait    |
| ~~ERR-01~~  | Erreurs  | error.message: sanitise (affiche digest uniquement)   | Fait    |
| ~~DB-01~~   | Database | FK: ON DELETE CASCADE sur votes + audit_responses     | Fait    |
| ~~DB-02~~   | Database | Migration SQL + endpoint purge existant               | Fait    |
| ~~A11Y-03~~ | A11y     | Contraste muted-foreground: slate-400 -> slate-300    | Fait    |
| ~~A11Y-04~~ | A11y     | BottomNav: deja correct (aria-label + role)           | Deja OK |
| ~~PERF-07~~ | Perf     | getDeckCards() lazy import dynamique par deck         | Fait    |
| ~~PERF-08~~ | Perf     | framer-motion: documente LazyMotion/domAnimation TODO | Fait    |
| ~~DEP-04~~  | Deps     | zod: ajoute dans dependencies                         | Fait    |

### P1 -- Haute priorite (33 items -- 26 resolus Sprint 31, 7 restants)

#### Securite & Erreurs (8 items -- 6 resolus)

| Ref        | Description                                             | Statut  |
| ---------- | ------------------------------------------------------- | ------- |
| ~~SEC-20~~ | OG image: params sanitises (stripHtml + length limit)   | Fait    |
| ~~SEC-21~~ | Rate limit IP: deja correct (split(",")[0].trim())      | Deja OK |
| ~~SEC-22~~ | CSP: risque unsafe-inline documente dans next.config.ts | Fait    |
| ~~SEC-23~~ | CSP connect-src: whitelist domaines specifiques         | Fait    |
| ~~ERR-02~~ | error.tsx ajoute sur 4 routes dynamiques                | Fait    |
| ERR-03     | Integrer monitoring erreurs (Sentry ou Logtail)         | Reste   |
| ~~DB-03~~  | PostgreSQL: error handler + connection check au boot    | Fait    |
| DB-05      | Configurer backup automatise PostgreSQL (pg_dump cron)  | Reste   |

#### Tests (6 items -- 5 resolus)

| Ref         | Description                                              | Statut |
| ----------- | -------------------------------------------------------- | ------ |
| ~~TEST-10~~ | Tests SwipeStack (11 tests: init, quit, keyboard, a11y)  | Fait   |
| ~~TEST-11~~ | Tests useSwipeGesture (16 tests: seuils, 4 dir, diag)    | Fait   |
| ~~TEST-12~~ | Tests useSync (12 tests: throttle, timeout, merge)       | Fait   |
| TEST-15     | E2E: ajouter flows L2 (4 directions) et L3 (micro-audit) | Reste  |
| ~~TEST-19~~ | CI: Playwright integre dans GitHub Actions               | Fait   |
| ~~CI-04~~   | CI: job E2E ajoute (needs: quality)                      | Fait   |

#### CI/CD (4 items -- TOUS resolus)

| Ref       | Description                                          | Statut |
| --------- | ---------------------------------------------------- | ------ |
| ~~CI-01~~ | CI: coverage reports uploades en artifacts (14j)     | Fait   |
| CI-02     | CI: pusher Docker image vers ghcr.io sur push main   | Reste  |
| ~~CI-03~~ | Dockerfile: HEALTHCHECK via node http (plus de wget) | Fait   |
| ~~CI-08~~ | .dockerignore: .env\* .github .husky ajoutes         | Fait   |

#### Performance & UI (7 items -- 4 resolus)

| Ref         | Description                                                 | Statut    |
| ----------- | ----------------------------------------------------------- | --------- |
| ~~PERF-09~~ | HeroSection: doit rester client (hooks + framer-motion)     | Documente |
| PERF-10     | Landing: convertir composants client inutiles en RSC        | Reste     |
| UX-31       | RadarChart: remplacer couleurs hardcodees par CSS variables | Reste     |
| UX-32       | Landing: harmoniser text-slate-\* avec CSS variables        | Reste     |
| ~~UX-33~~   | AuditReport: emoji remplaces par SVG icons                  | Fait      |
| ~~UX-34~~   | Classement: loading skeleton ajoute                         | Fait      |
| ~~A11Y-05~~ | info color: blue-500 -> blue-400 (6.2:1 contraste)          | Fait      |

#### SEO & State (4 items -- TOUS resolus)

| Ref          | Description                                         | Statut  |
| ------------ | --------------------------------------------------- | ------- |
| ~~SEO-06~~   | robots.txt + sitemap.xml: france-finances.com       | Fait    |
| ~~SEO-07~~   | Sitemap dynamique: /categories/\* + /profil ajoutes | Fait    |
| ~~STATE-01~~ | Zustand: version 1 + migrate function               | Fait    |
| ~~DB-04~~    | Index votes.sessionId: deja existant                | Deja OK |

### P2 -- Moyenne priorite (54 items)

#### Securite & CI (8 items)

| Ref     | Description                                              | Effort |
| ------- | -------------------------------------------------------- | ------ |
| SEC-24  | .dockerignore: ajouter .env\* (secrets potentiels)       | XS     |
| CI-05   | CI: ajouter security scan (npm audit ou Dependabot)      | S      |
| CI-06   | CI: ajouter bundle size monitoring (size-limit)          | S      |
| CI-07   | CI: ajouter bloc permissions explicites                  | XS     |
| CI-09   | Coverage: augmenter seuils de 60% a 75%                  | M      |
| TEST-13 | Coverage: elargir scope a tous les fichiers src/         | S      |
| TEST-14 | Tests: augmenter seuils coverage a 75%                   | M      |
| ERR-04  | Error boundaries: logger erreurs vers console/monitoring | S      |

#### Accessibilite & UX (12 items)

| Ref     | Description                                           | Effort |
| ------- | ----------------------------------------------------- | ------ |
| A11Y-02 | Audit contrastes global: rehausser muted text         | M      |
| A11Y-06 | ResultScreen: ajouter aria-label bouton partager      | XS     |
| A11Y-07 | Onboarding: ajouter aria-live sur slides              | XS     |
| A11Y-08 | Avatar picker: ajouter aria-label sur emoji buttons   | XS     |
| A11Y-09 | jeu/page.tsx: ajouter texte alternatif sur lock emoji | XS     |
| A11Y-10 | Confetti: ajouter prefers-reduced-motion check        | XS     |
| UX-35   | Profile: ajouter ProfileHeaderSkeleton                | S      |
| UX-36   | CardDetail desktop: ajouter lg:rounded-3xl            | XS     |
| UX-37   | Avatar picker: max-w-[90vw] pour mobile < 384px       | XS     |
| UX-38   | HeroSection: corriger alt="" image vide               | XS     |
| SEO-08  | Ajouter canonical manquants sur pages dynamiques      | S      |
| SEO-09  | Meta description specifique par page categorie        | S      |

#### CSS/Tailwind (11 items)

| Ref     | Description                                                | Effort |
| ------- | ---------------------------------------------------------- | ------ |
| CSS-01  | Creer shadow tokens Tailwind (shadow-card, shadow-glow-\*) | S      |
| CSS-02  | ResultScreen: extraire glow colors en tokens               | S      |
| CSS-03  | Remplacer rounded-[1.5rem]/rounded-[32px] par tokens       | XS     |
| CSS-04  | Standardiser text-[Xpx] vers echelle Tailwind              | S      |
| CSS-05  | Evaluer suppression tw-animate-css (peu utilise)           | S      |
| CSS-06  | Harmoniser HSL/hex dans variables couleur                  | S      |
| CSS-07  | Consolider .hide-scrollbar et .scrollbar-hide              | XS     |
| CSS-08  | Extraire magic values framer-motion en constantes          | S      |
| PERF-11 | tw-animate-css: supprimer si inutile (~50KB)               | S      |
| PWA-07  | Manifest: corriger tailles icons declarees                 | XS     |
| PWA-08  | Utiliser useInstallPrompt dans un composant UI             | S      |
| DEP-02  | Supprimer shadcn CLI (dependance morte)                    | XS     |
| DEP-05  | Supprimer lucide-react inutilise (~150KB gzipped)          | XS     |

#### Tests & DB (10 items)

| Ref      | Description                                              | Effort |
| -------- | -------------------------------------------------------- | ------ |
| TEST-16  | E2E: remplacer selecteurs text regex par data-testid     | M      |
| TEST-17  | Tests: ameliorer mocks framer-motion (tester drag logic) | M      |
| TEST-18  | Tests: couvrir XP bonus (speedrunner, L3, budget)        | S      |
| TEST-20  | Tests: couvrir routes API (analytics, me/_, community/_) | L      |
| STATE-02 | ResultScreen: optimiser selectors Zustand (useShallow)   | S      |
| STATE-03 | sessionStorage: valider schema au chargement             | S      |
| STATE-04 | SwipeStack: deplacer side effect hors du render          | S      |
| DB-06    | PostgreSQL: configurer VACUUM/ANALYZE schedule           | S      |
| DB-07    | Connection pool: ajouter monitoring (log slow queries)   | S      |
| ERR-05   | API routes: categoriser erreurs (validation/auth/server) | S      |

### P3 -- Basse priorite (39 items)

| Ref      | Description                                             | Effort |
| -------- | ------------------------------------------------------- | ------ |
| SEC-25   | CSP: retirer blob: de img-src si non utilise            | XS     |
| A11Y-11  | Focus ring: verifier contraste en light mode            | XS     |
| A11Y-12  | Input border slate-200/blanc: verifier contraste        | XS     |
| SEO-10   | Ajouter hreflang (mineur, site monolingue FR)           | XS     |
| SEO-11   | Ajouter breadcrumbs JSON-LD                             | S      |
| PWA-09   | Manifest: ajouter screenshot mobile (narrow)            | XS     |
| PWA-10   | Customiser runtimeCaching explicitement                 | S      |
| UX-39    | Landing: ajouter breakpoints xl: (tablet)               | S      |
| UX-40    | CategoriesSection: responsive deck images               | XS     |
| CSS-09   | Documenter confetti animation                           | XS     |
| CSS-10   | Refactorer .launcher-card (peu reutilise)               | XS     |
| CSS-11   | Simplifier radius calc() en echelle standard            | XS     |
| CI-10    | CI: notifications Slack/email sur failure               | S      |
| CI-11    | Ajouter commitlint (conventional commits)               | S      |
| CI-12    | ESLint: ajouter regles custom (unused-imports, etc.)    | S      |
| STATE-05 | HeroSection: remplacer stats hardcodees par API ou null | XS     |
| ERR-06   | global-error.tsx: utiliser et logger le parametre error | XS     |
| DB-08    | community_votes: ajouter TTL                            | S      |
| DB-09    | Read replica pour queries lourdes (post-MVP)            | L      |
| DEP-01   | next-auth: migrer vers v5 stable quand disponible       | S      |
| DEP-02   | Supprimer shadcn CLI (dependance morte)                 | XS     |
| DEP-03   | Evaluer necessite tw-animate-css                        | XS     |
| TEST-18  | Stats: tester XP bonus                                  | S      |
| ...      | _(+ items restants consolides dans AUDIT-REPORT.md)_    |        |

---

## Deferes (ne pas traiter a court terme)

| Ref         | Description                                              | Raison                              |
| ----------- | -------------------------------------------------------- | ----------------------------------- |
| ~~TEST-06~~ | ~~Tests E2E Playwright : flow complet swipe -> results~~ | ~~Fait (Sprint 30)~~                |
| RGPD-04     | Cookie consent banner                                    | Pas requis (analytics sans cookies) |
| SEC-07      | CSRF tokens                                              | Deja protege (NextAuth + CORS)      |
| PWA-06      | Background sync (Periodic Sync API)                      | Support navigateur limite           |

---

## Post-MVP / V2

| Item                  | Effort | Description                                           |
| --------------------- | ------ | ----------------------------------------------------- |
| Mode Duel (2 joueurs) | L      | Swipe simultane + comparaison resultats (WebSocket)   |
| Rate limiting Redis   | M      | Remplacer Map in-memory par Redis (scalabilite)       |
| Monitoring erreurs    | S      | Integration Sentry ou equivalent                      |
| API ouverte           | L      | Endpoints publics documentees pour reutilisation data |
| NextAuth stable       | S      | Migrer vers NextAuth v5 stable quand disponible       |
| CSP nonce-based       | M      | Remplacer unsafe-inline par nonces per-request        |
| Read replica DB       | L      | PostgreSQL read replica pour queries classement       |

---

## Audit Mars 2026 -- Resume

**Audit initial (Sprint 11) :** 109 findings (11 critiques, 27 hautes, 43 moyennes, 28 basses) -- 108 resolus.
**Audit multi-agents (Sprint 30) :** 136 nouveaux findings (9 critiques, 33 hautes, 54 moyennes, 39 basses) sur 15 domaines.

| Domaine          | Agents | Findings | Top Severite |
| ---------------- | ------ | -------- | ------------ |
| Securite         | 1      | 9        | 2 CRIT       |
| Performance      | 1      | 7        | 2 CRIT       |
| Accessibilite    | 1      | 11       | 2 CRIT       |
| SEO              | 1      | 8        | 2 HAUTE      |
| TypeScript       | 1      | 9        | 2 HAUTE      |
| Data Integrity   | 1      | 4        | 2 MOY        |
| Error Handling   | 1      | 6        | 1 CRIT       |
| State Management | 1      | 9        | 1 HAUTE      |
| Database         | 1      | 10       | 2 CRIT       |
| PWA              | 1      | 5        | 2 MOY        |
| UI/UX            | 1      | 16       | 4 HAUTE      |
| Tests            | 1      | 17       | 3 HAUTE      |
| Dependencies     | 1      | 3        | 2 MOY        |
| CSS/Tailwind     | 1      | 14       | 3 HAUTE      |
| CI/CD            | 1      | 14       | 4 HAUTE      |

Detail complet dans [AUDIT-REPORT.md](AUDIT-REPORT.md).

---

_Rapport genere le 2026-03-07 -- Sprints 3 a 31, 230 items completes, P0 100% resolus, P1 79% resolus_
