import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, glide, pop, mix, V3, Tone } from "./boldKit";
import { ROWS, Row, TitleBar, Heads, Dot, Panel, Thumb, Laptop, ScreenRow, ScreenIdle, Server, Drive, Icon, W, PITCH, DroidRow } from "./ltable";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · How it works — ONE LINE, the camera walks it:
//
//   client 1-3  →  RTE node (memory: 2 shards)  →  frames table: base rows + _mem_wal  →  workers
//
// Every write is a real row. A row lands in a shard's memory; its WAL batch then
// lands in the table's own _mem_wal — you SEE the same rows there. Only then is
// the row visible (ghost → solid) and the client gets its ✓. Merging moves the
// oldest _mem_wal rows up into the base rows. The final query lights matching
// rows in memory, in _mem_wal and in the base — all lavender, no lines.
//
// Nov 17 (Xuanyu #1, after the blog's "Realtime Engine in LanceDB Enterprise" figure): _mem_wal/{shard_id}/ holds
// BOTH the WAL — log entries (each carries its batch's rows) that make a write durable before the ack — AND the
// flushed MemTables, {random8}_gen_{n}/. The WAL row fills as writes are acked; memory flushes drop rows into
// gen_1 / gen_2; merging moves gen_1 into the base rows and its folder goes away.
// ═══════════════════════════════════════════════════════════════════════════
const CL: V3[] = [[-2060, -330, 0], [-2060, -20, 0], [-2060, 290, 0]];
const NODE: V3 = [-1180, -40, 30];
const NODE_W = 640;
const NODE_H = 520;
const TX = 0;
const TITLE_Y = -420;
const HEAD_Y = -342;
const Y0 = -270;
const MW_Y = 175;
const MW_H = 300;
const SRV: V3[] = [[880, -180, 0], [880, 140, 0]];
const SHX = (j: number) => NODE[0] + (j === 0 ? -150 : 150);
const SLOT_Y = (k: number) => NODE[1] - 128 + k * 58;
// _mem_wal layout: a wal/ strip of log entries on top, two gen folders below
const WAL_Y = MW_Y - MW_H / 2 + 56; // Cole: path on ONE line — "_mem_wal/{shard_id}/wal/" then its entries
const ENT_X = (n: number) => TX - W / 2 + 520 + n * 96;
const GEN_Y = WAL_Y + 135;
const GEN_X = (g: number) => TX + (g === 0 ? -236 : 236);
const GEN_W = 450;
const GCHIP_X = (g: number, i: number) => GEN_X(g) + (i === 0 ? -106 : 106);
const GCHIP_Y = GEN_Y + 22;
const HERO = 95;
const rowOf = (w: number) => 3 + (w % 90);

const Chip: React.FC<{ r: DroidRow; tone?: Tone; glow?: number; ghost?: boolean; w?: number }> = ({ r, tone = "card", glow = 0, ghost = false, w = 210 }) => {
  const dark = tone === "hit" || tone === "live" || tone === "big";
  return (
    <div style={{ borderRadius: 8, opacity: ghost ? 0.45 : 1, outline: ghost ? `3px dashed ${LANCE.dark300}` : undefined, outlineOffset: 2 }}>
      <Slab w={w} h={46} d={10} tone={tone} radius={8} glow={glow}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
          <Thumb k={r.wrist} w={56} r={5} />
          <Label size={17} color={dark ? LANCE.dark800 : LANCE.offwhite} fringe={dark ? 0 : 1}>{r.episode}</Label>
        </div>
      </Slab>
    </div>
  );
};

export const EngineTable: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("engine");
  const turn = C("turn", 14);
  const nodes = C("nodes", 120);
  const memory = C("memory", 420);
  const indexes = C("indexes", 480);
  const acked = C("acknowledged", 770);
  const durable = C("durable", acked + 60);
  const memw = C("memwall", durable + 220);
  const disk = C("disk", memw + 860);
  const replicate = C("replicate", disk + 60);
  const merging = C("merging", replicate + 70);
  const updating = C("updating", merging + 130);
  const plans = C("plans", updating + 280);
  const every = C("every", plans + 150);

  const on = ramp(f, turn, turn + 18);
  const mwOpen = glide(f, turn + 6, 90);
  const nodeIn = pop(f, nodes - 6);
  const clIn = (i: number) => pop(f, nodes + 6 + i * 6);

  // ── writes: client (w % 3) → shard (w % 2); WAL batches of 3 land in _mem_wal/wal/ as one log entry ──
  const writeAt: number[] = [];
  for (let a = nodes + 40; a < every + 200; a += 11) {
    if (a > acked - 70 && a < durable + 50) continue;
    writeAt.push(a);
  }
  const inMem = (w: number) => writeAt[w] + 20;
  const batchLand = (w: number) => writeAt[Math.min(writeAt.length - 1, Math.floor(w / 3) * 3 + 2)] + 44;
  const lastW = writeAt.reduce((m, a, w) => (f >= a ? w : m), -1);

  // hero: client 2 writes row 95; its WAL batch lands on "durable"
  const hA = acked - 40;
  const heroFly = ramp(f, hA, hA + 20);
  const heroInMem = f >= hA + 20;
  const visibleNow = f >= durable;
  const walFly = ramp(f, hA + 22, durable); // Nov 17 (Xuanyu): WAL write starts as soon as the row reaches the node — no buffer phase
  const ackT = ramp(f, durable + 6, durable + 30);
  const acked2 = f >= durable + 30 && f < durable + 110;

  // wal/: one log entry per WAL batch (3 rows), plus the hero's own entry on "durable"; newest first
  const MERGE_AT = merging + 50;
  type Ent = { id: number; ks: number[]; at: number; hero?: boolean };
  const ents: Ent[] = writeAt.map((_, w) => w).filter((w) => w % 3 === 2).map((w) => ({ id: 0, ks: [rowOf(w - 2), rowOf(w - 1), rowOf(w)], at: batchLand(w) }));
  ents.push({ id: 0, ks: [HERO], at: durable, hero: true });
  ents.sort((a, b) => a.at - b.at).forEach((e, i) => (e.id = 41 + i));
  const walShown = ents.filter((e) => f >= e.at).reverse().slice(0, 5);
  // {random8}_gen_{n}/: memory flushes on "stores" (gen 1) and just before "row" (gen 2), 2 rows each
  const FL = [memw + 40, C("row", memw + 370) - 50];
  const durableRows = (t: number) => writeAt.map((_, w) => w).filter((w) => batchLand(w) <= t).map(rowOf);
  const GEN: number[][] = [durableRows(FL[0]).slice(-2)];
  GEN.push(durableRows(FL[1]).filter((k) => !GEN[0].includes(k)).slice(-2));
  const mergedK = GEN[0]; // compaction merges gen 1 into the base rows
  const mg = ramp(f, MERGE_AT, MERGE_AT + 34);
  const merged = f >= MERGE_AT + 34;

  const catchup = ramp(f, updating + 4, updating + 44);
  const srvIn = (i: number) => pop(f, merging - 10 + i * 6);
  const busy = (i: number) => (f >= MERGE_AT - 10 && f < MERGE_AT + 40 ? i === 0 : f >= updating && f < updating + 50 ? i === 1 : f > plans ? Math.floor((f - plans) / 34) % 2 === i : false);
  const q = ramp(f, every - 6, every + 20);
  const mwHi = ramp(f, memw - 6, memw + 12) * (1 - ramp(f, disk - 20, disk));
  const diskIn = pop(f, disk - 8) * (1 - ramp(f, replicate + 40, replicate + 70));
  const diskX = ramp(f, replicate, replicate + 16);

  const cam = camPath(f, [
    [0, { x: 0, y: -60, z: 140, rx: -4, ry: -3 }],
    [nodes - 20, { x: 0, y: -60, z: 140, rx: -4, ry: -3 }],
    [nodes + 30, { x: -1560, y: -20, z: 520, rx: -4, ry: 3 }],
    [memory - 20, { x: -1560, y: -20, z: 520, rx: -4, ry: 3 }],
    [memory + 20, { x: -1180, y: -60, z: 60, rx: -4, ry: 2 }],
    [acked - 50, { x: -1180, y: -60, z: 60, rx: -4, ry: 2 }],
    [acked - 10, { x: -1000, y: -20, z: 820, rx: -4, ry: 0 }],
    [memw - 14, { x: -1000, y: -20, z: 820, rx: -4, ry: 0 }],
    [memw + 26, { x: 0, y: 60, z: 80, rx: -6, ry: -2 }],
    [disk - 20, { x: 0, y: 60, z: 80, rx: -6, ry: -2 }],
    [disk + 10, { x: -1180, y: 60, z: 280, rx: -4, ry: 3 }],
    [merging - 20, { x: -1180, y: 60, z: 280, rx: -4, ry: 3 }],
    [merging + 20, { x: 380, y: -40, z: 320, rx: -4, ry: -3 }],
    [every - 20, { x: 380, y: -40, z: 320, rx: -4, ry: -3 }],
    [every + 30, { x: -620, y: -30, z: 1400, rx: -4, ry: 0 }],
  ]);

  // base rows; merged rows arrive below and push the stack up
  const shift = 2 * glide(f, MERGE_AT + 30, 120);
  const baseOut: React.ReactNode[] = [];
  [0, 1, 2].forEach((k, i) => {
    const py = Y0 + (i - shift) * PITCH;
    const o = Math.max(0, Math.min(1, (py - (HEAD_Y + 20)) / 70));
    if (o < 0.01) return;
    baseOut.push(
      <At key={"b" + k} p={[TX, py, 0]} o={o} name={`Base row · ${ROWS[k].episode}`}>
        <Row r={ROWS[k]} lav={i === 2 ? q : 0} />
      </At>,
    );
  });
  mergedK.forEach((k, n) => {
    if (!merged && mg <= 0) return;
    const settle = ramp(f, MERGE_AT + 90, MERGE_AT + 130);
    baseOut.push(
      <At key={"mg" + k} p={[TX, Y0 + (3 + n - shift) * PITCH, 0]} o={ramp(f, MERGE_AT + 20, MERGE_AT + 34)} name={`Merged row · ${ROWS[k].episode}`}>
        <Row r={ROWS[k]} tone={settle < 0.5 ? "hit" : "card"} glow={0.6 * (1 - settle)} lav={n === 1 ? q : 0} />
      </At>,
    );
  });

  return (
    <Stage name="How it works · one line" cam={cam} enter={enter} exit={exit} floorY={640}>
      {/* ── 1 · many clients ── */}
      {CL.map((p, i) => {
        const myLast = writeAt.reduce((m, a, w) => (w % 3 === i && f >= a ? w : m), -1);
        const sending = myLast >= 0 && f - writeAt[myLast] < 16 && f < every - 6;
        const isHero = i === 1 && f >= hA - 20 && f < durable + 110;
        const querying = i === 0 && f >= every - 6;
        const tone = querying ? (q > 0.6 ? "big" : "idle") : isHero ? (acked2 ? "live" : "live") : sending ? "live" : "idle";
        return (
          <At key={"cl" + i} p={p} s={Math.max(0.01, clIn(i))} o={Math.min(1, clIn(i) * 2)} name={`Client ${i + 1}`}>
            <Laptop w={280} tone={tone} glow={isHero && acked2 ? 0.5 : 0} name={`client ${i + 1}`}>
              {querying ? (q > 0.6 ? <ScreenRow r={ROWS[2]} tone="big" w={220} /> : <ScreenIdle f={f} />) : isHero ? (acked2 ? <Icon name="check" size={80} color={LANCE.orange300} /> : <ScreenRow r={ROWS[HERO]} w={220} />) : sending ? <ScreenRow r={ROWS[rowOf(myLast)]} w={220} /> : <ScreenIdle f={f + i * 11} />}
            </Laptop>
          </At>
        );
      })}
      {writeAt.map((a, w) => (
        <Dot key={"wd" + w} a={[CL[w % 3][0] + 140, CL[w % 3][1], 0]} b={[SHX(w % 2), NODE[1] - 200, 40]} t={ramp(f, a, a + 20)} size={20} />
      ))}
      <Dot a={[CL[1][0] + 140, CL[1][1], 0]} b={[SHX(0), SLOT_Y(0), 40]} t={heroFly} size={32} />
      <Dot a={[SHX(0), SLOT_Y(0), 40]} b={[CL[1][0] + 140, CL[1][1], 0]} t={ackT} size={32} />

      {/* ── 2 · RTE node: memory ── */}
      <At p={NODE} s={Math.max(0.01, nodeIn)} o={Math.min(1, nodeIn * 2)} name="RTE node">
        <Panel w={NODE_W} h={NODE_H} label="RTE node" labelColor={LANCE.offwhite} tone="idle" />
      </At>
      {[0, 1].map((j) => {
        const rs = writeAt.map((_, w) => w).filter((w) => w % 2 === j && f >= inMem(w));
        const heroHere = j === 0 && heroInMem;
        return (
          <React.Fragment key={"sh" + j}>
            <At p={[SHX(j), NODE[1] - 172, 50]} o={ramp(f, indexes - 6, indexes + 10) * nodeIn} name={`Shard ${j + 1} live index`}>
              <div style={{ width: 260, height: 8, borderRadius: 8, background: LANCE.lavender, boxShadow: `0 0 ${rs.length && f - inMem(rs[rs.length - 1]) < 10 ? 26 : 10}px ${LANCE.lavender}` }} />
            </At>
            {rs.slice(-5).reverse().map((w, n) => {
              const slot = n + (heroHere ? 1 : 0);
              if (slot > 4) return null;
              const fresh = f - inMem(w) < 12;
              return (
                <At key={"m" + w} p={[SHX(j), SLOT_Y(slot), 50]} o={nodeIn} name="Row in memory">
                  <Chip r={ROWS[rowOf(w)]} w={260} ghost={f < batchLand(w)} tone={q > 0.6 && slot === 0 ? "big" : f >= batchLand(w) && f - batchLand(w) < 12 ? "hit" : "card"} glow={f >= batchLand(w) && f - batchLand(w) < 12 ? 0.5 : 0} />
                </At>
              );
            })}
            {heroHere && (
              <At p={[SHX(0), SLOT_Y(0), 52]} name="Hero row (ghost until durable)">
                <Chip r={ROWS[HERO]} w={260} ghost={!visibleNow} tone={q > 0.6 ? "big" : visibleNow && f < durable + 30 ? "hit" : "card"} glow={visibleNow && f < durable + 30 ? 0.7 : 0} />
              </At>
            )}
            {heroHere && f < durable + 110 && (
              <At p={[NODE[0] - NODE_W / 2 - 24, SLOT_Y(0), 56]} o={ramp(f, hA + 20, hA + 30) * (1 - ramp(f, durable + 90, durable + 110))} anchor="right" name="Hero tag · pending / durable">
                <Label size={40} weight={700} color={visibleNow ? LANCE.orange300 : LANCE.dark300}>{visibleNow ? "✓ in the table" : "pending…"}</Label>
              </At>
            )}
          </React.Fragment>
        );
      })}
      {[0, 1, 2].map((i) => (
        <At key={"disk" + i} p={[NODE[0] - 210 + i * 210, NODE[1] + NODE_H / 2 + 120, 30]} s={Math.max(0.01, diskIn)} o={Math.min(1, diskIn * 2)} name="Disk (not needed)">
          <div style={{ position: "relative" }}>
            <Drive w={170} />
            <div style={{ position: "absolute", left: -14, right: -14, top: "50%", height: 8, borderRadius: 8, background: LANCE.orange300, transform: `rotate(-20deg) scaleX(${diskX})` }} />
          </div>
        </At>
      ))}

      {/* ── 3 · the table on object storage ── */}
      <At p={[TX, -60, -90]} name="Object storage">
        <Panel w={W + 140} h={900} tone="dim" />
      </At>
      <At p={[TX, TITLE_Y, 0]} name="Title bar">
        <TitleBar
          sub="32,212 rows"
          glow={0.5 * ramp(f, turn, turn + 8) * (1 - ramp(f, turn + 30, turn + 60))}
          right={
            <div style={{ width: 84, height: 44, borderRadius: 44, background: on > 0.5 ? LANCE.orange300 : LANCE.dark500, position: "relative" }}>
              <div style={{ position: "absolute", top: 6, left: mix(6, 46, on), width: 32, height: 32, borderRadius: 32, background: LANCE.offwhite }} />
            </div>
          }
        />
      </At>
      <At p={[TX, HEAD_Y, 0]} name="Column heads">
        <Heads />
      </At>
      <At p={[TX - W / 2, HEAD_Y + 34, 4]} anchor="left" name="Base index">
        <div style={{ width: W * mix(0.78, 1, catchup), height: 6, borderRadius: 6, background: LANCE.lavender, boxShadow: `0 0 18px ${LANCE.lavender}`, opacity: 0.85 }} />
      </At>
      {baseOut}
      <At p={[TX, MW_Y, 6]} s={Math.max(0.01, mwOpen)} o={Math.min(1, mwOpen * 2)} name="_mem_wal">
        <div style={{ borderRadius: 24, boxShadow: mwHi > 0.01 ? `0 0 0 ${5 * mwHi}px ${LANCE.orange300}, 0 0 ${60 * mwHi}px rgba(255,115,74,${0.5 * mwHi})` : undefined }}>
          <Panel w={W} h={MW_H} tone="card" d={14} />
        </div>
      </At>
      {/* wal/ — log entries; each carries its batch's rows and is written before the write is acknowledged */}
      <At p={[TX - W / 2 + 34, WAL_Y, 14]} o={mwOpen} anchor="left" name="wal/ label">
        <Label size={30} color={LANCE.orange300}>_mem_wal/{"{shard_id}"}/wal/</Label>
      </At>
      {walShown.map((e, n) => {
        const fresh = f - e.at < 24;
        const live = e.hero && f < durable + 60;
        const tone: Tone = live ? "live" : fresh ? "hit" : "card";
        const dark = tone !== "card";
        return (
          <At key={"ent" + e.id} p={[ENT_X(n), WAL_Y, 14]} o={ramp(f, e.at, e.at + 6) * mwOpen} name={`WAL entry ${e.id}`}>
            <Slab w={86} h={58} d={8} tone={tone} radius={8} glow={live ? 0.8 : fresh ? 0.4 : 0}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <Label size={15} color={dark ? LANCE.dark800 : LANCE.dark200} fringe={0}>{String(e.id).padStart(4, "0")}</Label>
                <div style={{ display: "flex", gap: 3 }}>{e.ks.map((k, i) => <Thumb key={i} k={ROWS[k].wrist} w={e.hero ? 34 : 24} r={3} />)}</div>
              </div>
            </Slab>
          </At>
        );
      })}
      {/* {random8}_gen_{n}/ — MemTables flushed from the node's memory */}
      {GEN.map((ks, g) => {
        const gIn = pop(f, FL[g]) * (g === 0 ? 1 - ramp(f, MERGE_AT + 34, MERGE_AT + 60) : 1);
        if (gIn < 0.01) return null;
        return (
          <React.Fragment key={"gen" + g}>
            <At p={[GEN_X(g), GEN_Y, 12]} s={Math.max(0.01, gIn)} o={Math.min(1, gIn * 2) * mwOpen} name={`gen_${g + 1}/ folder`}>
              <Panel w={GEN_W} h={150} tone="dim" label={g === 0 ? "a3f9c2e1_gen_1/" : "7d04be92_gen_2/"} sub="flushed" labelColor={LANCE.offwhite} d={8} />
            </At>
            {ks.map((k, i) => {
              if (g === 0 && merged) return null;
              const fresh = f - FL[g] < 24;
              return (
                <At key={"gc" + k} p={[GCHIP_X(g, i), GCHIP_Y, 16]} o={ramp(f, FL[g], FL[g] + 6) * mwOpen} name={`Row in gen_${g + 1}`}>
                  <Chip r={ROWS[k]} w={200} tone={q > 0.6 ? "big" : fresh ? "hit" : "card"} glow={fresh ? 0.4 : 0} />
                </At>
              );
            })}
            {ks.map((k, i) => (
              <Dot key={"fl" + k} a={[SHX(g % 2), SLOT_Y(2), 50]} b={[GCHIP_X(g, i), GCHIP_Y, 16]} t={ramp(f, FL[g] - 26 + i * 4, FL[g] + i * 4)} size={30} />
            ))}
          </React.Fragment>
        );
      })}
      {/* WAL batches flying from the node down into _mem_wal */}
      {writeAt.map((_, w) => {
        if (w % 3 !== 2) return null;
        const a = batchLand(w);
        return <Dot key={"wal" + w} a={[NODE[0] + NODE_W / 2 - 40, NODE[1] + NODE_H / 2 - 40, 30]} b={[ENT_X(0), WAL_Y, 14]} t={ramp(f, a - 24, a)} size={30} />;
      })}
      <Dot a={[SHX(0), SLOT_Y(0), 50]} b={[ENT_X(0), WAL_Y, 14]} t={walFly} size={40} />
      {/* Nov 17 (Xuanyu): the memory copy and the table copy are the SAME row — dashed link while it's acknowledged */}
      {(() => {
        const lk = ramp(f, durable + 4, durable + 20) * (1 - ramp(f, durable + 130, durable + 150));
        if (lk < 0.01) return null;
        // ends at the start of the "_mem_wal/{shard_id}/wal/" line (its entry glows on that line) so it never crosses the table rows
        const A: V3 = [SHX(0) + 130, SLOT_Y(0) + 20, 52], B: V3 = [TX - W / 2 - 40, WAL_Y, 16];
        const L = (t: number): V3 => [mix(A[0], B[0], t), mix(A[1], B[1], t), mix(A[2], B[2], t)];
        return (
          <>
            {Array.from({ length: 16 }, (_, i) => (
              <At key={"lk" + i} p={L((i + 0.5) / 16)} o={lk * (i / 16 <= ramp(f, durable + 4, durable + 20) ? 1 : 0)} name="Same-row link">
                <div style={{ width: 18, height: 18, borderRadius: 18, background: LANCE.orange300 }} />
              </At>
            ))}
            <At p={[mix(A[0], B[0], 0.5) + 30, mix(A[1], B[1], 0.5) - 40, 40]} o={lk} anchor="left" name="Same-row tag">
              <Label size={40} weight={700} color={LANCE.orange300}>same row</Label>
            </At>
          </>
        );
      })()}
      {/* merge: the two oldest _mem_wal rows rise into the base rows */}
      {mergedK.map((k, n) => (
        <Dot key={"mgd" + k} a={[GCHIP_X(0, n), GCHIP_Y, 16]} b={[TX - 300, Y0 + (3 + n) * PITCH - 2 * PITCH, 0]} t={mg} size={34} />
      ))}

      {/* ── 4 · workers ── */}
      {SRV.map((p, i) => (
        <At key={"srv" + i} p={p} s={Math.max(0.01, srvIn(i))} o={Math.min(1, srvIn(i) * 2)} name={`Worker ${i + 1}`}>
          <Server w={210} f={f} busy={busy(i)} color={i === 0 ? LANCE.orange300 : LANCE.lavender} glow={busy(i) ? 0.35 : 0} />
        </At>
      ))}
    </Stage>
  );
};
