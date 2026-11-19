// LanceDB brand tokens, pulled from lancedb.webflow.shared.min.css.
// Carried over from Ep. 01 unchanged — the two episodes must be the same show.
export const LANCE = {
  dark800: "#171513",
  dark700: "#1e1b19",
  dark600: "#302a25",
  dark500: "#4c443f",
  dark400: "#847770",
  dark300: "#998a84",
  dark200: "#ad9e95",
  dark100: "#e5dad4",
  offwhite: "#f4ebe8",
  orange500: "#f56136",
  orange400: "#ff734a",
  orange300: "#ff8967",
  lavender: "#e7d2f6",
};

export const MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';
export const SANS =
  '"Aeonik", "Inter", -apple-system, "Helvetica Neue", Arial, sans-serif';

/**
 * The three-state palette every diagram in the show uses, Ep. 01 included:
 *   dark200   raw / not yet touched
 *   orange400 work done
 *   orange300 happening now
 * Nothing in a diagram may introduce a fourth state color.
 */
export const STATE = {
  idle: LANCE.dark200,
  done: LANCE.orange400,
  live: LANCE.orange300,
} as const;
