# Rapport d'Audit Consolidé — La Tronçonneuse de Poche

**Date :** 2026-03-05
**Version :** Post-Sprint 9
**Build :** OK (Next.js 16 + serwist, compile sans erreur)
**Donnees :** 330 cartes, 17 decks, 0 anomalies structurelles
**Auth :** NextAuth.js v5 (Google + GitHub) pret (a activer avec cles OAuth)

---

## 1. Résumé Exécutif

| Catégorie | Critique | Haute | Moyenne | Basse |
|-----------|----------|-------|---------|-------|
| Swipe & Gestes | 1 | 1 | 2 | 0 |
| State & Data | 0 | 1 | 2 | 1 |
| Routing & Navigation | 0 | 1 | 2 | 1 |
| PWA & Build | 0 | 0 | 1 | 1 |
| Qualité des données | 0 | 1 | 0 | 1 |
| Conformité briefs | 0 | 3 | 4 | 3 |
| **Total** | **1** | **7** | **11** | **7** |

---

## 2. Findings Critiques

### CRIT-01 — Drag constraints bloquent le swipe Level 2+
**Fichier :** `src/components/SwipeCard.tsx:68`
**Problème :** `dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}` verrouille la carte, empêchant le swipe 4 directions en Level 2+. `dragElastic={0.9}` permet un mouvement élastique temporaire mais la carte revient toujours au centre.
**Impact :** Le gameplay Level 2+ (haut=renforcer, bas=injustifié) est fonctionnel grace à l'élasticité + seuils dans `onDragEnd`, mais le retour élastique rend le geste moins fluide que prévu.
**Fix :** Augmenter les constraints ou les supprimer pour Level 2+.

---

## 3. Findings Hautes

### HIGH-01 — Race condition dans recordVote/nextCard (gameStore)
**Fichier :** `src/stores/gameStore.ts`
**Problème :** `recordVote()` et `nextCard()` ne sont pas atomiques. Un swipe rapide peut causer un timing décalé sur `cardShownAt`.
**Impact :** Métriques de durée par carte imprécises sur des swipes très rapides.

### HIGH-02 — Détection diagonale ambiguë (useSwipeGesture)
**Fichier :** `src/hooks/useSwipeGesture.ts:63`
**Problème :** `const isHorizontal = absX >= absY` traite X==Y comme horizontal. Swipe diagonal à 45° enregistré comme horizontal.
**Fix :** Utiliser `absX > absY * 1.2` pour un dead-zone diagonal.

### HIGH-03 — URL manipulation bypass niveaux
**Fichier :** `src/components/ResultScreen.tsx:276,285`
**Problème :** `router.push("/play?level=2")` sans validation que le niveau est débloqué. L'utilisateur peut naviguer directement via l'URL.
**Impact :** Sécurité de la progression contournable.

### HIGH-04 — costPerCitizen = 0 sur 2 cartes
**Cartes :** `cul-09` (Aviation civile, 2.3 Md) et `ukr-08` (Sanctions russes, 22 Md)
**Problème :** Le coût par citoyen affiche 0 alors que le montant est non-nul.
**Fix :** Recalculer ou documenter pourquoi c'est 0 (ex: recettes, pas dépenses).

---

## 4. Findings Moyennes

### MED-01 — Pas de validation des doublons dans recordVote
Le store accepte plusieurs votes pour la même carte si le composant le permet.

### MED-02 — nextCard() peut dépasser la longueur du tableau
Pas de guard si `currentIndex >= cards.length`.

### MED-03 — Métadonnées SEO statiques sur routes dynamiques
`/results`, `/play/[deckId]` n'ont pas de `generateMetadata`. L'image OG dynamique (archétype) n'est pas utilisée dans les meta tags.

### MED-04 — Typo dans image path du deck éducation
`"image": "/categories/educuation.svg"` au lieu de `education.svg`.

### MED-05 — Données communautaires mockées
Le leaderboard `/ranking` utilise des données statiques, pas de vrais agrégats.

### MED-06 — Pas de replay d'anciennes sessions
Feature mentionnée dans le brief (rejouabilité) mais non implémentée.

### MED-07 — Pas de distinction XP tronçonneur vs contributeur
Le brief précise "swipe ne donne PAS de XP contributeur" mais tout le XP vient des swipes.

---

## 5. Findings Basses

### LOW-01 — useImperativeHandle manque `level` dans les deps
### LOW-02 — sessionStats() non memoïsé (recalcul à chaque appel)
### LOW-03 — Deck `type` optionnel mais attendu partout
### LOW-04 — target ES2017 dans tsconfig (ES2020+ recommandé)
### LOW-05 — Pas d'enregistrement SW explicite (serwist auto-register)

---

## 6. Conformité Briefs

### Implemente (100%)
- Gameplay Niveau 1 (swipe 2 directions)
- Gameplay Niveau 2 (swipe 4 directions + communaute)
- Gameplay Niveau 3 (micro-audit + prescriptions)
- 14 archetypes (4 L1 + 6 L2 + 4 L3)
- 330 cartes avec equivalences (14 categories, 18-22 cartes chacune)
- 17 decks (8 master + 6 complementaires + 3 thematiques)
- Systeme d'achievements (8 badges generaux + 8 badges categories)
- Persistance localStorage + sync fire-and-forget API
- Progression par niveaux (unlock L2 apres 3 sessions, L3 apres 5)
- Onboarding 3 ecrans
- Partage social (Web Share API + OG image dynamique)
- PWA installable
- Analytics events (7 types)
- Profil joueur (3 onglets, avatar editable, pseudo aleatoire)
- Backend Drizzle + PostgreSQL (dual-mode graceful degradation)
- API community/stats (agregats reels par categorie/archetype)
- Radar SVG "Tes choix vs la communaute" (resultats + page communaute)
- Mode Budget Contraint (5 paliers, tracker live)
- Badges par categorie (8 badges, seuil 3 sessions)
- Replay anciennes sessions (historique + bouton Rejouer)
- Deblocage conditionnel des thematiques
- Infobulles acronymes (80+ acronymes)
- Accessibilite ARIA + focus management
- Auth OAuth (NextAuth.js v5, Google + GitHub) — pret a activer

### Partiellement implemente
- Duree de session (trackee mais pas de leaderboard vitesse)
- Sync multi-device (auth prete, sync a implementer)

### Non implemente
- Mode Duel (2 joueurs)
- Cartes evenementielles dynamiques
- Export CSV / API ouverte
- Filtrage demographique (age/CSP)
- Distinction XP tronconneur vs contributeur
- Analytics Plausible/PostHog

---

## 7. Santé Technique

| Aspect | Status |
|--------|--------|
| Build production | OK |
| TypeScript strict | OK (0 erreurs) |
| Docker | OK (multi-stage, non-root) |
| PWA manifest | OK (icons, offline) |
| Service Worker | OK (serwist auto) |
| Bundle size | Acceptable |
| Mobile responsive | OK (375px first) |
| Dark theme | OK |
| Accessibilité | Basique (boutons ont des states, pas d'ARIA complet) |

---

*Rapport généré par audit multi-agents — 6 agents spécialisés*
