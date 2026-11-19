import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { Scene3D, useKit, useF, ramp, back, io, mix, hop, flash, slot, rand, T, Bin } from "./rte3d";
import { Rig } from "./diagramKit";
import { interpolate } from "remotion";
import { FLOOR, TABLE, CLIENTS, READER, Box, Plate, Cube, File, Pillar, Query, Rod, Outline, LANCE } from "./world";

type P = { enter?: SceneTransition; exit?: SceneTransition };
type V3 = [number, number, number];

/** camera keys that tolerate missing cues (B starts mid-section): drop negatives, keep increasing */
export const rigKeys = (f: number, keys: [number, Partial<Rig>][]): Rig => {
  const def: Rig = { tilt: 0.6, yaw: 0, y: 0, z: 0, x: 0, scale: 1.12 };
  const ks = keys.filter((q) => q[0] >= 0).sort((a, b) => a[0] - b[0]);
  const clean: [number, Partial<Rig>][] = [];
  for (const q of ks) if (!clean.length || q[0] > clean[clean.length - 1][0]) clean.push(q);
  if (!clean.length) clean.push([0, keys[keys.length - 1][1]]);
  const out: any = {};
  for (const key of ["tilt", "yaw", "y", "z", "x", "scale"] as const) {
    const fs = clean.map((q) => q[0]);
    const vs = clean.map((q) => (q[1][key] ?? (def as any)[key]) as number);
    out[key] = clean.length === 1 ? vs[0] : interpolate(f, fs, vs, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
  }
  return out as Rig;
};

// ═══════════════════════════════════════════════════════════════════════════
// Section 1 · WhyHard — one lakehouse set, one camera (A from "store huge…",
// B from "Lakehouse formats make a change visible…") through "…slow scans."
//
//   the table is a stack of committed versions on object storage
//   committing → a slab seals new rows in; the reader sees up to the top slab
//   hourly → one fat slab; every ms → a slab per few rows + a metadata heap
//   writers fight → two slabs thrown at v(n+1), one bounces
//   batching → rows wait in a bin ABOVE the stack (memory); heap sinks; one
//              fat commit; the reader's beam stops at the stack, waiting
//   streaming service → its own platform OUTSIDE the table outline; rows go
//              there; copied in later; coral "only copy" outline
//   index lag → lavender index layer covers the old rows only; the search
//              misses the new ones; a slow scan sweeps everything
// ═══════════════════════════════════════════════════════════════════════════
const ST = { c: [0.6, 0, 0.1] as V3, w: 3.6, d: 2.5, h: 0.1 };
const RD: V3 = [5.4, 0, 1.3]; // this section's reader, inside the frame
const slabY = (i: number) => 0.02 + i * (ST.h + 0.025);
const TOP = { cols: 8, rows: 5, pitch: 0.42 };
const SVC: V3 = [-4.2, 0.55, -1.2];
const HEAP: V3 = [4.4, 0, 1.0];

export const WhyHard: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("whyHard");
  const visible = C("visible", 60);
  const c1 = C("committing", visible + 40);
  const hourly = C("hourly", c1 + 200);
  const ms = C("millisecond", hourly + 160);
  const piles = C("piles", ms + 180);
  const writers = C("writers", piles + 80);
  const fight = C("fight", writers + 18);
  const batching = C("batching", fight + 120);
  const commits = C("commits", batching + 100);
  const fixes = C("fixes", commits + 30);
  const readers = C("readers", fixes + 120);
  const seconds = C("seconds", readers + 40);
  const minutes = C("minutes", seconds + 30);
  const another = C("another", minutes + 120);
  const streaming = C("streaming", another + 100);
  const holds = C("holds", streaming + 140);
  const copies = C("copies", holds + 140);
  const only = C("only", copies + 230);
  const separate = C("separate", only + 150);
  const even = C("even", separate + 100);
  const indexes = C("indexes", even + 150);
  const job = C("job", indexes + 200);
  const searches = C("searches", job + 100);
  const miss = C("miss", searches + 40);
  const slow = C("slow", miss + 120);

  const rig = rigKeys(f, [
    [0, { tilt: 0.52, y: -0.7, z: 0.4 }],
    [visible - 10, { tilt: 0.52, y: -0.7, z: 0.4 }],
    [visible + 30, { tilt: 0.55, y: -0.9, z: 1.5, x: 0.2 }],
    [ms - 10, { tilt: 0.55, y: -0.9, z: 1.5, x: 0.2 }],
    [ms + 40, { tilt: 0.5, y: -1.1, z: 0.6, x: -0.2 }],
    [writers - 10, { tilt: 0.5, y: -1.1, z: 0.6, x: -0.2 }],
    [writers + 30, { tilt: 0.42, y: -1.6, z: 0.4, x: 0.2 }],
    [batching - 10, { tilt: 0.42, y: -1.6, z: 0.4, x: 0.2 }],
    [batching + 30, { tilt: 0.48, y: -1.7, z: 1.0, x: -0.4 }],
    [another - 10, { tilt: 0.48, y: -1.7, z: 1.0, x: -0.4 }],
    [another + 40, { tilt: 0.55, y: -1.2, z: 0.6, x: 2.2 }],
    [even - 10, { tilt: 0.55, y: -1.2, z: 0.6, x: 2.2 }],
    [even + 40, { tilt: 0.82, y: -0.4, z: 2.6, x: -0.5 }],
  ]);

  // ── versions: when each slab was committed
  const borns: number[] = [-999, -999, -999, c1, hourly + 60];
  for (let i = 0; i < 8; i++) borns.push(ms + 12 + i * 13);
  borns.push(commits);
  const count = borns.filter((b) => f >= b).length;
  const fastNow = f >= ms ? Math.floor((Math.min(f, fight + 10) - ms) / 3) : 0;
  const ver = 3 + (f >= c1 ? 1 : 0) + (f >= hourly + 60 ? 1 : 0) + fastNow + (f >= commits ? 1 : 0);
  const topY = slabY(count);
  const slabs = borns.map((b, i) => {
    const t = ramp(f, b, b + 14, io);
    const lit = flash(f, b + 14, 22);
    return <Box key={"s" + i} k={k} p={[ST.c[0], slabY(i) + ST.h / 2 + (1 - t) * 1.6, ST.c[2]]} s={f >= b ? [ST.w, ST.h, ST.d] : 0} m={lit > 0.3 ? k.m.live : i >= 3 ? k.m.done : k.m.dim} />;
  });
  // rows on top of the stack (the table's current rows)
  const topRows = Array.from({ length: TOP.cols * TOP.rows }).map((_, i) => {
    const p = slot(i, TOP.cols, TOP.rows, TOP.pitch, topY);
    const front = Math.floor(i / TOP.cols) === TOP.rows - 1;
    const copied = f >= copies + 40 && front;
    const indexed = f >= indexes;
    const missed = front && f >= miss + 6 && f < slow;
    const scanZ = mix(-1.2, 1.2, ramp(f, slow, slow + 110, (q) => q));
    const scanned = f >= slow && p[2] < scanZ + 0.2;
    const m = scanned ? (front ? k.m.live : k.m.paper) : missed ? k.m.ghost : copied ? k.m.done : k.m.idle;
    return <Cube key={"t" + i} k={k} p={[ST.c[0] + p[0], p[1], ST.c[2] + p[2]]} s={f >= copies + 40 || !front || f < another ? 0.22 : 0} m={indexed || copied ? m : k.m.idle} />;
  });

  // ── commit #1: four rows hop from the writer, then the slab seals them
  const W: V3 = CLIENTS[1];
  const early = Array.from({ length: 4 }).map((_, i) => {
    const a = c1 - 40 + i * 6;
    const t = ramp(f, a, a + 18, io);
    return <Cube key={"e" + i} k={k} p={hop([W[0], 1.0, W[2]], [ST.c[0] - 0.6 + i * 0.4, slabY(3) + 0.3, ST.c[2]], t, 1.0)} s={f >= a && f < c1 + 4 ? 0.2 : 0} m={k.m.done} />;
  });
  // ── hourly: one fat batch
  const hb = ramp(f, hourly, hourly + 60, io);
  // ── every ms: rows raining from the writer onto the stack
  const rain = Array.from({ length: 90 }).map((_, i) => {
    const a = ms + i * 2.4;
    const t = ramp(f, a, a + 16, io);
    const live = f >= a && t < 1 && f < fight + 20;
    return <Cube key={"r" + i} k={k} p={hop([W[0], 1.0, W[2] + (rand(i) - 0.5)], [ST.c[0] + (rand(i + 3) - 0.5) * 2.6, topY + 0.3, ST.c[2] + (rand(i + 7) - 0.5) * 1.6], t, 0.8)} s={live ? 0.16 : 0} m={k.m.done} />;
  });
  // ── metadata heap
  const heapN = f < piles - 40 ? 0 : Math.min(200, Math.floor((f - (piles - 40)) * 1.8));
  const sink = ramp(f, fixes - 4, fixes + 40, io);
  const heap = Array.from({ length: 200 }).map((_, i) => {
    const a = rand(i) * Math.PI * 2, r = Math.sqrt(rand(i + 7)) * 1.3;
    const layer = Math.floor(i / 24);
    return <File key={"m" + i} k={k} p={[HEAP[0] + Math.cos(a) * r * (1 - layer * 0.07), layer * 0.07 - sink * 0.8, HEAP[2] + Math.sin(a) * r * 0.6]} w={i < heapN && sink < 1 ? 0.34 : 0} d={0.25} />;
  });
  // ── writers fight over v(n+1)
  const wIn = ramp(f, writers - 10, writers + 10) * (1 - ramp(f, batching - 10, batching + 10));
  const W1 = CLIENTS[0], W2 = CLIENTS[2];
  const tgt: V3 = [ST.c[0], topY + 0.35, ST.c[2]];
  const flyT = ramp(f, fight - 24, fight, io);
  const bounce = ramp(f, fight, fight + 34);
  const p1 = hop([W1[0], 1.0, W1[2]], tgt, flyT, 1.6);
  const p2: V3 = flyT < 1 ? hop([W2[0], 1.0, W2[2]], tgt, flyT, 1.6) : [mix(tgt[0], -1.4, bounce), tgt[1] + Math.sin(bounce * Math.PI) * 1.0 - bounce * 1.6, mix(tgt[2], 2.4, bounce)];
  // ── batching: rows wait in a bin above the stack, then drop as one commit
  const binIn = ramp(f, batching - 10, batching + 14, back(1.3)) * (1 - ramp(f, another + 20, another + 40));
  const BIN: V3 = [ST.c[0], topY + 1.15, ST.c[2]];
  const PER = 36;
  const binRows = (t: number) => Math.min(PER, Math.max(0, Math.floor((t - batching) / 5)));
  const inBin = f < commits ? binRows(f) : Math.min(PER, Math.max(0, Math.floor((f - commits - 20) / 6)));
  const dropT = ramp(f, commits, commits + 18, io);
  const binCubes = Array.from({ length: PER }).map((_, i) => {
    const s = slot(i % 16, 4, 4, 0.26, 0);
    const layer = Math.floor(i / 16);
    return <Cube key={"b" + i} k={k} p={[BIN[0] + s[0], BIN[1] + layer * 0.26, BIN[2] + s[2]]} s={binIn > 0.5 && i < inBin && !(dropT > 0 && dropT < 1) ? 0.2 : 0} m={k.m.done} />;
  });
  // ── reader
  const rIn = ramp(f, visible - 20, visible);
  const beamTop: V3 = [ST.c[0] + 1.2, topY + 0.25, ST.c[2]];
  const wait = ramp(f, seconds - 6, minutes + 40, (q) => q);
  const secs = Math.round(mix(0, 180, wait));
  const waitLabel = secs < 60 ? `waiting · ${secs} s` : `waiting · ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  // ── streaming service
  const svcIn = ramp(f, streaming - 10, streaming + 16, back(1.3)) * (1 - ramp(f, even - 10, even + 20, io));
  const svcRows = Array.from({ length: 15 }).map((_, i) => {
    const a = holds - 20 + i * 10;
    const t = ramp(f, a, a + 16, io);
    const d = slot(i, 5, 3, 0.38, SVC[1] * svcIn);
    const dst: V3 = [SVC[0] + d[0], d[1], SVC[2] + d[2]];
    const copied = i < 8 && f >= copies + i * 3;
    return <Cube key={"sv" + i} k={k} p={t < 1 ? hop([W[0], 1.0, W[2]], dst, t, 0.9) : dst} s={f >= a && svcIn > 0.3 && !copied ? 0.22 : 0} m={flash(f, a + 16, 18) > 0.3 ? k.m.live : k.m.done} />;
  });
  const copyRows = Array.from({ length: 8 }).map((_, i) => {
    const a = copies + i * 3;
    const t = ramp(f, a, a + 20, io);
    const d = slot(i, 5, 3, 0.38, SVC[1]);
    const tp = slot(TOP.cols * (TOP.rows - 1) + i, TOP.cols, TOP.rows, TOP.pitch, topY);
    return <Cube key={"cp" + i} k={k} p={hop([SVC[0] + d[0], SVC[1], SVC[2] + d[2]], [ST.c[0] + tp[0], tp[1], ST.c[2] + tp[2]], t, 1.3)} s={f >= a && t < 1 ? 0.22 : 0} m={k.m.done} />;
  });
  const onlyV = ramp(f, only - 6, only + 14) * (1 - ramp(f, even - 10, even + 10));
  // ── index lag
  const idxIn = ramp(f, indexes - 8, indexes + 16, back(1.2));
  const jobIn = ramp(f, job - 10, job + 10, back(1.4));
  const qIn = ramp(f, searches - 10, searches + 14, back(1.4)) * (1 - ramp(f, slow - 10, slow));
  const qy = mix(topY + 2.6, topY + 1.2, qIn);
  const scanning = f >= slow && f < slow + 110;
  const scanZ = mix(-1.2, 1.2, ramp(f, slow, slow + 110, (q) => q));
  const oldD = (TOP.rows - 1) * TOP.pitch;
  const oldZ = ST.c[2] - TOP.pitch / 2;
  return (
    <Scene3D
      name="Why fresh data is hard"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([-FLOOR.w / 2 + 0.4, 0, FLOOR.d / 2 - 0.3])} align="left" color={LANCE.dark100} o={1 - ramp(f, ms, ms + 20)}>object storage</T>
          <T at={pr([ST.c[0], topY + 0.1, ST.c[2] - ST.d / 2])} dy={-24} size={26} o={1 - wIn} color={f >= ms && f < batching ? LANCE.orange300 : LANCE.offwhite}>{`table · v${ver}`}</T>
          <T at={pr([W[0], 0, W[2] + 0.4])} dy={20} o={1 - wIn}>writer</T>
          <T at={pr([RD[0], 0, RD[2] + 0.4])} dy={20} o={rIn}>reader</T>
          <T at={pr([ST.c[0] + 2.4, 0.4, ST.c[2] + 1.6])} o={ramp(f, hourly, hourly + 14) * (1 - ramp(f, ms - 10, ms))} dy={-10}>1 commit / hour</T>
          <T at={pr([HEAP[0], 0, HEAP[2] + 1.0])} o={ramp(f, piles - 10, piles + 10) * (1 - sink)} dy={18}>metadata files</T>
          <T at={pr([W1[0], 0, W1[2] + 0.4])} o={wIn} dy={20}>writer 1</T>
          <T at={pr([W2[0], 0, W2[2] + 0.4])} o={wIn} dy={20}>writer 2</T>
          <T at={pr([tgt[0], tgt[1] + 0.5, tgt[2]])} o={wIn} dy={-20} size={28} color={LANCE.orange300}>{`v${ver + 1}?`}</T>
          <T at={pr([BIN[0] + 1.0, BIN[1] + 0.9, BIN[2]])} o={binIn} align="left">batch · in memory</T>
          <T at={pr([RD[0], 1.1, RD[2]])} o={ramp(f, seconds - 10, seconds + 6) * (1 - ramp(f, another, another + 20))} dy={-30} size={30} color={LANCE.orange300}>{waitLabel}</T>
          <T at={pr([SVC[0], SVC[1], SVC[2] + 1.1])} o={svcIn} dy={18} color={LANCE.offwhite}>streaming service · its own storage</T>
          <T at={pr([SVC[0], SVC[1] + 0.6, SVC[2] - 1.0])} o={onlyV} dy={-18} size={26} color={LANCE.orange300}>only copy · outside the table</T>
          <T at={pr([(SVC[0] + ST.c[0] - 1.8) / 2, topY + 1.4, (SVC[2] + ST.c[2]) / 2])} o={ramp(f, C("later", copies + 60) - 4, C("later", copies + 60) + 10) * (1 - onlyV)} dy={-14}>copied in later</T>
          <T at={pr([ST.c[0] - 2.2, topY + 0.6, oldZ])} o={idxIn} align="right" color={LANCE.lavender}>index</T>
          <T at={pr([ST.c[0] - 2.2, topY + 0.2, ST.c[2] + 0.85])} o={idxIn} align="right" color={LANCE.orange300}>new rows</T>
          <T at={pr([4.9, 0, -2.4])} o={jobIn} dy={20}>index job · later</T>
          <T at={pr([ST.c[0] + 1.0, qy + 0.3, ST.c[2] - 0.3])} o={qIn} dy={-20} color={LANCE.lavender}>search</T>
          <T at={pr([ST.c[0] + 2.2, topY + 0.3, ST.c[2] + 0.85])} o={ramp(f, miss + 4, miss + 16) * (1 - ramp(f, slow - 10, slow))} align="left" color={LANCE.orange300}>missed</T>
          <T at={pr([ST.c[0], topY + 0.7, ST.c[2] + scanZ])} o={scanning ? 1 : 0} dy={-12} color={LANCE.lavender}>slow scan</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={FLOOR.w} d={FLOOR.d} />
      <Outline k={k} p={[TABLE.c[0], 0.02, TABLE.c[2]]} w={TABLE.w + 0.3} d={TABLE.d + 0.3} m={k.m.rim} o={1} />
      {slabs}
      {topRows}
      {early}
      <Box k={k} p={hop([CLIENTS[1][0], 0.6, CLIENTS[1][2]], [ST.c[0], slabY(4) + 0.3, ST.c[2]], hb, 1.4)} s={f >= hourly && hb < 1 ? [1.6, 0.36, 1.2] : 0} m={k.m.done} />
      {rain}
      {heap}
      <Pillar k={k} p={W} s={1 - wIn} />
      <Pillar k={k} p={W1} s={wIn} />
      <Pillar k={k} p={W2} s={wIn} />
      <Box k={k} p={p1} s={wIn > 0.01 && flyT > 0 ? [1.1, 0.12, 0.8] : 0} m={k.m.live} />
      <Box k={k} p={p2} s={wIn > 0.01 && flyT > 0 && bounce < 1 ? [1.1, 0.12, 0.8] : 0} m={flyT >= 1 ? k.m.dim : k.m.live} r={[0, 0, bounce * 2.2]} />
      <Bin k={k} p={[BIN[0], BIN[1] - 0.12, BIN[2]]} inner={1.2} h={0.9} rise={binIn} hot={inBin >= PER - 2} />
      {binCubes}
      <Box k={k} p={hop([BIN[0], BIN[1], BIN[2]], [ST.c[0], topY + 0.1, ST.c[2]], dropT, 0.3)} s={dropT > 0 && dropT < 1 ? [mix(1.1, ST.w, dropT), mix(0.5, ST.h, dropT), mix(1.1, ST.d, dropT)] : 0} m={k.m.live} />
      <Pillar k={k} p={RD} s={rIn} lit={flash(f, borns[Math.max(0, count - 1)] + 14, 20)} />
      <Rod k={k} a={[RD[0], 0.95, RD[2]]} b={f >= holds && svcIn > 0.3 ? [SVC[0] + 0.8, SVC[1] + 0.2, SVC[2]] : beamTop} m={f >= seconds - 10 && f < another ? k.m.beamDim : k.m.beamLav} t={rIn * (1 - qIn)} r={0.025} />
      <Plate k={k} p={[SVC[0], Math.max(0.01, SVC[1] * svcIn), SVC[2]]} w={svcIn > 0.01 ? 2.2 : 0.001} d={svcIn > 0.01 ? 1.5 : 0.001} h={Math.max(0.01, 0.55 * svcIn)} m={k.m.pillar} rim={Math.max(onlyV, svcIn > 0.5 ? 1 : 0)} rimMat={onlyV > 0.5 ? k.m.rimHot : k.m.rim} />
      <Outline k={k} p={[SVC[0], 0.02, SVC[2]]} w={2.8} d={2.1} m={k.m.rimHot} o={onlyV} />
      {svcRows}
      {copyRows}
      <Box k={k} p={[ST.c[0], topY + 0.48, oldZ]} s={[TOP.cols * TOP.pitch * idxIn, 0.05, oldD]} m={k.m.lavGlass} />
      <Outline k={k} p={[ST.c[0], topY + 0.46, ST.c[2] + 0.85]} w={TOP.cols * TOP.pitch} d={TOP.pitch} m={k.m.beamLav} o={idxIn * 0.8} />
      <Pillar k={k} p={[4.9, 0, -2.4]} s={jobIn} />
      <Query k={k} p={[ST.c[0] + 1.0, qy, ST.c[2] - 0.3]} s={qIn} />
      <Rod k={k} a={[ST.c[0] + 1.0, qy, ST.c[2] - 0.3]} b={[ST.c[0] + 1.0, topY + 0.5, ST.c[2] - 0.3]} m={k.m.beamLav} t={ramp(f, miss - 16, miss + 4) * qIn} r={0.03} />
      <Box k={k} p={[ST.c[0], topY + 0.3, ST.c[2] + scanZ]} s={scanning ? [TOP.cols * TOP.pitch + 0.3, 0.5, 0.04] : 0} m={k.m.beamLav} />
    </Scene3D>
  );
};
