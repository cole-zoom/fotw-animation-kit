import { staticFile } from "remotion";
import React from "react";
import { Img } from "remotion";
import { LANCE } from "./lanceTheme";
import { At, Slab, Label, Tone, TONE, mix, V3 } from "./boldKit";
import { DROID } from "./droidData";
import { RTE_ROWS, RTE_SPRITE } from "./rteRows";
import { WEB_ROWS, WEB_TABLE, MARCO_ROWS, MARCO_TABLE } from "./webRows";

/**
 * The real Lance table, as drawn in the 30-second-lance pocket demo (Cole, Nov 12:
 * "use an actual lance table, not this representation"). Same `frames` table, same
 * rows: lerobot/droid_100 in a real LanceDB table (32,212 rows, 100 episodes,
 * 3 cameras), read back by 30-second-lance/tools/export_video_data.py into
 * droidData.ts. Nothing typed in by hand.
 *
 * World units are px at z = 0 (boldKit), origin at frame centre, y down.
 */

export const SRC = {
  rows: staticFile("examples/memwal-launch/rte_rows.jpg"), // work/graphics/rte_rows.jpg — 98 real rows (wrist | exterior_1), tools/export_rows.py
};
export type DroidRow = (typeof RTE_ROWS)[number];
/** 98 real rows, one per DROID episode (frame 60), read out of the LanceDB table — see work/tools/export_rows.py */
export const ROWS = RTE_ROWS;
export { DROID };

// full-size row (pocket demo geometry)
export const W = 964;
export const RH = 96;
export const PITCH = 108;

type SpriteMeta = { cols: number; w: number; h: number; count: number };
export const Frame: React.FC<{ src: string; meta: SpriteMeta; k: number; w: number; r?: number }> = ({ src, meta, k, w, r = 8 }) => {
  const h = (w * meta.h) / meta.w;
  const sc = w / meta.w;
  const kk = ((Math.floor(k) % meta.count) + meta.count) % meta.count;
  const rows = Math.ceil(meta.count / meta.cols);
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative", borderRadius: r, background: LANCE.dark800, flexShrink: 0 }}>
      <Img src={src} style={{ position: "absolute", maxWidth: "none", width: meta.cols * meta.w * sc, height: rows * meta.h * sc, left: -(kk % meta.cols) * w, top: -Math.floor(kk / meta.cols) * h }} />
    </div>
  );
};
export const Thumb: React.FC<{ k: number; w: number; r?: number }> = ({ k, w, r }) => <Frame src={SRC.rows} meta={RTE_SPRITE} k={k} w={w} r={r} />;

const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s || "—");
export const vec = (v: readonly number[]) => `[${v.map((x) => x.toFixed(2)).join(", ")}, …]`;

/** lavender ring (a read / a search hit) or coral ring (new / unmerged) around a row */
const ring = (lav: number, hot: number) => {
  const s: string[] = [];
  if (lav > 0.01) s.push(`0 0 0 ${3 + 2 * lav}px rgba(231,210,246,${lav})`, `0 0 ${36 * lav}px rgba(231,210,246,${0.55 * lav})`);
  if (hot > 0.01) s.push(`0 0 0 ${3 + 2 * hot}px rgba(255,137,103,${hot})`);
  return s.length ? s.join(", ") : undefined;
};

/** one real timestep row: wrist | exterior_1 | episode · t + instruction | gripper | embedding */
export const Row: React.FC<{ r: DroidRow; tone?: Tone; glow?: number; lav?: number; hot?: number; ghost?: number; tag?: string; tagColor?: string }> = ({
  r, tone: tone0 = "card", glow = 0, lav = 0, hot = 0, ghost = 0, tag, tagColor = LANCE.orange300,
}) => {
  // a read lights the row itself lavender (Cole: "just highlight the ones in the row", no beams)
  const tone: Tone = lav > 0.5 ? "big" : tone0;
  const dark = tone === "hit" || tone === "big";
  return (
  <div style={{ position: "relative", transformStyle: "preserve-3d", borderRadius: 12, boxShadow: ring(0, hot) }}>
    <Slab w={W} h={RH} d={18} tone={tone} glow={glow} radius={12}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", opacity: 1 - 0.65 * ghost }}>
        <Thumb k={r.wrist} w={136} />
        <Thumb k={r.ext} w={136} />
        <div style={{ width: 254, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={22} color={dark ? LANCE.dark800 : LANCE.offwhite} fringe={dark ? 0 : 1}>{r.episode} · {r.t.toFixed(2)}s</Label>
          <Label size={17} color={dark ? LANCE.dark700 : LANCE.dark300} mono={false} fringe={dark ? 0 : 1}>{short(r.instruction, 30)}</Label>
        </div>
        <div style={{ width: 150, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={26} color={dark ? LANCE.dark800 : LANCE.offwhite} fringe={dark ? 0 : 1}>{r.grip.toFixed(2)}</Label>
          <Label size={18} color={dark ? LANCE.dark700 : LANCE.dark200} fringe={dark ? 0 : 1}>{r.state}</Label>
        </div>
        <Label size={18} color={dark ? LANCE.dark800 : LANCE.lavender} fringe={dark ? 0 : 1}>{vec(r.emb.slice(0, 2))}</Label>
      </div>
    </Slab>
    {tag ? (
      <div style={{ position: "absolute", left: W + 22, top: RH / 2 - 12 }}>
        <Label size={22} color={tagColor}>{tag}</Label>
      </div>
    ) : null}
  </div>
  );
};

/** a compact row for memory / other systems: wrist thumb + episode + gripper */
export const MW = 470;
export const MH = 58;
export const MiniRow: React.FC<{ r: DroidRow; tone?: Tone; glow?: number; lav?: number; ghost?: number }> = ({ r, tone = "card", glow = 0, lav = 0, ghost = 0 }) => (
  <div style={{ borderRadius: 10, boxShadow: ring(lav, 0), transformStyle: "preserve-3d" }}>
    <Slab w={MW} h={MH} d={12} tone={tone} glow={glow} radius={10}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 10px", opacity: 1 - 0.65 * ghost }}>
        <Thumb k={r.wrist} w={74} r={6} />
        <Label size={20} color={tone === "hit" || tone === "live" ? LANCE.dark800 : LANCE.offwhite}>{r.episode} · {r.t.toFixed(2)}s</Label>
        <Label size={20} color={tone === "hit" || tone === "live" ? LANCE.dark800 : LANCE.dark200}>{r.grip.toFixed(2)}</Label>
      </div>
    </Slab>
  </div>
);

export const HEADS: [string, string, number][] = [
  ["wrist_jpeg", "binary", 136],
  ["exterior_1_jpeg", "binary", 136],
  ["episode_id · timestamp_s", "string · float", 254],
  ["gripper_position", "float · state", 150],
  ["visual_embedding", "vector[768]", 180],
];

export const TitleBar: React.FC<{ right?: React.ReactNode; glow?: number; sub?: string; title?: string; dot?: string; dotColor?: string }> = ({ right, glow = 0, sub, title = "frames", dot = "●", dotColor = LANCE.orange300 }) => (
  <Slab w={W} h={74} d={20} tone="idle" radius={14} glow={glow}>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 18, padding: "0 24px" }}>
      <Label size={30} color={dotColor}>{dot}</Label>
      <Label size={30} color={LANCE.offwhite}>{title}</Label>
      <Label size={24} color={LANCE.dark300}>{sub ?? `${DROID.stats.rows.toLocaleString("en-US")} rows · ${DROID.stats.episodes} episodes · ${DROID.stats.cameras} cameras`}</Label>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  </Slab>
);

export const Heads: React.FC = () => (
  <div style={{ width: W, display: "flex", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
    {HEADS.map(([n, t, w]) => (
      <div key={n} style={{ width: w, display: "flex", flexDirection: "column", gap: 6 }}>
        <Label size={16} color={LANCE.offwhite}>{n}</Label>
        <Label size={14} color={LANCE.dark400}>{t}</Label>
      </div>
    ))}
  </div>
);

/** a flat panel with a mono label in its corner (a system, a node, a bucket) */
export const Panel: React.FC<{ w: number; h: number; label?: string; sub?: string; tone?: Tone; glow?: number; labelColor?: string; d?: number; children?: React.ReactNode; dashed?: string }> = ({
  w, h, label, sub, tone = "dim", glow = 0, labelColor = LANCE.dark200, d = 30, children, dashed,
}) => (
  <Slab w={w} h={h} d={d} tone={tone} radius={24} glow={glow} style={dashed ? { border: `4px dashed ${dashed}` } : undefined}>
    {label ? (
      <div style={{ position: "absolute", left: 26, top: 20, display: "flex", gap: 14, alignItems: "baseline" }}>
        <Label size={30} color={labelColor}>{label}</Label>
        {sub ? <Label size={20} color={LANCE.dark400}>{sub}</Label> : null}
      </div>
    ) : null}
    {children}
  </Slab>
);

/** a small mono tag chip */
export const Tag: React.FC<{ text: string; color?: string; size?: number; bg?: string; o?: number }> = ({ text, color = LANCE.dark100, size = 22, bg = LANCE.dark700, o = 1 }) => (
  <div style={{ padding: `${size * 0.35}px ${size * 0.6}px`, borderRadius: 8, background: bg, border: `2px solid ${LANCE.dark500}`, opacity: o, whiteSpace: "nowrap" }}>
    <Label size={size} color={color}>{text}</Label>
  </div>
);

/** a straight beam between two points on the same z plane (a read, a write path) */
export const Beam: React.FC<{ a: V3; b: V3; t?: number; color?: string; w?: number; o?: number }> = ({ a, b, t = 1, color = LANCE.lavender, w = 5, o = 1 }) => {
  if (t <= 0.001 || o <= 0.01) return null;
  const bx = mix(a[0], b[0], t), by = mix(a[1], b[1], t);
  const len = Math.hypot(bx - a[0], by - a[1]);
  const ang = (Math.atan2(by - a[1], bx - a[0]) * 180) / Math.PI;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate3d(${a[0]}px, ${a[1]}px, ${a[2]}px) rotateZ(${ang}deg)`, transformOrigin: "0 0", opacity: o }}>
      <div style={{ width: len, height: w, marginTop: -w / 2, borderRadius: w, background: color, boxShadow: `0 0 ${w * 4}px ${color}` }} />
    </div>
  );
};

/** a travelling dot from a to b */
export const Dot: React.FC<{ a: V3; b: V3; t: number; color?: string; size?: number }> = ({ a, b, t, color = LANCE.orange300, size = 24 }) =>
  t <= 0.001 || t >= 0.999 ? null : (
    <At p={[mix(a[0], b[0], t), mix(a[1], b[1], t) - Math.sin(Math.PI * t) * 60, mix(a[2], b[2], t)]}>
      <div style={{ width: size, height: size, borderRadius: size, background: color, boxShadow: `0 0 ${size}px ${size / 3}px ${color}` }} />
    </At>
  );

/** a client: a small slab with its name */
export const Client: React.FC<{ name: string; lit?: number; sub?: string; w?: number; litTone?: Tone; tone?: Tone }> = ({ name, lit = 0, sub, w, litTone = "live", tone = "idle" }) => {
  const ww = w ?? Math.max(220, name.length * 17 + 60);
  return (
    <Slab w={ww} h={sub ? 96 : 70} d={20} tone={lit > 0.5 ? litTone : tone} radius={14} glow={litTone === "live" ? 0.6 * lit : 0}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <Label size={26} color={lit > 0.5 ? LANCE.dark800 : LANCE.offwhite}>{name}</Label>
        {sub ? <Label size={17} color={lit > 0.5 ? LANCE.dark700 : LANCE.dark300}>{sub}</Label> : null}
      </div>
    </Slab>
  );
};

export const rowY = (i: number, y0 = 0) => y0 + i * PITCH;

// ─── icons + tokens (Cole, Nov 12: "surely there is a better representation than a rectangle") ──
export type IconName = "app" | "search" | "disk" | "gear" | "wait" | "person" | "check" | "x" | "stream";
export const Icon: React.FC<{ name: IconName; size?: number; color?: string; spin?: number }> = ({ name, size = 64, color = LANCE.offwhite, spin = 0 }) => {
  const s = { fill: "none", stroke: color, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", overflow: "visible", transform: spin ? `rotate(${spin}deg)` : undefined }}>
      {name === "app" && (
        <>
          <rect x={10} y={12} width={44} height={30} rx={4} {...s} />
          <path d="M4 50 H60" {...s} />
          <path d="M20 24 l6 5 -6 5 M31 34 h10" {...s} strokeWidth={4} />
        </>
      )}
      {name === "search" && (
        <>
          <circle cx={27} cy={27} r={16} {...s} />
          <path d="M39 39 L56 56" {...s} />
        </>
      )}
      {name === "disk" && (
        <>
          <ellipse cx={32} cy={14} rx={20} ry={7} {...s} />
          <path d="M12 14 V50 M52 14 V50" {...s} />
          <path d="M12 50 A20 7 0 0 0 52 50" {...s} />
          <path d="M12 32 A20 7 0 0 0 52 32" {...s} strokeWidth={4} />
        </>
      )}
      {name === "gear" && (
        <>
          <circle cx={32} cy={32} r={12} {...s} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return <path key={i} d={`M${32 + Math.cos(a) * 18} ${32 + Math.sin(a) * 18} L${32 + Math.cos(a) * 26} ${32 + Math.sin(a) * 26}`} {...s} />;
          })}
        </>
      )}
      {name === "wait" && (
        <>
          <path d="M16 8 H48 M16 56 H48" {...s} />
          <path d="M20 8 C20 24 44 26 44 32 C44 38 20 40 20 56 M44 8 C44 24 20 26 20 32 C20 38 44 40 44 56" {...s} strokeWidth={4} />
        </>
      )}
      {name === "person" && (
        <>
          <circle cx={32} cy={20} r={11} {...s} />
          <path d="M10 56 C12 40 52 40 54 56" {...s} />
        </>
      )}
      {name === "check" && <path d="M12 34 L26 48 L52 18" {...s} strokeWidth={8} />}
      {name === "x" && <path d="M16 16 L48 48 M48 16 L16 48" {...s} strokeWidth={8} />}
      {name === "stream" && (
        <>
          <path d="M6 20 C18 10 26 30 38 20 S58 14 58 14 M6 34 C18 24 26 44 38 34 S58 28 58 28 M6 48 C18 38 26 58 38 48 S58 42 58 42" {...s} strokeWidth={5} />
        </>
      )}
    </svg>
  );
};

/** a round token: who is acting (an app writing, a client searching, a worker…). tone: idle | live (coral) | big (lavender) | dim */
export const Token: React.FC<{ icon: IconName; tone?: Tone; size?: number; glow?: number; badge?: "check" | "x"; spin?: number }> = ({ icon, tone = "idle", size = 140, glow = 0, badge, spin }) => {
  const ink = tone === "live" || tone === "big" || tone === "hit" ? LANCE.dark800 : tone === "dim" ? LANCE.dark400 : LANCE.offwhite;
  return (
    <div style={{ position: "relative", width: size, height: size, transformStyle: "preserve-3d" }}>
      {/* round: no slab side walls (they draw square edges); depth comes from a solid drop edge */}
      <div style={{ position: "absolute", inset: 0, borderRadius: size, transform: "translate3d(0px, 10px, -12px)", background: TONE[tone].edge }} />
      <Slab w={size} h={size} d={0} tone={tone} radius={size / 2} glow={glow}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={size * 0.48} color={ink} spin={spin} />
        </div>
      </Slab>
      {badge ? (
        <div style={{ position: "absolute", right: -10, top: -10, width: size * 0.42, height: size * 0.42, borderRadius: size, background: badge === "check" ? LANCE.orange300 : LANCE.dark500, display: "flex", alignItems: "center", justifyContent: "center", transform: "translateZ(30px)" }}>
          <Icon name={badge} size={size * 0.26} color={badge === "check" ? LANCE.dark800 : LANCE.offwhite} />
        </div>
      ) : null}
    </div>
  );
};

/** a check mark that sits beside a row */
export const RowCheck: React.FC<{ o: number }> = ({ o }) =>
  o <= 0.01 ? null : (
    <div style={{ opacity: o, width: 64, height: 64, borderRadius: 64, background: LANCE.orange300, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * o})` }}>
      <Icon name="check" size={38} color={LANCE.dark800} />
    </div>
  );

// ─── real objects (Cole, Nov 12: "can we make it an actual laptop?… not just a symbol on a circle") ──
const SCREEN_BG: Record<string, string> = {
  idle: LANCE.dark800,
  live: "radial-gradient(ellipse at 50% 40%, #4a2a20 0%, #1f1612 80%)",
  big: "radial-gradient(ellipse at 50% 40%, #3b3346 0%, #1b1820 80%)",
  dim: "#141210",
};
const RING: Record<string, string> = { idle: LANCE.dark500, live: LANCE.orange300, big: LANCE.lavender, dim: "#2a2522" };

/** a laptop: upright screen (children render on it) + keyboard deck tilted toward the viewer */
export const Laptop: React.FC<{ w?: number; tone?: "idle" | "live" | "big" | "dim"; glow?: number; name?: string; children?: React.ReactNode }> = ({ w = 320, tone = "idle", glow = 0, name, children }) => {
  const h = Math.round(w * 0.64);
  const kd = Math.round(w * 0.6);
  return (
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d" }}>
      <Slab w={w} h={h} d={10} tone="idle" radius={14} glow={glow} style={{ border: `4px solid ${RING[tone]}`, background: "#2b2622" }}>
        <div style={{ position: "absolute", inset: 10, borderRadius: 8, background: SCREEN_BG[tone], overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tone === "idle" || tone === "dim" ? undefined : `inset 0 0 30px ${RING[tone]}55` }}>
          {children}
        </div>
      </Slab>
      <div style={{ position: "absolute", left: 0, top: h - 6, transformStyle: "preserve-3d", transformOrigin: "50% 0", transform: "rotateX(76deg)" }}>
        <Slab w={w} h={kd} d={12} tone="idle" radius={12}>
          <div style={{ position: "absolute", left: "8%", right: "8%", top: "10%", height: "48%", borderRadius: 6, backgroundImage: `linear-gradient(${LANCE.dark500} 2px, transparent 2px), linear-gradient(90deg, ${LANCE.dark500} 2px, transparent 2px)`, backgroundSize: `${w / 14}px ${w / 22}px`, opacity: 0.55 }} />
          <div style={{ position: "absolute", left: "36%", right: "36%", top: "66%", height: "24%", borderRadius: 6, border: `2px solid ${LANCE.dark500}` }} />
        </Slab>
      </div>
      {name ? (
        <div style={{ position: "absolute", left: 0, width: w, top: h + kd * 0.3 + 26, textAlign: "center" }}>
          <Label size={Math.round(w / 11)} color={tone === "live" ? LANCE.orange300 : tone === "big" ? LANCE.lavender : LANCE.dark200}>{name}</Label>
        </div>
      ) : null}
    </div>
  );
};

/** what a laptop screen shows: one row (the write going out, or the row a search found) */
export const ScreenRow: React.FC<{ r: DroidRow; tone?: "live" | "big"; w?: number }> = ({ r, tone = "live", w = 260 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: tone === "live" ? LANCE.orange300 : LANCE.lavender, width: w, boxSizing: "border-box" }}>
    <Thumb k={r.wrist} w={64} r={5} />
    <Label size={18} color={LANCE.dark800} fringe={0}>{r.episode}</Label>
  </div>
);
/** a terminal prompt with a blinking cursor */
export const ScreenIdle: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start", margin: "18px 0 0 18px" }}>
    <Label size={22} color={LANCE.dark300}>›</Label>
    <div style={{ width: 12, height: 22, background: LANCE.dark300, opacity: Math.floor(f / 18) % 2 ? 0 : 1 }} />
  </div>
);
/** a loading spinner (waiting) */
export const ScreenWait: React.FC<{ f: number; color?: string }> = ({ f, color = LANCE.dark300 }) => (
  <div style={{ width: 56, height: 56, borderRadius: 56, border: `6px solid ${LANCE.dark600}`, borderTopColor: color, transform: `rotate(${(f * 6) % 360}deg)` }} />
);

/** a server: rack units with status lights (workers, the streaming service) */
export const Server: React.FC<{ w?: number; units?: number; f: number; busy?: boolean; color?: string; glow?: number }> = ({ w = 220, units = 3, f, busy = false, color = LANCE.orange300, glow = 0 }) => {
  const uh = Math.round(w * 0.32);
  return (
    <Slab w={w} h={uh * units + 20} d={Math.round(w * 0.7)} tone="idle" radius={10} glow={glow}>
      <div style={{ position: "absolute", inset: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: units }).map((_, u) => (
          <div key={u} style={{ flex: 1, borderRadius: 6, background: "#221e1b", border: `2px solid ${LANCE.dark600}`, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
            {[0, 1, 2].map((l) => {
              const on = busy && (Math.floor(f / 6) + u * 3 + l * 5) % 4 !== 0;
              return <div key={l} style={{ width: 12, height: 12, borderRadius: 12, background: on ? color : LANCE.dark500, boxShadow: on ? `0 0 10px ${color}` : undefined }} />;
            })}
            <div style={{ flex: 1 }} />
            {[0, 1, 2, 3].map((l) => <div key={"v" + l} style={{ width: 4, height: uh * 0.45, borderRadius: 2, background: LANCE.dark600 }} />)}
          </div>
        ))}
      </div>
    </Slab>
  );
};

/** a disk drive (the disk cluster the engine doesn't need) */
export const Drive: React.FC<{ w?: number }> = ({ w = 170 }) => (
  <Slab w={w} h={Math.round(w * 0.7)} d={28} tone="dim" radius={10}>
    <div style={{ position: "absolute", left: "12%", top: "12%", width: w * 0.5, height: w * 0.5, borderRadius: w, border: `4px solid ${LANCE.dark500}`, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: "40%", top: "40%", width: "20%", height: "20%", borderRadius: w, background: LANCE.dark500 }} />
    </div>
    <div style={{ position: "absolute", right: "14%", top: "18%", width: 6, height: w * 0.42, borderRadius: 4, background: LANCE.dark500, transform: "rotate(28deg)", transformOrigin: "50% 0" }} />
  </Slab>
);

/** the table version number — pops, flashes and rolls on every commit (Cole: "we need to emphasize this") */
export const VersionBadge: React.FC<{ f: number; ver: number; changedAt: number; size?: number }> = ({ f, ver, changedAt, size = 56 }) => {
  const k = Math.max(0, 1 - (f - changedAt) / 22);
  const roll = Math.min(1, (f - changedAt) / 8);
  return (
    <div style={{ position: "relative", padding: `${size * 0.22}px ${size * 0.45}px`, borderRadius: 14, background: k > 0.05 ? LANCE.orange300 : LANCE.dark700, border: `3px solid ${LANCE.orange300}`, transform: `scale(${1 + 0.3 * k})`, boxShadow: k > 0.05 ? `0 0 ${60 * k}px rgba(255,115,74,${0.8 * k})` : undefined, overflow: "hidden" }}>
      <div style={{ opacity: roll, transform: `translateY(${(1 - roll) * size * 0.8}px)` }}>
        <Label size={size} color={k > 0.05 ? LANCE.dark800 : LANCE.orange300} fringe={0}>{`v${ver}`}</Label>
      </div>
    </div>
  );
};

// ─── a REAL Iceberg table of the same rows (work/tools/build_iceberg.py → icebergData.ts) ──────────
// Images live as files; the table stores their paths. Embeddings are list<float>. Never named on screen.
export const ICE = "#9ec3dc";
type IceRowT = { episode: string; t: number; instruction: string; grip: number; state: string; wrist: string; ext: string; emb: readonly number[] };
export const ICE_HEADS: [string, string, number][] = [
  ["wrist_image_uri", "string", 186],
  ["exterior_1_image_uri", "string", 186],
  ["episode_id · timestamp_s", "string · double", 232],
  ["gripper_position", "double", 126],
  ["visual_embedding", "list<float>", 130],
];
export const IceHeads: React.FC = () => (
  <div style={{ width: W, display: "flex", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
    {ICE_HEADS.map(([n, t, w]) => (
      <div key={n} style={{ width: w, display: "flex", flexDirection: "column", gap: 6 }}>
        <Label size={13} color={LANCE.offwhite}>{n}</Label>
        <Label size={14} color={LANCE.dark400}>{t}</Label>
      </div>
    ))}
  </div>
);
const tail = (p: string) => p.replace("…/wrist/", "").replace("…/exterior_1/", "");
export const IceRow: React.FC<{ r: IceRowT; tone?: Tone; glow?: number; ghost?: number }> = ({ r, tone = "dim", glow = 0, ghost = 0 }) => {
  const dark = tone === "hit" || tone === "big" || tone === "live";
  const c1 = dark ? LANCE.dark800 : LANCE.dark100;
  return (
    <Slab w={W} h={RH} d={18} tone={tone} radius={12} glow={glow}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", opacity: 1 - 0.6 * ghost }}>
        {[r.wrist, r.ext].map((p, n) => (
          <div key={n} style={{ width: 186, display: "flex", flexDirection: "column", gap: 4 }}>
            <Label size={14} color={dark ? LANCE.dark700 : LANCE.dark300}>{n === 0 ? "…/wrist/" : "…/exterior_1/"}</Label>
            <Label size={13} color={dark ? LANCE.dark800 : ICE} style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 186 }}>{tail(p)}</Label>
          </div>
        ))}
        <div style={{ width: 232, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={21} color={c1}>{r.episode} · {r.t.toFixed(2)}s</Label>
          <Label size={16} color={dark ? LANCE.dark700 : LANCE.dark300} mono={false}>{short(r.instruction, 28)}</Label>
        </div>
        <div style={{ width: 126, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={24} color={c1}>{r.grip.toFixed(2)}</Label>
          <Label size={16} color={dark ? LANCE.dark700 : LANCE.dark300}>{r.state}</Label>
        </div>
        <Label size={17} color={dark ? LANCE.dark800 : LANCE.dark200}>{vec(r.emb)}</Label>
      </div>
    </Slab>
  );
};

/** a row that isn't committed yet, drawn the way the Iceberg table would hold it */
export const asIce = (r: DroidRow): IceRowT => ({ episode: r.episode, t: r.t, instruction: r.instruction, grip: r.grip, state: r.state, emb: r.emb, wrist: `…/wrist/${r.episode}_000060.jpg`, ext: `…/exterior_1/${r.episode}_000060.jpg` });

// ── text tables (Nov 13 review: the throughput tests ran on FineWeb-Edu / MS MARCO / LAION, not DROID) ──
// real rows from work/tools/build_fineweb.py → webRows.ts
export type TextRow = { id: string; title: string; host: string; score?: number; tokens?: number; emb: readonly number[] };
const clean = (r: TextRow) => /^[A-Z]/.test(r.title) && !/\\|HIV|Newegg|\d{4}$/.test(r.title) && r.title.length > 14;
/** FineWeb-Edu rows with a readable first line, in table order */
export const WEB: TextRow[] = (WEB_ROWS as readonly TextRow[]).filter(clean);
export const MARCO: TextRow[] = MARCO_ROWS as readonly TextRow[] as TextRow[];
export { WEB_TABLE, MARCO_TABLE };

export const WEB_HEADS: [string, string, number][] = [
  ["id", "string", 130],
  ["text", "string", 350],
  ["url", "string", 190],
  ["score", "float", 66],
  ["vector", "vector[384]", 132],
];
export const WebHeads: React.FC = () => (
  <div style={{ width: W, display: "flex", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
    {WEB_HEADS.map(([n, t, w]) => (
      <div key={n} style={{ width: w, display: "flex", flexDirection: "column", gap: 6 }}>
        <Label size={16} color={LANCE.offwhite}>{n}</Label>
        <Label size={14} color={LANCE.dark400}>{t}</Label>
      </div>
    ))}
  </div>
);
/** one real FineWeb-Edu row: id | text | url | score | vector */
export const WebRow: React.FC<{ r: TextRow; tone?: Tone; glow?: number; lav?: number }> = ({ r, tone: tone0 = "card", glow = 0, lav = 0 }) => {
  const tone: Tone = lav > 0.5 ? "big" : tone0;
  const dark = tone === "hit" || tone === "big";
  const c = (a: string, b: string) => (dark ? a : b);
  return (
    <Slab w={W} h={RH} d={18} tone={tone} glow={glow} radius={12}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
        <div style={{ width: 130 }}><Label size={20} color={c(LANCE.dark800, LANCE.dark200)} fringe={dark ? 0 : 1}>{r.id}</Label></div>
        <div style={{ width: 350, overflow: "hidden" }}><Label size={21} color={c(LANCE.dark800, LANCE.offwhite)} mono={false} fringe={dark ? 0 : 1}>{short(r.title, 30)}</Label></div>
        <div style={{ width: 190, overflow: "hidden" }}><Label size={17} color={c(LANCE.dark700, LANCE.dark300)} fringe={dark ? 0 : 1}>{short(r.host, 18)}</Label></div>
        <div style={{ width: 66 }}><Label size={22} color={c(LANCE.dark800, LANCE.offwhite)} fringe={dark ? 0 : 1}>{r.score != null ? r.score.toFixed(2) : "—"}</Label></div>
        <Label size={17} color={c(LANCE.dark800, LANCE.lavender)} fringe={dark ? 0 : 1}>{vec(r.emb.slice(0, 2))}</Label>
      </div>
    </Slab>
  );
};
/** compact text row for shards / nodes: id + first line */
export const TextMini: React.FC<{ r: TextRow; w?: number; hot?: boolean; lav?: number }> = ({ r, w = 420, hot = false, lav = 0 }) => {
  const tone: Tone = lav > 0.5 ? "big" : hot ? "hit" : "card";
  const dark = tone !== "card";
  return (
    <Slab w={w} h={50} d={10} tone={tone} radius={8} glow={hot ? 0.4 : 0}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
        <Label size={17} color={dark ? LANCE.dark700 : LANCE.dark300}>{r.id.slice(0, 7)}</Label>
        <Label size={19} color={dark ? LANCE.dark800 : LANCE.offwhite} mono={false} fringe={dark ? 0 : 1}>{short(r.title, Math.round((w - 120) / 10.5))}</Label>
      </div>
    </Slab>
  );
};
/** laptop screen: one text row (the write going out, or the row a search found) */
export const ScreenText: React.FC<{ r: TextRow; tone?: "live" | "big"; w?: number }> = ({ r, tone = "live", w = 260 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px", borderRadius: 8, background: tone === "live" ? LANCE.orange300 : LANCE.lavender, width: w, boxSizing: "border-box" }}>
    <Label size={15} color={LANCE.dark700} fringe={0}>{r.id}</Label>
    <Label size={18} color={LANCE.dark800} mono={false} fringe={0}>{short(r.title, Math.round(w / 11))}</Label>
  </div>
);
/** laptop screen: the write was acknowledged */
export const ScreenAck: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <Label size={56} color={LANCE.orange300}>✓</Label>
    <Label size={30} color={LANCE.orange300}>ack</Label>
  </div>
);
/** fineweb_edu_1…4 (build_fineweb.py deals the 100 rows out round-robin) — readable rows of each */
export const WEB_SPLIT: TextRow[][] = [0, 1, 2, 3].map((j) => (WEB_ROWS as readonly TextRow[]).filter((r, i) => i % 4 === j && clean(r)));
