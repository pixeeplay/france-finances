# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-06

---

## Sprints termines (3-17) -- 87 items

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

---

## Sprint 18 -- Sync Multi-Device (BACK-04)

**Objectif :** Permettre a un joueur connecte de retrouver ses sessions et stats sur n'importe quel appareil.

| # | Item | Effort | Statut |
|---|------|--------|--------|
| 1 | Endpoint GET /api/me/stats (stats agregees du joueur connecte) | S | |
| 2 | Endpoint GET /api/me/sessions (historique sessions du joueur) | S | |
| 3 | Endpoint PUT /api/me/profile (sauvegarder username + avatar) | S | |
| 4 | Hook useSync : au login, merge localStorage <-> DB | M | |
| 5 | Ecriture DB sur saveCompletedSession quand user connecte | S | |
| 6 | Hydratation profil/stats depuis DB au chargement si connecte | S | |

**Principe :** localStorage reste la source de verite locale. Quand le joueur est connecte (NextAuth session), les donnees sont synchronisees avec la DB. Au login sur un nouvel appareil, les sessions DB sont fusionnees dans le localStorage local.

---

## Post-MVP / V2 (apres Sprint 18)

| Item | Effort | Ref | Description |
|------|--------|-----|-------------|
| API ouverte / export CSV | M | BACK-05 | Endpoint GET /api/export pour telecharger ses sessions en CSV/JSON |
| Analytics Plausible/PostHog | L | BACK-06 | Suivi d'usage respectueux vie privee (sessions, retention, funnels) |
| Leaderboard vitesse | M | UX-30 | Classement par temps moyen de decision par carte |
| Mode Duel (2 joueurs) | L | UX-31 | Swipe simultane + comparaison resultats (WebSocket) |
| Metadata profil joueur | XS | SEO-03 | OG tags dynamiques sur /profile |
