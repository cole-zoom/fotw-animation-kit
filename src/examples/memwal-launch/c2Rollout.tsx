import { staticFile } from "remotion";
import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneTransition } from "./sceneTransition";
import { cueOf } from "./cues";
import { LANCE } from "./lanceTheme";
import { Stage, At, Label, Slab, camPath, ramp, pop, mix, V3, Cam } from "./boldKit";
import { TitleBar, Panel, Icon, Frame, Laptop, ScreenIdle, VersionBadge, Beam, ICE, W, RH, PITCH } from "./ltable";
import { RL_TRAJ, RL_SPRITE } from "./rlTraj";

type P = { enter?: SceneTransition; exit?: SceneTransition };

// ═══════════════════════════════════════════════════════════════════════════
// C · RL rollouts (Nov 16, Chang #4 — Cole's C047 lines, Taylor's wording). V2 after Cole:
// "the visual does not do a good job at telling the story… help the audience understand what
// is happening at each line… use the Iceberg table… have the visuals explain the jargon".
//
// Stage A (the idea, one beat per line):
//   1  four rollout workers = robots running the model; each plays a REAL DROID episode and
//      builds its trajectory (one tile per step: what it saw + the action it took)
//   1b the trainer appears and reads the newest steps (lavender = a read)
//   2  close-up: wrist frame → frozen vision encoder (DINOv2) → its real numbers = encoder
//      outputs; those numbers then appear in every step
//   2b the step the trainer wants isn't readable yet → it waits → reruns the encoder on its GPU
// Stage B (the table — same Iceberg look as the Why section):
//   3  each worker holds a batch; one batch = one new table version (badge ticks); then the
//      workers race, two bounce (✕), their rollouts aren't in the table → trainer recomputes
//   4  same spot, a Lance table behind the Realtime Engine: every write gets ✓ ack and its row
//      is there at once; another machine reads it too; the trainer reads the encoder outputs
//      and its GPU goes idle
// Data: work/tools/export_traj.py → rlTraj.ts + work/graphics/rl_traj.jpg (real rows of the
// DROID LanceDB table). No speed numbers on screen (no Enterprise run of this workload).
// ═══════════════════════════════════════════════════════════════════════════
const RL_SRC = staticFile("examples/memwal-launch/rl_traj.jpg"); // work/graphics/rl_traj.jpg
const Img: React.FC<{ k: number; w: number; r?: number }> = ({ k, w, r = 8 }) => <Frame src={RL_SRC} meta={RL_SPRITE} k={k} w={w} r={r} />;
const EP = RL_TRAJ;
const NS = 8;
const v2 = (e: readonly number[]) => `[${e[0].toFixed(2)}, ${e[1].toFixed(2)}, …]`;
const v3 = (e: readonly number[]) => `[${e[0].toFixed(3)}, ${e[1].toFixed(3)}, ${e[2].toFixed(3)}, …]`;
const mixV3 = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const Ball: React.FC<{ c?: string; s?: number; ring?: boolean }> = ({ c = LANCE.orange300, s = 20, ring = false }) =>
  ring ? (
    <div style={{ width: s, height: s, borderRadius: s, border: `4px solid ${c}`, boxSizing: "border-box" }} />
  ) : (
    <div style={{ width: s, height: s, borderRadius: s, background: c, boxShadow: `0 0 ${s * 0.8}px ${s / 4}px ${c}` }} />
  );

// ── stage A geometry ────────────────────────────────────────────────────────
const WK_X = -800;
const WK_Y = [-330, -110, 110, 330];
const TILE = 118;
const STRIP_X = (s: number) => -560 + s * (TILE + 12);
const TR_A: V3 = [930, 0, 0];
const ENC_Y = -720;
// ── stage B geometry ────────────────────────────────────────────────────────
const X = 4400;
const BW_X = X - 1180;
const BW_Y = [-330, -110, 110, 330];
const BATCH_X = X - 900;
const TAB_X = X + 40;
const TITLE_Y = -400;
const HEAD_Y = -322;
const Y0 = -250;
const VIS = 5;
const NODE: V3 = [X - 690, 0, 20];
const TR_B: V3 = [X + 900, -220, 0];
const M3: V3 = [X + 900, 440, 0];

/** a definition card: the term, then what it means in plain words */
const Def: React.FC<{ term: string; text: string; w?: number }> = ({ term, text, w = 420 }) => (
  <div style={{ width: w, padding: "14px 18px", borderRadius: 12, background: "rgba(23,21,19,0.92)", border: `2px solid ${LANCE.dark500}`, display: "flex", flexDirection: "column", gap: 8 }}>
    <Label size={26} color={LANCE.orange300}>{term}</Label>
    <Label size={21} color={LANCE.dark100} mono={false} style={{ whiteSpace: "normal", lineHeight: 1.25 }}>{text}</Label>
  </div>
);

/** one step of a trajectory: what the camera saw, the action, and (once stored) the encoder outputs */
const StepTile: React.FC<{ e: number; s: number; enc: number; hot?: number; lav?: number }> = ({ e, s, enc, hot = 0, lav = 0 }) => {
  const st = EP[e].steps[s];
  return (
    <div style={{ borderRadius: 10, transformStyle: "preserve-3d",
      boxShadow: lav > 0.01 ? `0 0 0 ${3 + 2 * lav}px rgba(231,210,246,${lav}), 0 0 ${30 * lav}px rgba(231,210,246,${0.5 * lav})` : hot > 0.01 ? `0 0 0 4px rgba(255,137,103,${hot})` : undefined }}>
      <Slab w={TILE} h={128 + 26 * enc} d={10} tone="card" radius={10}>
        <div style={{ position: "absolute", left: 7, top: 7, display: "flex", flexDirection: "column", gap: 6 }}>
          <Img k={st.ext} w={TILE - 14} r={6} />
          <Label size={14} color={LANCE.dark300}>{`step ${s + 1}`}</Label>
          <Label size={13} color={LANCE.dark100}>{`action ${st.act[0].toFixed(2)}`}</Label>
          {enc > 0.01 ? <Label size={13} color={LANCE.lavender} style={{ opacity: enc }}>{`[${st.emb[0].toFixed(2)}, …]`}</Label> : null}
        </div>
      </Slab>
    </div>
  );
};

/** a rollout worker: a robot running the model, playing its real episode */
const Worker: React.FC<{ e: number; step: number; w?: number; live?: boolean; badge?: "check" | "x" | null; badgeO?: number }> = ({ e, step, w = 300, live = false, badge, badgeO = 1 }) => {
  const st = EP[e].steps[Math.max(0, Math.min(NS - 1, step))];
  const iw = w - 24;
  return (
    <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
      <Slab w={w} h={(iw * 9) / 16 + 60} d={14} tone={live ? "idle" : "dim"} radius={14} glow={live ? 0.25 : 0} style={{ border: `3px solid ${live ? LANCE.orange300 : LANCE.dark500}` }}>
        <div style={{ position: "absolute", left: 12, top: 12 }}>
          <Img k={st.ext} w={iw} r={8} />
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <Icon name="gear" size={22} color={live ? LANCE.orange300 : LANCE.dark300} spin={live ? step * 40 : 0} />
          <Label size={18} color={LANCE.dark100}>{`worker ${e + 1}`}</Label>
        </div>
      </Slab>
      {badge ? (
        <div style={{ position: "absolute", right: -26, top: -26, width: 60, height: 60, borderRadius: 60, opacity: badgeO, background: badge === "check" ? LANCE.orange300 : LANCE.dark600, border: `3px solid ${badge === "check" ? LANCE.orange300 : LANCE.dark300}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={badge} size={32} color={badge === "check" ? LANCE.dark800 : LANCE.dark100} />
        </div>
      ) : null}
    </div>
  );
};

/** the trainer's own GPU running the vision encoder again */
const Gpu: React.FC<{ f: number; busy: number; k: number }> = ({ f, busy, k }) => (
  <Panel w={360} h={170} tone={busy > 0.5 ? "idle" : "dim"} glow={0.3 * busy} label="GPU" sub={busy > 0.5 ? "re-running the encoder" : "idle"} labelColor={busy > 0.5 ? LANCE.orange300 : LANCE.dark300}>
    <div style={{ position: "absolute", left: 22, top: 70, display: "flex", alignItems: "center", gap: 14, opacity: 0.3 + 0.7 * busy }}>
      <Img k={k} w={96} r={6} />
      <Label size={26} color={LANCE.dark300}>→</Label>
      <Icon name="gear" size={54} color={busy > 0.5 ? LANCE.orange300 : LANCE.dark400} spin={busy > 0.5 ? f * 8 : 0} />
      <Label size={26} color={LANCE.dark300}>→</Label>
      <Label size={20} color={LANCE.lavender}>[…]</Label>
    </div>
  </Panel>
);

// ── table rows: one row = one step of a trajectory (same columns in both tables) ────────
type Step = { e: number; s: number };
const pad = (n: number) => String(n).padStart(6, "0");
const ICE_COLS: [string, string, number][] = [["exterior_1_image_uri", "string", 300], ["episode_id · timestamp_s", "string · double", 270], ["gripper_position", "double", 150], ["visual_embedding", "list<float>", 170]];
const LANCE_COLS: [string, string, number][] = [["exterior_1_jpeg", "binary", 300], ["episode_id · timestamp_s", "string · float", 270], ["gripper_position", "float", 150], ["visual_embedding", "vector[768]", 170]];
const Heads: React.FC<{ cols: [string, string, number][]; encO: number }> = ({ cols, encO }) => (
  <div style={{ width: W, display: "flex", gap: 14, padding: "0 18px", boxSizing: "border-box", position: "relative" }}>
    {cols.map(([n, t, w], i) => (
      <div key={n} style={{ width: w, display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
        <Label size={15} color={LANCE.offwhite}>{n}</Label>
        <Label size={14} color={LANCE.dark400}>{t}</Label>
        {i === 3 && encO > 0.01 ? (
          <div style={{ position: "absolute", left: -6, top: -50, opacity: encO, padding: "4px 10px", borderRadius: 8, background: "rgba(231,210,246,0.16)", border: `2px solid ${LANCE.lavender}` }}>
            <Label size={18} color={LANCE.lavender}>encoder outputs</Label>
          </div>
        ) : null}
      </div>
    ))}
  </div>
);
const StepRow: React.FC<{ st: Step; ice: boolean; fresh?: number; lavRow?: number; lavEnc?: number }> = ({ st, ice, fresh = 0, lavRow = 0, lavEnc = 0 }) => {
  const d = EP[st.e].steps[st.s];
  const ep = EP[st.e].episode;
  const tone = lavRow > 0.5 ? "big" : fresh > 0.5 ? "hit" : ice ? "dim" : "card";
  const dark = tone === "hit" || tone === "big";
  const c1 = dark ? LANCE.dark800 : LANCE.offwhite;
  return (
    <Slab w={W} h={RH} d={18} tone={tone} radius={12} glow={0.5 * fresh}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
        <div style={{ width: 300 }}>
          {ice ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Label size={14} color={dark ? LANCE.dark700 : LANCE.dark300}>…/exterior_1/</Label>
              <Label size={15} color={dark ? LANCE.dark800 : ICE}>{`${ep}_${pad(d.frame)}.jpg`}</Label>
            </div>
          ) : (
            <Img k={d.ext} w={130} r={6} />
          )}
        </div>
        <div style={{ width: 270 }}><Label size={20} color={c1}>{`${ep} · ${d.t.toFixed(2)}s`}</Label></div>
        <div style={{ width: 150 }}><Label size={22} color={c1}>{d.grip.toFixed(2)}</Label></div>
        <div style={{ padding: "6px 10px", borderRadius: 8, background: lavEnc > 0.01 ? `rgba(231,210,246,${0.25 * lavEnc})` : "transparent", boxShadow: lavEnc > 0.01 ? `0 0 0 3px rgba(231,210,246,${lavEnc})` : undefined }}>
          <Label size={18} color={dark ? LANCE.dark800 : LANCE.lavender}>{v2(d.emb)}</Label>
        </div>
      </div>
    </Slab>
  );
};

export const RolloutFlow: React.FC<P> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("rollout");
  const many = C("many", 160);
  const trajectories = C("trajectories", 244);
  const trainer = C("trainer", 388);
  const newest = C("newest", 423);
  const each = C("each", 522);
  const frozen = C("frozen", 655);
  const encoders = C("encoders", 704);
  const outputs = C("outputs", 734);
  const needs = C("needs#2", 817);
  const cant = C("cant", 901);
  const wait = C("wait", 983);
  const recompute = C("recompute", 1008);
  const standard = C("standard", 1151);
  const batch = C("batch", 1241);
  const version = C("version", 1346);
  const race = C("race", 1429);
  const arent = C("arent", 1537);
  const asks = C("asks", 1629);
  const realtime = C("realtime", 1704);
  const acknowledged = C("acknowledged", 1905);
  const machine = C("machine", 1980);
  const reads2 = C("reads", 2057);
  const instead = C("instead", 2135);

  // ═══ stage A ═══════════════════════════════════════════════════════════════
  const STEP = 30;
  const wStart = [16, many - 4, many + 6, many + 16];
  const stepOf = (w: number) => Math.floor((f - wStart[w]) / STEP);
  const tileAt = (w: number, s: number) => wStart[w] + s * STEP;
  const wIn = (w: number) => (w === 0 ? ramp(f, 0, 14) : pop(f, wStart[w] - 8));
  const encIn = ramp(f, needs - 30, needs);
  const closeUp = ramp(f, each, each + 20) * (1 - ramp(f, needs - 30, needs - 6));
  // line 2b: the step the trainer wants next isn't readable yet
  const pending = ramp(f, cant - 10, cant + 6);
  const askT = ramp(f, cant + 6, cant + 30);
  const waiting = f >= wait - 4 && f < recompute;
  const gpuA = ramp(f, recompute - 6, recompute + 8);

  const camA = camPath(f, [
    [0, { x: -470, y: -260, z: -120, rx: -4, ry: 3 }],
    [many - 16, { x: -470, y: -260, z: -120, rx: -4, ry: 3 }],
    [many + 30, { x: 40, y: -20, z: 440, rx: -4, ry: 1 }],
    [trainer - 16, { x: 40, y: -20, z: 440, rx: -4, ry: 1 }],
    [trainer + 14, { x: 150, y: -20, z: 540, rx: -4, ry: -1 }],
    [each - 6, { x: 150, y: -20, z: 540, rx: -4, ry: -1 }],
    [each + 30, { x: -80, y: ENC_Y + 40, z: 140, rx: -3, ry: 0 }],
    [needs - 40, { x: -80, y: ENC_Y + 40, z: 140, rx: -3, ry: 0 }],
    [needs, { x: 150, y: -60, z: 560, rx: -4, ry: -1 }],
    [cant - 20, { x: 150, y: -60, z: 560, rx: -4, ry: -1 }],
    [cant + 10, { x: 380, y: -40, z: 420, rx: -4, ry: -2 }],
    [standard, { x: 380, y: -40, z: 420, rx: -4, ry: -2 }],
  ]);
  // ═══ stage B ═══════════════════════════════════════════════════════════════
  const toB = ramp(f, standard - 40, standard - 4);
  const camB = camPath(f, [
    // whole line in frame: workers (X−1300) … trainer (X+1060)
    [standard - 4, { x: X - 130, y: -10, z: 560, rx: -5, ry: 1 }],
    [race - 30, { x: X - 200, y: -10, z: 520, rx: -5, ry: 2 }],
    [arent, { x: X - 60, y: 10, z: 580, rx: -5, ry: -1 }],
    [realtime + 30, { x: X - 170, y: 0, z: 620, rx: -5, ry: 0 }],
    [machine - 10, { x: X - 130, y: 10, z: 620, rx: -5, ry: -1 }],
    [instead + 60, { x: X - 90, y: 0, z: 580, rx: -5, ry: -2 }],
  ]);
  const cam: Cam = {
    x: mix(camA.x ?? 0, camB.x ?? 0, toB), y: mix(camA.y ?? 0, camB.y ?? 0, toB), z: mix(camA.z ?? 0, camB.z ?? 0, toB),
    rx: mix(camA.rx ?? 0, camB.rx ?? 0, toB), ry: mix(camA.ry ?? 0, camB.ry ?? 0, toB),
  };
  const oA = 1 - ramp(f, standard - 30, standard - 10);
  const oB = ramp(f, standard - 30, standard - 6);

  // ── 3 · Iceberg: one batch = one version, then the race ────────────────────
  const ice = 1 - ramp(f, realtime - 22, realtime - 4);
  const lance = ramp(f, realtime - 10, realtime + 10);
  const throwAt = (w: number) => (w === 0 ? version - 36 : race - 4);
  const lost = (w: number) => w === 1 || w === 3;
  const commits = [
    { at: throwAt(0) + 20, w: 0 },
    { at: throwAt(2) + 20, w: 2 },
  ];
  const batchOf = (w: number): Step[] => [0, 1, 2].map((i) => ({ e: w, s: 3 + i }));
  const base: Step[] = [{ e: 0, s: 0 }, { e: 1, s: 0 }, { e: 2, s: 0 }, { e: 3, s: 0 }, { e: 0, s: 1 }];
  const iceRows: { st: Step; at: number }[] = base.map((st) => ({ st, at: -1e9 }));
  commits.forEach((c) => batchOf(c.w).forEach((st) => iceRows.push({ st, at: c.at })));
  const verNow = 12 + commits.filter((c) => f >= c.at).length;
  const verAt = commits.reduce((m, c) => (f >= c.at ? c.at : m), -999);
  const batchIn = ramp(f, batch - 30, batch - 10);
  const bounce = (w: number) => (lost(w) ? ramp(f, throwAt(w) + 20, throwAt(w) + 44) : 0);
  const verXY: V3 = [TAB_X - W / 2 - 170, TITLE_Y + 10, 20];

  // ── 4 · Realtime Engine: every write lands at once ─────────────────────────
  const writes: { st: Step; at: number; w: number }[] = [];
  for (let i = 0; i < 44; i++) {
    const w = i % 4;
    writes.push({ st: { e: w, s: 3 + (Math.floor(i / 4) % 5) }, at: realtime + 6 + i * 12, w });
  }
  const landed = writes.filter((x) => f >= x.at + 18);
  const lastW = (w: number) => [...writes].reverse().find((x) => x.w === w && f >= x.at + 18);
  const ackPop = ramp(f, acknowledged - 6, acknowledged + 10);
  const m3In = pop(f, machine - 26);
  const readNow = ramp(f, reads2 - 6, reads2 + 8);
  const gpuIdle = ramp(f, instead - 4, instead + 12);
  const newestRow = landed.length ? landed[landed.length - 1] : null;

  const rowsB: React.ReactNode[] = [];
  if (ice > 0.01) {
    iceRows.filter((r) => f >= r.at).slice(-VIS).reverse().forEach((r, i) => {
      const fresh = ramp(f, r.at, r.at + 6) * (1 - ramp(f, r.at + 30, r.at + 50));
      rowsB.push(
        <At key={"i" + r.st.e + "-" + r.st.s} p={[TAB_X, Y0 + i * PITCH, 0]} o={ice * oB} name={`Iceberg row · ${EP[r.st.e].episode} step ${r.st.s + 1}`}>
          <StepRow st={r.st} ice fresh={fresh} />
        </At>,
      );
    });
  }
  if (lance > 0.01) {
    landed.slice(-VIS).reverse().forEach((r, i) => {
      const fresh = ramp(f, r.at + 18, r.at + 22) * (1 - ramp(f, r.at + 30, r.at + 44));
      const top = i === 0;
      rowsB.push(
        <At key={"l" + i} p={[TAB_X, Y0 + i * PITCH, 0]} o={lance} name={`Lance row · ${EP[r.st.e].episode} step ${r.st.s + 1}`}>
          <StepRow st={r.st} ice={false} fresh={top && f < machine - 20 ? fresh : 0} lavRow={top && f >= machine - 20 && f < reads2 - 6 ? 1 : 0} lavEnc={top ? readNow : 0} />
        </At>,
      );
    });
  }

  return (
    <Stage name="RL rollouts · what happens on each line" cam={cam} enter={enter} exit={exit} floorY={600}>
      {/* ════════ stage A · the idea ════════ */}
      {oA > 0.01 && (
        <>
          {[0, 1, 2, 3].map((w) => {
            const o = wIn(w) * oA * (1 - 0.75 * closeUp);
            const s = stepOf(w);
            return (
              <React.Fragment key={"wA" + w}>
                <At p={[WK_X, WK_Y[w], 0]} s={w === 0 ? 1 : Math.max(0.01, wIn(w))} o={Math.min(1, o * 2)} name={`Rollout worker ${w + 1} · ${EP[w].episode}`}>
                  <Worker e={w} step={Math.min(s, NS - 1)} live={s >= 0 && s < NS + 2} />
                </At>
                {Array.from({ length: NS }, (_, k) => {
                  const a = tileAt(w, k);
                  if (f < a) return null;
                  const lav = f >= newest - 6 && f < each ? ramp(f, newest + w * 6, newest + w * 6 + 10) * (k >= NS - 2 ? 1 : 0) : 0;
                  return (
                    <At key={k} p={[STRIP_X(k), WK_Y[w], 0]} o={ramp(f, a, a + 8) * o} name={`Trajectory ${w + 1} · step ${k + 1}`}>
                      <StepTile e={w} s={k} enc={encIn} hot={1 - ramp(f, a, a + 20)} lav={lav} />
                    </At>
                  );
                })}
              </React.Fragment>
            );
          })}
          {/* definitions, on the word */}
          {/* Cole, Nov 16: readable in a second; the trajectory card stays up for all of stage A */}
          <At p={[WK_X - 10, WK_Y[0] - 150, 20]} anchor="bottom" o={ramp(f, 30, 50) * oA * (1 - ramp(f, trajectories - 20, trajectories - 4))} name="Def · rollout worker">
            <Def term="rollout worker" text="runs the model on a task" w={360} />
          </At>
          <At p={[STRIP_X(3), WK_Y[0] - 110, 20]} anchor="bottom" o={ramp(f, trajectories - 4, trajectories + 12) * oA} name="Def · trajectory">
            <Def term="trajectory" text="telemetry from a worker's task, step by step" w={460} />
          </At>
          {/* the trainer — stays lit (Cole: no flicker between dim and lit) */}
          <At p={TR_A} o={pop(f, trainer - 10) * oA * (1 - 0.75 * closeUp)} name="Trainer">
            <Laptop w={340} tone="big" name="trainer">
              <ScreenIdle f={f} />
            </Laptop>
          </At>
          <At p={[TR_A[0], TR_A[1] - 150, 20]} anchor="bottom" o={ramp(f, trainer, trainer + 14) * oA * (1 - ramp(f, each - 20, each))} name="Def · trainer">
            <Def term="trainer" text="learns from the newest trajectories and updates the model" w={400} />
          </At>
          {/* reads: the newest steps stream to the trainer */}
          {[0, 1, 2, 3].map((w) => {
            const t = ramp(f, newest + w * 6, newest + w * 6 + 20);
            return t > 0 && t < 1 ? (
              <At key={"rd" + w} p={[mix(STRIP_X(NS - 1) + 70, TR_A[0] - 180, t), mix(WK_Y[w], TR_A[1], t), 20]} o={oA}>
                <Ball c={LANCE.lavender} />
              </At>
            ) : null;
          })}

          {/* line 2 · close-up: one frame → its encoder outputs (Cole: no vision-encoder box) */}
          {closeUp > 0.01 && (() => {
            const st = EP[0].steps[NS - 1];
            const inT = ramp(f, encoders - 10, encoders + 14);
            const outT = ramp(f, outputs - 10, outputs + 6);
            return (
              <>
                <At p={[-420, ENC_Y, 30]} o={closeUp} name="Close-up · wrist frame">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                    <Img k={st.wrist} w={340} r={10} />
                    <Label size={20} color={LANCE.dark300}>{`worker 1 · step ${NS} · wrist camera`}</Label>
                  </div>
                </At>
                <At p={[-130, ENC_Y, 30]} o={closeUp * ramp(f, encoders - 14, encoders)} name="Arrow">
                  <Label size={56} color={LANCE.dark300}>→</Label>
                </At>
                {inT > 0 && inT < 1 && (
                  <At p={[mix(-240, 40, inT), ENC_Y, 40]} o={closeUp}>
                    <Ball s={22} />
                  </At>
                )}
                <At p={[270, ENC_Y, 30]} o={closeUp * outT} name="Encoder outputs">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 22px", borderRadius: 12, background: "rgba(231,210,246,0.12)", border: `3px solid ${LANCE.lavender}` }}>
                    <Label size={26} color={LANCE.lavender}>encoder outputs</Label>
                    <Label size={24} color={LANCE.offwhite}>{v3(st.emb)}</Label>
                    <Label size={18} color={LANCE.dark200} mono={false}>the image as 768 numbers</Label>
                  </div>
                </At>
              </>
            );
          })()}

          {/* line 2b · the next step isn't readable yet → wait → recompute on the GPU */}
          {pending > 0.01 && (
            <>
              <At p={[STRIP_X(NS), WK_Y[0], 0]} o={pending * oA} name="Next step · not readable yet">
                <div style={{ width: TILE, height: 154, borderRadius: 10, border: `3px dashed ${LANCE.orange300}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Label size={44} color={LANCE.orange300}>?</Label>
                </div>
              </At>
              <At p={[STRIP_X(NS), WK_Y[0] - 100, 20]} anchor="bottom" o={pending * oA} name="Label · not readable yet">
                <Label size={22} color={LANCE.orange300}>not readable yet</Label>
              </At>
              {askT > 0 && askT < 1 && (
                <At p={[mix(TR_A[0] - 180, STRIP_X(NS) + 60, askT), mix(TR_A[1], WK_Y[0], askT), 30]} o={oA}>
                  <Ball c={LANCE.lavender} ring />
                </At>
              )}
              <At p={[TR_A[0], TR_A[1] - 150, 20]} anchor="bottom" o={ramp(f, wait - 6, wait + 8) * (1 - ramp(f, recompute - 2, recompute + 8)) * oA} name="Wait">
                <Label size={30} color={LANCE.lavender}>waiting…</Label>
              </At>
              <At p={[TR_A[0], TR_A[1] + 260, 10]} o={gpuA * oA} name="Trainer GPU · re-running the encoder">
                <Gpu f={f} busy={1} k={EP[0].steps[NS - 1].wrist} />
              </At>
            </>
          )}
        </>
      )}

      {/* ════════ stage B · the table ════════ */}
      {oB > 0.01 && (
        <>
          <At p={[TAB_X, 20, -90]} o={oB} name="Object storage">
            <Panel w={W + 120} h={760} tone="dim" />
          </At>
          {ice > 0.01 && (
            <>
              <At p={[TAB_X, TITLE_Y, 0]} o={ice * oB} name="Title bar · Iceberg table">
                <TitleBar title="rollouts" dot="◆" dotColor={ICE} sub="one row per step" />
              </At>
              <At p={verXY} o={ice * oB} name="Table version">
                <VersionBadge f={f} ver={verNow} changedAt={verAt} />
              </At>
              <At p={[TAB_X, HEAD_Y, 0]} o={ice * oB} name="Column heads · Iceberg">
                <Heads cols={ICE_COLS} encO={ramp(f, standard + 10, standard + 30) * (1 - ramp(f, batch - 10, batch + 10))} />
              </At>
            </>
          )}
          {lance > 0.01 && (
            <>
              <At p={[TAB_X, TITLE_Y, 0]} o={lance} name="Title bar · Lance table">
                <TitleBar title="rollouts" sub="one row per step" />
              </At>
              <At p={[TAB_X, HEAD_Y, 0]} o={lance} name="Column heads · Lance">
                <Heads cols={LANCE_COLS} encO={ramp(f, reads2 - 10, reads2 + 6)} />
              </At>
              <At p={NODE} o={lance} name="Realtime Engine">
                <Panel w={300} h={560} tone="idle" glow={0.25} label="Realtime" labelColor={LANCE.orange300}>
                  <div style={{ position: "absolute", left: 26, top: 58 }}><Label size={30} color={LANCE.orange300}>Engine</Label></div>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", opacity: ackPop }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 10, background: LANCE.dark700, border: `2px solid ${LANCE.orange300}`, transform: `scale(${1 + 0.2 * (1 - ramp(f, acknowledged, acknowledged + 14))})` }}>
                      <Icon name="check" size={28} color={LANCE.orange300} />
                      <Label size={22} color={LANCE.orange300}>ack = readable</Label>
                    </div>
                  </div>
                </Panel>
              </At>
            </>
          )}
          {rowsB}

          {/* workers */}
          {[0, 1, 2, 3].map((w) => {
            const lw = lastW(w);
            const ackO = lw ? 1 - ramp(f, lw.at + 28, lw.at + 34) : 0;
            const badge: "check" | "x" | null = ice > 0.5 ? (bounce(w) > 0.3 ? "x" : null) : lw && ackO > 0.01 ? "check" : null;
            const thrown = ice > 0.5 && f >= throwAt(w) - 10 && f < throwAt(w) + 20;
            return (
              <At key={"wB" + w} p={[BW_X, BW_Y[w], 0]} o={oB} name={`Worker ${w + 1}`}>
                <Worker e={w} step={Math.floor(f / 30) % NS} w={240} live={thrown || (lance > 0.5 && !!lw && ackO > 0.01)} badge={badge} badgeO={ice > 0.5 ? 1 : ackO} />
              </At>
            );
          })}
          {/* each worker's batch, waiting for a version (Iceberg) */}
          {ice > 0.01 &&
            [0, 1, 2, 3].map((w) => {
              const c = commits.find((x) => x.w === w);
              const gone = c ? ramp(f, c.at - 20, c.at - 16) : 0;
              const o = batchIn * (1 - gone) * ice * oB;
              if (o < 0.01) return null;
              const hl = w === 0 ? ramp(f, batch - 4, batch + 10) : lost(w) ? ramp(f, arent - 6, arent + 10) : 0;
              return (
                <At key={"bt" + w} p={[BATCH_X, BW_Y[w], 10]} o={o} name={`Worker ${w + 1} · batch waiting to commit`}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, borderRadius: 10, outline: hl > 0.01 ? `3px dashed rgba(255,137,103,${hl})` : undefined }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 150, height: 34, borderRadius: 6, background: LANCE.dark600, border: `2px solid ${LANCE.dark400}`, display: "flex", alignItems: "center", gap: 8, padding: "0 6px", boxSizing: "border-box" }}>
                        <Img k={EP[w].steps[3 + i].ext} w={44} r={4} />
                        <Label size={13} color={LANCE.dark100}>{`step ${4 + i}`}</Label>
                      </div>
                    ))}
                  </div>
                </At>
              );
            })}
          {ice > 0.01 && (
            <At p={[BATCH_X, BW_Y[0] - 100, 20]} anchor="bottom" o={batchIn * ice * oB * (1 - ramp(f, version, version + 20))} name="Label · batch">
              <Label size={22} color={LANCE.dark100}>batch</Label>
            </At>
          )}
          {ice > 0.01 && (
            <At p={[verXY[0], verXY[1] + 80, 20]} anchor="top" o={ice * oB * ramp(f, version - 30, version - 10) * (1 - ramp(f, race - 30, race - 10))} name="Label · new table version">
              <Label size={22} color={LANCE.orange300}>new table version</Label>
            </At>
          )}
          {/* throws at the next version: one lands, the others bounce */}
          {ice > 0.01 &&
            [0, 1, 2, 3].map((w) => {
              const a = throwAt(w);
              const t = ramp(f, a, a + 20);
              const b = bounce(w);
              if (t <= 0 || b >= 1 || (!lost(w) && t >= 1)) return null;
              const from: V3 = [BATCH_X + 80, BW_Y[w], 20];
              const pos = b > 0 ? mixV3(verXY, from, b) : mixV3(from, verXY, t);
              return (
                <At key={"th" + w} p={pos} o={ice * oB}>
                  <Ball s={28} c={b > 0 ? LANCE.dark300 : LANCE.orange300} />
                </At>
              );
            })}
          {/* Realtime Engine writes: worker → engine → table, one row at a time */}
          {lance > 0.01 &&
            writes.map((x, i) => {
              const t = ramp(f, x.at, x.at + 18);
              if (t <= 0 || t >= 1) return null;
              const a: V3 = [BW_X + 130, BW_Y[x.w], 20];
              const m: V3 = [NODE[0], NODE[1] + (x.w - 1.5) * 80, 30];
              const b: V3 = [TAB_X - W / 2, Y0, 20];
              return (
                <At key={"wr" + i} p={t < 0.5 ? mixV3(a, m, t * 2) : mixV3(m, b, (t - 0.5) * 2)} o={lance}>
                  <Ball />
                </At>
              );
            })}

          {/* the trainer, on another machine — and for "from any machine", a third one */}
          <At p={TR_B} o={oB} name="Trainer">
            <Laptop w={320} tone="big" name="trainer">
              {lance > 0.5 && readNow > 0.5 && newestRow ? (
                <Label size={20} color={LANCE.lavender}>{v2(EP[newestRow.st.e].steps[newestRow.st.s].emb)}</Label>
              ) : (
                <ScreenIdle f={f} />
              )}
            </Laptop>
          </At>
          <At p={[TR_B[0], TR_B[1] - 150, 20]} anchor="bottom" o={oB * lance * ramp(f, machine - 30, machine - 10)} name="Label · another machine">
            <Label size={22} color={LANCE.dark100}>trainer · another machine</Label>
          </At>
          <At p={M3} s={Math.max(0.01, m3In)} o={Math.min(1, m3In * 2) * lance} name="Another machine · reads it too">
            <Laptop w={260} tone="big" name="machine 3">
              <Icon name="search" size={60} color={LANCE.lavender} />
            </Laptop>
          </At>
          {lance > 0.5 &&
            [TR_B, M3].map((p, i) => {
              const t = ramp(f, machine - 20 + i * 8, machine + i * 8);
              return t > 0 && t < 1 ? (
                <At key={"rdB" + i} p={mixV3([TAB_X + W / 2, Y0, 20], [p[0] - 160, p[1], 20], t)} o={1}>
                  <Ball c={LANCE.lavender} />
                </At>
              ) : null;
            })}
          {/* "…aren't readable yet when the trainer asks for them" (Cole: "could be visualized better"):
              the bounced batch has an EMPTY slot in the table (dashed, linked to the batch still sitting by its worker);
              the trainer's read goes into the table, hits the empty slot (✕), and the trainer's GPU takes over */}
          {ice > 0.5 &&
            (() => {
              const slotIn = ramp(f, arent - 10, arent + 8);
              if (slotIn <= 0) return null;
              const slotY = Y0 + VIS * PITCH;
              const slot: V3 = [TAB_X, slotY, 10];
              const rd = ramp(f, asks - 24, asks);
              const miss = ramp(f, asks, asks + 8);
              const toGpu = ramp(f, asks + 12, asks + 26);
              const trL: V3 = [TR_B[0] - 165, TR_B[1] + 20, 30];
              const slotR: V3 = [TAB_X + W / 2 - 10, slotY, 30];
              return (
                <>
                  <At p={slot} o={slotIn * ice * oB} name="Empty slot · worker 2's batch">
                    <div style={{ width: W, height: RH, borderRadius: 12, border: `4px dashed ${LANCE.orange300}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: miss > 0.01 ? `rgba(255,137,103,${0.12 * miss})` : "transparent" }}>
                      <Label size={44} color={LANCE.orange300}>{miss > 0.5 ? "✕" : "?"}</Label>
                      <Label size={24} color={LANCE.orange300}>worker 2 · steps 4–6</Label>
                      <Label size={22} color={LANCE.dark200}>not in the table yet</Label>
                    </div>
                  </At>
                  {/* the same batch, still waiting by its worker */}
                  <Beam a={[BATCH_X + 90, BW_Y[1], 20]} b={[TAB_X - W / 2, slotY, 20]} t={slotIn} color={LANCE.orange300} w={3} o={0.5 * ice * oB} />
                  {/* the trainer's read */}
                  <Beam a={trL} b={slotR} t={rd} color={LANCE.lavender} w={5} o={ice * oB * (1 - ramp(f, asks + 30, asks + 44))} />
                  {rd > 0 && rd < 1 && (
                    <At p={mixV3(trL, slotR, rd)} o={oB}>
                      <Ball c={LANCE.lavender} s={22} />
                    </At>
                  )}
                  {/* → recompute on its own GPU */}
                  <Beam a={[TR_B[0], TR_B[1] + 200, 30]} b={[TR_B[0], TR_B[1] + 245, 30]} t={toGpu} color={LANCE.orange300} w={5} o={ice * oB} />
                </>
              );
            })()}
          <At p={[TR_B[0], TR_B[1] + 330, 10]} o={oB * ramp(f, asks + 14, asks + 28)} name="Trainer GPU">
            <Gpu f={f} busy={ice > 0.5 ? 1 : 1 - gpuIdle} k={EP[1].steps[3].wrist} />
          </At>
        </>
      )}
    </Stage>
  );
};
