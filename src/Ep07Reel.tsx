import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { LANCE } from "./lanceTheme";
import Intro from "./Intro";
import Outro from "./Outro";
import NameCard from "./NameCard";
import ContribIdent from "./ContribIdent";
import { PrPage3D, PRS } from "./PrPage3D";
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
import SeriesGag from "./SeriesGag";
import TwoCasesGag from "./TwoCasesGag";
import CombinedGag from "./CombinedGag";
import Confetti from "./Confetti";

/**
 * Every graphic from Ep. 07 (BM25F) at the exact frame it played in the
 * episode, with the talking-head footage, VO and captions left out.
 * Frame numbers are copied from that episode's App.tsx.
 *
 * Read it as the reference for how a real episode is sequenced:
 *   - adjacent "slide" scenes overlap by SLIDE_FRAMES (22) so they push edge to edge
 *   - "whoosh" is used cutting from the face to a graphic and back
 *   - gags/idents sit on a layer above scenes
 * The dark gaps are where the talking head would be.
 */
const full = { position: "absolute" as const, inset: 0 };
const layer = (z: number) => ({ ...full, zIndex: z });

export const EP07_FRAMES = 11976;

export const Ep07Reel: React.FC = () => (
  <AbsoluteFill style={{ background: LANCE.dark700 }}>
    <Sequence from={0} durationInFrames={210} name="Intro"><div style={layer(8)}><Intro /></div></Sequence>

    {/* explainers, zIndex 4 */}
    <Sequence from={948} durationInFrames={492} name="PR page · #7905"><div style={layer(4)}><PrPage3D pr={PRS.bm25f} hops={{ add: 42, BM25F: 390 }} enter="whoosh" exit="slide" /></div></Sequence>
    <Sequence from={1418} durationInFrames={909} name="RankMachine"><div style={layer(4)}><RankMachine enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={2305} durationInFrames={453} name="HowOften"><div style={layer(4)}><HowOften enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={2736} durationInFrames={547} name="HowRare"><div style={layer(4)}><HowRare enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={3261} durationInFrames={942} name="HowLong"><div style={layer(4)}><HowLong enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={4181} durationInFrames={1451} name="StatsMulti"><div style={layer(4)}><StatsMulti enter="slide" exit="whoosh" /></div></Sequence>
    <Sequence from={5860} durationInFrames={2235} name="MultiCases"><div style={layer(4)}><MultiCases enter="whoosh" exit="whoosh" /></div></Sequence>
    <Sequence from={8326} durationInFrames={1310} name="CombinedFields"><div style={layer(4)}><CombinedFields enter="whoosh" exit="slide" /></div></Sequence>
    <Sequence from={9614} durationInFrames={434} name="Boost"><div style={layer(4)}><Boost enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={10026} durationInFrames={262} name="CodeCards"><div style={layer(4)}><CodeCards enter="slide" exit="slide" /></div></Sequence>
    <Sequence from={10266} durationInFrames={679} name="Reqs"><div style={layer(4)}><Reqs enter="slide" exit="whoosh" /></div></Sequence>

    {/* cards + gags, zIndex 6 */}
    <Sequence from={366} durationInFrames={145} name="Name cards">
      <div style={layer(6)}>
        <NameCard name="Cole Dumanski" x={0.27} bottom={186} cue={6} from="left" />
        <NameCard name="Chanchan Mao" x={0.72} bottom={186} cue={20} from="right" />
      </div>
    </Sequence>
    <Sequence from={386} durationInFrames={266} name="SeriesGag"><div style={layer(6)}><SeriesGag /></div></Sequence>
    <Sequence from={658} durationInFrames={120} name="Ident · sbrunk"><div style={layer(6)}><ContribIdent handle="sbrunk" name="Sören Brunk" monogram="SB" role="PR #7905 · #9444 · lance-format/lance" x={0.5} y={0.17} /></div></Sequence>
    <Sequence from={814} durationInFrames={144} name="Ident · Xuanwo"><div style={layer(6)}><ContribIdent handle="Xuanwo" name="Xuanwo" monogram="XW" role="REVIEW · PR #7905" x={0.27} y={0.17} /></div></Sequence>
    <Sequence from={854} durationInFrames={104} name="Ident · BubbleCal"><div style={layer(6)}><ContribIdent handle="BubbleCal" name="Yang Cen" monogram="YC" role="REVIEW · PR #7905" x={0.73} y={0.17} /></div></Sequence>
    <Sequence from={5628} durationInFrames={248} name="TwoCasesGag"><div style={layer(6)}><TwoCasesGag /></div></Sequence>
    <Sequence from={8073} durationInFrames={269} name="CombinedGag"><div style={layer(6)}><CombinedGag /></div></Sequence>
    <Sequence from={10925} durationInFrames={157} name="Confetti"><div style={layer(6)}><Confetti /></div></Sequence>

    <Sequence from={11556} durationInFrames={420} name="Outro"><div style={layer(8)}><Outro /></div></Sequence>
  </AbsoluteFill>
);
