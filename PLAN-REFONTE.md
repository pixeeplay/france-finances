# Plan de refonte -- france-finances.com

**Date :** 2026-09-30
**Contexte :** projet en pause depuis mars 2026 (Sprint 35). Le partenaire nicoquipaie.co est hors ligne et son responsable injoignable. Objectifs : récupérer nos contributions à nicoquipaie, moderniser le site (sortir du look "IA générique"), enrichir le jeu.

> Mise à jour du 2026-10-02 : la Phase 0 initiale (rapatriement par archives web) est abandonnée. Voir section 1.
>
> Mise à jour du 2026-10-02 (soir) : Phases 1 et 2 réalisées et fusionnées dans la branche locale `refonte/integration` (rien n'est poussé ni déployé). Avancement coché en section 3, décisions ouvertes en section 4.

---

## 1. Nos contributions à nicoquipaie (déjà en local)

### Constat

- Le code source complet de nicoquipaie est en local : `/work/projects/NICOLAS/CestNicolasQuiPaye` (fork `beuzzleklair/CestNicolasQuiPaye`, upstream `lezardoloris/CestNicolasQuiPaye`).
- **Nos contributions étaient du code, pas des publications.** 18 commits `smiollis` / `beuzzleklair` (28/02 → 05/03/2026) :

| Contribution                                                     | Branche / commit                                                    | Réutilisation ici                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| Page « Les Chiffres » (finances publiques)                       | `feat/les-chiffres` (`ef34d4e`), `src/lib/constants/budget-2026.ts` | Portage → `/chiffres`            |
| Simulateur fiscal (IR, cotisations, TVA, répartition budgétaire) | `feat/simulateur` (`52bff80`)                                       | Portage → `/simulateur`          |
| Archive des sources officielles (68+ URL institutionnelles)      | `9d2c87e`                                                           | Agent B : `sourceUrl` précises   |
| Infobulles d'acronymes, mode clair/sombre                        | `feat/light-mode-acronyms`                                          | Déjà présent ici (`AcronymText`) |
| Audit (12 rapports) + 575 tests                                  | `feat/audits-et-tests-v1`                                           | Référence méthodologique         |

- Les publications du site (`scripts/seed.ts`, 80 signalements « Nicolas Paie ») ont été rédigées par lezardoloris, en partie issues d'une recherche Gemini. Ce n'est pas notre contenu. Elles peuvent servir d'idées de cartes, à condition de tout re-sourcer à partir de documents officiels. Les publications ajoutées ensuite par les visiteurs n'existaient que dans la base Railway (pas d'accès).

### Nettoyage des références à nicoquipaie.co (fait, agent E)

- `src/components/landing/EcosystemSection.tsx` : section à supprimer ou à remplacer par « Les Chiffres / Le Simulateur » une fois portés.
- `src/app/a-propos/page.tsx`, `src/app/api/og/route.tsx`, `src/app/(game)/infos/page.tsx`.
- `public/les-chiffres.svg`, `le-feed.svg`, `le-simulateur.svg` : à supprimer s'ils ne sont plus utilisés.

---

## 2. Analyse de l'existant (état au 2026-09-30, avant la refonte)

### Points forts

- Stack moderne : Next 16, React 19, Tailwind 4, Drizzle, NextAuth v5, PWA serwist.
- Environ 275 tests Vitest, E2E Playwright, CI complète, Sentry.
- 369 cartes réparties en 19 decks, 16 archétypes, badges et achievements.

### Jeu : ce qui est superficiel

| Constat                                      | Détail                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Les niveaux n'existent que dans la mécanique | Les 369 cartes ont `"level": 1`. L2 et L3 ne changent que les directions de swipe (4 directions, audit). On y accède uniquement par `?level=` (`src/app/(game)/jeu/[deckId]/page.tsx:66-68`). |
| Aucun retour après un swipe                  | `SwipeStack.tsx` passe à la carte suivante sans révéler le vote de la communauté ni la conséquence budgétaire.                                                                                |
| Aucune rétention                             | Pas de deck du jour, pas de série de jours, et le tirage aléatoire n'a pas de seed (`src/lib/deckUtils.ts`).                                                                                  |
| Archétype déclaratif                         | `src/lib/archetype.ts` se base seulement sur les pourcentages cut/keep. Il ne tient compte ni des montants ni des catégories coupées.                                                         |
| Badges de volume                             | `src/lib/achievements.ts` : 19 badges « jouer N sessions du deck X » copiés-collés. Rien ne récompense la compréhension.                                                                      |
| Pédagogie passive                            | Aucun quiz ni aucune vérification de connaissances.                                                                                                                                           |

### Design : signes d'un look « IA générique »

- Un emoji comme visuel principal sur 369 cartes sur 369 (`SwipeCard.tsx:182`, `text-[90px]`), avec beaucoup de doublons (🏠 ×18, 🌾 ×15). Ça contredit la règle « pas d'emoji » de CLAUDE.md.
- Thème shadcn par défaut (`--radius: 0.625rem`), ombres néon « glow » (`globals.css` l.144-148), dégradés de texte (`globals.css` l.343-373).
- Polices Geist, Geist Mono et Outfit : le combo par défaut de Next.
- Landing en enchaînement standard (Hero, KeyNumbers, HowItWorks, Categories, Sources, Footer), avec dégradés et flous dans `HeroSection`, `NavbarLanding`, `SwipeCard` et `ResultScreen`.

### Données

- `sourceUrl` n'est renseignée que sur 101 cartes sur 369, et 93 de ces 101 pointent vers une page d'accueil (vie-publique.fr ×23, defense.gouv.fr ×15, budget.gouv.fr ×14…).
- 22 URL ont un domaine accentué, donc invalide (`www.défense.gouv.fr`, `économie.gouv.fr`, `écologie.gouv.fr`).
- Fraîcheur : les chiffres reposent surtout sur le PLF 2026 (115 mentions). Le PLF 2027 est publié début octobre 2026.
- CLAUDE.md et le README annoncent 370 cartes ; il y en a 369.

### Sécurité et code mort

- ⚠️ **`src/app/pixee-admin/layout.tsx` ne vérifie que la connexion, pas le rôle** : tout utilisateur Google ou GitHub connecté accède à l'admin. Le lien est aussi exposé dans `BottomNav.tsx:56`.
- Code mort :
  - La waitlist : `src/app/api/waitlist/route.ts` et la table dans `src/db/schema.ts`.
  - `ParisTeaser`, avec `public/PSG-PARIS.svg` et `public/paris.svg`.
  - Les SVG de démo : `public/vercel.svg`, `next.svg`, `file.svg`, `window.svg`, `globe.svg`.
- CLAUDE.md est périmé : il annonce Next 15 au lieu de 16, un dossier `src/components/ui` (shadcn) qui n'existe pas, et 248 tests.

---

## 3. Plan multi-agents

Environ 8 agents. Chacun travaille sur sa propre branche ou worktree, et on les fusionne dans l'ordre indiqué.

```
Phase 1  [D Assainissement] ─► [A Design] [B Données] [C Game design] [E Portage Chiffres/Simulateur]  (en parallèle)
Phase 2  [Fact-check] [Code review] [Audit a11y/perf]
Phase 3  (plus tard) Feed / dossiers éditoriaux
```

### Phase 1

**D. Assainissement** (en premier, car A et C touchent aux mêmes composants)

- [x] Contrôle de rôle admin sur `pixee-admin` : variable d'env `ADMIN_EMAILS` (`src/lib/admin.ts`, refus par défaut). Routes `/api/analytics/dashboard` et `/purge` protégées (session admin ou `ANALYTICS_SECRET`). Lien retiré de `BottomNav`.
- [x] Supprimer la waitlist, `ParisTeaser` et les SVG de démo (migration `drizzle/0002_drop_waitlist.sql` écrite, **non exécutée**).
- [x] Next 16, NextAuth beta, serwist et Sentry ensemble : build prod en `next build --webpack` (sinon `public/sw.js` n'est plus généré), Sentry client dans `src/instrumentation-client.ts`.
- [x] Remettre CLAUDE.md et le README en accord avec la réalité (mis à jour à nouveau après l'intégration finale).

**A. Direction artistique** (après D)

- [x] Direction « data-journalisme » : Source Serif 4 (titres, chiffres), Schibsted Grotesk (texte), IBM Plex Mono (étiquettes) ; utilitaires `kicker` et `numeral` ; palette sobre, couleur réservée au sens. Thème clair ajouté.
- [x] Supprimer les dégradés de texte, les ombres néon et les flous décoratifs.
- [x] Remplacer les emojis des cartes par un pictogramme SVG par catégorie (`CategoryIcon`) et une échelle de montant (`AmountScale`).
- [x] Refaire la landing : entrée directe dans le jeu, un chiffre fort (`src/data/headline.ts`), outils `/chiffres` et `/simulateur`.
- [x] Livrables : design tokens (`globals.css`), `SwipeCard`, `ResultScreen`, landing, OG image.
- [x] Restyle éditorial des encarts de C et des pages de E (fait en Phase 2, branche `refonte/fix-ui`).
- [ ] Emojis d'interface restants : OverviewTab, SessionsTab/JournalTab, PlayerProfileCard, SpeedTab, TopXPTab, AuditScreen/AuditReport, `error.tsx`, champ `icon` de `achievements.ts` (partage). Classes `slate-*` en dur dans InstallBanner et la modale de `/jeu`.

**B. Données** (en parallèle de A et C)

- [x] Correction des 22 domaines accentués.
- [ ] Une `sourceUrl` précise pour chaque carte : 346/369 faites ; 23 cartes sans source et 3 pages d'accueil (edu-12, ene-14, sec-12) restent.
- [x] Champs `year` et `sourceDate` ajoutés au schéma (182 cartes avec `year`).
- [ ] Mise à jour PLF 2027 / PLFSS 2027 (présentés le 1er octobre 2026) : cartes `year: 2026`, `src/data/chiffres.ts`, `src/data/fiscal-2026.ts`.
- [x] Répartition réelle des cartes par niveau : L1=130, L2=130, L3=109 (au moins 2 par niveau et par deck).
- [x] Schéma Zod des cartes et script `npm run data:check`, lancé en CI.

**C. Game design** (en parallèle de A et B)

- [x] Retour après chaque swipe (bandeau `SessionFeedbackBar` au-dessus de la pile) : avis de la communauté, fait marquant, montant cumulé.
- [x] Deck du jour `/jeu/quotidien` : même tirage pour tous (seed = date, heure de Paris), série de jours, partage façon Wordle.
- [x] Mode « Trouve 50 Md€ » (`/jeu/random?mode=budget&target=50`).
- [x] Archétype calculé à partir du contenu ; 18 archétypes (ajout de Bûcheron et Élagueur).
- [x] Badges de compréhension (3) et mini-quiz « à ton avis, combien ? ». Les 19 badges de volume sont conservés (décision ouverte).
- [x] Progression L1 → L2 → L3 débloquée par le jeu (2 sessions par palier).

**E. Portage Chiffres / Simulateur** (en parallèle de A, B et C)

- [x] Reprendre notre code de `/work/projects/NICOLAS/CestNicolasQuiPaye` et l'adapter (barèmes 2026 vérifiés, `src/lib/taxCalculator.ts`, `src/data/fiscal-2026.ts`, `src/data/chiffres.ts`).
- [x] Routes `/chiffres` et `/simulateur`, `ToolsSection` à la place de `EcosystemSection`, sitemap, 51 tests unitaires.
- [ ] Tests e2e Playwright de `/chiffres` et `/simulateur` ; OG image dédiée.

### Phase 2 : Relecture croisée

- [x] **Fact-check** des cartes : 22 constats corrigés, environ 300 cartes relues et alignées sur les sources citées, formulations militantes retirées (branche `refonte/fix-donnees`).
- [ ] **Fact-check** du portage E (`src/data/chiffres.ts` : dette 115,7 vs 115,6 %, population) et du chiffre d'ouverture (1 670 Md€, `src/data/headline.ts`, sans URL).
- [x] **Code review** des branches A et C : 7 constats corrigés (mode budget, sync, formatage unifié, progression, toast PWA à la première visite) ; e2e Playwright adaptés, 14/14 verts sur build de prod (branche `refonte/fix-code`).
- [x] **Audit accessibilité** : 9 constats corrigés (polices préchargées 189 Ko → 68 Ko, annonces du simulateur, focus du quiz, débordement des cartes à 360×640, `theme-color`, contrastes) (branche `refonte/fix-ui`).
- [ ] **Performance réelle** : Lighthouse et swipe à 60 fps sur un vrai mobile milieu de gamme ; `useSwipeGesture` ignore encore `prefers-reduced-motion` au relâchement ; boutons Niveau 1/2/3 à 40 px.

### Phase 3 : Plus tard

- **Le Feed / Dossiers** : rubrique éditoriale native, avec nos propres contenus sourcés.

---

## 4. Décisions ouvertes

**Produit / game design**

1. ✅ Validé 2026-10-02 (statu quo). Couleurs du niveau 2 : en jeu, « Réduire » est en amber et « Injustifié » en rouge, alors que le token `unjustified` est amber. Harmoniser ou garder.
2. ✅ Validé 2026-10-02. Seuils de déblocage (2 sessions N1 → N2, 2 sessions N2 → N3). Les joueurs qui passaient par `?level=` repartent au niveau 1.
3. ✅ Validé 2026-10-02 : gardés. Garder ou supprimer les 19 badges de volume (« jouer 3 sessions du deck X »).
4. Champ `kind` (dépense / recette / agrégat) sur les cartes, pour exclure du deck du jour et du défi les cartes qui ne sont pas des dépenses (fraude fiscale, dette des collectivités…). Le niveau des cartes n'est pas non plus utilisé pour le tirage.
5. Choisir un deck sur `/jeu` désactive le mode budget : un défi budget sur un deck de catégorie n'est accessible que par URL.
6. Table `communityVotes` jamais alimentée (le pourcentage communautaire vient de `votes`) : la supprimer ou la brancher.

**Données**

7. Population de référence : 68 M (cartes, `data:check`) ou 69,1 M (Insee 2026, `/chiffres`).
8. ukr-10 (montant en points de PIB), fre-10, log-16 : exceptions « à vérifier », à convertir ou retirer. Montants dérivés à valider : ukr-01, ret-02, edu-17, fre-05 à fre-08 (clé de contribution UE 17,2 %).
9. Faits ajoutés de mémoire à vérifier : env-09 (ZFE), env-18, env-19, rec-12, ene-15, soc-06, ret-05, soc-18, san-14. URL à vérifier dans un navigateur : num-03, num-13, log-13, fre-06.
10. Sections de la page Chiffres d'origine écartées (recettes détaillées, IR par décile, fraude sociale…) : à réintroduire ou non avec des sources officielles. Hypothèses du simulateur à valider (TVA moyenne 13 % sur 80 % du revenu, parent isolé, un salaire non-cadre).

**Technique**

11. Deux familles de formatage dans `src/lib/format.ts` (éditoriale et tableaux) : garder les deux ou fusionner.
12. Dérive schéma / migrations Drizzle (FK en cascade, `idx_analytics_ip`) à régulariser dans une migration dédiée.
13. `/pixee-admin` renvoie le fallback 404 avec un statut 200 (streaming) : contrôle dans `proxy.ts` ou non.
14. Migrer serwist vers `@serwist/turbopack` pour repasser le build sur Turbopack ; CSP sans `worker-src` (erreur serwist « waiting » observée).
15. `components.json` et `class-variance-authority` subsistent sans composant shadcn.
16. `recomputeStats` reconstruit xp et sessions à partir de l'historique local purgé à 30 jours ; les sessions du deck du jour sont comptées sous `daily`.

## 4 bis. Pour reprendre

1. Relire `refonte/integration` et trancher les décisions ci-dessus.
2. Intégrer le PLF / PLFSS 2027 (agent B).
3. Phase 3 : Feed / dossiers éditoriaux.

## 5. Avant le déploiement de la refonte

0. **Définir `ADMIN_EMAILS` dans Coolify** (sinon plus personne n'accède à `/pixee-admin`) ; vérifier qu'aucun cron n'appelle `/api/analytics/purge` sans `ANALYTICS_SECRET`.
1. **Exporter la table `waitlist` en prod** avant tout `npm run db:migrate`. La migration `drizzle/0002_drop_waitlist.sql` fait un `DROP TABLE IF EXISTS "waitlist"` et efface définitivement les emails inscrits. Exemple : `psql "$DATABASE_URL" -c "\copy waitlist TO 'waitlist-$(date +%F).csv' CSV HEADER"`, puis conserver le fichier hors du serveur.
2. Seulement ensuite, appliquer les migrations (`npm run db:migrate`), qui restent manuelles : elles ne sont pas lancées au déploiement.

## 6. Todo équipe (accès admin)

- [x] **Coolify** : `ADMIN_EMAILS` défini (2026-10-02).
- [~] **SSO admin** : abandonné (2026-10-02). Le back-office se limite à une page Analytics (`/pixee-admin`) ; la connexion Google/GitHub existante + `ADMIN_EMAILS` suffit. À reconsidérer seulement si le back-office grossit.
- [x] Table `waitlist` : 11 inscrits exportés hors serveur, table supprimée en prod (2026-10-02).
- [ ] **Simulateur** : sélecteur « Par mois / Par an » sur tous les montants (saisie et résultats), conservé dans l'URL.
- [ ] **PLF 2027** : présenté le 1er octobre 2026, vote attendu avant le 31 décembre 2026. Mettre à jour cartes et `/chiffres` sur la loi votée (début 2027) ; en attendant, garder la LF 2026.
