"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BarList } from "@/components/chiffres/DataBlocks";
import { REFERENCE_SALARIES } from "@/data/fiscal-2026";
import { formatEuros, formatRatio } from "@/lib/format";
import {
  SIMULATOR_LIMITS,
  runFullSimulation,
  serializeSimulatorParams,
  type BudgetItem,
  type SimulatorPeriod,
} from "@/lib/taxCalculator";
import type { SimulatorInput } from "@/types/simulator";

const SLIDER_MAX = 150_000;
const SLIDER_STEP = 500;
/** Délai avant d'annoncer la synthèse aux lecteurs d'écran (évite les annonces en rafale pendant le glissement du curseur) */
const ANNOUNCE_DELAY_MS = 400;

/** Curseur en vue mensuelle : jusqu'à 12 500 € par mois, pas de 50 € */
const SLIDER_STEP_MONTHLY = 50;

interface SimulatorProps {
  initialInput: SimulatorInput;
  initialPeriod?: SimulatorPeriod;
  budgetItems: readonly BudgetItem[];
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-2 text-sm ${strong ? "font-semibold" : ""}`}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={`shrink-0 whitespace-nowrap numeral text-foreground ${strong ? "text-base" : ""}`}>{value}</dd>
    </div>
  );
}

export function Simulator({ initialInput, initialPeriod = "an", budgetItems }: SimulatorProps) {
  const [input, setInput] = useState<SimulatorInput>(initialInput);
  const [period, setPeriod] = useState<SimulatorPeriod>(initialPeriod);
  const monthly = period === "mois";
  /** Montant annuel ramené à la vue choisie (par mois ou par an) */
  const p = (annual: number) => (monthly ? annual / 12 : annual);
  const perLabel = monthly ? "par mois" : "par an";
  const [copied, setCopied] = useState(false);
  const grossId = useId();
  const sliderId = useId();

  const result = useMemo(() => runFullSimulation(input, budgetItems), [input, budgetItems]);
  const { ir, cotisations, tva } = result;

  // Annonce courte et différée de la synthèse (zone sr-only), plutôt qu'un aria-live
  // sur tout le bloc qui serait relu à chaque cran du curseur.
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);
  const summaryText = `Prélèvements estimés ${formatEuros(p(result.totalPrelevements))} ${perLabel}, taux global ${formatRatio(result.tauxEffectifGlobal)}`;
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = window.setTimeout(() => setAnnouncement(summaryText), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [summaryText]);

  // Garde l'URL partageable synchronisée avec la saisie, sans recharger la page.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const qs = serializeSimulatorParams(input, period);
      window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [input, period]);

  const update = (patch: Partial<SimulatorInput>) => {
    setCopied(false);
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const setGross = (raw: string) => {
    const parsed = Number.parseInt(raw.replace(/\s/g, ""), 10);
    const value = monthly ? parsed * 12 : parsed;
    update({
      annualGross: Number.isFinite(value)
        ? Math.min(SIMULATOR_LIMITS.maxGross, Math.max(SIMULATOR_LIMITS.minGross, value))
        : 0,
    });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mon estimation — france-finances.com", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Partage annulé ou presse-papiers indisponible : rien à faire.
    }
  };

  const toggleBase =
    "flex-1 min-h-[44px] rounded-full text-sm font-semibold transition-colors";
  const toggleOn = "bg-brand text-white";
  const toggleOff = "text-muted-foreground hover:text-foreground";

  return (
    // Desktop : saisie collante à gauche, résultats à droite (la saisie reste
    // visible pendant la lecture du détail).
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
      {/* Saisie */}
      <section
        aria-labelledby="sim-input-title"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:col-span-5 lg:row-span-4 lg:sticky lg:top-24"
      >
        <p className="kicker text-info mb-1">Saisie</p>
        <h2 id="sim-input-title" className="text-2xl font-extrabold text-foreground mb-4">
          Votre situation
        </h2>

        <fieldset className="mb-5">
          <legend className="text-sm font-medium text-foreground">Afficher les montants</legend>
          <div className="mt-2 flex gap-1 rounded-xl bg-muted p-1">
            {(["mois", "an"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={period === v}
                onClick={() => setPeriod(v)}
                className={`${toggleBase} ${period === v ? toggleOn : toggleOff}`}
              >
                {v === "mois" ? "Par mois" : "Par an"}
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor={grossId} className="block text-sm font-medium text-foreground">
          {monthly ? "Salaire mensuel brut" : "Salaire annuel brut"}
        </label>
        <div className="relative mt-2">
          <input
            id={grossId}
            type="number"
            inputMode="numeric"
            min={SIMULATOR_LIMITS.minGross}
            max={SIMULATOR_LIMITS.maxGross}
            step={monthly ? 10 : 100}
            value={monthly ? Math.round(input.annualGross / 12) : input.annualGross}
            onChange={(e) => setGross(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-border bg-background pl-3 pr-14 numeral text-lg text-foreground"
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 kicker text-muted-foreground"
            aria-hidden="true"
          >
            {monthly ? "€/mois" : "€/an"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {monthly
            ? `Soit ${formatEuros(input.annualGross)} brut par an.`
            : `Soit ${formatEuros(input.annualGross / 12)} brut par mois.`}
        </p>
        <label htmlFor={sliderId} className="sr-only">
          {monthly ? "Ajuster le salaire mensuel brut" : "Ajuster le salaire annuel brut"}
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={monthly ? SLIDER_MAX / 12 : SLIDER_MAX}
          step={monthly ? SLIDER_STEP_MONTHLY : SLIDER_STEP}
          value={monthly ? Math.min(Math.round(input.annualGross / 12), SLIDER_MAX / 12) : Math.min(input.annualGross, SLIDER_MAX)}
          onChange={(e) => setGross(e.target.value)}
          className="mt-3 w-full min-h-[44px] accent-[var(--brand-fg)]"
        />
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Repères :</span>
          {[
            { label: "SMIC", value: REFERENCE_SALARIES.smic },
            { label: "2 × SMIC", value: REFERENCE_SALARIES.smic * 2 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={input.annualGross === preset.value}
              onClick={() => update({ annualGross: preset.value })}
              className={`min-h-[44px] px-4 rounded-full text-xs font-bold transition-colors ${
                input.annualGross === preset.value ? "bg-brand text-white" : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {preset.label} ({formatEuros(p(preset.value))})
            </button>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Situation familiale</legend>
          <div className="mt-2 flex gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              aria-pressed={input.isSingle}
              onClick={() => update({ isSingle: true })}
              className={`${toggleBase} ${input.isSingle ? toggleOn : toggleOff}`}
            >
              Seul(e)
            </button>
            <button
              type="button"
              aria-pressed={!input.isSingle}
              onClick={() => update({ isSingle: false })}
              className={`${toggleBase} ${!input.isSingle ? toggleOn : toggleOff}`}
            >
              En couple
            </button>
          </div>
          {!input.isSingle ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Couple marié ou pacsé, imposition commune. Le simulateur suppose un seul salaire dans le foyer.
            </p>
          ) : null}
        </fieldset>

        <div className="mt-6">
          <p id="sim-children" className="text-sm font-medium text-foreground">Enfants à charge</p>
          <div className="mt-2 flex items-center gap-3" role="group" aria-labelledby="sim-children">
            <button
              type="button"
              onClick={() => update({ nbChildren: Math.max(0, input.nbChildren - 1) })}
              disabled={input.nbChildren === 0}
              aria-label="Retirer un enfant"
              className="w-11 h-11 rounded-full bg-muted text-lg font-bold text-foreground hover:bg-info/20 disabled:opacity-40"
            >
              −
            </button>
            <output aria-live="polite" className="w-8 text-center numeral text-2xl">
              {input.nbChildren}
            </output>
            <button
              type="button"
              onClick={() => update({ nbChildren: Math.min(SIMULATOR_LIMITS.maxChildren, input.nbChildren + 1) })}
              disabled={input.nbChildren >= SIMULATOR_LIMITS.maxChildren}
              aria-label="Ajouter un enfant"
              className="w-11 h-11 rounded-full bg-muted text-lg font-bold text-foreground hover:bg-info/20 disabled:opacity-40"
            >
              +
            </button>
            <span className="text-xs text-muted-foreground">{formatPartsLabel(result.nbParts)}</span>
          </div>
        </div>
      </section>

      {/* Synthèse */}
      <section aria-labelledby="sim-summary-title" className="lg:col-span-7 lg:col-start-6">
        <p className="kicker text-danger mb-1">Synthèse</p>
        <h2 id="sim-summary-title" className="text-2xl font-extrabold text-foreground mb-4">
          {monthly ? "Estimation par mois" : "Estimation par an"}
        </h2>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SimTile
            tone="danger"
            label="Prélèvements estimés"
            value={formatEuros(p(result.totalPrelevements))}
            detail="cotisations, CSG/CRDS, impôt sur le revenu et TVA"
          />
          <SimTile
            tone="warning"
            label="Taux global"
            value={formatRatio(result.tauxEffectifGlobal)}
            detail="du salaire brut"
          />
          <SimTile tone="info" label="Impôt sur le revenu" value={formatEuros(p(ir.irTotal))} detail={`taux moyen ${formatRatio(ir.effectiveRate)}`} />
          <SimTile tone="primary" label="Net après impôt" value={formatEuros(p(result.netApresIR))} detail={monthly ? `${formatEuros(result.netApresIR)} par an` : `${formatEuros(result.netApresIR / 12)} par mois`} />
        </div>
      </section>

      {/* Détail */}
      <section
        aria-labelledby="sim-detail-title"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:col-span-7 lg:col-start-6"
      >
        <h2 id="sim-detail-title" className="text-2xl font-extrabold text-foreground mb-2">
          Détail du calcul <span className="text-base font-semibold text-muted-foreground">({perLabel})</span>
        </h2>
        <dl className="divide-y divide-border">
          <Row label="Salaire brut" value={formatEuros(p(input.annualGross))} strong />
          <Row label="CSG, contribution sociale généralisée (9,2 %)" value={`− ${formatEuros(p(cotisations.csg))}`} />
          <Row label="CRDS, remboursement de la dette sociale (0,5 %)" value={`− ${formatEuros(p(cotisations.crds))}`} />
          <Row label="Retraite de base" value={`− ${formatEuros(p(cotisations.retraiteBase))}`} />
          <Row label="Retraite complémentaire (Agirc-Arrco)" value={`− ${formatEuros(p(cotisations.retraiteComplementaire))}`} />
          <Row label="Salaire net avant impôt" value={formatEuros(p(result.netAvantIR))} strong />
          <Row label="Revenu imposable (net moins 10 % pour frais professionnels)" value={formatEuros(p(result.netImposable))} />
          <Row label={`Impôt avant décote (${formatPartsLabel(ir.nbParts)})`} value={formatEuros(p(ir.irBrut))} />
          {ir.decote > 0 ? <Row label="Décote (réduction pour revenus modestes)" value={`− ${formatEuros(p(ir.decote))}`} /> : null}
          <Row label="Impôt sur le revenu" value={`− ${formatEuros(p(ir.irTotal))}`} />
          <Row label="Taux de votre tranche la plus haute (tranche marginale)" value={formatRatio(ir.marginalRate, 0)} />
          <Row label="Salaire net après impôt" value={formatEuros(p(result.netApresIR))} strong />
          <Row label="TVA estimée sur votre consommation" value={formatEuros(p(tva.estimatedTVA))} />
        </dl>
        {ir.qfCapped ? (
          <p className="mt-3 text-xs text-muted-foreground">
            L&apos;avantage fiscal des parts supplémentaires (quotient familial) est plafonné dans votre situation.
          </p>
        ) : null}
      </section>

      {/* Répartition */}
      <section
        aria-labelledby="sim-budget-title"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:col-span-7 lg:col-start-6"
      >
        <h2 id="sim-budget-title" className="text-2xl font-extrabold leading-tight text-foreground mb-2">
          Si votre impôt sur le revenu et votre TVA suivaient le budget de l&apos;État
        </h2>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Répartition indicative de {formatEuros(p(ir.irTotal + tva.estimatedTVA))} {perLabel} au prorata des
          dépenses prévues pour chaque grand poste du budget de l&apos;État en 2026. En réalité, les recettes ne sont pas affectées
          à une dépense précise, et une partie de la TVA finance la Sécurité sociale et les
          collectivités. Vos cotisations financent la Sécurité sociale.
        </p>
        <BarList
          caption="Répartition indicative de l'impôt sur le revenu et de la TVA par poste du budget de l'État"
          items={result.budgetAllocation.map((s) => ({
            label: s.label,
            value: s.amount,
            display: `${formatEuros(p(s.amount))} · ${formatRatio(s.percentage / 100, 0)}`,
          }))}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3 lg:col-span-7 lg:col-start-6">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-brand text-white font-heading font-bold text-sm hover:bg-brand-hover transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copied ? "Lien copié" : "Partager cette simulation"}
        </button>
        <span className="sr-only" role="status">
          {copied ? "Lien de la simulation copié dans le presse-papiers" : ""}
        </span>
      </div>
    </div>
  );
}

const TONES = {
  danger: "bg-danger/10 border-danger/25 text-danger",
  warning: "bg-warning/10 border-warning/25 text-warning",
  info: "bg-info/10 border-info/25 text-info",
  primary: "bg-primary/10 border-primary/25 text-primary",
} as const;

/** Chiffre-clé de la synthèse, dans une tuile colorée. */
function SimTile({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone: keyof typeof TONES }) {
  return (
    <div className={`rounded-2xl border p-4 ${TONES[tone]}`}>
      <p className="kicker">{label}</p>
      <p className="mt-1 numeral text-2xl sm:text-3xl leading-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground leading-snug">{detail}</p> : null}
    </div>
  );
}

function formatPartsLabel(parts: number): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(parts);
  return `${n} part${parts > 1 ? "s" : ""}`;
}
