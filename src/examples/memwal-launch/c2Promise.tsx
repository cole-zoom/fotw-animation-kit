import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, glide, V3 } from "./boldKit";
import { ROWS, Row, TitleBar, Heads, Dot, Laptop, ScreenRow, ScreenIdle, ScreenWait, IceRow, IceHeads, asIce, ICE, W, PITCH } from "./ltable";
import { ICE_ROWS, ICE_COMMITS, ICE_TABLE } from "./icebergData";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · Promise — one level line: client 1 → table → client 2.
// "Rows you write are now readable by another client within milliseconds."
//   client 1 writes real rows; client 2's search lights each one a beat later.
// "Most data platforms can't do that today."
//   the table flips to a cold, snapshot-based lakehouse table (never named — a
//   mock: icy accent, "snapshot" counter, commit countdown). The same write
//   stalls in a dashed pending slot; client 2 spins.
// ═══════════════════════════════════════════════════════════════════════════
const TX = 0;
const TITLE_Y = -400;
const HEAD_Y = -322;
const Y0 = -250;
const BASE = 6;
const NEW = [40, 41, 42];
const PEND = 43;
const LY = -40; //       both laptops on one level
const C1: V3 = [-860, LY, 0];
const C2: V3 = [860, LY, 0];
// nested At's are placed from the title bar's top-left corner
const OX = W / 2, OY = 37;

export const PromiseTable: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("promise");
  const rows = C("rows", 10);
  const readable = C("readable", rows + 100);
  const ms = C("milliseconds", readable + 110);
  const most = C("most", ms + 90);
  const arrive = [rows + 16, ms - 30, most - 60];
  const readAt = arrive.map((a, j) => (j === 0 ? Math.max(a + 50, readable + 40) : a + 34));

  // the flip to the other format
  const flip = ramp(f, most - 8, most + 12);
  const lanceO = 1 - ramp(f, most - 2, most + 2);
  const otherO = ramp(f, most - 2, most + 2);
  const pendT = ramp(f, most + 30, most + 52);
  const pending = f >= most + 52;

  const cam = camPath(f, [
    [0, { x: 0, y: 10, z: 440, rx: -5, ry: 0 }],
    [most + 300, { x: 0, y: 40, z: 440, rx: -5, ry: 0 }],
  ]);

  const scroll = arrive.reduce((a, t) => a + glide(f, t + 6, 120), 0) * PITCH;
  let newest = -1;
  for (let j = 0; j < NEW.length; j++) if (f >= arrive[j] + 22) newest = j;
  const readT = (j: number) => ramp(f, readAt[j], readAt[j] + 8) * (1 - ramp(f, readAt[j] + 40, readAt[j] + 52));
  const read = newest >= 0 ? readT(newest) : 0;
  const rowYAt = (i: number) => Y0 + i * PITCH - scroll;
  const wj = arrive.findIndex((a) => f >= a - 30 && f < a + 4);
  const writingLance = wj >= 0 && f < most - 8;
  const writingOther = f >= most + 10 && f < most + 40;

  const lanceRows: React.ReactNode[] = [];
  for (let i = 0; i < BASE + NEW.length; i++) {
    const isNew = i >= BASE;
    const j = i - BASE;
    const r = ROWS[isNew ? NEW[j] : i];
    let o = isNew ? ramp(f, arrive[j], arrive[j] + 10) : 1;
    const px = isNew ? (1 - glide(f, arrive[j], 110)) * -900 : 0;
    const py = rowYAt(i);
    o *= Math.max(0, Math.min(1, (py - (HEAD_Y + 20)) / 70));
    if (o < 0.01) continue;
    const landed = isNew ? ramp(f, arrive[j] + 18, arrive[j] + 26) : 0;
    const settle = isNew ? ramp(f, arrive[j] + 60, arrive[j] + 90) : 0;
    lanceRows.push(
      <At key={i} p={[OX + px, OY + py - TITLE_Y, 0]} o={o} name={`Row · ${r.episode}`}>
        <Row r={r} tone={landed > 0.5 && settle < 0.5 ? "hit" : "card"} glow={0.7 * landed * (1 - settle)} lav={isNew ? readT(j) : 0} />
      </At>,
    );
  }

  return (
    <Stage name="Promise · one line" cam={cam} enter={enter} exit={exit} floorY={560}>
      {/* client 1 writes */}
      <At p={C1} name="Client 1">
        <Laptop w={360} tone={writingLance || writingOther ? "live" : "idle"} glow={writingLance ? 0.4 : 0} name="client 1">
          {writingLance ? <ScreenRow r={ROWS[NEW[wj]]} /> : writingOther ? <ScreenRow r={ROWS[PEND]} /> : <ScreenIdle f={f} />}
        </Laptop>
      </At>
      {arrive.map((a, j) => (f < most - 8 ? <Dot key={j} a={[C1[0] + 180, C1[1], 0]} b={[TX - W / 2, rowYAt(BASE + j), 0]} t={ramp(f, a - 14, a + 6)} /> : null))}
      <Dot a={[C1[0] + 180, C1[1], 0]} b={[TX - W / 2, Y0 + 6 * PITCH - 20, 0]} t={pendT} />

      {/* the Lance table, flips away on "most data platforms" */}
      <At p={[TX, TITLE_Y, 0]} r={[0, -90 * flip, 0]} o={lanceO} name="Lance table">
        <TitleBar />
        <At p={[OX, OY + HEAD_Y - TITLE_Y, 0]} name="Column heads">
          <Heads />
        </At>
        {lanceRows}
      </At>

      {/* the other format: a REAL Iceberg table of the same rows (work/tools/build_iceberg.py) — images are
          paths to files, the embedding is list<float>; the new row waits for the writer's next commit */}
      <At p={[TX, TITLE_Y, 0]} r={[0, 90 * (1 - flip), 0]} o={otherO} name="Iceberg table (real, unnamed)">
        <TitleBar title={ICE_TABLE.name} dot="◆" dotColor={ICE} sub={`snapshot ${ICE_COMMITS[ICE_COMMITS.length - 1].snapshot}`} right={<Label size={24} color={ICE}>{`commit in 4:${String(59 - Math.min(59, Math.max(0, Math.floor((f - most) / 60)))).padStart(2, "0")}`}</Label>} />
        <At p={[OX, OY + HEAD_Y - TITLE_Y, 0]} name="Column heads">
          <IceHeads />
        </At>
        {[0, 1, 2, 3, 4, 5].map((k, i) => (
          <At key={"o" + k} p={[OX, OY + Y0 - TITLE_Y + i * PITCH, 0]} name="Iceberg row">
            <IceRow r={ICE_ROWS[k]} />
          </At>
        ))}
        <At p={[OX, OY + Y0 - TITLE_Y + 6 * PITCH + 4, 0]} o={pending ? 1 : 0} name="Pending row">
          <div style={{ position: "relative", opacity: 0.6, outline: `4px dashed ${ICE}`, outlineOffset: 4, borderRadius: 12 }}>
            <IceRow r={asIce(ROWS[PEND])} ghost={0.5} />
            <div style={{ position: "absolute", right: -100, top: 20 }}>
              <ScreenWait f={f} color={ICE} />
            </div>
          </div>
        </At>
      </At>

      {/* client 2 reads */}
      <At p={C2} name="Client 2">
        <Laptop w={360} tone={f >= most ? "dim" : read > 0.5 ? "big" : "idle"} name="client 2">
          {f >= most ? <ScreenWait f={f} /> : read > 0.5 && newest >= 0 ? <ScreenRow r={ROWS[NEW[newest]]} tone="big" /> : <ScreenIdle f={f + 9} />}
        </Laptop>
      </At>
    </Stage>
  );
};
