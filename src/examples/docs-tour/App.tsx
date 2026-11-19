import { staticFile } from "remotion";
// ─── Versioned docs tour · 16×9 · V0.3B (3D docs, no cursor) ──────────────────────────────────────
// Script: DevRel → Feature of the Week → "Versioned docs tour · 30–45s script".
// Same kit as the Lance pocket demo (boldKit, retro, CaptionLine).
import { Sequence } from "remotion";
import { Audio } from "@remotion/media";
import { VO, END } from "./cues";
import { W, R } from "./cues2";
import { Tv } from "./Tv";
import { DocsShot } from "./DocsShot";
import { DocsJourney } from "./Docs3D";
import { CommunityDocs, Esquire, ReviewToDocs, Snapshot, EndCard } from "./Beats";
import CaptionLine from "./CaptionLine";
import { Scanlines, Fuzz } from "./retro";
import "./lanceFonts";

// Stills of the live site (Nov 13, docs.lancedb.com, 1920×1080 @2×), in
// ~/Documents/Video-Projects/Lance/versioned-docs-tour/footage/.
const IMG = {
  entHome: staticFile("examples/docs-tour/s01_enterprise_home.png"), // s01_enterprise_home.png
  productMenu: staticFile("examples/docs-tour/s02_product_menu_open.png"), // s02_product_menu_open.png
  embHome: staticFile("examples/docs-tour/s03_embedded_home.png"), // s03_embedded_home.png
  embProductMenu: staticFile("examples/docs-tour/s03b_embedded_product_menu_open.png"), // s03b_embedded_product_menu_open.png
  // MOCK: the live dropdown only lists 1.12.0 today. 1.10.0–1.10.4 were
  // injected into the page before the capture. Real one: s04_version_menu_REAL.png
  // = kino:b1ac5011-6261-4049-a7cc-5ef37c5ead21. Call this out when showing Brendan.
  versionMenuMOCK: staticFile("examples/docs-tour/s04_version_menu_MOCK.png"), // s04_version_menu_MOCK.png
  // Merge (s05_merge_insert_badges.png) is NOT linked from the 1.12.0 sidebar, so it is out (rule: if a page isn't visible in the sidebar, don't use it).
  createFunction: staticFile("examples/docs-tour/s05b_create_function.png"), // s05b_create_function.png
  curation: staticFile("examples/docs-tour/s06_curation_page.png"), // s06_curation_page.png
  featureEng: staticFile("examples/docs-tour/s06c_feature_engineering.png"), // s06c_feature_engineering.png
  training: staticFile("examples/docs-tour/s06b_training_cache.png"), // s06b_training_cache.png
  about: staticFile("examples/docs-tour/s07_about_this_version.png"), // s07_about_this_version.png
  pr4817: staticFile("examples/docs-tour/g01_pr4817_full.png"), // g01_pr4817_full.png (full page, 3840×4186)
  repoDocsWeb: staticFile("examples/docs-tour/g03_repo_docs_web.png") // g03_repo_docs_web.png
};

// Half-size JPEG copies (footage/half/*_2560.jpg) for the 3D journey: the 4K PNGs on 3D planes
// crashed Kino's renderer under memory pressure (Nov 13). Same pixels at 2560 wide.
const LITE = {
  entHome: staticFile("examples/docs-tour/s01_enterprise_home_2560.jpg"),
  productMenu: staticFile("examples/docs-tour/s02_product_menu_open_2560.jpg"),
  embHome: staticFile("examples/docs-tour/s03_embedded_home_2560.jpg"),
  embProductMenu: staticFile("examples/docs-tour/s03b_embedded_product_menu_open_2560.jpg"),
  versionMenuMOCK: staticFile("examples/docs-tour/s04_version_menu_MOCK_2560.jpg"), // MOCK
  createFunction: staticFile("examples/docs-tour/s05b_create_function_2560.jpg"),
  curation: staticFile("examples/docs-tour/s06_curation_page_2560.jpg"),
  featureEng: staticFile("examples/docs-tour/s06c_feature_engineering_2560.jpg"),
  training: staticFile("examples/docs-tour/s06b_training_cache_2560.jpg"),
};

const layer = (zIndex: number) => ({ position: "absolute" as const, inset: 0, zIndex });

// SFX, per ~/Documents/Video-Projects/Lance/FOTW/FeatureOfTheWeek-SFX-Guide.md: FOTW Ep3 Epidemic whooshes
// (trims pick one hit; peak lands on the move's top speed) + low foley from audio/sfx/foley/ (cotton taps slowed
// to 70% and low-passed, Drop On Floor, dark static, tube rumble). No synthesized tones.

// Mastered VO: highpass 80 Hz, 4:1 compression, gain → limiter, −1 dB (−13.6 LUFS).
// Same sample count as the raw file, so every trim below is the same on both.
// Raw original stays in the project: A001_11131155_C040.mov = kino:878c3232-3400-4422-b67b-57929809b26d

export default function App() {
  return <>
      {/* ── picture ───────────────────────────────────────────────────── */}
      <Sequence name="TV · power on, dive into the docs" from={0} durationInFrames={W.oneSite} layout="none">
        <div style={layer(1)}><Tv src={IMG.entHome} powerOn={20} diveIn={[96, W.oneSite]} /></div>
      </Sequence>
      <Sequence name="3D · docs journey, one continuous shot (no cursor)" from={W.oneSite} durationInFrames={W.alsoChanged - W.oneSite} layout="none">
        <div style={layer(1)}>
          <DocsJourney
            states={[
              { at: 0, src: LITE.entHome, name: "Enterprise 1.12.0 home" },
              { at: 84, src: LITE.productMenu, fade: 6, name: "product menu open" },
              { at: 140, src: LITE.embHome, name: "Embedded 0.41.0 home" },
              { at: 250, src: LITE.embProductMenu, fade: 6, name: "product menu open (on Embedded)" },
              { at: 282, src: LITE.entHome, name: "Enterprise 1.12.0 home" },
              { at: 340, src: LITE.versionMenuMOCK, fade: 6, name: "MOCK version menu (1.10.x injected)" },
              { at: 566, src: LITE.entHome, fade: 8, name: "Enterprise 1.12.0 home" },
              { at: 590, src: LITE.createFunction, fade: 12, name: "Data Curation → Create Function" },
              { at: 842, src: LITE.curation, fade: 12, name: "Data curation" },
              { at: 913, src: LITE.featureEng, fade: 12, name: "Feature engineering" },
              { at: 966, src: LITE.training, fade: 12, name: "Training Cache" },
            ]}
            rings={[
              { r: R.productBtn, at: W.enterprise - W.oneSite, out: 84 },
              { r: R.productEmbedded, at: 120, out: 140, pad: 4 },
              { r: R.embProductBtn, at: W.openSource - W.oneSite, out: 250 },
              { r: { x: 510, y: 57, w: 215, h: 56 }, at: 262, out: 282, pad: 4 },
              { r: R.versionBtn, at: 300, out: 340 },
              { r: R.versionMenuMock, at: 346, out: 566, pad: 6 },
              { r: R.versionLatest, at: W.exactVersion - W.oneSite, out: 566, pad: 3 },
              { r: R.appliesTo, at: W.product - W.oneSite, out: 760 },
              { r: R.earlyAccess, at: W.earlyAccess - W.oneSite, out: 842 },
              { r: R.sidebarCreateFunction, at: W.earlyAccess - W.oneSite + 40, out: 842, pad: 4 },
              { r: R.curH1, at: 846, out: 913 },
              { r: R.feH1, at: 917, out: 966 },
              { r: R.trH1, at: 970, out: 1010 },
            ]}
            editions={{ page: LITE.entHome, in: 380, out: 520, labels: ["1.10.4", "1.10.3", "1.10.2", "1.10.1", "1.10.0"] }}
            keys={[
              // r3 (feedback: too much camera movement): hold at each beat, one slow move between beats, fixed tilt.
              [0, { x: 0, y: 0, z: -646, rx: 0, ry: 0 }],
              [70, { x: -251, y: -159, z: -967, rx: -4, ry: 10 }], // Enterprise switcher (Cole's framing)
              [290, { x: -251, y: -159, z: -967, rx: -4, ry: 10 }], // hold: menu → Embedded → back to Enterprise
              [340, { x: -300, y: -200, z: -1000, rx: -4, ry: 10 }], // version menu
              [372, { x: -300, y: -200, z: -1000, rx: -4, ry: 10 }],
              [440, { x: 420, y: -200, z: 120, rx: -4, ry: -30 }], // swing out: editions stacked in depth (as in r1)
              [478, { x: 420, y: -200, z: 120, rx: -4, ry: -30 }],
              [530, { x: -297, y: -220, z: -1050, rx: -4, ry: 10 }], // back to the menu, 1.12.0 · Latest
              [585, { x: -297, y: -220, z: -1050, rx: -4, ry: 10 }],
              [650, { x: -136, y: -128, z: -1000, rx: -4, ry: 10 }], // Create Function · Applies to
              [725, { x: -136, y: -128, z: -1000, rx: -4, ry: 10 }],
              [775, { x: -250, y: -30, z: -900, rx: -4, ry: 10 }], // Early access + sidebar tag
              [842, { x: -250, y: -30, z: -900, rx: -4, ry: 10 }],
              [880, { x: -160, y: -200, z: -950, rx: -4, ry: 10 }], // guide titles (same spot on all three pages)
              [975, { x: -160, y: -200, z: -950, rx: -4, ry: 10 }],
              [1026, { x: 0, y: 0, z: -646, rx: 0, ry: 0 }],
            ]}
          />
        </div>
      </Sequence>
      <Sequence name="TV · pull out, flip to the repo, dive back in" from={W.alsoChanged} durationInFrames={W.embeddedDocs - W.alsoChanged} layout="none">
        <div style={layer(1)}><Tv src={IMG.training} flipTo={IMG.repoDocsWeb} flipAt={58} diveOut={[0, 46]} diveIn={[84, W.embeddedDocs - W.alsoChanged]} /></div>
      </Sequence>
      <Sequence name="Repo · lancedb/lancedb → docs/web" from={W.embeddedDocs} durationInFrames={W.community - W.embeddedDocs} layout="none">
        <div style={layer(1)}>
          <DocsShot src={IMG.repoDocsWeb} glitch={false} keys={[[0, { x: 960, y: 540, z: 1 }], [60, { x: 960, y: 540, z: 1 }], [140, { x: 760, y: 420, z: 1.6 }]]} rings={[{ r: R.repoCrumb, at: W.sameRepo - W.embeddedDocs - 20, pad: 6 }]} />
        </div>
      </Sequence>

      <Sequence name="Community · docs PRs from outside contributors" from={W.community} durationInFrames={1731 - W.community} layout="none">
        <div style={layer(1)}><CommunityDocs /></div>
      </Sequence>
      <Sequence name="Esquire · reviews community + team PRs, now checks docs" from={1731} durationInFrames={W.whenPR - 1731} layout="none">
        <div style={layer(1)}><Esquire community={W.fromCommunity - 1731} team={W.ourTeam - 1731} andNow={W.andNow - 1731} docs={W.checksDocs - 1731} /></div>
      </Sequence>
      <Sequence name="Review #4817 → pydantic.mdx → docs commit" from={W.whenPR} durationInFrames={W.eachRelease - W.whenPR} layout="none">
        <div style={layer(1)}><ReviewToDocs points={W.pointsTo - W.whenPR} /></div>
      </Sequence>
      <Sequence name="Snapshot per release (MOCK versions)" from={W.eachRelease} durationInFrames={2600 - W.eachRelease} layout="none">
        <div style={layer(1)}><Snapshot snap={W.snapshot - W.eachRelease} /></div>
      </Sequence>
      <Sequence name="MOCK · version dropdown (end of snapshot line)" from={2600} durationInFrames={W.checkOut - 2600} layout="none">
        <div style={layer(1)}>
          <DocsShot src={IMG.versionMenuMOCK} keys={[[0, { x: 520, y: 270, z: 2.0 }], [68, { x: 480, y: 240, z: 2.3 }]]} rings={[{ r: R.versionMenuMock, at: W.dropdown - 2600, pad: 6 }]} />
        </div>
      </Sequence>
      <Sequence name="TV · pull back out" from={W.checkOut} durationInFrames={2716 - W.checkOut} layout="none">
        <div style={layer(1)}><Tv src={IMG.entHome} diveOut={[0, 46]} /></div>
      </Sequence>
      <Sequence name="End card · docs.lancedb.com" from={2716} durationInFrames={END - 2716} layout="none">
        <div style={{ ...layer(1), background: `radial-gradient(ellipse 90% 75% at 50% 42%, #1e1b19 0%, #171513 70%)` }}>
          <EndCard url={W.docsUrl - 2716 + 6} />
          <Scanlines opacity={0.12} />
          <Fuzz opacity={0.16} />
        </div>
      </Sequence>

      {/* ── captions, one clip per line ───────────────────────────────── */}
      <Sequence name="Caption · LanceDB Docs just got a massive update." from={36} durationInFrames={178 + 14 - 36} layout="none">
        <div style={layer(4)}><CaptionLine text="LanceDB Docs just got a massive update." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · One site now covers LanceDB Enterprise" from={196} durationInFrames={W.embedded - 2 - 196} layout="none">
        <div style={layer(4)}><CaptionLine text="One site now covers LanceDB Enterprise" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and LanceDB Embedded, our open source library." from={W.embedded - 2} durationInFrames={W.bEnd + 14 - (W.embedded - 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="and LanceDB Embedded, our open source library." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Every release gets its own saved docs," from={W.every} durationInFrames={600 - W.every} layout="none">
        <div style={layer(4)}><CaptionLine text="Every release gets its own saved docs," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · so you can read the docs for the exact version you run." from={600} durationInFrames={W.cEnd + 14 - 600} layout="none">
        <div style={layer(4)}><CaptionLine text="so you can read the docs for the exact version you run." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Pages now show which product has a feature" from={W.pages} durationInFrames={887 - W.pages} layout="none">
        <div style={layer(4)}><CaptionLine text="Pages now show which product has a feature" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and what's still in early access," from={887} durationInFrames={988 - 887} layout="none">
        <div style={layer(4)}><CaptionLine text="and what's still in early access," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · with new guides on data curation, feature engineering, and training." from={988} durationInFrames={W.dEnd + 14 - 988} layout="none">
        <div style={layer(4)}><CaptionLine text="with new guides on data curation, feature engineering, and training." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · We also changed how the docs stay up to date." from={W.alsoChanged + 4} durationInFrames={W.eEnd + 12 - (W.alsoChanged + 4)} layout="none">
        <div style={layer(4)}><CaptionLine text="We also changed how the docs stay up to date." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · LanceDB Embedded's docs live in the same repo as its code," from={W.embeddedDocs} durationInFrames={1557 - W.embeddedDocs} layout="none">
        <div style={layer(4)}><CaptionLine text="LanceDB Embedded's docs live in the same repo as its code," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and community members still help write them." from={1557} durationInFrames={W.fEnd + 14 - 1557} layout="none">
        <div style={layer(4)}><CaptionLine text="and community members still help write them." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · LanceDB Esquire already reviews pull requests" from={1731} durationInFrames={1890 - 1731} layout="none">
        <div style={layer(4)}><CaptionLine text="LanceDB Esquire already reviews pull requests" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · from the community and our team." from={1890} durationInFrames={W.gEnd + 12 - 1890} layout="none">
        <div style={layer(4)}><CaptionLine text="from the community and our team." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Now it checks the docs too." from={W.andNow - 4} durationInFrames={W.hEnd + 14 - (W.andNow - 4)} layout="none">
        <div style={layer(4)}><CaptionLine text="Now it checks the docs too." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · When a PR changes an API or feature," from={W.whenPR} durationInFrames={W.pointsTo - 3 - W.whenPR} layout="none">
        <div style={layer(4)}><CaptionLine text="When a PR changes an API or feature," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · it points to the exact docs that need updating." from={W.pointsTo - 3} durationInFrames={W.iEnd + 14 - (W.pointsTo - 3)} layout="none">
        <div style={layer(4)}><CaptionLine text="it points to the exact docs that need updating." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Each release takes a snapshot of those docs," from={W.eachRelease} durationInFrames={2547 - W.eachRelease} layout="none">
        <div style={layer(4)}><CaptionLine text="Each release takes a snapshot of those docs," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and that's what you see in the version dropdown." from={2547} durationInFrames={W.jEnd + 14 - 2547} layout="none">
        <div style={layer(4)}><CaptionLine text="and that's what you see in the version dropdown." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Check them out at docs.lancedb.com." from={W.checkOut} durationInFrames={W.kEnd + 40 - W.checkOut} layout="none">
        <div style={layer(4)}><CaptionLine text="Check them out at docs.lancedb.com." size={46} bottom={70} /></div>
      </Sequence>

    </>;
}
