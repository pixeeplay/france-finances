export { track } from "./analytics";
export { computeStats, determineArchetype, computeContentProfile, computeSessionResult } from "./archetype";
export { shuffleDeck, drawCards, filterByDeck } from "./deckUtils";
export { computeRadarFromSession, computeRadarFromHistory } from "./radarData";
export { cn } from "./utils";
export { SPRING_SWIPE, SPRING_SNAP, TWEEN_INSTANT } from "./motion-constants";
export {
  formatBillions,
  formatEuros,
  formatPercent,
  amountScalePosition,
  formatRatio,
  formatBillionsExact,
  formatNumber,
} from "./format";
export {
  calculateQFParts,
  calculateQFCeiling,
  calculateSocialContributions,
  calculateNetImposable,
  calculateDecote,
  calculateIR,
  estimateTVA,
  allocateByBudget,
  runFullSimulation,
  parseSimulatorParams,
  serializeSimulatorParams,
  DEFAULT_SIMULATOR_INPUT,
  SIMULATOR_LIMITS,
} from "./taxCalculator";
export {
  splitPer1000,
  perCapita,
  perCapitaComparison,
  topWithRest,
  toBarData,
  toShares,
  debtSeries,
  debtChangePoints,
  euDebtBars,
  shortenLabel,
} from "./chiffresCharts";
