import React from "react";
import { interpolate } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import {
  Scene3D, useKit, useF, rigPath, ramp, back, io, mix, hop, flash, slot, stack, rand, clamp,
  Box, Plate, Cube, File, Pillar, Query, Rod, Outline, T, LANCE, V3,
} from "./rte3d";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// Latency — "In our tests on AWS, the median time before another client could
// look up a just-written row was just 52 milliseconds!"
//   Freshness, not a read benchmark (Jack): a write lands, another client
//   looks it up by key. A marker runs along a 0–100 ms track and stops at 52.
// ═══════════════════════════════════════════════════════════════════════════
export const Latency: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("latency");
  const write = C("written", 200) - 40;
  const n52 = C("52", 266);
  const rig = rigPath(f, [
    [0, { tilt: 0.6, y: -0.3, z: 0.8 }],
    [n52 + 40, { tilt: 0.7, y: 0.1, z: 1.6 }],
  ]);
  const W: V3 = [-4.6, 0, -0.6], R: V3 = [4.6, 0, -0.6], TB: V3 = [0, 0.06, -0.6];
  const cIn = ramp(f, C("another", 80) - 30, C("another", 80) - 10);
  const wt = ramp(f, write, write + 18, io);
  const ms = interpolate(f, [write + 18, n52 + 2], [0, 52], { ...clamp, easing: (q) => 1 - Math.pow(1 - q, 2.2) });
  const TX0 = -4.2, TX1 = 4.2, TZ = 1.7;
  const mx = mix(TX0, TX1, ms / 100);
  const look = ramp(f, n52 - 12, n52 + 2);
  const done = flash(f, n52 + 2, 50);
  const KEY: V3 = [0, 0.06, -0.6];
  return (
    <Scene3D
      name="52 ms"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([W[0], 0, W[2] + 0.4])} o={cIn} dy={20}>writer</T>
          <T at={pr([R[0], 0, R[2] + 0.4])} o={cIn} dy={20}>another client</T>
          <T at={pr([KEY[0], 0.5, KEY[2]])} o={wt >= 1 ? 1 : 0} dy={-16} size={20} color={LANCE.offwhite}>id 42</T>
          {[0, 25, 50, 75, 100].map((t) => (
            <T key={t} at={pr([mix(TX0, TX1, t / 100), 0, TZ + 0.25])} dy={18} size={18}>{`${t}`}</T>
          ))}
          <T at={pr([mx, 0.4, TZ])} o={wt >= 1 ? 1 : 0} dy={-40} size={ms >= 51.5 ? 56 : 40} color={LANCE.orange300}>{`${Math.round(ms)} ms`}</T>
          <T at={pr([mx, 0.4, TZ])} o={ramp(f, n52 + 6, n52 + 20)} dy={-86} size={20}>median · write → read by key</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={12.5} d={5.2} />
      <Plate k={k} p={TB} w={3.0} d={1.6} h={0.06} m={k.m.plateHi} />
      {Array.from({ length: 14 }).map((_, i) => {
        const p = slot(i + 1, 5, 3, 0.42, 0.06);
        return <Cube key={i} k={k} p={[TB[0] + p[0], p[1], TB[2] + p[2]]} s={0.22} />;
      })}
      <Cube k={k} p={wt < 1 ? hop([W[0], 1.0, W[2]], KEY, wt, 1.2) : KEY} s={wt > 0 ? 0.26 : 0.001} m={done > 0.3 || look > 0 ? k.m.live : k.m.done} />
      <Pillar k={k} p={W} s={cIn} />
      <Pillar k={k} p={R} s={cIn} lit={done} />
      <Rod k={k} a={[R[0], 0.95, R[2]]} b={[KEY[0] + 0.15, 0.3, KEY[2]]} m={k.m.beamLav} t={look} r={0.03} />
      {/* the track: 0 → 100 ms */}
      <Box k={k} p={[0, 0.02, TZ]} s={[TX1 - TX0, 0.04, 0.12]} m={k.m.dim} />
      <Box k={k} p={[(TX0 + mx) / 2, 0.04, TZ]} s={[Math.max(0.001, mx - TX0), 0.05, 0.13]} m={k.m.done} />
      {[0, 25, 50, 75, 100].map((t) => <Box key={t} k={k} p={[mix(TX0, TX1, t / 100), 0.05, TZ]} s={[0.04, 0.1, 0.3]} m={k.m.idle} />)}
      <Cube k={k} p={[mx, 0.04, TZ]} s={wt >= 1 ? 0.3 : 0.001} m={k.m.live} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Throughput — "The engine can also split a table into shards that can be
// written to in parallel. On one server, a table with one shard handled about
// 80 megabytes of writes per second. With four shards, it handled over 300.
// Four servers, each with its own table, handled 946 megabytes per second
// together."
//   Towers of cubes, one cube = 4 MB/s (blog numbers, FineWeb-Edu):
//   1 shard 83 → 21 cubes, 4 shards 334 → 84, four servers 946 → 237.
// ═══════════════════════════════════════════════════════════════════════════
const MBC = 4;
export const Throughput: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("throughput");
  const split = C("split", 105);
  const one = C("one", 345);
  const n80 = C("80", 509);
  const four = C("four", 667);
  const n300 = C("300", 878);
  const servers = C("servers", 966);
  const n946 = C("946", 1103);
  const rig = rigPath(f, [
    [0, { tilt: 0.62, y: -0.4, z: 0.6 }],
    [servers - 40, { tilt: 0.62, y: -0.4, z: 0.6 }],
    [servers + 10, { tilt: 0.55, y: -1.0, z: 0.2, x: 0 }],
  ]);
  const ph2 = ramp(f, servers - 40, servers - 10);
  const splitT = ramp(f, split, split + 36, io);
  const SH = (i: number): V3 => [mix(-3.2, -4.6 + i * 0.95, splitT), 0.06, -1.0];
  // phase 1 towers
  const A: V3 = [0.6, 0.06, 0.6], B: V3 = [3.4, 0.06, 0.6];
  const nA = Math.round(ramp(f, n80 - 60, n80 + 2, (q) => q) * Math.round(83 / MBC));
  const nB = Math.round(ramp(f, n300 - 80, n300 + 2, (q) => q) * Math.round(334 / MBC));
  const tower = (base: V3, n: number, max: number, key: string, show: boolean, m = k.m.done) =>
    Array.from({ length: max }).map((_, i) => {
      const s = stack(i, 3, 0.24);
      return <Cube key={key + i} k={k} p={[base[0] + s[0], base[1] + s[1] - 0.12, base[2] + s[2]]} s={show && i < n ? 0.2 : 0} m={i >= n - 3 ? k.m.live : m} />;
    });
  // phase 2: four servers, each its own table and tower, sliding together
  const per = Math.round(946 / MBC / 4);
  const merge = ramp(f, n946 - 50, n946 + 4, io);
  const SV = (i: number): V3 => [-4.5 + i * 3.0, 0.3, -0.4];
  const sIn = (i: number) => ramp(f, servers - 10 + i * 6, servers + 12 + i * 6, back(1.4));
  const p2: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++)
      for (let c = 0; c < per; c++) {
        const s = stack(c, 3, 0.24);
        const home: V3 = [SV(i)[0] + s[0], SV(i)[1] + s[1] - 0.12, SV(i)[2] + s[2]];
        // merged block: 6×6 footprint, server i fills its own quadrant column
        const g = i * per + c;
        const ms = stack(g, 6, 0.24);
        const dst: V3 = [ms[0], 0.06 + ms[1] - 0.12, -0.4 + ms[2]];
        const t = Math.min(1, Math.max(0, merge * 1.4 - (c / per) * 0.4));
        p2.push(<Cube key={`s${i}-${c}`} k={k} p={hop(home, dst, t, 0.5)} s={ph2 > 0.01 ? 0.2 * Math.min(1, sIn(i)) : 0} m={merge > 0.95 && g >= 4 * per - 6 ? k.m.live : k.m.done} />);
      }
  return (
    <Scene3D
      name="Throughput with shards and nodes"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          {ph2 < 0.5 ? (
            <>
              <T at={pr([-3.2, 0.06, -0.1])} dy={22} color={LANCE.offwhite}>{splitT > 0.5 ? "4 shards · written in parallel" : "table"}</T>
              <T at={pr([A[0], 0, A[2] + 0.55])} o={ramp(f, one - 10, one + 6)} dy={18}>1 shard</T>
              <T at={pr([B[0], 0, B[2] + 0.55])} o={ramp(f, four - 10, four + 6)} dy={18}>4 shards</T>
              <T at={pr([A[0], 0.12 + Math.ceil(nA / 9) * 0.24, A[2]])} o={nA > 0 ? 1 : 0} dy={-22} size={30} color={LANCE.orange300}>{`${Math.round((nA * MBC * 83) / (Math.round(83 / MBC) * MBC))} MB/s`}</T>
              <T at={pr([B[0], 0.12 + Math.ceil(nB / 9) * 0.24, B[2]])} o={nB > 0 ? 1 : 0} dy={-22} size={30} color={LANCE.orange300}>{`${Math.round((nB * MBC * 334) / (Math.round(334 / MBC) * MBC))} MB/s`}</T>
              <T at={pr([2.0, 0, 2.2])} o={ramp(f, one - 10, one + 6)} dy={14} size={18}>one server · acknowledged, durable in S3</T>
            </>
          ) : (
            <>
              {[0, 1, 2, 3].map((i) => (
                <T key={i} at={pr([SV(i)[0], 0.3, SV(i)[2] + 0.9])} o={sIn(i) * (1 - merge)} dy={18}>{`server ${i + 1}`}</T>
              ))}
              <T at={pr([0, 0.06 + Math.ceil((4 * per) / 36) * 0.24 + 0.2, -0.4])} o={ramp(f, n946 - 6, n946 + 10)} dy={-24} size={46} color={LANCE.orange300}>946 MB/s</T>
              <T at={pr([0, 0, 1.2])} o={ramp(f, n946, n946 + 16)} dy={20}>together</T>
            </>
          )}
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={13} d={5.4} />
      {[0, 1, 2, 3].map((i) => (
        <Plate key={"sh" + i} k={k} p={SH(i)} w={ph2 >= 0.99 ? 0.001 : splitT > 0.5 ? 0.8 : 2.8} d={ph2 >= 0.99 ? 0.001 : 1.4} h={0.06} m={k.m.plateHi} rim={ph2 < 0.99 && splitT > 0.5 ? 1 : 0} />
      ))}
      {Array.from({ length: 48 }).map((_, j) => {
        const i = j % 4;
        const a = split + 40 + Math.floor(j / 4) * 9 + i * 2;
        const t = ramp(f, a, a + 14, (q) => q * q);
        return <Cube key={"rain" + j} k={k} p={[SH(i)[0], mix(3.2, 0.1, t), SH(i)[2]]} s={ph2 < 0.99 && splitT >= 1 && t > 0 && t < 1 ? 0.18 : 0} m={k.m.done} />;
      })}
      {tower(A, nA, Math.round(83 / MBC), "a", ph2 < 0.99)}
      {tower(B, nB, Math.round(334 / MBC), "b", ph2 < 0.99)}
      {[0, 1, 2, 3].map((i) => (
        <Plate key={"sv" + i} k={k} p={[SV(i)[0], 0.3 * Math.min(1, sIn(i)) + 0.01, SV(i)[2]]} w={1.4 * (1 - merge) + 0.01} d={1.4 * (1 - merge) + 0.01} h={Math.max(0.01, 0.3 * Math.min(1, sIn(i)) * (1 - merge))} m={k.m.plateHi} rim={ph2 > 0.5 && merge < 0.5 ? 1 : 0} />
      ))}
      {p2}
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Count — "After every test, we counted the rows in the table. Every write the
// engine confirmed was there."
// ═══════════════════════════════════════════════════════════════════════════
export const Count: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("count");
  const counted = C("counted", 112);
  const confirmed = C("confirmed", 295);
  const rig = rigPath(f, [
    [0, { tilt: 0.7, y: -0.1, z: 1.0 }],
    [confirmed + 40, { tilt: 0.78, y: 0.2, z: 1.4 }],
  ]);
  const COLS = 8, ROWS = 5, PITCH = 0.42, N = COLS * ROWS;
  const L: V3 = [-3.0, 0.06, 0], Rt: V3 = [3.0, 0.06, 0];
  const at = (i: number) => counted - 16 + i * 3.4;
  const all = f >= at(N - 1) + 18;
  const done = ramp(f, Math.max(confirmed, at(N - 1) + 18), Math.max(confirmed, at(N - 1) + 18) + 16);
  return (
    <Scene3D
      name="Every confirmed write was there"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([L[0], 0.06, 1.35])} dy={22} color={LANCE.offwhite}>writes confirmed</T>
          <T at={pr([Rt[0], 0.06, 1.35])} dy={22} color={LANCE.offwhite}>rows in the table</T>
          <T at={pr([Rt[0], 0.6, -1.3])} o={done} dy={-20} size={28} color={LANCE.orange300}>none missing</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={12.5} d={4.8} />
      <Plate k={k} p={L} w={COLS * PITCH + 0.4} d={ROWS * PITCH + 0.4} h={0.06} m={k.m.plateHi} />
      <Plate k={k} p={Rt} w={COLS * PITCH + 0.4} d={ROWS * PITCH + 0.4} h={0.06} m={k.m.plateHi} rim={all ? done : 0} />
      {Array.from({ length: N }).map((_, i) => {
        const s = slot(i, COLS, ROWS, PITCH, 0.06);
        return <Box key={"slot" + i} k={k} p={[Rt[0] + s[0], 0.075, Rt[2] + s[2]]} s={[0.28, 0.02, 0.28]} m={k.m.ghost} />;
      })}
      {Array.from({ length: N }).map((_, i) => {
        const s = slot(i, COLS, ROWS, PITCH, 0.06);
        const src: V3 = [L[0] + s[0], s[1], L[2] + s[2]];
        const dst: V3 = [Rt[0] + s[0], s[1], Rt[2] + s[2]];
        const t = ramp(f, at(i), at(i) + 18, io);
        return <Cube key={"c" + i} k={k} p={t > 0 && t < 1 ? hop(src, dst, t, 1.1) : t >= 1 ? dst : src} s={0.24} m={t > 0 && t < 1 ? k.m.live : k.m.done} />;
      })}
    </Scene3D>
  );
};
