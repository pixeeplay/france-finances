// === CARD ===
export interface Card {
  id: string;
  /** Titre court de la dépense */
  title: string;
  /** Sous-titre / intitulé budgétaire officiel */
  subtitle: string;
  /** Description factuelle de la dépense */
  description: string;
  /** Montant en milliards d'euros */
  amountBillions: number;
  /** Coût annuel par citoyen (basé sur ~68M habitants) */
  costPerCitizen: number;
  /** Catégorie/deck d'appartenance */
  deckId: string;
  /** Emoji ou icône représentative */
  icon: string;
  /** Évolution sur 5 ans en pourcentage (ex: +12.5) */
  trend?: number;
  /** Source officielle */
  source: string;
  /** URL de la source */
  sourceUrl?: string;
  /** Niveau de difficulté (1 = swipe simple, 2 = 4 directions, 3 = micro-audit) */
  level: 1 | 2 | 3;
  /** Tags pour le filtrage */
  tags?: string[];
}

// === DECK ===
export interface Deck {
  id: string;
  /** Nom du deck/catégorie */
  name: string;
  /** Description courte */
  description: string;
  /** Emoji du deck */
  icon: string;
  /** Couleur associée (hex) */
  color: string;
  /** Nombre de cartes dans le deck */
  cardCount: number;
  /** Image/SVG du deck */
  image?: string;
  /** Type de deck : main (catégorie) ou thematic (événementiel) */
  type?: "main" | "thematic";
  /** Le deck a-t-il déjà été joué ? */
  played?: boolean;
}

// === VOTE ===
export type VoteDirection = "keep" | "cut" | "reinforce" | "unjustified";

export interface Vote {
  cardId: string;
  direction: VoteDirection;
  /** Temps passé sur la carte en ms */
  duration: number;
  /** Timestamp du vote */
  timestamp: number;
}

// === SESSION ===
export interface Session {
  id: string;
  deckId: string;
  /** Niveau de jeu */
  level: 1 | 2 | 3;
  /** Cartes de la session (dans l'ordre) */
  cards: Card[];
  /** Votes enregistrés */
  votes: Vote[];
  /** Index de la carte courante */
  currentIndex: number;
  /** Timestamp de début */
  startedAt: number;
  /** Timestamp de fin */
  endedAt?: number;
  /** Durée totale en ms */
  totalDuration?: number;
  /** Session terminée ? */
  completed: boolean;
  /** Audit responses for Level 3 */
  auditResponses?: AuditResponse[];
}

// === ARCHETYPE ===
export interface Archetype {
  id: string;
  /** Nom de l'archétype */
  name: string;
  /** Emoji */
  icon: string;
  /** Citation/tagline */
  tagline: string;
  /** Description longue */
  description: string;
  /** Niveau requis */
  level: 1 | 2 | 3;
  /** Condition de déclenchement */
  condition: ArchetypeCondition;
}

export interface ArchetypeCondition {
  /** Pourcentage minimum de "cut" */
  minCutPercent?: number;
  /** Pourcentage maximum de "cut" */
  maxCutPercent?: number;
  /** Pourcentage minimum de "keep" */
  minKeepPercent?: number;
  /** Pourcentage maximum de "keep" */
  maxKeepPercent?: number;
  /** Durée maximum en secondes (pour Speedrunner) */
  maxDurationSeconds?: number;
}

// === AUDIT (Level 3) ===
export interface AuditQuestion {
  id: string;
  /** Icon name or emoji */
  icon: string;
  /** Question text */
  text: string;
}

export type AuditRecommendation = "reduce" | "externalize" | "merge" | "delete" | "reinforce" | "keep";

export interface AuditResponse {
  cardId: string;
  /** Answers to the 3 diagnostic questions (true = OUI, false = NON) */
  diagnostics: Record<string, boolean>;
  /** Chosen recommendation */
  recommendation: AuditRecommendation;
}

// === STATS ===
export interface SessionStats {
  totalCards: number;
  keepCount: number;
  cutCount: number;
  reinforceCount?: number;
  unjustifiedCount?: number;
  keepPercent: number;
  cutPercent: number;
  totalDurationSeconds: number;
  averageDurationPerCard: number;
  archetype: Archetype;
}

// === NAVIGATION ===
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
