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

| # | Item | Effort | Ref |
|---|------|--------|-----|
| 1 | Guard `completeSession` si `session.completed` | XS | BUG-11 |
| 2 | Fusionner recordVote+nextCard en `voteAndAdvance()` atomique | S | BUG-12 |
| 3 | Selectors Zustand avec `useShallow` (SwipeStack + SwipeSession) | S | BUG-13 |
| 4 | Deplacer startSession dans useEffect | XS | BUG-14 |
| 5 | Guard isAnimating pour empecher double-swipe | XS | BUG-15 |
| 6 | Retirer credentials docker-compose + restreindre port PG | S | BACK-07 |
| 7 | Budget mode : inclure unjustified dans totalCut (ResultScreen + stats) | S | BUG-18 |
| 8 | Audit L3 Back : deplacer recordVote dans handleAuditSubmit | S | BUG-19 |
| 9 | Elargir plages archetypes N1 (couvrir gap 60-80%) | S | BUG-22 |
| 10 | Fix session callback NextAuth pour mode JWT | XS | BUG-20 |

**Effort total :** ~S-M par item, sprint de 1-2 jours

---

## Sprint 12 -- Securite & Robustesse

**Objectif :** Securiser les API, ajouter les protections web standard.

| # | Item | Effort | Ref |
|---|------|--------|-----|
| 1 | Headers de securite dans next.config.ts | S | BACK-08 |
| 2 | Validation payload Zod sur POST /api/sessions | M | BACK-09 |
| 3 | Rate limiting API (middleware ou upstash) | M | BACK-10 |
| 4 | Valider + clamper param level server-side | XS | BUG-16 |
| 5 | Valider deckId server-side, notFound() si invalide | XS | BUG-17 |
| 6 | Error.tsx + global-error.tsx + not-found.tsx + loading.tsx | S | BACK-13 |
| 7 | Error responses coherentes sur toutes les API routes | S | BACK-15 |
| 8 | Healthcheck conteneur + endpoint /api/health | XS | BACK-14 |

**Effort total :** ~2 jours

---

## Sprint 13 -- Accessibilite WCAG 2.1 AA

**Objectif :** Rendre le jeu accessible clavier, screen reader, reduced motion.

| # | Item | Effort | Ref |
|---|------|--------|-----|
| 1 | Navigation clavier (fleches) pour le swipe | S | UX-17 |
| 2 | Focus-visible rings sur tous les boutons | S | UX-21 |
| 3 | prefers-reduced-motion (framer-motion + CSS) | S | UX-20 |
| 4 | Focus trap + Escape sur CardDetail (bottom sheet) | S | UX-18 |
| 5 | Retirer userScalable: false | XS | UX-19 |
| 6 | Touch targets 44px minimum (detail, quitter, avatar) | XS | UX-22 |
| 7 | aria-label sur boutons Level 2 | XS | UX-24 |
| 8 | aria-hidden sur icones SVG decoratives | XS | UX-25 |
| 9 | Confirmation avant quitter session | S | UX-23 |

**Effort total :** ~2 jours

---

## Sprint 14 -- Contenu & Progression

**Objectif :** Completer les badges et achievements, ameliorer la rejouabilite.

| # | Item | Effort | Ref |
|---|------|--------|-----|
| 1 | 6 badges categorie manquants (agriculture -> emploi) | S | UX-26 |
| 2 | 4 achievements manquants (Speedrunner, Expert, Millionnaire, Collectionneur) | S | UX-27 |
| 3 | Fix quasi-doublon san-04/san-13 | XS | BUG-21 |
| 4 | Ajouter subtitle/source/level dans validateData | S | TECH-07 |
| 5 | Schema versioning localStorage + migration | S | TECH-08 |
| 6 | generateMetadata sur 5 pages client (titres distincts) | S | SEO-04 |

**Effort total :** ~2 jours

---

## Sprint 15 -- Performance & DX

**Objectif :** Optimiser le bundle, ameliorer l'architecture.

| # | Item | Effort | Ref |
|---|------|--------|-----|
| 1 | Lazy load framer-motion sur homepage (next/dynamic) | M | TECH-10 |
| 2 | Convertir /infos en RSC (supprimer "use client") | S | TECH-09 |
| 3 | Index DB sur colonnes requetees | S | BACK-11 |
| 4 | Connection pooling PostgreSQL | S | BACK-12 |
| 5 | pb-safe sur BottomNav et footers (iOS) | XS | UX-29 |
| 6 | Re-acces au tutoriel depuis Infos/Profil | XS | UX-28 |
| 7 | Ajouter favicon.ico | XS | SEO-05 |

**Effort total :** ~1-2 jours

---

## Post-MVP / V2

| Item | Effort | Ref |
|------|--------|-----|
| Mode Duel (2 joueurs) | L | UX-31 |
| Sync multi-device | L | BACK-04 |
| Leaderboard vitesse | M | UX-30 |
| API ouverte / export CSV | M | BACK-05 |
| Analytics Plausible/PostHog | L | BACK-06 |
| Drizzle migrations tracees | S | TECH-11 |
| Metadata profil joueur | XS | SEO-03 |

---

## KPIs de Suivi

| Metrique | Sprint 9 | Sprint 11 (cible) | Sprint 13 (cible) |
|----------|----------|-------------------|-------------------|
| Bugs critiques | 11 | 0 | 0 |
| Bugs hautes | 27 | < 10 | < 5 |
| Cartes | 330 | 330 | 330 |
| Archetypes | 14 | 14 (gaps corriges) | 14 |
| WCAG violations | 11 | 11 | 0 |
| Headers securite | 0 | 0 | 6+ |
| Error boundaries | 0 | 4 | 4 |
| Rate limiting | Non | Oui | Oui |
