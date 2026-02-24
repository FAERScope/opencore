// ─── @faerscope/opencore ─────────────────────────────────────────────────────
// Open-source pharmacovigilance opencore for FDA FAERS data.
// Apache-2.0 Licensed.
//
// This package provides the core statistical and data-retrieval primitives
// for building drug safety signal detection tools on top of the openFDA API.
//
// For the full research workbench with advanced features (NMF, E-values,
// co-medication networks, auth, rate limiting), see FAERScope Studio.

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  // Search & configuration
  DedupMode,
  CharacterizationMode,
  SearchParams,
  StudioSearchParams,

  // Data structures
  TrendPoint,
  TrendWithStats,
  ReactionCount,
  ProductCount,

  // Disproportionality
  ContingencyTable,
  DisproportionalityScore,

  // Manifest
  SessionManifest,
} from "./types";

// ── Disproportionality Analysis ──────────────────────────────────────────────
export {
  // Individual metrics
  computePRR,
  computeROR,
  computeROR_CI,
  computeIC,
  computeIC025,
  computeIC975,
  computeChi2,
  chi2PValue1df,

  // Full analysis
  computeDisproportionality,

  // Multiple testing correction
  applyBenjaminiHochberg,

  // Time-series statistics
  movingAverage,
  rollingZScore,
  detectSpikes,
  detectChangepoints,
  yearOverYear,
} from "./disproportionality";

// ── SOC Mapping ──────────────────────────────────────────────────────────────
export { PT_TO_SOC, ALL_SOCS, getSoc } from "./soc-mapping";

// ── openFDA API Client ───────────────────────────────────────────────────────
export type {
  OpenFDAConfig,
  OpenFDAMeta,
  OpenFDACountResult,
  OpenFDAResponse,
} from "./openfda";

export {
  buildSearchString,
  fetchTrend,
  fetchTopReactions,
  fetchTotalReports,
  getDatePreset,
  formatDate,
  formatDateForInput,
  parseDateInput,
} from "./openfda";

// ── Session Manifest ─────────────────────────────────────────────────────────
export type { ComparisonConfig, ManifestInput } from "./manifest";

export {
  sha256,
  canonicalParamsJSON,
  generateStudyId,
  generateManifest,
} from "./manifest";

// ── Utilities ────────────────────────────────────────────────────────────────
export {
  titleCaseTerm,
  dedupLabel,
  charLabel,
  formatDateRange,
} from "./utils";
