// ─── Lance pocket demo · 16×9 ─────────────────────────────────────────────
// Script: ~/Documents/Video-Projects/Lance/30-second-lance/script.md (also on the
// DevRel Notion page). FOTW Ep. 07 3D kit (boldKit).
//
//   zIndex 1 world backdrop · 3 the 3D world · 4 captions
//
// The whole animation is one continuous world (World.tsx) keyed to the VO's word
// cues (cues.ts). The VO is six clips (cues.ts lists sources and trims); the
// originals stay in the project, so any cut can be extended back in the GUI.
import { Sequence } from "remotion";
import { Audio } from "@remotion/media";
import { World, WorldBg } from "./World";
import CaptionLine from "./CaptionLine";
import { C, VO } from "./cues";

// Mastered VO (30-second-lance/audio/*_loud.wav): highpass 80 Hz, 4:1 compression, gain into a limiter, then −1 dB: ~-12.8 LUFS / -1.6 dBTP (Nov 12, Cole: "lower volume slightly").
// Full-length renders of each source, so the trims below are the same as on the raw files.
// Raw originals stay in the project: A001_11112123_C025.mov = kino:0e1c895f-f011-4d17-96f3-cf95ad07d480,
// A001_11120946_C029.mov = kino:e5161ad6-de43-42a7-a395-9c32f06a8b4a.

const layer = (zIndex: number) => ({ position: "absolute" as const, inset: 0, zIndex });

export default function App() {
  return (
    <>
      <Sequence name="World backdrop" from={0} durationInFrames={C.end} layout="none">
        <div name="Backdrop layer" style={layer(1)}>
          <WorldBg />
        </div>
      </Sequence>

      <Sequence name="Lance world · one continuous animation" from={0} durationInFrames={C.end} layout="none">
        <div name="World layer" style={layer(3)}>
          <World />
        </div>
      </Sequence>

      {/* ── captions, one clip per line (max two lines each) ─────────────── */}
      <Sequence name="Caption · Robots record camera frames," from={C.robots} durationInFrames={C.depth - 2 - (C.robots)} layout="none">
        <div style={layer(4)}><CaptionLine text="Robots record camera frames," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · depth, joint states, and actions." from={C.depth - 2} durationInFrames={C.s1End + 14 - (C.depth - 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="depth, joint states, and actions." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Most teams split these across…" from={C.most - 5} durationInFrames={C.meta - 2 - (C.most - 5)} layout="none">
        <div style={layer(4)}><CaptionLine text="Most teams split these across video files," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · metadata tables, and a separat…" from={C.meta - 2} durationInFrames={C.s2End + 14 - (C.meta - 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="metadata tables, and a separate vector store." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Lance stores all of it in one…" from={C.lanceStores} durationInFrames={C.s3End + 14 - (C.lanceStores)} layout="none">
        <div style={layer(4)}><CaptionLine text="Lance stores all of it in one table." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Each row holds a moment's frames," from={C.eachRow - 8} durationInFrames={C.sensor - 2 - (C.eachRow - 8)} layout="none">
        <div style={layer(4)}><CaptionLine text="Each row holds a moment's frames," size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · sensor data, and embeddings." from={C.sensor - 2} durationInFrames={C.s4End + 14 - (C.sensor - 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="sensor data, and embeddings." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · LanceDB is the database built…" from={C.lancedb} durationInFrames={C.byTeam - (C.lancedb)} layout="none">
        <div style={layer(4)}><CaptionLine text="LanceDB is the database built on Lance" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · by the team that created it." from={C.byTeam} durationInFrames={C.s5End + 14 - (C.byTeam)} layout="none">
        <div style={layer(4)}><CaptionLine text="by the team that created it." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · One query on LanceDB can find" from={C.oneQuery} durationInFrames={C.every - (C.oneQuery)} layout="none">
        <div style={layer(4)}><CaptionLine text="One query on LanceDB can find" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · every failed grasp on one robot" from={C.every} durationInFrames={C.s6End - (C.every)} layout="none">
        <div style={layer(4)}><CaptionLine text="every failed grasp on one robot" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and return the exact frames an…" from={C.s6End + 2} durationInFrames={C.actions2End - (C.s6End + 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="and return the exact frames and actions" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · from that exact moment." from={C.actions2End} durationInFrames={C.s7End + 14 - (C.actions2End)} layout="none">
        <div style={layer(4)}><CaptionLine text="from that exact moment." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · As your fleet grows, LanceDB…" from={C.outgrow - 6} durationInFrames={C.takesWork - 2 - (C.outgrow - 6)} layout="none">
        <div style={layer(4)}><CaptionLine text="As your fleet grows, LanceDB Enterprise" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · takes the work right off your plate." from={C.takesWork - 2} durationInFrames={C.s8End + 16 - (C.takesWork - 2)} layout="none">
        <div style={layer(4)}><CaptionLine text="takes the work right off your plate." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · It reads the same tables strai…" from={C.reads} durationInFrames={C.bucketEnd + 12 - (C.reads)} layout="none">
        <div style={layer(4)}><CaptionLine text="It reads the same tables straight from your bucket" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · and spreads each search across…" from={C.bucketEnd + 12} durationInFrames={C.s9End + 14 - (C.bucketEnd + 12)} layout="none">
        <div style={layer(4)}><CaptionLine text="and spreads each search across the cluster." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · As new episodes arrive, it upd…" from={C.newEp} durationInFrames={C.indexesEnd + 4 - (C.newEp)} layout="none">
        <div style={layer(4)}><CaptionLine text="As new episodes arrive, it updates the indexes" size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · so they're searchable within m…" from={C.indexesEnd + 4} durationInFrames={C.s10End + 14 - (C.indexesEnd + 4)} layout="none">
        <div style={layer(4)}><CaptionLine text="so they're searchable within milliseconds." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Lance and LanceDB are open sou…" from={C.openSource - 6} durationInFrames={C.s11End + 14 - (C.openSource - 6)} layout="none">
        <div style={layer(4)}><CaptionLine text="Lance and LanceDB are open source." size={46} bottom={70} /></div>
      </Sequence>
      <Sequence name="Caption · Visit us at lancedb.com and st…" from={C.visit - 6} durationInFrames={C.voEnd + 30 - (C.visit - 6)} layout="none">
        <div style={layer(4)}><CaptionLine text="Visit us at lancedb.com and start today." size={46} bottom={70} /></div>
      </Sequence>
    </>
  );
}
