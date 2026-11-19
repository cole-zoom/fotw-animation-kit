import React from "react";
import { interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";
import { At, Slab, Label, Badge, ramp, mix, mixV, TONE, Tone, V3 } from "./boldKit";

/**
 * RTE launch kit, on top of the FOTW boldKit (CSS 3D slabs, text printed on
 * the face, camera = transform on the world). Same show language, played
 * straight: no stickers, no gag stamps, no titles. Objects carry their labels,
 * captions carry the words.
 *
 * Vocabulary (matches the docs + sophon code): client, RTE node, shard,
 * MemTable, WAL, SSTable (gen n), base table, object storage, worker.
 * The in-memory vector index is never named (Chang: nothing that implies HNSW
 * is our main vector index) — index chips read "scalar", "full-text", "vector".
 */

// ─── motion helpers ──────────────────────────────────────────────────────
/** 0→1 over n frames from `at` */
export const inn = (f: number, at: number, n = 18, ease: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + n], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** a point flying a→b between frames, with a little arc in -y and toward camera */
export const fly = (f: number, a: V3, b: V3, at: number, n = 30, arc = 120): V3 => {
  const t = ramp(f, at, at + n);
  const p = mixV(a, b, t);
  const k = Math.sin(t * Math.PI);
  return [p[0], p[1] - arc * k, p[2] + arc * 0.6 * k];
};
/** lands: 1 for `n` frames after `at`, used to flash a target when something arrives */
export const flash = (f: number, at: number, n = 24) =>
  f < at ? 0 : Math.max(0, 1 - (f - at) / n);

// ─── objects ─────────────────────────────────────────────────────────────

/** Black pill with white type, like the blog diagrams' client boxes. */
export const Client: React.FC<{ text: string; w?: number; h?: number; glow?: number; size?: number }> = ({
  text,
  w,
  h = 96,
  glow = 0,
  size = 40,
}) => {
  const W = w ?? Math.round(text.length * size * 0.56 + size * 2);
  return (
    <div style={{ position: "relative", width: W, height: h, transformStyle: "preserve-3d" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          background: "#0e0c0b",
          border: `2px solid ${glow > 0 ? LANCE.orange400 : "#3a332e"}`,
          boxShadow: glow > 0 ? `0 0 ${46 * glow}px ${6 * glow}px rgba(255,115,74,${0.4 * glow})` : "0 18px 40px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Label size={size} mono={false} color={LANCE.offwhite} fringe={1}>
          {text}
        </Label>
      </div>
    </div>
  );
};

/** A single row: a small coral block. `tone` hit (new) / idle (old) / dim. */
export const Row: React.FC<{ w?: number; h?: number; tone?: Tone; glow?: number; text?: string }> = ({
  w = 120,
  h = 40,
  tone = "hit",
  glow = 0.5,
  text,
}) => (
  <Slab w={w} h={h} d={16} tone={tone} radius={8} glow={glow} outline={tone !== "hit"}>
    {text ? (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Label size={h * 0.5} color={TONE[tone].ink} fringe={0}>
          {text}
        </Label>
      </div>
    ) : null}
  </Slab>
);

/** Caption-sized label that floats in world space (a plain word, no plate). */
export const Tag: React.FC<{ children: React.ReactNode; size?: number; color?: string; mono?: boolean; weight?: number }> = ({
  children,
  size = 30,
  color = LANCE.dark200,
  mono = true,
  weight = 500,
}) => (
  <Label size={size} color={color} mono={mono} weight={weight} track={mono ? "0.04em" : "-0.01em"}>
    {children}
  </Label>
);

/**
 * A card with a heading (top-left) and an optional sub (top-right). Children
 * are laid out absolutely inside, in card pixels.
 */
export const Card: React.FC<{
  w: number;
  h: number;
  title?: string;
  sub?: string;
  tone?: Tone;
  accent?: boolean;
  glow?: number;
  d?: number;
  titleSize?: number;
  dashed?: boolean;
  children?: React.ReactNode;
}> = ({ w, h, title, sub, tone = "card", accent = false, glow = 0, d = 26, titleSize = 40, dashed = false, children }) => (
  <Slab
    w={w}
    h={h}
    d={d}
    tone={tone}
    radius={20}
    glow={glow}
    style={{
      border: dashed ? `3px dashed ${LANCE.dark400}` : accent ? `3px solid ${LANCE.orange400}` : undefined,
      background: dashed ? "rgba(30,27,25,0.35)" : undefined,
    }}
  >
    {title ? (
      <div style={{ position: "absolute", left: 30, top: 26 }}>
        <Label size={titleSize} mono={false} color={TONE[tone].ink} fringe={tone === "card" ? 1 : 0}>
          {title}
        </Label>
      </div>
    ) : null}
    {sub ? (
      <div style={{ position: "absolute", right: 30, top: 32 }}>
        <Label size={titleSize * 0.62} color={tone === "card" ? LANCE.dark300 : TONE[tone].ink} fringe={0}>
          {sub}
        </Label>
      </div>
    ) : null}
    {children}
  </Slab>
);

/** Horizontal fill bar (MemTable fill), printed on a card face. */
export const FillBar: React.FC<{ w: number; h?: number; v: number; color?: string }> = ({ w, h = 22, v, color = LANCE.orange400 }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: h / 2, background: LANCE.dark600, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${Math.max(0, Math.min(1, v)) * 100}%`,
        background: `linear-gradient(90deg, ${LANCE.orange500}, ${color})`,
        boxShadow: v > 0.01 ? `0 0 14px rgba(255,115,74,0.6)` : undefined,
      }}
    />
  </div>
);

/** A small square file tile (WAL entry, metadata file, SSTable). */
export const Tile: React.FC<{ s?: number; w?: number; tone?: Tone; text?: string; glow?: number; size?: number }> = ({
  s = 70,
  w,
  tone = "paper",
  text,
  glow = 0,
  size,
}) => (
  <Slab w={w ?? s} h={s} d={14} tone={tone} radius={10} glow={glow}>
    {text ? (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Label size={size ?? s * 0.34} color={TONE[tone].ink} fringe={0}>
          {text}
        </Label>
      </div>
    ) : null}
  </Slab>
);

/**
 * Object storage: a wide light plate lying flat-ish under the scene. It is
 * drawn as a standing card here; scenes put it low in frame and tilt the
 * camera down onto it.
 */
export const Storage: React.FC<{ w: number; h: number; title?: string; sub?: string; glow?: number; children?: React.ReactNode }> = ({
  w,
  h,
  title = "object storage",
  sub,
  glow = 0,
  children,
}) => (
  <Slab
    w={w}
    h={h}
    d={34}
    tone="card"
    radius={24}
    glow={glow}
    style={{ background: `linear-gradient(180deg, #2b2623 0%, #221e1b 100%)`, border: `2px solid ${LANCE.dark500}` }}
  >
    <div style={{ position: "absolute", left: 34, top: 28 }}>
      <Label size={34} mono={false} color={LANCE.offwhite} fringe={1}>
        {title}
      </Label>
      {sub ? (
        <div style={{ marginTop: 10 }}>
          <Label size={24} color={LANCE.dark300} fringe={0}>
            {sub}
          </Label>
        </div>
      ) : null}
    </div>
    {children}
  </Slab>
);

/** Base table: the black slab with its own indexes (as in the blog diagrams). */
export const BaseTable: React.FC<{ w: number; h: number; rows?: number; idx?: number; plus?: number; title?: string }> = ({
  w,
  h,
  rows = 0.7,
  idx = 0.7,
  plus = 0,
  title = "base table",
}) => (
  <Slab w={w} h={h} d={30} tone="card" radius={18} style={{ background: "#0e0c0b", border: `2px solid #3a332e` }}>
    <div style={{ position: "absolute", left: 30, top: 24 }}>
      <Label size={36} mono={false} color={LANCE.offwhite} fringe={1}>
        {title}
      </Label>
    </div>
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 64, display: "flex", alignItems: "center", gap: 18 }}>
      <Label size={20} color={LANCE.dark300} fringe={0} style={{ width: 70 }}>
        rows
      </Label>
      <div style={{ position: "relative", flex: 1, height: 18, borderRadius: 9, background: "#2a2522" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${rows * 100}%`, borderRadius: 9, background: LANCE.dark500 }} />
        <div
          style={{
            position: "absolute",
            left: `${rows * 100}%`,
            top: 0,
            bottom: 0,
            width: `${plus * (1 - rows) * 100}%`,
            borderRadius: 9,
            background: LANCE.orange400,
            boxShadow: plus > 0.01 ? "0 0 14px rgba(255,115,74,0.7)" : undefined,
          }}
        />
      </div>
    </div>
    <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, display: "flex", alignItems: "center", gap: 18 }}>
      <Label size={20} color={LANCE.dark300} fringe={0} style={{ width: 70 }}>
        index
      </Label>
      <div style={{ position: "relative", flex: 1, height: 18, borderRadius: 9, background: "#2a2522" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${idx * 100}%`, borderRadius: 9, background: LANCE.dark500 }} />
      </div>
    </div>
  </Slab>
);

/** Millisecond / second readout. */
export const Readout: React.FC<{ value: string; unit: string; size?: number; color?: string; sub?: string }> = ({
  value,
  unit,
  size = 120,
  color = LANCE.offwhite,
  sub,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.12 }}>
      <div
        style={{
          fontFamily: AEONIK,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color,
          textShadow: chroma(1.4),
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: AEONIK, fontWeight: 500, fontSize: size * 0.42, color, textShadow: chroma(1), whiteSpace: "nowrap" }}>{unit}</div>
    </div>
    {sub ? (
      <div style={{ marginTop: size * 0.16 }}>
        <Label size={Math.max(22, size * 0.2)} color={LANCE.dark200} fringe={0}>
          {sub}
        </Label>
      </div>
    ) : null}
  </div>
);

/** A dashed connector between two world points (flat, in the z of `a`). */
export const Wire: React.FC<{ a: V3; b: V3; o?: number; color?: string; dash?: boolean; t?: number; w?: number }> = ({
  a,
  b,
  o = 1,
  color = LANCE.dark400,
  dash = false,
  t = 1,
  w = 4,
}) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy) * t;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (len < 1 || o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: len,
        height: w,
        transformOrigin: "0 50%",
        transform: `translate3d(${a[0]}px, ${a[1] - w / 2}px, ${a[2]}px) rotateZ(${ang}deg)`,
        background: dash ? `repeating-linear-gradient(90deg, ${color} 0 14px, transparent 14px 26px)` : color,
        opacity: o,
        borderRadius: w / 2,
      }}
    />
  );
};

/** ✓ / ✕ that pops in at a world point. */
export const Mark: React.FC<{ p: V3; ok: boolean; v: number; size?: number }> = ({ p, ok, v, size = 64 }) =>
  v <= 0.01 ? null : (
    <At p={p} s={0.5 + 0.5 * v} o={Math.min(1, v * 1.5)}>
      <Badge ok={ok} size={size} />
    </At>
  );

export { At, Slab, Label, Badge, ramp, mix, mixV, TONE };
export type { Tone, V3 };
