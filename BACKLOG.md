# Backlog -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-06

## Legende
- P2 = Amelioration significative
- P3 = Nice-to-have / post-MVP
- Effort : XS (<1h), S (1-3h), M (3-8h), L (1-2j), XL (3-5j)

---

## Historique

87 items livres en 17 sprints (Sprints 3-17). Detail dans ACTION-PLAN.md.

---

## Post-MVP / V2

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BACK-04 | P2 | L | Sync multi-device : les sessions localStorage sont synchronisees avec le compte utilisateur en DB. Quand un joueur se connecte sur un autre appareil, ses stats/sessions/profil sont recuperes depuis le serveur. | |
| BACK-05 | P3 | M | API ouverte / export CSV : endpoint public GET /api/export qui permet de telecharger ses sessions et votes au format CSV ou JSON. Utile pour transparence et reutilisation des donnees. | |
| BACK-06 | P3 | L | Analytics Plausible/PostHog : integration d'un outil d'analytics respectueux de la vie privee pour suivre les metriques d'usage (sessions jouees, retention, pages vues, funnels). | |
| UX-30 | P3 | M | Leaderboard vitesse : classement des joueurs par temps moyen de decision par carte (ms/carte). Recompense les joueurs instinctifs. Necessite un endpoint dedie. | |
| UX-31 | P3 | L | Mode Duel : 2 joueurs swipent le meme deck en simultane, puis comparent leurs resultats. Necessite WebSocket ou polling, room system, et ecran de comparaison. | |
| SEO-03 | P3 | XS | Metadata profil joueur : generateMetadata dynamique sur /profile avec nom, archetype et stats du joueur dans les balises OG. | |

---

## Compteur

| Statut | Count |
|--------|-------|
| Done | 87 |
| A faire | 6 |
| **Total** | **93** |
