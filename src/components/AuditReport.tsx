import type { Card, AuditRecommendation } from "@/types";

export const recommendationLabels: Record<AuditRecommendation, string> = {
  keep: "Maintenir le budget",
  reduce: "Réduire de moitié",
  externalize: "Externaliser",
  merge: "Fusionner",
  reinforce: "Renforcer (+15%)",
  delete: "Suppression totale",
};

export const recommendationColors: Record<AuditRecommendation, string> = {
  keep: "text-muted-foreground",
  reduce: "text-warning",
  externalize: "text-info",
  merge: "text-info",
  reinforce: "text-primary",
  delete: "text-danger",
};

export const recommendationIcons: Record<AuditRecommendation, string> = {
  keep: "\uD83D\uDEE1\uFE0F",
  reduce: "\uD83E\uDE9A",
  externalize: "\uD83D\uDD04",
  merge: "\uD83D\uDD00",
  reinforce: "\uD83D\uDCC8",
  delete: "\u274C",
};

export function AuditReport({ cards, auditResponses }: {
  cards: Card[];
  auditResponses: { cardId: string; diagnostics: Record<string, boolean>; recommendation: AuditRecommendation }[];
}) {
  // Count by recommendation type
  const counts: Record<string, number> = {};
  for (const r of auditResponses) {
    counts[r.recommendation] = (counts[r.recommendation] || 0) + 1;
  }

  // Estimate savings
  let totalSavings = 0;
  for (const r of auditResponses) {
    const card = cards.find((c) => c.id === r.cardId);
    if (!card) continue;
    if (r.recommendation === "reduce") totalSavings += card.amountBillions * 0.5;
    else if (r.recommendation === "delete") totalSavings += card.amountBillions;
    else if (r.recommendation === "reinforce") totalSavings -= card.amountBillions * 0.15;
  }

  const savingsPerCitizen = Math.round((totalSavings * 1e9) / 68e6);

  const summaryItems = [
    { label: "réductions", count: (counts["reduce"] || 0), color: "text-warning border-warning/20 bg-warning/10" },
    { label: "suppressions", count: (counts["delete"] || 0), color: "text-danger border-danger/20 bg-danger/10" },
    { label: "fusions", count: (counts["merge"] || 0) + (counts["externalize"] || 0), color: "text-info border-info/20 bg-info/10" },
    { label: "renforcées", count: (counts["reinforce"] || 0) + (counts["keep"] || 0), color: "text-primary border-primary/20 bg-primary/10" },
  ].filter((s) => s.count > 0);

  return (
    <div className="px-4 py-2 space-y-4">
      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold">
          Sur {auditResponses.length} dépenses auditées :
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm font-medium">
          {summaryItems.map((s) => (
            <span
              key={s.label}
              className={`flex items-center justify-center px-2.5 py-1.5 rounded-md border text-center ${s.color}`}
            >
              {s.count} {s.label}
            </span>
          ))}
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex items-start gap-3">
          <span className="text-2xl">{"\uD83D\uDCB0"}</span>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">Impact estimé</p>
            <p className="text-lg font-bold text-primary font-mono tracking-tight">
              {totalSavings >= 0 ? "-" : "+"}{Math.abs(totalSavings).toFixed(1)} Md&euro; {totalSavings >= 0 ? "d'économies" : "d'investissement"}
            </p>
            <p className="text-sm font-medium text-primary/80">
              soit ~{Math.abs(savingsPerCitizen)}&euro; / contribuable
            </p>
          </div>
        </div>
      </div>

      {/* Detail per card */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Détail du rapport
        </h3>
        <div className="flex flex-col gap-2">
          {auditResponses.map((r) => {
            const card = cards.find((c) => c.id === r.cardId);
            if (!card) return null;
            const rec = r.recommendation as AuditRecommendation;
            return (
              <div key={r.cardId} className="bg-card border border-border p-3 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background text-xl shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight line-clamp-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{card.amountBillions} Md&euro;</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-background text-muted-foreground">
                    Prescription:
                  </span>
                  <span className={`text-xs font-bold ${recommendationColors[rec]}`}>
                    {recommendationIcons[rec]} {recommendationLabels[rec]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
