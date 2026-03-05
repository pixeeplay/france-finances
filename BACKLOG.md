# Backlog -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-05 (Audit Post-Sprint 9)

## Legende Priorite
- P0 = Bloquant / bug critique
- P1 = Important pour la prochaine release
- P2 = Amelioration significative
- P3 = Nice-to-have / post-MVP

## Legende Effort
- XS = < 1h
- S = 1-3h
- M = 3-8h
- L = 1-2 jours
- XL = 3-5 jours

---

## BUGS & FIXES (Sprints 3-9) -- DONE

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BUG-01 | P0 | XS | Ameliorer drag constraints Level 2+ | Done Sprint 3 |
| BUG-02 | P1 | XS | Fix costPerCitizen = 0 sur cul-09, ukr-08 | Done Sprint 3 |
| BUG-03 | P1 | XS | Fix typo image path educuation.svg | Done Sprint 3+6 |
| BUG-04 | P2 | XS | Detection diagonale ambigue (dead-zone 45deg) | Done Sprint 3 |
| BUG-05 | P2 | XS | Guard nextCard() contre depassement index | Done Sprint 3 |
| BUG-06 | P2 | XS | Empecher double vote sur meme carte | Done Sprint 3 |
| BUG-07 | P3 | XS | Ajouter level aux deps de useImperativeHandle | Done Sprint 3 |
| BUG-08 | P1 | XS | Accents francais manquants | Done Sprint 6 |
| BUG-09 | P1 | XS | Z-index bouton Lancer la session | Done Sprint 6 |
| BUG-10 | P2 | XS | Scrollbar visible desktop sur page profil | Done Sprint 6 |

---

## BUGS & FIXES (Audit Post-Sprint 9)

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BUG-11 | P0 | XS | Guard completeSession si session.completed | Done Sprint 11 |
| BUG-12 | P0 | S | Fusionner recordVote+nextCard en voteAndAdvance atomique | Done Sprint 11 |
| BUG-13 | P0 | S | Selectors Zustand (useShallow) SwipeStack/SwipeSession | Done Sprint 11 |
| BUG-14 | P1 | XS | startSession dans useEffect (pas dans le render) | Done Sprint 11 |
| BUG-15 | P1 | XS | Guard isAnimating pour empecher double-swipe | Done Sprint 11 |
| BUG-16 | P1 | XS | Valider et clamper param level (1-3) server-side | Done Sprint 12 |
| BUG-17 | P1 | XS | Valider deckId server-side, notFound() si invalide | Done Sprint 12 |
| BUG-18 | P1 | S | Budget mode : inclure unjustified dans totalCut | Done Sprint 11 |
| BUG-19 | P1 | S | Audit L3 Back : deplacer recordVote dans handleAuditSubmit | Done Sprint 11 |
| BUG-20 | P1 | XS | Fix session callback NextAuth pour mode JWT | Done Sprint 11 |
| BUG-21 | P2 | XS | Quasi-doublon san-04/san-13 (meme montant 37Md) | Done Sprint 14 |
| BUG-22 | P2 | S | Gap archetypes N1 + 2 nouveaux archetypes (Tranchant, Protecteur) | Done Sprint 11 |

---

## UX & GAMEPLAY

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| UX-01 to UX-16 | - | - | (Done Sprints 4-8) | Done |
| UX-17 | P1 | S | Navigation clavier (fleches) pour le swipe | Done Sprint 13 |
| UX-18 | P1 | S | Focus trap + Escape sur CardDetail | Done Sprint 13 |
| UX-19 | P1 | XS | Retirer userScalable: false (permettre zoom) | Done Sprint 13 |
| UX-20 | P1 | S | prefers-reduced-motion (framer-motion + CSS) | Done Sprint 13 |
| UX-21 | P1 | S | Focus-visible rings sur tous les boutons | Done Sprint 13 |
| UX-22 | P2 | XS | Touch targets 44px minimum | Done Sprint 13 |
| UX-23 | P2 | S | Confirmation avant quitter session | Done Sprint 13 |
| UX-24 | P2 | XS | aria-label sur boutons Level 2 | Done Sprint 13 |
| UX-25 | P2 | XS | aria-hidden sur icones SVG decoratives | Done Sprint 13 |
| UX-26 | P2 | S | 6 badges categorie manquants (complementaires) | Done Sprint 14 |
| UX-27 | P2 | S | 4 achievements manquants | Done Sprint 14 |
| UX-28 | P3 | XS | Re-acces au tutoriel depuis Infos/Profil | A faire |
| UX-29 | P3 | XS | pb-safe sur BottomNav et footers (iOS) | A faire |
| UX-30 | P3 | M | Leaderboard vitesse | |
| UX-31 | P3 | L | Mode Duel (2 joueurs) | |

---

## SEO & PARTAGE

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| SEO-01 to SEO-02 | - | - | (Done Sprints 3-4) | Done |
| SEO-03 | P3 | XS | Metadata profil joueur | |
| SEO-04 | P2 | S | generateMetadata sur pages client | Done Sprint 14 |
| SEO-05 | P3 | XS | Ajouter favicon.ico | A faire |

---

## BACKEND & INFRA

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BACK-01 to BACK-03 | - | - | (Done Sprints 5-8) | Done |
| BACK-04 | P3 | L | Sync multi-device | |
| BACK-05 | P3 | M | API ouverte / export CSV | |
| BACK-06 | P3 | L | Integration analytics (Plausible/PostHog) | |
| BACK-07 | P0 | S | Retirer credentials docker-compose + restreindre port PG | Done Sprint 11 |
| BACK-08 | P1 | S | Headers de securite (CSP, X-Frame-Options, HSTS) | Done Sprint 12 |
| BACK-09 | P1 | M | Validation payload Zod sur POST /api/sessions | Done Sprint 12 |
| BACK-10 | P1 | M | Rate limiting API (in-memory, 10 req/min) | Done Sprint 12 |
| BACK-11 | P2 | S | Index DB sur colonnes requetees | A faire |
| BACK-12 | P2 | S | Connection pooling PostgreSQL | A faire |
| BACK-13 | P2 | S | Error.tsx + global-error.tsx + not-found.tsx + loading.tsx | Done Sprint 12 |
| BACK-14 | P2 | XS | Healthcheck endpoint /api/health | Done Sprint 12 |
| BACK-15 | P2 | S | Error responses coherentes API (503/500) | Done Sprint 12 |

---

## TECHNIQUE

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| TECH-01 to TECH-06 | - | - | (Done Sprints 5-10) | Done |
| TECH-07 | P1 | S | Ajouter subtitle/source/level dans validateData | Done Sprint 14 |
| TECH-08 | P2 | S | Schema versioning localStorage + migration | Done Sprint 14 |
| TECH-09 | P2 | S | Convertir /infos en RSC | A faire |
| TECH-10 | P2 | M | Lazy load framer-motion sur homepage | A faire |
| TECH-11 | P3 | S | Drizzle migrations tracees | A faire |

---

## COMPTEUR

| Statut | Count |
|--------|-------|
| Done | 72 |
| A faire | 6 |
| **Total** | **78** |
