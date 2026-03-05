# Rapport d'Audit Consolide -- La Tronconneuse de Poche

**Date :** 2026-03-05
**Version :** Post-Sprint 9 + Refacto Data
**Build :** OK (Next.js 15 + serwist, compile sans erreur)
**Donnees :** 330 cartes, 17 decks, 0 anomalies structurelles
**Auth :** NextAuth.js v5 (Google + GitHub) pret (a activer avec cles OAuth)
**Audit :** 6 agents specialises

---

## 1. Resume Executif

| Categorie | Critique | Haute | Moyenne | Basse |
|-----------|----------|-------|---------|-------|
| Swipe & Gameplay | 2 | 4 | 5 | 5 |
| State & Data | 4 | 5 | 6 | 4 |
| Routing & Navigation | 0 | 3 | 8 | 8 |
| UX & Accessibilite | 3 | 7 | 11 | 5 |
| Backend & Securite | 2 | 8 | 9 | 4 |
| Conformite Briefs | 0 | 0 | 4 | 2 |
| **Total** | **11** | **27** | **43** | **28** |

**Score conformite briefs :** 92% couverture fonctionnelle, 85% conformite exacte.

---

## 2. Findings Critiques (11)

### CRIT-01 -- Double completeSession() possible
**Fichier :** `src/stores/gameStore.ts:104`
**Probleme :** Pas de guard `if (session.completed) return`. Double-swipe = double sauvegarde.
**Fix :** Ajouter `if (!session || session.completed) return;`

### CRIT-02 -- Race condition recordVote/nextCard non atomique
**Fichier :** `src/components/SwipeStack.tsx:64-68`
**Probleme :** Appels sequentiels fragiles, closure capture `currentIndex` avant increment.
**Fix :** Fusionner en `voteAndAdvance(cardId, direction)` atomique dans le store.

### CRIT-03 -- useGameStore() sans selector (re-renders massifs)
**Fichiers :** `SwipeStack.tsx:37`, `SwipeSession.tsx:23`
**Probleme :** Abonne les composants a TOUT le store. Chaque mutation = re-render complet.
**Fix :** Utiliser des selectors individuels ou `useShallow`.

### CRIT-04 -- Aucun support clavier pour le swipe
**Fichier :** `src/components/SwipeCard.tsx`
**Probleme :** Aucun `onKeyDown` pour les fleches. Violation WCAG 2.1.1.
**Fix :** Ajouter un listener `keydown` dans SwipeStack.

### CRIT-05 -- Aucun focus-visible sur les elements interactifs
**Probleme :** Zero occurrence de `focus-visible:` dans le codebase. Violation WCAG 2.4.7.
**Fix :** Ajouter `focus-visible:ring-2` sur tous les boutons et liens.

### CRIT-06 -- prefers-reduced-motion completement ignore
**Probleme :** Aucune reference dans `src/`. Violation WCAG 2.3.3.
**Fix :** `useReducedMotion()` de framer-motion + media query CSS.

### CRIT-07 -- Aucun rate limiting sur les API routes
**Fichiers :** `src/app/api/sessions/route.ts`, `src/app/api/community/`
**Fix :** Rate limiting ~10 req/min POST, ~60 req/min GET.

### CRIT-08 -- Credentials PostgreSQL en dur dans docker-compose.yml
**Fichier :** `docker-compose.yml:9,18-19`
**Fix :** Utiliser `.env` non committe + `env_file:`.

### CRIT-09 -- Race condition read-modify-write localStorage
**Fichier :** `src/lib/stats.ts:173-196`
**Fix :** Accepter pour MVP, documenter la limitation.

### CRIT-10 -- Gap ~40% dans les archetypes Niveau 1
**Fichier :** `src/data/archetypes.json`, `src/lib/archetype.ts:87`
**Probleme :** cutPercent 60-80% et keepPercent 60-80% = fallback mal etiquete.
**Fix :** Ajouter archetypes intermediaires ou elargir les plages.

### CRIT-11 -- Port PostgreSQL expose sur toutes les interfaces
**Fichier :** `docker-compose.yml:24`
**Fix :** Restreindre a `127.0.0.1:5432:5432`.

---

## 3. Findings Hautes (27)

| ID | Domaine | Description | Fichier |
|----|---------|-------------|---------|
| H-01 | Swipe | Pas de guard animation en cours (double swipe) | SwipeCard/SwipeStack |
| H-02 | Swipe | dragConstraints incorrects L1 (conflit framer-motion) | SwipeCard.tsx:71 |
| H-03 | Swipe | MotionValues non reinitialisees (fragile sans keys) | useSwipeGesture.ts:20 |
| H-04 | Swipe | startSession dans le render (pas useEffect) | SwipeStack.tsx:42-46 |
| H-05 | State | Cast non verifie `as T` sur localStorage | stats.ts:51-58 |
| H-06 | State | Pas de schema versioning localStorage | stats.ts |
| H-07 | State | validateData ne verifie pas subtitle/source/level | validateData.ts |
| H-08 | State | costPerCitizen non verifie vs amountBillions | validateData.ts |
| H-09 | Routing | Aucune validation server-side du param level (bypass) | play/[deckId]/page.tsx:40 |
| H-10 | Routing | Aucun error.tsx dans l'arborescence | src/app/ |
| H-11 | UX | userScalable: false bloque le zoom | layout.tsx:65-66 |
| H-12 | UX | CardDetail sans focus trap ni Escape | CardDetail.tsx |
| H-13 | UX | Boutons Level 2 sans aria-label | CardDetail/SwipeStack |
| H-14 | UX | AcronymText tooltip non accessible | AcronymText.tsx |
| H-15 | UX | Touch targets < 44px (detail, quitter, avatar) | Multiple |
| H-16 | UX | Pas de loading state page de jeu | play/[deckId]/ |
| H-17 | UX | Pas de confirmation avant quitter session | SwipeStack.tsx:128 |
| H-18 | Backend | Validation incomplete payload POST /api/sessions | sessions/route.ts |
| H-19 | Backend | ID session client-generated (UUID forgeable) | sessions/route.ts |
| H-20 | Backend | Aucun header de securite (CSP, X-Frame-Options) | next.config.ts |
| H-21 | Backend | Pas de middleware d'authentification | (absent) |
| H-22 | Backend | Session callback incompatible mode JWT | auth.ts:41-45 |
| H-23 | Backend | Aucun index DB sur colonnes requetees | db/schema.ts |
| H-24 | Backend | Pas de connection pooling configure | db/index.ts:8 |
| H-25 | Backend | Budget mode incoherent (unjustified inclus en jeu, pas en resultats) | SwipeStack/ResultScreen/stats |
| H-26 | Backend | Audit L3 Back button bloque l'utilisateur | SwipeSession.tsx:44-47 |
| H-27 | Backend | Erreurs DB masquees en 200 OK | community/route.ts |

---

## 4. Findings Moyennes (43)

### Swipe & Gameplay (5)
- Budget mode incoherence cut vs unjustified dans les calculs
- handleDetailVote : nextCard() avant check fin session (fragile)
- CardDetail vote ne declenche pas animation de sortie
- useArchetype recalcule les stats (cache store non utilise)
- sessionStats() est une methode, pas un selecteur reactif

### State & Data (6)
- Validation executee une seule fois sans bloquer le rendu
- Pas de limite sur taille localStorage sessions
- Fonctions computed = anti-pattern Zustand
- Overlaps et ordre d'evaluation archetypes N2/3
- Quasi-doublons san-04/san-13 (meme montant)
- `as Card[]` assertion non verifiee dans barrel loader

### Routing & Navigation (8)
- Page d'accueil absente du BottomNav
- Pas de gestion back button pendant swipe
- /results est cul-de-sac si pas de session
- Pas de generateMetadata sur 5 pages client
- Page d'accueil entierement client (pourrait etre RSC)
- DeckId non valide server-side -> crash silencieux
- Validation incomplete payload API sessions
- Pas de loading.tsx ni not-found.tsx

### UX & Accessibilite (11)
- Onboarding sans role="dialog" ni focus trap
- Bouton detail 32x32px (< 44px minimum)
- Icones SVG sans aria-hidden
- Contraste insuffisant text-[9px] text-muted-foreground
- Aucune region aria-live dans ResultScreen/ProfilePage
- Footer AuditScreen recouvre contenu sur ecran court
- Absence de pb-safe sur BottomNav et footers
- Auto-scroll homepage ne s'arrete pas
- Onboarding ne mentionne pas le tap pour detail
- Pas de re-acces au tutoriel
- Pas de feedback erreur si session invalide

### Backend & Securite (9)
- XSS potentiel via parametres OG image
- AUTH_SECRET placeholder sans validation demarrage
- Schema sessions.id sans constraint CHECK
- Pas de migration tracee (db:push vs db:migrate)
- Healthcheck absent pour conteneur Next.js
- Auth secrets absents du docker-compose
- Error responses non coherentes entre API routes
- next-auth en version beta
- Pas d'authentification sur ecriture sessions

### Conformite Briefs (4)
- 6 badges categorie manquants (complementaires)
- 4 achievements manquants (Speedrunner, Expert, Millionnaire, Collectionneur)
- Archetypes L2 divergent du brief (Indecis/Specialiste absents)
- Donnees communautaires mockees sur page ranking

---

## 5. Conformite Briefs

| Feature | Status | Qualite |
|---------|--------|---------|
| 14 archetypes (4+6+4) | Implemente | A |
| 330 cartes / 17 decks | Implemente | A |
| Gameplay L1/L2/L3 | Implemente | A |
| Onboarding 3 ecrans | Implemente | A |
| Partage social + OG | Implemente | A |
| Mode Budget Contraint | Implemente | A |
| Infobulles acronymes | Implemente | A |
| Profil 3 onglets + avatar | Implemente | A |
| Radar communautaire | Implemente | B |
| Auth OAuth | Implemente | B |
| Badges generaux (8) | Implemente | A |
| Badges categorie | Partiel (8/14) | C |
| Achievements speciaux | Partiel (manque 4) | C |
| Progression niveaux | Implemente (variante) | B |
| Sync multi-device | Non implemente | - |
| Mode Duel | Non implemente | - |

---

## 6. Sante Technique

| Aspect | Status |
|--------|--------|
| Build production | OK |
| TypeScript strict | OK (0 any) |
| Docker multi-stage | OK (non-root) |
| PWA manifest | OK |
| Service Worker | Config presente, fonctionnement a verifier |
| Bundle size | A optimiser (framer-motion sur home) |
| Mobile responsive | OK (375px first) |
| Dark theme | OK |
| Accessibilite | Insuffisante (11 critiques/hautes) |
| Headers securite | Absents |
| Error boundaries | Absents |
| Rate limiting | Absent |

---

*Rapport genere par audit multi-agents -- 6 agents specialises*
