import React from "react";
import { Composition, Folder } from "remotion";
import "./lanceFonts"; // starts loading Aeonik / Aeonik Fono from LanceDB's CDN
import { SCENE_AT } from "./cues";
import { Ep07Reel, EP07_FRAMES } from "./Ep07Reel";
import StarterScene from "./StarterScene";
import Intro from "./Intro";
import Outro from "./Outro";
import RankMachine from "./RankMachine";
import HowOften from "./HowOften";
import HowRare from "./HowRare";
import HowLong from "./HowLong";
import StatsMulti from "./StatsMulti";
import MultiCases from "./MultiCases";
import CombinedFields from "./CombinedFields";
import Boost from "./Boost";
import CodeCards from "./CodeCards";
import Reqs from "./Reqs";
import MemWalLaunch from "./examples/memwal-launch/App";
import PocketDemo16x9 from "./examples/pocket-demo-16x9/App";
import PocketDemo9x16 from "./examples/pocket-demo-9x16/App";
import DocsTour from "./examples/docs-tour/App";

// The show's canvas. Never change these.
const SHOW = { width: 1920, height: 1080, fps: 60 } as const;
const len = (k: keyof typeof SCENE_AT) => SCENE_AT[k][1] - SCENE_AT[k][0];

const SCENES = [
  ["RankMachine", RankMachine, "rank"],
  ["HowOften", HowOften, "often"],
  ["HowRare", HowRare, "rare"],
  ["HowLong", HowLong, "long"],
  ["StatsMulti", StatsMulti, "stats"],
  ["MultiCases", MultiCases, "cases"],
  ["CombinedFields", CombinedFields, "comb"],
  ["Boost", Boost, "boost"],
  ["CodeCards", CodeCards, "code"],
  ["Reqs", Reqs, "req"],
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="StarterScene" component={StarterScene} durationInFrames={360} {...SHOW} />
    <Folder name="Show">
      <Composition id="Intro" component={Intro} durationInFrames={210} {...SHOW} />
      <Composition id="Outro" component={Outro} durationInFrames={420} {...SHOW} />
    </Folder>
    <Folder name="Ep07-BM25F">
      <Composition id="Ep07-GraphicsReel" component={Ep07Reel} durationInFrames={EP07_FRAMES} {...SHOW} />
      {SCENES.map(([id, C, key]) => (
        <Composition key={id} id={`Ep07-${id}`} component={C as React.FC} durationInFrames={len(key)} {...SHOW} />
      ))}
    </Folder>
    {/* Other LanceDB videos built with the same kits. Graphics + captions only:
        the camera footage, voiceover, music and SFX are left out. */}
    <Folder name="Examples">
      <Composition id="MemWAL-RealtimeEngine-Launch" component={MemWalLaunch} durationInFrames={12707} {...SHOW} />
      <Composition id="Lance-PocketDemo-16x9" component={PocketDemo16x9} durationInFrames={2842} {...SHOW} />
      <Composition id="Lance-PocketDemo-9x16" component={PocketDemo9x16} durationInFrames={2842} width={1080} height={1920} fps={60} />
      <Composition id="Docs-Tour" component={DocsTour} durationInFrames={2900} {...SHOW} />
    </Folder>
  </>
);
