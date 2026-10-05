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
- [x] Une `sourceUrl` précise pour chaque carte jouable ; num-10 et num-18 supprimées, 9 cartes à 0 € passées hors jeu (`playable: false`) le 2026-10-02.
- [x] 10 nouvelles cartes sourcées (379 au total) ; compteurs de cartes calculés dans le code (`TOTAL_CARD_COUNT`).
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

## 4. État au 2026-10-05

### En ligne

Phases 1 et 2 livrées et déployées (2026-10-02 → 04) : assainissement et sécurité admin (`ADMIN_EMAILS`), identité colorée restaurée, `/chiffres` avec graphiques, `/simulateur` (vue mensuelle/annuelle), `/lexique`, jeu enrichi (retour après swipe, deck du jour, défi 50 Md€, quiz passable, progression), 368 cartes jouables sourcées (+ 9 hors jeu), jargon remplacé ou défini, images de partage refaites, nom « Budget Swipe » / marque france-finances.com. Table `waitlist` exportée puis supprimée en prod. SSO abandonné. Reclassement « adulte » du domaine (ancien propriétaire, 2023) demandé auprès des filtres : résolu.

### Décisions prises

- Couleurs niveau 2 : statu quo (Réduire amber, Injustifié rouge).
- Seuils de déblocage : 2 sessions par niveau. Badges de volume : gardés.
- Population de référence : 69,1 M (Insee 2026), partout.
- Cartes sans montant officiel : hors jeu (`playable: false`), num-10 et num-18 supprimées.
- Ton : « vous » sur le site, « tu » dans le jeu.

### Vague en cours (2026-10-05)

- [ ] CLAUDE.md aligné sur l'identité colorée (fait sur `chore/docs-solde`).
- [x] Dépendances : PR Dependabot appliquées, Node 22 LTS (Docker, CI, `@types/node`), actions GitHub en v7 ; eslint 10 reporté (plugins de `eslint-config-next` pas encore compatibles) (`chore/deps-polices`).
- [x] Polices embarquées dans le repo (`next/font/local`, mêmes fichiers que Google Fonts, rendu identique) (`chore/deps-polices`).
- [x] Dette (branche `chore/dette`) : table `communityVotes` retirée du schéma, migrations alignées (0003 et 0004, **non exécutées**, voir ci-dessous), vrai 404 sur `/pixee-admin` (`src/proxy.ts`), emojis d'interface remplacés par des pictogrammes, reduced motion au relâchement du swipe, boutons Niveau 1/2/3 et liens de `/infos` et `/contribuer` à 44 px, e2e `/chiffres` et `/simulateur`.
- [x] Champ `kind` (dépense / recette / agrégat) : seules les dépenses dans le deck du jour, le défi 50 Md€, l'archétype et le cumul « tronçonné » (`feat/kind-trend`).
- [x] Champ `trend` : retiré (aucune source), `feat/kind-trend`.
- [x] Bloc « Ce que prévoit le projet de budget 2027 », étiqueté projet (loi votée attendue fin décembre) : section `#budget-2027` de `/chiffres` + bandeau sur l'accueil (`feat/plf-2027`).
- [x] Dossiers éditoriaux (Phase 3) : gabarit `/dossiers` + 3 premiers dossiers en brouillon (`feat/dossiers`).
- [ ] Relire les 3 dossiers et les passer en `publie` (`src/data/dossiers/catalog.ts`).
- [x] Intégration de la vague sur `vague/octobre` (merges `--no-ff`, checks et e2e prod verts).
- [x] Corrections des relectures (`vague/octobre-final`) : titres des brouillons retirés du JS public (navigation calculée côté serveur), deck du jour stable au déploiement (`DAILY_KIND_FILTER_FROM`), dossiers alignés sur la loi de finances 2026 et le projet 2027 (dette, impôt sur le revenu, CSG), cartes cumulées ou ponctuelles en agrégat (`cre-10`, `ukr-09`, `ukr-02`, `cre-04`, `eta-15`, `fre-09`), doublon FEP (`fre-04`) et montants non sourcés (`hop-10`, `cul-14`) hors jeu, avertissement « doublon probable » dans `data:check`, accessibilité de `/dossiers` et du graphique 2026/2027, `engines` Node 22.13.
- [ ] **Déploiement** : le tirage du deck du jour change de règle le `DAILY_KIND_FILTER_FROM` (`src/lib/daily.ts`, 2026-10-06). Déployer au plus tard le 5 octobre 2026 ; sinon, repousser cette date au lendemain du déploiement (et mettre à jour le test qui la fige) pour qu'un deck déjà servi ne change pas en cours de journée.
- [ ] Doublons probables signalés par `data:check` (même montant, même source) à trancher : `san-02`/`hop-01`, `emp-17`/`soc-16`, `cre-05`/`zom-03`, `soc-02`/`ret-06`/`ret-09`, `soc-01`/`ret-10`, `log-09`/`log-17`, `emp-08`/`san-06`, `def-03`/`ukr-11`, `col-20`/`emp-03`, `agr-06`/`agr-11`, `cul-12`/`cul-15` (certains sont deux postes distincts d'un même rapport).
- [ ] `/chiffres` : recettes fiscales de l'État encore au PLF 2026 initial (`STATE_TAX_REVENUE_2026`) ; passer à la loi de finances 2026 (dossier de presse 2027 : impôt sur le revenu 99,8 Md€, TVA 99,8 Md€).
- [ ] `eslint-config-next` en 16.3 alors que `next` est en 16.1 : aligner `next` sur 16.3 dans une PR séparée.
- [ ] Point Analytics (usage réel) et chiffrage hébergement (OVH / o2switch / Vercel).

### Appliquer les migrations 0003 et 0004 (prod)

À faire à la main, après le déploiement du code de `chore/dette` (le code ne lit plus `community_votes`).

- `0003_drop_community_votes.sql` : `DROP TABLE IF EXISTS "community_votes"`. La table n'est ni lue ni écrite par le code ; le pourcentage communautaire vient de `votes`.
- `0004_schema_alignment.sql` : recrée trois clés étrangères en `ON DELETE CASCADE` (`sessions.user_id`, `votes.session_id`, `audit_responses.session_id`) et crée l'index `idx_analytics_ip`. Aucune colonne ni table supprimée ; rejouable (`DROP CONSTRAINT IF EXISTS`, `CREATE INDEX IF NOT EXISTS`). Effet voulu par le schéma : supprimer un compte supprime ses sessions, leurs votes et leurs réponses d'audit.

Procédure :

1. Sauvegarder : `pg_dump -Fc` de la base.
2. Vérifier l'absence de lignes orphelines (sinon l'ajout des clés étrangères échoue et la transaction est annulée ; rien n'est perdu) :
   ```sql
   SELECT count(*) FROM votes v LEFT JOIN sessions s ON s.id = v.session_id WHERE s.id IS NULL;
   SELECT count(*) FROM audit_responses a LEFT JOIN sessions s ON s.id = a.session_id WHERE s.id IS NULL;
   SELECT count(*) FROM sessions s LEFT JOIN users u ON u.id = s.user_id WHERE s.user_id IS NOT NULL AND u.id IS NULL;
   ```
   Lister aussi les clés étrangères existantes. 0004 supprime les contraintes par leur nom Drizzle (`DROP CONSTRAINT IF EXISTS`) : une clé créée autrefois sous un autre nom (`db:push`) resterait en place, en `NO ACTION`, et bloquerait la cascade. La supprimer à la main avant la migration.
   ```sql
   SELECT conrelid::regclass AS table_name, conname, confdeltype
   FROM pg_constraint
   WHERE contype = 'f' AND conrelid IN ('votes'::regclass, 'sessions'::regclass, 'audit_responses'::regclass);
   ```
3. Regarder le journal Drizzle : `SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at;`
   - S'il contient 0000 à 0002 (3 lignes) : `npm run db:migrate` applique 0003 puis 0004.
   - S'il est absent ou incomplet (base créée ou modifiée par `db:push`) : **ne pas** lancer `db:migrate`, qui rejouerait 0000 (`CREATE TABLE` sans `IF NOT EXISTS`) et échouerait. Appliquer les deux fichiers dans une transaction : `psql -v ON_ERROR_STOP=1 -1 -f drizzle/0003_drop_community_votes.sql -f drizzle/0004_schema_alignment.sql`.
4. Choisir un moment calme (la nuit). Dans la transaction, l'ajout de chaque clé étrangère vérifie toutes les lignes existantes et bloque les écritures sur `votes`, `sessions` et `audit_responses` jusqu'à la fin : les fins de partie envoyées à ce moment attendent (quelques secondes vu le volume actuel). `CREATE INDEX` (sans `CONCURRENTLY`, impossible en transaction) bloque de même les écritures sur `analytics_events`. Si les tables ont beaucoup grossi, ajouter plutôt les clés en `NOT VALID` puis lancer `VALIDATE CONSTRAINT` dans une transaction séparée, qui ne bloque pas les écritures.
5. Contrôler : `\d votes`, `\d sessions`, `\d audit_responses` (clés en `ON DELETE CASCADE`), `\di idx_analytics_ip`, `\dt community_votes` (absente). Relancer la requête `pg_constraint` de l'étape 2 : une seule clé par colonne, `confdeltype = 'c'` (cascade).

### Encore ouvert (plus tard)

- PLF / PLFSS 2027 : mettre à jour cartes, `/chiffres` et barèmes du simulateur une fois la loi votée.
- Serwist sur Turbopack (`@serwist/turbopack`) pour quitter `--webpack` ; CSP `worker-src`.
- Deux familles de formatage dans `src/lib/format.ts` ; `components.json` et `class-variance-authority` sans usage.
- `recomputeStats` reconstruit xp/sessions depuis un historique local purgé à 30 jours.
- Plusieurs URL de source par carte (rec-19, emp-04) ; emp-19, rec-20, def-21 à vérifier contre la loi votée.
- Performance réelle sur mobile milieu de gamme (Lighthouse, 60 fps).
