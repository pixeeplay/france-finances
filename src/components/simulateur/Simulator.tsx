"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BarList, StatTile } from "@/components/chiffres/DataBlocks";
import { REFERENCE_SALARIES } from "@/data/fiscal-2026";
import { formatEuros, formatRatio } from "@/lib/format";
import {
  SIMULATOR_LIMITS,
  runFullSimulation,
  serializeSimulatorParams,
  type BudgetItem,
} from "@/lib/taxCalculator";
import type { SimulatorInput } from "@/types/simulator";

const SLIDER_MAX = 150_000;
const SLIDER_STEP = 500;
/** Délai avant d'annoncer la synthèse aux lecteurs d'écran (évite les annonces en rafale pendant le glissement du curseur) */
const ANNOUNCE_DELAY_MS = 400;

interface SimulatorProps {
  initialInput: SimulatorInput;
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

export function Simulator({ initialInput, budgetItems }: SimulatorProps) {
  const [input, setInput] = useState<SimulatorInput>(initialInput);
  const [copied, setCopied] = useState(false);
  const grossId = useId();
  const sliderId = useId();

  const result = useMemo(() => runFullSimulation(input, budgetItems), [input, budgetItems]);
  const { ir, cotisations, tva } = result;

  // Annonce courte et différée de la synthèse (zone sr-only), plutôt qu'un aria-live
  // sur tout le bloc qui serait relu à chaque cran du curseur.
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);
  const summaryText = `Prélèvements estimés ${formatEuros(result.totalPrelevements)}, taux global ${formatRatio(result.tauxEffectifGlobal)}`;
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
      const qs = serializeSimulatorParams(input);
      window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [input]);

  const update = (patch: Partial<SimulatorInput>) => {
    setCopied(false);
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const setGross = (raw: string) => {
    const value = Number.parseInt(raw.replace(/\s/g, ""), 10);
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
    "flex-1 min-h-[44px] rounded-sm text-sm font-semibold transition-colors";
  const toggleOn = "bg-foreground text-background";
  const toggleOff = "text-muted-foreground hover:text-foreground";

  return (
    <div className="space-y-8">
      {/* Saisie */}
      <section aria-labelledby="sim-input-title" className="rounded-md border border-border bg-card p-4 sm:p-6">
        <p className="kicker text-muted-foreground mb-1">Saisie</p>
        <h2 id="sim-input-title" className="text-2xl font-semibold text-foreground mb-4">
          Votre situation
        </h2>

        <label htmlFor={grossId} className="block text-sm font-medium text-foreground">
          Salaire annuel brut
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id={grossId}
            type="number"
            inputMode="numeric"
            min={SIMULATOR_LIMITS.minGross}
            max={SIMULATOR_LIMITS.maxGross}
            step={100}
            value={input.annualGross}
            onChange={(e) => setGross(e.target.value)}
            className="w-full min-h-[44px] rounded-md border border-border bg-background px-3 numeral text-lg text-foreground"
          />
          <span className="kicker text-muted-foreground" aria-hidden="true">€/an</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Soit {formatEuros(input.annualGross / 12)} brut par mois.
        </p>
        <label htmlFor={sliderId} className="sr-only">
          Ajuster le salaire annuel brut
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={Math.min(input.annualGross, SLIDER_MAX)}
          onChange={(e) => setGross(e.target.value)}
          className="mt-3 w-full min-h-[44px] accent-[var(--primary)]"
        />
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update({ annualGross: REFERENCE_SALARIES.smic })}
            className="min-h-[44px] px-3 rounded-md border border-border text-xs text-foreground hover:bg-muted"
          >
            SMIC ({formatEuros(REFERENCE_SALARIES.smic)})
          </button>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Situation familiale</legend>
          <div className="mt-2 flex gap-1 rounded-md bg-muted p-1">
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
              className="w-11 h-11 rounded-full border border-border text-lg text-foreground disabled:opacity-40"
            >
              −
            </button>
            <output aria-live="polite" className="w-8 text-center numeral text-2xl font-semibold">
              {input.nbChildren}
            </output>
            <button
              type="button"
              onClick={() => update({ nbChildren: Math.min(SIMULATOR_LIMITS.maxChildren, input.nbChildren + 1) })}
              disabled={input.nbChildren >= SIMULATOR_LIMITS.maxChildren}
              aria-label="Ajouter un enfant"
              className="w-11 h-11 rounded-full border border-border text-lg text-foreground disabled:opacity-40"
            >
              +
            </button>
            <span className="text-xs text-muted-foreground">{formatPartsLabel(result.nbParts)}</span>
          </div>
        </div>
      </section>

      {/* Synthèse */}
      <section aria-labelledby="sim-summary-title">
        <p className="kicker text-muted-foreground mb-1">Synthèse</p>
        <h2 id="sim-summary-title" className="text-2xl font-semibold text-foreground mb-4">
          Estimation annuelle
        </h2>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <StatTile
            label="Prélèvements estimés"
            value={formatEuros(result.totalPrelevements)}
            detail="cotisations, CSG/CRDS, impôt sur le revenu et TVA"
          />
          <StatTile
            label="Taux global"
            value={formatRatio(result.tauxEffectifGlobal)}
            detail="du salaire brut"
          />
          <StatTile label="Impôt sur le revenu" value={formatEuros(ir.irTotal)} detail={`taux moyen ${formatRatio(ir.effectiveRate)}`} />
          <StatTile label="Net après impôt" value={formatEuros(result.netApresIR)} detail={`${formatEuros(result.netApresIR / 12)} par mois`} />
        </div>
      </section>

      {/* Détail */}
      <section aria-labelledby="sim-detail-title" className="border-t-2 border-foreground pt-4">
        <h2 id="sim-detail-title" className="text-2xl font-semibold text-foreground mb-2">Détail du calcul</h2>
        <dl className="divide-y divide-border">
          <Row label="Salaire brut" value={formatEuros(input.annualGross)} strong />
          <Row label="CSG (9,2 %)" value={`− ${formatEuros(cotisations.csg)}`} />
          <Row label="CRDS (0,5 %)" value={`− ${formatEuros(cotisations.crds)}`} />
          <Row label="Retraite de base" value={`− ${formatEuros(cotisations.retraiteBase)}`} />
          <Row label="Retraite complémentaire (Agirc-Arrco)" value={`− ${formatEuros(cotisations.retraiteComplementaire)}`} />
          <Row label="Salaire net avant impôt" value={formatEuros(result.netAvantIR)} strong />
          <Row label="Revenu net imposable (après abattement de 10 %)" value={formatEuros(result.netImposable)} />
          <Row label={`Impôt avant décote (${formatPartsLabel(ir.nbParts)})`} value={formatEuros(ir.irBrut)} />
          {ir.decote > 0 ? <Row label="Décote" value={`− ${formatEuros(ir.decote)}`} /> : null}
          <Row label="Impôt sur le revenu" value={`− ${formatEuros(ir.irTotal)}`} />
          <Row label="Tranche marginale" value={formatRatio(ir.marginalRate, 0)} />
          <Row label="Salaire net après impôt" value={formatEuros(result.netApresIR)} strong />
          <Row label="TVA estimée sur votre consommation" value={formatEuros(tva.estimatedTVA)} />
        </dl>
        {ir.qfCapped ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Le plafonnement du quotient familial s&apos;applique à votre situation.
          </p>
        ) : null}
      </section>

      {/* Répartition */}
      <section aria-labelledby="sim-budget-title">
        <h2 id="sim-budget-title" className="text-2xl font-semibold leading-tight text-foreground mb-2">
          Si votre impôt sur le revenu et votre TVA suivaient le budget de l&apos;État
        </h2>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Répartition indicative de {formatEuros(ir.irTotal + tva.estimatedTVA)} au prorata des
          crédits des missions de l&apos;État en 2026. En réalité, les recettes ne sont pas affectées
          à une dépense précise, et une partie de la TVA finance la Sécurité sociale et les
          collectivités. Vos cotisations financent la Sécurité sociale.
        </p>
        <BarList
          caption="Répartition indicative de l'impôt sur le revenu et de la TVA par mission"
          items={result.budgetAllocation.map((s) => ({
            label: s.label,
            value: s.amount,
            display: `${formatEuros(s.amount)} · ${formatRatio(s.percentage / 100, 0)}`,
          }))}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-md bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
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

function formatPartsLabel(parts: number): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(parts);
  return `${n} part${parts > 1 ? "s" : ""}`;
}
