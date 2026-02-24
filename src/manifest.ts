// ─── @faerscope/opencore — Session Manifest (Public Hash Generation) ────────
// Deterministic SHA-256 hashing and Study ID generation for reproducible
// pharmacovigilance analyses.
//
// This module provides the public, unsigned portion of the manifest system.
// It generates deterministic identifiers from analysis parameters so that
// any researcher can verify they are looking at the same analysis.
//
// The signed manifest (server-side verification, download, clipboard) is
// a proprietary feature of FAERScope Studio.

import type {
  StudioSearchParams,
  SessionManifest,
  DisproportionalityScore,
  DedupMode,
  CharacterizationMode,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// SHA-256 HASHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute the SHA-256 hash of a string using the Web Crypto API.
 *
 * Works in browsers, Node.js 18+, Deno, and Cloudflare Workers — any
 * environment that supports the standard `crypto.subtle` interface.
 *
 * @param message - Input string to hash.
 * @returns Lowercase hexadecimal SHA-256 digest (64 characters).
 *
 * @example
 * ```ts
 * const hash = await sha256("hello world");
 * // "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
 * ```
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANONICAL PARAMETER SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Comparison configuration for dual-drug analyses.
 */
export interface ComparisonConfig {
  enabled: boolean;
  drug: string;
}

/**
 * Build a canonical (deterministic) JSON string from analysis parameters.
 *
 * Excludes volatile fields (API key, timestamps) so the same query always
 * produces the same hash regardless of when or where it is run.
 *
 * Properties are sorted alphabetically for deterministic serialization.
 *
 * @param params - Studio search parameters.
 * @param comparison - Optional comparison drug configuration.
 * @returns Deterministic JSON string.
 *
 * @example
 * ```ts
 * const json = canonicalParamsJSON({
 *   drug: "metformin",
 *   dateFrom: "20200101",
 *   dateTo: "20231231",
 *   serious: false,
 *   dedupMode: "filtered",
 *   charMode: "suspect",
 * });
 * // Always produces the same string for the same inputs
 * ```
 */
export function canonicalParamsJSON(
  params: StudioSearchParams,
  comparison?: ComparisonConfig
): string {
  const canonical = {
    charMode: params.charMode,
    comparator:
      comparison?.enabled ? comparison.drug.trim().toUpperCase() : null,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    dedupMode: params.dedupMode,
    drug: params.drug.trim().toUpperCase(),
    serious: !!params.serious,
  };
  // JSON.stringify with sorted keys for determinism
  return JSON.stringify(canonical, Object.keys(canonical).sort());
}

/**
 * Generate a deterministic Study ID from analysis parameters.
 *
 * The Study ID format is `FS-{first 8 hex chars of SHA-256}`, providing
 * a short, human-readable identifier that can be used to verify that two
 * analyses used identical parameters.
 *
 * @param params - Studio search parameters.
 * @param comparison - Optional comparison drug configuration.
 * @returns Object with `studyId` (e.g., `"FS-a1b2c3d4"`) and `fullHash` (64-char hex).
 *
 * @example
 * ```ts
 * import { generateStudyId } from "@faerscope/opencore";
 *
 * const { studyId, fullHash } = await generateStudyId({
 *   drug: "metformin",
 *   dateFrom: "20200101",
 *   dateTo: "20231231",
 *   serious: false,
 *   dedupMode: "filtered",
 *   charMode: "suspect",
 * });
 *
 * console.log(studyId);  // "FS-a1b2c3d4"
 * console.log(fullHash); // "a1b2c3d4e5f6..."
 * ```
 */
export async function generateStudyId(
  params: StudioSearchParams,
  comparison?: ComparisonConfig
): Promise<{ studyId: string; fullHash: string }> {
  const canonical = canonicalParamsJSON(params, comparison);
  const hash = await sha256(canonical);
  return {
    studyId: `FS-${hash.slice(0, 8)}`,
    fullHash: hash,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNSIGNED MANIFEST GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const TOOL_VERSION = "FAERScope OpenCore v0.1.0";

const DISCLAIMER =
  "All data from voluntary FAERS submissions via the openFDA API (https://open.fda.gov). " +
  "Reported events do not establish causation, incidence, or comparative risk. " +
  "Disproportionality scores are exploratory screening tools — not clinical evidence. " +
  "Do not use for medical decisions. API-level deduplication is approximate. " +
  "FAERScope OpenCore is open source (Apache-2.0). Not affiliated with the FDA.";

const NON_CAUSATION =
  "Disproportionality metrics (PRR, ROR, IC) quantify statistical association between " +
  "a drug and adverse event in spontaneous reports. They do not and cannot establish " +
  "causation, incidence rates, or comparative safety. Confounders include reporting bias, " +
  "stimulated reporting, polypharmacy, and channeling bias. Always interpret in clinical context.";

const LIMITATIONS: string[] = [
  "FAERS data are voluntary spontaneous reports subject to under-reporting, stimulated reporting, and duplicate submissions.",
  "Deduplication at the API level is approximate — true case-level dedup requires raw data access.",
  "Disproportionality metrics assume independence between drug-reaction pairs, which may not hold.",
  "Small cell counts (<5) produce unstable estimates with wide confidence intervals.",
  "openFDA aggregation endpoints return approximate counts that may differ from raw FAERS data.",
  "No denominator data (prescriptions dispensed) is available — cannot compute incidence rates.",
  "Reporter qualification and country of origin introduce heterogeneity in report quality.",
  "MedDRA coding variations may split or merge related reactions.",
  "Temporal trends may reflect changes in reporting behavior rather than true safety signals.",
  "This tool performs screening-level analysis — any finding requires formal pharmacovigilance review.",
];

/**
 * Input parameters for manifest generation.
 */
export interface ManifestInput {
  /** Studio search parameters. */
  params: StudioSearchParams;
  /** Optional comparison drug. */
  comparison?: ComparisonConfig;
  /** Array of computed disproportionality scores. */
  signals: DisproportionalityScore[];
  /** Total reports matching the search. */
  totalReports: number;
  /** Whether BH-FDR correction was applied. */
  fdrEnabled: boolean;
  /**
   * Base URL of the openFDA endpoint used.
   * Defaults to `"https://api.fda.gov"`.
   */
  endpointBase?: string;
}

/**
 * Generate an unsigned reproducibility manifest for an analysis session.
 *
 * The manifest contains all parameters, dataset metadata, results summary,
 * and compliance disclaimers needed to reproduce or audit the analysis.
 *
 * This is the **public, unsigned** version. FAERScope Studio adds server-side
 * signing and verification on top of this.
 *
 * @param input - Manifest input parameters.
 * @returns Complete {@link SessionManifest}.
 *
 * @example
 * ```ts
 * import { generateManifest } from "@faerscope/opencore";
 *
 * const manifest = await generateManifest({
 *   params: searchParams,
 *   signals: computedScores,
 *   totalReports: 5000,
 *   fdrEnabled: true,
 * });
 *
 * // Save as JSON for audit trail
 * const json = JSON.stringify(manifest, null, 2);
 * ```
 */
export async function generateManifest(
  input: ManifestInput
): Promise<SessionManifest> {
  const { params, comparison, signals, totalReports, fdrEnabled } = input;

  const { studyId, fullHash } = await generateStudyId(params, comparison);

  const signalsDetected = signals.filter(
    (s) => s.isSignal || s.isStrongSignal
  ).length;
  const strongSignalsDetected = signals.filter(
    (s) => s.isStrongSignal
  ).length;

  const endpointBase = input.endpointBase ?? "https://api.fda.gov";

  // Determine FAERS dataset note
  const dateTo = params.dateTo;
  const year = parseInt(dateTo.slice(0, 4));
  const month = parseInt(dateTo.slice(4, 6));
  const quarter = Math.ceil(month / 3);
  const datasetNote = `Live API query (FAERS data updated quarterly; query range ends ${year}Q${quarter}). Exact dataset version not locked — re-query may return updated counts.`;

  return {
    studyId,
    fullHash,

    drug: params.drug.trim().toUpperCase(),
    comparatorDrug:
      comparison?.enabled && comparison.drug
        ? comparison.drug.trim().toUpperCase()
        : null,
    dateRange: { from: params.dateFrom, to: params.dateTo },
    seriousOnly: !!params.serious,
    dedupMode: params.dedupMode,
    charMode: params.charMode,

    dataSource: "FDA FAERS via openFDA API",
    endpointBase,
    endpointVersion: "drug/event.json",
    datasetNote,

    totalReports,
    reactionsAnalyzed: signals.length,
    signalsDetected,
    strongSignalsDetected,
    fdrEnabled,

    generatedAt: new Date().toISOString(),
    toolVersion: TOOL_VERSION,
    license: "Apache-2.0",

    disclaimer: DISCLAIMER,
    nonCausationStatement: NON_CAUSATION,
    limitations: LIMITATIONS,
  };
}
