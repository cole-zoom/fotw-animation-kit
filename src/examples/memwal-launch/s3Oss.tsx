import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition, useSceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma, Fuzz } from "./retro";
import { WhooshStreaks } from "./WhooshStreaks";
import {
  Scene3D, useKit, useF, rigPath, ramp, back, io, mix, hop, flash, slot, stack, rand,
  Box, Plate, Cube, File, Pillar, Query, Rod, Outline, T, LANCE, V3, Kit,
} from "./rte3d";

type P = { enter?: SceneTransition; exit?: SceneTransition };

const Pad: React.FC<{ k: Kit; p: V3; n: number; cols?: number; w?: number; d?: number; lit?: number; show?: boolean }> = ({ k, p, n, cols = 3, w = 1.0, d = 1.0, lit = 0, show = true }) => (
  <>
    <Plate k={k} p={p} w={show ? w : 0.001} d={show ? d : 0.001} h={0.05} m={k.m.plateHi} />
    {Array.from({ length: 36 }).map((_, i) => {
      const s = stack(i, cols, 0.24);
      return <Cube key={i} k={k} p={[p[0] + s[0], p[1] + s[1] - 0.12, p[2] + s[2]]} s={show && i < n ? 0.19 : 0} m={i >= n - lit ? k.m.live : k.m.done} />;
    })}
  </>
);

// ═══════════════════════════════════════════════════════════════════════════
// MemWal — "The Realtime Engine is built on MemWAL, which is part of the
// open-source Lance format. MemWAL stores a table's newest writes inside the
// table itself. Unlike a streaming service, a new row is already in your table
// the moment its write is confirmed."
// ═══════════════════════════════════════════════════════════════════════════
export const MemWal: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("memwal");
  const mw = C("memwall", 34);
  const stores = C("stores", 296);
  const unlike = C("unlike", 501);
  const row = C("row", 632);
  const confirmed = C("confirmed", 824);
  const rig = rigPath(f, [
    [0, { tilt: 0.5, y: -0.6, z: 2.6 }],
    [stores - 20, { tilt: 0.5, y: -0.6, z: 2.6 }],
    [stores + 30, { tilt: 0.72, y: 0.0, z: 0.8 }],
  ]);
  // phase 1: the stack
  const out = ramp(f, stores - 24, stores + 6, io);
  const lay = ramp(f, mw - 8, mw + 20, io);
  const oss = ramp(f, C("open", mw + 100) - 6, C("open", mw + 100) + 12);
  const L1 = 0.35, L2 = 0.75, L3 = 1.15;
  // phase 2: inside one Lance table
  const ins = ramp(f, stores - 6, stores + 24, back(1.2));
  const ghost = ramp(f, unlike - 8, unlike + 12);
  const ghostDown = ramp(f, unlike + 50, unlike + 90, io);
  const wt = ramp(f, row - 30, row - 6, io);
  const ok = flash(f, confirmed, 60);
  const WAL = (i: number): V3 => [-3.2 + i * 0.66, 0.06, 1.2];
  const GEN = (i: number): V3 => [0.4 + i * 0.85, 0.06, 1.2];
  const BASE: V3 = [0.6, 0.06, -0.6];
  const WR: V3 = [-5.6, 0, -1.2];
  const SVC: V3 = [-5.4, 0.4, 1.4];
  return (
    <Scene3D
      name="MemWAL in the Lance format"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([1.6, L3, 0])} o={1 - out} align="left" color={LANCE.offwhite}>realtime engine</T>
          <T at={pr([1.6, L2, 0])} o={lay * (1 - out)} align="left" size={30} color={LANCE.orange300}>MemWAL</T>
          <T at={pr([1.6, L1, 0])} o={1 - out} align="left" color={LANCE.dark100}>lance format</T>
          <T at={pr([-1.6, L1, 0])} o={oss * (1 - out)} align="right">open source</T>
          <T at={pr([-3.9, 0.06, 2.1])} o={ins} align="left" color={LANCE.offwhite}>lance table</T>
          <T at={pr([WAL(2)[0], 0, WAL(2)[2] + 0.4])} o={ins} dy={16} size={20}>WAL</T>
          <T at={pr([GEN(1)[0], 0, GEN(1)[2] + 0.4])} o={ins} dy={16} size={20}>SSTables</T>
          <T at={pr([BASE[0], 0.06, BASE[2] - 1.0])} o={ins} dy={-14} size={20}>base table</T>
          <T at={pr([WR[0], 0, WR[2] + 0.4])} o={ins} dy={18}>writer</T>
          <T at={pr([SVC[0], SVC[1], SVC[2] + 0.7])} o={ghost * (1 - ghostDown)} dy={16} size={20}>streaming service</T>
          <T at={pr([WR[0], 1.2, WR[2]])} o={ok} dy={-24} color={LANCE.orange300}>confirmed · already in the table</T>
        </>
      )}
    >
      {/* phase 1 — three slabs: the engine, on MemWAL, on the Lance format */}
      <Box k={k} p={[0, L1 - 0.15 - out * 2, 0]} s={[3.0 * (1 - out) + 0.001, 0.3, 2.0]} m={k.m.paper} />
      <Box k={k} p={[mix(-6, 0, lay), L2 - 0.15 - out * 2, 0]} s={[3.0 * (1 - out) + 0.001, 0.3, 2.0]} m={k.m.done} />
      <Box k={k} p={[0, L3 - 0.15 + (1 - lay) * -0.4 - out * 2, 0]} s={[3.0 * (1 - out) + 0.001, 0.3, 2.0]} m={k.m.plateHi} />
      {/* phase 2 */}
      <Plate k={k} p={[0, 0, 0]} w={13 * Math.min(1, ins) + 0.01} d={5.2} />
      <Plate k={k} p={[-0.2, 0.06, 0.1]} w={7.8 * Math.min(1, ins) + 0.01} d={3.8} h={0.06} m={k.m.plateHi} />
      <Outline k={k} p={[-0.2, 0.06, 0.1]} w={8.2} d={4.2} m={k.m.rimHot} o={ok > 0 ? 1 : ins * 0.6} />
      {Array.from({ length: 5 }).map((_, i) => {
        const isNew = i === 4;
        const show = ins > 0.5 && (!isNew || wt >= 1);
        return <File key={"w" + i} k={k} p={WAL(i)} w={show ? 0.5 : 0.001} d={0.5} m={isNew ? k.m.live : k.m.paper} />;
      })}
      {[0, 1, 2].map((i) => <File key={"g" + i} k={k} p={GEN(i)} w={ins > 0.5 ? 0.66 : 0.001} d={0.5} m={k.m.paper} />)}
      {Array.from({ length: 21 }).map((_, i) => {
        const s = slot(i, 7, 3, 0.4, 0.06);
        return <Cube key={"b" + i} k={k} p={[BASE[0] + s[0], s[1], BASE[2] + s[2]]} s={0.22 * Math.min(1, ins)} />;
      })}
      <Pillar k={k} p={WR} s={ins} lit={ok} />
      <Cube k={k} p={hop([WR[0], 1.0, WR[2]], WAL(4), wt, 1.4)} s={wt > 0 && wt < 1 ? 0.26 : 0.001} m={k.m.live} />
      <Plate k={k} p={[SVC[0], SVC[1] * (1 - ghostDown) + 0.01, SVC[2]]} w={1.6 * ghost + 0.01} d={1.1} h={Math.max(0.01, 0.4 * ghost * (1 - ghostDown))} m={k.m.ghost} />
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Code — "You can try MemWAL today with open-source LanceDB. Mark a primary
// key, turn on the write path, and write with upserts."
//   Flat code panel, the Ep. 05 / Ep. 06 Halloween look. Verbatim lancedb:
//   LanceTable.set_unenforced_primary_key / enable_rte (python/python/lancedb/
//   table.py; tests/test_rte_spec.py runs it on a local lancedb.connect).
// ═══════════════════════════════════════════════════════════════════════════
const KW = LANCE.orange300;
const STR = LANCE.lavender;
type Tok = [string, string?];
const CODE: { toks: Tok[]; hl?: "pk" | "path" | "upsert" }[] = [
  { toks: [["import", KW], [" lancedb"]] },
  { toks: [["from", KW], [" lancedb "], ["import", KW], [" RTEWriteSpec"]] },
  { toks: [[""]] },
  { toks: [["db = lancedb.connect("], ['"./data"', STR], [")"]] },
  { toks: [["tbl = db.create_table("], ['"events"', STR], [", schema=schema)"]] },
  { toks: [[""]] },
  { toks: [["tbl.set_unenforced_primary_key("], ['"id"', STR], [")"]], hl: "pk" },
  { toks: [["tbl.enable_rte(RTEWriteSpec.unsharded())"]], hl: "path" },
  { toks: [[""]] },
  { toks: [["tbl.merge_insert("], ['"id"', STR], [") \\"]], hl: "upsert" },
  { toks: [["   .when_matched_update_all() \\"]], hl: "upsert" },
  { toks: [["   .when_not_matched_insert_all() \\"]], hl: "upsert" },
  { toks: [["   .execute(rows)"]], hl: "upsert" },
];
export const Code: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("code");
  const pk = C("primary", 250);
  const path = C("path", 336);
  const ups = C("upserts", 407);
  const { opacity, transform, filter, whoosh } = useSceneTransition({ enter, exit });
  const lit = (h?: string) => {
    if (h === "pk") return ramp(f, pk - 6, pk + 8) * (1 - ramp(f, path - 6, path + 6));
    if (h === "path") return ramp(f, path - 6, path + 8) * (1 - ramp(f, ups - 6, ups + 6));
    if (h === "upsert") return ramp(f, ups - 6, ups + 8);
    return 0;
  };
  const any = ramp(f, pk - 6, pk + 8);
  return (
    <div name="MemWAL in open-source LanceDB" style={{ position: "absolute", inset: 0, backgroundColor: LANCE.dark800, opacity, transform, filter, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 300, top: 190, width: 1320 }}>
        <div style={{ display: "inline-block", padding: "6px 14px", background: LANCE.orange400, fontFamily: AEONIK_FONO, fontSize: 22, color: LANCE.dark800, letterSpacing: "0.12em", marginBottom: 18 }}>python · lancedb</div>
        <div style={{ background: "#0e0c0b", padding: "34px 40px", borderLeft: `4px solid ${LANCE.orange400}` }}>
          {CODE.map((ln, i) => {
            const l = lit(ln.hl);
            const dim = any > 0 && l < 0.5 ? 1 - 0.55 * any : 1;
            return (
              <div key={i} style={{ position: "relative", height: 46, display: "flex", alignItems: "center", opacity: dim }}>
                {l > 0.01 ? <div style={{ position: "absolute", left: -40, right: -40, top: 2, bottom: 2, background: `rgba(255,115,74,${0.14 * l})` }} /> : null}
                <div style={{ position: "relative", fontFamily: AEONIK_FONO, fontSize: 30, whiteSpace: "pre", color: LANCE.offwhite, textShadow: chroma(0.8) }}>
                  {ln.toks.map(([t, c], j) => (
                    <span key={j} style={{ color: c ?? LANCE.offwhite }}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Fuzz opacity={0.2} />
      <WhooshStreaks amount={whoosh} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// OssProcess — "In open source, MemWAL runs inside your process. Your process
// sees its own writes right away, and other processes see them once they're
// flushed. You run merging and index updates yourself. That works well for
// one process that owns its data. Production systems usually need many shards
// across machines, with every client reading the newest rows."
// ═══════════════════════════════════════════════════════════════════════════
export const OssProcess: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("oss");
  const own = C("own", 320);
  const other = C("other", 412);
  const flushed = C("flushed", 532);
  const merging = C("merging", 598);
  const production = C("production", 948);
  const client = C("client", production + 260);
  const rig = rigPath(f, [
    [0, { tilt: 0.64, y: -1.0, z: 1.0 }],
    [production - 30, { tilt: 0.64, y: -1.0, z: 1.0 }],
    [production + 30, { tilt: 0.66, y: -0.4, z: -0.6 }],
  ]);
  const many = ramp(f, production - 20, production + 10);
  const solo = 1 - many;
  const PR: V3 = [-2.4, 0.5, -0.9];
  const OT: V3 = [3.6, 0, -0.9];
  const GEN = (i: number): V3 => [-1.2 + i * 0.85, 0.0, 1.5];
  const n = f < flushed ? Math.min(18, Math.floor(f / 14)) : Math.max(0, 18 - Math.floor((f - flushed) / 1.2));
  const flushT = ramp(f, flushed, flushed + 24, io);
  const ownB = ramp(f, own - 12, own + 4);
  const otherB = ramp(f, other - 10, other + 6);
  const sees = f >= flushed + 24;
  const mine = ramp(f, merging - 6, merging + 12);
  return (
    <Scene3D
      name="Open source: in your process"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([PR[0], PR[1], PR[2] + 1.1])} o={solo} dy={16} color={LANCE.offwhite}>your process · MemWAL</T>
          <T at={pr([PR[0], 1.6, PR[2]])} o={ownB * solo} dy={-20} color={LANCE.lavender}>sees its own writes</T>
          <T at={pr([OT[0], 0, OT[2] + 0.4])} o={otherB * solo} dy={18}>other process</T>
          <T at={pr([OT[0], 1.3, OT[2]])} o={otherB * solo} dy={-22} color={sees ? LANCE.lavender : LANCE.dark300}>{sees ? "sees them once flushed" : "waits for a flush"}</T>
          <T at={pr([GEN(1)[0], 0, GEN(1)[2] + 0.4])} o={solo} dy={16} size={20}>Lance table · object storage</T>
          <T at={pr([PR[0], 0.5, PR[2] - 1.0])} o={mine * solo} dy={-14} size={22} color={LANCE.orange300}>you run merges + index updates</T>
          {Array.from({ length: 12 }).map((_, i) => (
            <T key={i} at={pr([-4.5 + (i % 4) * 3.0, 0.3, -2.0 + Math.floor(i / 4) * 1.75 + 0.62])} o={many * ramp(f, production + i * 4, production + i * 4 + 14)} dy={12} size={16}>{`machine ${i + 1}`}</T>
          ))}
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={14 * solo + 0.01} d={5.4} />
      {/* one process */}
      <Plate k={k} p={[PR[0], PR[1] * solo + 0.01, PR[2]]} w={2.6 * solo + 0.01} d={1.8} h={Math.max(0.01, 0.5 * solo)} m={k.m.plateHi} rim={solo > 0.5 ? 1 : 0} />
      <Pad k={k} p={PR} n={n} cols={4} w={1.4} d={1.4} lit={f < flushed ? 2 : 0} show={solo > 0.02} />
      <Query k={k} p={[PR[0] + 0.9, 1.5, PR[2]]} s={ownB * solo} />
      <Rod k={k} a={[PR[0] + 0.9, 1.5, PR[2]]} b={[PR[0] + 0.2, 0.8, PR[2]]} m={k.m.beamLav} t={ownB * solo} r={0.025} />
      {[0, 1].map((i) => <File key={"g" + i} k={k} p={GEN(i)} w={0.66} d={0.5} m={k.m.paper} />)}
      <File k={k} p={flushT > 0 && flushT < 1 ? hop([PR[0], 0.7, PR[2]], GEN(2), flushT, 0.8) : GEN(2)} w={0.66} d={0.5} m={flushT > 0 ? k.m.live : k.m.ghost} />
      <Pillar k={k} p={OT} s={otherB * solo} lit={sees ? 1 : 0} />
      <Rod k={k} a={[OT[0], 0.95, OT[2]]} b={[GEN(2)[0] + 0.2, 0.1, GEN(2)[2]]} m={sees ? k.m.beamLav : k.m.beamDim} t={otherB * solo} r={0.025} />
      {/* production: many shards across machines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const p: V3 = [-4.5 + (i % 4) * 3.0, 0.3, -2.0 + Math.floor(i / 4) * 1.75];
        const v = ramp(f, production + i * 4, production + i * 4 + 14, back(1.5)) * many;
        return (
          <React.Fragment key={"m" + i}>
            <Plate k={k} p={[p[0], p[1] * Math.min(1, v) + 0.01, p[2]]} w={2.4 * Math.min(1, v) + 0.01} d={1.2} h={Math.max(0.01, 0.3 * Math.min(1, v))} m={k.m.plateHi} rim={v > 0.5 ? 1 : 0} />
            <Pad k={k} p={[p[0] - 0.55, p[1], p[2]]} n={6 + ((f >> 3) + i * 3) % 10} w={0.9} d={0.8} show={v > 0.5} />
            <Pad k={k} p={[p[0] + 0.55, p[1], p[2]]} n={4 + ((f >> 3) + i * 5) % 12} w={0.9} d={0.8} show={v > 0.5} />
          </React.Fragment>
        );
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const v = ramp(f, client - 20 + i * 3, client - 4 + i * 3) * many;
        const p: V3 = [-5.2 + i * 1.3, 0, 3.4];
        const tgt = i % 12;
        return (
          <React.Fragment key={"c" + i}>
            <Pillar k={k} p={p} s={v * 0.8} lit={flash(f, client + i * 7 + Math.floor((f - client) / 30) * 30, 12)} />
            <Rod k={k} a={[p[0], 0.75, p[2]]} b={[-4.5 + (tgt % 4) * 3.0, 0.6, -2.0 + Math.floor(tgt / 4) * 1.75 + 1.75 * 2]} m={k.m.beamLav} t={v} r={0.018} />
          </React.Fragment>
        );
      })}
    </Scene3D>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Enterprise — "That's what the Realtime Engine in LanceDB Enterprise handles.
// It runs shards across nodes, serves the newest rows to every client within
// milliseconds, and keeps merging and indexing running for you."
// ═══════════════════════════════════════════════════════════════════════════
export const Enterprise: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("enterprise");
  const runs = C("runs", 256);
  const serves = C("serves", 362);
  const keeps = C("keeps", 591);
  const rig = rigPath(f, [
    [0, { tilt: 0.62, y: -0.4, z: 0.4 }],
    [keeps - 20, { tilt: 0.62, y: -0.4, z: 0.4 }],
    [keeps + 30, { tilt: 0.7, y: -0.2, z: 0.6, x: -0.6 }],
  ]);
  const ND = (i: number): V3 => [-3.8 + i * 3.2, 0.5, -1.0];
  const nIn = (i: number) => ramp(f, 6 + i * 8, 28 + i * 8, back(1.4)); // nodes up from the first frame; "runs shards" fills them
  const wk = ramp(f, keeps - 8, keeps + 10);
  const busy = (i: number) => (f > keeps ? (Math.floor((f - keeps) / 26 + i) % 2 === 0 ? 1 : 0) : 0);
  const BASE: V3 = [5.6, 0.06, 1.3];
  return (
    <Scene3D
      name="Realtime Engine in Enterprise"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([ND(1)[0], 1.7, ND(1)[2] - 0.6])} dy={-10} size={26} color={LANCE.orange300}>realtime engine · LanceDB Enterprise</T>
          {[0, 1, 2].map((i) => (
            <T key={i} at={pr([ND(i)[0], ND(i)[1], ND(i)[2] + 1.0])} o={nIn(i)} dy={14} size={20} color={LANCE.offwhite}>{`RTE node ${i + 1}`}</T>
          ))}
          <T at={pr([0, 0, 2.9])} o={ramp(f, C("milliseconds", serves + 120) - 6, C("milliseconds", serves + 120) + 10)} dy={26}>newest rows · every client · milliseconds</T>
          <T at={pr([5.6, 0, -1.6])} o={wk} dy={18} size={20}>workers</T>
          <T at={pr([BASE[0], 0.06, BASE[2] + 0.75])} o={wk} dy={16} size={20}>base table</T>
        </>
      )}
    >
      <Plate k={k} p={[0, 0, 0]} w={14.5} d={5.6} />
      {[0, 1, 2].map((i) => (
        <React.Fragment key={"n" + i}>
          <Plate k={k} p={[ND(i)[0], ND(i)[1] * Math.min(1, nIn(i)) + 0.01, ND(i)[2]]} w={2.7} d={1.6} h={Math.max(0.01, 0.5 * Math.min(1, nIn(i)))} m={k.m.plateHi} rim={nIn(i) > 0.5 ? 1 : 0} />
          <Pad k={k} p={[ND(i)[0] - 0.6, ND(i)[1], ND(i)[2]]} n={f < runs ? 3 : 5 + Math.floor(f / (9 + i)) % 13} w={1.0} d={1.0} lit={2} show={nIn(i) > 0.5} />
          <Pad k={k} p={[ND(i)[0] + 0.6, ND(i)[1], ND(i)[2]]} n={f < runs ? 2 : 3 + Math.floor(f / (11 + i)) % 15} w={1.0} d={1.0} lit={2} show={nIn(i) > 0.5} />
        </React.Fragment>
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const p: V3 = [-5.4 + i * 1.45, 0, 2.2];
        const v = ramp(f, serves - 30 + i * 3, serves - 12 + i * 3);
        const pulse = f >= serves ? flash(f, serves + ((i * 13) % 30) + Math.floor((f - serves - ((i * 13) % 30)) / 30) * 30, 14) : 0;
        const tgt = ND(i % 3);
        return (
          <React.Fragment key={"c" + i}>
            <Pillar k={k} p={p} s={v * 0.8} lit={pulse} />
            <Rod k={k} a={[p[0], 0.75, p[2]]} b={[tgt[0], tgt[1] + 0.1, tgt[2] + 0.8]} m={pulse > 0.2 ? k.m.beam : k.m.beamDim} t={v} r={0.018} />
          </React.Fragment>
        );
      })}
      {[0, 1].map((i) => (
        <React.Fragment key={"w" + i}>
          <Pillar k={k} p={[4.9 + i * 1.4, 0, -1.6]} s={wk} lit={busy(i)} />
          <Rod k={k} a={[4.9 + i * 1.4, 0.9, -1.6]} b={[BASE[0], 0.3, BASE[2]]} m={k.m.beam} t={busy(i) * wk} r={0.022} />
        </React.Fragment>
      ))}
      <Plate k={k} p={BASE} w={1.8} d={1.2} h={0.06} m={k.m.plateHi} />
      {Array.from({ length: 12 }).map((_, i) => {
        const s = slot(i, 4, 3, 0.36, 0.06);
        return <Cube key={"b" + i} k={k} p={[BASE[0] + s[0], s[1], BASE[2] + s[2]]} s={0.2 * wk} m={i < 4 && busy(0) ? k.m.done : k.m.idle} />;
      })}
    </Scene3D>
  );
};
