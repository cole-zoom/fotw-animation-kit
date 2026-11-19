import * as THREE from "three";
import React, { useMemo } from "react";
import { interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";

/**
 * Ep. 06's picture language — full-text search over table rows.
 *
 *   a row          a thin plate standing in a table, its text written on the
 *                  front face in Aeonik Fono; the plate is as long as its text,
 *                  so a long row LOOKS long (BM25's length factor)
 *   a query word   orange in the row's text wherever it appears
 *   a score        a bar growing to the right of the row, length = the row's
 *                  real BM25 / BM25F score from ftsData.ts (no number shown)
 *   column stats   a small box under a column: rows containing each word and
 *                  the average text length (what BM25 keeps per column)
 *
 * Same room as every other scene in the show: diagramKit's camera, lights,
 * materials and DOM labels; readKit's SceneShell; only the three state colors
 * (dark200 idle, orange400 done, orange300 live) + lavender.
 *
 * Text sits ON the plate: `useText` projects two points one character apart
 * and sizes the type from the projected distance, so the words stay locked to
 * the plate through every camera move (Aeonik Fono advances 0.6 em per char).
 */

export const CW = 0.12; // world units per character at rest
export const ROW_H = 0.4; // plate height
export const ROW_D = 0.18; // plate depth
export const PAD = 0.16; // text inset from the plate's left edge
export const plateW = (text: string) => text.length * CW + PAD * 2;

export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const io = Easing.inOut(Easing.cubic);

type P3 = [number, number, number];
type Proj = (p: P3) => { left: number; top: number; infront: boolean };

/** font size (px) that makes one character span `cw` world units at point p */
export const fontAt = (project: Proj, p: P3, cw = CW) => {
  const a = project(p);
  const b = project([p[0] + cw * 10, p[1], p[2]]);
  return Math.hypot(b.left - a.left, b.top - a.top) / 10 / 0.6;
};

/** where each query word sits inside `text` (character offsets) */
export const hits = (text: string, words: string[]) => {
  const out: { at: number; len: number; word: string }[] = [];
  const low = text.toLowerCase();
  for (const w of words) {
    let i = low.indexOf(w);
    while (i >= 0) {
      const before = i === 0 ? " " : low[i - 1];
      const after = low[i + w.length] ?? " ";
      if (!/[a-z]/.test(before) && !/[a-z]/.test(after)) out.push({ at: i, len: w.length, word: w });
      i = low.indexOf(w, i + 1);
    }
  }
  return out.sort((a, b) => a.at - b.at);
};

/**
 * A row's text, written on the front face of its plate. `lit` 0..1 turns the
 * query words orange; `hl` picks which words (default: all of `words`).
 */
export const RowText: React.FC<{
  project: Proj;
  x: number; // plate left edge (world)
  y: number;
  z: number;
  text: string;
  words?: string[];
  lit?: number;
  litColor?: string;
  color?: string;
  opacity?: number;
  cw?: number;
  /** per-word color overrides, e.g. { big: LANCE.lavender } */
  colors?: Record<string, string>;
}> = ({ project, x, y, z, text, words = [], lit = 0, litColor = LANCE.orange300, color = LANCE.dark100, opacity = 1, cw = CW, colors = {} }) => {
  if (opacity <= 0.01) return null;
  const p: P3 = [x + PAD * (cw / CW), y, z];
  const at = project(p);
  const size = fontAt(project, p, cw);
  const hs = hits(text, words);
  const parts: React.ReactNode[] = [];
  let k = 0;
  hs.forEach((h, i) => {
    if (h.at > k) parts.push(<span key={`t${i}`}>{text.slice(k, h.at)}</span>);
    const c = colors[h.word] ?? litColor;
    parts.push(
      <span key={`h${i}`} style={{ color: lit > 0.5 ? c : color, textShadow: lit > 0.5 ? `0 0 ${10 * lit}px ${c}` : undefined }}>
        {text.slice(h.at, h.at + h.len)}
      </span>,
    );
    k = h.at + h.len;
  });
  if (k < text.length) parts.push(<span key="end">{text.slice(k)}</span>);
  return (
    <div
      style={{
        position: "absolute",
        left: at.left,
        top: at.top,
        transform: "translate(0, -50%)",
        fontFamily: AEONIK_FONO,
        fontWeight: 400,
        fontSize: size,
        letterSpacing: 0,
        whiteSpace: "pre",
        color,
        opacity,
        textShadow: chroma(1.1),
        pointerEvents: "none",
      }}
    >
      {parts}
    </div>
  );
};

/** world x of character `i` of a row's text (for chips that pop off a word) */
export const charX = (x: number, i: number, cw = CW) => x + PAD * (cw / CW) + (i + 0.5) * cw;

/** Ep. 06 materials, on top of diagramKit's: a lavender for "the other thing" */
export const useFtsMaterials = () =>
  useMemo(
    () => ({
      lav: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.lavender),
        emissive: new THREE.Color(LANCE.lavender),
        emissiveIntensity: 0.18,
      }),
      lavGlass: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.lavender),
        emissive: new THREE.Color(LANCE.lavender),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
      ghost: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.dark300),
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
      line: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark300) }),
      lineLit: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange300) }),
      lineLav: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.lavender) }),
    }),
    [],
  );

/** a dashed vertical guide line (the average length), drawn from boxes */
export const Dashes: React.FC<{
  box: THREE.BufferGeometry;
  material: THREE.Material;
  x: number;
  y0: number;
  y1: number;
  z: number;
  on: number;
  n?: number;
}> = ({ box, material, x, y0, y1, z, on, n = 14 }) => {
  if (on <= 0.01) return null;
  const seg = (y1 - y0) / n;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const vis = Math.max(0, Math.min(1, on * n - i));
    if (vis <= 0) break;
    out.push(<mesh key={i} geometry={box} material={material} position={[x, y0 + seg * (i + 0.3), z]} scale={[0.025, seg * 0.55 * vis, 0.025]} />);
  }
  return <>{out}</>;
};

/** 0..1 ramp between two frames */
export const rampAt = (frame: number) => (a: number, b: number, e: (n: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });

/** a pop with overshoot */
export const popAt = (frame: number) => (a: number, d = 14) =>
  interpolate(frame, [a, a + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });

/** a small label pill on a world point, for code identifiers (MultiMatchQuery …) */
export const CodePill: React.FC<{
  at: { left: number; top: number };
  children: React.ReactNode;
  size?: number;
  color?: string;
  border?: string;
  opacity?: number;
  scale?: number;
}> = ({ at, children, size = 26, color = LANCE.offwhite, border = LANCE.orange400, opacity = 1, scale = 1 }) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: at.left,
        top: at.top,
        transform: `translate(-50%, -50%) scale(${scale})`,
        fontFamily: AEONIK_FONO,
        fontWeight: 500,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        padding: "8px 18px",
        backgroundColor: "rgba(23,21,19,0.88)",
        border: `2px solid ${border}`,
        opacity,
        textShadow: chroma(1.2),
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

/** plate width for text written at character width `cw` */
export const plateWc = (text: string, cw: number) => text.length * cw + PAD * 2 * (cw / CW);

export type TableCol = {
  name: string;
  x: number; // left edge of the column's plates
  texts: readonly string[];
  cw?: number;
  /** fixed plate width (defaults to the widest text) */
  w?: number;
  words?: string[];
  colors?: Record<string, string>;
  lit?: number;
  /** 0..1 per row: build-in */
  show?: (i: number) => number;
  /** extra per-row z / y offsets */
  dz?: (i: number) => number;
  dy?: (i: number) => number;
  dim?: (i: number) => number; // 0 = normal, 1 = ghosted
  headColor?: string;
  headOpacity?: number;
  /** per-row plate material / text color overrides */
  mat?: (i: number) => THREE.Material | undefined;
  textColor?: (i: number) => string | undefined;
};

/**
 * Rows of a table as plates, one plate per cell, text on each face, and the
 * column name above. Returns meshes + DOM labels for SceneShell.
 */
export const tableCells = (
  project: Proj,
  box: THREE.BufferGeometry,
  plate: THREE.Material,
  ghost: THREE.Material,
  cols: TableCol[],
  rowY: (i: number) => number,
  key: string,
) => {
  const meshes: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  cols.forEach((c, ci) => {
    const cw = c.cw ?? CW;
    const w = c.w ?? Math.max(...c.texts.map((t) => plateWc(t, cw)));
    let topY = -1e9;
    c.texts.forEach((t, i) => {
      const s = c.show ? c.show(i) : 1;
      if (s <= 0.01) return;
      const y = rowY(i) + (c.dy ? c.dy(i) : 0) - (1 - s) * 0.5;
      const z = c.dz ? c.dz(i) : 0;
      const dim = c.dim ? c.dim(i) : 0;
      topY = Math.max(topY, rowY(i));
      meshes.push(<mesh key={`${key}${ci}-${i}`} geometry={box} material={dim > 0.5 ? ghost : (c.mat && c.mat(i)) || plate} position={[c.x + w / 2, y, z]} scale={[w, ROW_H * s, ROW_D]} />);
      labels.push(
        <RowText
          key={`${key}${ci}-t${i}`}
          project={project}
          x={c.x}
          y={y}
          z={z + ROW_D / 2 + 0.01}
          text={t}
          cw={cw}
          words={c.words}
          colors={c.colors}
          lit={c.lit ?? 0}
          color={(c.textColor && c.textColor(i)) || undefined}
          opacity={s * (1 - dim * 0.82)}
        />,
      );
    });
    if (c.name && topY > -1e8) {
      labels.push(
        <div
          key={`${key}${ci}-h`}
          style={{
            position: "absolute",
            ...(() => {
              const p = project([c.x + PAD, topY + ROW_H / 2 + 0.32, 0]);
              return { left: p.left, top: p.top };
            })(),
            transform: "translate(0, -50%)",
            fontFamily: AEONIK_FONO,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "0.06em",
            color: c.headColor ?? LANCE.dark200,
            opacity: c.headOpacity ?? 1,
            textShadow: chroma(1.1),
            whiteSpace: "nowrap",
          }}
        >
          {c.name}
        </div>,
      );
    }
  });
  return { meshes, labels };
};

/** a column's stats box: a lavender glass block with lines of stats on its face */
export const StatsBox: React.FC<{
  project: Proj;
  at: P3;
  lines: { text: string; color?: string; o?: number }[];
  title?: string;
  open?: number; // 0..1, label fade
}> = ({ project, at, lines, title, open = 1 }) => {
  if (open <= 0.01) return null;
  const p = project(at);
  return (
    <div
      style={{
        position: "absolute",
        left: p.left,
        top: p.top,
        transform: "translate(-50%, -50%)",
        fontFamily: AEONIK_FONO,
        whiteSpace: "nowrap",
        textAlign: "left",
        opacity: open,
        textShadow: chroma(1.1),
      }}
    >
      {title ? <div style={{ fontSize: 20, fontWeight: 500, color: LANCE.lavender, letterSpacing: "0.06em", marginBottom: 6 }}>{title}</div> : null}
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 20, lineHeight: 1.45, color: l.color ?? LANCE.dark100, opacity: l.o ?? 1 }}>
          {l.text}
        </div>
      ))}
    </div>
  );
};
