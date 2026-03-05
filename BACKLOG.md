# Backlog — La Tronçonneuse de Poche

**Dernière mise à jour :** 2026-03-05 (Sprint 5 terminé)

## Légende Priorité
- P0 = Bloquant / bug critique
- P1 = Important pour la prochaine release
- P2 = Amélioration significative
- P3 = Nice-to-have / post-MVP

## Légende Effort
- XS = < 1h
- S = 1-3h
- M = 3-8h
- L = 1-2 jours
- XL = 3-5 jours

---

## BUGS & FIXES

| ID | Priorité | Effort | Description | Statut |
|----|----------|--------|-------------|--------|
| BUG-01 | P0 | XS | Améliorer drag constraints Level 2+ (dragConstraints trop restrictives) | ✅ Sprint 3 |
| BUG-02 | P1 | XS | Fix costPerCitizen = 0 sur `cul-09` et `ukr-08` | ✅ Sprint 3 |
| BUG-03 | P1 | XS | Fix typo image path `educuation.svg` → `education.svg` | ✅ Sprint 3 |
| BUG-04 | P2 | XS | Détection diagonale ambiguë (dead-zone 45°) | ✅ Sprint 3 |
| BUG-05 | P2 | XS | Guard nextCard() contre dépassement index | ✅ Sprint 3 |
| BUG-06 | P2 | XS | Empêcher double vote sur même carte dans le store | ✅ Sprint 3 |
| BUG-07 | P3 | XS | Ajouter `level` aux deps de useImperativeHandle | ✅ Sprint 3 |

---

## UX & GAMEPLAY

| ID | Priorité | Effort | Description |
|----|----------|--------|-------------|
| UX-01 | P1 | S | Badges par catégorie ("Expert Défense" après 3 sessions) | ✅ Sprint 4 |
| UX-02 | P1 | M | Rejouer anciennes sessions (historique + bouton Rejouer) | ✅ Sprint 4 |
| UX-03 | P2 | S | Déblocage thématiques conditionné (3 catégories main jouées) | ✅ Sprint 4 |
| UX-04 | P2 | M | Mode Budget Contraint (objectif d'économie à atteindre) | ✅ Sprint 6 |
| UX-05 | P2 | S | Rapport d'impact Level 3 (X Md d'économies estimées) | ✅ Déjà implémenté |
| UX-06 | P2 | S | Distinction XP tronçonneur vs XP contributeur | Reporté (lien nicoquipaie) |
| UX-07 | P3 | L | Mode Duel (2 joueurs comparent leurs choix) | |
| UX-08 | P3 | M | Leaderboard vitesse (session la plus rapide) | |
| UX-09 | P1 | M | Infobulles acronymes dans la vue détail (clic sur acronyme = explication) | ✅ Sprint 4 |

---

## SEO & PARTAGE

| ID | Priorité | Effort | Description |
|----|----------|--------|-------------|
| SEO-01 | P1 | S | generateMetadata dynamique sur /results et /play/[deckId] | ✅ Sprint 3 |
| SEO-02 | P2 | S | OG image archétype dans les meta tags de résultats | ✅ Sprint 4 |
| SEO-03 | P3 | XS | Metadata profil joueur | |

---

## BACKEND & INFRA

| ID | Priorité | Effort | Description |
|----|----------|--------|-------------|
| BACK-01 | P2 | XL | Base de données (Drizzle + PostgreSQL) | ✅ Sprint 5 |
| BACK-02 | P2 | L | API pour agrégation votes communautaires | ✅ Sprint 5 |
| BACK-03 | P2 | M | Comptes utilisateurs (auth simple) |
| BACK-04 | P3 | L | Sync multi-device |
| BACK-05 | P3 | M | API ouverte / export CSV |
| BACK-06 | P3 | L | Intégration analytics (Plausible/PostHog) |

---

## CONTENU & DONNÉES

| ID | Priorité | Effort | Description |
|----|----------|--------|-------------|
| DATA-01 | P2 | M | Remplacer données communautaires mockées par vrais agrégats |
| DATA-02 | P3 | L | Cartes événementielles dynamiques (actualité budgétaire) |
| DATA-03 | P3 | M | Feed communautaire auto-généré ("dépense la plus coupée") |
| DATA-04 | P3 | S | Filtrage démographique optionnel (âge/CSP) |

---

## TECHNIQUE

| ID | Priorité | Effort | Description |
|----|----------|--------|-------------|
| TECH-01 | P2 | XS | Upgrade tsconfig target ES2017 → ES2020 | ✅ Sprint 5 |
| TECH-02 | P2 | S | Memoïser sessionStats() dans le store | ✅ Sprint 6 |
| TECH-03 | P2 | S | Validation runtime des données JSON au chargement | ✅ Sprint 5 |
| TECH-04 | P3 | S | Améliorer accessibilité (ARIA labels, focus management) | ✅ Sprint 6 |
| TECH-05 | P3 | XS | Vérifier/documenter auto-registration du service worker |

---

## COMPTEUR

| Priorité | Count |
|----------|-------|
| P0 | 1 |
| P1 | 6 |
| P2 | 14 |
| P3 | 12 |
| **Total** | **33** |
