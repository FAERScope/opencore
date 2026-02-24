// ─── @faerscope/opencore — openFDA API Client ───────────────────────────────
// Lightweight, environment-agnostic fetch utilities for the openFDA
// Drug Adverse Event API (https://open.fda.gov/apis/drug/event/).
//
// This module provides basic data retrieval functions suitable for building
// pharmacovigilance tools. It does NOT include rate limiting, caching, or
// advanced query construction — those concerns belong in the consuming application.
//
// Rate Limits (openFDA):
//   - With API key:    240 requests / minute
//   - Without API key:  40 requests / minute
//
// The consumer is responsible for implementing rate limiting appropriate
// to their deployment context.

import type { TrendPoint, ReactionCount, SearchParams } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Configuration options for the openFDA client.
 */
export interface OpenFDAConfig {
  /**
   * Base URL for the drug/event endpoint.
   * Defaults to `"https://api.fda.gov/drug/event.json"`.
   * Override this to route through a proxy server.
   */
  baseUrl?: string;
  /**
   * openFDA API key. Optional but recommended.
   * Without a key, you're limited to 40 requests/minute.
   *
   * @see https://open.fda.gov/apis/authentication/
   */
  apiKey?: string;
}

const DEFAULT_BASE_URL = "https://api.fda.gov/drug/event.json";

function getBaseUrl(config?: OpenFDAConfig): string {
  return config?.baseUrl ?? DEFAULT_BASE_URL;
}

function appendKey(url: string, config?: OpenFDAConfig): string {
  if (config?.apiKey) return url + `&api_key=${config.apiKey}`;
  return url;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH STRING BUILDING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build an openFDA search string from basic search parameters.
 *
 * Constructs a query that searches across both `generic_name` and `brand_name`
 * fields (OR logic) with date range and optional seriousness filter.
 *
 * @param params - Search parameters.
 * @returns URL-encoded search string for the openFDA `search` parameter.
 *
 * @example
 * ```ts
 * buildSearchString({
 *   drug: "metformin",
 *   dateFrom: "20200101",
 *   dateTo: "20231231",
 *   serious: true,
 * });
 * // '(patient.drug.openfda.generic_name:"METFORMIN"+patient.drug.openfda.brand_name:"METFORMIN")+AND+receivedate:[20200101+TO+20231231]+AND+serious:1'
 * ```
 */
export function buildSearchString(params: SearchParams): string {
  const parts: string[] = [];
  const drug = params.drug.toUpperCase();

  // Drug name: search across generic AND brand name (OR)
  parts.push(
    `(patient.drug.openfda.generic_name:"${drug}"+patient.drug.openfda.brand_name:"${drug}")`
  );

  // Date range
  parts.push(`receivedate:[${params.dateFrom}+TO+${params.dateTo}]`);

  // Serious filter
  if (params.serious) {
    parts.push("serious:1");
  }

  return parts.join("+AND+");
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC FETCHERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Response metadata from the openFDA API.
 */
export interface OpenFDAMeta {
  disclaimer: string;
  terms: string;
  license: string;
  last_updated: string;
  results: {
    skip: number;
    limit: number;
    total: number;
  };
}

/**
 * A single count result from an openFDA aggregation query.
 */
export interface OpenFDACountResult {
  time?: string;
  term?: string;
  count: number;
}

/**
 * Full openFDA API response shape.
 */
export interface OpenFDAResponse {
  meta: OpenFDAMeta;
  results: OpenFDACountResult[];
}

/**
 * Fetch JSON from a URL with basic error handling.
 *
 * @param url - Full URL to fetch.
 * @returns Parsed JSON response.
 * @throws Error with the API error message or HTTP status code.
 *
 * @internal
 */
async function fetchJSON(url: string): Promise<any> {
  const resp = await fetch(url);
  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    throw new Error(
      body?.error?.message || `openFDA API error: ${resp.status}`
    );
  }
  return resp.json();
}

/**
 * Fetch a count aggregation from openFDA.
 *
 * @param search - Search string (from {@link buildSearchString}).
 * @param countField - Field to aggregate on (e.g., `"receivedate"`, `"patient.reaction.reactionmeddrapt.exact"`).
 * @param limit - Maximum number of buckets to return (max 1000).
 * @param config - Optional client configuration.
 * @returns Array of count results.
 *
 * @internal
 */
async function fetchCount(
  search: string,
  countField: string,
  limit: number,
  config?: OpenFDAConfig
): Promise<OpenFDACountResult[]> {
  let url = `${getBaseUrl(config)}?search=${search}&count=${countField}`;
  if (limit) url += `&limit=${Math.min(limit, 1000)}`;
  url = appendKey(url, config);
  const data = await fetchJSON(url);
  return data.results || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch the time-series trend of adverse event reports for a drug.
 *
 * Aggregates report counts by `receivedate`, returning up to 1000 date buckets.
 * Each point represents one day with at least one report.
 *
 * @param params - Search parameters specifying the drug, date range, and filters.
 * @param config - Optional client configuration (base URL, API key).
 * @returns Array of {@link TrendPoint} objects sorted chronologically.
 *
 * @example
 * ```ts
 * import { fetchTrend } from "@faerscope/opencore";
 *
 * const trend = await fetchTrend({
 *   drug: "metformin",
 *   dateFrom: "20200101",
 *   dateTo: "20231231",
 * });
 *
 * console.log(trend[0]); // { time: "20200102", count: 42, label: "2020-01-02" }
 * ```
 */
export async function fetchTrend(
  params: SearchParams,
  config?: OpenFDAConfig
): Promise<TrendPoint[]> {
  const search = buildSearchString(params);
  const results = await fetchCount(search, "receivedate", 1000, config);
  return results.map((r) => {
    const t = r.time || "";
    return {
      time: t,
      count: r.count,
      label: formatDateLabel(t),
    };
  });
}

/**
 * Fetch the top adverse reactions reported for a drug.
 *
 * Aggregates report counts by MedDRA Preferred Term
 * (`patient.reaction.reactionmeddrapt.exact`), returning the most frequently
 * reported reactions.
 *
 * @param params - Search parameters specifying the drug, date range, and filters.
 * @param limit - Maximum number of reactions to return (default: 20, max: 1000).
 * @param config - Optional client configuration.
 * @returns Array of {@link ReactionCount} objects sorted by count descending.
 *
 * @example
 * ```ts
 * import { fetchTopReactions } from "@faerscope/opencore";
 *
 * const reactions = await fetchTopReactions(
 *   { drug: "metformin", dateFrom: "20200101", dateTo: "20231231" },
 *   20
 * );
 *
 * console.log(reactions[0]); // { term: "NAUSEA", count: 1234 }
 * ```
 */
export async function fetchTopReactions(
  params: SearchParams,
  limit = 20,
  config?: OpenFDAConfig
): Promise<ReactionCount[]> {
  const search = buildSearchString(params);
  const results = await fetchCount(
    search,
    "patient.reaction.reactionmeddrapt.exact",
    limit,
    config
  );
  return results.map((r) => ({
    term: r.term || "",
    count: r.count,
  }));
}

/**
 * Fetch the total number of reports matching a search.
 *
 * Uses `limit=1` for minimal data transfer — only the metadata total is needed.
 *
 * @param params - Search parameters.
 * @param config - Optional client configuration.
 * @returns Total number of matching reports. Returns 0 if no results found.
 *
 * @example
 * ```ts
 * const total = await fetchTotalReports(
 *   { drug: "metformin", dateFrom: "20200101", dateTo: "20231231" }
 * );
 * console.log(`${total} total reports`);
 * ```
 */
export async function fetchTotalReports(
  params: SearchParams,
  config?: OpenFDAConfig
): Promise<number> {
  const search = buildSearchString(params);
  const url = appendKey(
    `${getBaseUrl(config)}?search=${search}&limit=1`,
    config
  );
  try {
    const data = await fetchJSON(url);
    return (data.meta as OpenFDAMeta).results.total;
  } catch {
    // openFDA returns 404 when zero records match
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get preset date ranges relative to the current date.
 *
 * @param preset - One of `"1y"`, `"3y"`, `"5y"`, or `"all"`.
 * @returns Object with `from` and `to` strings in YYYYMMDD format.
 *
 * @example
 * ```ts
 * getDatePreset("3y"); // { from: "20230224", to: "20260224" }
 * getDatePreset("all"); // { from: "20040101", to: "20260224" }
 * ```
 */
export function getDatePreset(
  preset: "1y" | "3y" | "5y" | "all"
): { from: string; to: string } {
  const now = new Date();
  const to = formatDate(now);
  if (preset === "all") return { from: "20040101", to };
  const years = preset === "1y" ? 1 : preset === "3y" ? 3 : 5;
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - years);
  return { from: formatDate(from), to };
}

/**
 * Format a Date object to YYYYMMDD string.
 *
 * @param d - Date object.
 * @returns Date string in YYYYMMDD format.
 */
export function formatDate(d: Date): string {
  const y = d.getFullYear().toString();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Convert a YYYYMMDD string to a date input value (YYYY-MM-DD).
 *
 * @param yyyymmdd - Date string in YYYYMMDD format.
 * @returns Date string in YYYY-MM-DD format, or empty string if invalid.
 */
export function formatDateForInput(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

/**
 * Convert a date input value (YYYY-MM-DD) to YYYYMMDD format.
 *
 * @param dateStr - Date string in YYYY-MM-DD format.
 * @returns Date string in YYYYMMDD format.
 */
export function parseDateInput(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Format a YYYYMMDD string as a human-readable label (YYYY-MM-DD).
 *
 * @param yyyymmdd - Date string in YYYYMMDD format.
 * @returns Formatted date label.
 *
 * @internal
 */
function formatDateLabel(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
