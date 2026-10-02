export { track } from "./analytics";
export { computeStats, determineArchetype } from "./archetype";
export { shuffleDeck, drawCards, filterByDeck } from "./deckUtils";
export { computeRadarFromSession, computeRadarFromHistory } from "./radarData";
export { cn } from "./utils";
export { SPRING_SWIPE, SPRING_SNAP, TWEEN_INSTANT } from "./motion-constants";
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
export { formatEuros, formatPercent, formatBillions, formatNumber } from "./format";
