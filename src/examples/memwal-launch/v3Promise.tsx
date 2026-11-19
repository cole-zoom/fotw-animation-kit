import React from "react";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { Scene3D, useKit, useF, ramp, io, back, hop, flash, T } from "./rte3d";
import { rigKeys } from "./v3Why";
import { World, TABLE, MEMWAL, CLIENTS, READER, Cube, Pillar, Rod, LANCE } from "./world";

type P = { enter?: SceneTransition; exit?: SceneTransition };
type V3 = [number, number, number];

// ═══════════════════════════════════════════════════════════════════════════
// C · Promise — "Rows you write are now readable by another client within
// milliseconds. Most data platforms can't do that today."
// The whole video in one loop, on the same world as the later sections:
// a client on the left writes a row into the table; a client on the right
// reads it back a beat later. On "Most data platforms…" a second, grey reader
// appears that is still waiting.
// ═══════════════════════════════════════════════════════════════════════════
const WRITER: V3 = CLIENTS[1];
const LATE: V3 = [6.4, 0, -2.6];
const N = 9;
const EVERY = 46;
const land = (i: number): V3 => [-1.6 + i * 0.42, 0.16, MEMWAL.c[2]];

export const PromiseLoop: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useF();
  const k = useKit();
  const C = cueOf("promise");
  const rows = C("rows", 10);
  const readable = C("readable", rows + 40);
  const ms = C("milliseconds", readable + 60);
  const most = C("most", ms + 50);

  const rig = rigKeys(f, [
    [0, { tilt: 0.62, y: 0.25, z: 0.6, x: 0, scale: 0.95 }],
    [most - 10, { tilt: 0.62, y: 0.2, z: 0.6, x: 0, scale: 0.93 }],
    [most + 200, { tilt: 0.64, y: 0.15, z: 0.6, x: 0, scale: 0.91 }],
  ]);

  const start = rows - 6;
  const flights = Array.from({ length: N }).map((_, i) => {
    const a = start + i * EVERY;
    const t = ramp(f, a, a + 22, io);
    const p = hop([WRITER[0], 1.0, WRITER[2]], land(i), t, 1.4);
    return <Cube key={"r" + i} k={k} p={p} s={f >= a ? 0.22 : 0} m={flash(f, a + 22, 14) > 0.3 ? k.m.live : k.m.done} />;
  });
  // the read: lavender beam from the other client to the newest row, right after it lands
  const lastLand = (() => {
    let n = -1;
    for (let i = 0; i < N; i++) if (f >= start + i * EVERY + 22) n = i;
    return n;
  })();
  const readAt = lastLand >= 0 ? start + lastLand * EVERY + 22 + 3 : 1e9;
  const beam = lastLand >= 0 ? ramp(f, readAt, readAt + 6) * (1 - ramp(f, readAt + 26, readAt + 34)) : 0;
  const tgt = land(Math.max(0, lastLand));
  const lateIn = ramp(f, most - 4, most + 16, back(1.3));

  return (
    <Scene3D
      name="Promise · write here, read there"
      rig={rig}
      enter={enter}
      exit={exit}
      tags={(pr) => (
        <>
          <T at={pr([TABLE.c[0], 0.05, TABLE.c[2] + TABLE.d / 2 + 0.25])} dy={14} color={LANCE.orange300}>lance table · object storage</T>
          <T at={pr([WRITER[0], 0, WRITER[2] + 0.45])} dy={18} size={20}>you write</T>
          <T at={pr([READER[0], 0, READER[2] + 0.45])} dy={18} size={20}>another client reads</T>
          <T at={pr([READER[0], 1.2, READER[2]])} o={beam} dy={-22} size={22} color={LANCE.lavender}>found it</T>
          <T at={pr([TABLE.c[0], 2.6, TABLE.c[2] - 1.2])} o={ramp(f, ms - 4, ms + 12)} dy={-20} size={28} color={LANCE.offwhite}>written → readable in milliseconds</T>
          <T at={pr([LATE[0], 1.2, LATE[2]])} o={lateIn} dy={-22} size={20} color={LANCE.dark300}>most platforms · still waiting</T>
        </>
      )}
    >
      <World k={k} rimOn={1} memwal={1} baseN={40} />
      <Pillar k={k} p={WRITER} lit={flash(f, readAt - 25, 14)} />
      <Pillar k={k} p={READER} lit={beam} />
      <Pillar k={k} p={LATE} s={lateIn} />
      {flights}
      <Rod k={k} a={[READER[0], 0.95, READER[2]]} b={[tgt[0], tgt[1] + 0.1, tgt[2]]} m={k.m.beamLav} t={beam} r={0.03} />
    </Scene3D>
  );
};
