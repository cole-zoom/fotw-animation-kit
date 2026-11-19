import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import {
  Scene3D, useKit, useF, rigPath, ramp, back, io, mix, hop, flash, slot, stack, rand,
  Box, Plate, Cube, File, Pillar, Query, Rod, Outline, T, LANCE, V3, Kit,
} from "./rte3d";

type P = { enter?: SceneTransition; exit?: SceneTransition };

/** a MemTable: cubes stacking on a pad, with its live index riding on top */
const MemPad: React.FC<{ k: Kit; p: V3; n: number; idx: number; hit: number; w?: number; d?: number; hide?: boolean }> = ({ k, p, n, idx, hit, w = 1.5, d = 1.2, hide = false }) => {
  const cols = 4, pitch = 0.26;
  const cubes: React.ReactNode[] = [];
  for (let i = 0; i < 64; i++) {
    const s = stack(i, cols, pitch);
    cubes.push(<Cube key={i} k={k} p={[p[0] + s[0], p[1] + s[1] - pitch / 2, p[2] + s[2]]} s={i < n ? 0.2 : 0} m={i >= n - 2 && hit > 0.3 ? k.m.live : k.m.done} />);
  }
  const top = p[1] + Math.ceil(n / (cols * cols)) * pitch + 0.06;
  return (
    <>
      <Plate k={k} p={p} w={hide ? 0.001 : w} d={hide ? 0.001 : d} h={0.05} m={k.m.plateHi} />
      {cubes}
      <Box k={k} p={[p[0], top, p[2]]} s={idx > 0.01 && n > 0 ? [cols * pitch * idx, 0.04, cols * pitch] : 0} m={hit > 0.3 ? k.m.lav : k.m.lavGlass} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Nodes — "You turn it on for a table, and its nodes accept writes from many
// clients. The nodes keep the newest rows in memory, and keep the indexes you
// choose up to date as rows arrive."
// ═══════════════════════════════════════════════════════════════════════════
export const Nodes: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("nodes");
  const turn = C("turn", 14);
  const nodes = C("nodes", 120);
  const many = C("many", 210);
  const memory = C("memory", 410);
  const indexes = C("indexes", 470);
  const rig = rigPath(f, [
    [0, { tilt: 0.62, y: -0.2, z: 0.6 }],
    [memory - 30, { tilt: 0.62, y: -0.2, z: 0.6 }],
    [memory + 20, { tilt: 0.78, y: 0.0, z: 4.2, x: 0.6 }],
  ]);
  const TBL: V3 = [5.2, 0, 0];
  const on = ramp(f, turn + 4, turn + 20);
  const CL: V3[] = [[-6.0, 0, -1.7], [-6.0, 0, 0], [-6.0, 0, 1.7]];
  const nIn = (i: number) => ramp(f, nodes - 8 + i * 8, nodes + 14 + i * 8, back(1.3));
  const N1: V3 = [-0.6, 0.55, -1.15];
  const N2: V3 = [-0.6, 0.55, 1.15];
  const PADS: { node: number; dx: number }[] = [
    { node: 0, dx: -1.0 }, { node: 0, dx: 1.0 }, { node: 1, dx: -1.0 }, { node: 1, dx: 1.0 },
  ];
  const padP = (j: number): V3 => {
    const n = PADS[j].node === 0 ? N1 : N2;
    return [n[0] + PADS[j].dx, n[1] * Math.min(1, nIn(PADS[j].node)), n[2]];
  };
  const cIn = (i: number) => ramp(f, many - 34 + i * 7, many - 16 + i * 7);
  // writes: client i → pad (round robin), every 5 frames after "many"
  const flights: React.ReactNode[] = [];
  const landed = [0, 0, 0, 0];
  const lastHit = [-999, -999, -999, -999];
  for (let w = 0; w < 140; w++) {
      const a = many - 10 + w * 5;
      const c = w % 3;
      const j = (w * 7 + c) % 4;
      const t = ramp(f, a, a + 18, io);
      const dst = padP(j);
      flights.push(<Cube key={w} k={k} p={hop([CL[c][0], 1.0, CL[c][2]], [dst[0], dst[1] + 0.6, dst[2]], t, 1.0)} s={f >= a && t < 1 ? 0.18 : 0} m={k.m.done} />);
      if (f >= a && t >= 1) { landed[j]++; lastHit[j] = a + 18; }
    }
  const idxV = ramp(f, indexes - 8, indexes + 12);
  return (
    <Scene3D
      name="Realtime Engine nodes"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TBL[0], 0.08, 1.4])} dy={22} color={on > 0.5 ? LANCE.orange300 : LANCE.offwhite}>{on > 0.5 ? "table · realtime engine on" : "table"}</T>
          {["agents", "apps", "pipelines"].map((t, i) => (
            <T key={t} at={pr([CL[i][0], 0, CL[i][2] + 0.4])} o={cIn(i)} dy={20}>{t}</T>
          ))}
          <T at={pr([N1[0] - 2.3, N1[1], N1[2]])} o={nIn(0)} align="right" color={LANCE.offwhite}>node 1</T>
          <T at={pr([N2[0] - 2.3, N2[1], N2[2]])} o={nIn(1)} align="right" color={LANCE.offwhite}>node 2</T>
          {["shard 1", "shard 2", "table B", "table C"].map((t, j) => (
            <T key={t} at={pr([padP(j)[0], padP(j)[1], padP(j)[2] + 0.7])} o={nIn(PADS[j].node) * ramp(f, memory - 10, memory + 10)} dy={16} size={20}>{t}</T>
          ))}
          <T at={pr([N1[0], 1.6, N1[2] - 0.9])} o={ramp(f, memory - 6, memory + 14)} dy={-10} color={LANCE.dark100}>in memory</T>
          <T at={pr([N1[0] + 1.0, 1.9, N1[2]])} o={idxV} dy={-10} color={LANCE.lavender}>live indexes</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={15} d={5.6} />
      <Plate k={k} p={[TBL[0], 0.08, 0]} w={2.6} d={2.2} h={0.08} m={k.m.plateHi} rim={on} />
      {Array.from({ length: 20 }).map((_, i) => {
        const p = slot(i, 5, 4, 0.42, 0.08);
        return <Cube key={"t" + i} k={k} p={[TBL[0] + p[0], p[1], p[2]]} s={0.22} />;
      })}
      {[N1, N2].map((n, i) => (
        <Plate key={"n" + i} k={k} p={[n[0], Math.max(0.01, n[1] * Math.min(1, nIn(i))), n[2]]} w={4.2} d={1.9} h={Math.max(0.01, 0.55 * Math.min(1, nIn(i)))} m={k.m.plateHi} rim={nIn(i) > 0.5 ? 1 : 0} rimMat={k.m.rimHot} />
      ))}
      {[N1, N2].map((n, i) => (
        <Rod key={"r" + i} k={k} a={[n[0] + 2.1, n[1] - 0.2, n[2]]} b={[TBL[0] - 1.3, 0.1, n[2] * 0.4]} m={k.m.beamDim} r={0.02} t={nIn(i)} />
      ))}
      {PADS.map((pd, j) => <MemPad key={j} k={k} p={padP(j)} n={nIn(pd.node) > 0.01 ? landed[j] : 0} idx={nIn(pd.node) > 0.01 ? idxV : 0} hit={flash(f, lastHit[j], 10)} hide={nIn(pd.node) <= 0.01} />)}
      {CL.map((c, i) => <Pillar key={i} k={k} p={c} s={cIn(i)} />)}
      {flights}
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Durable — "A write is only acknowledged once it's durable in object
// storage. There's no disk cluster to replicate or back up. If a node goes
// away, the writes it acknowledged are already stored in the table."
// ═══════════════════════════════════════════════════════════════════════════
export const Durable: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("durable");
  const ack = C("acknowledged", 90);
  const disk = C("disk", 300);
  const node = C("note", C("node", 470));
  const already = C("already", 620);
  const rig = rigPath(f, [
    [0, { tilt: 0.66, y: -0.1, z: 1.4 }],
    [disk - 20, { tilt: 0.66, y: -0.1, z: 1.4 }],
    [disk + 20, { tilt: 0.6, y: -0.2, z: 1.2, x: -0.8 }],
    [node - 10, { tilt: 0.6, y: -0.2, z: 1.2, x: -0.8 }],
    [node + 30, { tilt: 0.8, y: 0.4, z: 1.6, x: 0.2 }],
  ]);
  const CL: V3 = [-5.6, 0, -1.3];
  const ND: V3 = [-1.4, 0.6, -1.3];
  const WAL = (i: number): V3 => [-2.6 + i * 0.62, 0, 1.4];
  const writes = [8, ack - 30, ack + 30, ack + 90, ack + 150, ack + 210, node - 60];
  const gone = ramp(f, C("away", node + 20) - 6, C("away", node + 20) + 30, io);
  const walGlow = ramp(f, already - 8, already + 16);
  const flights: React.ReactNode[] = [];
  const tiles: React.ReactNode[] = [];
  let ackHit = -999;
  writes.forEach((a, i) => {
    const on = f >= a;
    const t1 = ramp(f, a, a + 16, io);
    const t2 = ramp(f, a + 16, a + 34, io);
    const t3 = ramp(f, a + 34, a + 60, io);
    const w = WAL(i);
    flights.push(<Cube key={"a" + i} k={k} p={hop([CL[0], 1.0, CL[2]], [ND[0], ND[1] + 0.3, ND[2]], t1, 0.8)} s={on && t1 < 1 ? 0.2 : 0} m={k.m.done} />);
    flights.push(<Cube key={"b" + i} k={k} p={hop([ND[0], ND[1] + 0.3, ND[2]], [w[0], 0.1, w[2]], t2, 0.6)} s={on && t1 >= 1 && t2 < 1 ? 0.2 : 0} m={k.m.live} />);
    const lit = Math.max(walGlow, flash(f, a + 34, 24));
    tiles.push(<File key={"w" + i} k={k} p={w} w={on && t2 >= 1 ? 0.5 : 0} d={0.5} m={lit > 0.3 ? k.m.live : k.m.paper} />);
    const ackOn = on && t2 >= 1 && t3 < 1;
    flights.push(<mesh key={"k" + i} geometry={k.sphere} material={k.m.live} position={hop([w[0], 0.3, w[2]], [CL[0], 1.1, CL[2]], t3, 1.4)} scale={ackOn ? [0.1, 0.1, 0.1] : [1e-4, 1e-4, 1e-4]} visible={ackOn} />);
    if (on && t3 >= 1) ackHit = Math.max(ackHit, a + 60);
  });
  const diskIn = ramp(f, disk - 10, disk + 10, back(1.4));
  const diskSink = ramp(f, C("replicate", disk + 50) + 4, C("replicate", disk + 50) + 40, io);
  return (
    <Scene3D
      name="Durable before ack"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([CL[0], 0, CL[2] + 0.4])} dy={20}>client</T>
          <T at={pr([CL[0], 1.2, CL[2]])} o={flash(f, ackHit, 40)} dy={-24} color={LANCE.orange300}>ack</T>
          <T at={pr([ND[0], ND[1], ND[2] + 1.0])} o={1 - gone} dy={18} color={LANCE.offwhite}>RTE node</T>
          <T at={pr([-2.9, 0, 2.0])} align="left" dy={14} color={LANCE.dark100}>write-ahead log · object storage</T>
          <T at={pr([4.4, 0, -0.3])} o={diskIn * (1 - diskSink)} dy={20}>disk cluster</T>
          <T at={pr([0, 0.4, 2.3])} o={walGlow} dy={30} size={26} color={LANCE.orange300}>already in the table</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={15} d={5.6} />
      <Outline k={k} p={[0.4, 0, 1.4]} w={6.6} d={1.4} m={k.m.rimHot} o={walGlow} />
      <Plate k={k} p={[ND[0], ND[1] * (1 - gone) + 0.01, ND[2]]} w={2.4 * (1 - gone * 0.5)} d={1.6 * (1 - gone * 0.5)} h={Math.max(0.01, 0.6 * (1 - gone))} m={k.m.plateHi} rim={gone < 0.5 ? 1 - gone : 0} />
      {Array.from({ length: 10 }).map((_, i) => {
        const s = stack(i, 4, 0.26);
        return <Cube key={"nd" + i} k={k} p={[ND[0] + s[0], ND[1] + s[1] - 0.13 - gone * 2, ND[2] + s[2]]} s={0.2 * (1 - gone)} m={k.m.done} />;
      })}
      {tiles}
      {flights}
      <Pillar k={k} p={CL} lit={flash(f, ackHit, 20)} />
      {[0, 1, 2].map((i) => {
        const v = diskIn > 0.01 && diskSink < 1;
        return <mesh key={"disk" + i} geometry={k.cyl} material={k.m.dim} position={[3.6 + i * 0.85, (0.45 * (1 - diskSink)) - diskSink * 0.2, -1.2]} scale={v ? [0.34 * diskIn, Math.max(1e-4, 0.9 * diskIn * (1 - diskSink)), 0.34 * diskIn] : [1e-4, 1e-4, 1e-4]} visible={v} />;
      })}
      <Rod k={k} a={[ND[0] + 1.2, ND[1], ND[2]]} b={[3.2, 0.5, -1.2]} m={k.m.beamDim} t={diskIn * (1 - diskSink)} r={0.02} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Workers — "Merging new data into the table and updating its indexes runs in
// the background, on separate workers. The engine plans and schedules that
// work for you, and every row stays searchable while it runs."
// ═══════════════════════════════════════════════════════════════════════════
export const Workers: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("workers");
  const merging = C("merging", 10);
  const updating = C("updating", 170);
  const workers = C("workers", 370);
  const plans = C("plans", 450);
  const every = C("every", 600);
  const rig = rigPath(f, [
    [0, { tilt: 0.66, y: -0.2, z: 1.0 }],
    [every - 20, { tilt: 0.66, y: -0.2, z: 1.0 }],
    [every + 20, { tilt: 0.74, y: 0.2, z: 0.8 }],
  ]);
  const ND: V3 = [-4.6, 0.6, -1.3];
  const GEN = (g: number): V3 => [-3.6 + (g - 1) * 0.8, 0, 1.4];
  const BASE: V3 = [2.6, 0.08, 0.2];
  const BC = 8, BR = 5, BP = 0.4;
  const merge = ramp(f, merging + 16, merging + 50, io);
  const merged = f >= merging + 50;
  const idxUp = ramp(f, updating + 6, updating + 40, io);
  const wIn = (i: number) => ramp(f, workers - 20 + i * 10, workers + i * 10, back(1.5));
  const busy = (i: number) => (f > plans ? (Math.floor((f - plans) / 34) % 2 === i ? 1 : 0) : 0);
  const qIn = ramp(f, every - 10, every + 12, back(1.4));
  const qb = ramp(f, every, every + 24);
  const QP: V3 = [-0.6, 3.0, -0.6];
  const baseRows: React.ReactNode[] = [];
  for (let i = 0; i < BC * BR; i++) {
    const p = slot(i, BC, BR, BP, BASE[1]);
    const isNew = Math.floor(i / BC) === BR - 1;
    const lit = isNew && flash(f, merging + 50, 30) > 0.3;
    baseRows.push(<Cube key={i} k={k} p={[BASE[0] + p[0], p[1], BASE[2] + p[2]]} s={isNew && !merged ? 0 : 0.22} m={lit ? k.m.live : isNew ? k.m.done : k.m.idle} />);
  }
  const idxD = mix((BR - 1) * BP, BR * BP, idxUp);
  const idxZ = BASE[2] - (BR * BP) / 2 + idxD / 2;
  const g1 = GEN(1);
  const g1p: V3 = merge > 0 ? hop(g1, [BASE[0], 0.4, BASE[2] + 0.9], merge, 1.4) : g1;
  return (
    <Scene3D
      name="Merging in the background"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([ND[0], ND[1], ND[2] + 0.9])} dy={16} color={LANCE.offwhite}>MemTable</T>
          {[1, 2, 3].map((g) => (
            <T key={g} at={pr([GEN(g)[0], 0, GEN(g)[2] + 0.4])} o={g === 1 ? 1 - merge : 1} dy={16} size={20}>{`gen ${g}`}</T>
          ))}
          <T at={pr([GEN(2)[0], 0, GEN(2)[2] + 0.4])} dy={42} size={20} color={LANCE.dark100}>SSTables</T>
          <T at={pr([BASE[0], 0.1, BASE[2] + (BR * BP) / 2 + 0.3])} dy={20} color={LANCE.offwhite}>base table</T>
          <T at={pr([BASE[0] + 1.9, 0.7, BASE[2] - 0.4])} align="left" color={LANCE.lavender}>index</T>
          {[0, 1].map((i) => (
            <T key={i} at={pr([4.6 + i * 1.3, 0, -2.0])} o={wIn(i)} dy={18} size={20} color={busy(i) ? LANCE.orange300 : LANCE.dark200}>{`worker ${i + 1}`}</T>
          ))}
          <T at={pr([QP[0], QP[1] + 0.3, QP[2]])} o={qIn} dy={-20} color={LANCE.lavender}>query</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={15} d={5.6} />
      <Plate k={k} p={ND} w={2.0} d={1.5} h={0.6} m={k.m.plateHi} rim={1} />
      {Array.from({ length: 8 }).map((_, i) => {
        const s = stack(i, 4, 0.26);
        return <Cube key={"m" + i} k={k} p={[ND[0] + s[0], ND[1] + s[1] - 0.13, ND[2] + s[2]]} s={0.2} m={k.m.done} />;
      })}
      <File k={k} p={g1p} w={0.62} d={0.62} m={merge > 0 && merge < 1 ? k.m.live : k.m.paper} />
      <File k={k} p={GEN(2)} w={0.62} d={0.62} />
      <File k={k} p={GEN(3)} w={0.62} d={0.62} />
      <Rod k={k} a={[ND[0], 0.3, ND[2] + 0.75]} b={[GEN(3)[0], 0.05, GEN(3)[2] - 0.3]} m={k.m.beamDim} r={0.02} />
      <Plate k={k} p={BASE} w={BC * BP + 0.4} d={BR * BP + 0.4} h={0.08} m={k.m.plateHi} />
      {baseRows}
      <Box k={k} p={[BASE[0], 0.62, idxZ]} s={[BC * BP + 0.1, 0.05, idxD]} m={k.m.lavGlass} />
      {[0, 1].map((i) => (
        <React.Fragment key={i}>
          <Pillar k={k} p={[4.6 + i * 1.3, 0, -2.0]} s={wIn(i)} lit={busy(i)} />
          <Rod k={k} a={[4.6 + i * 1.3, 0.9, -2.0]} b={[BASE[0] + (i - 0.5) * 1.2, 0.7, BASE[2] - 0.6]} m={k.m.beam} t={busy(i) * wIn(i)} r={0.025} />
        </React.Fragment>
      ))}
      <Query k={k} p={QP} s={qIn} />
      <Rod k={k} a={QP} b={[ND[0], ND[1] + 0.5, ND[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
      <Rod k={k} a={QP} b={[GEN(2)[0], 0.1, GEN(2)[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
      <Rod k={k} a={QP} b={[BASE[0], 0.7, BASE[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
    </Scene3D>
  );
};
