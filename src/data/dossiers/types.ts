/**
 * Modèle des dossiers éditoriaux (/dossiers).
 *
 * Un dossier est un article court, neutre et sourcé. Le contenu est écrit en
 * TypeScript (pas de CMS) : chaque paragraphe renvoie aux sources qui étayent
 * ses chiffres (`refs`), numérotées dans l'ordre de la liste `sources`.
 *
 * Publication : seuls les dossiers `status: "publie"` sont visibles en
 * production ; les brouillons s'affichent en développement avec un bandeau.
 */
import type { ChartTone } from "@/lib/chiffresCharts";
import type { DataSource } from "@/types/simulator";

export type DossierStatus = "brouillon" | "publie";

/** Métadonnées légères (navigation, liste, sitemap) : sans le corps du texte. */
export interface DossierMeta {
  slug: string;
  title: string;
  /** Chapeau : une à deux phrases, reprises en description (SEO, partage) */
  description: string;
  /** Surtitre court (« Sécurité sociale », « Dette publique »…) */
  kicker: string;
  /** Catégorie du jeu qui donne sa couleur et son pictogramme au dossier */
  deckId: string;
  status: DossierStatus;
  /** Date de rédaction ou de publication (AAAA-MM-JJ) */
  publishedAt: string;
  /** Dernière mise à jour des chiffres (AAAA-MM-JJ) */
  updatedAt: string;
  /** Chiffre-clé de l'image de partage */
  ogFigure: { value: string; label: string };
}

export interface DossierSource extends DataSource {
  /** Identifiant local, cité par les `refs` des blocs */
  id: string;
}

/** Ligne d'un mini-graphique en barres. */
export interface DossierBarRow {
  label: string;
  value: number;
  /** Valeur affichée au bout de la barre */
  display: string;
  tone: ChartTone;
  highlight?: boolean;
}

interface ChartBase {
  id: string;
  title: string;
  subtitle?: string;
  /** Note de méthode (repliée avec le tableau de données) */
  description: string;
}

/** Barres horizontales (composant BarsChart de /chiffres). */
export interface DossierBarsChart extends ChartBase {
  kind: "bars";
  rows: readonly DossierBarRow[];
  /** Nom de la valeur dans l'info-bulle (« Montant », « Impôt moyen »…) */
  valueName?: string;
  /** En-têtes du tableau de données : libellé, valeur */
  columns: readonly [string, string];
  /** Lignes du tableau, si elles diffèrent des barres tracées (ex. valeurs négatives) */
  tableRows?: readonly (readonly [string, string])[];
  /** Identifiant de la source (dans `sources`) */
  source: string;
  period: string;
}

/** Dette publique en % du PIB (composant DebtAreaChart, données de /chiffres). */
export interface DossierDebtChart extends ChartBase {
  kind: "debt";
}

export type DossierChart = DossierBarsChart | DossierDebtChart;

export type DossierBlock =
  | { type: "p"; text: string; refs?: readonly string[] }
  | { type: "list"; items: readonly string[]; refs?: readonly string[] }
  /** Encadré « Le chiffre » */
  | { type: "chiffre"; value: string; label: string; detail?: string; tone: ChartTone; refs: readonly string[] }
  | { type: "chart"; chart: DossierChart };

export interface DossierSection {
  /** Ancre du sommaire */
  id: string;
  title: string;
  blocks: readonly DossierBlock[];
}

export interface DossierBody {
  slug: string;
  sections: readonly DossierSection[];
  /** Cartes du jeu liées (« Joue ces cartes »), cartes jouables uniquement */
  cardIds: readonly string[];
  sources: readonly DossierSource[];
}

export interface Dossier extends DossierMeta, DossierBody {}
