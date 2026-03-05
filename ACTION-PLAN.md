# Plan d'Action Priorisé — La Tronçonneuse de Poche

**Date :** 2026-03-05
**Basé sur :** Audit consolidé + Backlog (33 items)

---

## Sprint 3 — Hotfixes & Polish ✅ TERMINÉ

**Objectif :** Corriger les bugs critiques et améliorer la stabilité.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Ajuster dragConstraints Level 2+ pour swipe fluide | XS | BUG-01 | ✅ |
| 2 | Fix costPerCitizen = 0 sur cul-09, ukr-08 | XS | BUG-02 | ✅ |
| 3 | Fix typo image educuation → education | XS | BUG-03 | ✅ |
| 4 | Dead-zone diagonale dans useSwipeGesture | XS | BUG-04 | ✅ |
| 5 | Guard nextCard() / empêcher double vote | XS | BUG-05/06 | ✅ |
| 6 | generateMetadata dynamique /results + /play/[deckId] | S | SEO-01 | ✅ |
| 7 | Fix archétypes OG route (14 archétypes) | XS | — | ✅ |
| 8 | Fix card count onboarding (270/17) | XS | — | ✅ |
| 9 | robots.txt + sitemap.xml | XS | — | ✅ |
| 10 | noindex sur env de dev | XS | — | ✅ |

**Livrable :** Version stable, 0 bug connu, SEO amélioré. Commits `03a7ebb`, `304c152`, `30250b5`.

---

## Sprint 4 — Gameplay Depth ✅ TERMINÉ

**Objectif :** Enrichir la rejouabilité et la progression.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Badges par catégorie (8 badges, seuil 3 sessions) | S | UX-01 | ✅ |
| 2 | Historique + replay anciennes sessions (bouton Rejouer) | M | UX-02 | ✅ |
| 3 | Rapport d'impact Level 3 (estimation économies) | S | UX-05 | ✅ (existant) |
| 4 | Déblocage conditionnel des thématiques (3 catégories) | S | UX-03 | ✅ |
| 5 | OG image archétype via /share page + meta tags | S | SEO-02 | ✅ |
| 6 | Infobulles acronymes dans la vue détail (80+ acronymes) | M | UX-09 | ✅ |

**Reporté :** UX-06 (Distinction XP tronçonneur vs contributeur) → à définir après clarification du lien avec nicoquipaie.co (API contenus, univers distincts).

**Livrable :** Progression plus riche, partage social amélioré, acronymes explicables.

---

## Sprint 5 — Backend Foundation ✅ TERMINÉ

**Objectif :** Passer du localStorage au backend pour activer les fonctionnalités communautaires.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Setup Drizzle + PostgreSQL + docker-compose | XL | BACK-01 | ✅ |
| 2 | API agrégation votes (GET /api/community) | L | BACK-02 | ✅ |
| 3 | API save session (POST /api/sessions) | M | BACK-02 | ✅ |
| 4 | Frontend fire-and-forget sync (dual mode localStorage + API) | S | — | ✅ |
| 5 | Validation runtime JSON au chargement | S | TECH-03 | ✅ |
| 6 | Fix Turbopack + tsconfig ES2020 | XS | TECH-01 | ✅ |

**Reporté Sprint 6+ :** BACK-03 (Auth simple), DATA-01 (Remplacer données mockées — nécessite volume de données réelles).

**Livrable :** Backend fonctionnel, API dual-mode (graceful degradation sans DB), docker-compose PostgreSQL. Commit `6bdd769`.

---

## Sprint 6 — Modes Avances & Accessibilite ✅ TERMINE

**Objectif :** Nouveaux modes de jeu pour la retention + qualite.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Mode Budget Contraint (objectif economies, 5 paliers, tracker live) | M | UX-04 | ✅ |
| 2 | Accessibilite ARIA + focus management (nav, cards, dialog, sr-only) | S | TECH-04 | ✅ |
| 3 | Memoiser sessionStats() dans le store | S | TECH-02 | ✅ |

**Reporte Sprint 7+ :** UX-08 (Leaderboard vitesse), BACK-04 (Sync multi-device) — necessitent BACK-03 (auth).

**Livrable :** Mode Budget jouable, accessibilite amelioree, perf store optimisee.

---

## Post-MVP / V2

| Item | Effort | Ref |
|------|--------|-----|
| Mode Duel (2 joueurs) | L | UX-07 |
| Cartes événementielles dynamiques | L | DATA-02 |
| Feed communautaire auto-généré | M | DATA-03 |
| API ouverte / export CSV | M | BACK-05 |
| Analytics Plausible/PostHog | L | BACK-06 |
| Filtrage démographique | S | DATA-04 |

---

## Matrice Valeur / Effort

```
         Effort faible          Effort élevé
        ┌──────────────────┬──────────────────┐
Valeur  │  BUG-01,02,03    │  BACK-01 (DB)    │
haute   │  SEO-01          │  BACK-02 (API)   │
        │  BUG-04,05,06    │  UX-02 (replay)  │
        ├──────────────────┼──────────────────┤
Valeur  │  UX-06 (XP)      │  UX-04 (budget)  │
moyenne │  UX-05 (rapport)  │  BACK-03 (auth)  │
        │  TECH-01,02      │  DATA-01 (real)   │
        ├──────────────────┼──────────────────┤
Valeur  │  TECH-05 (SW)    │  UX-07 (duel)    │
basse   │  BUG-07           │  DATA-02 (events) │
        │  SEO-03           │  BACK-06 (analytics)|
        └──────────────────┴──────────────────┘
```

**Recommandation :** Prioriser le quadrant haut-gauche (quick wins à forte valeur), puis enchaîner sur le backend (haut-droite) qui débloque les fonctionnalités communautaires.

---

## KPIs de Suivi

| Métrique | Objectif Sprint 3 | Objectif Sprint 5 |
|----------|-------------------|-------------------|
| Bugs critiques | 0 | 0 |
| Build time | < 30s | < 30s |
| Lighthouse mobile | > 90 | > 95 |
| Cartes avec données complètes | 270/270 | 270/270 |
| Couverture archétypes | 14/14 | 14/14 |
| Données communautaires | Mock | Réelles |
