# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-07

---

## Sprints termines (3-27) -- 165 items

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
| 27     | Accents & Tooltips (200+ accents, createPortal tooltips, share)    | 5     |

---

## Audit Mars 2026 -- Resultats consolides

### CRITIQUE (a faire en priorite)

| Ref    | Composant      | Description                                                          |
| ------ | -------------- | -------------------------------------------------------------------- |
| SEC-09 | next.config.ts | CSP: retirer `unsafe-inline` et `unsafe-eval` (XSS mitigation nulle) |

### HAUTE PRIORITE

| Ref     | Composant                 | Description                                                  |
| ------- | ------------------------- | ------------------------------------------------------------ |
| SEC-10  | api/og/route.tsx          | Valider params numeriques (keepPercent, cutPercent) avec Zod |
| SEC-11  | api/ranking, community... | Rate limiting manquant sur endpoints publics GET (DoS)       |
| SEC-12  | api/analytics/dashboard   | Verifier ANALYTICS_SECRET toujours set (bypass si absent)    |
| SEC-13  | api/me/profile            | Contrainte UNIQUE username manquante en DB                   |
| PERF-01 | AcronymText.tsx           | Regex recree a chaque render -> useMemo                      |

### MOYENNE PRIORITE

| Ref     | Composant         | Description                                                         |
| ------- | ----------------- | ------------------------------------------------------------------- |
| SEC-14  | Rate limit Map    | Nettoyage entries anciennes (risque memory leak si >10k IPs)        |
| SEC-15  | api/waitlist      | Email regex trop permissive -> z.string().email()                   |
| SEC-16  | profil/layout.tsx | Valider archetypeId vs liste connue avant rendu metadata            |
| PERF-02 | ResultScreen.tsx  | RadarChart dynamic import sans loading fallback -> Skeleton         |
| PERF-03 | auth.ts           | Log warning si OAuth providers non configures                       |
| A11Y-02 | Global            | Audit contrastes : rehausser muted text, amber/blue sur fond sombre |

### BASSE PRIORITE

| Ref     | Composant             | Description                                            |
| ------- | --------------------- | ------------------------------------------------------ |
| PERF-04 | analytics.ts          | localStorage setItem sans try/catch QuotaExceededError |
| PERF-05 | jeu/[deckId]/page.tsx | console.error/warn en production -> gater par NODE_ENV |
| PERF-06 | profil/page.tsx       | Image OAuth sans prop `sizes="44px"`                   |
| SEC-17  | auth.ts               | Cleanup old sessions (>30j) pour privacy               |

---

## Items deferes

| Ref     | Description                                                |
| ------- | ---------------------------------------------------------- |
| TEST-06 | Tests E2E Playwright : flow complet swipe -> results       |
| RGPD-04 | Cookie consent banner (pas requis, analytics sans cookies) |
| SEC-07  | CSRF tokens (deja protege par NextAuth + CORS same-origin) |
| PWA-06  | Background sync (Periodic Sync API, support limite)        |

---

## Post-MVP / V2

| Item                  | Effort | Ref    | Description                                           |
| --------------------- | ------ | ------ | ----------------------------------------------------- |
| Mode Duel (2 joueurs) | L      | UX-31  | Swipe simultane + comparaison resultats (WebSocket)   |
| Rate limiting Redis   | M      | SEC-08 | Remplacer Map in-memory par Redis (scalabilite)       |
| Monitoring erreurs    | S      | ERR-04 | Integration Sentry ou equivalent                      |
| API ouverte           | L      | API-03 | Endpoints publics documentees pour reutilisation data |
