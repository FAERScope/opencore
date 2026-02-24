// ─── @faerscope/opencore — Utilities ─────────────────────────────────────────
// Shared formatting, title-casing, and label helpers for pharmacovigilance UIs.

import type { DedupMode, CharacterizationMode } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// TITLE-CASE MedDRA TERMS
// ═══════════════════════════════════════════════════════════════════════════════

/** Small words that stay lowercase unless they start the string. */
const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "if", "in",
  "nor", "of", "on", "or", "so", "the", "to", "up", "yet", "with",
]);

/**
 * Convert an ALL-CAPS MedDRA Preferred Term to title case.
 *
 * MedDRA PTs are stored in uppercase in FAERS/openFDA. This function
 * converts them to a more readable format for display.
 *
 * @param term - MedDRA Preferred Term in any case.
 * @returns Title-cased string.
 *
 * @example
 * ```ts
 * titleCaseTerm("GASTROOESOPHAGEAL REFLUX DISEASE");
 * // "Gastrooesophageal Reflux Disease"
 *
 * titleCaseTerm("BLOOD CREATINE PHOSPHOKINASE INCREASED");
 * // "Blood Creatine Phosphokinase Increased"
 *
 * titleCaseTerm("NAUSEA");
 * // "Nausea"
 * ```
 */
export function titleCaseTerm(term: string): string {
  if (!term) return term;
  return term
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i === 0 || !SMALL_WORDS.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}

// ═══════════════════════════════════════════════════════════════════════════════
// HUMAN-READABLE LABELS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get a human-readable label for a deduplication mode.
 *
 * @param mode - Deduplication mode.
 * @returns Descriptive label string.
 *
 * @example
 * ```ts
 * dedupLabel("raw");      // "No deduplication"
 * dedupLabel("filtered"); // "Duplicate-flagged removed"
 * dedupLabel("strict");   // "Initial spontaneous only"
 * ```
 */
export function dedupLabel(mode: DedupMode): string {
  switch (mode) {
    case "raw":
      return "No deduplication";
    case "filtered":
      return "Duplicate-flagged removed";
    case "strict":
      return "Initial spontaneous only";
    default:
      return mode;
  }
}

/**
 * Get a human-readable label for a drug characterization mode.
 *
 * @param mode - Characterization mode.
 * @returns Descriptive label string.
 *
 * @example
 * ```ts
 * charLabel("all");                 // "All drug roles"
 * charLabel("suspect");             // "Suspect role only"
 * charLabel("suspect_interacting"); // "Suspect + interacting"
 * ```
 */
export function charLabel(mode: CharacterizationMode): string {
  switch (mode) {
    case "all":
      return "All drug roles";
    case "suspect":
      return "Suspect role only";
    case "suspect_interacting":
      return "Suspect + interacting";
    default:
      return mode;
  }
}

/**
 * Format a YYYYMMDD date range as a human-readable string.
 *
 * @param from - Start date in YYYYMMDD format.
 * @param to - End date in YYYYMMDD format.
 * @returns Formatted string like `"2020-01-01 to 2023-12-31"`.
 */
export function formatDateRange(from: string, to: string): string {
  if (from.length === 8 && to.length === 8) {
    return `${from.slice(0, 4)}-${from.slice(4, 6)}-${from.slice(6)} to ${to.slice(0, 4)}-${to.slice(4, 6)}-${to.slice(6)}`;
  }
  return `${from} to ${to}`;
}
