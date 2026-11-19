import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { Scene3D, useKit, useF, ramp, back, io, mix, hop, flash, T } from "./rte3d";
import { rigKeys } from "./v3Why";
import {
  Outline, World, NodeDeck, PadCubes, PadIndex, TABLE, BASE, MEMWAL, NODE, CLIENTS, GATE, WORKERS, FLOOR,
  basePos, walPos, sstPos, padPos, padSlot, Box, Plate, Cube, File, Pillar, Query, Rod, LANCE,
} from "./world";

type P = { enter?: SceneTransition; exit?: SceneTransition };
type V3 = [number, number, number];

// ═══════════════════════════════════════════════════════════════════════════
// Section 2 · Engine — "You turn it on for a table…" → "…searchable while it runs."
// Same table on the same floor; the engine switches on and an RTE node hovers
// above it (memory). One hero row, id 42, is followed through the true order
// from the code (lance mem_wal/write.rs): into the MemTable (hidden) → its WAL
// batch lands in the table's _mem_wal on object storage → visible → ack.
// Node loss = a new node replays the WAL from storage. Flush = MemTable →
// SSTable (gen 3); workers merge the OLDEST generation (gen 1) into the base,
// then index catch-up extends the base index. Reads hit all three tiers.
// ═══════════════════════════════════════════════════════════════════════════
const PADS = 2;
const HERO_CLIENT = 1;

export const Engine: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("engine");
  const turn = C("turn", 14);
  const nodes = C("nodes", 120);
  const many = C("many", 200);
  // clients + query node arrive with the node on "nodes", so they're on screen for the whole
  // "nodes accept writes from many clients" caption (Cole: clients cut off when I say it)
  const cl = Math.min(nodes + 8, many - 60);
  const memory = C("memory", 400);
  const indexes = C("indexes", 460);
  const acked = C("acknowledged", 700);
  const durable = C("durable", acked + 40);
  const disk = C("disk", durable + 100);
  const replicate = C("replicate", disk + 50);
  // node loss plays only when the node-loss line is in the cut (A/B); C drops it
  const loss = C("away", -999) > -999;
  const gone0 = loss ? C("away", C("note", replicate + 90) + 20) : 1e9;
  const already = loss ? C("already", gone0 + 100) : 1e9;
  // C: the MemWAL lines sit between "durable" and "disk" — the _mem_wal strip is the answer
  const memw = C("memwall", -999), stores = C("stores", memw + 120), unlike = C("unlike", stores + 120);
  const mwOn = memw > -999 ? ramp(f, memw - 6, memw + 12) * (1 - ramp(f, disk - 20, disk - 4)) : 0;
  const merging = C("merging", already + 80);
  const updating = C("updating", merging + 160);
  const workersCue = C("workers", updating + 150);
  const plans = C("plans", workersCue + 60);
  const every = C("every", plans + 150);

  const rig = rigKeys(f, [
    [0, { tilt: 0.72, y: -0.6, z: 0.8, scale: 1.05 }],
    [nodes - 44, { tilt: 0.72, y: -0.6, z: 0.8, scale: 1.05 }],
    [nodes - 4, { tilt: 0.64, y: -1.3, z: 0.6, x: 1.1, scale: 0.9 }],
    [acked - 50, { tilt: 0.64, y: -1.3, z: 0.6, x: 1.1, scale: 0.9 }],
    [acked - 14, { tilt: 0.6, y: -2.3, z: 0.6, x: 1.2, scale: 1.55 }],
    [memw - 14, { tilt: 0.6, y: -2.3, z: 0.6, x: 1.2, scale: 1.55 }],
    [memw + 26, { tilt: 0.68, y: -1.1, z: 0.6, x: 0.2, scale: 1.18 }],
    [disk - 10, memw > -999 ? { tilt: 0.68, y: -1.1, z: 0.6, x: 0.2, scale: 1.18 } : { tilt: 0.6, y: -2.3, z: 0.6, x: 1.2, scale: 1.55 }],
    [disk + 30, { tilt: 0.62, y: -1.6, z: 0.6, x: -0.6, scale: 1.1 }],
    [merging - 20, { tilt: 0.62, y: -1.6, z: 0.6, x: -0.6, scale: 1.1 }],
    [merging + 30, { tilt: 0.74, y: -0.9, z: 0.8, x: -0.9, scale: 1.12 }],
    [every - 10, { tilt: 0.74, y: -0.9, z: 0.8, x: -0.9, scale: 1.12 }],
    [every + 30, { tilt: 0.64, y: -1.5, z: 0.6, x: -0.6, scale: 1.0 }],
  ]);

  const on = ramp(f, turn + 2, turn + 20);
  const nodeRise = ramp(f, nodes - 6, nodes + 24, back(1.2));
  // node lost, then a new node claims the shards and replays the WAL
  const gone = ramp(f, gone0 - 6, gone0 + 20, io);
  const reborn = ramp(f, already + 10, already + 34, back(1.2));
  const replay = ramp(f, already + 30, already + 80, io);
  const nodeS = f < gone0 - 6 ? nodeRise : f < already + 10 ? 1 - gone : reborn;
  const nodeY = mix(0.2, NODE.c[1], Math.min(1, nodeS)) - (f >= gone0 - 6 && f < already + 10 ? gone * 1.2 : 0);

  // ── background writes: client → query node → shard pad. Paused around the hero.
  const writeAt: number[] = [];
  for (let a = cl + 24; a < merging + 260; a += 7) {
    if (a > acked - 60 && a < durable + 70) continue;
    if (a > gone0 - 20 && a < already + 90) continue;
    writeAt.push(a);
  }
  const W = 120;
  const landed = [0, 0];
  const lastHit = [-999, -999];
  const flights: React.ReactNode[] = [];
  const flushAt = merging;
  for (let w = 0; w < W; w++) {
    const a = writeAt[w] ?? 1e9;
    const c = w % 3, j = (w * 5 + c) % PADS;
    const t1 = ramp(f, a, a + 12, io), t2 = ramp(f, a + 12, a + 30, io);
    const dst = padPos(j, PADS, nodeY);
    const g: V3 = [GATE[0], 0.9, GATE[2]];
    const p = t1 < 1 ? hop([CLIENTS[c][0], 1.0, CLIENTS[c][2]], g, t1, 0.4) : hop(g, [dst[0], dst[1] + 0.8, dst[2]], t2, 1.2);
    flights.push(<Cube key={"w" + w} k={k} p={p} s={f >= a && t2 < 1 ? 0.17 : 0} m={k.m.done} />);
    if (f >= a + 30 && !(j === 0 && a + 30 < flushAt && f >= flushAt + 20)) { landed[j]++; lastHit[j] = a + 30; }
  }
  // WAL batches: one file per batch of writes lands in _mem_wal on the floor
  const BATCH = 6;
  const walFiles = Array.from({ length: 16 }).map((_, i) => {
    const a = (writeAt[(i + 1) * BATCH] ?? 1e9) + 24;
    const t = ramp(f, a, a + 14, io);
    const flushedAway = f >= flushAt + 24;
    const glow = flash(f, a + 14, 16) > 0.3 || (f >= already - 4 && f < already + 30);
    const src: V3 = [padPos(i % PADS, PADS, nodeY)[0], nodeY, NODE.c[2]];
    const rp = ramp(f, already + 30 + i * 2, already + 60 + i * 2, io); // replay: files fly up into the new node
    const show = f >= a && !flushedAway;
    return (
      <React.Fragment key={"wal" + i}>
        <File k={k} p={t < 1 ? hop(src, walPos(i), t, 0.2) : walPos(i)} w={show ? 0.34 : 0} d={0.3} m={glow ? k.m.live : k.m.paper} />
        <File k={k} p={hop(walPos(i), [src[0], NODE.c[1] + 0.3, src[2]], rp, 0.6)} w={show && rp > 0 && rp < 1 ? 0.2 : 0} d={0.18} m={k.m.live} />
      </React.Fragment>
    );
  });
  // ── the hero row: id 42
  const hA = acked - 40;
  const h1 = ramp(f, hA, hA + 14, io), h2 = ramp(f, hA + 14, hA + 34, io);
  const heroPad = 0;
  const heroSlot = padSlot(heroPad, PADS, Math.min(30, landed[0]), nodeY);
  const heroWal: V3 = walPos(15);
  const hw = ramp(f, durable - 22, durable, io); // its WAL batch falls to object storage, landing on "durable"
  const visibleNow = f >= durable;
  const ack = ramp(f, durable + 6, durable + 34, io);
  const heroPos: V3 = h1 < 1 ? hop([CLIENTS[HERO_CLIENT][0], 1.0, CLIENTS[HERO_CLIENT][2]], [GATE[0], 0.9, GATE[2]], h1, 0.4) : h2 < 1 ? hop([GATE[0], 0.9, GATE[2]], [heroSlot[0], heroSlot[1] + 0.6, heroSlot[2]], h2, 1.2) : heroSlot;
  const heroOn = f >= hA && !(f >= gone0 - 6 && replay < 1 && f < already + 80) && f < flushAt + 6;
  const heroWalShow = f >= durable - 22 && f < flushAt + 24;
  // ── disks that aren't there
  const diskIn = ramp(f, disk - 10, disk + 12, back(1.3)) * (1 - ramp(f, replicate + 4, replicate + 40, io));
  // ── flush pad 0 → SSTable gen 3; merge gen 1 → base; index catch-up
  const fl = ramp(f, flushAt, flushAt + 24, io);
  const mg = ramp(f, merging + 50, merging + 84, io);
  const merged = f >= merging + 84;
  const catchup = ramp(f, updating + 4, updating + 44, io);
  const wIn = ramp(f, merging - 10, merging + 14, back(1.4));
  const busy = (i: number) => (f >= merging + 40 && f < merging + 90 ? (i === 0 ? 1 : 0) : f >= updating && f < updating + 50 ? (i === 1 ? 1 : 0) : f > plans ? (Math.floor((f - plans) / 34) % 2 === i ? 1 : 0) : 0);
  const qIn = ramp(f, every - 10, every + 12, back(1.4));
  const qb = ramp(f, every, every + 24);
  const QP: V3 = [3.4, 4.3, 0.8];
  const padN = (j: number) => {
    if (f >= gone0 - 6 && f < already + 30) return 0;
    const n = Math.min(32, landed[j] + (j === heroPad && heroOn && h2 >= 1 ? 0 : 0));
    return f >= already + 30 && f < already + 80 ? Math.round(n * replay) : n;
  };
  const baseIdxD = mix(4 * BASE.pitch * (40 / 48), 4 * BASE.pitch, catchup);
  return (
    <Scene3D
      name="What the Realtime Engine does"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TABLE.c[0], 0.05, TABLE.c[2] + TABLE.d / 2 + 0.25])} o={1 - ramp(f, cl - 20, cl)} dy={14} color={on > 0.5 ? LANCE.orange300 : LANCE.offwhite}>{on > 0.5 ? "lance table · realtime engine on" : "lance table"}</T>
          <T at={pr([MEMWAL.c[0] - MEMWAL.w / 2 - 0.2, 0.05, MEMWAL.c[2]])} o={on} align="right" size={20} color={LANCE.dark100}>_mem_wal</T>
          <T at={pr([BASE.c[0] - 2.8, 0.05, BASE.c[2]])} align="right" size={20}>base</T>
          <T at={pr([FLOOR.w / 2 - 0.4, 0, -FLOOR.d / 2 + 0.4])} align="right" color={LANCE.dark100}>object storage</T>
          {["agents", "apps", "pipelines"].map((t, i) => (
            <T key={t} at={pr([CLIENTS[i][0], 0, CLIENTS[i][2] + 0.4])} o={ramp(f, cl, cl + 20)} dy={18} size={20}>{t}</T>
          ))}
          <T at={pr([GATE[0], 0, GATE[2] + 0.45])} o={ramp(f, cl, cl + 20)} dy={18} size={18}>query node</T>
          <T at={pr([NODE.c[0] - NODE.w / 2 - 0.2, nodeY, NODE.c[2]])} o={Math.min(1, nodeS)} align="right" color={LANCE.offwhite}>{f >= already + 10 ? "new RTE node" : "RTE node · memory"}</T>
          {[0, 1].map((j) => (
            <T key={j} at={pr([padPos(j, PADS, nodeY)[0], nodeY, NODE.c[2] + 0.75])} o={Math.min(1, nodeS) * ramp(f, memory - 10, memory + 8)} dy={14} size={18}>{`shard ${j + 1} · MemTable`}</T>
          ))}
          <T at={pr([padPos(1, PADS, nodeY)[0] + 0.9, nodeY + 1.0, NODE.c[2]])} o={ramp(f, indexes - 6, indexes + 10) * Math.min(1, nodeS)} align="left" color={LANCE.lavender}>live indexes</T>
          <T at={pr([heroPos[0], heroPos[1] + 0.3, heroPos[2]])} o={heroOn && f < merging - 20 ? 1 : 0} dy={-16} size={22} color={visibleNow ? LANCE.orange300 : LANCE.dark300}>{visibleNow ? "id 42" : "id 42 · not visible yet"}</T>
          <T at={pr([heroWal[0], 0.3, heroWal[2] - 0.3])} o={ramp(f, durable - 20, durable - 6) * (1 - ramp(f, memw > -999 ? memw - 20 : disk, (memw > -999 ? memw - 20 : disk) + 20))} dy={-16} size={20} color={LANCE.orange300}>WAL batch · durable in object storage</T>
          <T at={pr([CLIENTS[HERO_CLIENT][0], 1.2, CLIENTS[HERO_CLIENT][2]])} o={flash(f, durable + 34, 50)} dy={-22} color={LANCE.orange300}>ack</T>
          <T at={pr([4.9, NODE.c[1], NODE.c[2]])} o={diskIn} dy={36} size={20}>disk replicas</T>
          <T at={pr([NODE.c[0], 1.0, NODE.c[2] - 1.6])} o={ramp(f, gone0, gone0 + 10) * (1 - ramp(f, already + 10, already + 24))} dy={-10} color={LANCE.dark300}>node lost</T>
          <T at={pr([MEMWAL.c[0] - 1.0, 0.4, MEMWAL.c[2]])} o={ramp(f, already - 4, already + 10) * (1 - ramp(f, already + 90, already + 110))} dy={-30} size={24} color={LANCE.orange300}>already in the table · replayed from the WAL</T>
          {[1, 2, 3].map((g) => (
            <T key={g} at={pr([sstPos(g)[0], 0.1, sstPos(g)[2] - 0.3])} o={on * (g === 3 ? (f >= flushAt + 20 ? 1 : 0) : g === 1 ? 1 - mg : 1)} dy={-12} size={18}>{`gen ${g}`}</T>
          ))}
          <T at={pr([sstPos(3)[0] + 0.6, 0.1, sstPos(3)[2]])} o={ramp(f, flushAt + 10, flushAt + 24)} align="left" size={18} color={LANCE.dark100}>SSTables</T>
          <T at={pr([sstPos(3)[0], 0.4, sstPos(3)[2]])} o={flash(f, flushAt + 24, 60)} dy={-20} size={20} color={LANCE.orange300}>flush</T>
          <T at={pr([BASE.c[0] + 1.5, 0.3, BASE.c[2] + 0.9])} o={flash(f, merging + 84, 70)} dy={-24} size={20} color={LANCE.orange300}>merged · oldest first</T>
          <T at={pr([BASE.c[0] + 2.8, 0.6, BASE.c[2]])} o={ramp(f, updating, updating + 14) * (1 - ramp(f, every - 20, every))} align="left" size={20} color={LANCE.lavender}>index catch-up</T>
          {[0, 1].map((i) => (
            <T key={i} at={pr([WORKERS[i][0], 0, WORKERS[i][2] + 0.4])} o={wIn * ramp(f, workersCue - 10, workersCue + 10)} dy={16} size={18} color={busy(i) ? LANCE.orange300 : LANCE.dark200}>{`worker ${i + 1}`}</T>
          ))}
          <T at={pr([MEMWAL.c[0], 0.3, MEMWAL.c[2] - MEMWAL.d / 2 - 0.2])} o={mwOn * (1 - ramp(f, stores - 10, stores))} dy={-4} size={26} color={LANCE.orange300}>MemWAL · part of the open-source Lance format</T>
          <T at={pr([MEMWAL.c[0], 0.3, MEMWAL.c[2] - MEMWAL.d / 2 - 0.2])} o={mwOn * ramp(f, stores, stores + 10) * (1 - ramp(f, unlike - 10, unlike))} dy={-4} size={26} color={LANCE.orange300}>newest writes · inside the table itself</T>
          <T at={pr([MEMWAL.c[0], 0.3, MEMWAL.c[2] - MEMWAL.d / 2 - 0.2])} o={mwOn * ramp(f, unlike, unlike + 10)} dy={-4} size={26} color={LANCE.orange300}>no separate service · already in your table</T>
          <T at={pr([QP[0], QP[1] + 0.3, QP[2]])} o={qIn} dy={-20} color={LANCE.lavender}>query</T>
        </>
      )}
    >
      <Outline k={k} p={[MEMWAL.c[0], 0.05, MEMWAL.c[2]]} w={MEMWAL.w + 0.2} d={MEMWAL.d + 0.2} m={k.m.rimHot} o={mwOn > 0.5 ? 1 : 0} dash={0.12} />
      <World k={k} rimOn={on} memwal={on} baseN={merged ? 48 : 40} baseNew={merged ? 8 : 0} />
      {/* base index layer — extends over the merged rows on catch-up */}
      <Box k={k} p={[BASE.c[0], 0.56, BASE.c[2] - 2 * BASE.pitch + baseIdxD / 2]} s={[BASE.cols * BASE.pitch + 0.1, 0.04, baseIdxD]} m={k.m.lavGlass} />
      <NodeDeck k={k} y={nodeY} s={Math.min(1, nodeS)} pads={PADS} />
      {[0, 1].map((j) => (
        <React.Fragment key={"pad" + j}>
          <PadCubes k={k} j={j} pads={PADS} n={j === 0 && f >= flushAt && f < flushAt + 24 ? 0 : padN(j)} y={nodeY} lit={flash(f, lastHit[j], 10) > 0.3 ? 2 : 0} keyp={"p" + j} />
          <PadIndex k={k} j={j} pads={PADS} n={padN(j)} v={ramp(f, indexes - 8, indexes + 12) * (nodeS > 0.5 ? 1 : 0)} hit={flash(f, lastHit[j], 10)} y={nodeY} />
        </React.Fragment>
      ))}
      {/* query node gate + clients */}
      <Pillar k={k} p={GATE} h={0.6} s={ramp(f, cl, cl + 20)} />
      {CLIENTS.map((c, i) => <Pillar key={"c" + i} k={k} p={c} s={ramp(f, cl + i * 4, cl + 18 + i * 4)} lit={i === HERO_CLIENT ? flash(f, durable + 34, 24) : 0} />)}
      {flights}
      {walFiles}
      {/* hero: id 42, its WAL batch, its ack */}
      <Cube k={k} p={heroPos} s={heroOn ? 0.22 : 0} m={visibleNow ? (flash(f, durable, 30) > 0.3 ? k.m.live : k.m.done) : k.m.ghost} />
      <File k={k} p={hw < 1 ? hop([heroSlot[0], nodeY, heroSlot[2]], heroWal, hw, 0.2) : heroWal} w={heroWalShow ? 0.4 : 0} d={0.34} m={f >= durable && f < durable + 30 ? k.m.live : k.m.paper} />
      <mesh geometry={k.sphere} material={k.m.live} position={hop([heroSlot[0], nodeY + 0.4, heroSlot[2]], [CLIENTS[HERO_CLIENT][0], 1.1, CLIENTS[HERO_CLIENT][2]], ack, 1.6)} scale={ack > 0 && ack < 1 ? [0.1, 0.1, 0.1] : [1e-4, 1e-4, 1e-4]} visible={ack > 0 && ack < 1} />
      {/* disk replicas that the engine does not need */}
      {[0, 1, 2].map((i) => (
        <mesh key={"disk" + i} geometry={k.cyl} material={k.m.dim} position={[4.2 + i * 0.7, NODE.c[1] - 0.2, NODE.c[2] - 0.4 + i * 0.3]} scale={diskIn > 0.01 ? [0.28 * diskIn, 0.6 * diskIn, 0.28 * diskIn] : [1e-4, 1e-4, 1e-4]} visible={diskIn > 0.01} />
      ))}
      {/* flush: pad 0's rows compress into an SSTable that drops into _mem_wal */}
      <Box k={k} p={hop([padPos(0, PADS, nodeY)[0], nodeY + 0.4, NODE.c[2]], sstPos(3), fl, 0.4)} s={fl > 0 && fl < 1 ? [mix(1.0, 0.6, fl), mix(0.5, 0.06, fl), mix(1.0, 0.44, fl)] : 0} m={k.m.live} />
      <File k={k} p={sstPos(1)} w={on > 0.5 && mg === 0 ? 0.6 : 0} d={0.44} />
      <File k={k} p={sstPos(2)} w={on > 0.5 ? 0.6 : 0} d={0.44} />
      <File k={k} p={sstPos(3)} w={f >= flushAt + 24 ? 0.6 : 0} d={0.44} m={flash(f, flushAt + 24, 30) > 0.3 ? k.m.live : k.m.paper} />
      {/* merge: gen 1 (oldest) → base */}
      <File k={k} p={hop(sstPos(1), [BASE.c[0] + 1.5, 0.3, BASE.c[2] + 0.6], mg, 1.4)} w={mg > 0 && mg < 1 ? 0.6 : 0} d={0.44} m={k.m.live} />
      {WORKERS.map((wp, i) => (
        <React.Fragment key={"wk" + i}>
          <Pillar k={k} p={wp} s={wIn} lit={busy(i)} />
          <Rod k={k} a={[wp[0], 0.9, wp[2]]} b={i === 0 ? [sstPos(1)[0], 0.2, sstPos(1)[2] - 0.2] : [BASE.c[0] + 2, 0.6, BASE.c[2]]} m={k.m.beam} t={busy(i) * wIn} r={0.022} />
        </React.Fragment>
      ))}
      {/* every row stays searchable: one query reads MemTable + SSTables + base */}
      <Query k={k} p={QP} s={qIn} />
      <Rod k={k} a={QP} b={[padPos(0, PADS, nodeY)[0], nodeY + 0.5, NODE.c[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
      <Rod k={k} a={QP} b={[sstPos(2)[0], 0.1, sstPos(2)[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
      <Rod k={k} a={QP} b={[BASE.c[0] + 1.0, 0.6, BASE.c[2]]} m={k.m.beamLav} t={qb * qIn} r={0.025} />
    </Scene3D>
  );
};
