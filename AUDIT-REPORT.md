# Rapport d'Audit Consolide -- La Tronconneuse de Poche

**Date :** 2026-03-07
**Version :** Post-Sprint 28 (187 items completes)
**Build :** OK (Next.js 15 + serwist, compile sans erreur)
**Donnees :** 370 cartes, 19 decks, 0 anomalies structurelles
**Auth :** NextAuth.js v5 (Google + GitHub), trustHost: true
**Tests :** 86 tests (Vitest + Testing Library), coverage >60%
**Audit :** Revue complete mars 2026

---

## 1. Resume Executif

| Categorie | Initial (Sprint 11) | Corriges (Sprints 12-28) | Restants |
| --------- | ------------------- | ------------------------ | -------- |
| Critique  | 11                  | 11                       | 0        |
| Haute     | 27                  | 27                       | 0        |
| Moyenne   | 43                  | 36                       | 7        |
| Basse     | 28                  | 24                       | 4        |
| **Total** | **109**             | **98**                   | **11**   |

**Taux de resolution :** 90%
**Items critiques/hauts restants :** 0

---

## 2. Items Critiques -- Tous Resolus

| ID      | Description                                       | Sprint | Resolution                                          |
| ------- | ------------------------------------------------- | ------ | --------------------------------------------------- |
| CRIT-01 | Double completeSession() possible                 | 11     | Guard `if (session.completed) return`               |
| CRIT-02 | Race condition recordVote/nextCard non atomique   | 11     | `voteAndAdvance()` atomique dans le store           |
| CRIT-03 | useGameStore() sans selector (re-renders massifs) | 11     | `useShallow` sur tous les composants                |
| CRIT-04 | Aucun support clavier pour le swipe               | 13     | `useKeyboardSwipe` (fleches, Espace, Echap)         |
| CRIT-05 | Aucun focus-visible sur elements interactifs      | 13     | `focus-visible:ring-2` global                       |
| CRIT-06 | prefers-reduced-motion ignore                     | 13     | `useReducedMotion()` framer-motion + CSS            |
| CRIT-07 | Aucun rate limiting API                           | 12+28  | `rateLimit()` centralise, 30 req/min/IP             |
| CRIT-08 | Credentials PostgreSQL en dur                     | 12     | `.env` non committe + Coolify env vars              |
| CRIT-09 | Race condition localStorage                       | 14     | Schema versioning v2 + migration system             |
| CRIT-10 | Gap ~40% dans les archetypes N1                   | 11     | 16 archetypes (6 L1 + 6 L2 + 4 L3), plages elargies |
| CRIT-11 | Port PostgreSQL expose sur toutes interfaces      | 12     | Restreint a 127.0.0.1 via Coolify                   |

---

## 3. Items Hauts -- Tous Resolus

| ID   | Description                              | Sprint |
| ---- | ---------------------------------------- | ------ |
| H-01 | Double swipe (pas de guard animation)    | 11     |
| H-02 | dragConstraints incorrects L1            | 11     |
| H-03 | MotionValues non reinitialisees          | 11     |
| H-04 | startSession dans le render              | 11     |
| H-05 | Cast non verifie localStorage            | 14     |
| H-06 | Pas de schema versioning localStorage    | 14     |
| H-07 | validateData incomplete                  | 11     |
| H-08 | costPerCitizen non verifie               | 11     |
| H-09 | Param level non valide server-side       | 12     |
| H-10 | Aucun error.tsx                          | 22     |
| H-11 | userScalable: false bloque zoom          | 13     |
| H-12 | CardDetail sans focus trap ni Escape     | 13     |
| H-13 | Boutons L2 sans aria-label               | 13     |
| H-14 | AcronymText tooltip non accessible       | 27     |
| H-15 | Touch targets < 44px                     | 23     |
| H-16 | Pas de loading state page de jeu         | 15     |
| H-17 | Pas de confirmation quitter session      | 23     |
| H-18 | Validation incomplete POST /api/sessions | 12     |
| H-19 | ID session client-generated              | 12     |
| H-20 | Aucun header securite (CSP)              | 22     |
| H-21 | Pas de middleware auth                   | 22     |
| H-22 | Session callback incompatible JWT        | 22     |
| H-23 | Aucun index DB                           | 16     |
| H-24 | Pas de connection pooling                | 16     |
| H-25 | Budget mode incoherent                   | 11     |
| H-26 | Audit L3 Back button bloque              | 28     |
| H-27 | Erreurs DB masquees en 200 OK            | 25     |

---

## 4. Securite -- Etat Actuel

### Corriges (Sprints 12, 22, 28)

| Ref    | Description                                 | Resolution                                        |
| ------ | ------------------------------------------- | ------------------------------------------------- |
| SEC-09 | CSP contenait `unsafe-eval`                 | Retire, `unsafe-inline` conserve (requis Next.js) |
| SEC-10 | OG route params non valides                 | parseInt + clamp (0-100 / 0-999)                  |
| SEC-11 | Endpoints publics sans rate limiting        | `rateLimit()` dans api-utils.ts, 5 routes         |
| SEC-12 | Analytics: comparaison secret non constante | `timingSafeEqual` + warning si absent             |
| SEC-13 | Username UNIQUE non garanti                 | Verifie: contrainte deja presente                 |
| SEC-14 | Rate limit Map: fuite memoire               | Nettoyage auto toutes les 5 min                   |
| SEC-15 | Waitlist email: regex permissive            | `z.string().email()` (Zod)                        |
| SEC-16 | profil metadata: archetypeId non valide     | Validation + fallback "equilibriste"              |

### Posture securite actuelle

- **CSP** : `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
- **Rate limiting** : 30 req/min par IP par endpoint, nettoyage entries >5min
- **Validation** : Zod sur toutes les entrees API
- **Auth** : NextAuth v5 beta, trustHost, CSRF same-origin
- **Headers** : X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **DB** : 9 indexes, connection pooling, graceful degradation

### Restants

| Ref    | Priorite | Description                        |
| ------ | -------- | ---------------------------------- |
| SEC-17 | Basse    | Cleanup sessions >30j pour privacy |
| SEC-08 | Post-MVP | Rate limiting Redis (scalabilite)  |

---

## 5. Performance -- Etat Actuel

### Corriges

| Ref     | Description                               | Resolution                           |
| ------- | ----------------------------------------- | ------------------------------------ |
| PERF-01 | AcronymText regex recree a chaque render  | `useMemo` + reset `lastIndex`        |
| PERF-02 | RadarChart pas de loading state           | Skeleton `animate-pulse` sur dynamic |
| PERF-03 | auth.ts erreur silencieuse sans providers | Warning console au demarrage         |
| PERF-06 | Image OAuth alt+sizes manquants           | alt + `sizes="44px"`                 |

### Restants

| Ref     | Priorite | Description                                            |
| ------- | -------- | ------------------------------------------------------ |
| PERF-04 | Basse    | localStorage setItem sans try/catch QuotaExceededError |
| PERF-05 | Basse    | console.error/warn en production                       |

---

## 6. Tests -- Etat Actuel

- **86 tests** (Vitest + Testing Library)
- **Coverage v8** avec seuil 60% lines+functions (scope: src/lib, src/stores, src/hooks)
- **CI** : GitHub Actions (lint + type-check + build + test --coverage + docker)

### Corriges

| Ref     | Description                         | Resolution                                             |
| ------- | ----------------------------------- | ------------------------------------------------------ |
| TEST-07 | Pas de tests UI composants          | 11 tests (SwipeCard, CardDetail, StatBar, AuditReport) |
| TEST-08 | Pas de seuil couverture CI          | Coverage v8, seuil 60%, CI integre                     |
| TEST-09 | sessions.test isolation defaillante | `vi.resetModules()` + helpers partages                 |

### Restants

| Ref     | Priorite | Description                         |
| ------- | -------- | ----------------------------------- |
| TEST-06 | Defere   | Tests E2E Playwright (flow complet) |

---

## 7. Architecture -- Items Restants

| Ref     | Fichier             | Lignes | Recommandation                          |
| ------- | ------------------- | ------ | --------------------------------------- |
| ARCH-01 | classement/page.tsx | 676    | Extraire LeaderboardTable, SpeedRanking |
| ARCH-02 | profil/page.tsx     | 602    | Extraire AchievementsGrid, StatsSection |

---

## 8. Accessibilite -- Etat Actuel

### Implemente (WCAG 2.1 AA)

- Skip navigation link
- Keyboard navigation complete (fleches, Espace, Echap)
- Focus trap dans modales (CardDetail, AuditScreen)
- `prefers-reduced-motion` respecte (framer-motion + CSS)
- `aria-hidden` sur elements decoratifs (icones, emojis)
- `min-h-[44px]` sur tous les elements interactifs
- Tooltips acronymes via portail (`createPortal`, 170+ acronymes)
- `pb-safe` sur BottomNav et footers pour iOS safe area

### Restant

| Ref     | Priorite | Description                                                   |
| ------- | -------- | ------------------------------------------------------------- |
| A11Y-02 | Moyenne  | Audit contrastes: rehausser muted text, amber/blue sur sombre |

---

## 9. Bugs Corriges (Sprint 28)

| Bug                             | Cause                                          | Correction                                   |
| ------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| Page securite vide              | deckId accent mismatch (securite vs securite)  | Corrige deckId dans securite.json            |
| Cout moyen unicode categories   | `Co\u00FBt` escape dans le source              | Remplace par caractere direct                |
| Audit back button reset session | SwipeStack demonte puis remonte (startSession) | SwipeStack reste monte, masque avec `hidden` |
| Audit pas de bouton fermer      | Manquant dans le design                        | Bouton X en haut a droite                    |
| Audit scrollbar visible         | Pas de scrollbar-hide                          | `scrollbar-hide` sur conteneur principal     |
| Audit emojis casses             | Surrogate pairs unicode en JSX                 | Caracteres emoji directs                     |
| Mobile scroll vers Lancer       | `scrollTo()` pas fiable sur mobile             | `scrollIntoView()` sur ancre + `setTimeout`  |

---

## 10. Conformite Fonctionnelle

| Feature                       | Status     | Qualite |
| ----------------------------- | ---------- | ------- |
| 16 archetypes (6+6+4)         | Implemente | A       |
| 370 cartes / 19 decks         | Implemente | A       |
| Gameplay L1/L2/L3             | Implemente | A       |
| Onboarding 3 ecrans           | Implemente | A       |
| Partage social + OG dynamique | Implemente | A       |
| Mode Budget Contraint         | Implemente | A       |
| Infobulles acronymes (170+)   | Implemente | A       |
| Profil 3 onglets + avatar     | Implemente | A       |
| Radar communautaire           | Implemente | A       |
| Auth OAuth (Google + GitHub)  | Implemente | A       |
| 19 badges categorie (1/deck)  | Implemente | A       |
| 12 achievements generaux      | Implemente | A       |
| Sync multi-device             | Implemente | A       |
| PWA offline + install         | Implemente | A       |
| Progression niveaux           | Implemente | A       |
| SEO (sitemap, OG, JSON-LD)    | Implemente | A       |
| Mode Duel                     | Non prevu  | -       |

---

## 11. Sante Technique

| Aspect             | Status                  |
| ------------------ | ----------------------- |
| Build production   | OK                      |
| TypeScript strict  | OK (0 any)              |
| Docker multi-stage | OK (non-root)           |
| PWA manifest + SW  | OK (serwist)            |
| Mobile responsive  | OK (375px first)        |
| Dark theme         | OK                      |
| Accessibilite      | Bonne (1 item moyen)    |
| Headers securite   | OK (CSP, X-Frame)       |
| Error boundaries   | OK (3 routes)           |
| Rate limiting      | OK (in-memory)          |
| Tests              | 86 tests, CI integre    |
| Coverage           | >60% (lib/stores/hooks) |

---

## 12. Recommandations

1. **ARCH-01/02** : Decomposer classement (676L) et profil (602L) en sous-composants
2. **A11Y-02** : Audit contrastes WCAG AA sur fond sombre
3. **PERF-04/05** : Guard localStorage QuotaExceeded + gater console.\* par NODE_ENV
4. **SEC-17** : Nettoyage sessions anciennes (>30j)
5. **TEST-06** : Tests E2E Playwright quand le produit se stabilise
6. **SEO-05** : Metadata specifique par deck

---

_Rapport genere le 2026-03-07 -- Sprints 3 a 28, 187 items completes_
