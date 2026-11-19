import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, glide, pop, V3 } from "./boldKit";
import { TitleBar, Dot, Panel, RowCheck, Laptop, ScreenIdle, Icon, W, PITCH, WEB, WEB_SPLIT, WebRow, WebHeads, TextMini, ScreenText, ScreenAck, TextRow } from "./ltable";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · Results — same line as the opening (app → table → another client).
// Nov 13 review: these tests ran on FineWeb-Edu / MS MARCO / LAION, so the whole scene draws a
// real LanceDB table of FineWeb-Edu rows (work/tools/build_fineweb.py), not DROID.
//   52 ms: client 1's write is acked (✓ ack), the clock starts there, and stops when client 2's
//          search finds the row — "52 ms after ack" (reviewer: "came up at the conference").
//   shards: the table splits into 4 shards side by side; bars 83 / 334 / 946 MB/s; then more
//          servers keep arriving and the bar runs on dashed — a measured number, not a ceiling.
//   count: back to the table; a scan passes every row and each one gets a ✓.
// Text: numbers and three short bar labels only.
// ═══════════════════════════════════════════════════════════════════════════
const TX = 0;
const TITLE_Y = -420;
const HEAD_Y = -342;
const Y0 = -270;
const WRITER: V3 = [-820, -150, 0];
const READER: V3 = [820, -150, 0];
const TRACK_Y = 180;
const TRACK_X0 = -560;
const TRACK_W = 1120;
const NEWR = WEB[14];
const SHARD_X = (j: number) => -840 + j * 560;
const SHARD_Y = -200;
const BAR_X = -620;
const BAR_Y = (i: number) => 120 + i * 110;
const BAR_PX = 1000 / 946;

const SET_Y = -230;
const COL_X = (j: number) => -840 + j * 560;
const PERIOD = 20;
/** one shard (or table) taking writes: the last 3 real rows it received, newest on top */
const Stream: React.FC<{ f: number; src: TextRow[]; off: number; start: number; label: string }> = ({ f, src, off, start, label }) => {
  const n = Math.max(0, Math.floor((f - start) / PERIOD));
  const hot = f >= start && (f - start) % PERIOD < 10;
  return (
    <Panel w={500} h={320} tone="idle" label={label} labelColor={LANCE.offwhite} d={18}>
      <div style={{ position: "absolute", left: 40, top: 86, display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2].map((i) => <TextMini key={n - i} r={src[(((off + n - i) % src.length) + src.length) % src.length]} hot={i === 0 && hot} />)}
      </div>
    </Panel>
  );
};

export const ResultsTable: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("results");
  const another = C("another", 80);
  const n52 = C("52", another + 180);
  const split = C("split", n52 + 220);
  const one = C("one", split + 240);
  const n80 = C("80", one + 160);
  const four = C("four", n80 + 150);
  const n300 = C("300", four + 100);
  const servers = C("servers", n300 + 100);
  const n946 = C("946", servers + 140);
  const counted = C("counted", n946 + 330);
  const confirmed = C("confirmed", counted + 180);

  // ── part 1 · 52 ms after ack ──────────────────────────────────────────────
  // write goes out → lands durable → client 1 gets its ack → clock runs → client 2 finds the row
  const p1 = 1 - ramp(f, split - 20, split + 10);
  // the ack lands on the spoken "acknowledged" (Nov 13 pickup line)
  const ackW = C("acknowledged", another - 16);
  const w0 = Math.max(10, ackW - 34);
  const writeT = ramp(f, w0, w0 + 20);
  const land = w0 + 20;
  const landed = f >= land;
  const ack = land + 14;
  const acked = f >= ack;
  const t0 = ack + 6;
  const t1 = Math.max(t0 + 60, n52);
  const track = ramp(f, t0, t1);
  const found = f >= t1;
  const readT = ramp(f, t1 - 2, t1 + 10);
  const ms = track * 52;
  const scroll = glide(f, land, 120) * PITCH;

  // ── part 2 · shards + bars ────────────────────────────────────────────────
  const bars = [
    { at: one, full: n80 + 4, v: 83, label: "1 shard" },
    { at: four, full: n300 + 4, v: 334, label: "4 shards" },
    { at: servers, full: n946 + 4, v: 946, label: "4 servers" },
  ];
  const p2 = ramp(f, split - 10, split + 20) * (1 - ramp(f, counted - 30, counted));
  const ph2 = ramp(f, four - 12, four + 8) * (1 - ramp(f, servers - 12, servers + 8));
  const ph3 = ramp(f, servers - 12, servers + 8);
  const ph1 = 1 - ramp(f, four - 12, four + 8);
  // keep scaling out: after 946, more servers (each its own table) keep arriving to the right
  const more = C("limit", Math.min(n946 + 80, counted - 120)); // "…not a limit" (Nov 13 pickup)
  const moreIn = (j: number) => ramp(f, more + j * 14, more + j * 14 + 16);
  const runOn = ramp(f, more + 10, more + 70);

  // ── part 3 · the count: every row gets a check ────────────────────────────
  const p3 = ramp(f, counted - 20, counted + 10);
  const scanAt = (i: number) => counted + 20 + i * 22;
  const allDone = f >= confirmed;

  const cam = camPath(f, [
    [0, { x: 0, y: -60, z: 380, rx: -5, ry: 2 }],
    [split - 20, { x: 0, y: -60, z: 380, rx: -5, ry: -2 }],
    [split + 20, { x: 0, y: -40, z: 180, rx: -5, ry: 2 }],
    [four - 20, { x: 0, y: -40, z: 180, rx: -5, ry: 2 }],
    [four + 20, { x: 0, y: -20, z: 600, rx: -5, ry: 0 }],
    [more - 10, { x: 0, y: -20, z: 600, rx: -5, ry: 0 }],
    [more + 60, { x: 520, y: -20, z: 1000, rx: -5, ry: -3 }],
    [counted - 20, { x: 560, y: -20, z: 1020, rx: -5, ry: -3 }],
    [counted + 20, { x: -60, y: -60, z: 360, rx: -4, ry: -2 }],
  ]);

  const tableRows = (p: number, list: number[], check: boolean) =>
    list.map((k, i) => {
      const isNew = !check && k === -1;
      const py = Y0 + i * PITCH - (check ? 0 : scroll);
      const o = (isNew ? (landed ? 1 : 0) : 1) * Math.max(0, Math.min(1, (py - (HEAD_Y + 20)) / 70)) * p;
      if (o < 0.01) return null;
      const r = isNew ? NEWR : WEB[k];
      const ck = check ? ramp(f, scanAt(i), scanAt(i) + 10) : 0;
      return (
        <React.Fragment key={(check ? "c" : "a") + i}>
          <At p={[TX, py, 0]} o={o} name={`Row · ${r.id}`}>
            <WebRow r={r} tone={isNew && f < land + 50 ? "hit" : "card"} lav={isNew ? readT * (1 - ramp(f, split - 60, split - 30)) : check ? ramp(f, scanAt(i) - 6, scanAt(i)) * (1 - ramp(f, scanAt(i) + 10, scanAt(i) + 20)) : 0} />
          </At>
          {check && (
            <At p={[TX + W / 2 + 70, py, 10]} o={o} name="Counted">
              <RowCheck o={ck} />
            </At>
          )}
        </React.Fragment>
      );
    });

  const SUB = "FineWeb-Edu";
  return (
    <Stage name="Results · one line" cam={cam} enter={enter} exit={exit} floorY={620}>
      {/* ── part 1 · write → ack → read, 52 ms after ack ── */}
      {p1 > 0.01 && (
        <>
          <At p={[TX, TITLE_Y, 0]} o={p1} name="Title bar">
            <TitleBar title="fineweb_edu" sub={SUB} />
          </At>
          <At p={[TX, HEAD_Y, 0]} o={p1} name="Column heads">
            <WebHeads />
          </At>
          {tableRows(p1, [3, 4, 5, -1], false)}
          <At p={WRITER} o={p1} name="Client 1 (writes, gets the ack)">
            <Laptop w={340} tone={!landed && f >= w0 - 10 ? "live" : acked ? "live" : "idle"} glow={!landed && f >= w0 - 10 ? 0.4 : acked && !found ? 0.3 : 0} name="client 1">
              {!landed && f >= w0 - 10 ? <ScreenText r={NEWR} /> : acked ? <ScreenAck /> : <ScreenIdle f={f} />}
            </Laptop>
          </At>
          <Dot a={[WRITER[0] + 170, WRITER[1], 0]} b={[TX - W / 2, Y0 + 2 * PITCH, 0]} t={writeT} />
          <At p={READER} o={p1 * ramp(f, w0 - 20, w0)} name="Client 2 (searches)">
            <Laptop w={340} tone={readT > 0.6 ? "big" : "idle"} name="client 2">
              {readT > 0.6 ? <ScreenText r={NEWR} tone="big" /> : <ScreenIdle f={f + 9} />}
            </Laptop>
          </At>
          <At p={[TRACK_X0, TRACK_Y + 120, 0]} anchor="left" o={p1 * ramp(f, ack - 6, ack + 10)} name="Latency track (from ack)">
            <div style={{ position: "relative", width: TRACK_W, height: 14, borderRadius: 14, background: LANCE.dark600 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: 14, borderRadius: 14, width: (TRACK_W * ms) / 100, background: LANCE.orange300, boxShadow: `0 0 20px ${LANCE.orange400}` }} />
              {[0, 50, 100].map((t) => (
                <div key={t} style={{ position: "absolute", left: (TRACK_W * t) / 100 - 40, top: 28, width: 80, textAlign: "center" }}>
                  <Label size={22} color={t === 0 ? LANCE.orange300 : LANCE.dark300}>{t === 0 ? "ack" : `${t}`}</Label>
                </div>
              ))}
              <div style={{ position: "absolute", left: (TRACK_W * ms) / 100 - 200, top: -118, width: 400, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 14 }}>
                <Label size={found ? 72 : 52} color={LANCE.orange300}>{`${Math.round(ms)} ms`}</Label>
                <Label size={28} color={LANCE.dark200} style={{ opacity: ramp(f, t1, t1 + 12) }}>after ack</Label>
              </div>
            </div>
          </At>
        </>
      )}

      {/* ── part 2 · three different setups, each writing its own stream of real FineWeb-Edu rows ── */}
      {p2 > 0.01 && (
        <>
          {/* 1 · one server, one table with one shard */}
          <At p={[0, SET_Y, -30]} o={p2 * ph1} name="One server · one shard">
            <Panel w={760} h={430} tone="dim" label="server" labelColor={LANCE.dark200} />
          </At>
          <At p={[0, SET_Y + 20, 0]} o={p2 * ph1} name="Shard 1">
            <Stream f={f} src={WEB} off={0} start={split + 20} label="shard 1" />
          </At>
          {/* 2 · one server, four shards of the same table written in parallel */}
          <At p={[0, SET_Y, -30]} o={p2 * ph2} name="One server · four shards">
            <Panel w={2280} h={430} tone="dim" label="server" labelColor={LANCE.dark200} />
          </At>
          {[0, 1, 2, 3].map((j) => (
            <At key={"s4" + j} p={[COL_X(j), SET_Y + 20, 0]} o={p2 * ph2} name={`Shard ${j + 1}`}>
              <Stream f={f} src={WEB_SPLIT[j]} off={2} start={four - 10 + j * 5} label={`shard ${j + 1}`} />
            </At>
          ))}
          {/* 3 · four servers, each with its own table (real tables fineweb_edu_1…4) — then more keep arriving */}
          {[0, 1, 2, 3, 4, 5, 6].map((j) => {
            const o = p2 * (j < 4 ? ph3 : ph3 * moreIn(j - 4));
            if (o < 0.01) return null;
            return (
              <React.Fragment key={"srv" + j}>
                <At p={[COL_X(j), SET_Y, -30]} o={o} name={`Server ${j + 1}`}>
                  <Panel w={540} h={430} tone="dim" label={`server ${j + 1}`} labelColor={LANCE.dark200} />
                </At>
                <At p={[COL_X(j), SET_Y + 20, 0]} o={o} name={j < 4 ? `Server ${j + 1} · fineweb_edu_${j + 1}` : `Server ${j + 1} · its own table`}>
                  <Stream f={f} src={WEB_SPLIT[j % 4]} off={j * 3} start={(j < 4 ? servers - 10 : more) + j * 5} label={j < 4 ? `fineweb_edu_${j + 1}` : ""} />
                </At>
              </React.Fragment>
            );
          })}
        </>
      )}
      {p2 > 0.01 &&
        bars.map((b, i) => {
          const inT = ramp(f, b.at - 6, b.at + 10);
          if (inT <= 0) return null;
          const len = Math.max(8, b.v * BAR_PX * ramp(f, b.at, b.full));
          const val = Math.round(b.v * ramp(f, b.at, b.full));
          const last = i === bars.length - 1;
          return (
            <At key={"bar" + i} p={[BAR_X, BAR_Y(i), 0]} anchor="left" o={inT * p2} name={`Bar · ${b.label}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, transformStyle: "preserve-3d" }}>
                <div style={{ width: 200, textAlign: "right" }}>
                  <Label size={28} color={LANCE.dark100}>{b.label}</Label>
                </div>
                <Slab w={len} h={64} d={26} tone={f < b.full + 30 ? "live" : "hit"} radius={10} glow={f < b.full + 30 ? 0.5 : 0} />
                <Label size={40} color={LANCE.orange300}>{`${val} MB/s`}</Label>
                {last && runOn > 0.01 ? (
                  /* not a ceiling: the bar keeps going, dashed, as more servers arrive */
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 520 * runOn, height: 52, borderRadius: 10, border: `4px dashed ${LANCE.orange300}`, opacity: 0.75, boxSizing: "border-box" }} />
                    <Label size={44} color={LANCE.orange300} style={{ opacity: runOn }}>›</Label>
                  </div>
                ) : null}
              </div>
            </At>
          );
        })}
      {p2 > 0.01 && (
        <At p={[BAR_X + 224, BAR_Y(0) - 74, 0]} anchor="left" o={p2 * ramp(f, one - 6, one + 20)} name="Footnote · test datasets">
          <Label size={28} color={LANCE.dark200}>measured on FineWeb-Edu, MS MARCO and LAION</Label>
        </At>
      )}

      {/* ── part 3 · every confirmed write is in the table ── */}
      {p3 > 0.01 && (
        <>
          <At p={[TX, TITLE_Y, 0]} o={p3} name="Title bar (count)">
            <TitleBar title="fineweb_edu" sub={SUB} />
          </At>
          <At p={[TX, HEAD_Y, 0]} o={p3} name="Column heads (count)">
            <WebHeads />
          </At>
          {tableRows(p3, [6, 7, 8, 9, 10, 11], true)}
          <At p={[-900, -60, 0]} o={p3} name="Client 1 (acked)">
            <Laptop w={340} tone={allDone ? "live" : "idle"} glow={allDone ? 0.4 : 0} name="client 1">
              {allDone ? <Icon name="check" size={90} color={LANCE.orange300} /> : <ScreenIdle f={f} />}
            </Laptop>
          </At>
        </>
      )}
    </Stage>
  );
};
