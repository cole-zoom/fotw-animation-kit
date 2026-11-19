import { staticFile } from "remotion";
import React from "react";
import { Img, useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { At, Slab, Chip, Label, Tone, ramp, pop, glide, mix, camPath, PERSPECTIVE } from "./boldKit";
import { Fuzz, Scanlines } from "./retro";
import { C } from "./cues";
import { DROID } from "./droidData";

/**
 * Lance pocket demo — ONE continuous 3D world (FOTW boldKit: CSS-3D slabs, floor
 * grid in the world, one camera), on REAL data: every frame, number, row and the
 * query come from droidData.ts, which tools/export_video_data.py reads back out of
 * a real LanceDB table built from lerobot/droid_100 (32,212 timesteps, 100 episodes,
 * 3 cameras). Nothing here is typed in by hand.
 *
 *   A  0–247     3D robot arm; the four streams it records pop off it, shown as the
 *                real recording of droid_000025: wrist cam, 2 exterior cams,
 *                end-effector + gripper traces, action vector
 *   B  247–499   streams split into 3 silos (wrist.mp4 / observation parquet / vectors)
 *   C  541–883   silos fuse into ONE Lance table of real rows; one row lifts
 *   D  919–1150  LanceDB lid lands on the table, Lance plate under it
 *   E  1184–1591 the lid becomes the real query (.where("missed_grasp")): 54 rows,
 *                2 episodes; the fork miss lifts out with its exact frames + actions
 *   F  1625–2059 laptop → LanceDB Enterprise → your bucket; query node → 3 executors
 *                (segments A–F) → candidates → top 10 (sophon distributed-search docs)
 *   G  2091–2343 new episodes stream in, indexes update, a search reaches them
 *   H  2378–end  Lance + LanceDB open source → laptop → Enterprise → logo
 *
 * missed_grasp is DERIVED (DROID has no failure label): full close (>= 0.97), reopen
 * within 3 s, end-effector moved < 2 cm while closed. Checked by eye on the frames.
 *
 * World units = px of the 1080×1920 frame at z = 0, origin at frame centre, y down.
 */

const LOGO = staticFile("examples/pocket-demo-16x9/lancedb-logo-offwhite.png"); // lancedb-logo-offwhite.png
const SRC = {
  rows: staticFile("examples/pocket-demo-16x9/rows.jpg"), // graphics/droid/rows.jpg (wrist | exterior_1 per table row)
  hits: staticFile("examples/pocket-demo-16x9/hits.jpg"), // graphics/droid/hits.jpg (6 frames per missed grasp)
  wrist: staticFile("examples/pocket-demo-16x9/seed-wrist.jpg"), // seed-wrist.jpg (droid_000025, 30 frames)
  ext1: staticFile("examples/pocket-demo-16x9/seed-exterior_1.jpg"), // seed-exterior_1.jpg
  ext2: staticFile("examples/pocket-demo-16x9/seed-exterior_2.jpg"), // seed-exterior_2.jpg
};

// ─── table geometry (relative to the table group's centre) ──────────────────
const W = 964;
const RH = 96;
const PITCH = 108;
const TITLE_Y = -500;
const HEAD_Y = -418;
const rowY0 = (i: number) => -340 + i * PITCH;
const TBL: [number, number, number] = [0, -60, 0];

type DroidRow = (typeof DROID.rows)[number];
const ROWS = DROID.rows;
const BASE_ROWS = 8;
const OVERFLOW_ROWS = 4;
const NEW_ROWS = 4;
const MATCH = ROWS.map((r, i) => (r.missed ? i : -1)).filter((i) => i >= 0);
const TOP_MATCH = MATCH[0];
const HIT = DROID.events[0];

// ─── small pieces ───────────────────────────────────────────────────────────
type SpriteMeta = { cols: number; w: number; h: number; count: number };
/** one 320×180 frame out of a sprite sheet, scaled to width w */
const Frame: React.FC<{ src: string; meta: SpriteMeta; k: number; w: number; r?: number }> = ({ src, meta, k, w, r = 8 }) => {
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
const RowThumb: React.FC<{ k: number; w: number; r?: number }> = ({ k, w, r }) => <Frame src={SRC.rows} meta={DROID.rowSprite} k={k} w={w} r={r} />;

/** the seed recording plays back at its real rate: one sprite frame = 4 source frames = 16 comp frames */
const seedK = (f: number) => Math.max(0, Math.floor((f - 20) / 16)) % DROID.seed.t.length;

const JOINT_COLORS = [LANCE.lavender, LANCE.dark200, LANCE.orange300];

/** a real series as a line, revealed up to sample `upto` */
const Trace: React.FC<{ v: readonly number[]; w: number; h: number; color: string; upto: number; lo?: number; hi?: number }> = ({ v, w, h, color, upto, lo, hi }) => {
  const a = lo ?? Math.min(...v);
  const b = hi ?? Math.max(...v);
  const n = Math.max(2, Math.min(v.length, Math.floor(upto) + 1));
  const pts = v.slice(0, n).map((x, i) => `${((i / (v.length - 1)) * w).toFixed(1)},${(h - ((x - a) / (b - a || 1)) * h).toFixed(1)}`).join(" ");
  return <polyline points={pts} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />;
};

/** outline glow around a cell that the VO is naming */
const Cell: React.FC<{ w: number; hl?: number; children: React.ReactNode; col?: boolean }> = ({ w, hl = 0, children, col }) => (
  <div
    style={{
      width: w,
      height: RH - 14,
      display: "flex",
      flexDirection: col ? "column" : "row",
      justifyContent: "center",
      alignItems: col ? "flex-start" : "center",
      gap: 8,
      borderRadius: 10,
      flexShrink: 0,
      boxShadow: hl > 0.01 ? `0 0 0 ${3 + 2 * hl}px rgba(255,137,103,${hl}), 0 0 ${30 * hl}px rgba(255,115,74,${0.6 * hl})` : undefined,
    }}
  >
    {children}
  </div>
);

const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s || "—");
const vec = (v: readonly number[]) => `[${v.map((x) => x.toFixed(2)).join(", ")}, …]`;

/** one real timestep row: wrist | exterior_1 | episode · t + instruction | gripper | embedding */
const Row: React.FC<{
  r: DroidRow;
  tone?: Tone;
  glow?: number;
  hl?: { fr?: number; jt?: number; em?: number; ac?: number };
}> = ({ r, tone = "card", glow = 0, hl = {} }) => (
  <Slab w={W} h={RH} d={18} tone={tone} glow={glow} radius={12}>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
      <Cell w={140} hl={hl.fr}>
        <RowThumb k={r.wrist} w={136} />
      </Cell>
      <Cell w={140} hl={hl.fr}>
        <RowThumb k={r.ext} w={136} />
      </Cell>
      <Cell w={250} hl={hl.ac} col>
        <Label size={22} color={LANCE.offwhite}>{r.episode} · {r.t.toFixed(2)}s</Label>
        <Label size={17} color={LANCE.dark300} mono={false}>{short(r.instruction, 30)}</Label>
      </Cell>
      <Cell w={160} hl={hl.jt} col>
        <Label size={26} color={r.missed ? LANCE.orange300 : LANCE.offwhite}>{r.grip.toFixed(2)}</Label>
        <Label size={18} color={r.missed ? LANCE.orange300 : LANCE.dark200}>{r.state}{r.missed ? " · missed" : ""}</Label>
      </Cell>
      <Cell w={180} hl={hl.em}>
        <Label size={18} color={LANCE.lavender}>{vec(r.emb.slice(0, 2))}</Label>
      </Cell>
    </div>
  </Slab>
);

const HEADS: [string, string, number][] = [
  ["wrist_jpeg", "binary", 140],
  ["exterior_1_jpeg", "binary", 140],
  ["episode_id · timestamp_s", "string · float", 250],
  ["gripper_position", "float · state", 160],
  ["visual_embedding", "vector[768]", 180],
];

const LogoImg: React.FC<{ h: number }> = ({ h }) => <Img src={LOGO} style={{ height: h, width: "auto", display: "block" }} />;

/** a travelling dot from a to b, t 0..1 */
const Pulse: React.FC<{ a: [number, number, number]; b: [number, number, number]; t: number; size?: number }> = ({ a, b, t, size = 26 }) =>
  t <= 0.001 || t >= 0.999 ? null : (
    <At p={[mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]} name="Pulse">
      <div style={{ width: size, height: size, borderRadius: size, background: LANCE.orange300, boxShadow: `0 0 ${size}px ${size / 3}px rgba(255,115,74,0.7)` }} />
    </At>
  );

const Floor: React.FC<{ y: number; o: number }> = ({ y, o }) => (
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
      opacity: 0.9 * o,
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.6) 14%, transparent 30%)",
      maskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.6) 14%, transparent 30%)",
    }}
  />
);

// ─── the robot (opening) ────────────────────────────────────────────────────
// A two-link arm built from boldKit slabs, posed by real 2-link IK so the wrist
// follows WRIST_KEYS and the gripper always points down. Its joint angles drive
// the "joint states" plot and its phase drives the "actions" chips, so the
// streams are literally what this robot records.
const L1 = 280;
const L2 = 240;
const SHOULDER: [number, number] = [0, -150];
const BLOCK_HOME: [number, number] = [330, -40];
const GRASP = 120; // gripper starts closing
const GRASPED = 145; // block now rides with the wrist
const WRIST_KEYS: [number, [number, number]][] = [
  [0, [130, -470]],
  [22, [130, -470]],
  [80, [330, -290]],
  [GRASP, [330, -125]],
  [GRASPED + 6, [330, -125]],
  [215, [250, -440]],
  [100000, [250, -440]],
];
const wristAt = (t: number): [number, number] => {
  const fs = WRIST_KEYS.map((k) => k[0]);
  const ease = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: Easing.bezier(0.45, 0, 0.2, 1) };
  return [interpolate(t, fs, WRIST_KEYS.map((k) => k[1][0]), ease), interpolate(t, fs, WRIST_KEYS.map((k) => k[1][1]), ease)];
};
/** CSS angles (deg from up, clockwise): shoulder, elbow (relative), wrist (relative, gripper down) */
const ik = (w: [number, number]) => {
  const X = w[0] - SHOULDER[0];
  const Y = -(w[1] - SHOULDER[1]);
  const r = Math.min(Math.hypot(X, Y), L1 + L2 - 1);
  const E = Math.acos(Math.max(-1, Math.min(1, (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2))));
  const t1 = Math.atan2(Y, X) + Math.atan2(L2 * Math.sin(E), L1 + L2 * Math.cos(E)); // elbow up
  const t2 = t1 - E;
  const abs1 = 90 - (t1 * 180) / Math.PI;
  const abs2 = 90 - (t2 * 180) / Math.PI;
  return { a1: abs1, a2: abs2 - abs1, a3: 180 - abs2 };
};
const gripOpen = (t: number) => 1 - ramp(t, GRASP, GRASPED);
const phase = (t: number) => (t < GRASP ? 0 : t < GRASPED + 6 ? 1 : 2); // approach · close_gripper · lift

const JointDot: React.FC<{ r: number; z?: number }> = ({ r, z = 4 }) => (
  <div style={{ position: "absolute", left: -r / 2, top: -r / 2, width: r, height: r, borderRadius: r, background: LANCE.orange400, boxShadow: `0 0 ${r * 0.6}px rgba(255,115,74,0.6)`, transform: `translateZ(${z}px)` }} />
);

/** The arm on its bench. Origin = bench top under the robot base. `flat` drops depth for the camera/depth feeds. */
const RobotRig: React.FC<{ t: number; flat?: boolean; camGlow?: number }> = ({ t, flat, camGlow = 0 }) => {
  const w = wristAt(t);
  const { a1, a2, a3 } = ik(w);
  const g = gripOpen(t);
  const blk: [number, number] = t < GRASPED ? BLOCK_HOME : [w[0], w[1] + 85];
  const ps = flat ? undefined : ("preserve-3d" as const);
  const d = (v: number) => (flat ? 0 : v);
  const abs = (left: number, top: number, child: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ position: "absolute", left, top, transformStyle: ps, ...extra }}>{child}</div>
  );
  const pivot = (x: number, y: number, a: number, child: React.ReactNode) => (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotateZ(${a}deg)`, transformStyle: ps }}>{child}</div>
  );
  return (
    <div style={{ position: "relative", width: 0, height: 0, transformStyle: ps }}>
      {abs(-300, 0, <Slab w={820} h={46} d={d(300)} tone="idle" radius={10} />)}
      {abs(blk[0] - 40, blk[1] - 40, <Slab w={80} h={80} d={d(80)} tone="hit" radius={8} glow={0.25} />)}
      {abs(-85, -120, <Slab w={170} h={120} d={d(150)} tone="paper" radius={20} />)}
      {abs(-60, -160, <Slab w={120} h={44} d={d(110)} tone="idle" radius={12} />)}
      {pivot(SHOULDER[0], SHOULDER[1], a1, (
        <>
          {abs(-34, -L1, <Slab w={68} h={L1} d={d(68)} tone="paper" radius={30} />)}
          <JointDot r={46} />
          {pivot(0, -L1, a2, (
            <>
              {abs(-28, -L2, <Slab w={56} h={L2} d={d(56)} tone="paper" radius={26} />)}
              <JointDot r={40} />
              {abs(26, -L2 + 34, <Slab w={42} h={34} d={d(30)} tone="hit" radius={8} glow={0.3 + camGlow} />)}
              {pivot(0, -L2, a3, (
                <>
                  {abs(-62, -44, <Slab w={124} h={30} d={d(60)} tone="idle" radius={8} />)}
                  {abs(-22 - 22 * g - 20, -122, <Slab w={20} h={80} d={d(40)} tone="idle" radius={6} />)}
                  {abs(22 + 22 * g, -122, <Slab w={20} h={80} d={d(40)} tone="idle" radius={6} />)}
                  <JointDot r={32} />
                </>
              ))}
            </>
          ))}
        </>
      ))}
    </div>
  );
};

/** What the robot's camera records: the rig, flat, framed in a video tile. */
const RobotFeed: React.FC<{ t: number; w: number; depth?: boolean; r?: number }> = ({ t, w, depth, r = 10 }) => {
  const h = (w * 9) / 16;
  const s = h / 600;
  return (
    <div style={{ width: w, height: h, borderRadius: r, overflow: "hidden", position: "relative", background: depth ? LANCE.dark800 : `radial-gradient(ellipse 80% 80% at 50% 40%, ${LANCE.dark600} 0%, ${LANCE.dark800} 80%)` }}>
      <div style={{ position: "absolute", left: w / 2 - 110 * s, top: h / 2 + 270 * s, transform: `scale(${s})`, transformOrigin: "0 0", filter: depth ? "grayscale(1) brightness(1.5) contrast(1.3) sepia(1) saturate(3.4) hue-rotate(-30deg) blur(1.2px)" : undefined }}>
        <RobotRig t={t} flat />
      </div>
    </div>
  );
};

/** The robot's real joint angles over the last 1.5 s. */
const JointTrace: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const N = 30;
  const series = [0, 1, 2].map((j) =>
    Array.from({ length: N }, (_, i) => {
      const a = ik(wristAt(t - (N - 1 - i) * 3));
      return [a.a1, a.a2, a.a3][j];
    }),
  );
  const RANGES: [number, number][] = [[-10, 70], [40, 150], [0, 120]];
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {series.map((s, j) => (
        <polyline
          key={j}
          points={s.map((v, i) => `${((i / (N - 1)) * w).toFixed(1)},${(h - ((v - RANGES[j][0]) / (RANGES[j][1] - RANGES[j][0])) * h).toFixed(1)}`).join(" ")}
          fill="none"
          stroke={JOINT_COLORS[j]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

/** The dark backdrop. */
export const WorldBg: React.FC = () => {
  const o = 1;
  return (
    <div
      name="World backdrop"
      style={{ position: "absolute", inset: 0, opacity: o, background: `radial-gradient(ellipse 90% 70% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 72%)` }}
    />
  );
};

// ─── the world ──────────────────────────────────────────────────────────────
export const World: React.FC = () => {
  const f = useCurrentFrame();

  // 16:9 cut (fork of the 9:16 project hmzTL9cCNy): same beats, laid out sideways.
  const cam = camPath(f, [
    // z > 0 dollies the camera BACK (boldKit: translateZ(-z)); z < 0 pushes in
    [0, { x: -420, y: -200, z: -150, rx: -6, ry: -20 }],
    [C.camera - 15, { x: -200, y: -140, z: 60, rx: -5, ry: -14 }],
    [C.actions + 30, { x: 0, y: -100, z: 220, rx: -4, ry: -8 }],
    [C.s2End, { x: 0, y: -60, z: 620, rx: -3, ry: 3 }],
    [C.lanceStores + 60, { y: -40, z: 600, rx: -5, ry: -5 }],
    [C.frames, { y: -40, z: 480, rx: -4, ry: 4 }],
    [C.s4End, { y: -40, z: 500, rx: -4, ry: 3 }],
    [C.builtOn - 20, { y: -80, z: 1000, rx: -8, ry: -6 }],
    [C.s5End, { y: -80, z: 980, rx: -8, ry: 5 }],
    [C.failed - 20, { x: 0, y: -170, z: 680, rx: -6, ry: 0 }],
    [C.exactFrames + 30, { x: 200, y: -170, z: 560, rx: -4, ry: -4 }],
    [C.s7End, { x: 200, y: -170, z: 570, rx: -4, ry: -2 }],
    [C.enterprise, { x: 0, y: 60, z: 1450, rx: -8, ry: 6 }],
    [C.reads, { x: 0, y: 70, z: 1480, rx: -8, ry: 4 }],
    [C.s9End, { x: 0, y: -150, z: 1250, rx: -9, ry: -4 }],
    [C.s10End, { x: 0, y: -130, z: 1180, rx: -8, ry: -7 }],
    [C.openSource + 40, { x: 0, y: -40, z: 250, rx: -4, ry: 3 }],
    [C.voEnd - 40, { x: 0, y: -40, z: 230, rx: -3, ry: -3 }],
    [C.end, { x: 0, y: -60, z: 200, rx: 0, ry: 0 }],
  ]);
  const { x = 0, y = 0, z = 0, rx = 0, ry = 0 } = cam;

  // ── A · streams over the footage ────────────────────────────────────────
  const streamAt = [C.camera, C.depth, C.joints, C.actions];
  // camera + depth fly into the video file as it lands; joints + actions wait for "metadata tables"
  const flyAt = [C.most - 10, C.most - 10, C.meta - 22, C.meta - 22];
  const GRID: [number, number][] = [[250, -160], [710, -160], [250, 120], [710, 120]];
  const DEST: [number, number][] = [[-800, -110], [-800, -110], [0, -80], [0, -80]];

  // ── B · three silos ─────────────────────────────────────────────────────
  const fuse = glide(f, C.lanceStores - 10, 70);
  const silosGone = ramp(f, C.lanceStores + 10, C.lanceStores + 50);
  const siloIn = [pop(f, C.video - 8), pop(f, C.meta - 8), pop(f, C.vector - 8)];
  // the camera-frames card lands in the video silo and becomes the video file
  const vidCard = ramp(f, C.most + 22, C.most + 34);
  const feedT = (t: number) => (t < C.most ? t : 22 + ((t - C.most) % 230));
  const robotGone = glide(f, C.most - 10, 90);
  const robotO = 1 - ramp(f, C.most + 10, C.most + 60);

  // ── C · the table ───────────────────────────────────────────────────────
  const tableOn = f >= C.lanceStores && f < C.openSource + 10;
  const titleIn = pop(f, C.oneTable - 6);
  const lift3 = glide(f, C.eachRow - 6, 120) * (1 - glide(f, C.lancedb - 30, 120));
  const hlFr = ramp(f, C.frames - 4, C.frames + 8) * lift3;
  const hlJt = ramp(f, C.sensor - 4, C.sensor + 8) * lift3;
  const hlEm = ramp(f, C.emb - 4, C.emb + 8) * lift3;

  // ── D · LanceDB lid, Lance plate ────────────────────────────────────────
  const lidIn = glide(f, C.lancedb - 12, 90);
  const plateIn = glide(f, C.builtOn - 10, 90);
  const teamGlow = ramp(f, C.team - 6, C.team + 10) * (1 - ramp(f, C.s5End, C.s5End + 30));

  // ── E · query ───────────────────────────────────────────────────────────
  const queryMorph = ramp(f, C.oneQuery - 10, C.oneQuery + 16);
  const chipFail = pop(f, C.failed - 4);
  const chipRobot = pop(f, C.robot - 4);
  const failDim = ramp(f, C.failed, C.failed + 14);
  const robotDim = ramp(f, C.robot, C.robot + 14);
  const pick = glide(f, C.exactFrames - 8, 100);
  const unpick = glide(f, C.outgrow - 20, 110);
  const picked = pick * (1 - unpick);
  const lidGone = ramp(f, C.outgrow - 20, C.outgrow + 10);
  const filtersOff = ramp(f, C.outgrow - 10, C.outgrow + 20);

  // ── F · laptop → Enterprise → bucket → cluster ──────────────────────────
  const lapIn = glide(f, C.outgrow - 10, 90);
  // the table jumps out of the laptop; the laptop falls back a beat later
  const lapOut = glide(f, C.reads + 8, 90);
  const overflow = glide(f, C.outgrow + 30, 80);
  const strain = ramp(f, C.outgrow + 55, C.outgrow + 75) * (1 - lapOut);
  const entIn = pop(f, C.enterprise - 6);
  const intoBucket = glide(f, C.reads - 4, 80);
  const bucketIn = glide(f, C.reads - 10, 90);
  // cluster per sophon docs/web/enterprise/distributed-search.mdx
  // cluster over the bucket, as in the 9:16 cut
  const QN: [number, number, number] = [0, -480, 0];
  const EXEC: [number, number, number][] = [[-400, -220, 0], [0, -220, 0], [400, -220, 0]];
  const SEGS = [["A", "B"], ["C", "D"], ["E", "F"]];
  const qnIn = pop(f, C.bucket - 20);
  const exIn = (i: number) => pop(f, C.bucket - 14 + i * 5);
  const cacheFill = (i: number) => ramp(f, C.bucket - 4 + i * 6, C.bucket + 26 + i * 6);
  const subplan = (i: number) => ramp(f, C.spreads + 2 + i * 4, C.spreads + 30 + i * 4);
  const segLit = (i: number) => ramp(f, C.spreads + 30 + i * 4, C.spreads + 40 + i * 4) * (1 - ramp(f, C.cluster + 20, C.cluster + 50));
  const cand = (i: number) => ramp(f, C.spreads + 46 + i * 5, C.spreads + 76 + i * 5);
  const qnLit = ramp(f, C.cluster - 4, C.cluster + 8) * (1 - ramp(f, C.s9End + 10, C.s9End + 40));
  const topIn = pop(f, C.cluster + 6);
  const topGone = ramp(f, C.newEp + 20, C.newEp + 50);
  const segRefresh = ramp(f, C.indexes - 6, C.indexes + 6) * (1 - ramp(f, C.indexes + 30, C.indexes + 60));
  const ENT: [number, number, number] = [mix(720, 0, intoBucket), mix(-650, -730, intoBucket), 0];
  const LAP_X = -420; // 16:9: the laptop sits left so Enterprise can land on the right
  const BUCKET: [number, number, number] = [0, 290, -60];
  const BUCKET_S = 0.5;

  // ── G · new episodes ────────────────────────────────────────────────────
  const arrive = (j: number) => C.newEp + j * 24;
  const shift = Array.from({ length: NEW_ROWS }, (_, j) => glide(f, arrive(j), 140)).reduce((a, b) => a + b, 0) * PITCH;
  const searchHit = ramp(f, C.searchable + 10, C.searchable + 24) * (1 - ramp(f, C.s10End - 20, C.s10End + 10));

  // ── H · open source → laptop → Enterprise → logo ────────────────────────
  const worldOut = ramp(f, C.openSource - 40, C.openSource);
  const lanceIn = pop(f, C.openSource - 4);
  const lancedbIn = pop(f, C.openSource + 10);
  const ossIn = pop(f, C.openSource + 60);
  // new last line (Nov 12): "Visit us at lancedb.com and start today." — no laptop/Enterprise end beat
  const endLapIn = 0;
  const endEntIn = 0;
  const arrowIn = 0;
  const endCard = glide(f, C.visit - 12, 80);
  const dotcomLit = ramp(f, C.dotcom - 4, C.dotcom + 10);

  // table group transform
  const hop = Math.sin(Math.PI * intoBucket); // arc of the jump: 0 → 1 → 0
  const tblS = mix(1, BUCKET_S, intoBucket) * (1 + 0.12 * hop);
  // on the laptop the table rides up 200 so the keyboard clears the captions; in the bucket it sits centred
  const tblShift = 500 * queryMorph * (1 - lidGone);
  const tblP: [number, number, number] = [mix(TBL[0] + tblShift + LAP_X * lapIn, BUCKET[0], intoBucket), mix(mix(TBL[1], TBL[1] - 200, lapIn), BUCKET[1] + 92, intoBucket) - 260 * hop, TBL[2] + mix(0, 20, intoBucket) + 420 * hop];
  // in the bucket the 16:9 table shows a 6-row window (rows 6–11, then the new ones scroll in)
  const windowShift = 6 * PITCH * intoBucket;
  const windowLimit = intoBucket > 0.01 ? mix(1600, 270, intoBucket) : 100000;
  const tblO = tableOn ? 1 - worldOut : 0;

  const rowCount = BASE_ROWS + OVERFLOW_ROWS + NEW_ROWS;

  return (
    <div name="Lance world" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, perspective: PERSPECTIVE, perspectiveOrigin: "0 0" }}>
        <div
          name="Camera"
          style={{
            position: "absolute",
            transformStyle: "preserve-3d",
            transform: `translateZ(${-z}px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${-x}px, ${-y}px, 0px)`,
          }}
        >
          <Floor y={720} o={1} />

          {/* ── A · the robot ─────────────────────────────────────────────── */}
          {robotO > 0.01 && (
            <At p={[mix(-640, -900, robotGone), mix(150, -100, robotGone), mix(0, -700, robotGone)]} s={1.1} o={robotO} name="Robot arm">
              <RobotRig t={f} camGlow={0.6 * ramp(f, C.camera - 4, C.camera + 6) * (1 - ramp(f, C.camera + 20, C.camera + 40))} />
            </At>
          )}

          {/* ── A · the four streams ─────────────────────────────────────── */}
          {f < C.meta + 40 &&
            [0, 1, 2, 3].map((i) => {
              const s = pop(f, streamAt[i] - 6);
              if (s < 0.01) return null;
              const fly = glide(f, flyAt[i], 110);
              const streamGone = ramp(f, flyAt[i] + 30, flyAt[i] + 60);
              const px = mix(GRID[i][0], DEST[i][0], fly);
              const py = mix(GRID[i][1], DEST[i][1], fly);
              const label = ["wrist camera", "exterior cameras", "end-effector · gripper", "action"][i];
              const k = seedK(f);
              return (
                <At key={i} p={[px, py, 40 * (1 - fly)]} s={Math.max(0.01, s * mix(1, 0.35, fly))} o={Math.min(1, s * 1.5) * (1 - streamGone)} name={`Stream · ${label}`}>
                  <Slab w={430} h={250} d={22} tone="card" radius={16}>
                    <div style={{ position: "absolute", inset: 0, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <Label size={26} color={LANCE.dark100}>{label}</Label>
                        <Label size={18} color={LANCE.dark400}>{DROID.seed.episode}</Label>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        {i === 0 && <Frame src={SRC.wrist} meta={DROID.seedSprites.wrist} k={k} w={300} />}
                        {i === 1 && (
                          <>
                            <Frame src={SRC.ext1} meta={DROID.seedSprites.exterior_1} k={k} w={190} />
                            <Frame src={SRC.ext2} meta={DROID.seedSprites.exterior_2} k={k} w={190} />
                          </>
                        )}
                        {i === 2 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 390 }}>
                            <svg width={390} height={130} style={{ display: "block", overflow: "visible" }}>
                              <Trace v={DROID.seed.grip} w={390} h={130} color={LANCE.orange300} upto={k} lo={0} hi={1} />
                              <Trace v={DROID.seed.z} w={390} h={130} color={LANCE.lavender} upto={k} />
                            </svg>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Label size={18} color={LANCE.orange300}>gripper_position {DROID.seed.grip[k].toFixed(2)}</Label>
                              <Label size={18} color={LANCE.lavender}>ee z {DROID.seed.z[k].toFixed(3)} m</Label>
                            </div>
                          </div>
                        )}
                        {i === 3 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px 14px" }}>
                            {DROID.seed.action[k].map((v, n) => (
                              <div key={n} style={{ padding: "6px 8px", borderRadius: 8, background: LANCE.dark600, textAlign: "center" }}>
                                <Label size={24} color={n === 6 ? LANCE.orange300 : LANCE.offwhite}>{v.toFixed(2)}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Slab>
                </At>
              );
            })}

          {/* ── B · three silos ──────────────────────────────────────────── */}
          {f >= C.video - 20 && f < C.lanceStores + 55 && (
            <>
              <At p={[mix(-800, 0, fuse), mix(-80, -60, fuse), -30]} r={[0, 0, -2.5 * (1 - fuse)]} s={Math.max(0.01, siloIn[0]) * mix(1, 0.8, fuse)} o={1 - silosGone} name="Silo · video files">
                <Slab w={720} h={460} d={30} tone="dim" radius={18}>
                  <div style={{ position: "absolute", left: 22, bottom: 18 }}>
                    <Label size={30} color={LANCE.dark200}>{DROID.seed.episode}/wrist.mp4</Label>
                  </div>
                </Slab>
              </At>
              <At p={[mix(-800, 0, fuse), mix(-110, -60, fuse), 0]} o={vidCard * (1 - silosGone)} s={mix(1, 0.8, fuse)} name="Video file · robot arm">
                <Slab w={600} h={338} d={14} tone="card" radius={12} outline={false}>
                  <Frame src={SRC.wrist} meta={DROID.seedSprites.wrist} k={seedK(f)} w={600} r={12} />
                </Slab>
              </At>
              <At p={[mix(0, 0, fuse), mix(-80, -60, fuse), 0]} r={[0, 0, 2 * (1 - fuse)]} s={Math.max(0.01, siloIn[1]) * mix(1, 0.8, fuse)} o={1 - silosGone} name="Silo · metadata tables">
                <Slab w={760} h={360} d={30} tone="dim" radius={18}>
                  <div style={{ position: "absolute", inset: 0, padding: "24px 26px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <Label size={30} color={LANCE.dark200}>observation.parquet</Label>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <div key={j} style={{ display: "flex", gap: 30 }}>
                        <Label size={24} color={LANCE.dark300}>{DROID.siloState[j].t.toFixed(2)}</Label>
                        <Label size={24} color={LANCE.offwhite}>[{DROID.siloState[j].ee.map((x) => x.toFixed(2)).join(", ")}]</Label>
                        <Label size={24} color={LANCE.orange300}>{DROID.siloState[j].grip.toFixed(2)}</Label>
                      </div>
                    ))}
                  </div>
                </Slab>
              </At>
              <At p={[mix(800, 0, fuse), mix(-80, -60, fuse), 0]} r={[0, 0, -2 * (1 - fuse)]} s={Math.max(0.01, siloIn[2]) * mix(1, 0.8, fuse)} o={1 - silosGone} name="Silo · vector store">
                <Slab w={700} h={250} d={30} tone="dim" radius={18}>
                  <div style={{ position: "absolute", inset: 0, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <Label size={30} color={LANCE.dark200}>vectors · dinov2</Label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {DROID.siloVec.map((v) => vec(v.slice(0, 2))).map((v, j) => (
                        <div key={j} style={{ padding: "8px 12px", borderRadius: 8, background: LANCE.dark600 }}>
                          <Label size={22} color={LANCE.lavender}>{v}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </Slab>
              </At>
            </>
          )}

          {/* ── F · the laptop the table lives on (behind the table) ─────── */}
          {lapIn > 0.01 && lapOut < 0.99 && (
            <At p={[LAP_X, mix(-240, -40, lapOut), mix(-70, -700, lapOut)]} o={Math.min(1, lapIn * 1.4) * (1 - lapOut)} s={mix(0.9, 1, lapIn)} name="Laptop">
              <div style={{ position: "relative", width: 1180, height: 1260, transformStyle: "preserve-3d" }}>
                <Slab w={1180} h={1180} d={40} tone="dim" radius={34} glow={strain * 0.9} style={{ border: `6px solid ${strain > 0.05 ? LANCE.orange400 : LANCE.dark500}` }} />
                <div style={{ position: "absolute", left: -40, top: 1180, transformStyle: "preserve-3d", transformOrigin: "50% 0", transform: "rotateX(78deg)" }}>
                  <Slab w={1260} h={520} d={30} tone="idle" radius={30}>
                    <div style={{ position: "absolute", left: 80, right: 80, top: 50, height: 300, borderRadius: 12, backgroundImage: `linear-gradient(${LANCE.dark500} 2px, transparent 2px), linear-gradient(90deg, ${LANCE.dark500} 2px, transparent 2px)`, backgroundSize: "70px 70px", opacity: 0.5 }} />
                  </Slab>
                </div>
              </div>
            </At>
          )}

          {/* ── F/G · bucket ─────────────────────────────────────────────── */}
          {bucketIn > 0.01 && (
            <At p={BUCKET} o={Math.min(1, bucketIn * 1.4) * (1 - worldOut)} s={mix(0.92, 1, bucketIn)} name="Bucket · s3://your-bucket">
              <Slab w={1100} h={520} d={50} tone="dim" radius={36}>
                <div style={{ position: "absolute", left: 40, top: 30 }}>
                  <Label size={44} color={LANCE.dark200}>s3://your-bucket</Label>
                </div>
              </Slab>
            </At>
          )}

          {/* ── the table (C → G) ────────────────────────────────────────── */}
          {tblO > 0.01 && (
            <At p={tblP} s={tblS} o={tblO} name="Lance table · frames">
              {/* title bar */}
              <At p={[0, TITLE_Y, 0]} s={Math.max(0.01, titleIn)} name="Title bar">
                <Slab w={W} h={74} d={20} tone="idle" radius={14} glow={0.35 * ramp(f, C.oneTable - 4, C.oneTable + 6) * (1 - ramp(f, C.oneTable + 20, C.oneTable + 60))}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 18, paddingLeft: 24 }}>
                    <Label size={30} color={LANCE.orange300}>●</Label>
                    <Label size={30} color={LANCE.offwhite}>frames</Label>
                    <Label size={24} color={LANCE.dark300}>{DROID.stats.rows.toLocaleString("en-US")} rows · {DROID.stats.episodes} episodes · {DROID.stats.cameras} cameras</Label>
                  </div>
                </Slab>
              </At>
              {/* column heads */}
              <At p={[0, HEAD_Y, 0]} o={glide(f, C.lanceStores + 10, 120)} name="Column heads">
                <div style={{ width: W, display: "flex", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
                  {HEADS.map(([n, t, w]) => (
                    <div key={n} style={{ width: w, display: "flex", flexDirection: "column", gap: 6 }}>
                      <Label size={16} color={LANCE.offwhite}>{n}</Label>
                      <Label size={14} color={LANCE.dark400}>{t}</Label>
                    </div>
                  ))}
                </div>
              </At>
              {/* rows */}
              {Array.from({ length: rowCount }, (_, i) => {
                const r = ROWS[i];
                const isOverflow = i >= BASE_ROWS && i < BASE_ROWS + OVERFLOW_ROWS;
                const isNew = i >= BASE_ROWS + OVERFLOW_ROWS;
                const j = i - BASE_ROWS - OVERFLOW_ROWS;
                let o = 1;
                let px = 0;
                let pz = 0;
                let sc = 1;
                let glowV = 0;
                let tone: Tone = "card";
                let py = rowY0(i);
                if (!isOverflow && !isNew) {
                  o = glide(f, C.lanceStores + 15 + i * 5, 120);
                } else if (isOverflow) {
                  o = overflow;
                  py += (1 - overflow) * 60;
                } else {
                  const a = glide(f, arrive(j), 120);
                  o = a;
                  px = (1 - a) * 1300;
                  pz = (1 - a) * 200;
                  const idx = ramp(f, arrive(j) + 18, arrive(j) + 28);
                  const settle = ramp(f, arrive(j) + 40, arrive(j) + 70);
                  glowV = 0.8 * idx * (1 - settle) + (j === NEW_ROWS - 1 ? searchHit : 0);
                  tone = idx > 0.5 && settle < 0.5 ? "hit" : "card";
                  if (j === NEW_ROWS - 1 && searchHit > 0.5) tone = "hit";
                }
                py -= shift + windowShift;
                o *= Math.max(0, Math.min(1, (windowLimit - py) / 60));
                // rows pushed up past the column heads fade away
                o *= Math.max(0, Math.min(1, (py - (HEAD_Y + 10)) / 70));
                // C · each row
                if (i === 3) {
                  pz += 110 * lift3;
                  sc *= 1 + 0.03 * lift3;
                  glowV += 0.5 * lift3;
                } else if (!isNew) {
                  o *= 1 - 0.5 * lift3;
                }
                // E · filters
                const matches = MATCH.includes(i);
                if (!isNew && !isOverflow) {
                  // the real result set: only missed_grasp rows survive the where()
                  const failsOut = !r.missed ? failDim : 0;
                  o *= 1 - 0.7 * failsOut * (1 - filtersOff);
                  if (matches) glowV += 0.6 * robotDim * (1 - filtersOff) * (i === TOP_MATCH ? 1 : 1 - picked);
                  if (i === TOP_MATCH) {
                    pz += 120 * picked;
                    py = mix(py, -250, picked);
                    sc *= 1 + 0.06 * picked;
                  } else {
                    o *= 1 - 0.85 * picked;
                  }
                }
                if (o < 0.01) return null;
                return (
                  <At key={i} p={[px, py, pz]} s={sc} o={Math.min(1, o)} name={`Row · ${r.episode} ${r.t}s`}>
                    <Row
                      r={r}
                      tone={tone}
                      glow={glowV}
                      hl={i === 3 ? { fr: hlFr, jt: hlJt, em: hlEm } : i === TOP_MATCH ? { fr: ramp(f, C.exactFrames, C.exactFrames + 10) * picked, ac: ramp(f, C.actions2 - 4, C.actions2 + 8) * picked } : undefined}
                    />
                  </At>
                );
              })}

              {/* E · the exact frames + actions of the fork miss (hits.jpg, real timestamps/values) */}
              {picked > 0.01 && (
                <At p={[0, -40, 120]} o={picked} name={`Exact frames · ${HIT.episode}`}>
                  <Slab w={W + 20} h={300} d={20} tone="idle" radius={16}>
                    <div style={{ position: "absolute", inset: 0, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <Label size={20} color={LANCE.dark200}>{HIT.episode} · {HIT.t0.toFixed(2)}–{HIT.t1.toFixed(2)} s · {HIT.rows} rows</Label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {HIT.frames.map((fr, n) => {
                          const s = pop(f, C.exactFrames + 6 + n * 5);
                          return (
                            <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${Math.max(0.01, s)})`, opacity: Math.min(1, s * 1.4) }}>
                              <Frame src={SRC.hits} meta={DROID.hitSprite} k={fr.k} w={148} />
                              <Label size={18} color={LANCE.dark200}>{fr.t.toFixed(2)}s</Label>
                            </div>
                          );
                        })}
                      </div>
                      {[
                        ["gripper_position", HIT.frames.map((fr) => fr.grip)],
                        ["action[6]", HIT.frames.map((fr) => fr.actGrip)],
                      ].map(([name, vals], m) => {
                        const s = ramp(f, C.actions2 - 6 + m * 8, C.actions2 + 8 + m * 8);
                        return (
                          <div key={name as string} style={{ display: "flex", flexDirection: "column", gap: 4, opacity: s }}>
                            <Label size={16} color={LANCE.dark300}>{name as string}</Label>
                            <div style={{ display: "flex", gap: 10 }}>
                            {(vals as number[]).map((v, n) => (
                              <div key={n} style={{ width: 148, textAlign: "center", padding: "4px 0", borderRadius: 8, background: LANCE.dark700 }}>
                                <Label size={22} color={m === 0 && v >= 0.97 ? LANCE.orange300 : LANCE.offwhite}>{v.toFixed(2)}</Label>
                              </div>
                            ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Slab>
                </At>
              )}

              {/* D · Lance plate under the table */}
              {plateIn > 0.01 && (
                <At p={[0, mix(760, 545, plateIn), 0]} o={Math.min(1, plateIn * 1.5) * (1 - ramp(f, C.oneQuery - 20, C.oneQuery + 6))} name="Lance plate">
                  <Slab w={W + 40} h={78} d={34} tone="idle" radius={16} glow={teamGlow * 0.8}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                      <Label size={38} color={LANCE.offwhite}>Lance</Label>
                      <Label size={26} color={LANCE.dark300}>format</Label>
                    </div>
                  </Slab>
                </At>
              )}

              {/* D → E · LanceDB lid, then the real query (DROID.query, run in export_video_data.py) */}
              {lidIn > 0.01 && (
                <At p={[mix(0, -980, queryMorph), mix(mix(-1150, -615, lidIn), -260, queryMorph), 0]} o={Math.min(1, lidIn * 1.5) * (1 - lidGone)} name="LanceDB lid → query">
                  <Slab w={mix(W + 40, 900, queryMorph)} h={mix(112, 330, queryMorph)} d={34} tone="idle" radius={18} glow={teamGlow * 0.8 + 0.25 * ramp(f, C.lancedb + 8, C.lancedb + 20) * (1 - ramp(f, C.lancedb + 40, C.lancedb + 80))}>
                    <div style={{ position: "absolute", left: 24, right: 24, top: 0, height: mix(112, 80, queryMorph), display: "flex", alignItems: "center", justifyContent: queryMorph < 0.5 ? "center" : "space-between" }}>
                      <div style={{ transform: `scale(${mix(1, 0.62, queryMorph)})`, transformOrigin: queryMorph < 0.5 ? "50% 50%" : "0 50%" }}>
                        <LogoImg h={62} />
                      </div>
                      {queryMorph > 0.5 && (
                        <div style={{ opacity: ramp(f, C.robot - 4, C.robot + 10), padding: "6px 14px", borderRadius: 10, background: LANCE.orange400 }}>
                          <Label size={26} color={LANCE.dark800} fringe={0}>{DROID.hitRows} rows · {DROID.events.length} episodes</Label>
                        </div>
                      )}
                    </div>
                    {queryMorph > 0.5 && (
                      <div style={{ position: "absolute", left: 30, top: 84, display: "flex", flexDirection: "column", gap: 8 }}>
                        {DROID.query.split("\n").map((line, n) => {
                          const o = ramp(f, C.oneQuery + 10 + n * 8, C.oneQuery + 22 + n * 8);
                          const parts = line.split('"missed_grasp"');
                          return (
                            <div key={n} style={{ opacity: o, whiteSpace: "pre" }}>
                              <Label size={30} color={LANCE.dark100}>
                                {parts[0]}
                                {parts.length > 1 && <span style={{ color: LANCE.orange300, textShadow: `0 0 ${18 * failDim}px rgba(255,115,74,0.9)` }}>"missed_grasp"</span>}
                                {parts.length > 1 ? parts[1] : null}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Slab>
                </At>
              )}
            </At>
          )}

          {/* ── F · LanceDB Enterprise ───────────────────────────────────── */}
          {entIn > 0.01 && worldOut < 0.99 && (
            <At p={ENT} s={Math.max(0.01, entIn)} o={1 - worldOut} name="LanceDB Enterprise">
              <Slab w={1060} h={250} d={50} tone="idle" radius={30} glow={0.35 + 0.5 * ramp(f, C.spreads, C.spreads + 10) * (1 - ramp(f, C.spreads + 30, C.spreads + 70))}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
                  <LogoImg h={92} />
                  <Label size={76} color={LANCE.orange300} mono={false}>Enterprise</Label>
                </div>
              </Slab>
            </At>
          )}

          {/* ── F · the cluster (sophon docs/web/enterprise/distributed-search.mdx) ──
               A query node plans the search and combines results. Three executors
               each cache two index segments (A–F, loaded from the bucket), search
               them, and return up to 10 candidates; the query node keeps the top 10. */}
          {qnIn > 0.01 && worldOut < 0.99 && (
            <At p={QN} s={Math.max(0.01, qnIn)} o={1 - worldOut} name="Query node">
              <Slab w={560} h={150} d={40} tone={qnLit > 0.5 ? "hit" : "card"} radius={24} glow={qnLit * 0.7 + 0.4 * ramp(f, C.spreads - 6, C.spreads + 4) * (1 - ramp(f, C.spreads + 20, C.spreads + 40))}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Label size={42} color={qnLit > 0.5 ? LANCE.dark800 : LANCE.offwhite} fringe={qnLit > 0.5 ? 0 : 1}>query node</Label>
                  <Label size={24} color={qnLit > 0.5 ? LANCE.dark700 : LANCE.dark300} fringe={0}>plan · combine</Label>
                </div>
              </Slab>
            </At>
          )}
          {topIn > 0.01 && worldOut < 0.99 && topGone < 0.99 && (
            <At p={[QN[0] + 440, QN[1], 40]} s={Math.max(0.01, topIn)} o={(1 - worldOut) * (1 - topGone)} name="Top 10 results">
              <Chip text="top 10" size={40} tone="hit" glow={0.7} d={16} />
            </At>
          )}
          {EXEC.map((p, i) => {
            const s = exIn(i);
            if (s < 0.01 || worldOut > 0.99) return null;
            const lit = segLit(i);
            const cached = cacheFill(i);
            return (
              <At key={i} p={p} s={Math.max(0.01, s)} o={1 - worldOut} name={`Executor ${i + 1}`}>
                <Slab w={340} h={250} d={40} tone="card" radius={22} glow={lit * 0.6 + segRefresh * 0.5 + (i === 1 ? searchHit * 0.6 : 0)}>
                  <div style={{ position: "absolute", inset: 0, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16, transformStyle: "preserve-3d" }}>
                    <Label size={30} color={LANCE.offwhite}>executor {i + 1}</Label>
                    <div style={{ display: "flex", gap: 14, transformStyle: "preserve-3d" }}>
                      {SEGS[i].map((g) => (
                        <div key={g} style={{ transformStyle: "preserve-3d", opacity: 0.25 + 0.75 * cached, transform: `scale(${0.7 + 0.3 * cached})` }}>
                          <Chip text={g} size={44} w={120} tone={lit > 0.5 || segRefresh > 0.5 ? "hit" : cached > 0.9 ? "big" : "dim"} glow={lit * 0.5} d={14} />
                        </div>
                      ))}
                    </div>
                    <Label size={20} color={LANCE.dark300} fringe={0}>index cache</Label>
                  </div>
                </Slab>
              </At>
            );
          })}
          {/* segments load from the bucket into each executor's cache */}
          {EXEC.map((p, i) => (
            <Pulse key={`c${i}`} a={[BUCKET[0] + (i - 1) * 300, BUCKET[1] - 200, 60]} b={[p[0], p[1] + 135, 30]} t={cacheFill(i)} size={24} />
          ))}
          {/* subplans down, candidates back up */}
          {EXEC.map((p, i) => (
            <Pulse key={`q${i}`} a={[QN[0], QN[1] + 80, 30]} b={[p[0], p[1] - 130, 30]} t={subplan(i)} size={30} />
          ))}
          {EXEC.map((p, i) => {
            const t = cand(i);
            if (t <= 0.001 || t >= 0.999) return null;
            return (
              <At key={`k${i}`} p={[mix(p[0], QN[0], t), mix(p[1] - 130, QN[1] + 80, t), 50]} name={`Candidates ${i + 1}`}>
                <Chip text="10" size={30} tone="hit" glow={0.5} d={10} />
              </At>
            );
          })}
          {/* G · index updates as episodes land, then a search reaches the newest one */}
          {[0, 1, 2, 3].map((j) => (
            <Pulse key={`u${j}`} a={[BUCKET[0], BUCKET[1] + 180, 60]} b={[EXEC[j % 3][0], EXEC[j % 3][1] + 135, 30]} t={ramp(f, arrive(j) + 26, arrive(j) + 52)} size={22} />
          ))}
          <Pulse a={[QN[0], QN[1] + 80, 30]} b={[EXEC[1][0], EXEC[1][1] - 130, 30]} t={ramp(f, C.searchable - 26, C.searchable - 8)} size={30} />
          <Pulse a={[EXEC[1][0], EXEC[1][1] + 135, 30]} b={[BUCKET[0], BUCKET[1] + 192, 80]} t={ramp(f, C.searchable - 6, C.searchable + 14)} size={32} />

          {/* ── H · open source, laptop → Enterprise ─────────────────────── */}
          {lanceIn > 0.01 && (
            <At p={[-240, -150, 0]} s={Math.max(0.01, lanceIn) * mix(1, 0.6, endCard)} o={1 - endCard} name="End · Lance">
              <Slab w={440} h={210} d={40} tone="idle" radius={26}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Label size={68} color={LANCE.offwhite} mono={false}>Lance</Label>
                  <Label size={26} color={LANCE.dark300}>format</Label>
                </div>
              </Slab>
            </At>
          )}
          {lancedbIn > 0.01 && (
            <At p={[240, -150, 0]} s={Math.max(0.01, lancedbIn) * mix(1, 0.6, endCard)} o={1 - endCard} name="End · LanceDB">
              <Slab w={440} h={210} d={40} tone="idle" radius={26}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                  <LogoImg h={64} />
                  <Label size={26} color={LANCE.dark300}>database</Label>
                </div>
              </Slab>
            </At>
          )}
          {ossIn > 0.01 && (
            <At p={[0, 40, 30]} s={Math.max(0.01, ossIn) * mix(1, 0.6, endCard)} o={1 - endCard} name="End · open source">
              <Chip text="open source" size={44} tone="big" d={16} />
            </At>
          )}
          {endLapIn > 0.01 && (
            <At p={[300, -110, 0]} s={Math.max(0.01, endLapIn) * mix(1, 0.6, endCard)} o={1 - endCard} name="End · your laptop">
              <div style={{ position: "relative", width: 400, height: 300, transformStyle: "preserve-3d" }}>
                <Slab w={400} h={250} d={20} tone="dim" radius={18}>
                  <div style={{ position: "absolute", inset: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[0, 1, 2].map((n) => (
                      <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <RowThumb k={ROWS[n].wrist} w={92} r={6} />
                        <div style={{ flex: 1, height: 12, borderRadius: 6, background: LANCE.dark500 }} />
                      </div>
                    ))}
                  </div>
                </Slab>
                <div style={{ position: "absolute", left: -20, top: 250, transformStyle: "preserve-3d", transformOrigin: "50% 0", transform: "rotateX(76deg)" }}>
                  <Slab w={440} h={170} d={14} tone="idle" radius={14} />
                </div>
              </div>
            </At>
          )}
          {arrowIn > 0.01 && (
            <At p={[555, -110, 20]} o={Math.min(1, arrowIn * 2) * (1 - endCard)} name="End · arrow">
              <div style={{ display: "flex", alignItems: "center", transformStyle: "preserve-3d" }}>
                <Slab w={Math.max(1, 70 * arrowIn)} h={14} d={10} tone="hit" radius={7} outline={false} />
                <div style={{ width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `30px solid ${LANCE.orange400}`, opacity: arrowIn }} />
              </div>
            </At>
          )}
          {endEntIn > 0.01 && (
            <At p={[800, -110, 0]} s={Math.max(0.01, endEntIn) * mix(1, 0.6, endCard)} o={1 - endCard} name="End · Enterprise">
              <Slab w={400} h={250} d={40} tone="idle" radius={22} glow={0.4}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                  <LogoImg h={50} />
                  <Label size={46} color={LANCE.orange300} mono={false}>Enterprise</Label>
                </div>
              </Slab>
            </At>
          )}

          {/* ── end card ─────────────────────────────────────────────────── */}
          {endCard > 0.01 && (
            <At p={[0, -80, mix(-300, 0, endCard)]} o={Math.min(1, endCard * 1.4)} name="End card · LanceDB">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
                <LogoImg h={150} />
                <Label size={56} color={dotcomLit > 0.5 ? LANCE.orange300 : LANCE.dark200} style={{ textShadow: `0 0 ${24 * dotcomLit}px rgba(255,115,74,0.7)` }}>lancedb.com</Label>
              </div>
            </At>
          )}
        </div>
      </div>
      <Scanlines opacity={0.12} />
      <Fuzz opacity={0.16} />
    </div>
  );
};

export default World;
