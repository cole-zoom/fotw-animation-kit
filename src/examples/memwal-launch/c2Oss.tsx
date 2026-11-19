import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, glide, pop, V3, Tone } from "./boldKit";
import { ROWS, Row, TitleBar, Dot, Panel, Thumb, Laptop, ScreenRow, ScreenIdle, ScreenWait, Server, Icon, W, PITCH, DroidRow, WEB, MARCO, WebRow, TextMini, ScreenText, TextRow } from "./ltable";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · Open source vs Enterprise — two lines with the same shape as "How it works",
// the camera pans from one to the other.
//
//   open source:  [your app + MemWAL in your process]  →  frames table  →  other process
//                 you (person) run the merge + index gears
//   Enterprise:   clients  →  RTE nodes (shards)  →  one table per node  →  workers that run themselves
//                 (Nov 13 review, Xuanyu: a single table can't be split across nodes today — each
//                  node serves its own table; its shards live inside that node)
//
// Text: the two section names only.
// ═══════════════════════════════════════════════════════════════════════════
const OX = 0; //     open-source line
const EX = 3400; //  Enterprise line
const APP: V3 = [OX - 1480, -60, 0];
const MEMX = OX - 980;
const PROC: V3 = [OX - 1220, -40, -20];
const TBL: V3 = [OX, -40, 0];
const OTHER: V3 = [OX + 860, -60, 0];
const YOU: V3 = [OX - 160, 420, 0];
const RCL = [-300, 0, 300].map((y) => [EX - 1320, y - 40, 0] as V3);
const NODES = [-280, 0, 280].map((y) => [EX - 560, y - 40, 0] as V3);
const ETBL: V3 = [EX + 360, -40, 0];
// one table per node, level with it: real tables frames (DROID), fineweb_edu, ms_marco
const ETABLES: { title: string; sub: string; rows: (DroidRow | TextRow)[]; kind: "droid" | "text" }[] = [
  { title: "frames", sub: "32,212 rows", rows: [ROWS[3], ROWS[4]], kind: "droid" },
  { title: "fineweb_edu", sub: "FineWeb-Edu", rows: [WEB[3], WEB[4]], kind: "text" },
  { title: "ms_marco", sub: "MS MARCO", rows: [MARCO[3], MARCO[4]], kind: "text" },
];
const nodeRow = (i: number, s: number): DroidRow | TextRow => (i === 0 ? ROWS[(s + 5) % ROWS.length] : i === 1 ? WEB[(s + 5) % WEB.length] : MARCO[(s + 5) % MARCO.length]);
const EGEAR: V3[] = [[EX + 1140, -170, 0], [EX + 1140, 90, 0]];

const MemRow: React.FC<{ r: DroidRow; tone?: Tone; lav?: number; w?: number }> = ({ r, tone: t0 = "card", lav = 0, w = 300 }) => {
  const tone: Tone = lav > 0.5 ? "big" : t0;
  const dark = tone === "hit" || tone === "big";
  return (
    <Slab w={w} h={50} d={10} tone={tone} radius={8} glow={tone === "hit" ? 0.4 : 0}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
        <Thumb k={r.wrist} w={60} r={5} />
        <Label size={20} color={dark ? LANCE.dark800 : LANCE.offwhite} fringe={dark ? 0 : 1}>{r.episode}</Label>
      </div>
    </Slab>
  );
};

/** a short table: title + n real rows */
const MiniTable: React.FC<{ p: V3; rows: number[]; lav?: number[]; hot?: number }> = ({ p, rows, lav = [], hot = -1 }) => (
  <>
    <At p={[p[0], p[1] - 230, p[2]]} name="Title bar">
      <TitleBar sub="32,212 rows" />
    </At>
    {rows.map((k, i) => (
      <At key={k + "-" + i} p={[p[0], p[1] - 130 + i * PITCH, p[2]]} name={`Row · ${ROWS[k].episode}`}>
        <Row r={ROWS[k]} lav={lav[i] ?? 0} tone={i === hot ? "hit" : "card"} />
      </At>
    ))}
  </>
);

export const OssTable: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("ossEnt");
  const own = C("own", 300);
  const other = C("other", own + 90);
  const flushed = C("flushed", other + 120);
  const yourself = C("yourself", flushed + 170);
  const production = C("production", yourself + 260);
  const thats = C("built", production + 370); //  "LanceDB Enterprise is built…" (Nov 13 pickup)
  const runs = C("scales", thats + 150); //       "It scales out with more nodes"
  const serves = C("serves", runs + 100);
  const keeps = C("keeps", serves + 230);

  const ownT = ramp(f, own - 4, own + 12) * (1 - ramp(f, own + 60, own + 80));
  const otherIn = pop(f, other - 8);
  const flushT = ramp(f, flushed - 4, flushed + 18);
  const flushedIn = f >= flushed + 18;
  const otherRead = flushedIn ? ramp(f, flushed + 18, flushed + 30) * (1 - ramp(f, flushed + 90, flushed + 110)) : 0;
  const otherBlocked = f >= other && !flushedIn;
  const maint = f >= yourself - 10 && f < production + 30;
  const youBusy = (i: number) => f > yourself && Math.floor((f - yourself) / 30) % 2 === i;
  const nodeIn = (i: number) => pop(f, production + 40 + i * 8);
  const clIn = (i: number) => pop(f, production + 60 + i * 6);
  const runsHi = ramp(f, runs - 6, runs + 8) * (1 - ramp(f, runs + 60, runs + 90));
  const serveT = ramp(f, serves - 4, serves + 16);
  const gearIn = (i: number) => pop(f, keeps - 8 + i * 6);
  const gearBusy = (i: number) => f > keeps && Math.floor((f - keeps) / 30) % 2 === i;

  const cam = camPath(f, [
    [0, { x: OX - 760, y: -40, z: 420, rx: -5, ry: 3 }],
    [own - 30, { x: OX - 760, y: -40, z: 420, rx: -5, ry: 3 }],
    [own + 10, { x: OX - 1220, y: -40, z: 160, rx: -5, ry: 3 }],
    [other - 20, { x: OX - 1220, y: -40, z: 160, rx: -5, ry: 3 }],
    [other + 20, { x: OX - 120, y: -40, z: 520, rx: -5, ry: -2 }],
    [yourself - 20, { x: OX - 120, y: -40, z: 520, rx: -5, ry: -2 }],
    [yourself + 20, { x: OX - 1300, y: -40, z: 240, rx: -5, ry: 3 }],
    [production - 20, { x: OX - 1300, y: -40, z: 240, rx: -5, ry: 3 }],
    [production + 50, { x: EX - 160, y: -40, z: 1100, rx: -5, ry: 0 }],
    [runs - 30, { x: EX - 160, y: -40, z: 1100, rx: -5, ry: 0 }],
    [runs + 10, { x: EX - 820, y: -40, z: 420, rx: -5, ry: 3 }],
    [keeps - 30, { x: EX - 820, y: -40, z: 420, rx: -5, ry: 3 }],
    [keeps + 10, { x: EX + 620, y: -40, z: 520, rx: -5, ry: -3 }],
  ]);

  return (
    <Stage name="Open source vs Enterprise · two lines" cam={cam} enter={enter} exit={exit} floorY={640}>
      {/* ══ open source ══ */}
      <At p={[OX - 660, -520, 0]} name="Section · open source">
        <Label size={44} color={LANCE.dark100}>open source</Label>
      </At>
      <At p={PROC} name="Your process">
        <Panel w={980} h={560} tone="dim" dashed={LANCE.dark400} />
      </At>
      <At p={APP} name="Your app">
        <Laptop w={340} tone={maint ? (youBusy(0) ? "live" : "big") : ownT > 0.5 ? "big" : "idle"} name="your process">
          {maint ? (
            <div style={{ display: "flex", gap: 26 }}>
              <div style={{ transform: `rotate(${youBusy(0) ? (f * 4) % 360 : 0}deg)` }}><Icon name="gear" size={70} color={youBusy(0) ? LANCE.orange300 : LANCE.dark400} /></div>
              <div style={{ transform: `rotate(${youBusy(1) ? (f * 4) % 360 : 0}deg)` }}><Icon name="gear" size={70} color={youBusy(1) ? LANCE.lavender : LANCE.dark400} /></div>
            </div>
          ) : ownT > 0.5 ? <ScreenRow r={ROWS[8]} tone="big" /> : <ScreenIdle f={f} />}
        </Laptop>
      </At>
      {[8, 9, 10].map((k, n) => (
        <At key={"mem" + k} p={[MEMX, -40 - 80 + n * 66, 20]} name="Row in memory (MemWAL)">
          <MemRow r={ROWS[k]} lav={n === 0 ? ownT : 0} tone={flushT > 0 && flushT < 1 ? "hit" : "card"} />
        </At>
      ))}
      <At p={[TBL[0], TBL[1] - 60, -90]} name="Object storage">
        <Panel w={W + 120} h={700} tone="dim" />
      </At>
      <MiniTable p={TBL} rows={flushedIn ? [0, 1, 8] : [0, 1, 2]} hot={flushedIn && f < flushed + 60 ? 2 : -1} lav={[0, 0, otherRead]} />
      <Dot a={[MEMX + 150, -40, 20]} b={[TBL[0] - W / 2, TBL[1] - 130 + 2 * PITCH, 0]} t={flushT} size={36} />
      <At p={OTHER} s={Math.max(0.01, otherIn)} o={Math.min(1, otherIn * 2)} name="Other process">
        <Laptop w={340} tone={otherRead > 0.5 ? "big" : otherBlocked ? "dim" : "idle"} name="other process">
          {otherRead > 0.5 ? <ScreenRow r={ROWS[8]} tone="big" /> : otherBlocked ? <ScreenWait f={f} /> : <ScreenIdle f={f + 5} />}
        </Laptop>
      </At>

      {/* ══ LanceDB Enterprise ══ */}
      <At p={[EX - 160, -560, 0]} name="Section · LanceDB Enterprise">
        <Label size={44} color={LANCE.orange300}>LanceDB Enterprise</Label>
      </At>
      {RCL.map((p, i) => (
        <At key={"cl" + i} p={p} s={Math.max(0.01, clIn(i))} o={Math.min(1, clIn(i) * 2)} name={`Client ${i + 1}`}>
          <Laptop w={280} tone={serveT > 0.5 && (Math.floor((f - serves) / 20) + i) % 3 === 0 ? "big" : "idle"} name={`client ${i + 1}`}>
            {serveT > 0.5 && (Math.floor((f - serves) / 20) + i) % 3 === 0 ? (i === 0 ? <ScreenRow r={nodeRow(0, 0) as DroidRow} tone="big" w={220} /> : <ScreenText r={nodeRow(i, 0) as TextRow} tone="big" w={220} />) : <ScreenIdle f={f + i * 7} />}
          </Laptop>
        </At>
      ))}
      {NODES.map((p, i) => (
        <At key={"node" + i} p={p} s={Math.max(0.01, nodeIn(i))} o={Math.min(1, nodeIn(i) * 2)} name={`RTE node ${i + 1}`}>
          <Panel w={720} h={210} tone="idle" label="RTE node" labelColor={LANCE.offwhite} d={18} glow={0.5 * runsHi}>
            <div style={{ position: "absolute", left: 24, top: 86, display: "flex", gap: 20 }}>
              {[0, 1].map((s) => {
                const r = nodeRow(i, s);
                const lav = serveT > 0.5 && s === 0 && (Math.floor((f - serves) / 20) + i) % 3 === 0 ? 1 : 0;
                return i === 0 ? <MemRow key={s} r={r as DroidRow} w={320} lav={lav} /> : <TextMini key={s} r={r as TextRow} w={320} lav={lav} />;
              })}
            </div>
          </Panel>
        </At>
      ))}
      <At p={[ETBL[0], ETBL[1] - 40, -90]} name="Object storage (Enterprise)">
        <Panel w={W + 120} h={900} tone="dim" />
      </At>
      {ETABLES.map((t, i) => (
        <React.Fragment key={"et" + i}>
          <At p={[ETBL[0], NODES[i][1] - 66, 0]} name={`Table · ${t.title} (node ${i + 1})`}>
            <TitleBar title={t.title} sub={t.sub} />
          </At>
          <At p={[ETBL[0], NODES[i][1] + 30, 0]} name={`Row · ${t.title}`}>
            {t.kind === "droid" ? <Row r={t.rows[0] as DroidRow} /> : <WebRow r={t.rows[0] as TextRow} />}
          </At>
        </React.Fragment>
      ))}
      {EGEAR.map((p, i) => (
        <At key={"eg" + i} p={p} s={Math.max(0.01, gearIn(i))} o={Math.min(1, gearIn(i) * 2)} name={`Worker ${i + 1} (managed)`}>
          <Server w={210} f={f} busy={gearBusy(i)} color={i === 0 ? LANCE.orange300 : LANCE.lavender} glow={gearBusy(i) ? 0.3 : 0} />
        </At>
      ))}
    </Stage>
  );
};
