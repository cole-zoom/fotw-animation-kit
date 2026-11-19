import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, Chip, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { Client, Row, Card, Storage, Tile, Wire, Mark, Tag, inn, fly, flash } from "./rteKit";
import { cueOf } from "./cues";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// Stream — "Another option is to put a streaming service in front of the
// table. The service holds new rows in its own storage and copies them into
// the table later. However, until it does, the only durable copy of a new row
// lives in a separate system and not in your table."
// ═══════════════════════════════════════════════════════════════════════════
export const Stream: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("stream");
  const svcIn = pop(f, C("streaming", 60) - 6, 140, 16);
  const holds = C("holds", 200);
  const copies = C("copies", 330);
  const until = C("until", 520);
  const cam = camPath(f, [
    [0, { z: 100, y: 0, rx: -5 }],
    [until - 20, { z: 100, rx: -5 }],
    [until + 30, { z: -60, x: -120, y: -10, rx: -3 }],
  ]);
  const WR: V3 = [-760, -120, 0];
  const SV: V3 = [-160, -120, 0];
  const TB: V3 = [560, 20, 0];
  // rows into the service log
  const logN = f < holds - 10 ? 0 : Math.min(12, Math.floor((f - (holds - 10)) / 12));
  const copied = f >= copies + 20;
  const moveT = ramp(f, copies, copies + 30);
  const only = inn(f, C("only", until + 50) - 6, 18);
  const sepFlash = flash(f, C("separate", until + 140), 30);
  return (
    <Stage name="Streaming service in front" cam={cam} enter={enter} exit={exit} floorY={440}>
      <At p={[0, 330, -70]}>
        <Storage w={1800} h={180} />
      </At>
      <At p={WR}>
        <Client text="writer" w={220} />
      </At>
      <Wire a={[WR[0] + 110, WR[1], -2]} b={[SV[0] - 250, SV[1], -2]} dash o={svcIn} />
      <At p={SV} o={Math.min(1, svcIn * 1.4)} s={0.85 + 0.15 * svcIn}>
        <Card w={500} h={380} title="streaming service" titleSize={34} glow={sepFlash * 0.7}>
          <div style={{ position: "absolute", left: 30, top: 96 }}>
            <Label size={22} color={LANCE.dark300} fringe={0}>
              its own storage
            </Label>
          </div>
          {Array.from({ length: logN }).map((_, i) => {
            const gone = copied && i < 8;
            return (
              <div key={i} style={{ position: "absolute", left: 30 + (i % 4) * 112, top: 150 + Math.floor(i / 4) * 64, width: 100, height: 48, borderRadius: 8, background: LANCE.orange400, opacity: gone ? 0.15 : 1, boxShadow: gone ? undefined : "0 0 12px rgba(255,115,74,0.5)" }} />
            );
          })}
          {only > 0.01 ? (
            <div style={{ position: "absolute", inset: 10, borderRadius: 16, border: `4px dashed ${LANCE.orange300}`, opacity: only }} />
          ) : null}
        </Card>
      </At>
      {/* writes into the service */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = holds - 30 + i * 12;
        if (f < a || f > a + 18) return null;
        return (
          <At key={i} p={fly(f, [WR[0] + 90, WR[1], 20], [SV[0] - 140, SV[1] + 20, 20], a, 18, 40)}>
            <Row w={70} h={26} glow={0.5} />
          </At>
        );
      })}
      {/* the late copy into the table */}
      {f >= copies && f < copies + 32 ? (
        <At p={fly(f, [SV[0] + 120, SV[1] + 40, 30], [TB[0] - 80, TB[1] + 40, 30], copies, 30, 90)}>
          <Slab w={220} h={100} d={18} tone="hit" radius={12} glow={0.6} />
        </At>
      ) : null}
      <At p={TB}>
        <Card w={460} h={420} title="table" accent={copied}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 30, top: 340 - i * 56, width: 400, height: 42, borderRadius: 8, background: LANCE.dark500 }} />
          ))}
          {copied ? <div style={{ position: "absolute", left: 30, top: 340 - 6 * 56, width: 400, height: 42, borderRadius: 8, background: LANCE.orange400 }} /> : null}
        </Card>
      </At>
      <At p={[SV[0], SV[1] - 250, 40]} o={only}>
        <Tag size={30} color={LANCE.orange300}>
          the only durable copy · outside the table
        </Tag>
      </At>
      <At p={[TB[0] + 110, TB[1] - 280, 40]} o={inn(f, C("later", copies + 40) - 4, 14) * (1 - only)}>
        <Tag size={28}>later</Tag>
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// IndexLag — "Even after rows reach the table, indexes add one more delay.
// They're usually updated by a separate job. Until it runs, searches either
// miss the new rows or fall back to slow scans."
// ═══════════════════════════════════════════════════════════════════════════
export const IndexLag: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("indexLag");
  const idx = C("indexes", 60);
  const job = C("job", 160);
  const miss = C("miss", 260);
  const scans = C("slow", 330);
  const cam = camPath(f, [
    [0, { z: 60, rx: -5 }],
    [miss - 30, { z: 60, rx: -5 }],
    [miss + 10, { z: -40, y: -20, rx: -3 }],
  ]);
  const ROWS = 9;
  const NEW = 3; // the last three rows are new
  const rowY = (i: number) => -260 + i * 62;
  const newIn = (i: number) => glide(f, 4 + (i - (ROWS - NEW)) * 10);
  const idxIn = inn(f, idx - 6, 18);
  const jobIn = pop(f, job - 10, 140, 16);
  const qIn = inn(f, C("searches", miss - 40) - 6, 14);
  const beam = ramp(f, miss - 20, miss + 6);
  const missX = inn(f, miss + 4, 10);
  const scanT = ramp(f, scans - 4, scans + 90, (x) => x);
  return (
    <Stage name="Index lag" cam={cam} enter={enter} exit={exit} floorY={460}>
      {/* the table: old rows grey, new rows coral */}
      {Array.from({ length: ROWS }).map((_, i) => {
        const isNew = i >= ROWS - NEW;
        const v = isNew ? newIn(i) : 1;
        const scanned = scanT > 0 && i / ROWS < scanT;
        return (
          <At key={i} p={[-260 + (1 - v) * -300, rowY(i), 0]} o={v}>
            <Row w={520} h={46} tone={isNew ? "hit" : scanned ? "paper" : "idle"} glow={isNew ? 0.4 : 0} />
          </At>
        );
      })}
      <At p={[-260, -340, 0]}>
        <Tag size={30} color={LANCE.offwhite} mono={false}>
          table
        </Tag>
      </At>
      {/* index covers only the old rows */}
      <At p={[230, rowY(0) + (ROWS - NEW - 1) * 31, 0]} o={idxIn}>
        <Slab w={160} h={(ROWS - NEW) * 62 - 16} d={22} tone="big" radius={12}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Label size={30} color={LANCE.dark800} fringe={0} style={{ transform: "rotate(-90deg)" }}>
              index
            </Label>
          </div>
        </Slab>
      </At>
      <At p={[230, rowY(ROWS - 2), 0]} o={idxIn}>
        <div style={{ width: 160, height: 170, borderRadius: 12, border: `3px dashed ${LANCE.dark400}`, transform: "translate(0,0)" }} />
      </At>
      {/* the separate job, waiting */}
      <At p={[560, rowY(ROWS - 2), 20]} o={Math.min(1, jobIn * 1.4)} s={0.8 + 0.2 * jobIn}>
        <Card w={300} h={150} title="index job" titleSize={32}>
          <div style={{ position: "absolute", left: 30, top: 90 }}>
            <Label size={24} color={LANCE.dark300} fringe={0}>
              runs later
            </Label>
          </div>
        </Card>
      </At>
      {/* a search hits the index and misses the new rows */}
      <At p={[640, -300, 30]} o={qIn}>
        <Client text="search" w={210} h={84} size={32} />
      </At>
      <Wire a={[530, -300, 20]} b={[310, rowY(2), 20]} t={beam} color={LANCE.lavender} o={qIn} w={5} />
      <Mark p={[60, rowY(ROWS - 2), 50]} ok={false} v={missX} />
      {/* or scans every row, slowly */}
      {scanT > 0 && scanT < 1 ? (
        <At p={[-260, rowY(0) - 31 + scanT * ROWS * 62, 30]}>
          <div style={{ width: 600, height: 6, background: LANCE.lavender, boxShadow: `0 0 20px ${LANCE.lavender}`, borderRadius: 3, transform: "translateX(0)" }} />
        </At>
      ) : null}
      <At p={[-640, rowY(4), 30]} o={inn(f, scans - 4, 14)}>
        <Tag size={30} color={LANCE.lavender}>
          slow scan
        </Tag>
      </At>
    </Stage>
  );
};
