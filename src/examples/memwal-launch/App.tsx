// ─── LanceDB Realtime Engine — launch video · version C (alternate opening: problem first) ─
//
// GENERATED FIRST PASS by ~/Documents/Video-Projects/Lance/MemWalFeatureRelease/work/tools/gen_app.py
// (edl.py picks the takes). Edit here freely after that; see DECISIONS.md in that folder.
//
// 1920×1080 @ 60 fps. 33 dialogue clips, cut 12531 f; outro to 12707 f (211.8 s).
// Every <OffthreadVideo> is muted; its <Audio> twin plays the echo-reduced WAV of the same take
// (DeepFilterNet3 per mic + automix, same chain as FOTW) at the same trimBefore.
//
//   zIndex 2 talking head · 4 explainers · 6 name/CTA/credit cards · 7 captions · 8 title / outro
import { Sequence } from "remotion";
import { Audio } from "@remotion/media";
import { OffthreadVideo } from "remotion";
import NameCard from "./NameCard";
import CaptionLine from "./CaptionLine";
import TitleCard from "./TitleCard";
import { IntroCut } from "./Intro";
import { CtaCard, Credits, Outro } from "./closers";
import { OpenTable, LakeIntro } from "./s3Open";
import { Code } from "./s3Oss";
import { WhyHard } from "./v3Why";
import { Engine } from "./v3Engine";
import { Results } from "./v3Results";
import { MemWalInside, OssEnterprise } from "./v3Oss";
import { PromiseLoop } from "./v3Promise";
import { PromiseTable } from "./c2Promise";
import { WhyTable } from "./c2Why";
import { EngineTable } from "./c2Engine";
import { ResultsTable } from "./c2Results";
import { OssTable } from "./c2Oss";
import { RolloutFlow } from "./c2Rollout";

const fullBleed = { position: "absolute" as const, left: 0, top: 0, width: "100%", height: "100%" };
const shot = { ...fullBleed, objectFit: "contain" as const, zIndex: 2 };
// Centering (Cole: "can we do anything about us not being centered?"): the camera sat left of
// the pair. Scale 1.1 and shift right; measured per take from the pair's head/body centres.
const SHOT_T = { ...shot, transform: "translateX(80px) scale(1.1)" };
const SHOT_P = { ...shot, transform: "translateX(64px) scale(1.1)" };
const SHOT_Q = { ...shot, transform: "translateX(64px) scale(1.1)" };
const SHOT_R = shot; // pickups: always under a graphic
const SHOT_S = shot; // Nov 16 RL lines: always under the rollout graphic
const SHOT_U = shot; // Nov 17 re-records (tabletop video): always under a graphic
const SHOT_V = shot;
const sceneLayer = { ...fullBleed, zIndex: 4 };
const cardLayer = { ...fullBleed, zIndex: 6 };
const captionLayer = { ...fullBleed, zIndex: 7 };
const topLayer = { ...fullBleed, zIndex: 8 };

export default function RteLaunch() {
  return (
    <>

      {/* ── Title card ── */}
      <Sequence from={67} durationInFrames={227} layout="none" name="Title · LanceDB Realtime Engine">
        <div name="Title Card" style={topLayer}>
          <TitleCard word={4} />
        </div>
      </Sequence>

      {/* ── Name cards (first time we see the faces) ── */}
      <Sequence from={785} durationInFrames={297} layout="none" name="Name Card · Cole Dumanski">
        <div style={cardLayer}><NameCard name="Cole Dumanski" sub="LANCEDB" x={0.32} from="left" cue={10} /></div>
      </Sequence>
      <Sequence from={785} durationInFrames={297} layout="none" name="Name Card · ChanChan Mao">
        <div style={cardLayer}><NameCard name="ChanChan Mao" sub="LANCEDB" x={0.73} from="right" cue={18} /></div>
      </Sequence>

      {/* ── Explainers (cue frames in cues.ts are local to each scene) ── */}
      <Sequence from={284} durationInFrames={495} layout="none" name="Scene · PromiseTable">
        <div name="PromiseTable" style={sceneLayer}>
          <PromiseTable enter="whoosh" exit="whoosh" />
        </div>
      </Sequence>
      <Sequence from={1082} durationInFrames={2531} layout="none" name="Scene · WhyTable">
        <div name="WhyTable" style={sceneLayer}>
          <WhyTable enter="whoosh" exit="whoosh" />
        </div>
      </Sequence>
      <Sequence from={3561} durationInFrames={2920} layout="none" name="Scene · EngineTable">
        <div name="EngineTable" style={sceneLayer}>
          <EngineTable enter="whoosh" exit="whoosh" />
        </div>
      </Sequence>
      <Sequence from={6441} durationInFrames={2332} layout="none" name="Scene · RolloutFlow">
        <div name="RolloutFlow" style={sceneLayer}>
          <RolloutFlow enter="whoosh" exit="whoosh" />
        </div>
      </Sequence>
      <Sequence from={8733} durationInFrames={2379} layout="none" name="Scene · ResultsTable">
        <div name="ResultsTable" style={sceneLayer}>
          <ResultsTable enter="whoosh" exit="whoosh" />
        </div>
      </Sequence>

      {/* ── Close: CTA + credits over the faces, then the end card ── */}
      <Sequence from={11567} durationInFrames={381} layout="none" name="CTA · Enterprise + blog">
        <div style={cardLayer}><CtaCard blogAt={202} /></div>
      </Sequence>
      <Sequence from={11950} durationInFrames={370} layout="none" name="Credits · Dan, Xuanyu, Jack + team">
        <div style={cardLayer}><Credits cues={[52, 114, 181, 239]} /></div>
      </Sequence>
      <Sequence from={12437} durationInFrames={270} layout="none" name="Outro · A LanceDB Production">
        <div style={topLayer}><Outro /></div>
      </Sequence>

      {/* ── Captions, one clip per line ── */}
      <Sequence from={294} durationInFrames={141} layout="none" name="Caption · Rows you write are now readable by">
        <div style={captionLayer}><CaptionLine text="Rows you write are now readable by" /></div>
      </Sequence>
      <Sequence from={435} durationInFrames={132} layout="none" name="Caption · another client within milliseconds">
        <div style={captionLayer}><CaptionLine text="another client within milliseconds" /></div>
      </Sequence>
      <Sequence from={596} durationInFrames={178} layout="none" name="Caption · Most data platforms can't do that today">
        <div style={captionLayer}><CaptionLine text="Most data platforms can't do that today" /></div>
      </Sequence>
      <Sequence from={777} durationInFrames={131} layout="none" name="Caption · Fresh data has always been">
        <div style={captionLayer}><CaptionLine text="Fresh data has always been" /></div>
      </Sequence>
      <Sequence from={908} durationInFrames={110} layout="none" name="Caption · the hard part of a lakehouse">
        <div style={captionLayer}><CaptionLine text="the hard part of a lakehouse" /></div>
      </Sequence>
      <Sequence from={1025} durationInFrames={71} layout="none" name="Caption · Lakehouse formats">
        <div style={captionLayer}><CaptionLine text="Lakehouse formats" /></div>
      </Sequence>
      <Sequence from={1096} durationInFrames={88} layout="none" name="Caption · store huge amounts of data">
        <div style={captionLayer}><CaptionLine text="store huge amounts of data" /></div>
      </Sequence>
      <Sequence from={1184} durationInFrames={107} layout="none" name="Caption · cheaply on object storage.">
        <div style={captionLayer}><CaptionLine text="cheaply on object storage." /></div>
      </Sequence>
      <Sequence from={1292} durationInFrames={103} layout="none" name="Caption · They make a change visible by">
        <div style={captionLayer}><CaptionLine text="They make a change visible by" /></div>
      </Sequence>
      <Sequence from={1395} durationInFrames={124} layout="none" name="Caption · committing a new table version">
        <div style={captionLayer}><CaptionLine text="committing a new table version" /></div>
      </Sequence>
      <Sequence from={1527} durationInFrames={117} layout="none" name="Caption · That works well for hourly batch jobs">
        <div style={captionLayer}><CaptionLine text="That works well for hourly batch jobs" /></div>
      </Sequence>
      <Sequence from={1644} durationInFrames={91} layout="none" name="Caption · but when rows arrive every">
        <div style={captionLayer}><CaptionLine text="but when rows arrive every" /></div>
      </Sequence>
      <Sequence from={1735} durationInFrames={96} layout="none" name="Caption · millisecond, it doesn't.">
        <div style={captionLayer}><CaptionLine text="millisecond, it doesn't." /></div>
      </Sequence>
      <Sequence from={1841} durationInFrames={114} layout="none" name="Caption · Committing every few rows piles">
        <div style={captionLayer}><CaptionLine text="Committing every few rows piles" /></div>
      </Sequence>
      <Sequence from={1955} durationInFrames={119} layout="none" name="Caption · up metadata files and writers fight">
        <div style={captionLayer}><CaptionLine text="up metadata files and writers fight" /></div>
      </Sequence>
      <Sequence from={2074} durationInFrames={88} layout="none" name="Caption · over the next version number.">
        <div style={captionLayer}><CaptionLine text="over the next version number." /></div>
      </Sequence>
      <Sequence from={2166} durationInFrames={135} layout="none" name="Caption · Batching rows into bigger commits">
        <div style={captionLayer}><CaptionLine text="Batching rows into bigger commits" /></div>
      </Sequence>
      <Sequence from={2301} durationInFrames={116} layout="none" name="Caption · fixes the metadata problem.">
        <div style={captionLayer}><CaptionLine text="fixes the metadata problem." /></div>
      </Sequence>
      <Sequence from={2417} durationInFrames={135} layout="none" name="Caption · The issue here is that readers wait">
        <div style={captionLayer}><CaptionLine text="The issue here is that readers wait" /></div>
      </Sequence>
      <Sequence from={2552} durationInFrames={144} layout="none" name="Caption · seconds or minutes to see new data">
        <div style={captionLayer}><CaptionLine text="seconds or minutes to see new data" /></div>
      </Sequence>
      <Sequence from={2704} durationInFrames={120} layout="none" name="Caption · Another option is to put a streaming">
        <div style={captionLayer}><CaptionLine text="Another option is to put a streaming" /></div>
      </Sequence>
      <Sequence from={2824} durationInFrames={94} layout="none" name="Caption · service in front of the table.">
        <div style={captionLayer}><CaptionLine text="service in front of the table." /></div>
      </Sequence>
      <Sequence from={2920} durationInFrames={167} layout="none" name="Caption · The service holds new rows in its own st…">
        <div style={captionLayer}><CaptionLine text="The service holds new rows in its own storage" /></div>
      </Sequence>
      <Sequence from={3087} durationInFrames={126} layout="none" name="Caption · and copies them into the table later.">
        <div style={captionLayer}><CaptionLine text="and copies them into the table later." /></div>
      </Sequence>
      <Sequence from={3220} durationInFrames={85} layout="none" name="Caption · However, until it does">
        <div style={captionLayer}><CaptionLine text="However, until it does" /></div>
      </Sequence>
      <Sequence from={3309} durationInFrames={146} layout="none" name="Caption · the only durable copy of a new row lives">
        <div style={captionLayer}><CaptionLine text="the only durable copy of a new row lives" /></div>
      </Sequence>
      <Sequence from={3455} durationInFrames={130} layout="none" name="Caption · in a separate system and not in your tab…">
        <div style={captionLayer}><CaptionLine text="in a separate system and not in your table" /></div>
      </Sequence>
      <Sequence from={3589} durationInFrames={151} layout="none" name="Caption · LanceDB Realtime Engine works differentl…">
        <div style={captionLayer}><CaptionLine text="LanceDB Realtime Engine works differently." /></div>
      </Sequence>
      <Sequence from={3743} durationInFrames={74} layout="none" name="Caption · You turn it on for a table">
        <div style={captionLayer}><CaptionLine text="You turn it on for a table" /></div>
      </Sequence>
      <Sequence from={3817} durationInFrames={103} layout="none" name="Caption · and its nodes can accept writes from">
        <div style={captionLayer}><CaptionLine text="and its nodes can accept writes from" /></div>
      </Sequence>
      <Sequence from={3920} durationInFrames={127} layout="none" name="Caption · many different clients at the same time.">
        <div style={captionLayer}><CaptionLine text="many different clients at the same time." /></div>
      </Sequence>
      <Sequence from={4052} durationInFrames={148} layout="none" name="Caption · The nodes keep the newest rows in">
        <div style={captionLayer}><CaptionLine text="The nodes keep the newest rows in" /></div>
      </Sequence>
      <Sequence from={4200} durationInFrames={112} layout="none" name="Caption · memory and keep the indexes you">
        <div style={captionLayer}><CaptionLine text="memory and keep the indexes you" /></div>
      </Sequence>
      <Sequence from={4312} durationInFrames={135} layout="none" name="Caption · choose up to date as rows arrive">
        <div style={captionLayer}><CaptionLine text="choose up to date as rows arrive" /></div>
      </Sequence>
      <Sequence from={4461} durationInFrames={133} layout="none" name="Caption · A write is only acknowledged once">
        <div style={captionLayer}><CaptionLine text="A write is only acknowledged once" /></div>
      </Sequence>
      <Sequence from={4594} durationInFrames={102} layout="none" name="Caption · it's durable in object storage.">
        <div style={captionLayer}><CaptionLine text="it's durable in object storage." /></div>
      </Sequence>
      <Sequence from={4708} durationInFrames={84} layout="none" name="Caption · The Realtime Engine is built on">
        <div style={captionLayer}><CaptionLine text="The Realtime Engine is built on" /></div>
      </Sequence>
      <Sequence from={4792} durationInFrames={85} layout="none" name="Caption · MemWAL, which is part of the">
        <div style={captionLayer}><CaptionLine text="MemWAL, which is part of the" /></div>
      </Sequence>
      <Sequence from={4877} durationInFrames={103} layout="none" name="Caption · open-source Lance format.">
        <div style={captionLayer}><CaptionLine text="open-source Lance format." /></div>
      </Sequence>
      <Sequence from={4984} durationInFrames={138} layout="none" name="Caption · MemWAL stores a table's newest">
        <div style={captionLayer}><CaptionLine text="MemWAL stores a table's newest" /></div>
      </Sequence>
      <Sequence from={5122} durationInFrames={103} layout="none" name="Caption · writes inside the table itself">
        <div style={captionLayer}><CaptionLine text="writes inside the table itself" /></div>
      </Sequence>
      <Sequence from={5225} durationInFrames={114} layout="none" name="Caption · Unlike a streaming service">
        <div style={captionLayer}><CaptionLine text="Unlike a streaming service" /></div>
      </Sequence>
      <Sequence from={5342} durationInFrames={123} layout="none" name="Caption · a new row is already in your table">
        <div style={captionLayer}><CaptionLine text="a new row is already in your table" /></div>
      </Sequence>
      <Sequence from={5465} durationInFrames={126} layout="none" name="Caption · the moment its write is confirmed">
        <div style={captionLayer}><CaptionLine text="the moment its write is confirmed" /></div>
      </Sequence>
      <Sequence from={5609} durationInFrames={146} layout="none" name="Caption · There is no disk cluster to replicate or…">
        <div style={captionLayer}><CaptionLine text="There is no disk cluster to replicate or back up." /></div>
      </Sequence>
      <Sequence from={5760} durationInFrames={136} layout="none" name="Caption · Merging new data into the table and">
        <div style={captionLayer}><CaptionLine text="Merging new data into the table and" /></div>
      </Sequence>
      <Sequence from={5896} durationInFrames={117} layout="none" name="Caption · updating its indexes runs in the">
        <div style={captionLayer}><CaptionLine text="updating its indexes runs in the" /></div>
      </Sequence>
      <Sequence from={6013} durationInFrames={109} layout="none" name="Caption · background on separate workers.">
        <div style={captionLayer}><CaptionLine text="background on separate workers." /></div>
      </Sequence>
      <Sequence from={6126} durationInFrames={105} layout="none" name="Caption · The engine plans and schedules">
        <div style={captionLayer}><CaptionLine text="The engine plans and schedules" /></div>
      </Sequence>
      <Sequence from={6231} durationInFrames={103} layout="none" name="Caption · that work for you, and every row">
        <div style={captionLayer}><CaptionLine text="that work for you, and every row" /></div>
      </Sequence>
      <Sequence from={6334} durationInFrames={123} layout="none" name="Caption · stays searchable while it runs.">
        <div style={captionLayer}><CaptionLine text="stays searchable while it runs." /></div>
      </Sequence>
      <Sequence from={6469} durationInFrames={153} layout="none" name="Caption · For example, in reinforcement learning">
        <div style={captionLayer}><CaptionLine text="For example, in reinforcement learning" /></div>
      </Sequence>
      <Sequence from={6622} durationInFrames={80} layout="none" name="Caption · many rollout workers generate">
        <div style={captionLayer}><CaptionLine text="many rollout workers generate" /></div>
      </Sequence>
      <Sequence from={6702} durationInFrames={116} layout="none" name="Caption · trajectories at the same time.">
        <div style={captionLayer}><CaptionLine text="trajectories at the same time." /></div>
      </Sequence>
      <Sequence from={6821} durationInFrames={147} layout="none" name="Caption · A trainer needs the newest ones as they …">
        <div style={captionLayer}><CaptionLine text="A trainer needs the newest ones as they arrive." /></div>
      </Sequence>
      <Sequence from={6982} durationInFrames={169} layout="none" name="Caption · Each rollout also stores the frozen visi…">
        <div style={captionLayer}><CaptionLine text="Each rollout also stores the frozen vision" /></div>
      </Sequence>
      <Sequence from={7151} durationInFrames={164} layout="none" name="Caption · encoder's outputs, which the trainer nee…">
        <div style={captionLayer}><CaptionLine text="encoder's outputs, which the trainer needs." /></div>
      </Sequence>
      <Sequence from={7315} durationInFrames={108} layout="none" name="Caption · If the trainer can't read them yet">
        <div style={captionLayer}><CaptionLine text="If the trainer can't read them yet" /></div>
      </Sequence>
      <Sequence from={7423} durationInFrames={120} layout="none" name="Caption · it has to wait or recompute them on the">
        <div style={captionLayer}><CaptionLine text="it has to wait or recompute them on the" /></div>
      </Sequence>
      <Sequence from={7543} durationInFrames={39} layout="none" name="Caption · GPU.">
        <div style={captionLayer}><CaptionLine text="GPU." /></div>
      </Sequence>
      <Sequence from={7590} durationInFrames={101} layout="none" name="Caption · With standard table commits">
        <div style={captionLayer}><CaptionLine text="With standard table commits" /></div>
      </Sequence>
      <Sequence from={7695} durationInFrames={151} layout="none" name="Caption · each batch of rollouts is a new table ve…">
        <div style={captionLayer}><CaptionLine text="each batch of rollouts is a new table version." /></div>
      </Sequence>
      <Sequence from={7853} durationInFrames={91} layout="none" name="Caption · The workers race to commit">
        <div style={captionLayer}><CaptionLine text="The workers race to commit" /></div>
      </Sequence>
      <Sequence from={7944} durationInFrames={86} layout="none" name="Caption · so many rollouts aren't readable">
        <div style={captionLayer}><CaptionLine text="so many rollouts aren't readable" /></div>
      </Sequence>
      <Sequence from={8030} durationInFrames={110} layout="none" name="Caption · yet when the trainer asks for them.">
        <div style={captionLayer}><CaptionLine text="yet when the trainer asks for them." /></div>
      </Sequence>
      <Sequence from={8144} durationInFrames={101} layout="none" name="Caption · With the Realtime Engine">
        <div style={captionLayer}><CaptionLine text="With the Realtime Engine" /></div>
      </Sequence>
      <Sequence from={8245} durationInFrames={132} layout="none" name="Caption · a rollout is readable as soon as its">
        <div style={captionLayer}><CaptionLine text="a rollout is readable as soon as its" /></div>
      </Sequence>
      <Sequence from={8377} durationInFrames={132} layout="none" name="Caption · write is acknowledged from any machine.">
        <div style={captionLayer}><CaptionLine text="write is acknowledged from any machine." /></div>
      </Sequence>
      <Sequence from={8509} durationInFrames={108} layout="none" name="Caption · The trainer reads the encoder">
        <div style={captionLayer}><CaptionLine text="The trainer reads the encoder" /></div>
      </Sequence>
      <Sequence from={8617} durationInFrames={137} layout="none" name="Caption · outputs instead of recomputing them.">
        <div style={captionLayer}><CaptionLine text="outputs instead of recomputing them." /></div>
      </Sequence>
      <Sequence from={8762} durationInFrames={166} layout="none" name="Caption · In our tests on AWS, once a write was">
        <div style={captionLayer}><CaptionLine text="In our tests on AWS, once a write was" /></div>
      </Sequence>
      <Sequence from={8928} durationInFrames={111} layout="none" name="Caption · acknowledged, another client could read">
        <div style={captionLayer}><CaptionLine text="acknowledged, another client could read" /></div>
      </Sequence>
      <Sequence from={9039} durationInFrames={154} layout="none" name="Caption · it in a median of 52 milliseconds.">
        <div style={captionLayer}><CaptionLine text="it in a median of 52 milliseconds." /></div>
      </Sequence>
      <Sequence from={9213} durationInFrames={156} layout="none" name="Caption · The engine can also split a table into">
        <div style={captionLayer}><CaptionLine text="The engine can also split a table into" /></div>
      </Sequence>
      <Sequence from={9369} durationInFrames={148} layout="none" name="Caption · shards that can be written to in paralle…">
        <div style={captionLayer}><CaptionLine text="shards that can be written to in parallel." /></div>
      </Sequence>
      <Sequence from={9532} durationInFrames={163} layout="none" name="Caption · On one server, a table with one shard ha…">
        <div style={captionLayer}><CaptionLine text="On one server, a table with one shard handled" /></div>
      </Sequence>
      <Sequence from={9695} durationInFrames={145} layout="none" name="Caption · about 80 megabytes of writes per second.">
        <div style={captionLayer}><CaptionLine text="about 80 megabytes of writes per second." /></div>
      </Sequence>
      <Sequence from={9840} durationInFrames={171} layout="none" name="Caption · With four shards, it handled over 300.">
        <div style={captionLayer}><CaptionLine text="With four shards, it handled over 300." /></div>
      </Sequence>
      <Sequence from={10026} durationInFrames={143} layout="none" name="Caption · Four servers, each with its own table">
        <div style={captionLayer}><CaptionLine text="Four servers, each with its own table" /></div>
      </Sequence>
      <Sequence from={10174} durationInFrames={214} layout="none" name="Caption · handled 946 megabytes per second togethe…">
        <div style={captionLayer}><CaptionLine text="handled 946 megabytes per second together." /></div>
      </Sequence>
      <Sequence from={10404} durationInFrames={55} layout="none" name="Caption · These numbers come from our">
        <div style={captionLayer}><CaptionLine text="These numbers come from our" /></div>
      </Sequence>
      <Sequence from={10459} durationInFrames={110} layout="none" name="Caption · test datasets, not a limit.">
        <div style={captionLayer}><CaptionLine text="test datasets, not a limit." /></div>
      </Sequence>
      <Sequence from={10573} durationInFrames={194} layout="none" name="Caption · More shards and servers raise throughput…">
        <div style={captionLayer}><CaptionLine text="More shards and servers raise throughput further." /></div>
      </Sequence>
      <Sequence from={10774} durationInFrames={58} layout="none" name="Caption · After every test">
        <div style={captionLayer}><CaptionLine text="After every test" /></div>
      </Sequence>
      <Sequence from={10832} durationInFrames={113} layout="none" name="Caption · we counted the rows in the table.">
        <div style={captionLayer}><CaptionLine text="we counted the rows in the table." /></div>
      </Sequence>
      <Sequence from={10952} durationInFrames={147} layout="none" name="Caption · Every write the engine confirmed was the…">
        <div style={captionLayer}><CaptionLine text="Every write the engine confirmed was there." /></div>
      </Sequence>
      <Sequence from={11100} durationInFrames={98} layout="none" name="Caption · That's the Realtime Engine">
        <div style={captionLayer}><CaptionLine text="That's the Realtime Engine" /></div>
      </Sequence>
      <Sequence from={11198} durationInFrames={110} layout="none" name="Caption · Rows you write are readable by">
        <div style={captionLayer}><CaptionLine text="Rows you write are readable by" /></div>
      </Sequence>
      <Sequence from={11308} durationInFrames={92} layout="none" name="Caption · every client within milliseconds">
        <div style={captionLayer}><CaptionLine text="every client within milliseconds" /></div>
      </Sequence>
      <Sequence from={11400} durationInFrames={160} layout="none" name="Caption · And your data stays in an open table">
        <div style={captionLayer}><CaptionLine text="And your data stays in an open table" /></div>
      </Sequence>
      <Sequence from={11567} durationInFrames={169} layout="none" name="Caption · To try it, talk to us about LanceDB Ente…">
        <div style={captionLayer}><CaptionLine text="To try it, talk to us about LanceDB Enterprise" /></div>
      </Sequence>
      <Sequence from={11736} durationInFrames={99} layout="none" name="Caption · Or read the blog for more detail">
        <div style={captionLayer}><CaptionLine text="Or read the blog for more detail" /></div>
      </Sequence>
      <Sequence from={11835} durationInFrames={107} layout="none" name="Caption · Links are below">
        <div style={captionLayer}><CaptionLine text="Links are below" /></div>
      </Sequence>
      <Sequence from={11950} durationInFrames={206} layout="none" name="Caption · Thanks to Dan Rammer, Xuanyu Zhan, Jack …">
        <div style={captionLayer}><CaptionLine text="Thanks to Dan Rammer, Xuanyu Zhan, Jack Ye" /></div>
      </Sequence>
      <Sequence from={12169} durationInFrames={143} layout="none" name="Caption · and the whole team behind the Realtime E…">
        <div style={captionLayer}><CaptionLine text="and the whole team behind the Realtime Engine" /></div>
      </Sequence>
      <Sequence from={12320} durationInFrames={77} layout="none" name="Caption · Thanks for watching">
        <div style={captionLayer}><CaptionLine text="Thanks for watching" /></div>
      </Sequence>
      <Sequence from={12397} durationInFrames={133} layout="none" name="Caption · A LanceDB production">
        <div style={captionLayer}><CaptionLine text="A LanceDB production" /></div>
      </Sequence>

    </>
  );
}
