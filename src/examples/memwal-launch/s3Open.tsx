import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import {
  Scene3D, useKit, useF, rigPath, ramp, back, io, mix, hop, flash, slot, stack, rand,
  Box, Plate, Cube, File, Pillar, Query, Rod, Bin, Outline, T, LANCE, V3,
} from "./rte3d";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// OpenTable — "Your data stays in open Lance tables on object storage. It's
// available now in LanceDB Enterprise."
//   A writer drops rows into a Lance table; a reader pulls each one right
//   after. Tilt down onto object storage under it.
// ═══════════════════════════════════════════════════════════════════════════
const OT = { cols: 8, rows: 5, pitch: 0.44 };
export const OpenTable: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("openTable");
  const storage = C("storage", 170);
  const ent = C("enterprise", 300);
  const rig = rigPath(f, [
    [0, { tilt: 0.42, y: -0.2, z: 1.2 }],
    [storage - 20, { tilt: 0.5, y: -0.1, z: 1.6 }],
    [storage + 40, { tilt: 0.86, y: 0.5, z: 0.6 }],
    [ent + 40, { tilt: 0.8, y: 0.4, z: 0.2 }],
  ]);
  const WR: V3 = [-4.4, 0, 0.9];
  const RD: V3 = [4.4, 0, 0.9];
  const OLD = 16;
  const N = 18;
  const at = (i: number) => 6 + i * 17;
  const tableIn = ramp(f, 0, 18, back(1.3));
  const storeV = ramp(f, storage - 6, storage + 20);
  const cubes: React.ReactNode[] = [];
  for (let i = 0; i < OLD; i++) cubes.push(<Cube key={"o" + i} k={k} p={slot(OT.cols * OT.rows - 1 - i, OT.cols, OT.rows, OT.pitch, 0.08)} s={0.26 * tableIn} />);
  let readHit = -999;
  for (let i = 0; i < N; i++) {
    const a = at(i);
    const on = f >= a;
    const dst = slot(OT.cols * OT.rows - 1 - OLD - i, OT.cols, OT.rows, OT.pitch, 0.08);
    const t = ramp(f, a, a + 18, io);
    const p = t < 1 ? hop([WR[0], 1.1, WR[2]], dst, t, 1.2) : dst;
    const lit = flash(f, a + 18, 30);
    cubes.push(<Cube key={"n" + i} k={k} p={p} s={on ? 0.26 : 0} m={lit > 0.3 ? k.m.live : k.m.done} />);
    // the reader pulls it right after
    const r0 = a + 22;
    const rt = ramp(f, r0, r0 + 16, io);
    cubes.push(<Cube key={"r" + i} k={k} p={hop(dst, [RD[0], 1.0, RD[2]], rt, 0.9)} s={f >= r0 && f < r0 + 16 ? 0.16 : 0} m={k.m.live} />);
    if (f >= r0) readHit = r0 + 16;
  }
  const rd = flash(f, readHit, 14);
  return (
    <Scene3D
      name="Open Lance table"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([WR[0], 0, WR[2] + 0.5])} dy={26}>writer</T>
          <T at={pr([RD[0], 0, RD[2] + 0.5])} dy={26}>reader</T>
          <T at={pr([0, 0.1, (OT.rows * OT.pitch) / 2 + 0.25])} dy={26} color={LANCE.offwhite}>
            lance table
          </T>
          <T at={pr([0, 0.1, -(OT.rows * OT.pitch) / 2 - 0.3])} dy={-24} o={ramp(f, C("open", 90) - 6, C("open", 90) + 12)} color={LANCE.dark200}>
            open format
          </T>
          <T at={pr([-5.0, 0, 2.3])} o={storeV} align="left" color={LANCE.dark100}>
            object storage
          </T>
          <T at={pr([0, 1.6, -1.4])} o={ramp(f, ent - 6, ent + 14)} size={30} color={LANCE.orange300}>
            available in LanceDB Enterprise
          </T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={11.5} d={5.2} rim={storeV} rimMat={k.m.rim} />
      <Plate k={k} p={[0, 0.08, 0]} w={OT.cols * OT.pitch + 0.4} d={OT.rows * OT.pitch + 0.4} h={0.08} m={k.m.plateHi} />
      {cubes}
      <Pillar k={k} p={WR} />
      <Pillar k={k} p={RD} lit={rd} />
      <Rod k={k} a={[RD[0], 0.95, RD[2]]} b={[1.6, 0.4, 0.3]} m={k.m.beamLav} t={rd} r={0.03} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Version stack shared by LakeIntro / Lakehouse / Batch: a table is a pile of
// committed versions (thin slabs), each holding its rows.
// ═══════════════════════════════════════════════════════════════════════════
const TB: V3 = [-2.6, 0, 0];
const SLAB = { w: 2.8, d: 2.0, h: 0.13 };
const slabY = (i: number) => 0.02 + i * (SLAB.h + 0.03);

/** the current rows, sitting on top of the stack */
const TopRows: React.FC<{ k: ReturnType<typeof useKit>; count: number; lit?: number }> = ({ k, count, lit = 0 }) => (
  <>
    {Array.from({ length: 24 }).map((_, i) => {
      const p = slot(i, 6, 4, 0.42, slabY(count));
      return <Cube key={"tr" + i} k={k} p={[TB[0] + p[0], p[1], TB[2] + p[2]]} s={0.22} m={i >= 24 - lit ? k.m.done : k.m.idle} />;
    })}
  </>
);
const tilesFor = (n: number, cols: number, x0: number, z0: number, pitch = 0.36) =>
  Array.from({ length: n }).map((_, i) => [x0 + ((i % cols) - (cols - 1) / 2) * pitch, z0 - Math.floor(i / cols) * pitch] as [number, number]);

// ═══════════════════════════════════════════════════════════════════════════
// LakeIntro (version B only) — "Lakehouse formats like Iceberg and Delta Lake
// store huge amounts of data cheaply on object storage. They weren't built for
// data that arrives every millisecond. New rows can take seconds or minutes
// before readers see them."
// ═══════════════════════════════════════════════════════════════════════════
export const LakeIntro: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("lakeIntro");
  const ms = C("millisecond", 260);
  const secs0 = C("seconds", 360);
  const rig = rigPath(f, [
    [0, { tilt: 0.7, y: 0.4, z: 0.4 }],
    [ms - 20, { tilt: 0.66, y: 0.2, z: 1.2 }],
    [ms + 30, { tilt: 0.5, y: -0.6, z: 1.0 }],
  ]);
  const huge = ramp(f, C("huge", 60) - 10, C("cheaply", 110) + 20);
  const store = ramp(f, C("storage", 150) - 8, C("storage", 150) + 16);
  const n = Math.round(mix(12, 96, huge));
  const field = (x0: number, salt: string) =>
    Array.from({ length: 96 }).map((_, i) => {
      const [x, z] = [x0 + ((i % 12) - 5.5) * 0.3, ((Math.floor(i / 12)) - 3.5) * 0.3];
      const a = ramp(f, i * 0.4, i * 0.4 + 10, back(1.8));
      return <Cube key={salt + "-" + i} k={k} p={[x, 0.06, z]} s={i < n ? 0.2 * a : 0} />;
    });
  // rows arriving every millisecond, held above the table until the next commit
  const rain: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
      const a = ms - 10 + i * 3;
      const x = (rand(i) - 0.5) * 7.4, z = (rand(i + 50) - 0.5) * 2.2;
      const t = ramp(f, a, a + 20, (q) => q * q);
      const y = mix(5, 1.25 + (i % 3) * 0.2, t);
      rain.push(<Cube key={"r" + i} k={k} p={[x, y, z]} s={f >= a ? 0.2 : 0} m={t < 1 ? k.m.live : k.m.done} />);
    }
  const gate = ramp(f, ms - 6, ms + 14);
  const wait = ramp(f, secs0 - 10, C("minutes", 400) + 40, (q) => q);
  const s = Math.round(mix(0, 180, wait));
  const label = s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`;
  const readerIn = ramp(f, secs0 - 40, secs0 - 20);
  return (
    <Scene3D
      name="Lakehouse on object storage"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([-2.4, 0, 1.6])} dy={22} color={LANCE.offwhite}>iceberg</T>
          <T at={pr([2.4, 0, 1.6])} dy={22} color={LANCE.offwhite}>delta lake</T>
          <T at={pr([-5.4, 0, 2.6])} o={store} align="left" color={LANCE.dark100}>object storage</T>
          <T at={pr([0, 1.1, -1.4])} o={gate} dy={-12}>next commit</T>
          <T at={pr([4.6, 1.2, 1.4])} o={readerIn} dy={-46} size={34} color={LANCE.orange300}>{label}</T>
          <T at={pr([4.6, 0, 1.8])} o={readerIn} dy={24}>reader</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={12} d={5.4} rim={store} rimMat={k.m.rim} />
      <Plate k={k} p={[-2.4, 0.06, 0]} w={3.9} d={2.7} h={0.06} m={k.m.plateHi} />
      <Plate k={k} p={[2.4, 0.06, 0]} w={3.9} d={2.7} h={0.06} m={k.m.plateHi} />
      {field(-2.4, "i")}
      {field(2.4, "d")}
      <Box k={k} p={[0, 1.18, 0]} s={[7.8 * gate, 0.04, 2.6]} m={k.m.glass} />
      {rain}
      <Pillar k={k} p={[4.6, 0, 1.4]} s={readerIn} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Lakehouse — "They make a change visible by committing a new table version.
// That works well for hourly batch jobs, but when rows arrive every
// millisecond, it doesn't. Committing every few rows piles up metadata files,
// and writers fight over the next version number."
// ═══════════════════════════════════════════════════════════════════════════
export const Lakehouse: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("lakehouse");
  const visible = C("visible", -999);
  const commit = C("committing", Math.max(30, visible + 40));
  const hourly = C("hourly", 200);
  const ms = C("millisecond", 300);
  const piles = C("piles", 420);
  const writers = C("writers", 520);
  const fight = C("fight", writers + 20);
  const rig = rigPath(f, [
    [0, { tilt: 0.55, y: -0.3, z: 2.0, x: 1.4 }],
    [ms - 20, { tilt: 0.55, y: -0.3, z: 2.0, x: 1.4 }],
    [ms + 30, { tilt: 0.62, y: -0.5, z: 1.0, x: 0.6 }],
    [writers - 10, { tilt: 0.62, y: -0.5, z: 1.0, x: 0.6 }],
    [writers + 30, { tilt: 0.42, y: -1.4, z: 0.6, x: 0.4 }],
  ]);
  // versions: 3 standing, a 4th drops on "committing"; then one every few rows
  const fast = f >= ms ? Math.min(14, Math.floor((f - ms) / 9)) : 0;
  const count = 3 + (f >= commit ? 1 : 0) + fast;
  const slabs: React.ReactNode[] = [];
  for (let i = 0; i < 18; i++) {
    const born = i < 3 ? -999 : i === 3 ? commit : ms + (i - 4) * 9 + 9;
    const t = ramp(f, born, born + 14, io);
    const y = slabY(i) + (1 - t) * 1.6;
    const lit = flash(f, born + 14, 20);
    slabs.push(<Box key={"s" + i} k={k} p={[TB[0], y + SLAB.h / 2, TB[2]]} s={i < count ? [SLAB.w, SLAB.h, SLAB.d] : 0} m={lit > 0.3 ? k.m.live : i >= 3 ? k.m.done : k.m.dim} />);
  }
  const verNum = 3 + (f >= commit ? 1 : 0) + (f >= ms ? Math.floor((f - ms) / 3) : 0);
  // hourly: one fat batch rides in slowly
  const hb = ramp(f, hourly, hourly + 60, io);
  const hourOn = f >= hourly && f < ms - 10 ? 1 : 0;
  // every ms: rows racing in
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < 80; i++) {
      const a = ms + i * 2.2;
      const t = ramp(f, a, a + 16, io);
      rows.push(<Cube key={"r" + i} k={k} p={hop([4.5, 2.2, (rand(i) - 0.5) * 2], [TB[0] + (rand(i + 9) - 0.5) * 2, slabY(count) + 0.4, (rand(i + 3) - 0.5) * 1.4], t, 0.6)} s={f >= ms && t > 0 && t < 1 ? 0.16 : 0} m={k.m.done} />);
    }
  // metadata files: a heap of paper tiles next to the stack
  const pileN = f < piles - 40 ? 0 : Math.min(220, Math.floor((f - (piles - 40)) * 2.2));
  const pile: React.ReactNode[] = [];
  for (let i = 0; i < 220; i++) {
    const a = rand(i) * Math.PI * 2, r = Math.sqrt(rand(i + 7)) * 1.5;
    const layer = Math.floor(i / 26);
    pile.push(<File key={"m" + i} k={k} p={[0.6 + Math.cos(a) * r * (1 - layer * 0.06), layer * 0.07, 0.4 + Math.sin(a) * r * 0.7]} w={i < pileN ? 0.36 : 0} d={0.26} />);
  }
  // two writers launch at the same next version; one bounces off
  const wIn = ramp(f, writers - 8, writers + 10);
  const tgt: V3 = [TB[0], slabY(count) + 0.3, TB[2]];
  const flyT = ramp(f, fight - 26, fight, io);
  const bounce = ramp(f, fight, fight + 30);
  const W1: V3 = [-6.2, 0, -1.2], W2: V3 = [2.6, 0, -1.6];
  const p1 = hop([W1[0], 1.1, W1[2]], tgt, flyT, 1.4);
  const p2 = flyT < 1 ? hop([W2[0], 1.1, W2[2]], tgt, flyT, 1.4) : ([mix(tgt[0], 0.4, bounce), tgt[1] + Math.sin(bounce * Math.PI) * 1.0 - bounce * 1.6, mix(tgt[2], -1.4, bounce)] as V3);
  return (
    <Scene3D
      name="Lakehouse commits"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TB[0], slabY(count) + 0.2, TB[2] - SLAB.d / 2])} dy={-22} size={26} o={1 - wIn} color={f >= ms ? LANCE.orange300 : LANCE.offwhite}>{`table · v${verNum}`}</T>
          <T at={pr([-6.4, 0, 2.6])} o={1 - ramp(f, ms - 20, ms)} align="left" color={LANCE.dark100}>object storage</T>
          <T at={pr([4.4, 0.6, 0.4])} o={hourOn * ramp(f, hourly, hourly + 12)} dy={-30}>every hour</T>
          <T at={pr([1.8, 0, 1.9])} o={ramp(f, piles - 10, piles + 10)} dy={20}>metadata files</T>
          <T at={pr([W1[0], 0, W1[2] + 0.4])} o={wIn} dy={22}>writer 1</T>
          <T at={pr([W2[0], 0, W2[2] + 0.4])} o={wIn} dy={22}>writer 2</T>
          <T at={pr([tgt[0], tgt[1] + 0.6, tgt[2]])} o={wIn} dy={-20} size={28} color={LANCE.orange300}>{`v${verNum + 1}?`}</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={14} d={5.4} />
      {slabs}
      <TopRows k={k} count={count} lit={Math.min(24, fast * 2 + (f >= commit ? 6 : 0))} />
      <Box k={k} p={hop([4.4, 0.6, 0.4], [TB[0], slabY(count) + 0.3, 0], hb, 1.2)} s={hourOn && hb < 1 ? [1.4, 0.3, 1.0] : 0} m={k.m.done} />
      {rows}
      {pile}
      <Pillar k={k} p={W1} s={wIn} />
      <Pillar k={k} p={W2} s={wIn} />
      <Box k={k} p={p1} s={wIn > 0.01 && flyT > 0 ? [0.9, 0.12, 0.65] : 0} m={k.m.live} />
      <Box k={k} p={p2} s={wIn > 0.01 && flyT > 0 && bounce < 1 ? [0.9, 0.12, 0.65] : 0} m={flyT >= 1 ? k.m.dim : k.m.live} r={[0, 0, bounce * 2]} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Batch — "Batching rows into bigger commits fixes the metadata problem. The
// issue here is that readers wait seconds or minutes to see new data."
// ═══════════════════════════════════════════════════════════════════════════
export const Batch: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("batch");
  const commits = C("commits", 110);
  const fixes = C("fixes", 140);
  const readers = C("readers", 340);
  const rig = rigPath(f, [
    [0, { tilt: 0.62, y: -0.5, z: 1.0, x: 0.6 }],
    [readers - 20, { tilt: 0.62, y: -0.5, z: 1.0, x: 0.6 }],
    [readers + 30, { tilt: 0.55, y: -0.4, z: 1.6, x: -0.6 }],
  ]);
  const BIN: V3 = [1.4, 0, -0.2];
  const PER = 25;
  // rows trickle into the bin all scene long; it empties into one commit at "commits"
  const arrived = (t: number) => Math.max(0, Math.floor((t - 2) / 7));
  const total = arrived(f);
  const drop1 = commits;
  const inBin = f < drop1 ? Math.min(PER * 2, total) : Math.min(PER * 2, total - arrived(drop1));
  const binCubes: React.ReactNode[] = [];
  const c1_ = ramp(f, commits, commits + 20, io);
  for (let i = 0; i < PER * 2; i++) binCubes.push(<Cube key={i} k={k} p={[BIN[0] + stack(i, 5, 0.24)[0], stack(i, 5, 0.24)[1] - 0.1, BIN[2] + stack(i, 5, 0.24)[2]]} s={i < inBin && !(c1_ > 0 && c1_ < 1) ? 0.2 : 0} m={k.m.done} />);
  const fly: React.ReactNode[] = [];
  for (let i = 0; i < 90; i++) {
    const a = 2 + i * 7;
    const t = ramp(f, a - 14, a, io);
    fly.push(<Cube key={"f" + i} k={k} p={hop([5.2, 1.4, -1], [BIN[0], 1.0, BIN[2]], t, 0.5)} s={t > 0 && t < 1 ? 0.18 : 0} m={k.m.done} />);
  }
  const c1 = ramp(f, drop1, drop1 + 20, io);
  const big = c1 > 0 && c1 < 1;
  const count = f >= drop1 + 20 ? 5 : 4;
  const slabs: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) slabs.push(<Box key={i} k={k} p={[TB[0], slabY(i) + SLAB.h / 2, 0]} s={i < count ? [SLAB.w, SLAB.h, SLAB.d] : 0} m={i === 4 ? (flash(f, drop1 + 20, 24) > 0.3 ? k.m.live : k.m.done) : k.m.dim} />);
  // the metadata heap from the last scene sinks away
  const sink = ramp(f, fixes - 4, fixes + 40, io);
  const pile: React.ReactNode[] = [];
  for (let i = 0; i < 160; i++) {
    const a = rand(i) * Math.PI * 2, r = Math.sqrt(rand(i + 7)) * 1.5;
    pile.push(<File key={"m" + i} k={k} p={[0.6 + Math.cos(a) * r, Math.floor(i / 26) * 0.07 - sink * 0.3, 1.9 + Math.sin(a) * r * 0.5]} w={i < Math.round(160 * (1 - sink)) ? 0.36 : 0} d={0.26} />);
  }
  const rIn = ramp(f, readers - 10, readers + 8);
  const wait = ramp(f, C("seconds", readers + 50) - 6, C("minutes", readers + 90) + 40, (q) => q);
  const s = Math.round(mix(0, 180, wait));
  const label = s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`;
  const R: V3 = [-6.0, 0, 0.8];
  return (
    <Scene3D
      name="Batching commits"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([BIN[0], 1.4, BIN[2]])} dy={-14}>batch</T>
          <T at={pr([TB[0], slabY(count), -SLAB.d / 2])} dy={-22} color={LANCE.offwhite}>table</T>
          <T at={pr([R[0], 1.0, R[2]])} o={rIn} dy={-44} size={34} color={LANCE.orange300}>{label}</T>
          <T at={pr([R[0], 0, R[2] + 0.4])} o={rIn} dy={22}>reader</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={14} d={5.4} />
      {slabs}
      <TopRows k={k} count={count} lit={count >= 5 ? 12 : 0} />
      <Box k={k} p={hop([BIN[0], 0.7, BIN[2]], [TB[0], slabY(4) + 0.1, 0], c1, 1.4)} s={big ? [mix(1.3, SLAB.w, c1), mix(0.6, SLAB.h, c1), mix(1.3, SLAB.d, c1)] : 0} m={k.m.live} />
      <Bin k={k} p={BIN} inner={1.3} h={1.2} hot={inBin >= PER * 2 - 2} />
      {binCubes}
      {fly}
      {pile}
      <Pillar k={k} p={R} s={rIn} />
      <Rod k={k} a={[R[0], 0.95, R[2]]} b={[TB[0] - 0.4, slabY(count) + 0.6, 0]} m={k.m.beamDim} t={rIn} r={0.02} />
    </Scene3D>
  );
};
