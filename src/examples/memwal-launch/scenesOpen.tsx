import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, Chip, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { Client, Row, Card, Storage, Tile, Readout, Wire, Mark, Tag, inn, fly, flash } from "./rteKit";
import { cueOf } from "./cues";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// OpenTable — "Your data stays in open Lance tables on object storage.
// It's available now in LanceDB Enterprise."
//   writes stream from a client into a Lance table; another client reads each
//   one right after. "open" tags the table, "storage" tilts down onto object
//   storage under it, "Enterprise" lands the badge.
// ═══════════════════════════════════════════════════════════════════════════
export const OpenTable: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("openTable");
  const WR: V3 = [-640, -60, 0];
  const RD: V3 = [640, -60, 0];
  const TB: V3 = [0, -70, 0];
  const cam = camPath(f, [
    [0, { z: 40, y: -20 }],
    [C("storage", 120) - 10, { z: 0, y: 0, rx: -2 }],
    [C("storage", 120) + 40, { z: 60, y: 70, rx: -9 }],
    [C("enterprise", 260) - 20, { z: 60, y: 50, rx: -7 }],
    [C("enterprise", 260) + 30, { z: 120, y: 0, rx: -4 }],
  ]);
  const N = 18;
  const at = (i: number) => 4 + i * 19;
  let landed = 0;
  let hitT = -999;
  for (let i = 0; i < N; i++) if (f >= at(i) + 20) { landed++; hitT = at(i) + 20; }
  const tableFlash = flash(f, hitT, 14);
  const readFlash = flash(f, hitT + 8, 16);
  const openV = inn(f, C("open", 50) - 4, 16);
  const storeV = inn(f, C("storage", 120) - 8, 24);
  const entV = pop(f, C("enterprise", 260) - 6, 150, 15);
  return (
    <Stage name="Open Lance table" cam={cam} enter={enter} exit={exit} floorY={430}>
      <At p={[0, 300, -80]} o={0.35 + 0.65 * storeV}>
        <Storage w={1560} h={210} glow={storeV * 0.25} sub="S3 · GCS · Azure" />
      </At>
      <Wire a={[WR[0] + 120, WR[1], -2]} b={[TB[0] - 260, TB[1] + 10, -2]} dash />
      <Wire a={[TB[0] + 260, TB[1] + 10, -2]} b={[RD[0] - 130, RD[1], -2]} dash color={readFlash > 0 ? LANCE.orange300 : LANCE.dark400} />
      <At p={WR}>
        <Client text="writer" w={230} />
      </At>
      <At p={RD}>
        <Client text="reader" w={230} glow={readFlash} />
      </At>
      <At p={TB}>
        <Card w={520} h={380} title="Lance table" sub={openV > 0.02 ? "open format" : undefined} accent glow={tableFlash * 0.6}>
          {Array.from({ length: Math.min(landed + 4, 12) }).map((_, i) => {
            const isNew = i >= 4;
            const k = 11 - i;
            return (
              <div key={i} style={{ position: "absolute", left: 30 + (k % 3) * 156, top: 110 + Math.floor(k / 3) * 62 }}>
                <div style={{ width: 140, height: 44, borderRadius: 8, background: isNew ? LANCE.orange400 : LANCE.dark500, boxShadow: isNew ? "0 0 12px rgba(255,115,74,0.5)" : undefined }} />
              </div>
            );
          })}
        </Card>
      </At>
      {Array.from({ length: N }).map((_, i) => {
        const a = at(i);
        if (f < a || f > a + 20) return null;
        return (
          <At key={i} p={fly(f, [WR[0] + 100, WR[1], 20], [TB[0] - 180, TB[1], 20], a, 20, 70)}>
            <Row w={110} h={38} glow={0.6} />
          </At>
        );
      })}
      {Array.from({ length: N }).map((_, i) => {
        const a = at(i) + 22;
        if (f < a || f > a + 16) return null;
        return (
          <At key={"r" + i} p={fly(f, [TB[0] + 180, TB[1], 20], [RD[0] - 110, RD[1], 20], a, 16, 50)} o={0.85}>
            <Row w={90} h={30} glow={0.4} />
          </At>
        );
      })}
      <At p={[0, -390, 60]} o={Math.min(1, entV * 1.4)} s={0.85 + 0.15 * entV}>
        <Slab w={760} h={96} d={20} tone="card" radius={48} glow={0.5 * entV} style={{ border: `3px solid ${LANCE.orange400}` }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <Label size={30} color={LANCE.dark200} fringe={0}>
              available now in
            </Label>
            <Label size={40} mono={false} color={LANCE.offwhite}>
              LanceDB Enterprise
            </Label>
          </div>
        </Slab>
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LakeIntro (version B only) — "Lakehouse formats like Iceberg and Delta Lake
// store huge amounts of data cheaply on object storage. They weren't built for
// data that arrives every millisecond. New rows can take seconds or minutes
// before readers see them."
// ═══════════════════════════════════════════════════════════════════════════
const tilesFor = (n: number, cols: number, x0: number, y0: number, s = 46, g = 8) =>
  Array.from({ length: n }).map((_, i) => [x0 + (i % cols) * (s + g), y0 - Math.floor(i / cols) * (s + g)] as [number, number]);

export const LakeIntro: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("lakeIntro");
  const cam = camPath(f, [
    [0, { z: 80, y: 30, rx: -8 }],
    [C("millisecond", 260) - 30, { z: 40, y: 10, rx: -6 }],
    [C("millisecond", 260) + 20, { z: 20, y: -30, rx: -3 }],
  ]);
  const ice = pop(f, C("iceberg", 30) - 4, 140, 16);
  const del = pop(f, C("delta", 50) - 4, 140, 16);
  const huge = ramp(f, C("huge", 80) - 6, C("cheaply", 120) + 10);
  const store = inn(f, C("storage", 150) - 8, 20);
  const rain = f >= C("millisecond", 260) - 8;
  const wait = ramp(f, C("seconds", 360) - 4, C("minutes", 400) + 20);
  const waitIn = inn(f, C("seconds", 360) - 50, 16);
  const secs = Math.round(mix(0, 180, wait));
  const label = secs < 60 ? `${secs}` : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <Stage name="Lakehouse on object storage" cam={cam} enter={enter} exit={exit} floorY={430}>
      <At p={[0, 300, -60]} o={0.4 + 0.6 * store}>
        <Storage w={1600} h={200} glow={store * 0.3} />
      </At>
      <At p={[-360, 0, 0]} o={Math.min(1, ice * 1.5)} s={0.8 + 0.2 * ice}>
        <Card w={560} h={420} title="Iceberg">
          {tilesFor(Math.round(8 + huge * 32), 8, 34, 340).map(([x, y], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 50, height: 46, borderRadius: 6, background: LANCE.dark500 }} />
          ))}
        </Card>
      </At>
      <At p={[360, 0, 0]} o={Math.min(1, del * 1.5)} s={0.8 + 0.2 * del}>
        <Card w={560} h={420} title="Delta Lake">
          {tilesFor(Math.round(8 + huge * 32), 8, 34, 340).map(([x, y], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 50, height: 46, borderRadius: 6, background: LANCE.dark500 }} />
          ))}
        </Card>
      </At>
      {rain &&
        Array.from({ length: 40 }).map((_, i) => {
          const a = C("millisecond", 260) - 8 + i * 4;
          const t = (f - a) / 26;
          if (t < 0) return null;
          const x = ((i * 337) % 1100) - 550;
          const y = mix(-620, -270, Math.min(1, t));
          const stack = Math.min(1, t) >= 1;
          return (
            <At key={i} p={[x, stack ? -270 - (i % 3) * 10 : y, 40]} o={stack ? 0.55 : 1}>
              <Row w={70} h={26} glow={stack ? 0.1 : 0.5} />
            </At>
          );
        })}
      <At p={[0, -270, 30]} o={rain ? 1 : 0}>
        <div style={{ width: 1200, height: 6, background: `repeating-linear-gradient(90deg, ${LANCE.dark300} 0 18px, transparent 18px 30px)` }} />
      </At>
      <At p={[640, -430, 60]} o={waitIn}>
        <Client text="reader" w={220} />
      </At>
      <At p={[490, -430, 60]} o={waitIn} anchor="right">
        <Readout value={label} unit={secs < 60 ? "s" : "min"} size={72} color={LANCE.orange300} sub="before readers see new rows" />
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Lakehouse — "They make a change visible by committing a new table version.
// That works well for hourly batch jobs, but when rows arrive every
// millisecond, it doesn't. Committing every few rows piles up metadata files,
// and writers fight over the next version number."
//   (version A also covers "Lakehouse formats like Iceberg and Delta Lake…")
// ═══════════════════════════════════════════════════════════════════════════
export const Lakehouse: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("lakehouse");
  const visible = C("visible", -999);
  const hourly = C("hourly", 200);
  const ms = C("millisecond", 300);
  const piles = C("piles", 400);
  const writers = C("writers", 500);
  const cam = camPath(f, [
    [0, { z: 80, y: 20, rx: -6 }],
    [Math.max(10, visible + 10), { z: 20, y: 0, rx: -4 }],
    [piles - 20, { z: 20, y: 0, rx: -4 }],
    [piles + 30, { z: 140, x: 160, y: -20, rx: -4 }],
    [writers + 10, { z: 140, x: 160, y: -20, rx: -4 }],
    [writers + 50, { z: 60, x: 120, y: -60, rx: -3 }],
  ]);
  // table versions: v1..v3 standing, v4 on "committing"
  const commitAt = C("committing", visible + 30);
  const versions = 3 + (f >= commitAt ? 1 : 0);
  const v4 = glide(f, commitAt - 4, 120);
  // hourly: one commit, a clock ticks once
  const hourV = inn(f, hourly - 6, 14);
  const hourOut = 1 - inn(f, ms - 20, 14);
  // every ms: rows rain + tiny commits; version counter races
  const raceT = Math.max(0, f - ms);
  const racing = f >= ms;
  const verNum = 4 + (racing ? Math.floor(raceT / 3) : 0);
  // metadata pile
  const pileN = f < piles - 30 ? 0 : Math.min(160, Math.floor((f - (piles - 30)) * 1.6));
  // writers fight
  const fight = inn(f, writers - 6, 16);
  const clash = C("fight", writers + 20);
  const clashT = ramp(f, clash - 14, clash + 4);
  const xV = inn(f, clash + 2, 10);
  const nextV = verNum + 1;
  return (
    <Stage name="Lakehouse commits" cam={cam} enter={enter} exit={exit} floorY={440}>
      <At p={[0, 320, -60]}>
        <Storage w={1700} h={190} />
      </At>
      {/* the table's versions, a stack of slabs */}
      <At p={[-420, 0, 0]}>
        <Card w={560} h={460} title="table" sub={`v${verNum}`}>
          {Array.from({ length: versions }).map((_, i) => {
            const isNew = i === 3;
            const y = 380 - i * 74 - (isNew ? (1 - v4) * 160 : 0);
            return (
              <div key={i} style={{ position: "absolute", left: 40, top: y, width: 480, height: 58, borderRadius: 10, background: isNew ? LANCE.orange400 : LANCE.dark500, opacity: isNew ? v4 : 1, display: "flex", alignItems: "center", paddingLeft: 18, boxSizing: "border-box" }}>
                <Label size={24} color={isNew ? LANCE.dark800 : LANCE.dark100} fringe={0}>
                  {`v${i + 1}`}
                </Label>
              </div>
            );
          })}
        </Card>
      </At>
      {/* hourly batch: a clock and one fat commit */}
      <At p={[200, -40, 0]} o={hourV * hourOut}>
        <Card w={300} h={180} title="every hour">
          <div style={{ position: "absolute", left: 30, top: 100 }}>
            <Label size={28} color={LANCE.dark200} fringe={0}>
              1 commit
            </Label>
          </div>
        </Card>
      </At>
      {/* every millisecond: rows racing in, each forcing a commit */}
      {racing &&
        Array.from({ length: 60 }).map((_, i) => {
          const a = ms + i * 3;
          const t = (f - a) / 18;
          if (t < 0 || t > 1) return null;
          return (
            <At key={i} p={fly(f, [560, -360 + (i % 5) * 40, 20], [-160, -60 + (i % 4) * 30, 20], a, 18, 30)}>
              <Row w={60} h={22} glow={0.4} />
            </At>
          );
        })}
      {/* metadata files piling up */}
      {Array.from({ length: pileN }).map((_, i) => {
        const col = i % 16;
        const row = Math.floor(i / 16);
        return (
          <At key={"m" + i} p={[60 + col * 44, 250 - row * 40 - (i % 3) * 3, 10 + (i % 5) * 4]} r={[0, 0, ((i * 37) % 13) - 6]}>
            <Tile s={36} tone="paper" />
          </At>
        );
      })}
      <At p={[400, 320, 40]} o={pileN > 0 ? 1 : 0}>
        <Tag size={28}>metadata files</Tag>
      </At>
      {/* two writers reach for the same next version */}
      <At p={[100, -420, 40]} o={fight}>
        <Client text="writer 1" w={220} h={84} size={32} />
      </At>
      <At p={[820, -420, 40]} o={fight}>
        <Client text="writer 2" w={220} h={84} size={32} />
      </At>
      <At p={[460, -250, 40]} o={fight} s={1 + 0.06 * Math.sin(clashT * Math.PI)}>
        <Chip text={`v${nextV}`} tone={clashT > 0.9 ? "hit" : "idle"} size={44} glow={clashT > 0.9 ? 0.6 : 0} />
      </At>
      <Wire a={[100, -370, 30]} b={[440, -260, 30]} t={clashT} color={LANCE.orange300} o={fight} />
      <Wire a={[820, -370, 30]} b={[480, -260, 30]} t={clashT} color={LANCE.orange300} o={fight} />
      <Mark p={[860, -320, 60]} ok={false} v={xV} size={60} />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Batch — "Batching rows into bigger commits fixes the metadata problem. The
// issue here is that readers wait seconds or minutes to see new data."
// ═══════════════════════════════════════════════════════════════════════════
export const Batch: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("batch");
  const fixes = C("fixes", 120);
  const readers = C("readers", 250);
  const cam = camPath(f, [
    [0, { z: 60, rx: -5 }],
    [readers - 20, { z: 60, rx: -5 }],
    [readers + 30, { z: 10, x: 140, y: -40, rx: -3 }],
  ]);
  // rows fill a batch, commit at "commits", again later
  const fillA = ramp(f, 0, C("commits", 100));
  const commit = (at: number) => glide(f, at, 120);
  const c1 = commit(C("commits", 100));
  const fillB = f > C("commits", 100) + 20 ? ramp(f, C("commits", 100) + 20, C("commits", 100) + 600) : 0;
  const pile = Math.round(mix(64, 1, inn(f, fixes - 4, 30)));
  const waitIn = inn(f, readers - 10, 16);
  const wait = ramp(f, C("seconds", readers + 40) - 4, C("minutes", readers + 80) + 30);
  const secs = Math.round(mix(0, 180, wait));
  const label = secs < 60 ? `${secs}` : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const fill = f < C("commits", 100) ? fillA : fillB;
  return (
    <Stage name="Batching commits" cam={cam} enter={enter} exit={exit} floorY={440}>
      <At p={[0, 320, -60]}>
        <Storage w={1700} h={190} />
      </At>
      <At p={[-420, 0, 0]}>
        <Card w={560} h={460} title="table">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 40, top: 380 - i * 74, width: 480, height: 58, borderRadius: 10, background: LANCE.dark500 }} />
          ))}
          <div style={{ position: "absolute", left: 40, top: 380 - 3 * 74 - (1 - c1) * 200, width: 480, height: 58, borderRadius: 10, background: LANCE.orange400, opacity: c1 }} />
        </Card>
      </At>
      {/* the batch tray */}
      <At p={[260, -40, 0]}>
        <Card w={420} h={300} title="batch" dashed>
          {Array.from({ length: Math.round(fill * 20) }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 30 + (i % 5) * 74, top: 230 - Math.floor(i / 5) * 40, width: 64, height: 30, borderRadius: 6, background: LANCE.orange400, opacity: 0.9 }} />
          ))}
        </Card>
      </At>
      {/* rows trickling in */}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = i * 14;
        if (f < a || f > a + 20) return null;
        return (
          <At key={i} p={fly(f, [800, -300, 20], [300, -40, 20], a, 20, 40)}>
            <Row w={60} h={22} glow={0.4} />
          </At>
        );
      })}
      {/* metadata pile shrinks */}
      {Array.from({ length: pile }).map((_, i) => (
        <At key={"m" + i} p={[60 + (i % 16) * 44, 250 - Math.floor(i / 16) * 40, 10]}>
          <Tile s={36} tone="paper" />
        </At>
      ))}
      <At p={[640, -420, 60]} o={waitIn}>
        <Client text="reader" w={220} />
      </At>
      <At p={[640, -300, 60]} o={waitIn} anchor="top">
        <Readout value={label} unit={secs < 60 ? "s" : "min"} size={80} color={LANCE.orange300} sub="waiting for the next commit" />
      </At>
    </Stage>
  );
};
