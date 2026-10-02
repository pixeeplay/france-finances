/** Types du simulateur fiscal (/simulateur). */

// === SOURCES ===

export interface DataSource {
  /** Libellé de la source (institution + document) */
  label: string;
  /** URL de la page ou du document officiel */
  url: string;
  /** Date de publication ou de mise à jour (AAAA-MM ou AAAA-MM-JJ) */
  date: string;
}

// === BARÈMES ===

export interface TaxBracket {
  /** Borne basse de la tranche (euros, par part) */
  min: number;
  /** Borne haute de la tranche (null = sans plafond) */
  max: number | null;
  /** Taux marginal (0.11 = 11 %) */
  rate: number;
}

// === ENTRÉE ===

export interface SimulatorInput {
  /** Salaire annuel brut (euros) */
  annualGross: number;
  /** true = personne seule, false = couple marié ou pacsé (imposition commune) */
  isSingle: boolean;
  /** Nombre d'enfants à charge */
  nbChildren: number;
}

// === RÉSULTATS ===

export interface TaxBracketResult extends TaxBracket {
  /** Part du revenu (par part) imposée dans cette tranche */
  taxableInBracket: number;
  /** Impôt dû dans cette tranche (par part) */
  taxInBracket: number;
}

export interface IRResult {
  /** Détail par tranche, pour une part */
  brackets: TaxBracketResult[];
  /** Impôt après quotient familial, avant décote */
  irBrut: number;
  /** Montant de la décote appliquée */
  decote: number;
  /** Impôt net dû (arrondi à l'euro) */
  irTotal: number;
  /** Taux moyen d'imposition (IR / revenu net imposable) */
  effectiveRate: number;
  /** Taux marginal d'imposition */
  marginalRate: number;
  /** Nombre de parts de quotient familial */
  nbParts: number;
  /** Revenu net imposable */
  revenuImposable: number;
  /** true si le plafonnement du quotient familial s'applique */
  qfCapped: boolean;
}

export interface SocialContributions {
  csg: number;
  crds: number;
  /** Assurance vieillesse de base (plafonnée + déplafonnée) */
  retraiteBase: number;
  /** Retraite complémentaire Agirc-Arrco (T1, T2, CEG, CET) */
  retraiteComplementaire: number;
  total: number;
}

export interface TVAResult {
  /** Consommation annuelle supposée (euros) */
  consumption: number;
  estimatedTVA: number;
  /** Taux moyen apparent de TVA appliqué à la consommation */
  effectiveRate: number;
}

export interface BudgetShare {
  label: string;
  /** Part des dépenses nettes de l'État (en %) */
  percentage: number;
  /** Montant correspondant (euros) */
  amount: number;
}

export interface TaxSimulationResult {
  input: SimulatorInput;
  nbParts: number;
  /** Salaire net avant impôt sur le revenu */
  netAvantIR: number;
  netImposable: number;
  ir: IRResult;
  cotisations: SocialContributions;
  tva: TVAResult;
  /** Cotisations + CSG/CRDS + IR + TVA estimée */
  totalPrelevements: number;
  /** Salaire net après IR */
  netApresIR: number;
  /** totalPrelevements / salaire brut */
  tauxEffectifGlobal: number;
  /** Ventilation indicative de l'IR + TVA selon les crédits de l'État */
  budgetAllocation: BudgetShare[];
}
