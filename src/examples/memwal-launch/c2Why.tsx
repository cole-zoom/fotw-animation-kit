import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, glide, pop, mix, V3 } from "./boldKit";
import { ROWS, MiniRow, TitleBar, Dot, Panel, Icon, Laptop, ScreenRow, ScreenIdle, ScreenWait, Server, VersionBadge, IceRow, IceHeads, ICE, W, PITCH, MW } from "./ltable";
import { ICE_ROWS, ICE_COMMITS, ICE_TABLE } from "./icebergData";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · Why it's hard — ONE LINE, left → right; the camera moves to what the VO names:
//
//   writers  →  (buffer | streaming service)  →  frames table + its version files  →  reader
//
// Text kept to what can't be drawn: the table's version number, the reader's wait.
//   commits: each commit bumps the version; every-few-rows → versions race and
//            version files pile up; two writers throw at the same number, one bounces (✕)
//   batching: rows wait in a buffer → one big commit, the pile clears; the reader
//            only sees the last commit and waits (timer)
//   streaming: rows sit in the service's own storage, copied in later; the newest
//            row's only copy is there (coral ring) and its slot in the table is empty
// ═══════════════════════════════════════════════════════════════════════════
const TX = 0;
const TITLE_Y = -400;
const HEAD_Y = -322;
const Y0 = -250;
const VIS = 5;
const WA: V3 = [-1600, -170, 0];
const WB: V3 = [-1600, 220, 0];
const MID: V3 = [-860, 20, 0];
const HEAP: V3 = [930, 200, 0];
const READER: V3 = [1560, -140, 0];
const V0 = 1042;

export const WhyTable: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("whyHard");
  const huge = C("huge", 20);
  const visible = C("visible", huge + 200);
  const committing = C("committing", visible + 50);
  const hourly = C("hourly", committing + 200);
  const ms = C("millisecond", hourly + 160);
  const piles = C("piles", ms + 190);
  const writers = C("writers", piles + 100);
  const fight = C("fight", writers + 18);
  const batching = C("batching", fight + 120);
  const commits = C("commits", batching + 100);
  const fixes = C("fixes", commits + 30);
  const readers = C("readers", fixes + 200);
  const seconds = C("seconds", readers + 50);
  const minutes = C("minutes", seconds + 40);
  const another = C("another", minutes + 110);
  const streaming = C("streaming", another + 100);
  const holds = C("holds", streaming + 150);
  const copies = C("copies", holds + 140);
  const later = C("later", copies + 70);
  const only = C("only", later + 140);
  const separate = C("separate", only + 150);

  // ── commits ───────────────────────────────────────────────────────────────
  type Commit = { at: number; n: number; copy?: boolean };
  const cm: Commit[] = [{ at: committing + 8, n: 2 }, { at: hourly + 12, n: 3 }];
  // exactly the 40 single-row commits the real Iceberg table got (build_iceberg.py)
  for (let j = 0; j < 40; j++) cm.push({ at: Math.round(ms + 8 + (j * (fight - 14 - ms)) / 40), n: 1 });
  cm.push({ at: commits + 6, n: 4 });
  cm.push({ at: later + 4, n: 3, copy: true });
  // commit ci in the scene = real Iceberg commit ci + 1 (commit 0 made the base rows)
  const done = cm.filter((c) => f >= c.at).length;
  const IC = ICE_COMMITS[done];
  const ver = IC.seq;
  const changedAt = cm.reduce((m, c) => (f >= c.at ? c.at : m), -999);
  const seq: { k: number; at: number; c: number }[] = [];
  for (let i = 0; i < VIS; i++) seq.push({ k: 6 - VIS + i, at: -1e9, c: -1 });
  cm.forEach((c, ci) => {
    for (let n = 0; n < c.n; n++) seq.push({ k: ICE_COMMITS[ci + 1].first + n, at: c.at, c: ci });
  });
  const copyRows = seq.filter((q) => q.c === cm.length - 1).map((q) => q.k);
  const svcK = [...copyRows, ICE_ROWS.length];
  const tableRows = seq.filter((q) => f >= q.at).length + (6 - VIS);
  let top = 0;
  for (let i = VIS; i < seq.length; i++) top += glide(f, seq[i].at, 160);
  const rowYAt = (i: number) => Y0 + (i - top) * PITCH;
  const lastY = Y0 + (VIS - 1) * PITCH;

  const rowsOut: React.ReactNode[] = [];
  seq.forEach((s, i) => {
    if (f < s.at) return;
    const py = rowYAt(i);
    const o = Math.max(0, Math.min(1, (py - (HEAD_Y + 20)) / 70)) * Math.max(0, Math.min(1, (Y0 + VIS * PITCH + 40 - py) / 60));
    if (o < 0.01) return;
    const fresh = ramp(f, s.at, s.at + 6) * (1 - ramp(f, s.at + 26, s.at + 50));
    rowsOut.push(
      <At key={i} p={[TX, py, 0]} o={o} name={`Row · ${ICE_ROWS[s.k].episode}`}>
        <IceRow r={ICE_ROWS[s.k]} tone={rdLav(i) > 0.5 ? "big" : fresh > 0.5 ? "hit" : "dim"} glow={0.6 * fresh} />
      </At>,
    );
  });
  function rdLav(i: number) {
    return i === seq.filter((s) => f >= s.at).length - 1 ? ramp(f, readers, readers + 14) * (1 - ramp(f, another - 20, another)) : 0;
  }

  // ── the real metadata files Iceberg wrote: 3 per commit (metadata.json, manifest list, manifest) ──
  const heapDim = ramp(f, fixes - 4, fixes + 30);
  const heapOut: React.ReactNode[] = [];
  let slot = 0;
  const files = ["00000-….metadata.json"].concat(...ICE_COMMITS.slice(0, 1).map((c) => [...c.newFiles]));
  files.forEach(() => slot++);
  cm.forEach((c, ci) => {
    ICE_COMMITS[ci + 1].newFiles.forEach((name, n) => {
      const idx = slot++;
      const t = ramp(f, c.at + n * 2, c.at + n * 2 + 10);
      if (t <= 0) return;
      const col = idx % 8, row = Math.floor(idx / 8);
      heapOut.push(
        <At key={name} p={[HEAP[0] - 270 + col * 78, HEAP[1] - row * 24 - (1 - t) * 140, row * 2]} o={Math.min(1, t * 2) * (1 - 0.6 * heapDim)} name={`metadata/${name}`}>
          <Slab w={70} h={20} d={6} tone={f < c.at + 24 ? "live" : name.endsWith(".json") ? "paper" : "idle"} radius={3} />
        </At>,
      );
    });
  });
  for (let i = 0; i < 4; i++)
    heapOut.unshift(
      <At key={"pre" + i} p={[HEAP[0] - 270 + i * 78, HEAP[1], 0]} o={1 - 0.6 * heapDim} name="metadata file (before the scene)">
        <Slab w={70} h={20} d={6} tone="paper" radius={3} />
      </At>,
    );
  const newest = IC.newFiles[0];

  // ── writers race for the next version ─────────────────────────────────────
  const aIn = pop(f, Math.min(ms, writers) - 10);
  const bIn = pop(f, writers - 10) * (1 - ramp(f, batching - 10, batching + 10));
  const throwT = ramp(f, fight - 6, fight + 10);
  const bounce = ramp(f, fight + 10, fight + 34);
  const verAt: V3 = [TX - W / 2 - 170, TITLE_Y + 10, 20];
  const aWriting = cm.some((c) => f >= c.at - 10 && f < c.at + 2);

  // ── buffer, then the streaming service, in the middle of the line ─────────
  const bufIn = glide(f, batching - 10, 100) * (1 - ramp(f, another - 20, another + 10));
  const bufRows = (n0: number, n: number, start: number, every: number) => {
    const out: React.ReactNode[] = [];
    for (let j = 0; j < n; j++) {
      const a = start + j * every;
      if (f < a) continue;
      out.push(
        <At key={n0 + j} p={[MID[0], MID[1] + 110 - j * 70, 30]} o={ramp(f, a, a + 8) * bufIn} name="Waiting row">
          <MiniRow r={ROWS[(n0 + j) % ROWS.length]} tone="card" ghost={0.4} />
        </At>,
      );
    }
    return out;
  };
  const firstBatch = f < commits + 6 ? bufRows(ICE_COMMITS[43].first, 4, batching + 14, 18) : [];
  const secondBatch = f >= commits + 30 ? bufRows(62, 4, commits + 50, 40) : [];
  const flushT = ramp(f, commits - 4, commits + 6);

  const rdIn = pop(f, readers - 8) * (1 - ramp(f, another - 20, another + 10));
  const waitS = f < seconds ? 0 : f < minutes ? Math.round(2 + ((f - seconds) / 40) * 10) : Math.round(12 + ((f - minutes) / 60) * 160);
  const waitTxt = f < minutes ? `${waitS} s` : `${Math.floor(waitS / 60)}:${String(waitS % 60).padStart(2, "0")}`;

  const svcIn = glide(f, streaming - 10, 100);
  const svcRows: React.ReactNode[] = [];
  for (let j = 0; j < 4; j++) {
    const a = holds - 30 + j * 24;
    const copied = j < 3 ? ramp(f, later + 4 + j * 2, later + 20 + j * 2) : 0;
    if (f < a) continue;
    svcRows.push(
      <At key={j} p={[MID[0], MID[1] + 110 - j * 70, 30]} o={ramp(f, a, a + 8) * svcIn} name="Row in the streaming service">
        <MiniRow r={ROWS[svcK[j]]} tone={j === 3 && f > only ? "live" : "card"} glow={j === 3 && f > only ? 0.4 : 0} ghost={0.4 * copied} />
      </At>,
    );
  }
  const onlyGlow = ramp(f, only - 4, only + 12);
  const notHere = ramp(f, separate + 10, separate + 30);

  const cam = camPath(f, [
    [0, { x: 120, y: -40, z: 280, rx: -5, ry: -2 }],
    [ms - 20, { x: 420, y: -40, z: 440, rx: -5, ry: -3 }],
    [writers - 30, { x: 420, y: -40, z: 440, rx: -5, ry: -3 }],
    [writers + 10, { x: -820, y: -30, z: 480, rx: -5, ry: 3 }],
    [readers - 30, { x: -640, y: -30, z: 480, rx: -5, ry: 3 }],
    [readers + 10, { x: 860, y: -40, z: 440, rx: -5, ry: -3 }],
    [another - 10, { x: 860, y: -40, z: 440, rx: -5, ry: -3 }],
    [another + 30, { x: -640, y: -30, z: 520, rx: -5, ry: 3 }],
    [separate + 300, { x: -620, y: -30, z: 520, rx: -5, ry: 3 }],
  ]);

  return (
    <Stage name="Why it's hard · one line" cam={cam} enter={enter} exit={exit} floorY={580}>
      {/* object storage: the table and its version files */}
      <At p={[380, -60, -90]} o={glide(f, huge - 6, 100)} name="Object storage">
        <Panel w={W + 1000} h={820} tone="dim" />
      </At>
      <At p={[TX, TITLE_Y, 0]} name="Title bar">
        <TitleBar title={ICE_TABLE.name} dot="◆" dotColor={ICE} sub={`${tableRows} rows`} />
      </At>
      {/* the table version: big, and it pops on every commit */}
      <At p={[TX - W / 2 - 170, TITLE_Y + 10, 20]} o={ramp(f, visible - 10, visible + 6)} name="Table version">
        <VersionBadge f={f} ver={ver} changedAt={changedAt} />
      </At>
      <At p={[TX, HEAD_Y, 0]} name="Column heads">
        <IceHeads />
      </At>
      {rowsOut}
      {heapOut}
      <At p={[HEAP[0], HEAP[1] + 70, 0]} o={ramp(f, committing, committing + 12)} name="metadata/ count">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Label size={30} color={ICE}>{`metadata/ · ${IC.metadataFiles} files`}</Label>
          <Label size={18} color={LANCE.dark300}>{newest}</Label>
        </div>
      </At>

      {/* writers */}
      <At p={WA} s={Math.max(0.01, aIn)} o={Math.min(1, aIn * 2)} name="Writer">
        <Laptop w={320} tone={aWriting || (throwT > 0.4 && throwT < 1) ? "live" : "idle"} glow={aWriting ? 0.4 : 0} name="client 1">
          {aWriting ? <ScreenRow r={ROWS[seq.find((q) => q.c === cm.findIndex((c) => f >= c.at - 10 && f < c.at + 2))?.k ?? VIS]} w={240} /> : <ScreenIdle f={f} />}
        </Laptop>
      </At>
      {cm.map((c, ci) => (ci < 2 || (c.at > ms && c.at < fight) ? <Dot key={"cw" + ci} a={[WA[0] + 160, WA[1], 0]} b={[TX - W / 2, lastY, 0]} t={ramp(f, c.at - 12, c.at)} size={20} /> : null))}
      {bIn > 0.01 && (
        <>
          <At p={WB} s={Math.max(0.01, bIn)} o={Math.min(1, bIn * 2)} name="Second writer">
            <Laptop w={320} tone={bounce > 0.3 ? "dim" : throwT > 0.4 ? "live" : "idle"} name="client 2">
              {bounce > 0.3 ? <Icon name="x" size={80} color={LANCE.orange300} /> : <ScreenIdle f={f + 7} />}
            </Laptop>
          </At>
          <Dot a={[WA[0] + 160, WA[1], 0]} b={verAt} t={throwT} size={30} />
          <Dot a={[WB[0] + 160, WB[1], 0]} b={verAt} t={bounce > 0 ? 1 - bounce : throwT} color={bounce > 0 ? LANCE.dark300 : LANCE.orange300} size={30} />
        </>
      )}

      {/* the buffer (batching) */}
      <At p={MID} o={bufIn} name="Buffer">
        <Panel w={MW + 60} h={380} tone="dim" dashed={LANCE.dark400} />
      </At>
      {firstBatch}
      {secondBatch}
      <Dot a={[MID[0] + MW / 2, MID[1], 30]} b={[TX - W / 2, lastY, 0]} t={flushT} size={34} />

      {/* the reader only sees the last commit */}
      <At p={READER} s={Math.max(0.01, rdIn)} o={Math.min(1, rdIn * 2)} name="Reader">
        <Laptop w={320} tone={f >= seconds ? "dim" : "big"} name="client 3">
          {f >= seconds ? <ScreenWait f={f} color={LANCE.lavender} /> : <ScreenIdle f={f} />}
        </Laptop>
      </At>
      <At p={[READER[0], READER[1] + 230, 0]} o={ramp(f, seconds - 4, seconds + 8) * rdIn} name="Wait timer">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Label size={40} color={LANCE.lavender}>{waitTxt}</Label>
        </div>
      </At>

      {/* the streaming service: its own storage, outside the table */}
      <At p={MID} o={svcIn} name="Streaming service">
        <div style={{ borderRadius: 24, boxShadow: onlyGlow > 0.01 ? `0 0 0 ${6 * onlyGlow}px rgba(255,137,103,${onlyGlow}), 0 0 ${50 * onlyGlow}px rgba(255,115,74,${0.5 * onlyGlow})` : undefined }}>
          <Panel w={MW + 60} h={380} tone="idle" />
        </div>
      </At>
      <At p={[MID[0], MID[1] - 300, 30]} s={Math.max(0.01, svcIn)} o={svcIn} name="Streaming service icon">
        <Server w={260} units={2} f={f} busy color={LANCE.orange300} />
      </At>
      {svcRows}
      {[0, 1, 2].map((j) => (
        <Dot key={"cp" + j} a={[MID[0] + MW / 2, MID[1] + 110 - j * 70, 30]} b={[TX - W / 2, lastY, 0]} t={ramp(f, later - 6 + j * 4, later + 8 + j * 4)} />
      ))}
      {svcIn > 0.01 && (
        <Dot a={[WA[0] + 160, WA[1], 0]} b={[MID[0] - MW / 2, MID[1], 30]} t={ramp(f, holds + 42, holds + 60)} />
      )}
      {/* its slot in the table is still empty */}
      <At p={[TX, Y0 + VIS * PITCH - 20, 10]} o={notHere} name="Not in your table">
        <Slab w={W} h={74} d={8} tone="dim" radius={12} style={{ border: `4px dashed ${LANCE.orange300}`, background: "transparent" }} />
      </At>
    </Stage>
  );
};
