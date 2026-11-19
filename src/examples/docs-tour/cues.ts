/**
 * VO cut, in COMPOSITION frames (60 fps). One clip per line (App.tsx), all from
 * one recording, A001_11131155_C040 (Nov 13), so any cut can be extended back
 * in the GUI. Best takes picked by delivery (Gemini listen + waveform):
 *
 *   A  src  8.34– 10.70  take 2   "LanceDB Docs just got a massive update."
 *   B  src 11.24– 15.80  only     "One site now covers … our open source library."
 *   C  src 16.30– 20.90  only     "Every release gets its own saved docs, … you run."
 *   D  src 21.46– 28.34  only     "Pages now show … feature engineering, and training."
 *   E  src 68.44– 70.42  take 3   "We also changed how the docs stay up to date."
 *   F  src 71.30– 77.20  take 2   "LanceDB Embedded's docs live … help write them."
 *   G  C053 40.70–45.40 last take "LanceDB Esquire already reviews … and our team."  (Nov 18 pickup, A001_11181735_C053)
 *   H  C053 45.88–47.10 last take "Now it checks the docs too."                       (Nov 18 pickup)
 *      (old C040 takes: G 78.00–82.70 "Gatekeeper", H 86.17–87.78 "And now…")
 *   I  src 103.12–107.53 restart  "When a PR changes … that need updating."
 *   J  src 115.93–119.66 take 3   "Each release takes a snapshot … version dropdown."
 *   K  src 120.18–122.35 take 3   "Check them out at docs.lancedb.com."
 */
export const VO = {
  A: { from: 36, trim: 500, dur: 142 },
  B: { from: 196, trim: 674, dur: 274 },
  C: { from: 488, trim: 978, dur: 276 },
  D: { from: 782, trim: 1288, dur: 413 },
  E: { from: 1222, trim: 4106, dur: 119 },
  F: { from: 1359, trim: 4278, dur: 354 },
  G: { from: 1731, trim: 2442, dur: 282 }, // C053
  H: { from: 2024, trim: 2753, dur: 73 }, // C053
  I: { from: 2143, trim: 6187, dur: 265 },
  J: { from: 2426, trim: 6956, dur: 224 },
  K: { from: 2668, trim: 7211, dur: 130 },
} as const;

export const END = 2900;
