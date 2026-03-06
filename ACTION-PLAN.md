# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-06

---

## Sprints termines (3-19) -- 98 items

| Sprint | Objectif | Items |
|--------|----------|-------|
| 3-9 | Core game, auth, community, 330 cartes | 38 |
| 10 | Refacto data (split decks.json) | 1 |
| 11 | Hotfixes critiques (store atomique, archetypes, guards) | 10 |
| 12 | Securite (headers, Zod, rate limiting, error boundaries) | 8 |
| 13 | Accessibilite WCAG 2.1 AA (clavier, focus, reduced motion) | 9 |
| 14 | Contenu & progression (badges, achievements, localStorage v2) | 6 |
| 15 | Performance & DX (lazy load, RSC, favicon, tutoriel) | 7 |
| 16 | DB & migrations (9 index, connection pool, Drizzle migrations) | 3 |
| 17 | Communaute donnees reelles + 5 bugfixes | 9 |
| 18 | Sync multi-device + Analytics self-hosted + fix liens infos | 8 |
| 19 | SEO-03 OG dynamique profil + UX-30 Leaderboard vitesse | 2 |

---

## Audit consolide (2026-03-06) -- 15 agents specialises

### Score global par domaine

| Domaine | Score | Critiques | Hautes | Moyennes | Basses |
|---------|-------|-----------|--------|----------|--------|
| TypeScript Quality | A+ | 0 | 0 | 0 | 1 |
| State Management (Zustand) | B+ | 0 | 2 | 1 | 4 |
| Architecture Code | B+ | 0 | 2 | 3 | 2 |
| Game Logic & Data | B | 1 | 1 | 2 | 3 |
| Database & API | B | 0 | 2 | 3 | 2 |
| UI/UX & Mobile | B | 0 | 2 | 8 | 5 |
| Auth & User Flow | B | 0 | 0 | 5 | 3 |
| Error Handling | B | 0 | 3 | 5 | 3 |
| PWA & Offline | B- | 0 | 2 | 5 | 5 |
| Securite | C+ | 1 | 2 | 6 | 3 |
| SEO & Metadata | C | 3 | 2 | 3 | 2 |
| Accessibilite WCAG | C | 3 | 5 | 4 | 2 |
| Performance & Bundle | C | 2 | 3 | 5 | 1 |
| Testing & CI/CD | D | 3 | 1 | 2 | 0 |
| Analytics & Tracking | D+ | 2 | 3 | 2 | 0 |

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

## Sprint 20 -- Conformite & Qualite (CRITIQUE)

**Objectif :** Corriger les bloquants legaux, securite et qualite de base.

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| TEST-01 | P0 | M | Setup Vitest + Testing Library + scripts npm (test, test:coverage) |
| TEST-02 | P0 | M | CI GitHub Actions : lint + type-check + build + test + docker-build |
| TEST-03 | P0 | S | Husky + lint-staged (pre-commit: eslint, pre-push: tsc --noEmit) |
| RGPD-01 | P0 | S | Anonymiser IP (dernier octet) + supprimer User-Agent brut dans analytics |
| RGPD-02 | P0 | S | Page /privacy ou section dans /infos (politique de confidentialite) |
| RGPD-03 | P0 | XS | Data retention : cron/endpoint pour purger analytics_events > 90 jours |
| SEO-04 | P0 | XS | robots.txt : Allow + sitemap decommente ; layout robots: index true |
| SEO-05 | P0 | S | Sitemap dynamique (sitemap.ts) incluant les 17 decks |
| PERF-01 | P0 | XS | Supprimer deps inutilisees : radix-ui, @vercel/og, @use-gesture/react |
| BUG-01 | P0 | XS | Fix archetype fallback (retourner archetype du bon niveau) |

**Total Sprint 20 : 10 items**

---

## Sprint 21 -- Securite & SEO (HAUTE)

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| SEC-01 | P1 | XS | Ajouter AUTH_SECRET explicite dans config NextAuth |
| SEC-02 | P1 | S | Dashboard analytics : proteger via NextAuth (role admin) au lieu du secret |
| SEC-03 | P1 | S | CSP header dans next.config.ts |
| SEC-04 | P1 | XS | Filtrer bots dans /api/analytics (user-agent blocklist) |
| SEC-05 | P1 | S | Upgrader next-auth vers v5 stable (sortir du beta.30) |
| SEO-06 | P1 | S | URLs canoniques sur toutes les pages |
| SEO-07 | P1 | M | JSON-LD structured data (Organization + WebApplication) |
| DB-01 | P1 | XS | INNER JOIN -> LEFT JOIN dans /api/ranking et /api/ranking/speed |
| DB-02 | P1 | XS | sessions.userId : ajouter onDelete cascade |
| DB-03 | P1 | XS | Ajouter statement_timeout (30s) au pool postgres |

**Total Sprint 21 : 10 items**

---

## Sprint 22 -- Accessibilite & UX (HAUTE)

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| A11Y-01 | P1 | XS | Skip navigation link sur toutes les pages avec BottomNav |
| A11Y-02 | P1 | S | Audit contrastes : rehausser muted text, verifier amber/blue sur fond sombre |
| A11Y-03 | P1 | XS | aria-label sur toggles Mode aleatoire / Mode Budget |
| A11Y-04 | P1 | XS | aria-hidden sur emojis decoratifs (ResultScreen, SwipeStack, ranking) |
| A11Y-05 | P1 | XS | aria-label sur boutons budget target (5, 10, 15, 20, 30) |
| A11Y-06 | P1 | XS | Share button : aria-label au lieu de title (ResultScreen) |
| A11Y-07 | P1 | S | Reduced motion : CardDetail + ResultScreen confettis |
| UX-32 | P2 | S | Skeletons loading : play page, ranking page (remplacer "Chargement...") |
| UX-33 | P2 | XS | Reset store dans handleQuitSession avant navigation |
| UX-34 | P2 | S | Error boundaries par route (/profile, /ranking, /jeu/[deckId]) |

**Total Sprint 22 : 10 items**

---

## Sprint 23 -- Performance & Architecture (MOYENNE)

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| PERF-02 | P2 | M | Homepage hybride : extraire deck grid en Server Component |
| PERF-03 | P2 | S | Lazy-load RadarChart + dynamic import cards par deckId |
| PERF-04 | P2 | XS | will-change: transform sur SwipeCard + CardDetail drag |
| PERF-05 | P2 | XS | next.config optimizePackageImports (framer-motion, lucide-react) |
| ARCH-01 | P2 | M | Splitter ResultScreen.tsx (613 LOC -> ResultStats + ArchetypeDisplay + ShareButton) |
| ARCH-02 | P2 | S | Extraire api-utils.ts (withAuth, withRateLimit, withDbCheck) |
| ARCH-03 | P2 | XS | Barrel exports pour /hooks et /lib |
| ARCH-04 | P2 | XS | Supprimer dead code : recordVote() et nextCard() du store |
| ARCH-05 | P2 | XS | useShallow dans ResultScreen et useArchetype (coherence) |
| ARCH-06 | P2 | XS | Mettre a jour README.md (330 cartes, Next.js 15, DB, Auth) |

**Total Sprint 23 : 10 items**

---

## Sprint 24 -- PWA & Resilience (MOYENNE)

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| PWA-01 | P2 | S | Page offline fallback (/offline.tsx + detection navigator.onLine) |
| PWA-02 | P2 | S | Hook useInstallPrompt (beforeinstallprompt + UI bouton installer) |
| PWA-03 | P2 | S | Service worker update notification (toast "nouvelle version") |
| PWA-04 | P2 | XS | viewportFit: cover dans viewport metadata (notch support) |
| PWA-05 | P2 | XS | manifest.json : ajouter screenshots + icons 96/256 |
| ERR-01 | P2 | S | Fetch timeout (AbortController 10s) dans useCommunityStats + useSync |
| ERR-02 | P2 | XS | loading.tsx pour /jeu/[deckId] |
| ERR-03 | P2 | XS | Logging ameliore : error.message dans API catch blocks |
| API-01 | P2 | S | Standardiser format reponse API ({ ok, data } partout) |
| API-02 | P2 | XS | Index analytics_events(ip) pour dashboard unique visitors |

**Total Sprint 24 : 10 items**

---

## Sprint 25 -- Polish & Tests (BASSE)

| Ref | Priorite | Effort | Description |
|-----|----------|--------|-------------|
| TEST-04 | P3 | M | Tests unitaires : archetype.ts, deckUtils.ts, stats.ts, gameStore |
| TEST-05 | P3 | M | Tests API : /api/sessions, /api/ranking, /api/health |
| TEST-06 | P3 | L | Tests E2E Playwright : flow complet swipe -> results |
| RGPD-04 | P3 | S | Cookie consent banner (si exige par juridiction) |
| SEC-06 | P3 | S | Valider cardId format + existence dans /api/sessions |
| SEC-07 | P3 | S | CSRF tokens explicites sur endpoints POST |
| UX-35 | P3 | S | Typo accents dans metadata play/ranking layouts |
| UX-36 | P3 | S | OG images dynamiques pour pages /jeu/[deckId] |
| PWA-06 | P3 | S | Background sync pour sessions offline (Periodic Sync API) |
| DATA-01 | P3 | XS | Ajouter sourceUrl manquants dans france-europe.json (10 cartes) |

**Total Sprint 25 : 10 items**

---

## Post-MVP / V2

| Item | Effort | Ref | Description |
|------|--------|-----|-------------|
| Mode Duel (2 joueurs) | L | UX-31 | Swipe simultane + comparaison resultats (WebSocket) |
| Rate limiting Redis | M | SEC-08 | Remplacer Map in-memory par Redis (scalabilite) |
| Monitoring erreurs | S | ERR-04 | Integration Sentry ou equivalent |
| API ouverte | L | API-03 | Endpoints publics documentees pour reutilisation data |
