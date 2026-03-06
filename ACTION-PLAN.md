# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-07

---

## Sprints termines (3-26) -- 160 items

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
| 22     | Securite & SEO (CSP, auth dashboard, canonical, JSON-LD, DB fixes) | 10    |
| 23     | Accessibilite & UX (skip nav, aria, reduced motion, skeletons)     | 9     |
| 24     | Performance & Architecture (lazy load, split, cleanup, barrel)     | 9     |
| 25     | PWA & Resilience (offline, install, SW update, timeouts, API std)  | 10    |
| 26     | Polish & Tests (75 tests, cardId validation, OG decks, sourceUrls) | 6     |

---

## Audit consolide (2026-03-06) -- 15 agents specialises

### Score global par domaine

| Domaine                    | Score | Critiques | Hautes | Moyennes | Basses |
| -------------------------- | ----- | --------- | ------ | -------- | ------ |
| TypeScript Quality         | A+    | 0         | 0      | 0        | 1      |
| State Management (Zustand) | B+    | 0         | 2      | 1        | 4      |
| Architecture Code          | B+    | 0         | 2      | 3        | 2      |
| Game Logic & Data          | B     | 1         | 1      | 2        | 3      |
| Database & API             | B     | 0         | 2      | 3        | 2      |
| UI/UX & Mobile             | B     | 0         | 2      | 8        | 5      |
| Auth & User Flow           | B     | 0         | 0      | 5        | 3      |
| Error Handling             | B     | 0         | 3      | 5        | 3      |
| PWA & Offline              | B-    | 0         | 2      | 5        | 5      |
| Securite                   | C+    | 1         | 2      | 6        | 3      |
| SEO & Metadata             | C     | 3         | 2      | 3        | 2      |
| Accessibilite WCAG         | C     | 3         | 5      | 4        | 2      |
| Performance & Bundle       | C     | 2         | 3      | 5        | 1      |
| Testing & CI/CD            | D     | 3         | 1      | 2        | 0      |
| Analytics & Tracking       | D+    | 2         | 3      | 2        | 0      |

### Top 10 findings critiques

1. **ZERO tests automatises** -- Aucun framework de test, pas de CI/CD, pas de pre-commit hooks
2. **robots.txt bloque tout indexage** -- `Disallow: /` + `robots: { index: false }` en prod
3. **RGPD non conforme** -- IP/User-Agent stockes sans anonymisation, pas de consentement, pas de politique de confidentialite
4. **3 deps npm inutilisees** -- radix-ui (+100KB), @vercel/og (+300KB), @use-gesture/react (+50KB)
5. **Archetype fallback bug** -- Peut retourner un archetype du mauvais niveau (L1 au lieu de L2/L3)
6. **Contrastes couleur insuffisants** -- Texte muted (#94A3B8) borderline, amber/blue echouent WCAG AA
7. **Pas de skip navigation** -- WCAG 2.4.1 non conforme, pas de lien "Aller au contenu"
8. **Pas de page offline** -- Aucun fallback quand reseau indisponible
9. **Auth analytics faible** -- Dashboard protege par simple secret en query param, sans rate limit
10. **INNER JOIN exclut les anonymes** -- Classements ignorent les joueurs non-connectes

---

## Sprint 20 -- Landing page, SEO & Onboarding (DONE)

**Objectif :** Refonte landing page, ouverture SEO, correction onboarding.

| Ref     | Priorite | Effort | Description                                                                         | Statut |
| ------- | -------- | ------ | ----------------------------------------------------------------------------------- | ------ |
| LP-01   | P1       | S      | Landing ParisTeaser : line break, NicoQuiPaie lien rouge loupe                      | Done   |
| LP-02   | P1       | S      | SourcesSection : liens cliquables \_blank + icone externe sur acronymes             | Done   |
| LP-03   | P1       | S      | EcosystemSection : SVG icons (les-chiffres, le-feed, le-simulateur), centrage cards | Done   |
| LP-04   | P1       | S      | AnimatedNumber : fix SSR (plus de 0), rAF + easeOutCubic, replay periodique         | Done   |
| LP-05   | P1       | S      | CategoriesSection : SVG icons pour 16 categories, pages /categories/[deckId]        | Done   |
| BUG-02  | P0       | S      | Fix deckId mismatch (accents) dans 88 cartes (defense, energie, etat, securite)     | Done   |
| UX-35   | P1       | XS     | Fix accents manquants (ranking, achievements, metadata layouts)                     | Done   |
| SEO-04  | P0       | XS     | robots.txt : Allow + sitemap ; layout robots: index true                            | Done   |
| BUG-03  | P1       | XS     | Fix onboarding non affiche : wiring useOnboarding + Onboarding dans /jeu            | Done   |
| AUTH-01 | P1       | XS     | Google OAuth : activation provider + env variables Coolify                          | Done   |

**Total Sprint 20 : 10 items -- DONE**

---

## Sprint 21 -- Conformite & Qualite (DONE)

**Objectif :** Corriger les bloquants legaux, securite et qualite de base.

| Ref     | Priorite | Effort | Description                                                              | Statut      |
| ------- | -------- | ------ | ------------------------------------------------------------------------ | ----------- |
| TEST-01 | P0       | M      | Setup Vitest + Testing Library + scripts npm (test, test:coverage)       | Done        |
| TEST-02 | P0       | M      | CI GitHub Actions : lint + type-check + build + test + docker-build      | Done        |
| TEST-03 | P0       | S      | Husky + lint-staged (pre-commit: eslint, pre-push: tsc --noEmit)         | Done        |
| RGPD-01 | P0       | S      | Anonymiser IP (dernier octet) + supprimer User-Agent brut dans analytics | Done (deja) |
| RGPD-02 | P0       | S      | Page /infos/confidentialite (politique de confidentialite)               | Done        |
| RGPD-03 | P0       | XS     | Data retention : endpoint /api/analytics/purge (90 jours)                | Done        |
| SEO-05  | P0       | S      | Sitemap dynamique (sitemap.ts) incluant les 17 decks                     | Done        |
| PERF-01 | P0       | XS     | Deps inutilisees : deja absentes du package.json                         | Done        |
| BUG-01  | P0       | XS     | Fix archetype fallback (retourner archetype du bon niveau)               | Done        |

**Total Sprint 21 : 9 items -- DONE**

---

## Sprint 22 -- Securite & SEO (DONE)

| Ref    | Priorite | Effort | Description                                                     | Statut |
| ------ | -------- | ------ | --------------------------------------------------------------- | ------ |
| SEC-01 | P1       | XS     | AUTH_SECRET explicite dans config NextAuth                      | Done   |
| SEC-02 | P1       | S      | Dashboard analytics : protege via NextAuth + layout server-side | Done   |
| SEC-03 | P1       | S      | CSP header dans next.config.ts                                  | Done   |
| SEC-04 | P1       | XS     | Filtrer bots dans /api/analytics (user-agent blocklist)         | Done   |
| SEC-05 | P1       | S      | next-auth : deja sur derniere beta (pas de stable v5)           | Done   |
| SEO-06 | P1       | S      | URLs canoniques sur toutes les pages (7 routes)                 | Done   |
| SEO-07 | P1       | M      | JSON-LD structured data (Organization + WebApplication)         | Done   |
| DB-01  | P1       | XS     | LEFT JOIN dans /api/ranking et /api/ranking/speed               | Done   |
| DB-02  | P1       | XS     | sessions.userId : onDelete cascade                              | Done   |
| DB-03  | P1       | XS     | statement_timeout (30s) au pool postgres                        | Done   |

**Total Sprint 22 : 10 items -- DONE**

---

## Sprint 23 -- Accessibilite & UX (DONE)

**Objectif :** A11Y essentiels, skeletons, error boundaries, store cleanup.

| Ref     | Priorite | Effort | Description                                                                  | Statut  |
| ------- | -------- | ------ | ---------------------------------------------------------------------------- | ------- |
| A11Y-01 | P1       | XS     | Skip navigation link sur toutes les pages avec BottomNav                     | Done    |
| A11Y-02 | P1       | S      | Audit contrastes : rehausser muted text, verifier amber/blue sur fond sombre | Deferre |
| A11Y-03 | P1       | XS     | aria-label sur toggles Mode aleatoire / Mode Budget                          | Done    |
| A11Y-04 | P1       | XS     | aria-hidden sur emojis decoratifs (ResultScreen, SwipeStack, ranking)        | Done    |
| A11Y-05 | P1       | XS     | aria-label sur boutons budget target (5, 10, 15, 20, 30)                     | Done    |
| A11Y-06 | P1       | XS     | Share button : aria-label au lieu de title (ResultScreen)                    | Done    |
| A11Y-07 | P1       | S      | Reduced motion : CardDetail + ResultScreen confettis                         | Done    |
| UX-32   | P2       | S      | Skeletons loading : play page (remplacer "Chargement...")                    | Done    |
| UX-33   | P2       | XS     | Reset store dans handleQuitSession avant navigation                          | Done    |
| UX-34   | P2       | S      | Error boundaries par route (/profile, /ranking, /jeu)                        | Done    |

**Total Sprint 23 : 9 items done, 1 deferre -- DONE**

---

## Sprint 24 -- Performance & Architecture (DONE)

| Ref     | Priorite | Effort | Description                                                                          | Statut  |
| ------- | -------- | ------ | ------------------------------------------------------------------------------------ | ------- |
| PERF-02 | P2       | XS     | CategoriesSection : suppression "use client" inutile (Server Component)              | Done    |
| PERF-03 | P2       | S      | Lazy-load RadarChart via next/dynamic (ResultScreen + ranking)                       | Done    |
| PERF-04 | P2       | XS     | will-change-transform sur SwipeCard + CardDetail drag                                | Done    |
| PERF-05 | P2       | XS     | optimizePackageImports (incompatible Turbopack)                                      | Skipped |
| ARCH-01 | P2       | M      | Splitter ResultScreen.tsx (615 -> 428 LOC, StatBar, AuditReport, ShareIcon extraits) | Done    |
| ARCH-02 | P2       | S      | Extraire api-utils.ts (dbUnavailableResponse, jsonOk, jsonError)                     | Done    |
| ARCH-03 | P2       | XS     | Barrel exports pour /hooks et /lib                                                   | Done    |
| ARCH-04 | P2       | XS     | Supprimer dead code : recordVote() et nextCard() du store                            | Done    |
| ARCH-05 | P2       | XS     | useShallow : deja optimal dans ResultScreen et useArchetype                          | Done    |
| ARCH-06 | P2       | XS     | Mettre a jour README.md (330 cartes, Next.js 15, DB, Auth)                           | Done    |

**Total Sprint 24 : 9 done, 1 skipped -- DONE**

---

## Sprint 25 -- PWA & Resilience (DONE)

| Ref    | Priorite | Effort | Description                                                            | Statut |
| ------ | -------- | ------ | ---------------------------------------------------------------------- | ------ |
| PWA-01 | P2       | S      | Page offline fallback (/offline + SW navigation fallback)              | Done   |
| PWA-02 | P2       | S      | Hook useInstallPrompt (beforeinstallprompt + canInstall/promptInstall) | Done   |
| PWA-03 | P2       | S      | Service worker update notification (SwUpdateToast)                     | Done   |
| PWA-04 | P2       | XS     | viewportFit: cover dans viewport metadata (notch support)              | Done   |
| PWA-05 | P2       | XS     | manifest.json : icons 96/256 + screenshots                             | Done   |
| ERR-01 | P2       | S      | Fetch timeout (AbortController 10s) dans useCommunityStats + useSync   | Done   |
| ERR-02 | P2       | XS     | loading.tsx pour /jeu/[deckId]                                         | Done   |
| ERR-03 | P2       | XS     | Logging ameliore : error.message dans API catch blocks                 | Done   |
| API-01 | P2       | S      | Standardiser format reponse API (jsonOk/jsonError/withDbCheck)         | Done   |
| API-02 | P2       | XS     | Index analytics_events(ip) pour dashboard unique visitors              | Done   |

**Total Sprint 25 : 10 items -- DONE**

---

## Sprint 26 -- Polish & Tests (DONE)

| Ref     | Priorite | Effort | Description                                                         | Statut  |
| ------- | -------- | ------ | ------------------------------------------------------------------- | ------- |
| TEST-04 | P3       | M      | Tests unitaires : archetype, deckUtils, stats, gameStore (66 tests) | Done    |
| TEST-05 | P3       | M      | Tests API : /api/health, /api/sessions, /api/ranking (6 tests)      | Done    |
| TEST-06 | P3       | L      | Tests E2E Playwright : flow complet swipe -> results                | Deferre |
| RGPD-04 | P3       | S      | Cookie consent banner (pas requis, analytics sans cookies)          | Deferre |
| SEC-06  | P3       | S      | Valider cardId format (regex) dans /api/sessions                    | Done    |
| SEC-07  | P3       | S      | CSRF tokens (deja protege par NextAuth + CORS same-origin)          | Deferre |
| UX-36   | P3       | S      | OG images dynamiques pour pages /jeu/[deckId]                       | Done    |
| PWA-06  | P3       | S      | Background sync (Periodic Sync API, support limite)                 | Deferre |
| DATA-01 | P3       | XS     | sourceUrl ajoutes dans france-europe.json (10 cartes)               | Done    |

**Total Sprint 26 : 5 done, 4 deferes -- DONE**

---

## Post-MVP / V2

| Item                  | Effort | Ref    | Description                                           |
| --------------------- | ------ | ------ | ----------------------------------------------------- |
| Mode Duel (2 joueurs) | L      | UX-31  | Swipe simultane + comparaison resultats (WebSocket)   |
| Rate limiting Redis   | M      | SEC-08 | Remplacer Map in-memory par Redis (scalabilite)       |
| Monitoring erreurs    | S      | ERR-04 | Integration Sentry ou equivalent                      |
| API ouverte           | L      | API-03 | Endpoints publics documentees pour reutilisation data |
