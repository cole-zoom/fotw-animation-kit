import { loadFont } from "@remotion/fonts";

// The real LanceDB typefaces, served from their own CDN
// (see @font-face blocks in lancedb.webflow.shared.min.css).
const CDN = "https://cdn.prod.website-files.com/69a866b324926425eccc4cf5";

export const AEONIK = "Aeonik";
export const AEONIK_FONO = "Aeonik Fono";

export const fontsReady = Promise.all([
  loadFont({
    family: AEONIK,
    url: `${CDN}/69a87dcf630fbe16179f2958_aeonik-regular.woff2`,
    weight: "400",
  }),
  loadFont({
    family: AEONIK,
    url: `${CDN}/69a87dcf36c5168ef1379a8a_aeonik-medium.woff2`,
    weight: "500",
  }),
  loadFont({
    family: AEONIK_FONO,
    url: `${CDN}/69a87dcfbac23c4567be6fac_AeonikFono-Regular.woff2`,
    weight: "400",
  }),
  loadFont({
    family: AEONIK_FONO,
    url: `${CDN}/69a87dcf03a4db5ff60019a8_AeonikFono-Medium.woff2`,
    weight: "500",
  }),
]);
