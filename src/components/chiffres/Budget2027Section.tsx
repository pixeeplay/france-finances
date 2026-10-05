import { UiIcon } from "@/components/icons/UiIcon";
import { BigStat, ChartFigure, DataTable, ThemeSection } from "@/components/chiffres/ChiffresBlocks";
import { SourceNote, SourcesLine } from "@/components/chiffres/DataBlocks";
import { TONE_CLASSES } from "@/components/chiffres/palette";
import {
  HCFP_AVIS_2026_5,
  PLF_2027_DEBT_INTEREST,
  PLF_2027_EFFORT,
  PLF_2027_MEASURES,
  PLF_2027_MISSIONS,
  PLF_2027_ONDAM_TOTAL,
  PLF_2027_PDE,
  PLF_2027_PRESS_KIT,
  PLF_2027_SOCIAL_SECURITY,
  PLF_2027_STATE_BALANCE,
  PLF_2027_TRAJECTORY,
  PLF_2027_UPDATED,
  plf2027Delta,
  type MeasureKind,
  type MissionComparison,
} from "@/data/plf-2027";
import { formatBillionsExact, formatNumber, formatRatio } from "@/lib/format";

/** Nombre de missions tracées dans le graphique (les plus gros budgets 2027). */
const CHART_MISSIONS = 10;

const fmtBn = (v: number) => formatBillionsExact(v);
const fmtPctGdp = (v: number) => formatRatio(v / 100, 1);
const fmtSignedBn = (v: number) => (v > 0 ? `+${fmtBn(v)}` : v < 0 ? `−${fmtBn(-v)}` : "stable");
/** Écart signé sans unité, pour les tableaux dont l'en-tête porte « Md€ » (largeur à 390 px). */
const fmtSignedNumber = (v: number) => (v > 0 ? `+${formatNumber(v, 1)}` : v < 0 ? `−${formatNumber(-v, 1)}` : "0");

function formatFrDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Mention « projet » : visible en tête de section et rappelée sur chaque bloc. */
function ProjectNotice() {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-4 text-sm leading-relaxed text-foreground"
    >
      <span className="shrink-0 self-start rounded-md border-2 border-amber-600 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:border-amber-400 dark:text-amber-400">
        Projet
      </span>
      <p>
        Ces chiffres sont ceux du <strong>projet</strong> de budget présenté par le Gouvernement le 1er octobre 2026.
        Ils ne sont <strong>pas votés</strong> et peuvent évoluer pendant l&apos;examen au Parlement (vote attendu avant
        le 31 décembre 2026). Données relevées le {formatFrDate(PLF_2027_UPDATED)}.
      </p>
    </div>
  );
}

/**
 * Barres appariées 2026 / 2027 : une ligne par poste, barre grise pour la loi
 * votée 2026, barre ambre (rouge pour la dette) pour le projet 2027.
 * Rendu serveur (HTML/CSS), sans bibliothèque.
 */
function PairedBars({ rows }: { rows: readonly MissionComparison[] }) {
  const max = Math.max(...rows.flatMap((r) => [r.lfi2026Bn, r.plf2027Bn]), 1);
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => {
        const delta = plf2027Delta(r);
        const color = r.debt ? "var(--chart-red)" : "var(--chart-amber)";
        return (
          <li key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px] leading-snug">
              <span className={`min-w-0 text-foreground ${r.debt ? "font-bold" : "font-medium"}`}>
                {r.label.replace(/\s*\(.*\)$/, "")}
              </span>
              <span
                className={`shrink-0 font-heading font-extrabold tabular-nums ${
                  delta > 0 ? "text-amber-700 dark:text-amber-400" : delta < 0 ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"
                }`}
              >
                {fmtSignedBn(delta)}
              </span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 rounded-full bg-[var(--chart-slate)] opacity-60" style={{ width: `${(r.lfi2026Bn / max) * 78}%` }} />
                <span className="text-[11px] tabular-nums text-muted-foreground">{fmtBn(r.lfi2026Bn)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-full" style={{ width: `${(r.plf2027Bn / max) * 78}%`, backgroundColor: color }} />
                <span className="font-heading text-xs font-extrabold tabular-nums text-foreground">{fmtBn(r.plf2027Bn)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const KIND_META: Record<MeasureKind, { title: string; dot: string; text: string }> = {
  economie: {
    title: "Moindres dépenses",
    dot: "bg-blue-600 dark:bg-blue-400",
    text: "text-blue-700 dark:text-blue-400",
  },
  recette: {
    title: "Recettes",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  hausse: {
    title: "Hausses de moyens",
    dot: "bg-amber-600 dark:bg-amber-400",
    text: "text-amber-700 dark:text-amber-400",
  },
};

function MeasuresList() {
  const groups: MeasureKind[] = ["economie", "recette", "hausse"];
  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <h3 className="font-heading text-lg sm:text-xl font-bold leading-snug text-foreground">Les principales mesures</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Montants annoncés pour 2027, en milliards d&apos;euros</p>
      <div className="mt-4 space-y-5">
        {groups.map((kind) => {
          const meta = KIND_META[kind];
          return (
            <div key={kind}>
              <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${meta.text}`}>
                <span className={`size-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                {meta.title}
              </p>
              <ul className="mt-2 divide-y divide-border">
                {PLF_2027_MEASURES.filter((m) => m.kind === kind).map((m) => (
                  <li key={m.label} className="flex items-start gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug text-foreground">{m.label}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{m.detail}</p>
                    </div>
                    <span
                      className={`shrink-0 text-right tabular-nums ${
                        m.amountBn === undefined
                          ? "pt-0.5 text-xs text-muted-foreground"
                          : `font-heading text-base font-extrabold ${meta.text}`
                      }`}
                    >
                      {m.amountBn === undefined ? "non chiffré" : `${kind === "hausse" ? "+" : ""}${fmtBn(m.amountBn)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <SourceNote source={PLF_2027_PRESS_KIT} period="projet, octobre 2026" />
    </div>
  );
}

export function Budget2027Section() {
  const [y2025, y2026, y2027] = PLF_2027_TRAJECTORY;
  const { lfi2026, plf2027 } = PLF_2027_STATE_BALANCE;
  const chartRows = [...PLF_2027_MISSIONS].sort((a, b) => b.plf2027Bn - a.plf2027Bn).slice(0, CHART_MISSIONS);
  const interest = PLF_2027_DEBT_INTEREST.publicSector;

  return (
    <ThemeSection
      id="budget-2027"
      tone="amber"
      icon={<UiIcon name="clipboard" size={22} />}
      kicker="Projet de budget 2027 · non voté"
      title="Ce que prévoit le projet de budget 2027"
      punch={
        <>
          Objectif&nbsp;: un déficit public de{" "}
          <span className="text-amber-700 dark:text-amber-400">{fmtPctGdp(-y2027.balancePctGdp)} du PIB</span> en 2027,
          après {fmtPctGdp(-y2026.balancePctGdp)} prévu en 2026.
        </>
      }
      intro={
        <p>
          Le projet de loi de finances (budget de l&apos;État) et le projet de loi de financement de la Sécurité sociale
          ont été présentés en Conseil des ministres le 1er octobre 2026. Le Parlement les examine jusqu&apos;à fin
          décembre.
        </p>
      }
    >
      <ProjectNotice />

      <div className="grid grid-cols-2 gap-3">
        <BigStat
          tone="amber"
          label="Déficit public visé en 2027"
          value={fmtPctGdp(-y2027.balancePctGdp)}
          detail={`du PIB, après ${fmtPctGdp(-y2026.balancePctGdp)} en 2026 (prévision) et ${fmtPctGdp(-y2025.balancePctGdp)} en 2025`}
        />
        <BigStat
          tone="blue"
          label="Effort de redressement annoncé"
          value={fmtBn(PLF_2027_EFFORT.totalBn)}
          detail={`dont ${fmtBn(PLF_2027_EFFORT.newMeasuresBn)} de mesures nouvelles : ${fmtBn(PLF_2027_EFFORT.newSpendingBn)} en dépenses, ${fmtBn(PLF_2027_EFFORT.newRevenueBn)} en recettes`}
        />
        <BigStat
          tone="violet"
          label="Dépenses de l'État prévues"
          value={formatBillionsExact(PLF_2027_PDE.plf2027Bn, 0)}
          detail={`hors intérêts de la dette (« périmètre des dépenses de l'État »), contre ${formatBillionsExact(PLF_2027_PDE.lfi2026Bn, 0)} en 2026`}
        />
        <BigStat
          tone="red"
          label="Intérêts de la dette en 2027"
          value={fmtBn(interest.y2027Bn)}
          detail={`toutes administrations, contre ${fmtBn(interest.y2026Bn)} en 2026 (${fmtSignedBn(Math.round((interest.y2027Bn - interest.y2026Bn) * 10) / 10)})`}
        />
      </div>
      <SourcesLine sources={[PLF_2027_PRESS_KIT, HCFP_AVIS_2026_5]} />

      <ChartFigure
        id="budget-2027-missions"
        title="2026 voté, 2027 en projet : les dix premiers postes de l'État"
        subtitle="Crédits par mission, en milliards d'euros, hors pensions des fonctionnaires. Gris : loi de finances 2026 ; ambre : projet 2027 ; rouge : intérêts de la dette."
        description={`Crédits de paiement des missions du budget général de l'État, hors contributions au compte « Pensions » et hors remboursements et dégrèvements d'impôts : loi de finances pour 2026 (présentée au format du projet 2027) et projet de loi de finances pour 2027. Ce périmètre exclut les retraites des fonctionnaires : les montants ne sont pas comparables avec le graphique « Les dix premiers postes de dépense de l'État » plus haut. La mission « Engagements financiers de l'État » porte la charge de la dette de l'État (${fmtBn(PLF_2027_DEBT_INTEREST.state.lfi2026Bn)} en 2026, ${fmtBn(PLF_2027_DEBT_INTEREST.state.plf2027Bn)} prévus en 2027).`}
        chart={<PairedBars rows={chartRows} />}
        legend={
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-5 rounded-full bg-[var(--chart-slate)] opacity-60" aria-hidden="true" />
              2026, loi votée
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-5 rounded-full bg-[var(--chart-amber)]" aria-hidden="true" />
              2027, projet
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-5 rounded-full bg-[var(--chart-red)]" aria-hidden="true" />
              Intérêts de la dette (projet)
            </li>
          </ul>
        }
        table={
          <DataTable
            caption="Crédits des 31 missions du budget de l'État, loi de finances 2026 et projet 2027"
            columns={[
              { header: "Mission" },
              { header: "2026 (Md€)", numeric: true },
              { header: "2027, projet (Md€)", numeric: true },
              { header: "Écart (Md€)", numeric: true },
            ]}
            rows={[...PLF_2027_MISSIONS]
              .sort((a, b) => b.plf2027Bn - a.plf2027Bn)
              .map((m) => [
                m.label,
                formatNumber(m.lfi2026Bn, 1),
                formatNumber(m.plf2027Bn, 1),
                fmtSignedNumber(plf2027Delta(m)),
              ])}
          />
        }
        source={PLF_2027_PRESS_KIT}
        period="chiffres clés, projet 2027"
      />

      <MeasuresList />

      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <h3 className="font-heading text-lg sm:text-xl font-bold leading-snug text-foreground">La trajectoire prévue</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          État, Sécurité sociale et collectivités, en % du PIB ; budget de l&apos;État et Sécurité sociale en milliards
          d&apos;euros
        </p>
        <div className="mt-3 overflow-x-auto">
          <DataTable
            caption="Trajectoire des finances publiques 2025-2027 selon le projet de budget"
            columns={[{ header: "Indicateur" }, { header: "2025", numeric: true }, { header: "2026", numeric: true }, { header: "2027 projet", numeric: true }]}
            rows={[
              ["Déficit public (% du PIB)", ...PLF_2027_TRAJECTORY.map((p) => fmtPctGdp(-p.balancePctGdp))],
              ["Dette publique (% du PIB)", ...PLF_2027_TRAJECTORY.map((p) => fmtPctGdp(p.debtPctGdp))],
              ["Dépense publique hors crédits d'impôt (% du PIB)", ...PLF_2027_TRAJECTORY.map((p) => fmtPctGdp(p.spendingPctGdp))],
              ["Croissance du PIB en volume", ...PLF_2027_TRAJECTORY.map((p) => fmtPctGdp(p.growthPct))],
              ["Déficit du budget de l'État", "—", fmtBn(-lfi2026.balanceBn), fmtBn(-plf2027.balanceBn)],
              [
                "Déficit de la Sécurité sociale (régimes de base)",
                "—",
                fmtBn(-PLF_2027_SOCIAL_SECURITY.lfss2026.balanceBn),
                fmtBn(-PLF_2027_SOCIAL_SECURITY.plfss2027.balanceBn),
              ],
              [
                `Objectif de dépenses d'assurance maladie (Ondam), +${fmtPctGdp(PLF_2027_ONDAM_TOTAL.growthPct)} en 2027`,
                "—",
                fmtBn(PLF_2027_ONDAM_TOTAL.y2026Bn),
                fmtBn(PLF_2027_ONDAM_TOTAL.y2027Bn),
              ],
            ]}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          2025 : exécution ; 2026 : prévision révisée (budget de l&apos;État et Sécurité sociale : lois votées pour
          2026) ; 2027 : projet. La dépense publique est ici comptée hors crédits d&apos;impôt, d&apos;où un écart avec le
          chiffre de l&apos;Insee cité plus haut.
        </p>
        <SourceNote source={PLF_2027_PRESS_KIT} period="chiffres clés" />
      </div>

      <div className={`rounded-2xl border-l-4 ${TONE_CLASSES.slate.border} ${TONE_CLASSES.slate.soft} px-4 py-3 text-sm leading-relaxed text-foreground`}>
        <p className="font-semibold">L&apos;avis du Haut Conseil des finances publiques</p>
        <p className="mt-1 text-muted-foreground">
          Rendu le 25 septembre 2026 sur le projet, il juge la prévision de croissance de{" "}
          {fmtPctGdp(y2027.growthPct)} pour 2027 « optimiste au regard des dernières évolutions ». Mesuré par rapport à
          2026 (et non par rapport à une évolution « à politique inchangée » comme les{" "}
          {fmtBn(PLF_2027_EFFORT.newMeasuresBn)} du Gouvernement), l&apos;effort structurel serait d&apos;environ{" "}
          {formatBillionsExact(PLF_2027_EFFORT.hcfpStructuralBn, 0)} ({formatNumber(PLF_2027_EFFORT.hcfpStructuralPctGdp, 1)} point de
          PIB). La dette atteindrait près de {formatNumber(Math.round(y2027.debtPctGdp), 0)} % du PIB fin 2027.
        </p>
        <SourceNote source={HCFP_AVIS_2026_5} period="25 septembre 2026" />
      </div>
    </ThemeSection>
  );
}
