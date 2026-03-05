# Backlog -- La Tronconneuse de Poche

**Derniere mise a jour :** 2026-03-05 (Sprint 9 termine)

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

## BUGS & FIXES

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
| BUG-09 | P1 | XS | Z-index bouton "Lancer la session" | Done Sprint 6 |
| BUG-10 | P2 | XS | Scrollbar visible desktop sur page profil | Done Sprint 6 |

---

## UX & GAMEPLAY

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| UX-01 | P1 | S | Badges par categorie (8 badges, seuil 3 sessions) | Done Sprint 4 |
| UX-02 | P1 | M | Rejouer anciennes sessions (historique + bouton Rejouer) | Done Sprint 4 |
| UX-03 | P2 | S | Deblocage thematiques conditionne (3 categories main jouees) | Done Sprint 4 |
| UX-04 | P2 | M | Mode Budget Contraint (objectif d'economie a atteindre) | Done Sprint 6 |
| UX-05 | P2 | S | Rapport d'impact Level 3 (X Md d'economies estimees) | Done |
| UX-06 | P2 | S | Distinction XP tronconneur vs XP contributeur | Reporte (lien nicoquipaie) |
| UX-07 | P3 | L | Mode Duel (2 joueurs comparent leurs choix) | |
| UX-08 | P3 | M | Leaderboard vitesse (session la plus rapide) | |
| UX-09 | P1 | M | Infobulles acronymes dans la vue detail | Done Sprint 4 |
| UX-10 | P1 | M | Radar "Tes choix vs la communaute" (polygon SVG) | Done Sprint 7 |
| UX-11 | P2 | XS | Highlight archetype joueur dans distribution communaute | Done Sprint 6 |
| UX-12 | P2 | XS | Lien pixeeplay.fr sur page infos | Done Sprint 6 |
| UX-13 | P1 | S | Redesign header profil (compact, pseudo aleatoire, login) | Done Sprint 8 |
| UX-14 | P2 | S | Editeur d'avatar (emoji picker) | Done Sprint 8 |
| UX-15 | P2 | XS | Tooltip sur hauts faits verrouilles | Done Sprint 8 |
| UX-16 | P2 | XS | Rename onglet Journal + Audits | Done Sprint 8 |

---

## SEO & PARTAGE

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| SEO-01 | P1 | S | generateMetadata dynamique sur /results et /play/[deckId] | Done Sprint 3 |
| SEO-02 | P2 | S | OG image archetype dans les meta tags de resultats | Done Sprint 4 |
| SEO-03 | P3 | XS | Metadata profil joueur | |

---

## BACKEND & INFRA

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BACK-01 | P2 | XL | Base de donnees (Drizzle + PostgreSQL) | Done Sprint 5 |
| BACK-02 | P2 | L | API pour agregation votes communautaires | Done Sprint 5 |
| BACK-03 | P2 | M | Auth OAuth (NextAuth.js v5, Google + GitHub) | Done Sprint 8 |
| BACK-04 | P3 | L | Sync multi-device | |
| BACK-05 | P3 | M | API ouverte / export CSV | |
| BACK-06 | P3 | L | Integration analytics (Plausible/PostHog) | |

---

## CONTENU & DONNEES

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| DATA-01 | P1 | M | API community/stats (vrais agregats) | Done Sprint 7 |
| DATA-02 | P3 | L | Cartes evenementielles dynamiques | |
| DATA-03 | P1 | S | Feed tendances reel (top coupe/protege) | Done Sprint 7 |
| DATA-04 | P3 | S | Filtrage demographique optionnel | |
| DATA-05 | P1 | M | 24 cartes "Renfort" (6 categories complementaires) | Done Sprint 9 |
| DATA-06 | P1 | L | 46 cartes "Boost Final" (alignement 18-20/categorie) | Done Sprint 9 |

---

## TECHNIQUE

| ID | Priorite | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| TECH-01 | P2 | XS | Upgrade tsconfig target ES2020 | Done Sprint 5 |
| TECH-02 | P2 | S | Memoiser sessionStats() dans le store | Done Sprint 6 |
| TECH-03 | P2 | S | Validation runtime des donnees JSON | Done Sprint 5 |
| TECH-04 | P3 | S | Ameliorer accessibilite (ARIA, focus management) | Done Sprint 6 |
| TECH-05 | P3 | XS | Verifier/documenter service worker | |
| TECH-06 | P2 | M | Splitter decks.json en fichiers par categorie | |

---

## COMPTEUR

| Statut | Count |
|--------|-------|
| Done | 38 |
| En cours / Planifie | 10 |
| **Total** | **48** |
