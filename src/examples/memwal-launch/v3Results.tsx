import React from "react";
import { interpolate } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { Scene3D, useKit, useF, ramp, back, io, mix, hop, flash, stack, slot, T } from "./rte3d";
import { rigKeys } from "./v3Why";
import {
  World, NodeDeck, PadCubes, TABLE, BASE, MEMWAL, NODE, CLIENTS, GATE, READER, FLOOR,
  basePos, walPos, padPos, padSlot, PADX, Box, Plate, Cube, File, Pillar, Rod, Outline, LANCE,
} from "./world";

type P = { enter?: SceneTransition; exit?: SceneTransition };
type V3 = [number, number, number];

// ═══════════════════════════════════════════════════════════════════════════
// Section 3 · Results — the engine set, re-dressed.
//   52 ms   id 42 written + acked; "another client" (right) looks it up by key;
//           a 0–100 ms track along the front of the floor stops at 52.
//   shards  the node's one MemTable splits into 4; each shard gets its OWN lane
//           of WAL files dropping in parallel (more shards = more WAL streams).
//   towers  1 cube = 4 MB/s: 1 shard 83, 4 shards 334 (blog, FineWeb-Edu).
//   servers four compact servers, each a node over its OWN table, each a
//           tower; they slide together → 946 MB/s. (A table never spans nodes.)
//   count   back on the main table: every acked row hops into its slot.
// ═══════════════════════════════════════════════════════════════════════════
const MBC = 4;
// the 0–100 ms track floats in the open space behind/above the node (more spacing)
const TRACK = { x0: -3.6, x1: 3.6, z: -2.6, y: NODE.c[1] + 2.0 };

export const Results: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("results");
  const another = C("another", 80);
  const n52 = C("52", 260);
  const split = C("split", 400);
  const one = C("one", 640);
  const n80 = C("80", 800);
  const four = C("four", 960);
  const n300 = C("300", 1170);
  const servers = C("servers", 1260);
  const n946 = C("946", 1400);
  const counted = C("counted", 1540);
  const confirmed = C("confirmed", 1720);

  const ph2 = ramp(f, servers - 30, servers - 4); //         four-servers view
  const ph3 = ramp(f, counted - 40, counted - 14); //        back to the main table
  const main = ph2 < 0.5 || ph3 > 0.5;
  const rig = rigKeys(f, [
    [0, { tilt: 0.64, y: -0.9, z: 0.6, x: -0.2, scale: 0.95 }],
    [n52 + 30, { tilt: 0.64, y: -0.9, z: 0.6, x: -0.2, scale: 0.95 }],
    [split + 20, { tilt: 0.62, y: -1.4, z: 0.6, x: -0.6, scale: 1.0 }],
    [servers - 30, { tilt: 0.62, y: -1.4, z: 0.6, x: -0.6, scale: 1.0 }],
    [servers + 10, { tilt: 0.6, y: -0.8, z: 0.4, x: 0, scale: 0.76 }],
    [counted - 40, { tilt: 0.6, y: -0.8, z: 0.4, x: 0, scale: 0.76 }],
    [counted - 10, { tilt: 0.7, y: -0.6, z: 0.6, x: 0.6, scale: 1.0 }],
  ]);
  // ── 52 ms
  const hA = another - 50;
  const h1 = ramp(f, hA, hA + 14, io), h2 = ramp(f, hA + 14, hA + 32, io);
  const pads = f >= split + 10 ? 4 : 1;
  const heroSlot = padSlot(0, 1, 6);
  const heroPos: V3 = h1 < 1 ? hop([CLIENTS[1][0], 1.0, CLIENTS[1][2]], [GATE[0], 0.9, GATE[2]], h1, 0.4) : h2 < 1 ? hop([GATE[0], 0.9, GATE[2]], [heroSlot[0], heroSlot[1] + 0.6, heroSlot[2]], h2, 1.2) : heroSlot;
  const ms = interpolate(f, [hA + 32, n52 + 2], [0, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (q) => 1 - Math.pow(1 - q, 2.2) });
  const mx = mix(TRACK.x0, TRACK.x1, ms / 100);
  const look = ramp(f, n52 - 14, n52 + 2);
  const trackOn = ramp(f, hA + 20, hA + 36) * (1 - ramp(f, split - 10, split + 10));
  // ── shards: four parallel WAL lanes
  const splitT = ramp(f, split, split + 24, io);
  const lanes = Array.from({ length: 48 }).map((_, i) => {
    const j = i % 4;
    const a = split + 30 + Math.floor(i / 4) * 16 + j * 3;
    const t = ramp(f, a, a + 14, io);
    const x = PADX(j, 4);
    const show = main && f >= a && f < servers - 30;
    return <File key={"ln" + i} k={k} p={t < 1 ? hop([x, NODE.c[1], NODE.c[2]], [x, MEMWAL.c[1], MEMWAL.c[2]], t, 0.1) : [x, MEMWAL.c[1] + Math.min(4, Math.floor(i / 4)) * 0.0, MEMWAL.c[2]]} w={show && t < 1 ? 0.3 : 0} d={0.26} m={k.m.paper} />;
  });
  // pad fills for the 4-shard phase
  const shardN = (j: number) => (pads === 4 ? Math.min(20, Math.max(0, Math.floor((f - split - 20 - j * 3) / 18))) : Math.min(8, Math.max(0, Math.floor((f - hA) / 10))));
  // ── towers on the floor, right of the table
  const A: V3 = [5.6, 0.02, -0.9], B: V3 = [7.2, 0.02, -0.9];
  const nA = Math.round(ramp(f, n80 - 60, n80 + 2, (q) => q) * Math.round(83 / MBC));
  const nB = Math.round(ramp(f, n300 - 80, n300 + 2, (q) => q) * Math.round(334 / MBC));
  const tower = (b: V3, n: number, max: number, key: string, show: boolean) =>
    Array.from({ length: max }).map((_, i) => {
      const s = stack(i, 3, 0.24);
      return <Cube key={key + i} k={k} p={[b[0] + s[0], b[1] + s[1] - 0.12, b[2] + s[2]]} s={show && i < n ? 0.2 : 0} m={i >= n - 3 ? k.m.live : k.m.done} />;
    });
  // ── four servers, each its own table + node + tower, sliding together
  const per = Math.round(946 / MBC / 4);
  const merge = ramp(f, n946 - 50, n946 + 4, io);
  const SX = (i: number) => -6.3 + i * 4.2;
  const sIn = (i: number) => ramp(f, servers - 10 + i * 6, servers + 12 + i * 6, back(1.3)) * (1 - ph3);
  const units = [0, 1, 2, 3].map((i) => (
    <React.Fragment key={"u" + i}>
      <Plate k={k} p={[SX(i), 0.02, 0.4]} w={sIn(i) > 0.01 ? 3.6 : 0.001} d={sIn(i) > 0.01 ? 2.6 : 0.001} h={0.02} m={k.m.plateHi} />
      <Outline k={k} p={[SX(i), 0.04, 0.4]} w={3.7} d={2.7} m={k.m.rimHot} o={sIn(i) > 0.5 ? 1 - merge : 0} />
      <Plate k={k} p={[SX(i), 1.6 * Math.min(1, sIn(i)) + 0.01, -0.3]} w={sIn(i) > 0.01 ? 2.6 * (1 - merge) + 0.01 : 0.001} d={sIn(i) > 0.01 ? 1.2 : 0.001} h={0.2} m={k.m.plateHi} rim={sIn(i) > 0.5 && merge < 0.5 ? 1 : 0} />
    </React.Fragment>
  ));
  const p2 = [] as React.ReactNode[];
  for (let i = 0; i < 4; i++)
    for (let c = 0; c < per; c++) {
      const s = stack(c, 3, 0.24);
      const home: V3 = [SX(i) + s[0], 0.02 + s[1] - 0.12, 0.9 + s[2]];
      const g = i * per + c;
      const m = stack(g, 6, 0.24);
      const dst: V3 = [m[0], 0.02 + m[1] - 0.12, 0.6 + m[2]];
      const t = Math.min(1, Math.max(0, merge * 1.4 - (c / per) * 0.4));
      p2.push(<Cube key={`s${i}-${c}`} k={k} p={hop(home, dst, t, 0.5)} s={sIn(i) > 0.3 ? 0.2 : 0} m={merge > 0.95 && g >= 4 * per - 6 ? k.m.live : k.m.done} />);
    }
  // ── count: every acked write hops into the table
  const at = (i: number) => counted - 10 + i * 3.4;
  const done = ramp(f, Math.max(confirmed, at(47) + 18), Math.max(confirmed, at(47) + 18) + 16);
  const ACK = (i: number): V3 => {
    const s = slot(i, 6, 8, 0.36, 0.02);
    return [-5.2 + s[0], s[1], 0.2 + s[2]];
  };
  const countCubes = Array.from({ length: 48 }).map((_, i) => {
    const t = ramp(f, at(i), at(i) + 18, io);
    return <Cube key={"cc" + i} k={k} p={t <= 0 ? ACK(i) : t < 1 ? hop(ACK(i), basePos(i), t, 1.2) : basePos(i)} s={ph3 > 0.5 ? 0.24 : 0} m={t > 0 && t < 1 ? k.m.live : k.m.done} />;
  });
  return (
    <Scene3D
      name="Results"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          {main ? (
            <>
              <T at={pr([READER[0], 0, READER[2] + 0.4])} o={(1 - ph3) * ramp(f, another - 30, another - 10) * (1 - ramp(f, split - 10, split + 10))} dy={18}>another client</T>
              <T at={pr([heroPos[0] - 0.9, heroPos[1], heroPos[2]])} o={trackOn} align="right" size={22} color={LANCE.orange300}>id 42</T>
              <T at={pr([READER[0], 1.2, READER[2]])} o={look * trackOn} dy={-22} size={22} color={LANCE.lavender}>get id 42</T>
              {[0, 25, 50, 75, 100].map((t) => (
                <T key={t} at={pr([mix(TRACK.x0, TRACK.x1, t / 100), TRACK.y, TRACK.z])} o={trackOn} dy={18} size={18}>{`${t}`}</T>
              ))}
              <T at={pr([mx, TRACK.y + 0.3, TRACK.z])} o={trackOn} dy={-40} size={ms >= 51.5 ? 60 : 44} color={LANCE.orange300}>{`${Math.round(ms)} ms`}</T>
              <T at={pr([TRACK.x1 + 0.4, TRACK.y, TRACK.z])} o={ramp(f, n52 + 6, n52 + 20) * trackOn} align="left" size={20}>median · write → read by key</T>
              {[0, 1, 2, 3].map((j) => (
                <T key={j} at={pr([PADX(j, 4), NODE.c[1], NODE.c[2] + 0.75])} o={splitT * (1 - ph2)} dy={12} size={18}>{`shard ${j + 1}`}</T>
              ))}
              <T at={pr([MEMWAL.c[0] - MEMWAL.w / 2 - 0.2, 0.05, MEMWAL.c[2]])} o={splitT * (1 - ph2)} align="right" size={20} color={LANCE.dark100}>4 WAL streams · in parallel</T>
              <T at={pr([A[0], 0, A[2] + 0.55])} o={ramp(f, one - 10, one + 6) * (1 - ph2)} dy={16} size={20}>1 shard</T>
              <T at={pr([B[0], 0, B[2] + 0.55])} o={ramp(f, four - 10, four + 6) * (1 - ph2)} dy={16} size={20}>4 shards</T>
              <T at={pr([A[0], 0.12 + Math.ceil(nA / 9) * 0.24, A[2]])} o={nA > 0 && ph2 < 0.5 ? 1 : 0} dy={-22} size={28} color={LANCE.orange300}>{`${Math.round((nA * 83) / Math.round(83 / MBC))} MB/s`}</T>
              <T at={pr([B[0], 0.12 + Math.ceil(nB / 9) * 0.24, B[2]])} o={nB > 0 && ph2 < 0.5 ? 1 : 0} dy={-22} size={28} color={LANCE.orange300}>{`${Math.round((nB * 334) / Math.round(334 / MBC))} MB/s`}</T>
              <T at={pr([6.4, 0, 0.4])} o={ramp(f, one - 10, one + 6) * (1 - ph2)} dy={16} size={16}>one server · acked, durable in S3</T>
              <T at={pr([-5.2, 0, 1.8])} o={ph3} dy={18}>writes acknowledged</T>
              <T at={pr([TABLE.c[0], 0.05, TABLE.c[2] + TABLE.d / 2 + 0.25])} o={ph3} dy={14} color={LANCE.offwhite}>rows in the table</T>
              <T at={pr([BASE.c[0], 0.6, BASE.c[2] - 1.2])} o={done} dy={-20} size={28} color={LANCE.orange300}>every one there</T>
            </>
          ) : (
            <>
              {[0, 1, 2, 3].map((i) => (
                <T key={i} at={pr([SX(i), 1.6, -0.3])} o={sIn(i) * (1 - merge)} dy={-22} size={20} color={LANCE.offwhite}>{`server ${i + 1}`}</T>
              ))}
              {[0, 1, 2, 3].map((i) => (
                <T key={"t" + i} at={pr([SX(i), 0.02, 1.75])} o={sIn(i) * (1 - merge)} dy={14} size={16}>{`its own table`}</T>
              ))}
              <T at={pr([0, 0.02 + Math.ceil((4 * per) / 36) * 0.24 + 1.1, 0.6])} o={ramp(f, n946 - 6, n946 + 10)} dy={-30} size={52} color={LANCE.orange300}>946 MB/s</T>
            </>
          )}
        </>
      )}
    >
      <World k={k} rimOn={1} memwal={1} baseN={ph3 > 0.5 ? 0 : 40} show={main} />
      <NodeDeck k={k} s={main ? 1 : 0} pads={pads} />
      {[0, 1, 2, 3].map((j) => (
        <PadCubes key={"pc" + j} k={k} j={j} pads={pads} n={main && j < pads && ph3 < 0.5 ? shardN(j) : 0} keyp={"pc" + j} />
      ))}
      <Pillar k={k} p={GATE} h={0.6} s={main ? 1 : 0} />
      <Pillar k={k} p={CLIENTS[1]} s={main && ph3 < 0.5 ? 1 : 0} lit={flash(f, hA + 60, 20)} />
      <Pillar k={k} p={READER} s={main ? (1 - ph3) * ramp(f, another - 30, another - 10) * (1 - ramp(f, split - 10, split + 10)) : 0} lit={flash(f, n52 + 2, 40)} />
      <Cube k={k} p={heroPos} s={trackOn > 0.01 && f >= hA ? 0.24 : 0} m={look > 0 ? k.m.live : k.m.done} />
      <File k={k} p={hop([heroSlot[0], NODE.c[1], heroSlot[2]], walPos(4), ramp(f, hA + 32, hA + 46, io))} w={trackOn > 0.01 && f >= hA + 32 ? 0.38 : 0} d={0.32} m={k.m.live} />
      <Rod k={k} a={[READER[0], 0.95, READER[2]]} b={[heroSlot[0] + 0.15, heroSlot[1] + 0.1, heroSlot[2]]} m={k.m.beamLav} t={look * trackOn} r={0.03} />
      {/* the 0–100 ms track along the front of the floor */}
      <Box k={k} p={[0, TRACK.y, TRACK.z]} s={trackOn > 0.01 ? [TRACK.x1 - TRACK.x0, 0.06, 0.12] : 0} m={k.m.dim} />
      <Box k={k} p={[(TRACK.x0 + mx) / 2, TRACK.y + 0.01, TRACK.z]} s={trackOn > 0.01 ? [Math.max(0.001, mx - TRACK.x0), 0.08, 0.14] : 0} m={k.m.done} />
      {[0, 25, 50, 75, 100].map((t) => <Box key={"tk" + t} k={k} p={[mix(TRACK.x0, TRACK.x1, t / 100), TRACK.y, TRACK.z]} s={trackOn > 0.01 ? [0.04, 0.22, 0.04] : 0} m={k.m.idle} />)}
      <Box k={k} p={[mx, TRACK.y, TRACK.z]} s={trackOn > 0.01 ? 0.26 : 0} m={k.m.live} />
      {lanes}
      {tower(A, nA, Math.round(83 / MBC), "a", main && ph3 < 0.5)}
      {tower(B, nB, Math.round(334 / MBC), "b", main && ph3 < 0.5)}
      {units}
      {p2}
      {countCubes}
    </Scene3D>
  );
};
