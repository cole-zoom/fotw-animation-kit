import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK } from "./lanceFonts";
import { chroma } from "./retro";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { Client, Row, Card, Readout, Wire, Mark, Tag, inn, fly, flash } from "./rteKit";
import { cueOf } from "./cues";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// Latency — "In our tests on AWS, the median time before another client could
// look up a just-written row was just 52 milliseconds!"
//   A freshness number, not a read benchmark (Jack): write returns → another
//   client finds the row by key. No read-latency chart.
// ═══════════════════════════════════════════════════════════════════════════
export const Latency: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("latency");
  const write = C("written", 200) - 30;
  const n52 = C("52", 260);
  const cam = camPath(f, [
    [0, { z: 60, rx: -3 }],
    [n52 - 10, { z: 20, rx: -2 }],
    [n52 + 40, { z: -40, y: -30, rx: -1 }],
  ]);
  const W: V3 = [-620, 160, 0];
  const R: V3 = [620, 160, 0];
  const cIn = inn(f, C("another", 100) - 20, 16);
  const count = interpolate(f, [write + 16, n52 + 4], [0, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const big = pop(f, n52 - 4, 160, 14);
  const rule = ramp(f, n52 + 2, n52 + 24);
  return (
    <Stage name="52 ms" cam={cam} enter={enter} exit={exit} floorY={420}>
      <At p={W} o={cIn}>
        <Client text="writer" w={230} />
      </At>
      <At p={R} o={cIn}>
        <Client text="another client" w={330} glow={flash(f, n52 - 2, 30)} />
      </At>
      <Wire a={[W[0] + 115, W[1], -2]} b={[R[0] - 165, R[1], -2]} dash o={cIn} />
      {f >= write && f < write + 40 ? (
        <At p={fly(f, [W[0] + 100, W[1], 20], [0, W[1], 20], write, 20, 40)}>
          <Row w={110} h={38} glow={0.6} text="id 42" />
        </At>
      ) : null}
      {f >= write + 20 ? (
        <At p={[0, W[1], 20]}>
          <Row w={110} h={38} glow={0.6} text="id 42" />
        </At>
      ) : null}
      {f >= write + 24 ? (
        <At p={[R[0] - 300, R[1] - 60, 20]} o={inn(f, write + 24, 10)}>
          <Tag size={26} color={LANCE.lavender}>
            get id 42
          </Tag>
        </At>
      ) : null}
      <Mark p={[R[0], R[1] - 100, 40]} ok v={inn(f, n52 - 2, 10)} size={56} />
      <At p={[0, -150, 40]} s={0.9 + 0.1 * Math.min(1, big)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div style={{ fontFamily: AEONIK, fontWeight: 500, fontSize: 300, lineHeight: 0.85, letterSpacing: "-0.05em", color: LANCE.offwhite, textShadow: chroma(2 + big * 2), fontVariantNumeric: "tabular-nums" }}>
              {Math.round(count)}
            </div>
            <div style={{ fontFamily: AEONIK, fontWeight: 500, fontSize: 120, color: LANCE.offwhite, textShadow: chroma(1.5) }}>ms</div>
          </div>
          <div style={{ width: 380 * rule, height: 10, background: LANCE.orange400, borderRadius: 5, marginTop: 20, boxShadow: "0 0 20px rgba(255,115,74,0.7)" }} />
          <div style={{ marginTop: 24, opacity: rule }}>
            <Label size={30} color={LANCE.dark200} fringe={0}>
              median · write returns → another client finds the row by key
            </Label>
          </div>
        </div>
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Throughput — "The engine can also split a table into shards that can be
// written to in parallel. On one server, a table with one shard handled about
// 80 megabytes of writes per second. With four shards, it handled over 300.
// Four servers, each with its own table, handled 946 megabytes per second
// together."
//   Numbers from the blog charts (FineWeb-Edu): 1 shard 83, 4 shards 334,
//   4 nodes 946. Spoken as "about 80" / "over 300".
// ═══════════════════════════════════════════════════════════════════════════
const MB = 1.5; // px per MB/s on the bar charts
export const Throughput: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("throughput");
  const split = C("split", 20);
  const one = C("one", 160);
  const n80 = C("80", 220);
  const four = C("four", 330);
  const n300 = C("300", 420);
  const servers = C("servers", 480);
  const n946 = C("946", 560);
  const cam = camPath(f, [
    [0, { z: 40, rx: -4 }],
    [servers - 40, { z: 40, rx: -4 }],
    [servers + 10, { z: 0, x: 0, y: 0, rx: -4 }],
  ]);
  const phase2 = inn(f, servers - 40, 24);
  const splitT = ramp(f, split + 4, split + 40);
  const bar1 = ramp(f, n80 - 50, n80 + 4) * 83;
  const bar4 = ramp(f, n300 - 70, n300 + 4) * 334;
  const val1 = Math.round(bar1);
  const val4 = Math.round(bar4);
  const nodeIn = (k: number) => pop(f, servers - 10 + k * 6, 150, 16);
  const sum = ramp(f, n946 - 60, n946 + 4);
  const total = Math.round(sum * 946);
  // shard layout: one slab splits into four
  const shardX = (k: number) => mix(0, -330 + k * 220, splitT);
  return (
    <Stage name="Throughput with shards and nodes" cam={cam} enter={enter} exit={exit} floorY={440}>
      <div style={{ opacity: 1 - phase2 }}>
        {/* the table splitting into shards, each with its own lane of rows */}
        {[0, 1, 2, 3].map((k) => (
          <At key={k} p={[-420 + shardX(k), -120, 0]} o={k === 0 ? 1 : splitT}>
            <Slab w={splitT > 0.5 ? 200 : 520} h={120} d={20} tone="card" radius={12} style={{ border: `3px solid ${LANCE.orange400}` }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Label size={32} color={LANCE.offwhite}>
                  {splitT > 0.5 ? `shard ${k + 1}` : "table"}
                </Label>
              </div>
            </Slab>
          </At>
        ))}
        {splitT >= 1 &&
          Array.from({ length: 24 }).map((_, i) => {
            const k = i % 4;
            const a = split + 44 + Math.floor(i / 4) * 10 + k * 2;
            if (f < a || f > a + 16) return null;
            return (
              <At key={i} p={fly(f, [-420 + shardX(k), -480, 20], [-420 + shardX(k), -190, 20], a, 16, 0)}>
                <Row w={80} h={30} glow={0.5} />
              </At>
            );
          })}
        {/* bars: 1 shard vs 4 shards, one server */}
        <At p={[520, 330, 0]} anchor="bottom">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 120 }}>
            {[
              { v: bar1, t: val1, label: "1 shard", show: inn(f, one - 10, 14) },
              { v: bar4, t: val4, label: "4 shards", show: inn(f, four - 10, 14) },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: b.show, transformStyle: "preserve-3d" }}>
                <Label size={44} mono={false} color={LANCE.offwhite} style={{ marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>
                  {b.t > 0 ? `${b.t}` : ""}
                </Label>
                <Slab w={170} h={Math.max(2, b.v * MB)} d={40} tone="hit" radius={8} glow={0.5} outline={false} />
                <div style={{ marginTop: 18 }}>
                  <Label size={28} color={LANCE.dark100}>
                    {b.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </At>
        <At p={[520, 400, 0]}>
          <Tag size={24}>one server · MB/s acknowledged, durable in S3</Tag>
        </At>
      </div>
      {/* four servers, each its own table, summed */}
      <div style={{ opacity: phase2 }}>
        {[0, 1, 2, 3].map((k) => (
          <At key={k} p={[-690 + k * 460, -220, 0]} o={Math.min(1, nodeIn(k) * 1.4)} s={0.85 + 0.15 * nodeIn(k)}>
            <Card w={400} h={200} title={`server ${k + 1}`} titleSize={32} accent>
              <div style={{ position: "absolute", left: 30, top: 100 }}>
                <Label size={22} color={LANCE.dark200} fringe={0}>
                  {`table ${"ABCD"[k]} · 4 shards`}
                </Label>
              </div>
            </Card>
          </At>
        ))}
        {[0, 1, 2, 3].map((k) => (
          <Wire key={k} a={[-690 + k * 460, -110, 0]} b={[0, 90, 0]} t={sum} color={LANCE.orange300} o={phase2} />
        ))}
        <At p={[0, 200, 30]} o={phase2}>
          <Readout value={`${total}`} unit="MB/s" size={170} sub="together" />
        </At>
      </div>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Count — "After every test, we counted the rows in the table. Every write the
// engine confirmed was there."
//   Confirmed writes (left) each find their row in the table (right).
//   No invented totals on screen.
// ═══════════════════════════════════════════════════════════════════════════
export const Count: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("count");
  const counted = C("counted", 80);
  const confirmed = C("confirmed", 220);
  const cam = camPath(f, [
    [0, { z: 60, rx: -4 }],
    [confirmed + 40, { z: 0, rx: -3 }],
  ]);
  const COLS = 8;
  const N = 40;
  const pos = (i: number, x0: number): V3 => [x0 + (i % COLS) * 62, -200 + Math.floor(i / COLS) * 62, 0];
  const at = (i: number) => counted - 10 + i * 4;
  const done = inn(f, confirmed + 10, 16);
  return (
    <Stage name="Every confirmed write was there" cam={cam} enter={enter} exit={exit} floorY={420}>
      <At p={[-560, -300, 0]}>
        <Tag size={30} color={LANCE.offwhite} mono={false}>
          writes confirmed
        </Tag>
      </At>
      <At p={[340, -300, 0]}>
        <Tag size={30} color={LANCE.offwhite} mono={false}>
          rows in the table
        </Tag>
      </At>
      {Array.from({ length: N }).map((_, i) => {
        const a = at(i);
        const t = ramp(f, a, a + 18);
        const src = pos(i, -780);
        const dst = pos(i, 120);
        return (
          <React.Fragment key={i}>
            <At p={src}>
              <div style={{ width: 50, height: 50, borderRadius: 8, background: t > 0 ? "#3a332e" : LANCE.orange400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Label size={24} color={t > 0 ? LANCE.dark300 : LANCE.dark800} fringe={0}>
                  ✓
                </Label>
              </div>
            </At>
            <At p={dst}>
              <div style={{ width: 50, height: 50, borderRadius: 8, border: `2px dashed ${LANCE.dark500}`, boxSizing: "border-box" }} />
            </At>
            {t > 0 ? (
              <At p={t < 1 ? fly(f, src, dst, a, 18, 60) : dst}>
                <div style={{ width: 50, height: 50, borderRadius: 8, background: LANCE.orange400, boxShadow: t < 1 ? "0 0 14px rgba(255,115,74,0.6)" : undefined }} />
              </At>
            ) : null}
          </React.Fragment>
        );
      })}
      <Mark p={[0, 200, 60]} ok v={done} size={110} />
      <At p={[0, 310, 60]} o={done}>
        <Tag size={30} color={LANCE.offwhite}>
          none missing
        </Tag>
      </At>
    </Stage>
  );
};
