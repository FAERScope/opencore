// ─── @faerscope/opencore — Type Definitions ─────────────────────────────────
// Public type definitions for pharmacovigilance signal detection.
// These types model the core data structures used across the library.

// ─── Deduplication & Characterization ─────────────────────────────────────────

/**
 * Deduplication strategy applied at the openFDA API search-string level.
 *
 * - `"raw"` — No deduplication; returns all reports including known duplicates.
 * - `"filtered"` — Excludes reports flagged as duplicates by the FDA.
 * - `"strict"` — Initial spontaneous reports only (report type 1, non-duplicate,
 *   with company number). Most conservative but may exclude valid reports.
 *
 * @see https://open.fda.gov/apis/drug/event/searchable-fields/ — `duplicate` and `reporttype` fields
 */
export type DedupMode = "raw" | "filtered" | "strict";

/**
 * Drug characterization filter. Controls which drug roles are included
 * in the analysis.
 *
 * - `"all"` — All drug roles (suspect, concomitant, interacting).
 * - `"suspect"` — Only drugs marked as suspect (characterization = 1).
 * - `"suspect_interacting"` — Suspect + interacting drugs (characterization 1 or 3).
 *
 * @see https://open.fda.gov/apis/drug/event/searchable-fields/ — `patient.drug.drugcharacterization`
 */
export type CharacterizationMode = "all" | "suspect" | "suspect_interacting";

// ─── Search Parameters ────────────────────────────────────────────────────────

/**
 * Basic search parameters for openFDA drug/event queries.
 * Used by the free-tier FAERScope tool.
 */
export interface SearchParams {
  /** Drug name (generic or brand). Case-insensitive; uppercased internally. */
  drug: string;
  /** Start date in YYYYMMDD format. */
  dateFrom: string;
  /** End date in YYYYMMDD format. */
  dateTo: string;
  /** If true, restrict to serious reports only (serious:1). */
  serious?: boolean;
  /** openFDA API key. Optional but recommended to avoid rate limits. */
  apiKey?: string;
}

/**
 * Extended search parameters with Studio-specific filters.
 * Adds deduplication and drug characterization controls.
 */
export interface StudioSearchParams extends SearchParams {
  /** Deduplication strategy. */
  dedupMode: DedupMode;
  /** Drug characterization filter. */
  charMode: CharacterizationMode;
}

// ─── Trend Data ───────────────────────────────────────────────────────────────

/**
 * A single point in a time-series trend of adverse event reports.
 */
export interface TrendPoint {
  /** Date string in YYYYMMDD format (from openFDA `receivedate` aggregation). */
  time: string;
  /** Number of reports received on this date. */
  count: number;
  /** Human-readable date label (e.g., "2024-01-15"). */
  label: string;
}

/**
 * A trend point enriched with statistical annotations.
 * Produced by {@link detectSpikes}.
 */
export interface TrendWithStats extends TrendPoint {
  /** Moving average value at this point. Undefined for initial window. */
  ma?: number;
  /** Z-score from rolling window. Undefined for insufficient window. */
  zScore?: number;
  /** Whether this point is flagged as a statistical spike. */
  isSpike?: boolean;
}

// ─── Reactions ────────────────────────────────────────────────────────────────

/**
 * A MedDRA Preferred Term with its report count.
 */
export interface ReactionCount {
  /** MedDRA Preferred Term (e.g., "NAUSEA", "HEADACHE"). */
  term: string;
  /** Number of reports containing this reaction. */
  count: number;
}

/**
 * A drug product name with its report count.
 */
export interface ProductCount {
  /** Medicinal product name as reported. */
  term: string;
  /** Number of reports containing this product. */
  count: number;
}

// ─── Disproportionality Analysis ──────────────────────────────────────────────

/**
 * The 2x2 contingency table for a drug-reaction pair.
 *
 * ```
 *                  Reaction    NOT Reaction
 *   Drug             a             b          a+b
 *   NOT Drug         c             d          c+d
 *                   a+c           b+d          N
 * ```
 *
 * @see Evans, S.J.W., Waller, P.C., & Davis, S. (2001).
 *      Use of proportional reporting ratios (PRRs) for signal generation
 *      from spontaneous adverse drug reaction reports.
 *      Pharmacoepidemiology and Drug Safety, 10(6), 483-486.
 */
export interface ContingencyTable {
  /** Reports with BOTH the drug AND the reaction. */
  a: number;
  /** Reports with the drug but NOT the reaction. */
  b: number;
  /** Reports with the reaction but NOT the drug. */
  c: number;
  /** Reports with NEITHER the drug NOR the reaction. */
  d: number;
  /** Total reports (a + b + c + d). */
  n: number;
}

/**
 * Complete disproportionality analysis result for a single drug-reaction pair.
 * Contains PRR, ROR, IC, confidence intervals, and signal classification.
 */
export interface DisproportionalityScore {
  /** MedDRA Preferred Term. */
  reaction: string;
  /** Raw report count for this drug-reaction pair. */
  count: number;
  /** The 2x2 contingency table. */
  table: ContingencyTable;

  // ── PRR (Proportional Reporting Ratio) ──
  /** PRR = (a/(a+b)) / (c/(c+d)). Values >1 indicate disproportionate reporting. */
  prr: number;
  /** Chi-squared statistic for the PRR (1 degree of freedom). */
  prrChi2: number;
  /** P-value from the chi-squared test. */
  prrPValue: number;

  // ── ROR (Reporting Odds Ratio) ──
  /** ROR = (a*d) / (b*c). Analogous to an odds ratio. */
  ror: number;
  /** Lower bound of the 95% CI for ROR (Woolf logit method). */
  rorLower95: number;
  /** Upper bound of the 95% CI for ROR. */
  rorUpper95: number;

  // ── IC (Information Component) ──
  /** IC = log2(observed / expected). Bayesian shrinkage measure. */
  ic: number;
  /** Lower 2.5% credibility bound of IC. IC025 > 0 suggests a signal. */
  ic025: number;
  /** Upper 97.5% credibility bound of IC. */
  ic975: number;

  // ── Signal Classification ──
  /**
   * Evans signal criteria: PRR >= 2 AND chi-squared >= 4 AND case count >= 3.
   * @see Evans et al. (2001)
   */
  isSignal: boolean;
  /**
   * Strong signal: ROR lower 95% CI > 1 AND IC025 > 0.
   * Requires both frequentist and Bayesian evidence.
   */
  isStrongSignal: boolean;
  /**
   * Benjamini-Hochberg FDR-corrected p-value.
   * Populated after batch correction via {@link applyBenjaminiHochberg}.
   */
  fdrPValue?: number;
}

// ─── Session Manifest ─────────────────────────────────────────────────────────

/**
 * Full reproducibility manifest for an analysis session.
 * Contains all parameters, dataset metadata, results summary,
 * and compliance disclaimers needed to reproduce or audit the analysis.
 */
export interface SessionManifest {
  // ── Identification ──
  /** Deterministic Study ID: `FS-{first 8 hex chars of SHA-256}`. */
  studyId: string;
  /** Full SHA-256 hash of the canonical parameters JSON. */
  fullHash: string;

  // ── Query Parameters ──
  drug: string;
  comparatorDrug: string | null;
  dateRange: { from: string; to: string };
  seriousOnly: boolean;
  dedupMode: DedupMode;
  charMode: CharacterizationMode;

  // ── Dataset Metadata ──
  dataSource: "FDA FAERS via openFDA API";
  endpointBase: string;
  endpointVersion: "drug/event.json";
  /** Note about FAERS quarterly update cycle and data freshness. */
  datasetNote: string;

  // ── Results Summary ──
  totalReports: number;
  reactionsAnalyzed: number;
  signalsDetected: number;
  strongSignalsDetected: number;
  fdrEnabled: boolean;

  // ── Metadata ──
  /** ISO 8601 timestamp of manifest generation. */
  generatedAt: string;
  toolVersion: string;
  license: "Apache-2.0";

  // ── Compliance ──
  disclaimer: string;
  nonCausationStatement: string;
  limitations: string[];
}
