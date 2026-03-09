# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-08 (Sprint 35)

---

## Etat du projet

| Metrique              | Valeur                                                          |
| --------------------- | --------------------------------------------------------------- |
| Cartes                | 369 (19 fichiers JSON)                                          |
| Decks                 | 19 (16 categories + 3 thematiques)                              |
| Archetypes            | 16 (6 L1 + 6 L2 + 4 L3)                                         |
| Badges categorie      | 19 (1 par deck)                                                 |
| Achievements generaux | 12                                                              |
| Tests                 | 273 unit + 8 E2E (Vitest + Playwright)                          |
| Coverage              | 87% lines (v8, scope: lib/stores/hooks/data)                    |
| Sprints               | 35 (305 items completes)                                        |
| Audits multi-agents   | 2 (Sprint 30 + Sprint 34)                                       |
| Pages                 | /jeu, /profil, /classement, /categories, /contribuer, /a-propos |

---

## Sprints termines (3-35) -- 305 items

<details>
<summary>Historique complet (cliquer pour deployer)</summary>

| Sprint | Objectif                                                           | Items |
| ------ | ------------------------------------------------------------------ | ----- |
| 3-9    | Core game, auth, community, 330 cartes                             | 38    |
| 10     | Refacto data (split decks.json)                                    | 1     |
| 11     | Hotfixes critiques (store atomique, archetypes, guards)            | 10    |
| 12     | Securite (headers, Zod, rate limiting, error boundaries)           | 8     |
| 13     | Accessibilite WCAG 2.1 AA (clavier, focus, reduced motion)         | 9     |
| 14     | Contenu & progression (badges, achievements, localStorage v2)      | 6     |
| 15     | Performance & DX (lazy load, RSC, favicon, tutoriel)               | 7     |
| 16     | DB & migrations (9 index, connection pool, Drizzle migrations)     | 3     |
| 17     | Communaute donnees reelles + 5 bugfixes                            | 9     |
| 18     | Sync multi-device + Analytics self-hosted + fix liens infos        | 8     |
| 19     | SEO-03 OG dynamique profil + UX-30 Leaderboard vitesse             | 2     |
| 20     | Landing page polish, SEO ouverture, onboarding fix                 | 10    |
| 21     | Conformite & Qualite (RGPD, tests, CI, sitemap, archetype fix)     | 9     |
| 22     | Securite & SEO (CSP, auth dashboard, canonical, JSON-LD, DB)       | 10    |
| 23     | Accessibilite & UX (skip nav, aria, reduced motion, skeletons)     | 9     |
| 24     | Performance & Architecture (lazy load, split, cleanup, barrel)     | 9     |
| 25     | PWA & Resilience (offline, install, SW update, timeouts, API std)  | 10    |
| 26     | Polish & Tests (75 tests, cardId validation, OG decks, sources)    | 6     |
| 27     | Accents & Tooltips (200+ accents, createPortal tooltips, share)    | 5     |
| 28     | Audit secu/perf/tests + 7 bugfixes                                 | 22    |
| 29     | Refacto archi + perf/secu/seo backlog + fix CI                     | 6     |
| 30     | Tests E2E Playwright + audit multi-agents 15 domaines              | 4     |
| 31     | Sprint P0+P1: securite, a11y, perf, DB, tests, CI, UX              | 36    |
| 31b    | Coverage 75% + 123 tests lib/hooks + E2E L2/L3                     | 4     |
| 32     | P2 batch: a11y, UX, landing RSC, SEO, DB, deps, tests              | 17    |
| 33     | P2 finalise: CI, CSS, PWA, state, tests + L2 UX overhaul           | 23    |
| 34     | Audit multi-agents #2: accents, SEO, a11y, perf, code quality      | 23    |
| 35     | PERF-16 LazyMotion, a11y, /contribuer, xl: breakpoints, commitlint | 8     |

</details>

---

## Audit Sprint 34 -- Items resolus (23 items)

<details>
<summary>Detail (cliquer pour deployer)</summary>

### P0 (2/2 resolus)

| Ref          | Description                                         | Statut |
| ------------ | --------------------------------------------------- | ------ |
| ~~DATA-01~~  | 24 accents corriges dans 8 fichiers cartes JSON     | Fait   |
| ~~ROBOT-01~~ | robots.txt: Disallow /api/, /pixee-admin/, /offline | Fait   |

### P1 (14/14 resolus)

| Ref         | Description                                                         | Statut  |
| ----------- | ------------------------------------------------------------------- | ------- |
| ~~DATA-02~~ | Verification accents post-correction                                | Fait    |
| ~~SEO-12~~  | Metadata offline/layout.tsx (noindex) + verification 5 autres pages | Fait    |
| ~~SEO-13~~  | pixee-admin/layout.tsx: metadata robots noindex                     | Fait    |
| ~~SEO-14~~  | openGraph/twitter sur layouts jeu, classement, infos                | Fait    |
| ~~SEO-15~~  | sitemap.ts: /a-propos ajoute                                        | Fait    |
| ~~SEO-16~~  | Canonical URL /infos/confidentialite                                | Fait    |
| ~~SEO-17~~  | JsonLd.tsx: BreadcrumbList schema                                   | Fait    |
| ~~A11Y-13~~ | ParisTeaser: aria-label input email                                 | Fait    |
| ~~A11Y-14~~ | jeu/page.tsx: aria-label bouton retour + aria-hidden                | Fait    |
| ~~A11Y-15~~ | CardDetail: emojis deja aria-hidden (faux positif)                  | Deja OK |
| ~~A11Y-16~~ | AnimatedNumber: useReducedMotion (skip animation + replay)          | Fait    |
| ~~A11Y-17~~ | jeu/page.tsx: checkbox invisible -> sr-only                         | Fait    |
| ~~TS-01~~   | getCardsByDeck.ts: any[] -> Record<string,unknown>[] + cast         | Fait    |
| ~~HTML-01~~ | jeu/page.tsx + classement/page.tsx: div -> semantic main            | Fait    |

### P2 Perf + SEO (7/7 resolus)

| Ref         | Description                                                      | Statut |
| ----------- | ---------------------------------------------------------------- | ------ |
| ~~PERF-12~~ | NavbarLanding: priority sur image France logo (LCP)              | Fait   |
| ~~PERF-13~~ | CategoriesSection: memo() sur CategoryCard                       | Fait   |
| ~~PERF-14~~ | jeu/page.tsx: useCallback handleLevelClick + handleLaunch        | Fait   |
| ~~PERF-15~~ | AnimatedNumber: fix dependency cycle (isInView retire des deps)  | Fait   |
| ~~SEO-18~~  | jeu/page.tsx: h2 -> h1 (heading hierarchy)                       | Fait   |
| ~~SEO-19~~  | JsonLd.tsx: VideoGame schema ajoute                              | Fait   |
| ~~HTML-02~~ | Landing page: semantic main wrapper                              | Fait   |
| ~~PERF-16~~ | framer-motion: m.div + LazyMotion (Hero, HowItWorks, Onboarding) | Fait   |
| ~~A11Y-02~~ | Audit contrastes: muted-foreground passe AA (4.52-4.62:1)        | OK     |
| ~~A11Y-11~~ | Focus ring: contraste OK (9.5:1 light, 5.5:1 dark)               | OK     |
| ~~A11Y-12~~ | Input border: --input non utilise dans le codebase               | N/A    |
| ~~A11Y-18~~ | ResultScreen + AuditScreen: aria-live, aria-pressed, role=radio  | Fait   |

</details>

---

## Backlog restant

### P2 -- Moyenne priorite (1 item)

| Ref   | Domaine | Description                                        | Effort |
| ----- | ------- | -------------------------------------------------- | ------ |
| CI-02 | Infra   | CI: pusher Docker image vers ghcr.io sur push main | S      |

### P3 -- Basse priorite (5 items)

| Ref    | Description                                   | Effort |
| ------ | --------------------------------------------- | ------ |
| SEC-25 | CSP: retirer blob: de img-src si non utilise  | XS     |
| SEO-10 | Ajouter hreflang (mineur, site monolingue FR) | XS     |
| PWA-09 | Manifest: ajouter screenshot mobile (narrow)  | XS     |
| PWA-10 | Customiser runtimeCaching explicitement       | S      |
| CI-10  | CI: notifications Slack/email sur failure     | S      |

---

## Deferes (ne pas traiter a court terme)

| Ref     | Description                         | Raison                                  |
| ------- | ----------------------------------- | --------------------------------------- |
| RGPD-04 | Cookie consent banner               | Pas requis (analytics sans cookies)     |
| SEC-07  | CSRF tokens                         | Deja protege (NextAuth + CORS)          |
| PWA-06  | Background sync (Periodic Sync API) | Support navigateur limite               |
| DB-05   | Backup PostgreSQL (pg_dump cron)    | BDD quasi vide, serveur en daily backup |

---

## Post-MVP / V2

| Item                  | Effort | Description                                           |
| --------------------- | ------ | ----------------------------------------------------- |
| Mode Duel (2 joueurs) | L      | Swipe simultane + comparaison resultats (WebSocket)   |
| Rate limiting Redis   | M      | Remplacer Map in-memory par Redis (scalabilite)       |
| API ouverte           | L      | Endpoints publics documentees pour reutilisation data |
| CSP nonce-based       | M      | Remplacer unsafe-inline par nonces per-request        |
| Read replica DB       | L      | PostgreSQL read replica pour queries classement       |

---

## Historique audits

**Audit initial (Sprint 11) :** 109 findings -- 108 resolus.
**Audit multi-agents #1 (Sprint 30) :** 136 findings sur 15 domaines -- 80 resolus Sprints 31-33.
**Audit multi-agents #2 (Sprint 34) :** 55 findings sur 5 domaines -- 23 resolus Sprint 34.

---

_Rapport genere le 2026-03-08 -- 35 sprints, 305 items completes. Backlog: 1 P2 + 5 P3 = 6 items restants._
