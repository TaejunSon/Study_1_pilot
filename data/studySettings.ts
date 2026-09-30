/**
 * Build-time settings. Nothing secret can live here: this file is compiled into the published site, so it holds
 * only values that are safe to read. There is no API key anywhere in this build — the recommendations are
 * precomputed (data/seed/recommendations.json) and no model is ever called from the browser.
 */

/** Mixed into the per-participant randomization seed so a participant's trial order is reproducible from their ID. */
export const STUDY_SALT = process.env.NEXT_PUBLIC_STUDY_SALT ?? "expert-study-2026";

/**
 * Where a finished participant should send their exported CSV. Shown on the completion page next to the download
 * button; leave empty to show the download without an address.
 */
export const RETURN_ADDRESS = process.env.NEXT_PUBLIC_RETURN_ADDRESS ?? "";
