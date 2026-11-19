/**
 * Word cues in COMPOSITION frames (60 fps). The VO is five clips on the timeline (App.tsx):
 *
 *   VO_A  A001_11112123_C025 (take 1)  src 2.80–6.45   at 0     "Robots record … and actions."
 *   VO_B  A001_11120946_C029 take 1    src 1.60–5.70   at 239   "Most teams split … a separate vector store."
 *   (Nov 12: cost line "costing them hundreds of thousands…licenses" cut; everything after moved 266 frames earlier)
 *   VO_D1 A001_11112123_C025 (take 1)  src 11.75–29.60 at 508   "Lance stores … from that exact moment."
 *   VO_F  A001_11121026_C036 (start)   src 0.66–5.05   at 1594  "As your fleet grows, LanceDB Enterprise
 *                                                                 takes the work right off your plate."
 *   VO_D2 A001_11112123_C025 (take 1)  src 33.05–41.95 at 1874  "It reads the same tables … within milliseconds."
 *   VO_E  A001_11120946_C029 last line src 23.40–28.60 at 2441  "Lance and LanceDB are open source.
 *                                                                 Visit us at lancedb.com and start today."
 *
 * Every cue = clip start + (word's source time − clip source start) × 60, from
 * lookupTimelineText word timings. If a VO clip is slipped in the GUI, move its cues here too.
 */
export const VO = {
  A: { from: 0, trim: 168, dur: 219 },
  B: { from: 239, trim: 96, dur: 246 }, // ends src 5.70 s: in the silence after "store." (~5.58), before "costing" (~5.80)
  D1: { from: 508, trim: 705, dur: 1071 },
  F: { from: 1594, trim: 40, dur: 268 }, // to src 5.13 s, after "plate." (ends 5.06)
  D2: { from: 1874, trim: 1983, dur: 546 }, // to src 42.15 s, after "milliseconds." (ends 42.10)
  E: { from: 2441, trim: 1404, dur: 327 }, // to src 28.85 s, after "today." (ends 28.82)
} as const;

/** VO_D1 runs 237 frames later than the old single-take cut (src frame + 69 instead of − 168) */
const D = 237 - 266; // −266: cost line cut (Nov 12)
/** VO_D2 ("It reads…") runs 88 frames later still, after the new C036 Enterprise line */
const D2 = D + 88;

export const C = {
  robots: 17,
  camera: 59,
  depth: 110,
  joints: 142,
  actions: 176,
  s1End: 215,

  most: 244,
  handoff: 262,
  video: 317,
  meta: 367,
  vector: 447,
  s2End: 478, // after "vector store." (src 5.58 s); cost line cut Nov 12

  lanceStores: 541 + D,
  oneTable: 630 + D,
  s3End: 684 + D,
  eachRow: 710 + D,
  frames: 777 + D,
  sensor: 812 + D,
  emb: 855 + D,
  s4End: 883 + D,

  lancedb: 919 + D,
  builtOn: 1023 + D,
  team: 1093 + D,
  byTeam: 1073 + D, // "by the team" starts at frame 1312 (src 20.71 s)
  s5End: 1150 + D,

  oneQuery: 1184 + D,
  failed: 1319 + D,
  robot: 1363 + D,
  every: 1297 + D, // "every failed" starts at frame 1536 (src 24.45 s)
  s6End: 1408 + D,
  exactFrames: 1433 + D,
  actions2: 1507 + D,
  actions2End: 1540 + D, // after "and actions" (ends src 28.43 s)
  s7End: 1591 + D,

  outgrow: 1604, // "As your fleet grows," (C036 src 0.82)
  enterprise: 1666, // "LanceDB Enterprise" (C036 src 1.86)
  takesWork: 1733, // "takes the work right off your plate" (C036 src 2.98)
  s8End: 1842,
  reads: 1822 + D2,
  bucket: 1912 + D2,
  bucketEnd: 1936 + D2,
  spreads: 1955 + D2,
  cluster: 2037 + D2,
  s9End: 2059 + D2,

  newEp: 2091 + D2,
  indexes: 2176 + D2,
  indexesEnd: 2225 + D2,
  searchable: 2247 + D2,
  s10End: 2343 + D2,

  openSource: 2447,
  s11End: 2548,
  visit: 2580,
  dotcom: 2622,
  startToday: 2681,
  voEnd: 2748,
  end: 2842,
} as const;
