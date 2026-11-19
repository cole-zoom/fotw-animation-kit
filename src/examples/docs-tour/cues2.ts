/**
 * Word cues in COMPOSITION frames, read off lookupTimelineText on this cut.
 * If a VO clip is slipped in the GUI, move its cues here too.
 */
export const W = {
  // A
  aStart: 36,
  // B
  oneSite: 196,
  enterprise: 254,
  embedded: 326,
  openSource: 386,
  bEnd: 470,
  // C
  every: 490,
  exactVersion: 675,
  cEnd: 764,
  // D
  pages: 782,
  product: 827,
  earlyAccess: 932,
  curation: 1038,
  featureEng: 1109,
  training: 1162,
  dEnd: 1195,
  // E
  alsoChanged: 1222,
  eEnd: 1341,
  // F
  embeddedDocs: 1359,
  sameRepo: 1462,
  community: 1575,
  fEnd: 1713,
  // G (C053 last take; word onsets from waveform pauses, src 40.73 / 43.54 / 44.62 / 45.32)
  gatekeeper: 1733, // "LanceDB Esquire" (key name kept)
  fromCommunity: 1901,
  ourTeam: 1966,
  gEnd: 2008,
  // H (C053 last take; "Now" src 46.03, end 46.99)
  andNow: 2033, // "Now" (key name kept)
  checksDocs: 2058,
  hEnd: 2091,
  // I
  whenPR: 2143,
  pointsTo: 2265,
  iEnd: 2408,
  // J
  eachRelease: 2426,
  snapshot: 2457,
  dropdown: 2608,
  jEnd: 2650,
  // K
  checkOut: 2668,
  docsUrl: 2717,
  kEnd: 2798,
} as const;

/** Element rectangles on the docs captures, in CSS px of the 1920×1080 viewport
 *  (the PNGs are the same viewport at 2×, so 1 CSS px = 1 frame px at zoom 1). */
export const R = {
  // measured on the live pages with Playwright (Nov 13), CSS px of the 1920×1080 viewport
  versionBtn: { x: 408, y: 16, w: 76, h: 32 },
  productBtn: { x: 500, y: 16, w: 133, h: 32 },
  productMenu: { x: 501, y: 52, w: 236, h: 122 },
  productEmbedded: { x: 506, y: 113, w: 226, h: 56 },
  embProductBtn: { x: 505, y: 16, w: 136, h: 32 },
  versionMenuMock: { x: 408, y: 52, w: 147, h: 226 }, // MOCK menu (6 items)
  versionLatest: { x: 413, y: 57, w: 137, h: 36 },
  // Create a Function (Data Curation → Create Function, in the 1.12.0 sidebar). Replaces Merge, which the sidebar does not link.
  appliesTo: { x: 587, y: 324, w: 304, h: 20 }, // "Applies to: Embedded ❌, Enterprise ✅"
  earlyAccess: { x: 587, y: 462, w: 100, h: 24 }, // page badge "Early access"
  sidebarCreateFunction: { x: 256, y: 558, w: 256, h: 36 }, // sidebar entry with its "Early access" tag
  curH1: { x: 587, y: 182, w: 221, h: 44 },
  feH1: { x: 587, y: 182, w: 332, h: 44 },
  trH1: { x: 587, y: 182, w: 250, h: 44 },
  repoCrumb: { x: 337, y: 188, w: 189, h: 24 }, // "lancedb / docs / web /" on github.com/lancedb/lancedb/tree/main/docs/web
} as const;
export type Rect = { x: number; y: number; w: number; h: number };
