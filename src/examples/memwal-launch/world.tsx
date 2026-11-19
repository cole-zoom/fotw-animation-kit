import React from "react";
import { Box, Plate, Cube, File, Pillar, Query, Rod, Outline, slot, stack, mix, LANCE, V3, Kit } from "./rte3d";

/**
 * V3 — ONE WORLD (ANIMATION_PLAN.md). Every engine-era scene is built on this
 * exact layout so a cut never moves the furniture:
 *
 *   the floor          object storage. Matte black, always at y = 0.
 *   the table          one outlined footprint on the floor. Back part = base
 *                      (grey cube grid). Front strip = _mem_wal (WAL files on
 *                      the left, SSTables on the right).
 *   above the floor    memory: the RTE node / "your process" hovers over the table.
 *   clients            pillars on the left; readers on the right.
 *   workers            back-right (Enterprise only).
 *
 * Rows are cubes: grey = in the base table, coral = new / not merged.
 * Files on storage are paper tiles. Reads and indexes are lavender.
 */

export const FLOOR = { w: 17, d: 7.4 };
export const TABLE = { c: [0.6, 0, 0.1] as V3, w: 6.4, d: 3.9 };
export const BASE = { c: [0.6, 0.06, -0.55] as V3, cols: 12, rows: 4, pitch: 0.42 };
export const MEMWAL = { c: [0.6, 0.04, 1.45] as V3, w: 6.0, d: 0.9 };
export const WALX = (i: number) => -2.0 + (i % 9) * 0.42; // WAL file slots, front-left of the table
export const SSTX = (g: number) => 2.0 + (g - 1) * 0.85; //  SSTable slots, front-right
export const NODE = { c: [0.6, 2.3, -0.3] as V3, w: 4.8, d: 2.2, h: 0.3 };
export const PADX = (j: number, n: number) => NODE.c[0] + (j - (n - 1) / 2) * (n > 2 ? 1.15 : 2.0);
export const CLIENTS: V3[] = [[-6.8, 0, -1.8], [-6.8, 0, 0], [-6.8, 0, 1.8]];
export const GATE: V3 = [-4.4, 0, 0];
export const READER: V3 = [6.9, 0, 0.9];
export const WORKERS: V3[] = [[5.6, 0, -3.0], [7.0, 0, -3.0]];

export const basePos = (i: number): V3 => {
  const p = slot(i, BASE.cols, BASE.rows, BASE.pitch, BASE.c[1]);
  return [BASE.c[0] + p[0], p[1], BASE.c[2] + p[2]];
};
export const walPos = (i: number): V3 => [WALX(i), MEMWAL.c[1], MEMWAL.c[2] + (Math.floor(i / 9) - 0.5) * 0.36];
export const sstPos = (g: number): V3 => [SSTX(g), MEMWAL.c[1], MEMWAL.c[2]];
export const padPos = (j: number, n: number, y = NODE.c[1]): V3 => [PADX(j, n), y + 0.02, NODE.c[2]];
export const padSlot = (j: number, n: number, k: number, y = NODE.c[1]): V3 => {
  const s = stack(k, 4, 0.24);
  const p = padPos(j, n, y);
  return [p[0] + s[0], p[1] + s[1] - 0.12, p[2] + s[2]];
};

/** floor + table outline + base grid + _mem_wal strip. `baseN` grey rows in the base (max 48). */
export const World: React.FC<{
  k: Kit;
  rimOn?: number; //       table outline turns coral (RTE on / "inside your table")
  memwal?: number; //      _mem_wal strip opens
  baseN?: number;
  baseNew?: number; //     how many of the last base rows are freshly merged (coral)
  floorW?: number;
  show?: boolean;
}> = ({ k, rimOn = 0, memwal = 0, baseN = 40, baseNew = 0, floorW = FLOOR.w, show = true }) => {
  const s = show ? 1 : 0.0001;
  return (
    <>
      <Plate k={k} p={[0, 0, 0]} w={floorW * s} d={FLOOR.d * s} />
      <Plate k={k} p={[TABLE.c[0], 0.03, TABLE.c[2]]} w={TABLE.w * s} d={TABLE.d * s} h={0.03} m={k.m.plateHi} />
      <Outline k={k} p={[TABLE.c[0], 0.04, TABLE.c[2]]} w={TABLE.w + 0.3} d={TABLE.d + 0.3} m={k.m.rim} o={show ? 1 - rimOn : 0} />
      <Outline k={k} p={[TABLE.c[0], 0.04, TABLE.c[2]]} w={TABLE.w + 0.3} d={TABLE.d + 0.3} m={k.m.rimHot} o={show ? rimOn : 0} />
      <Box k={k} p={[MEMWAL.c[0], 0.045, MEMWAL.c[2]]} s={[MEMWAL.w * memwal * s, 0.012, MEMWAL.d]} m={k.m.ghost} />
      {Array.from({ length: 48 }).map((_, i) => (
        <Cube key={"base" + i} k={k} p={basePos(i)} s={show && i < baseN ? 0.24 : 0} m={i >= baseN - baseNew ? k.m.done : k.m.idle} />
      ))}
    </>
  );
};

/** the RTE node (or "your process"): a hovering platform with n MemTable pads. */
export const NodeDeck: React.FC<{
  k: Kit;
  y?: number; //      hover height (0 = sunk into the table)
  s?: number; //      0..1 visible
  pads?: number;
  rim?: boolean;
  dx?: number;
}> = ({ k, y = NODE.c[1], s = 1, pads = 2, rim = true, dx = 0 }) => (
  <>
    <Plate k={k} p={[NODE.c[0] + dx, y, NODE.c[2]]} w={s > 0.01 ? NODE.w * s : 0.001} d={s > 0.01 ? NODE.d * s : 0.001} h={NODE.h} m={k.m.plateHi} rim={rim && s > 0.5 ? 1 : 0} />
    {Array.from({ length: 4 }).map((_, j) => (
      <Plate key={"pad" + j} k={k} p={[PADX(j, pads) + dx, y + 0.02, NODE.c[2]]} w={j < pads && s > 0.5 ? (pads > 2 ? 1.0 : 1.5) : 0.001} d={j < pads && s > 0.5 ? 1.3 : 0.001} h={0.02} m={k.m.ghost} />
    ))}
  </>
);

/** n cubes stacked on pad j (fixed 40 meshes). `lit` = last k glow; `dim` = last k ghost (not yet visible). */
export const PadCubes: React.FC<{ k: Kit; j: number; pads: number; n: number; y?: number; lit?: number; dim?: number; dx?: number; keyp: string }> = ({
  k, j, pads, n, y = NODE.c[1], lit = 0, dim = 0, dx = 0, keyp,
}) => (
  <>
    {Array.from({ length: 40 }).map((_, i) => {
      const p = padSlot(j, pads, i, y);
      const m = i >= n - dim && i < n ? k.m.ghost : i >= n - lit - dim && i < n ? k.m.live : k.m.done;
      return <Cube key={keyp + i} k={k} p={[p[0] + dx, p[1], p[2]]} s={i < n ? 0.19 : 0} m={m} />;
    })}
  </>
);

/** the live index riding on a pad: a lavender glass layer, flashing solid on `hit`. */
export const PadIndex: React.FC<{ k: Kit; j: number; pads: number; n: number; v: number; hit?: number; y?: number; dx?: number }> = ({ k, j, pads, n, v, hit = 0, y = NODE.c[1], dx = 0 }) => {
  const top = y + 0.02 + Math.ceil(Math.max(1, n) / 16) * 0.24 + 0.05;
  return <Box k={k} p={[PADX(j, pads) + dx, top, NODE.c[2]]} s={v > 0.01 && n > 0 ? [1.0 * v, 0.04, 1.0] : 0} m={hit > 0.3 ? k.m.lav : k.m.lavGlass} />;
};

export { Box, Plate, Cube, File, Pillar, Query, Rod, Outline, mix, LANCE };
