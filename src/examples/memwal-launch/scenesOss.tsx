import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, Chip, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { Client, Row, Card, Storage, Tile, FillBar, BaseTable, Wire, Mark, Tag, inn, fly, flash } from "./rteKit";
import { cueOf } from "./cues";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// MemWal — "The Realtime Engine is built on MemWAL, which is part of the
// open-source Lance format. MemWAL stores a table's newest writes inside the
// table itself. Unlike a streaming service, a new row is already in your table
// the moment its write is confirmed."
// ═══════════════════════════════════════════════════════════════════════════
export const MemWal: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("memwal");
  const mw = C("memwall", 30);
  const stores = C("stores", 200);
  const unlike = C("unlike", 420);
  const confirmed = C("confirmed", 600);
  const cam = camPath(f, [
    [0, { z: 40, rx: -4 }],
    [stores - 20, { z: 40, rx: -4 }],
    [stores + 30, { z: 120, y: 60, rx: -8 }],
  ]);
  const stack = 1 - inn(f, stores - 20, 24);
  const layer = glide(f, mw - 6);
  const oss = inn(f, C("open", mw + 60) - 6, 14);
  const inside = inn(f, stores - 10, 24);
  const ghost = inn(f, unlike - 6, 16);
  const ghostX = inn(f, unlike + 40, 10);
  const write = C("row", unlike + 80) - 10;
  const okV = inn(f, confirmed - 2, 10);
  return (
    <Stage name="MemWAL in the Lance format" cam={cam} enter={enter} exit={exit} floorY={460}>
      {/* the stack: Realtime Engine on MemWAL on the Lance format */}
      <div style={{ opacity: stack }}>
        <At p={[0, -260, 0]}>
          <Slab w={820} h={130} d={30} tone="card" radius={16} style={{ border: `3px solid ${LANCE.orange400}` }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
              <Label size={46} mono={false}>
                Realtime Engine
              </Label>
              <Label size={24} color={LANCE.dark300} fringe={0}>
                LanceDB Enterprise
              </Label>
            </div>
          </Slab>
        </At>
        <At p={[0, -80 + (1 - layer) * 120, (1 - layer) * -80]} o={layer}>
          <Slab w={820} h={130} d={30} tone="hit" radius={16} glow={0.5}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
              <Label size={52} mono={false} color={LANCE.dark800} fringe={0}>
                MemWAL
              </Label>
            </div>
          </Slab>
        </At>
        <At p={[0, 100, 0]}>
          <Slab w={820} h={130} d={30} tone="paper" radius={16}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
              <Label size={46} mono={false} color={LANCE.dark800} fringe={0}>
                Lance format
              </Label>
              <div style={{ opacity: oss }}>
                <Label size={26} color={LANCE.dark600} fringe={0}>
                  open source
                </Label>
              </div>
            </div>
          </Slab>
        </At>
      </div>
      {/* inside the table: WAL, SSTables, base table — all one Lance table */}
      <div style={{ opacity: inside }}>
        <At p={[160, 60, -20]}>
          <Storage w={1300} h={560} title="Lance table" sub="object storage">
            <div style={{ position: "absolute", left: 40, top: 170 }}>
              <Label size={26} color={LANCE.dark100} fringe={0}>
                write-ahead log
              </Label>
              <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const isNew = i === 4 && f >= write + 24;
                  return <div key={i} style={{ width: 70, height: 70, borderRadius: 10, background: isNew ? LANCE.orange400 : LANCE.dark100, opacity: i === 4 && !isNew ? 0.15 : 1, boxShadow: isNew ? "0 0 20px rgba(255,115,74,0.7)" : undefined }} />;
                })}
              </div>
            </div>
            <div style={{ position: "absolute", left: 560, top: 170 }}>
              <Label size={26} color={LANCE.dark100} fringe={0}>
                SSTables · newest writes
              </Label>
              <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                {[3, 2, 1].map((g) => (
                  <div key={g} style={{ width: 100, height: 70, borderRadius: 10, background: "#3a332e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Label size={22} color={LANCE.dark100} fringe={0}>{`gen ${g}`}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, height: 120, borderRadius: 16, background: "#0e0c0b", display: "flex", alignItems: "center", padding: "0 30px" }}>
              <Label size={32} mono={false} color={LANCE.offwhite}>
                base table, with its own indexes
              </Label>
            </div>
          </Storage>
        </At>
        <At p={[-660, -330, 40]}>
          <Client text="writer" w={220} />
        </At>
        {f >= write && f < write + 26 ? (
          <At p={fly(f, [-560, -320, 40], [-300, -20, 40], write, 26, 80)}>
            <Row w={70} h={70} glow={0.6} />
          </At>
        ) : null}
        <Mark p={[-660, -440, 70]} ok v={okV} size={56} />
        {/* the streaming service it doesn't need */}
        <At p={[-700, 180, 30]} o={ghost * (1 - 0.6 * ghostX)}>
          <Card w={360} h={200} title="streaming service" titleSize={28} dashed />
        </At>
        <Mark p={[-700, 180, 80]} ok={false} v={ghostX} size={70} />
      </div>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Code — "You can try MemWAL today with open-source LanceDB. Mark a primary
// key, turn on the write path, and write with upserts."
//   Verbatim against lancedb (python/python/lancedb/table.py: LanceTable.
//   set_unenforced_primary_key, enable_rte; tests/test_rte_spec.py runs it on
//   a local lancedb.connect). The upsert form is the one an RTE table accepts.
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
export const Code: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("code");
  const pk = C("primary", 180);
  const path = C("path", 240);
  const ups = C("upserts", 300);
  const cam = camPath(f, [
    [0, { z: 80, ry: -8, rx: -3 }],
    [ups + 60, { z: -20, ry: -3, rx: -2 }],
  ]);
  const cardIn = pop(f, 0, 120, 18);
  const lit = (h?: string) => {
    if (h === "pk") return inn(f, pk - 6, 12) * (1 - inn(f, path - 6, 12));
    if (h === "path") return inn(f, path - 6, 12) * (1 - inn(f, ups - 6, 12));
    if (h === "upsert") return inn(f, ups - 6, 12);
    return 0;
  };
  const anyLit = inn(f, pk - 6, 12);
  return (
    <Stage name="MemWAL in open-source LanceDB" cam={cam} enter={enter} exit={exit} floorY={480}>
      <At p={[0, -10, 0]} o={Math.min(1, cardIn * 1.4)} s={0.9 + 0.1 * cardIn}>
        <Slab w={1240} h={760} d={34} tone="card" radius={22} style={{ background: "linear-gradient(180deg, #1f1b19, #171513)" }}>
          <div style={{ position: "absolute", left: 40, top: 30, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: LANCE.orange400 }}>
              <Label size={22} color={LANCE.dark800} fringe={0}>
                python
              </Label>
            </div>
            <Label size={22} color={LANCE.dark300} fringe={0}>
              pip install lancedb · open source
            </Label>
          </div>
          <div style={{ position: "absolute", left: 40, top: 100, right: 40 }}>
            {CODE.map((ln, i) => {
              const l = lit(ln.hl);
              const dim = anyLit > 0 && !ln.hl ? 1 - 0.55 * anyLit : ln.hl && l < 0.5 && anyLit > 0 ? 1 - 0.45 * anyLit : 1;
              return (
                <div key={i} style={{ position: "relative", height: 47, display: "flex", alignItems: "center", opacity: dim }}>
                  {l > 0.01 ? <div style={{ position: "absolute", left: -16, right: -16, top: 2, bottom: 2, borderRadius: 8, background: `rgba(255,115,74,${0.16 * l})`, borderLeft: `5px solid rgba(255,115,74,${l})` }} /> : null}
                  <div style={{ position: "relative", fontFamily: AEONIK_FONO, fontSize: 31, whiteSpace: "pre", color: LANCE.offwhite, textShadow: chroma(0.6) }}>
                    {ln.toks.map(([t, c], j) => (
                      <span key={j} style={{ color: c ?? LANCE.offwhite }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Slab>
      </At>
    </Stage>
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
  const f = useCurrentFrame();
  const C = cueOf("oss");
  const own = C("own", 140);
  const other = C("other", 200);
  const flushed = C("flushed", 260);
  const merging = C("merging", 330);
  const works = C("works", 420);
  const production = C("production", 500);
  const cam = camPath(f, [
    [0, { z: 40, rx: -4 }],
    [production - 30, { z: 40, rx: -4 }],
    [production + 30, { z: 80, y: 0, rx: -4 }],
  ]);
  const P1: V3 = [-300, -150, 0];
  const P2: V3 = [500, -150, 0];
  const ownT = ramp(f, own - 16, own + 4);
  const otherIn = inn(f, other - 12, 14);
  const flushT = f >= flushed;
  const flushV = ramp(f, flushed - 4, flushed + 26);
  const yours = inn(f, merging - 6, 14);
  const many = inn(f, production - 10, 30);
  return (
    <Stage name="Open source: in your process" cam={cam} enter={enter} exit={exit} floorY={460}>
      <At p={[0, 260, -60]} o={1 - many}>
        <Storage w={1600} h={220} title="Lance table" sub="object storage">
          <div style={{ position: "absolute", left: 520, top: 70, display: "flex", gap: 14 }}>
            {[1, 2].map((g) => (
              <div key={g} style={{ width: 110, height: 80, borderRadius: 10, background: "#3a332e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Label size={22} color={LANCE.dark100} fringe={0}>{`gen ${g}`}</Label>
              </div>
            ))}
            {flushT ? (
              <div style={{ width: 110, height: 80, borderRadius: 10, background: LANCE.orange400, opacity: flushV, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Label size={22} color={LANCE.dark800} fringe={0}>gen 3</Label>
              </div>
            ) : null}
          </div>
        </Storage>
      </At>
      <At p={P1} o={1 - many}>
        <Card w={600} h={330} title="your process" accent>
          <div style={{ position: "absolute", left: 30, top: 110, right: 30, height: 110, borderRadius: 14, border: `2px solid ${LANCE.dark500}`, padding: 20, boxSizing: "border-box" }}>
            <Label size={30} mono={false}>
              MemWAL
            </Label>
            <div style={{ marginTop: 18 }}>
              <FillBar w={500} v={flushT ? mix(0.7, 0.05, flushV) : 0.2 + ramp(f, 0, flushed) * 0.5} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 30, bottom: 26, opacity: yours, display: "flex", gap: 12 }}>
            {["merge", "index updates"].map((t) => (
              <div key={t} style={{ padding: "6px 14px", borderRadius: 8, border: `2px solid ${LANCE.orange300}` }}>
                <Label size={20} color={LANCE.orange300} fringe={0}>
                  {`you run: ${t}`}
                </Label>
              </div>
            ))}
          </div>
        </Card>
      </At>
      <Mark p={[P1[0] + 270, P1[1] - 140, 50]} ok v={inn(f, own, 10) * (1 - many)} size={54} />
      <At p={[P1[0] + 120, P1[1] - 210, 40]} o={ownT * (1 - many)}>
        <Tag size={24} color={LANCE.offwhite}>
          sees its own writes · right away
        </Tag>
      </At>
      <At p={P2} o={otherIn * (1 - many)}>
        <Card w={480} h={220} title="other process" titleSize={34} />
      </At>
      <Wire a={[P2[0] - 100, P2[1] + 110, 0]} b={[P2[0] - 100, 160, 0]} dash o={otherIn * (1 - many)} color={flushV >= 1 ? LANCE.lavender : LANCE.dark400} />
      <At p={[P2[0], P2[1] + 160, 40]} o={otherIn * (1 - many)}>
        <Tag size={24} color={flushV >= 1 ? LANCE.lavender : LANCE.dark300}>
          {flushV >= 1 ? "sees them once flushed" : "waits for a flush"}
        </Tag>
      </At>
      {/* production: many shards across machines, every client reading the newest rows */}
      <div style={{ opacity: many }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const v = pop(f, production + i * 4, 150, 16);
          return (
            <At key={i} p={[-630 + col * 420, -360 + row * 225, 0]} o={Math.min(1, v * 1.4)} s={0.8 + 0.2 * v}>
              <Card w={320} h={200} title={`machine ${i + 1}`} titleSize={28}>
                <div style={{ position: "absolute", left: 24, top: 90, display: "flex", gap: 10 }}>
                  {[0, 1].map((k) => (
                    <div key={k} style={{ width: 128, height: 70, borderRadius: 10, background: "#3a332e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Label size={18} color={LANCE.dark100} fringe={0}>{`shard ${i * 2 + k + 1}`}</Label>
                    </div>
                  ))}
                </div>
              </Card>
            </At>
          );
        })}
        {Array.from({ length: 9 }).map((_, i) => (
          <At key={"c" + i} p={[-760 + i * 190, 380, 30]} o={inn(f, C("client", production + 90) - 10 + i * 2, 12)}>
            <Client text="client" w={150} h={66} size={24} />
          </At>
        ))}
      </div>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Enterprise — "That's what the Realtime Engine in LanceDB Enterprise handles.
// It runs shards across nodes, serves the newest rows to every client within
// milliseconds, and keeps merging and indexing running for you."
// ═══════════════════════════════════════════════════════════════════════════
export const Enterprise: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("enterprise");
  const runs = C("runs", 140);
  const serves = C("serves", 220);
  const keeps = C("keeps", 400);
  const cam = camPath(f, [
    [0, { z: 200, rx: -5 }],
    [keeps - 20, { z: 160, rx: -5 }],
    [keeps + 30, { z: 140, x: 160, y: -20, rx: -4 }],
  ]);
  const head = pop(f, 0, 140, 16);
  const nodeIn = (k: number) => pop(f, runs - 6 + k * 6, 150, 16);
  const srv = f >= serves;
  const wk = inn(f, keeps - 6, 16);
  const busy = (k: number) => (f > keeps ? (Math.floor((f - keeps) / 24 + k) % 3 === 0 ? 1 : 0.3) : 0);
  return (
    <Stage name="Realtime Engine in Enterprise" cam={cam} enter={enter} exit={exit} floorY={500}>
      <At p={[0, -470, 40]} o={Math.min(1, head * 1.4)}>
        <Slab w={800} h={100} d={20} tone="card" radius={50} style={{ border: `3px solid ${LANCE.orange400}` }} glow={0.4}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Label size={40} mono={false}>
              Realtime Engine
            </Label>
            <Label size={26} color={LANCE.dark300} fringe={0}>
              in LanceDB Enterprise
            </Label>
          </div>
        </Slab>
      </At>
      {[0, 1, 2].map((k) => (
        <At key={k} p={[-560 + k * 440, -170, 0]} o={Math.min(1, nodeIn(k) * 1.4)} s={0.85 + 0.15 * nodeIn(k)}>
          <Card w={400} h={260} title={`RTE node ${k + 1}`} titleSize={30} accent>
            {[0, 1].map((j) => (
              <div key={j} style={{ position: "absolute", left: 30, top: 100 + j * 64, display: "flex", alignItems: "center", gap: 14 }}>
                <Label size={20} color={LANCE.dark100} fringe={0} style={{ width: 110 }}>{`shard ${k * 2 + j + 1}`}</Label>
                <FillBar w={210} v={0.2 + ((f / (80 + j * 30 + k * 20)) % 0.7)} />
              </div>
            ))}
          </Card>
        </At>
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = -840 + i * 240;
        const lit = srv ? flash(f, serves + ((i * 7) % 5) * 6 + Math.floor((f - serves) / 40) * 40, 18) : 0;
        return (
          <React.Fragment key={i}>
            <At p={[x, 220, 20]} o={inn(f, serves - 30 + i * 3, 12)}>
              <Client text="client" w={170} h={70} size={24} glow={lit} />
            </At>
            <Wire a={[x, 180, 10]} b={[-560 + (i % 3) * 440, -40, 10]} dash o={inn(f, serves - 30 + i * 3, 12) * 0.8} color={lit > 0.2 ? LANCE.orange300 : LANCE.dark500} />
          </React.Fragment>
        );
      })}
      <At p={[0, 330, 40]} o={inn(f, C("milliseconds", serves + 80) - 6, 14)}>
        <Tag size={28} color={LANCE.offwhite}>
          newest rows · every client · milliseconds
        </Tag>
      </At>
      {[0, 1, 2].map((k) => (
        <At key={"w" + k} p={[860, -260 + k * 130, 0]} o={wk}>
          <Card w={300} h={100} title={["merge", "index", "merge"][k]} titleSize={28} glow={busy(k) * 0.6} accent={busy(k) > 0.5} dashed={k === 2} />
        </At>
      ))}
      <At p={[860, 160, 20]} o={wk}>
        <Tag size={22}>workers · run for you</Tag>
      </At>
    </Stage>
  );
};
