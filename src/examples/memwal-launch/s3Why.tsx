import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import {
  Scene3D, useKit, useF, rigPath, ramp, back, io, mix, hop, flash, slot, rand,
  Box, Plate, Cube, File, Pillar, Query, Rod, Outline, T, LANCE, V3,
} from "./rte3d";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// Stream — "Another option is to put a streaming service in front of the
// table. The service holds new rows in its own storage and copies them into
// the table later. However, until it does, the only durable copy of a new row
// lives in a separate system and not in your table."
// ═══════════════════════════════════════════════════════════════════════════
export const Stream: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("stream");
  const svc = C("streaming", 100);
  const holds = C("holds", 250);
  const copies = C("copies", 390);
  const until = C("until", 570);
  const only = C("only", until + 50);
  const rig = rigPath(f, [
    [0, { tilt: 0.6, y: -0.3, z: 1.0 }],
    [until - 20, { tilt: 0.6, y: -0.3, z: 1.0 }],
    [until + 30, { tilt: 0.66, y: -0.2, z: 1.8, x: 1.0 }],
  ]);
  const WR: V3 = [-6.0, 0, 0.6];
  const SV: V3 = [-1.6, 0.55, 0];
  const TBp: V3 = [3.8, 0, 0];
  const svcIn = ramp(f, svc - 10, svc + 14, back(1.4));
  // rows land in the service's own log, one every 11 frames from "holds"
  const logAt = (i: number) => holds - 24 + i * 11;
  const COPY = 8;
  const log: React.ReactNode[] = [];
  const flying: React.ReactNode[] = [];
  for (let i = 0; i < 18; i++) {
    const a = logAt(i);
    const on = f >= a;
    const dst = slot(i, 6, 3, 0.42, SV[1]);
    const d: V3 = [SV[0] + dst[0], dst[1], SV[2] + dst[2]];
    const t = ramp(f, a, a + 16, io);
    const copied = i < COPY && f >= copies + i * 3 + 18;
    flying.push(<Cube key={"w" + i} k={k} p={hop([WR[0], 1.1, WR[2]], d, t, 1.0)} s={on && t < 1 ? 0.24 : 0} m={k.m.done} />);
    log.push(<Cube key={"l" + i} k={k} p={d} s={on && t >= 1 ? 0.24 : 0} m={copied ? k.m.ghost : flash(f, a + 16, 18) > 0.3 ? k.m.live : k.m.done} />);
    // the late copy into the table
    const ct = ramp(f, copies + i * 3, copies + i * 3 + 18, io);
    const td = slot(23 - i, 6, 4, 0.42, 0.08);
    const tp: V3 = [TBp[0] + td[0], td[1], TBp[2] + td[2]];
    flying.push(<Cube key={"c" + i} k={k} p={ct < 1 ? hop(d, tp, ct, 1.2) : tp} s={on && i < COPY && f >= copies + i * 3 ? 0.24 : 0} m={k.m.done} />);
  }
  const tableRows = Array.from({ length: 14 }).map((_, i) => {
    const p = slot(i, 6, 4, 0.42, 0.08);
    return <Cube key={"t" + i} k={k} p={[TBp[0] + p[0], p[1], TBp[2] + p[2]]} s={0.24} />;
  });
  const onlyV = ramp(f, only - 6, only + 16);
  const sep = flash(f, C("separate", only + 150), 40);
  return (
    <Scene3D
      name="Streaming service in front"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([WR[0], 0, WR[2] + 0.4])} dy={22}>writer</T>
          <T at={pr([SV[0], SV[1], 1.3])} o={svcIn} dy={22} color={LANCE.offwhite}>streaming service</T>
          <T at={pr([TBp[0], 0.08, 1.45])} dy={22} color={LANCE.offwhite}>table</T>
          <T at={pr([TBp[0], 0.6, -1.4])} o={ramp(f, C("later", copies + 60) - 4, C("later", copies + 60) + 10) * (1 - onlyV)} dy={-16}>later</T>
          <T at={pr([SV[0], SV[1] + 0.4, -1.4])} o={onlyV} dy={-22} size={26} color={LANCE.orange300}>only copy · outside the table</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={15} d={5.4} />
      <Plate k={k} p={[SV[0], SV[1] * Math.min(1, svcIn), SV[2]]} w={3.0} d={1.9} h={0.55 * Math.max(0.02, Math.min(1, svcIn))} m={k.m.plateHi} rim={Math.max(onlyV, sep)} />
      <Outline k={k} p={[SV[0], 0.02, SV[2]]} w={3.6} d={2.5} m={k.m.rimHot} o={onlyV} />
      <Plate k={k} p={[TBp[0], 0.08, TBp[2]]} w={3.0} d={2.2} h={0.08} m={k.m.plateHi} />
      {tableRows}
      {log}
      {flying}
      <Pillar k={k} p={WR} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// IndexLag — "Even after rows reach the table, indexes add one more delay.
// They're usually updated by a separate job. Until it runs, searches either
// miss the new rows or fall back to slow scans."
// ═══════════════════════════════════════════════════════════════════════════
export const IndexLag: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("indexLag");
  const idx = C("indexes", 150);
  const job = C("job", 370);
  const searches = C("searches", 470);
  const miss = C("miss", 520);
  const slow = C("slow", 640);
  const rig = rigPath(f, [
    [0, { tilt: 0.66, y: -0.2, z: 1.2 }],
    [searches - 20, { tilt: 0.66, y: -0.2, z: 1.2 }],
    [searches + 20, { tilt: 0.78, y: 0.1, z: 1.8, x: 0.4 }],
  ]);
  const COLS = 9, ROWS = 5, PITCH = 0.44, OLDROWS = 3;
  const TBx = -0.8;
  const rows: React.ReactNode[] = [];
  const scanZ = mix(-1.6, 1.6, ramp(f, slow - 4, slow + 110, (q) => q));
  const scanning = f >= slow - 4 && f < slow + 110;
  for (let i = 0; i < COLS * ROWS; i++) {
    const p = slot(i, COLS, ROWS, PITCH, 0.08);
    const isNew = Math.floor(i / COLS) >= OLDROWS;
    const born = isNew ? 6 + (i - OLDROWS * COLS) * 2.2 : -999;
    const a = ramp(f, born, born + 14, back(1.8));
    const missed = isNew && f >= miss + 6 && f < slow;
    const scanned = f >= slow && p[2] < scanZ + 0.2;
    const m = scanned ? (isNew ? k.m.live : k.m.paper) : missed ? k.m.ghost : isNew ? k.m.done : k.m.idle;
    rows.push(<Cube key={i} k={k} p={[TBx + p[0], p[1], p[2]]} s={0.26 * (isNew ? a : 1)} m={m} />);
  }
  const idxIn = ramp(f, idx - 8, idx + 16, back(1.3));
  const oldD = OLDROWS * PITCH;
  const oldZ = -((ROWS - 1) / 2) * PITCH + ((OLDROWS - 1) / 2) * PITCH;
  const newD = (ROWS - OLDROWS) * PITCH;
  const newZ = ((ROWS - 1) / 2) * PITCH - ((ROWS - OLDROWS - 1) / 2) * PITCH;
  const jobIn = ramp(f, job - 10, job + 10, back(1.5));
  const qIn = ramp(f, searches - 10, searches + 16, back(1.4));
  const qy = mix(3.4, 1.2, qIn);
  const beam = ramp(f, miss - 16, miss + 4);
  return (
    <Scene3D
      name="Index lag"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TBx, 0.08, 1.4])} dy={22} color={LANCE.offwhite}>table</T>
          <T at={pr([TBx - 2.3, 0.6, oldZ])} o={idxIn} align="right" color={LANCE.lavender}>index</T>
          <T at={pr([TBx - 2.3, 0.2, newZ])} o={ramp(f, 30, 50)} align="right" color={LANCE.orange300}>new rows</T>
          <T at={pr([4.4, 0, 1.0])} o={jobIn} dy={22}>index job · later</T>
          <T at={pr([TBx + 1.2, qy + 0.3, -0.4])} o={qIn * (1 - ramp(f, slow - 10, slow))} dy={-22} color={LANCE.lavender}>search</T>
          <T at={pr([TBx + 2.4, 0.4, newZ])} o={ramp(f, miss + 4, miss + 16) * (1 - ramp(f, slow - 10, slow))} align="left" color={LANCE.orange300}>missed</T>
          <T at={pr([TBx, 0.6, scanZ])} o={scanning ? 1 : 0} dy={-14} color={LANCE.lavender}>slow scan</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={13} d={5.2} />
      <Plate k={k} p={[TBx, 0.08, 0]} w={COLS * PITCH + 0.4} d={ROWS * PITCH + 0.4} h={0.08} m={k.m.plateHi} />
      {rows}
      <Box k={k} p={[TBx, 0.6, oldZ]} s={[(COLS * PITCH + 0.1) * idxIn, 0.06, oldD]} m={k.m.lavGlass} />
      <Outline k={k} p={[TBx, 0.56, newZ]} w={COLS * PITCH + 0.1} d={newD} m={k.m.beamLav} o={idxIn * 0.8} />
      <Pillar k={k} p={[4.4, 0, 1.0]} s={jobIn} />
      <Query k={k} p={[TBx + 1.2, qy, -0.4]} s={qIn * (1 - ramp(f, slow - 10, slow))} />
      <Rod k={k} a={[TBx + 1.2, qy, -0.4]} b={[TBx + 1.2, 0.62, -0.4]} m={k.m.beamLav} t={beam * (1 - ramp(f, slow - 10, slow))} r={0.03} />
      <Box k={k} p={[TBx, 0.35, scanZ]} s={scanning ? [COLS * PITCH + 0.3, 0.55, 0.04] : 0} m={k.m.beamLav} />
    </Scene3D>
  );
};
