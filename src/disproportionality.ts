// ─── @faerscope/opencore — Disproportionality & Time-Series Statistics ──────
// Pure functions for pharmacovigilance signal detection.
// No API calls, no side effects, no DOM dependencies.
//
// References:
//   Evans, S.J.W., et al. (2001). Pharmacoepidemiology and Drug Safety, 10(6), 483-486.
//   Rothman, K.J., et al. (2004). The Reporting Odds Ratio. Pharmacoepidemiology and Drug Safety.
//   Bate, A., et al. (1998). A Bayesian neural network method for adverse drug reaction signal generation.
//   Benjamini, Y. & Hochberg, Y. (1995). Controlling the false discovery rate. JRSS-B, 57(1), 289-300.

import type {
  ContingencyTable,
  DisproportionalityScore,
  TrendPoint,
  TrendWithStats,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// CHI-SQUARED P-VALUE (1 degree of freedom)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard normal CDF approximation (Abramowitz & Stegun 26.2.17).
 * Accurate to ~1.5e-7.
 *
 * @internal
 */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp((-absX * absX) / 2);
  return 0.5 * (1 + sign * y);
}

/**
 * Compute p-value from a chi-squared statistic with 1 degree of freedom.
 *
 * Uses the relationship chi^2(1df) ~ N(0,1)^2, so p = 2(1 - Phi(sqrt(chi^2))).
 *
 * @param chi2 - Chi-squared statistic (must be >= 0).
 * @returns Two-sided p-value. Returns 1 for chi2 <= 0.
 *
 * @example
 * ```ts
 * chi2PValue1df(3.84); // ~0.05
 * chi2PValue1df(6.63); // ~0.01
 * ```
 */
export function chi2PValue1df(chi2: number): number {
  if (chi2 <= 0) return 1;
  return 2 * (1 - normalCDF(Math.sqrt(chi2)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPROPORTIONALITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute the Proportional Reporting Ratio (PRR).
 *
 * PRR = (a / (a + b)) / (c / (c + d))
 *
 * A PRR > 1 suggests the drug is reported with this reaction more frequently
 * than other drugs. PRR >= 2 is one of the Evans signal criteria.
 *
 * @param t - 2x2 contingency table.
 * @returns PRR value. Returns 0 if denominators are zero.
 *
 * @see Evans, S.J.W., et al. (2001). Pharmacoepidemiology and Drug Safety, 10(6), 483-486.
 */
export function computePRR(t: ContingencyTable): number {
  const { a, b, c, d } = t;
  if (a + b === 0 || c + d === 0 || c === 0) return 0;
  return a / (a + b) / (c / (c + d));
}

/**
 * Compute the chi-squared statistic for a 2x2 contingency table (1 df).
 *
 * chi^2 = (ad - bc)^2 * N / ((a+b)(c+d)(a+c)(b+d))
 *
 * @param t - 2x2 contingency table.
 * @returns Chi-squared statistic. Returns 0 if any marginal total is zero.
 */
export function computeChi2(t: ContingencyTable): number {
  const { a, b, c, d } = t;
  const n = a + b + c + d;
  const denom = (a + b) * (c + d) * (a + c) * (b + d);
  if (denom === 0) return 0;
  const num = Math.pow(a * d - b * c, 2) * n;
  return num / denom;
}

/**
 * Compute the Reporting Odds Ratio (ROR).
 *
 * ROR = (a * d) / (b * c)
 *
 * The ROR is analogous to a case-control odds ratio and is the preferred
 * measure for signal detection at many regulatory agencies.
 *
 * @param t - 2x2 contingency table.
 * @returns ROR value. Returns 0 if b or c is zero.
 *
 * @see Rothman, K.J., et al. (2004). The Reporting Odds Ratio and its advantages over the PRR.
 */
export function computeROR(t: ContingencyTable): number {
  const { a, b, c, d } = t;
  if (b === 0 || c === 0) return 0;
  return (a * d) / (b * c);
}

/**
 * Compute the 95% confidence interval for the ROR using the Woolf logit method.
 *
 * ln(ROR) +/- 1.96 * sqrt(1/a + 1/b + 1/c + 1/d)
 *
 * A lower bound > 1 indicates statistically significant disproportionality.
 *
 * @param t - 2x2 contingency table.
 * @returns Object with `lower` and `upper` bounds. Both 0 if any cell is zero.
 */
export function computeROR_CI(t: ContingencyTable): {
  lower: number;
  upper: number;
} {
  const { a, b, c, d } = t;
  if (a === 0 || b === 0 || c === 0 || d === 0) return { lower: 0, upper: 0 };
  const lnROR = Math.log((a * d) / (b * c));
  const se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
  return {
    lower: Math.exp(lnROR - 1.96 * se),
    upper: Math.exp(lnROR + 1.96 * se),
  };
}

/**
 * Compute the Information Component (IC) — a Bayesian shrinkage measure.
 *
 * IC = log2(observed / expected)
 *
 * where expected = ((a+b) * (a+c)) / N.
 *
 * The IC was developed by the WHO Uppsala Monitoring Centre for use in VigiBase.
 * Positive IC values suggest the drug-reaction pair is reported more than expected.
 *
 * @param t - 2x2 contingency table.
 * @returns IC value in bits. Returns 0 for edge cases.
 *
 * @see Bate, A., et al. (1998). A Bayesian neural network method for adverse drug reaction signal generation.
 */
export function computeIC(t: ContingencyTable): number {
  const { a, b, c } = t;
  const n = a + b + c + t.d;
  if (a === 0 || a + b === 0 || a + c === 0) return 0;
  const expected = ((a + b) * (a + c)) / n;
  if (expected === 0) return 0;
  return Math.log2(a / expected);
}

/**
 * Compute IC025 — the lower 2.5% credibility bound of the IC.
 *
 * Uses a normal approximation: IC - 1.96 * SE(IC),
 * where SE(IC) ~ 1 / (ln(2) * sqrt(a)).
 *
 * IC025 > 0 is used as a signal criterion by the WHO-UMC.
 *
 * @param t - 2x2 contingency table.
 * @returns IC lower bound. Returns 0 if a <= 0.
 */
export function computeIC025(t: ContingencyTable): number {
  const ic = computeIC(t);
  const { a } = t;
  if (a <= 0) return 0;
  const se = 1 / (Math.LN2 * Math.sqrt(Math.max(a, 0.5)));
  return ic - 1.96 * se;
}

/**
 * Compute IC975 — the upper 97.5% credibility bound of the IC.
 *
 * @param t - 2x2 contingency table.
 * @returns IC upper bound. Returns 0 if a <= 0.
 */
export function computeIC975(t: ContingencyTable): number {
  const ic = computeIC(t);
  const { a } = t;
  if (a <= 0) return 0;
  const se = 1 / (Math.LN2 * Math.sqrt(Math.max(a, 0.5)));
  return ic + 1.96 * se;
}

/**
 * Compute the full disproportionality analysis for a single drug-reaction pair.
 *
 * This is the main entry point that combines PRR, ROR, IC, confidence intervals,
 * and signal classification into a single result object.
 *
 * @param reaction - MedDRA Preferred Term.
 * @param count - Raw report count for the drug-reaction pair (cell `a`).
 * @param table - Precomputed 2x2 contingency table.
 * @returns Complete {@link DisproportionalityScore} with all metrics and classification.
 *
 * @example
 * ```ts
 * import { computeDisproportionality } from "@faerscope/opencore";
 *
 * const table = { a: 150, b: 4850, c: 3000, d: 992000, n: 1000000 };
 * const result = computeDisproportionality("NAUSEA", 150, table);
 *
 * console.log(result.prr);           // 10.0
 * console.log(result.isSignal);      // true (Evans criteria met)
 * console.log(result.isStrongSignal); // true (ROR CI > 1 and IC025 > 0)
 * ```
 */
export function computeDisproportionality(
  reaction: string,
  count: number,
  table: ContingencyTable
): DisproportionalityScore {
  const prr = computePRR(table);
  const chi2 = computeChi2(table);
  const pValue = chi2PValue1df(chi2);
  const ror = computeROR(table);
  const { lower, upper } = computeROR_CI(table);
  const ic = computeIC(table);
  const ic025 = computeIC025(table);
  const ic975 = computeIC975(table);

  // Evans criteria: PRR >= 2, chi^2 >= 4, a >= 3
  const isSignal = prr >= 2 && chi2 >= 4 && table.a >= 3;
  // Strong signal: ROR lower CI > 1 AND IC025 > 0
  const isStrongSignal = lower > 1 && ic025 > 0;

  return {
    reaction,
    count,
    table,
    prr,
    prrChi2: chi2,
    prrPValue: pValue,
    ror,
    rorLower95: lower,
    rorUpper95: upper,
    ic,
    ic025,
    ic975,
    isSignal,
    isStrongSignal,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTIPLE TESTING CORRECTION — BENJAMINI-HOCHBERG FDR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply Benjamini-Hochberg False Discovery Rate correction to a batch of scores.
 *
 * When testing many drug-reaction pairs simultaneously, the probability of
 * false positives increases. BH-FDR controls the expected proportion of
 * false discoveries among rejected hypotheses.
 *
 * **Algorithm:**
 * 1. Rank p-values from smallest to largest.
 * 2. Compute adjusted p(i) = min(p(i) * m / rank(i), 1).
 * 3. Enforce monotonicity by stepping from largest to smallest rank.
 *
 * @param scores - Array of disproportionality scores to correct.
 * @returns New array with `fdrPValue` populated on each score.
 *
 * @example
 * ```ts
 * import { applyBenjaminiHochberg } from "@faerscope/opencore";
 *
 * const corrected = applyBenjaminiHochberg(scores);
 * const significant = corrected.filter(s => (s.fdrPValue ?? 1) < 0.05);
 * ```
 *
 * @see Benjamini, Y. & Hochberg, Y. (1995). Controlling the false discovery rate.
 *      Journal of the Royal Statistical Society, Series B, 57(1), 289-300.
 */
export function applyBenjaminiHochberg(
  scores: DisproportionalityScore[]
): DisproportionalityScore[] {
  if (scores.length === 0) return scores;

  const m = scores.length;

  // Build sortable array of { originalIndex, pValue }
  const indexed = scores.map((s, i) => ({
    idx: i,
    p: s.prrPValue,
  }));

  // Sort ascending by p-value
  indexed.sort((a, b) => a.p - b.p);

  // Compute adjusted p-values (step-up procedure)
  const adjusted = new Array<number>(m);
  let cumMin = 1;

  // Walk from largest rank to smallest
  for (let rank = m; rank >= 1; rank--) {
    const item = indexed[rank - 1];
    const raw = (item.p * m) / rank;
    cumMin = Math.min(cumMin, raw);
    adjusted[item.idx] = Math.min(cumMin, 1);
  }

  // Return new array with fdrPValue set
  return scores.map((s, i) => ({
    ...s,
    fdrPValue: adjusted[i],
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIME-SERIES STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute a simple moving average over a numeric array.
 *
 * @param data - Array of numeric values.
 * @param window - Moving average window size (number of points).
 * @returns Array of the same length. Entries before the window is full are `undefined`.
 *
 * @example
 * ```ts
 * movingAverage([1, 2, 3, 4, 5], 3); // [undefined, undefined, 2, 3, 4]
 * ```
 */
export function movingAverage(
  data: number[],
  window: number
): (number | undefined)[] {
  return data.map((_, i) => {
    if (i < window - 1) return undefined;
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += data[j];
    return sum / window;
  });
}

/**
 * Compute z-scores from a rolling centered window.
 *
 * For each point, computes z = (value - mean) / std using a centered
 * window of the specified size. Points with insufficient window or
 * zero standard deviation return `undefined` or `0`.
 *
 * @param data - Array of numeric values.
 * @param window - Total window size (centered, so half on each side).
 * @returns Array of z-scores.
 */
export function rollingZScore(
  data: number[],
  window: number
): (number | undefined)[] {
  const halfW = Math.floor(window / 2);
  return data.map((val, i) => {
    const start = Math.max(0, i - halfW);
    const end = Math.min(data.length - 1, i + halfW);
    const slice = data.slice(start, end + 1);
    if (slice.length < 3) return undefined;
    const mean = slice.reduce((s, v) => s + v, 0) / slice.length;
    const variance =
      slice.reduce((s, v) => s + (v - mean) ** 2, 0) / slice.length;
    const std = Math.sqrt(variance);
    if (std === 0) return 0;
    return (val - mean) / std;
  });
}

/**
 * Detect statistical spikes in a trend time series using z-score thresholding.
 *
 * Combines moving average smoothing with rolling z-score computation to identify
 * data points that deviate significantly from the local baseline.
 *
 * @param data - Array of trend points.
 * @param window - Window size for moving average (default: 12).
 * @param threshold - Z-score threshold for spike detection (default: 2.0).
 * @returns Array of trend points annotated with MA, z-score, and spike flags.
 *
 * @example
 * ```ts
 * import { detectSpikes } from "@faerscope/opencore";
 *
 * const annotated = detectSpikes(trendData, 12, 2.0);
 * const spikes = annotated.filter(p => p.isSpike);
 * console.log(`Found ${spikes.length} spikes`);
 * ```
 */
export function detectSpikes(
  data: TrendPoint[],
  window = 12,
  threshold = 2.0
): TrendWithStats[] {
  const counts = data.map((d) => d.count);
  const ma = movingAverage(
    counts,
    Math.min(window, Math.max(3, Math.floor(data.length / 4)))
  );
  const zScores = rollingZScore(
    counts,
    Math.min(window * 2, data.length)
  );

  return data.map((point, i) => ({
    ...point,
    ma: ma[i],
    zScore: zScores[i],
    isSpike:
      zScores[i] !== undefined && Math.abs(zScores[i]!) > threshold,
  }));
}

/**
 * CUSUM (Cumulative Sum) changepoint detection.
 *
 * Identifies structural breaks in a time series where the mean level shifts.
 * Uses a two-sided CUSUM with automatic threshold based on the series
 * standard deviation.
 *
 * @param data - Array of numeric values.
 * @param threshold - Optional detection threshold. Defaults to 4 * sigma.
 * @returns Array of indices where changepoints were detected.
 *
 * @example
 * ```ts
 * const counts = trendData.map(d => d.count);
 * const changepoints = detectChangepoints(counts);
 * // changepoints = [24, 67] — indices where the reporting rate shifted
 * ```
 */
export function detectChangepoints(
  data: number[],
  threshold?: number
): number[] {
  if (data.length < 10) return [];
  const mean = data.reduce((s, v) => s + v, 0) / data.length;
  const std = Math.sqrt(
    data.reduce((s, v) => s + (v - mean) ** 2, 0) / data.length
  );
  const h = threshold ?? std * 4;

  let sPos = 0;
  let sNeg = 0;
  const changepoints: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - mean;
    sPos = Math.max(0, sPos + diff - std * 0.5);
    sNeg = Math.min(0, sNeg + diff + std * 0.5);

    if (sPos > h || sNeg < -h) {
      changepoints.push(i);
      sPos = 0;
      sNeg = 0;
    }
  }

  return changepoints;
}

/**
 * Group time-series data by year and align to month indices for
 * year-over-year comparison.
 *
 * @param data - Array of trend points with YYYYMMDD time strings.
 * @returns Map from year string (e.g., "2024") to monthly aggregates.
 *
 * @example
 * ```ts
 * const yoy = yearOverYear(trendData);
 * for (const [year, months] of yoy) {
 *   console.log(`${year}: ${months.length} months of data`);
 * }
 * ```
 */
export function yearOverYear(
  data: TrendPoint[]
): Map<string, { month: number; count: number }[]> {
  const yearMap = new Map<string, { month: number; count: number }[]>();
  data.forEach((d) => {
    const year = d.time.slice(0, 4);
    const month = parseInt(d.time.slice(4, 6));
    if (!yearMap.has(year)) yearMap.set(year, []);
    const existing = yearMap.get(year)!.find((e) => e.month === month);
    if (existing) {
      existing.count += d.count;
    } else {
      yearMap.get(year)!.push({ month, count: d.count });
    }
  });
  return yearMap;
}
