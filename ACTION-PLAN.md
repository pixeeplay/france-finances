# Plan d'Action -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-06

---

## Sprints termines (3-18) -- 96 items

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
| 18 | Sync multi-device + Analytics Plausible + fix liens infos | 8 |

---

## Post-MVP / V2

| Item | Effort | Ref | Description |
|------|--------|-----|-------------|
| API ouverte / export CSV | M | BACK-05 | Endpoint GET /api/export pour telecharger ses sessions en CSV/JSON |
| Leaderboard vitesse | M | UX-30 | Classement par temps moyen de decision par carte |
| Mode Duel (2 joueurs) | L | UX-31 | Swipe simultane + comparaison resultats (WebSocket) |
| Metadata profil joueur | XS | SEO-03 | OG tags dynamiques sur /profile |
