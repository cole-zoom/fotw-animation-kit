import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { Scene3D, useKit, useF, ramp, back, io, mix, hop, flash, stack, slot, T } from "./rte3d";
import { rigKeys } from "./v3Why";
import {
  World, NodeDeck, PadCubes, PadIndex, TABLE, BASE, MEMWAL, NODE, CLIENTS, GATE, READER, WORKERS, FLOOR,
  basePos, walPos, sstPos, padPos, padSlot, PADX, Box, Plate, Cube, File, Pillar, Query, Rod, Outline, LANCE,
} from "./world";

type P = { enter?: SceneTransition; exit?: SceneTransition };
type V3 = [number, number, number];

// ═══════════════════════════════════════════════════════════════════════════
// 4a · MemWalInside — "The Realtime Engine is built on MemWAL, which is part of
// the open-source Lance format. MemWAL stores a table's newest writes inside the
// table itself. Unlike a streaming service, a new row is already in your table
// the moment its write is confirmed."
//   The same table footprint, now read as a folder: base/ and _mem_wal/. The
//   WAL files and SSTables live INSIDE the table outline; a streaming service
//   outside it is not needed.
// ═══════════════════════════════════════════════════════════════════════════
const SVC: V3 = [-4.4, 0.5, -1.6];
export const MemWalInside: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("memwal");
  const mw = C("memwall", 34);
  const open = C("open", mw + 100);
  const stores = C("stores", 260);
  const unlike = C("unlike", 470);
  const row = C("row", 600);
  const confirmed = C("confirmed", 790);
  const rig = rigKeys(f, [
    [0, { tilt: 0.7, y: -0.6, z: 1.8, x: -0.3 }],
    [unlike - 20, { tilt: 0.7, y: -0.6, z: 1.8, x: -0.3 }],
    [unlike + 30, { tilt: 0.62, y: -1.0, z: 1.2, x: 1.2 }],
  ]);
  const zone = ramp(f, mw - 8, mw + 16);
  const files = ramp(f, stores - 6, stores + 30);
  const ghost = ramp(f, C("streaming", unlike + 20) - 10, C("streaming", unlike + 20) + 12, back(1.2));
  const ghostDown = ramp(f, unlike + 80, unlike + 120, io);
  const wt = ramp(f, row - 34, row - 8, io);
  const ok = flash(f, confirmed, 70);
  return (
    <Scene3D
      name="MemWAL inside the table"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TABLE.c[0] - TABLE.w / 2, 0.05, TABLE.c[2] + TABLE.d / 2 + 0.25])} align="left" dy={14} color={LANCE.offwhite}>lance table · open format</T>
          <T at={pr([BASE.c[0] - 2.8, 0.05, BASE.c[2]])} align="right" size={22} color={LANCE.dark100}>base/</T>
          <T at={pr([MEMWAL.c[0] - MEMWAL.w / 2 - 0.2, 0.05, MEMWAL.c[2]])} align="right" size={22} color={zone > 0.5 ? LANCE.orange300 : LANCE.dark100}>_mem_wal/</T>
          <T at={pr([MEMWAL.c[0], 0.3, MEMWAL.c[2] + 0.6])} o={zone} dy={22} size={30} color={LANCE.orange300}>MemWAL</T>
          <T at={pr([MEMWAL.c[0], 0.3, MEMWAL.c[2] + 0.6])} o={ramp(f, open - 6, open + 10)} dy={58} size={20}>part of the open-source Lance format</T>
          <T at={pr([walPos(3)[0], 0.05, MEMWAL.c[2] - 0.5])} o={files} dy={-12} size={18}>WAL files</T>
          <T at={pr([sstPos(2)[0], 0.05, MEMWAL.c[2] - 0.5])} o={files} dy={-12} size={18}>SSTables</T>
          <T at={pr([SVC[0], SVC[1], SVC[2] + 1.0])} o={ghost * (1 - ghostDown)} dy={16} size={20}>streaming service</T>
          <T at={pr([CLIENTS[1][0], 1.2, CLIENTS[1][2]])} o={ok} dy={-24} size={24} color={LANCE.orange300}>confirmed · already in your table</T>
          <T at={pr([CLIENTS[1][0], 0, CLIENTS[1][2] + 0.4])} dy={18}>writer</T>
        </>
      )}
    >
      <World k={k} rimOn={ok > 0 ? 1 : 0} memwal={1} />
      <Box k={k} p={[MEMWAL.c[0], 0.05, MEMWAL.c[2]]} s={[MEMWAL.w * zone, 0.014, MEMWAL.d]} m={k.m.done} />
      {Array.from({ length: 9 }).map((_, i) => (
        <File key={"w" + i} k={k} p={[walPos(i)[0], 0.06, MEMWAL.c[2]]} w={files > 0.5 && i < 7 ? 0.34 : 0} d={0.3} />
      ))}
      {[1, 2, 3].map((g) => <File key={"g" + g} k={k} p={[sstPos(g)[0], 0.06, sstPos(g)[2]]} w={files > 0.5 ? 0.6 : 0} d={0.44} />)}
      <Pillar k={k} p={CLIENTS[1]} lit={ok} />
      <Cube k={k} p={hop([CLIENTS[1][0], 1.0, CLIENTS[1][2]], [walPos(7)[0], 0.06, MEMWAL.c[2]], wt, 1.6)} s={wt > 0 && wt < 1 ? 0.26 : 0} m={k.m.live} />
      <File k={k} p={[walPos(7)[0], 0.06, MEMWAL.c[2]]} w={wt >= 1 ? 0.34 : 0} d={0.3} m={k.m.live} />
      <Plate k={k} p={[SVC[0], Math.max(0.01, SVC[1] * ghost * (1 - ghostDown)), SVC[2]]} w={ghost > 0.01 && ghostDown < 1 ? 2.0 : 0.001} d={ghost > 0.01 && ghostDown < 1 ? 1.4 : 0.001} h={Math.max(0.01, 0.5 * ghost * (1 - ghostDown))} m={k.m.ghost} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4b · OssEnterprise — "In open source, MemWAL runs inside your process…" →
// "…keeps merging and indexing running for you."
//   OSS: the node is "your process". Its own reads hit its MemTable right
//   away; another process reads storage only, so it sees rows after a flush.
//   No workers: you run the merge. Production: many tables, many nodes. The
//   Enterprise beat lights the same grid: query node routes clients, every
//   node owns its tables, workers merge and index in the back.
// ═══════════════════════════════════════════════════════════════════════════
export const OssEnterprise: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("ossEnt");
  const own = C("own", 270);
  const other = C("other", 360);
  const flushed = C("flushed", 470);
  const yourself = C("yourself", 640);
  const production = C("production", 900);
  const client = C("client", production + 150);
  const thats = C("thats", client + 120);
  const runs = C("runs#2", thats + 230); // "It runs shards across nodes" (the 1st "runs" is "runs inside your process")
  const serves = C("serves", runs + 100);
  const keeps = C("keeps", serves + 220);
  const many = ramp(f, production - 24, production + 6);
  const ent = ramp(f, thats - 8, thats + 20);
  const rig = rigKeys(f, [
    [0, { tilt: 0.66, y: -0.9, z: 0.6, x: -0.4, scale: 1.0 }],
    [production - 30, { tilt: 0.66, y: -0.9, z: 0.6, x: -0.4, scale: 1.0 }],
    [production + 20, { tilt: 0.66, y: -0.6, z: 0.4, x: 0, scale: 0.42 }],
    [keeps + 10, { tilt: 0.66, y: -0.6, z: 0.4, x: 0, scale: 0.42 }],
    [keeps + 60, { tilt: 0.7, y: -0.4, z: 0.6, x: -0.4, scale: 0.45 }],
  ]);
  const solo = 1 - many;
  const n = f < flushed ? Math.min(16, Math.floor(f / 12)) : Math.min(10, Math.max(0, Math.floor((f - flushed - 30) / 16)));
  const fl = ramp(f, flushed, flushed + 24, io);
  const ownB = ramp(f, own - 12, own + 4);
  const otherIn = ramp(f, other - 12, other + 6);
  const sees = f >= flushed + 24;
  const youMerge = ramp(f, yourself + 4, yourself + 40, io);
  const QP: V3 = [PADX(0, 1) + 2.4, NODE.c[1] + 1.4, NODE.c[2]];
  // production grid: 8 compact tables, each with a node over it
  const UX = (i: number) => -16.5 + (i % 4) * 11;
  const UZ = (i: number) => -4.5 + Math.floor(i / 4) * 8.0;
  const uIn = (i: number) => ramp(f, production + i * 4, production + i * 4 + 16, back(1.3)) * many;
  const unit = (i: number) => {
    const x = UX(i), z = UZ(i), v = uIn(i);
    const on = v > 0.3;
    return (
      <React.Fragment key={"u" + i}>
        <Plate k={k} p={[x, 0.02, z + 0.8]} w={on ? 6.6 : 0.001} d={on ? 3.4 : 0.001} h={0.02} m={k.m.plateHi} />
        <Outline k={k} p={[x, 0.04, z + 0.8]} w={6.9} d={3.7} m={ent > 0.5 ? k.m.rimHot : k.m.rim} o={on ? 1 : 0} />
        {Array.from({ length: 16 }).map((_, c) => {
          const s = slot(c, 8, 2, 0.6, 0.04);
          return <Cube key={"ub" + c} k={k} p={[x + s[0], s[1], z + 0.4 + s[2]]} s={on ? 0.3 : 0} />;
        })}
        <Plate k={k} p={[x, 2.4 * Math.min(1, v) + 0.01, z - 0.4]} w={on ? 5.0 : 0.001} d={on ? 2.0 : 0.001} h={0.3} m={k.m.plateHi} rim={on && ent > 0.5 ? 1 : 0} />
        {Array.from({ length: 24 }).map((_, c) => {
          const nn = 6 + ((Math.floor(f / 6) + i * 5) % 12);
          const j = c % 2;
          const s = stack(Math.floor(c / 2), 3, 0.3);
          return <Cube key={"uc" + c} k={k} p={[x + (j - 0.5) * 2.2 + s[0], 2.42 + s[1] - 0.15, z - 0.4 + s[2]]} s={on && Math.floor(c / 2) < nn / 2 ? 0.25 : 0} m={k.m.done} />;
        })}
      </React.Fragment>
    );
  };
  const clientsIn = ramp(f, client - 20, client) * many;
  const CL = (i: number): V3 => [-15 + i * 3.75, 0, 8.6];
  const gate: V3 = [0, 0, 5.4];
  return (
    <Scene3D
      name="Open source and Enterprise"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([NODE.c[0] - NODE.w / 2 - 0.2, NODE.c[1], NODE.c[2]])} o={solo} align="right" color={LANCE.offwhite}>your process · MemWAL</T>
          <T at={pr([QP[0], QP[1] + 0.3, QP[2]])} o={ownB * solo} dy={-20} color={LANCE.lavender}>sees its own writes · right away</T>
          <T at={pr([READER[0], 0, READER[2] + 0.4])} o={otherIn * solo} dy={18}>other process</T>
          <T at={pr([READER[0], 1.2, READER[2]])} o={otherIn * solo} dy={-22} color={sees ? LANCE.lavender : LANCE.dark300}>{sees ? "sees it once flushed" : "reads storage only"}</T>
          <T at={pr([sstPos(3)[0], 0.4, sstPos(3)[2]])} o={flash(f, flushed + 24, 60) * solo} dy={-20} size={20} color={LANCE.orange300}>flush</T>
          <T at={pr([CLIENTS[1][0], 1.2, CLIENTS[1][2]])} o={ramp(f, yourself - 20, yourself) * solo} dy={-22} size={22} color={LANCE.orange300}>you run merges + index updates</T>
          <T at={pr([CLIENTS[1][0], 0, CLIENTS[1][2] + 0.4])} o={ramp(f, yourself - 20, yourself) * solo} dy={18}>you</T>
          <T at={pr([0, 0, -12])} o={ramp(f, production + 10, production + 30) * (1 - ent)} dy={-10} size={30} color={LANCE.offwhite}>many tables · many shards · many machines</T>
          <T at={pr([0, 0, -12])} o={ent} dy={-10} size={32} color={LANCE.orange300}>realtime engine · LanceDB Enterprise</T>
          <T at={pr([gate[0], 0, gate[2] + 0.6])} o={ent} dy={20} size={22}>query node</T>
          <T at={pr([14, 0, -11])} o={ramp(f, keeps - 6, keeps + 10)} dy={26} size={22}>workers · merge + index</T>
          <T at={pr([0, 0, 10.2])} o={ramp(f, C("milliseconds", serves + 120) - 6, C("milliseconds", serves + 120) + 10)} dy={20} size={24}>newest rows · every client · milliseconds</T>
        </>
      )}
    >
      <World k={k} rimOn={0} memwal={1} show={solo > 0.02} />
      <NodeDeck k={k} s={solo} pads={1} rim={false} />
      <PadCubes k={k} j={0} pads={1} n={solo > 0.02 && !(f >= flushed && f < flushed + 24) ? n : 0} keyp="op" />
      {/* own reads: right away */}
      <Query k={k} p={QP} s={ownB * solo} />
      <Rod k={k} a={QP} b={[padPos(0, 1)[0] + 0.5, NODE.c[1] + 0.5, NODE.c[2]]} m={k.m.beamLav} t={ownB * solo} r={0.025} />
      {/* other process: storage only */}
      <Pillar k={k} p={READER} s={otherIn * solo} lit={sees ? 1 : 0} />
      <Rod k={k} a={[READER[0], 0.95, READER[2]]} b={[sstPos(3)[0] + 0.2, 0.1, sstPos(3)[2]]} m={sees ? k.m.beamLav : k.m.beamDim} t={otherIn * solo} r={0.025} />
      <Box k={k} p={hop([padPos(0, 1)[0], NODE.c[1] + 0.4, NODE.c[2]], sstPos(3), fl, 0.4)} s={solo > 0.02 && fl > 0 && fl < 1 ? [mix(1.0, 0.6, fl), mix(0.6, 0.06, fl), mix(1.0, 0.44, fl)] : 0} m={k.m.live} />
      <File k={k} p={sstPos(1)} w={solo > 0.02 && youMerge === 0 ? 0.6 : 0} d={0.44} />
      <File k={k} p={sstPos(2)} w={solo > 0.02 ? 0.6 : 0} d={0.44} />
      <File k={k} p={sstPos(3)} w={solo > 0.02 && f >= flushed + 24 ? 0.6 : 0} d={0.44} m={flash(f, flushed + 24, 30) > 0.3 ? k.m.live : k.m.paper} />
      {/* you run the merge */}
      <Pillar k={k} p={CLIENTS[1]} s={ramp(f, yourself - 20, yourself) * solo} lit={youMerge > 0 && youMerge < 1 ? 1 : 0} />
      <File k={k} p={hop(sstPos(1), [BASE.c[0] + 1.5, 0.3, BASE.c[2] + 0.6], youMerge, 1.4)} w={solo > 0.02 && youMerge > 0 && youMerge < 1 ? 0.6 : 0} d={0.44} m={k.m.live} />
      {/* production / Enterprise grid */}
      {Array.from({ length: 8 }).map((_, i) => unit(i))}
      <Plate k={k} p={[0, 0, 0]} w={many > 0.02 ? 46 : 0.001} d={many > 0.02 ? 20 : 0.001} h={0.14} />
      {Array.from({ length: 9 }).map((_, i) => {
        const p = CL(i);
        const u = (i * 3) % 8;
        const pulse = f >= serves ? flash(f, serves + ((i * 13) % 30) + Math.floor((f - serves - ((i * 13) % 30)) / 30) * 30, 14) : 0;
        return (
          <React.Fragment key={"cl" + i}>
            <Pillar k={k} p={p} s={clientsIn * 1.6} lit={pulse} />
            <Rod k={k} a={[p[0], 1.5, p[2]]} b={ent > 0.5 ? [gate[0], 1.0, gate[2]] : [UX(u), 2.4, UZ(u) + 0.6]} m={pulse > 0.2 ? k.m.beam : k.m.beamLav} t={clientsIn} r={0.04} />
          </React.Fragment>
        );
      })}
      <Pillar k={k} p={gate} h={0.9} s={ent * 1.6} lit={f >= serves ? (Math.floor(f / 8) % 2) : 0} />
      {Array.from({ length: 8 }).map((_, u) => (
        <Rod key={"gr" + u} k={k} a={[gate[0], 1.4, gate[2]]} b={[UX(u), 2.5, UZ(u) + 0.6]} m={k.m.beamLav} t={ent * ramp(f, runs - 10 + u * 3, runs + 10 + u * 3)} r={0.035} />
      ))}
      {[0, 1, 2].map((i) => {
        const wp: V3 = [10 + i * 4, 0, -11];
        const busy = f > keeps ? (Math.floor((f - keeps) / 20 + i) % 3 === 0 ? 1 : 0) : 0;
        return (
          <React.Fragment key={"wk" + i}>
            <Pillar k={k} p={wp} s={ent * 1.6} lit={busy} />
            <Rod k={k} a={[wp[0], 1.4, wp[2]]} b={[UX(3 + 4 * (i % 2)), 0.3, UZ(3 + 4 * (i % 2)) + 1.0]} m={k.m.beam} t={busy * ent} r={0.04} />
          </React.Fragment>
        );
      })}
    </Scene3D>
  );
};
