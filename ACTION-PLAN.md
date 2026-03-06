# Plan d'Action Priorise -- La Tronconneuse de Poche

**Date :** 2026-03-05
**Base sur :** Audit consolide 6 agents (11 critiques, 27 hautes, 43 moyennes, 28 basses)

---

## Sprints 3-9 -- TERMINES

Voir historique dans git log. 38 items livres.

## Sprint 10 -- Refacto Data TERMINE

| # | Item | Effort | Statut |
|---|------|--------|--------|
| 1 | Splitter decks.json en fichiers par categorie | M | Done |

---

## Sprint 11 -- Hotfixes Critiques (PROCHAIN)

**Objectif :** Corriger les 11 findings critiques de l'audit. Stabilite et fiabilite du jeu.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Guard `completeSession` si `session.completed` | XS | BUG-11 | Done |
| 2 | Fusionner recordVote+nextCard en `voteAndAdvance()` atomique | S | BUG-12 | Done |
| 3 | Selectors Zustand avec `useShallow` (SwipeStack + SwipeSession) | S | BUG-13 | Done |
| 4 | Deplacer startSession dans useEffect | XS | BUG-14 | Done |
| 5 | Guard isAnimating pour empecher double-swipe | XS | BUG-15 | Done |
| 6 | Retirer credentials docker-compose + restreindre port PG | S | BACK-07 | Done |
| 7 | Budget mode : inclure unjustified dans totalCut (ResultScreen + stats) | S | BUG-18 | Done |
| 8 | Audit L3 Back : deplacer recordVote dans handleAuditSubmit | S | BUG-19 | Done |
| 9 | Elargir plages archetypes N1 (couvrir gap 60-80%) + 2 nouveaux archetypes | S | BUG-22 | Done |
| 10 | Fix session callback NextAuth pour mode JWT | XS | BUG-20 | Done |

**Livrable :** 16 archetypes (6 L1 + 6 L2 + 4 L3). Store atomique. 0 critique restant.

---

## Sprint 12 -- Securite & Robustesse

**Objectif :** Securiser les API, ajouter les protections web standard.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Headers de securite dans next.config.ts | S | BACK-08 | Done |
| 2 | Validation payload Zod sur POST /api/sessions | M | BACK-09 | Done |
| 3 | Rate limiting API (in-memory, 10 req/min) | M | BACK-10 | Done |
| 4 | Valider + clamper param level server-side | XS | BUG-16 | Done |
| 5 | Valider deckId server-side, notFound() si invalide | XS | BUG-17 | Done |
| 6 | Error.tsx + global-error.tsx + not-found.tsx + loading.tsx | S | BACK-13 | Done |
| 7 | Error responses coherentes (503/500) sur toutes les API | S | BACK-15 | Done |
| 8 | Healthcheck endpoint /api/health | XS | BACK-14 | Done |

**Livrable :** 6 headers securite, validation Zod, rate limiting, 4 error pages, healthcheck.

---

## Sprint 13 -- Accessibilite WCAG 2.1 AA

**Objectif :** Rendre le jeu accessible clavier, screen reader, reduced motion.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Navigation clavier (fleches) pour le swipe | S | UX-17 | Done |
| 2 | Focus-visible rings sur tous les boutons | S | UX-21 | Done |
| 3 | prefers-reduced-motion (framer-motion + CSS) | S | UX-20 | Done |
| 4 | Focus trap + Escape sur CardDetail (bottom sheet) | S | UX-18 | Done |
| 5 | Retirer userScalable: false | XS | UX-19 | Done |
| 6 | Touch targets 44px minimum (detail, quitter, avatar) | XS | UX-22 | Done |
| 7 | aria-label sur boutons Level 2 | XS | UX-24 | Done |
| 8 | aria-hidden sur icones SVG decoratives | XS | UX-25 | Done |
| 9 | Confirmation avant quitter session | S | UX-23 | Done |

**Livrable :** Keyboard nav, focus trap, reduced motion, 44px targets, aria-labels, quit confirm.

---

## Sprint 14 -- Contenu & Progression

**Objectif :** Completer les badges et achievements, ameliorer la rejouabilite.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | 6 badges categorie manquants (agriculture -> emploi) | S | UX-26 | Done |
| 2 | 4 achievements manquants (Speedrunner, Expert, Millionnaire, Collectionneur) | S | UX-27 | Done |
| 3 | Fix quasi-doublon san-04/san-13 | XS | BUG-21 | Done |
| 4 | Ajouter subtitle/source/level dans validateData | S | TECH-07 | Done |
| 5 | Schema versioning localStorage + migration | S | TECH-08 | Done |
| 6 | generateMetadata sur 4 pages client (titres distincts) | S | SEO-04 | Done |

**Livrable :** 14 badges categorie, 12 achievements generaux, localStorage v2, metadata pages.

---

## Sprint 15 -- Performance & DX

**Objectif :** Optimiser le bundle, ameliorer l'architecture.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Lazy load framer-motion sur homepage (next/dynamic) | M | TECH-10 | Done |
| 2 | Convertir /infos en RSC (supprimer "use client") | S | TECH-09 | Done |
| 3 | Index DB sur colonnes requetees | S | BACK-11 | Done Sprint 16 |
| 4 | Connection pooling PostgreSQL | S | BACK-12 | Done Sprint 16 |
| 5 | pb-safe sur BottomNav et footers (iOS) | XS | UX-29 | Done |
| 6 | Re-acces au tutoriel depuis Infos/Profil | XS | UX-28 | Done |
| 7 | Ajouter favicon.ico | XS | SEO-05 | Done |

**Livrable :** SlideToPlay lazy-loaded, /infos RSC, pb-safe iOS, tutoriel replay, favicon.

---

## Sprint 16 -- DB & Migrations

**Objectif :** Index DB, connection pooling, migrations Drizzle trackees.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Index DB sur colonnes requetees (9 index) | S | BACK-11 | Done |
| 2 | Connection pooling PostgreSQL (max 10, idle 20s) | S | BACK-12 | Done |
| 3 | Drizzle migrations tracees (drizzle/ + migrate.ts) | S | TECH-11 | Done |

**Livrable :** 9 index DB, connection pool configure, migration initiale generee.

---

## Post-MVP / V2

| Item | Effort | Ref |
|------|--------|-----|
| Mode Duel (2 joueurs) | L | UX-31 |
| Sync multi-device | L | BACK-04 |
| Leaderboard vitesse | M | UX-30 |
| API ouverte / export CSV | M | BACK-05 |
| Analytics Plausible/PostHog | L | BACK-06 |
| Metadata profil joueur | XS | SEO-03 |

---

## KPIs de Suivi

| Metrique | Sprint 9 | Sprint 11 (cible) | Sprint 13 (cible) |
|----------|----------|-------------------|-------------------|
| Bugs critiques | 11 | 0 | 0 |
| Bugs hautes | 27 | < 10 | < 5 |
| Cartes | 330 | 330 | 330 |
| Archetypes | 14 | 14 (gaps corriges) | 14 |
| WCAG violations | 11 | 11 | 0 (9 corriges Sprint 13) |
| Headers securite | 0 | 6 | 6+ |
| Error boundaries | 0 | 4 | 4 |
| Rate limiting | Non | Oui | Oui |
