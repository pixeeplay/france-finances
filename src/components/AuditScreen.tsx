"use client";

import { useState } from "react";
import { ChainsawIcon } from "./ChainsawIcon";
import { ShieldIcon } from "./ShieldIcon";
import { ReinforceIcon } from "./ReinforceIcon";
import auditData from "@/data/audit-questions.json";
import type { Card, AuditRecommendation, AuditResponse } from "@/types";

interface AuditScreenProps {
  card: Card;
  cardIndex: number;
  totalCards: number;
  /** The direction from the initial swipe (Level 2 vote) */
  initialDirection?: string;
  onSubmit: (response: AuditResponse) => void;
  onBack: () => void;
}

const questionIcons: Record<string, string> = {
  balance: "⚖️",
  gavel: "⚖️",
  savings: "💰",
};

const recommendationIcons: Record<string, React.ReactNode> = {
  keep: <ShieldIcon size={16} className="text-primary" />,
  reduce: <ChainsawIcon size={16} />,
  externalize: <span className="text-sm" aria-hidden="true">🔄</span>,
  merge: <span className="text-sm" aria-hidden="true">🔀</span>,
  reinforce: <ReinforceIcon size={16} />,
  delete: <span className="text-sm text-danger" aria-hidden="true">✖</span>,
};

export function AuditScreen({
  card,
  cardIndex,
  totalCards,
  initialDirection,
  onSubmit,
  onBack,
}: AuditScreenProps) {
  const [diagnostics, setDiagnostics] = useState<Record<string, boolean>>({});
  const [recommendation, setRecommendation] = useState<AuditRecommendation | null>(null);

  const directionLabel: Record<string, { text: string; colorClass: string }> = {
    keep: { text: "OK", colorClass: "bg-primary/10 text-primary border-primary/20" },
    cut: { text: "A reduire", colorClass: "bg-warning/10 text-warning border-warning/20" },
    reinforce: { text: "A renforcer", colorClass: "bg-info/10 text-info border-info/20" },
    unjustified: { text: "Injustifie", colorClass: "bg-danger/10 text-danger border-danger/20" },
  };

  const dirLabel = initialDirection ? directionLabel[initialDirection] : null;

  const canSubmit = recommendation !== null;

  function handleToggle(questionId: string, value: boolean) {
    setDiagnostics((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit() {
    if (!recommendation) return;
    onSubmit({
      cardId: card.id,
      diagnostics,
      recommendation,
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Retour"
          className="flex items-center justify-center w-10 h-10 min-h-[44px] rounded-full hover:bg-card transition-colors"
        >
          <span className="text-muted-foreground text-lg">&larr;</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Niveau 3 &middot; Carte {cardIndex + 1}/{totalCards}
          </span>
          <span className="text-sm font-bold">Audit</span>
        </div>
        <button
          onClick={onBack}
          aria-label="Fermer l'audit"
          className="w-10 h-10 min-h-[44px] rounded-full bg-card flex items-center justify-center text-muted-foreground hover:bg-danger hover:text-white transition-colors"
        >
          ✕
        </button>
      </header>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 flex flex-col gap-6">
        {/* Card summary */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-background text-2xl">
              {card.icon}
            </div>
            <div>
              <h3 className="font-bold text-foreground line-clamp-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.amountBillions} Md&euro;</p>
            </div>
          </div>
          {dirLabel && (
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${dirLabel.colorClass}`}>
              {dirLabel.text}
            </span>
          )}
        </div>

        {/* Diagnostic questions */}
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-bold px-1">Diagnostic</h3>
          <div className="flex flex-col gap-3">
            {auditData.questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between bg-card p-4 rounded-xl border border-border"
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background text-muted-foreground">
                    <span>{questionIcons[q.icon] || q.icon}</span>
                  </div>
                  <p className="font-medium text-sm leading-tight">{q.text}</p>
                </div>
                <div className="flex bg-muted p-1 rounded-full w-28 shrink-0">
                  <button
                    onClick={() => handleToggle(q.id, true)}
                    className={`flex-1 text-center py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      diagnostics[q.id] === true
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    OUI
                  </button>
                  <button
                    onClick={() => handleToggle(q.id, false)}
                    className={`flex-1 text-center py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      diagnostics[q.id] === false
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    NON
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendation picker */}
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-bold px-1">Quelle solution recommandes-tu ?</h3>
          <div className="flex flex-wrap gap-2">
            {auditData.recommendations.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setRecommendation(rec.id as AuditRecommendation)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
                  recommendation === rec.id
                    ? rec.color === "danger"
                      ? "bg-danger/10 border-danger text-danger"
                      : rec.color === "warning"
                        ? "bg-warning/10 border-warning text-warning"
                        : "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {recommendationIcons[rec.id]}
                {rec.label}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Submit button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6 pb-safe z-40 flex justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Valider mon audit
            <span className="text-base">&rarr;</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
