# Plan d'Action Priorise -- La Tronconneuse de Poche

**Date :** 2026-03-05
**Base sur :** Audit consolide + Backlog (48 items)

---

## Sprint 3 -- Hotfixes & Polish TERMINE

**Objectif :** Corriger les bugs critiques et ameliorer la stabilite.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Ajuster dragConstraints Level 2+ pour swipe fluide | XS | BUG-01 | Done |
| 2 | Fix costPerCitizen = 0 sur cul-09, ukr-08 | XS | BUG-02 | Done |
| 3 | Fix typo image educuation -> education | XS | BUG-03 | Done |
| 4 | Dead-zone diagonale dans useSwipeGesture | XS | BUG-04 | Done |
| 5 | Guard nextCard() / empecher double vote | XS | BUG-05/06 | Done |
| 6 | generateMetadata dynamique /results + /play/[deckId] | S | SEO-01 | Done |
| 7 | Fix archetypes OG route (14 archetypes) | XS | -- | Done |
| 8 | Fix card count onboarding (270/17) | XS | -- | Done |
| 9 | robots.txt + sitemap.xml | XS | -- | Done |
| 10 | noindex sur env de dev | XS | -- | Done |

---

## Sprint 4 -- Gameplay Depth TERMINE

**Objectif :** Enrichir la rejouabilite et la progression.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Badges par categorie (8 badges, seuil 3 sessions) | S | UX-01 | Done |
| 2 | Historique + replay anciennes sessions (bouton Rejouer) | M | UX-02 | Done |
| 3 | Rapport d'impact Level 3 (estimation economies) | S | UX-05 | Done |
| 4 | Deblocage conditionnel des thematiques (3 categories) | S | UX-03 | Done |
| 5 | OG image archetype via /share page + meta tags | S | SEO-02 | Done |
| 6 | Infobulles acronymes dans la vue detail (80+ acronymes) | M | UX-09 | Done |

---

## Sprint 5 -- Backend Foundation TERMINE

**Objectif :** Passer du localStorage au backend pour activer les fonctionnalites communautaires.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Setup Drizzle + PostgreSQL + docker-compose | XL | BACK-01 | Done |
| 2 | API agregation votes (GET /api/community) | L | BACK-02 | Done |
| 3 | API save session (POST /api/sessions) | M | BACK-02 | Done |
| 4 | Frontend fire-and-forget sync (dual mode localStorage + API) | S | -- | Done |
| 5 | Validation runtime JSON au chargement | S | TECH-03 | Done |
| 6 | Fix Turbopack + tsconfig ES2020 | XS | TECH-01 | Done |

---

## Sprint 6 -- Modes Avances, Accessibilite & Polish TERMINE

**Objectif :** Nouveaux modes de jeu, qualite, corrections UX.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Mode Budget Contraint (objectif economies, 5 paliers, tracker live) | M | UX-04 | Done |
| 2 | Accessibilite ARIA + focus management (nav, cards, dialog, sr-only) | S | TECH-04 | Done |
| 3 | Memoiser sessionStats() dans le store | S | TECH-02 | Done |
| 4 | Fix accents francais (page infos, aria-labels, OG route, play) | XS | BUG-08 | Done |
| 5 | Fix z-index bouton "Lancer la session" | XS | BUG-09 | Done |
| 6 | Scrollbar-hide sur toutes les pages (profil, infos) | XS | BUG-10 | Done |
| 7 | Highlight archetype joueur dans distribution communaute | XS | UX-11 | Done |
| 8 | Lien pixeeplay.fr sur page infos | XS | UX-12 | Done |
| 9 | Fix image education (renommage fichier) | XS | BUG-03 | Done |

---

## Sprint 7 -- Radar & Donnees Communautaires TERMINE

**Objectif :** Exploiter les donnees communautaires pour enrichir l'experience comparaison.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Radar SVG "Tes choix vs la communaute" (polygon, N axes) | M | UX-10 | Done |
| 2 | Integrer le radar sur resultats Niv.2+ ET page communaute | S | UX-10 | Done |
| 3 | API /api/community/stats (vrais agregats par categorie/archetype) | M | DATA-01 | Done |
| 4 | Feed tendances reel (top coupe / top protege depuis API) | S | DATA-03 | Done |

**Livrable :** RadarChart SVG, computeRadarFromSession/History, API community/stats, hook useCommunityStats, integration resultats + ranking.

---

## Sprint 8 -- Auth & Profil TERMINE

**Objectif :** Authentification OAuth, redesign profil, avatars.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | NextAuth.js v5 (Google + GitHub providers, Drizzle adapter) | M | BACK-03 | Done |
| 2 | SessionProvider + API route /api/auth/[...nextauth] | S | BACK-03 | Done |
| 3 | Redesign header profil (compact, pseudo aleatoire, boutons login) | S | UX-13 | Done |
| 4 | Editeur d'avatar (emoji picker, 24 choix, persistance localStorage) | S | UX-14 | Done |
| 5 | Tooltip sur hauts faits verrouilles (condition de deblocage) | XS | UX-15 | Done |
| 6 | Rename onglet "Journal H.F." -> "Journal", "Audits N3" -> "Audits (Niveau 3)" | XS | UX-16 | Done |

**Livrable :** Auth Google/GitHub prete (a activer avec les cles OAuth), profil compact avec avatar editable.

---

## Sprint 9 -- Contenu : 70 nouvelles cartes TERMINE

**Objectif :** Enrichir les 6 categories complementaires (agriculture, logement, immigration, numerique, recettes, emploi).

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Ajouter 24 cartes "Renfort" (4 par categorie complementaire) | M | DATA-05 | Done |
| 2 | Ajouter 46 cartes "Boost Final" (6-8 par categorie) | L | DATA-06 | Done |
| 3 | Mettre a jour les cardCount dans les decks | XS | -- | Done |

**Livrable :** 330 cartes au total (vs 270 avant). Chaque categorie complementaire passe de 8-10 a 18-20 cartes.

| Categorie | Avant | Apres |
|-----------|-------|-------|
| Agriculture | 8 | 20 |
| Logement | 8 | 18 |
| Immigration | 8 | 18 |
| Numerique | 8 | 18 |
| Recettes | 10 | 18 |
| Emploi | 8 | 18 |

---

## Sprint 10 -- Refacto Data + Polish (PROCHAIN)

**Objectif :** Splitter le JSON monolithique, ameliorer la maintenabilite.

| # | Item | Effort | Ref | Statut |
|---|------|--------|-----|--------|
| 1 | Splitter decks.json en 1 fichier par categorie | M | TECH-06 | A faire |
| 2 | Leaderboard vitesse (session la plus rapide) | M | UX-08 | A faire |
| 3 | Sync multi-device | L | BACK-04 | A faire |
| 4 | Metadata profil joueur (SEO) | XS | SEO-03 | A faire |

---

## Post-MVP / V2

| Item | Effort | Ref |
|------|--------|-----|
| Mode Duel (2 joueurs) | L | UX-07 |
| Distinction XP tronconneur vs contributeur | S | UX-06 |
| Cartes evenementielles dynamiques | L | DATA-02 |
| API ouverte / export CSV | M | BACK-05 |
| Analytics Plausible/PostHog | L | BACK-06 |
| Filtrage demographique | S | DATA-04 |
| Service worker documentation | XS | TECH-05 |

---

## KPIs de Suivi

| Metrique | Sprint 3 | Sprint 6 | Sprint 9 |
|----------|----------|----------|----------|
| Bugs critiques | 0 | 0 | 0 |
| Build time | < 30s | < 30s | < 30s |
| Lighthouse mobile | > 90 | > 95 | > 95 |
| Cartes | 270 | 270 | 330 |
| Archetypes | 14 | 14 | 14 |
| Categories | 17 | 17 | 17 |
| Donnees communautaires | Mock | API ready | Reelles |
| Auth | Non | Non | Google + GitHub |
