# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-07

---

## Etat du projet

| Metrique              | Valeur                                                  |
| --------------------- | ------------------------------------------------------- |
| Cartes                | 370 (19 fichiers JSON)                                  |
| Decks                 | 19 (16 categories + 3 thematiques)                      |
| Archetypes            | 16 (6 L1 + 6 L2 + 4 L3)                                 |
| Badges categorie      | 19 (1 par deck)                                         |
| Achievements generaux | 12                                                      |
| Tests                 | 86 (Vitest + Testing Library)                           |
| Coverage              | >60% (v8, scope: lib/stores/hooks)                      |
| Sprints               | 28 (187 items completes)                                |
| Items audit restants  | 11 (0 critique, 0 haute, 3 moyenne, 4 basse, 4 deferes) |

---

## Sprints termines (3-28) -- 187 items

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

---

## Backlog -- Reste a faire

### Priorite moyenne (3 items)

| Ref     | Composant           | Description                                                         | Effort |
| ------- | ------------------- | ------------------------------------------------------------------- | ------ |
| A11Y-02 | Global              | Audit contrastes : rehausser muted text, amber/blue sur fond sombre | M      |
| ARCH-01 | classement/page.tsx | 676 lignes -> extraire LeaderboardTable, SpeedRanking               | M      |
| ARCH-02 | profil/page.tsx     | 602 lignes -> extraire AchievementsGrid, StatsSection               | M      |

### Priorite basse (4 items)

| Ref     | Composant             | Description                                            | Effort |
| ------- | --------------------- | ------------------------------------------------------ | ------ |
| PERF-04 | analytics.ts          | localStorage setItem sans try/catch QuotaExceededError | S      |
| PERF-05 | jeu/[deckId]/page.tsx | console.error/warn en production -> gater par NODE_ENV | S      |
| SEC-17  | auth.ts               | Cleanup old sessions (>30j) pour privacy               | S      |
| SEO-05  | jeu/[deckId]/page.tsx | Metadata specifique par deck (titre deck dans title)   | S      |

### Deferes (pas necessaires a court terme)

| Ref     | Description                                          | Raison                              |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| TEST-06 | Tests E2E Playwright : flow complet swipe -> results | Attendre stabilisation produit      |
| RGPD-04 | Cookie consent banner                                | Pas requis (analytics sans cookies) |
| SEC-07  | CSRF tokens                                          | Deja protege (NextAuth + CORS)      |
| PWA-06  | Background sync (Periodic Sync API)                  | Support navigateur limite           |

### Post-MVP / V2

| Item                  | Effort | Description                                           |
| --------------------- | ------ | ----------------------------------------------------- |
| Mode Duel (2 joueurs) | L      | Swipe simultane + comparaison resultats (WebSocket)   |
| Rate limiting Redis   | M      | Remplacer Map in-memory par Redis (scalabilite)       |
| Monitoring erreurs    | S      | Integration Sentry ou equivalent                      |
| API ouverte           | L      | Endpoints publics documentees pour reutilisation data |
| NextAuth stable       | S      | Migrer vers NextAuth v5 stable quand disponible       |

---

## Audit Mars 2026 -- Resume

Audit initial (Sprint 11) : **109 findings** (11 critiques, 27 hautes, 43 moyennes, 28 basses).
Etat actuel (Sprint 28) : **98 resolus**, 11 restants.

Detail complet dans [AUDIT-REPORT.md](AUDIT-REPORT.md).

### FAIT (Sprint 28 -- audit + bugfixes)

| Ref/Bug     | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| ~~SEC-09~~  | CSP: retire `unsafe-eval`                                     |
| ~~SEC-10~~  | OG route: validation+clamp params numeriques                  |
| ~~SEC-11~~  | Rate limiting centralise sur endpoints publics GET            |
| ~~SEC-12~~  | Analytics dashboard: timingSafeEqual                          |
| ~~SEC-13~~  | Username UNIQUE verifie en schema                             |
| ~~SEC-14~~  | Rate limit Map: nettoyage auto entries >5min                  |
| ~~SEC-15~~  | Waitlist: Zod z.string().email()                              |
| ~~SEC-16~~  | profil/layout: validation archetypeId                         |
| ~~PERF-01~~ | AcronymText: regex memoize avec useMemo                       |
| ~~PERF-02~~ | RadarChart: loading skeleton sur dynamic import               |
| ~~PERF-03~~ | auth.ts: warning console si OAuth providers absents           |
| ~~TEST-07~~ | 11 tests UI (SwipeCard, CardDetail, StatBar, AuditReport)     |
| ~~TEST-08~~ | CI: coverage v8 seuil 60%                                     |
| ~~TEST-09~~ | sessions.test: isolation + gameStore reset                    |
| ~~PERF-06~~ | Image OAuth alt + sizes="44px" (Sprint 27)                    |
| ~~BUG~~     | Page securite vide (deckId accent mismatch)                   |
| ~~BUG~~     | Unicode `Co\u00FBt` dans pages categories                     |
| ~~BUG~~     | Audit L3 back button reset session (SwipeStack unmount)       |
| ~~BUG~~     | Audit L3 pas de bouton fermer                                 |
| ~~BUG~~     | Audit L3 scrollbar visible                                    |
| ~~BUG~~     | Audit L3 emojis casses (surrogate pairs unicode)              |
| ~~BUG~~     | Mobile scroll vers bouton Lancer (scrollTo -> scrollIntoView) |
