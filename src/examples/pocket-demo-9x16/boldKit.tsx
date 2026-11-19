import React from "react";
import { useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma, Fuzz, Scanlines } from "./retro";
import { useSceneTransition, SceneTransition } from "./sceneTransition";
import { WhooshStreaks } from "./WhooshStreaks";

/**
 * Ep. 07 V3 explainer kit (Nov 10 feedback: the visuals weren't engaging enough, + text
 * sliding off its bars in Bm25Refresher3D).
 *
 * Everything here is CSS 3D, not three.js + projected DOM labels. A word is
 * written ON the face of the slab it belongs to, so it moves with the slab at
 * every frame and can never drift off it. The camera is a transform on the
 * world div; perspective comes from the stage.
 *
 * World units are CSS pixels. At z = 0 with the default camera, 1 unit = 1 px
 * of the 1920×1080 frame, origin at frame centre, y down.
 *
 * No titles, kickers or verdict lines (Cole: "it reads as ai generated").
 * Objects carry their own labels; captions carry the words.
 */

export const PERSPECTIVE = 1700;

export type Cam = { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number };
export type V3 = [number, number, number];

// ─── timing ───────────────────────────────────────────────────────────────
export const io = Easing.bezier(0.45, 0, 0.15, 1);
/** 0→1 between frames a and b */
export const ramp = (f: number, a: number, b: number, ease: (n: number) => number = io) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** a lively 0→1 (overshoots a touch) starting at frame `at` */
export const pop = (f: number, at: number, stiffness = 170, damping = 13) =>
  spring({ frame: f - at, fps: 60, config: { stiffness, damping, mass: 0.7 } });
/** a settled 0→1 with no overshoot */
export const glide = (f: number, at: number, stiffness = 90) =>
  spring({ frame: f - at, fps: 60, config: { stiffness, damping: 22, mass: 1 } });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixV = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
/** camera keyframes: [[frame, cam], …], eased between neighbours */
export const camPath = (f: number, keys: [number, Cam][]): Cam => {
  const k = ["x", "y", "z", "rx", "ry", "rz"] as const;
  const out: Cam = {};
  for (const p of k) {
    const fs = keys.map((q) => q[0]);
    const vs = keys.map((q) => q[1][p] ?? 0);
    out[p] = keys.length === 1 ? vs[0] : interpolate(f, fs, vs, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
  }
  return out;
};

// ─── stage ────────────────────────────────────────────────────────────────
/**
 * Full-bleed opaque panel (dark800) with the scene transition, a floor grid
 * that lives IN the world (so camera moves read as depth), the show's scanline
 * grade, and whoosh streaks.
 */
export const Stage: React.FC<{
  name: string;
  cam: Cam;
  enter?: SceneTransition;
  exit?: SceneTransition;
  floorY?: number;
  children: React.ReactNode;
  over?: React.ReactNode;
}> = ({ name, cam, enter = "slide", exit = "slide", floorY = 420, children, over }) => {
  const tr = useSceneTransition({ enter, exit });
  const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 } = cam;
  return (
    <div
      name={name}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `radial-gradient(ellipse 90% 75% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)`,
        opacity: tr.opacity,
        transform: tr.transform,
        filter: tr.filter,
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, perspective: PERSPECTIVE, perspectiveOrigin: "0 0" }}>
        <div
          name="World"
          style={{
            position: "absolute",
            transformStyle: "preserve-3d",
            transform: `translateZ(${-z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate3d(${-x}px, ${-y}px, 0px)`,
          }}
        >
          <Floor y={floorY} />
          {children}
        </div>
      </div>
      {over}
      <Scanlines opacity={0.12} />
      <Fuzz opacity={0.16} />
      <WhooshStreaks amount={tr.whoosh} />
    </div>
  );
};

const Floor: React.FC<{ y: number }> = ({ y }) => (
  <div
    name="Floor"
    style={{
      position: "absolute",
      left: -4000,
      top: -4000,
      width: 8000,
      height: 8000,
      transform: `translate3d(0px, ${y}px, 0px) rotateX(90deg)`,
      backgroundImage: `linear-gradient(${LANCE.dark600} 2px, transparent 2px), linear-gradient(90deg, ${LANCE.dark600} 2px, transparent 2px)`,
      backgroundSize: "160px 160px",
      backgroundPosition: "-1px -1px",
      opacity: 0.9,
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.6) 14%, transparent 30%)",
      maskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.6) 14%, transparent 30%)",
    }}
  />
);

// ─── placement ────────────────────────────────────────────────────────────
/** Puts its children, centred, at a world point. */
export const At: React.FC<{
  p: V3;
  r?: V3;
  s?: number;
  o?: number;
  name?: string;
  anchor?: "center" | "left" | "right" | "bottom" | "top" | "bottomLeft";
  children: React.ReactNode;
}> = ({ p, r = [0, 0, 0], s = 1, o = 1, name, anchor = "center", children }) => {
  if (o <= 0.001) return null;
  const a = {
    center: "translate(-50%, -50%)",
    left: "translate(0, -50%)",
    right: "translate(-100%, -50%)",
    bottom: "translate(-50%, -100%)",
    top: "translate(-50%, 0)",
    bottomLeft: "translate(0, -100%)",
  }[anchor];
  return (
    <div
      name={name}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transformStyle: o < 1 ? undefined : "preserve-3d",
        transform: `translate3d(${p[0]}px, ${p[1]}px, ${p[2]}px) rotateX(${r[0]}deg) rotateY(${r[1]}deg) rotateZ(${r[2]}deg) scale(${s})`,
        opacity: o,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, transform: a, transformStyle: o < 1 ? undefined : "preserve-3d" }}>{children}</div>
    </div>
  );
};

// ─── slab ─────────────────────────────────────────────────────────────────
export const TONE = {
  idle: { face: LANCE.dark600, edge: "#26211d", ink: LANCE.offwhite, line: LANCE.dark500 },
  card: { face: "#262220", edge: "#1b1816", ink: LANCE.offwhite, line: LANCE.dark500 },
  dim: { face: "#221e1b", edge: "#1a1715", ink: LANCE.dark400, line: LANCE.dark600 },
  hit: { face: LANCE.orange400, edge: "#b8441f", ink: LANCE.dark800, line: LANCE.orange300 },
  live: { face: LANCE.orange300, edge: "#c35a3a", ink: LANCE.dark800, line: LANCE.orange300 },
  big: { face: LANCE.lavender, edge: "#a68fb8", ink: LANCE.dark800, line: LANCE.lavender },
  paper: { face: LANCE.dark100, edge: "#a99d96", ink: LANCE.dark800, line: LANCE.dark200 },
} as const;
export type Tone = keyof typeof TONE;

/**
 * A box with depth `d` going back from its face. The face is a normal div, so
 * children (text) sit on it exactly. `glow` 0..1 adds an orange bloom.
 */
export const Slab: React.FC<{
  w: number;
  h: number;
  d?: number;
  tone?: Tone;
  radius?: number;
  glow?: number;
  outline?: boolean;
  name?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, d = 22, tone = "card", radius = 12, glow = 0, outline = true, name, style, children }) => {
  const t = TONE[tone];
  const side: React.CSSProperties = { position: "absolute", background: t.edge };
  return (
    <div name={name} style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d" }}>
      {d > 0 && (
        <>
          <div style={{ ...side, left: 0, top: 0, width: w, height: d, transformOrigin: "50% 0", transform: "rotateX(-90deg)", filter: "brightness(1.25)" }} />
          <div style={{ ...side, left: 0, top: h, width: w, height: d, transformOrigin: "50% 0", transform: "rotateX(-90deg)", filter: "brightness(0.7)" }} />
          <div style={{ ...side, left: 0, top: 0, width: d, height: h, transformOrigin: "0 50%", transform: "rotateY(90deg)" }} />
          <div style={{ ...side, left: w, top: 0, width: d, height: h, transformOrigin: "0 50%", transform: "rotateY(90deg)", filter: "brightness(0.85)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: radius, background: t.edge, transform: `translateZ(${-d}px)` }} />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: `linear-gradient(180deg, ${t.face} 0%, ${shade(t.face, -0.1)} 100%)`,
          border: outline ? `2px solid ${t.line}` : undefined,
          boxSizing: "border-box",
          boxShadow:
            glow > 0
              ? `0 0 ${50 * glow}px ${8 * glow}px rgba(255,115,74,${0.45 * glow}), inset 0 1px 0 rgba(255,255,255,0.12)`
              : "inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** lighten (+) / darken (−) a #rrggbb by a fraction */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(Math.max(0, Math.min(255, k >= 0 ? v + (255 - v) * k : v * (1 + k))));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// ─── type ─────────────────────────────────────────────────────────────────
/** Approximate advance of Aeonik Fono / Aeonik per em, for sizing slabs around text. */
export const FONO_EM = 0.6;
export const SANS_EM = 0.5;
export const textW = (t: string, size: number, mono = true) => t.length * size * (mono ? FONO_EM : SANS_EM);

export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  mono?: boolean;
  weight?: number;
  track?: string;
  fringe?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 40, color = LANCE.offwhite, mono = true, weight = 500, track = "0.01em", fringe = 1, style }) => (
  <div
    style={{
      fontFamily: mono ? AEONIK_FONO : AEONIK,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: track,
      color,
      whiteSpace: "nowrap",
      lineHeight: 1,
      textShadow: fringe > 0 ? chroma(fringe) : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A word token: a chip with the word centred on its face. */
export const Chip: React.FC<{
  text: string;
  tone?: Tone;
  size?: number;
  w?: number;
  h?: number;
  d?: number;
  glow?: number;
  mono?: boolean;
}> = ({ text, tone = "idle", size = 40, w, h, d = 16, glow = 0, mono = true }) => {
  const W = w ?? Math.round(textW(text, size, mono) + size * 0.9);
  const H = h ?? Math.round(size * 1.7);
  return (
    <Slab w={W} h={H} d={d} tone={tone} radius={Math.min(14, H * 0.3)} glow={glow}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Label size={size} color={TONE[tone].ink} mono={mono} fringe={tone === "idle" || tone === "card" || tone === "dim" ? 1 : 0}>
          {text}
        </Label>
      </div>
    </Slab>
  );
};
export const chipW = (text: string, size = 40, mono = true) => Math.round(textW(text, size, mono) + size * 0.9);

/**
 * A sentence as a row of word chips (a tokenised row). `tone(i, word)` picks
 * each chip's tone. Returns its own width via rowW for layout.
 */
export const WordRow: React.FC<{
  words: readonly string[];
  size?: number;
  gap?: number;
  tone?: (i: number, w: string) => Tone;
  glow?: (i: number, w: string) => number;
  show?: (i: number) => number; // 0..1 per chip (pops in)
  d?: number;
}> = ({ words, size = 36, gap = 10, tone = () => "idle", glow = () => 0, show = () => 1, d = 14 }) => (
  <div style={{ display: "flex", gap, transformStyle: "preserve-3d" }}>
    {words.map((w, i) => {
      const s = show(i);
      return (
        <div
          key={i}
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(0, ${(1 - s) * -60}px, ${(1 - s) * 120}px) scale(${0.6 + 0.4 * Math.min(1, s)})`,
            opacity: Math.min(1, s * 1.6),
          }}
        >
          <Chip text={w} size={size} tone={tone(i, w)} glow={glow(i, w)} d={d} />
        </div>
      );
    })}
  </div>
);
export const rowW = (words: readonly string[], size = 36, gap = 10) => words.reduce((a, w) => a + chipW(w, size), 0) + gap * (words.length - 1);

/** A score bar lying along +x, growing from its left end. */
export const Bar: React.FC<{ len: number; h?: number; d?: number; tone?: Tone; glow?: number }> = ({ len, h = 44, d = 26, tone = "hit", glow = 0.6 }) =>
  len < 1 ? null : <Slab w={len} h={h} d={d} tone={tone} radius={8} glow={glow} outline={false} />;

/** A flat glyph (✓ / ✕) badge. */
export const Badge: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 64 }) => (
  <Slab w={size} h={size} d={12} tone={ok ? "hit" : "dim"} radius={size / 2} glow={ok ? 0.7 : 0}>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Label size={size * 0.56} color={ok ? LANCE.dark800 : LANCE.dark300} fringe={0} weight={500}>
        {ok ? "✓" : "✕"}
      </Label>
    </div>
  </Slab>
);

export const useF = () => useCurrentFrame();

// ─── rows ─────────────────────────────────────────────────────────────────
/** query-word colours: "big" lavender, "elephant" orange (the show's two query terms) */
export const HL: Record<string, string> = { big: LANCE.lavender, elephant: LANCE.orange400, elephants: LANCE.orange400, john: LANCE.orange400, smith: LANCE.lavender };
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** A table row as a card, its text on the face; query words glow in their colour. */
export const RowCard: React.FC<{
  text: string;
  w: number;
  h?: number;
  size?: number;
  d?: number;
  tone?: Tone;
  hl?: (word: string) => string | undefined; // colour for a word, or undefined
  lit?: number; // 0..1 how strongly the query words are lit
  glow?: number;
  align?: "left" | "center";
  name?: string;
}> = ({ text, w, h = 72, size = 32, d = 20, tone = "card", hl, lit = 1, glow = 0, align = "left", name }) => {
  const pick = hl ?? ((x: string) => HL[bare(x)]);
  const words = text.split(" ");
  return (
    <Slab w={w} h={h} d={d} tone={tone} glow={glow} name={name}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : "center", padding: `0 ${size * 0.8}px` }}>
        <div style={{ fontFamily: AEONIK, fontSize: size, fontWeight: 500, color: TONE[tone].ink, whiteSpace: "nowrap", textShadow: chroma(0.8), lineHeight: 1 }}>
          {words.map((x, i) => {
            const c = pick(x);
            return (
              <span key={i} style={{ color: c && lit > 0 ? mixColor(TONE[tone].ink, c, lit) : undefined }}>
                {x}
                {i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </Slab>
  );
};
/** approximate width of a RowCard that fits `text` */
export const rowCardW = (text: string, size = 32) => Math.round(text.length * size * 0.5 + size * 1.8);

/** blend two #rrggbb colours */
export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};
