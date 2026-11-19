import * as THREE from "three";
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { useSceneTransition, SceneTransition } from "./sceneTransition";
import { Fuzz } from "./retro";
import { WhooshStreaks } from "./WhooshStreaks";
import { CAMERA, Lights, Tag, useProjector, Rig } from "./diagramKit";

/**
 * RTE launch, V2 explainers: back to the FOTW three.js room (Ep. 03 / Ep. 05).
 * Same camera (z 17, fov 32), same light rig, same Lambert materials, same
 * projected DOM tags in Aeonik Fono — diagramKit.tsx is Ep. 05's file verbatim.
 *
 * Picture language (Cole, Nov 11: "get back to the fotw 3d style… this looks
 * claude generated but in 3d"):
 *   - a row is a small cube. Old rows dark200, new rows coral (orange400 / 300).
 *   - places are matte black platforms: object storage, a table, a node.
 *   - files are flat paper tiles (dark100): metadata files, WAL entries, SSTables.
 *   - a client is a short pillar; a query is the lavender sphere from Ep. 03.
 *   - an index is a translucent lavender layer over the rows it covers.
 *   - tags are tiny mono labels ON the thing they name. No cards, no titles,
 *     no kickers, no verdict lines.
 */

export type V3 = [number, number, number];
export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const ramp = (f: number, a: number, b: number, e: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
export const io = Easing.inOut(Easing.cubic);
export const back = (k = 1.6) => Easing.out(Easing.back(k));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const hop = (a: V3, b: V3, t: number, lift = 0.8): V3 => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t) + Math.sin(t * Math.PI) * lift,
  mix(a[2], b[2], t),
];
/** 1 at `at`, decaying to 0 over n frames */
export const flash = (f: number, at: number, n = 18) => (f < at ? 0 : Math.max(0, 1 - (f - at) / n));

/** grid slot: `cols` across x, rows going back in -z, centred on origin */
export const slot = (i: number, cols: number, rows: number, pitch: number, y = 0): V3 => [
  ((i % cols) - (cols - 1) / 2) * pitch,
  y,
  (Math.floor(i / cols) - (rows - 1) / 2) * pitch,
];
/** stacked slot: fills a cols×cols layer, then the next one up */
export const stack = (k: number, cols: number, pitch: number): V3 => {
  const per = cols * cols;
  const layer = Math.floor(k / per);
  const r = k % per;
  return [((r % cols) - (cols - 1) / 2) * pitch, pitch * (layer + 0.5), (Math.floor(r / cols) - (cols - 1) / 2) * pitch];
};

/** camera rig keyframes [[frame, rig], …], eased between neighbours */
export const rigPath = (f: number, keys: [number, Partial<Rig>][]): Rig => {
  const ks = ["tilt", "yaw", "y", "z", "x", "scale"] as const;
  const def: Rig = { tilt: 0.7, yaw: 0, y: 0, z: 0, x: 0, scale: 1.12 }; // fill the frame like Ep. 03/05
  const out: any = {};
  for (const k of ks) {
    const fs = keys.map((q) => q[0]);
    const vs = keys.map((q) => (q[1][k] ?? (def as any)[k]) as number);
    out[k] = keys.length === 1 ? vs[0] : interpolate(f, fs, vs, { ...clamp, easing: io });
  }
  return out as Rig;
};

export const useKit = () =>
  useMemo(() => {
    const lam = (color: string, e = 0, opts: Partial<THREE.MeshLambertMaterialParameters> = {}) =>
      new THREE.MeshLambertMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(LANCE.orange300), emissiveIntensity: e, ...opts });
    const basic = (color: string, opacity = 1) =>
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    return {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 20, 14),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 28),
      m: {
        idle: lam(LANCE.dark200),
        dim: lam(LANCE.dark500),
        ghost: lam(LANCE.dark600),
        plate: lam(LANCE.dark700),
        plateHi: lam("#262220"),
        pillar: lam(LANCE.dark400),
        paper: lam(LANCE.dark100, 0.05),
        done: lam(LANCE.orange400, 0.14),
        live: lam(LANCE.orange300, 0.62),
        lav: basic(LANCE.lavender),
        lavGlass: lam(LANCE.lavender, 0, { transparent: true, opacity: 0.28, depthWrite: false, emissive: new THREE.Color(LANCE.lavender), emissiveIntensity: 0.25 }),
        glass: lam(LANCE.dark300, 0, { transparent: true, opacity: 0.16, depthWrite: false }),
        rim: basic(LANCE.dark200, 0.7),
        rimHot: basic(LANCE.orange300),
        white: basic(LANCE.offwhite),
        beam: basic(LANCE.orange300, 0.85),
        beamLav: basic(LANCE.lavender, 0.8),
        beamDim: basic(LANCE.dark400, 0.6),
      },
    };
  }, []);
export type Kit = ReturnType<typeof useKit>;

// ─── primitives (all take the kit) ────────────────────────────────────────
export const Box: React.FC<{ k: Kit; p: V3; s: V3 | number; m: THREE.Material; r?: V3 }> = ({ k, p, s, m, r }) => {
  const sc: V3 = typeof s === "number" ? [s, s, s] : s;
  // always mounted (fiber 9.8 crashes on nested insert/remove during export) — hide instead
  const vis = sc[0] > 0.001 && sc[1] > 0.001 && sc[2] > 0.001;
  return <mesh geometry={k.box} material={m} position={p} scale={vis ? sc : [1e-4, 1e-4, 1e-4]} rotation={r ?? [0, 0, 0]} visible={vis} />;
};

/** matte platform: top face at y = p[1] */
export const Plate: React.FC<{ k: Kit; p: V3; w: number; d: number; h?: number; m?: THREE.Material; rim?: number; rimMat?: THREE.Material }> = ({
  k,
  p,
  w,
  d,
  h = 0.14,
  m,
  rim = 0,
  rimMat,
}) => (
  <group position={p}>
    <Box k={k} p={[0, -h / 2, 0]} s={[w, h, d]} m={m ?? k.m.plate} />
    <Box k={k} p={[0, 0.012, d / 2]} s={[w * (rim > 0.01 ? rim : 0), 0.024, 0.03]} m={rimMat ?? k.m.rimHot} />
    <Box k={k} p={[0, 0.012, -d / 2]} s={[w * (rim > 0.01 ? rim : 0), 0.024, 0.03]} m={rimMat ?? k.m.rimHot} />
    <Box k={k} p={[-w / 2, 0.012, 0]} s={[0.03, 0.024, d * (rim > 0.01 ? rim : 0)]} m={rimMat ?? k.m.rimHot} />
    <Box k={k} p={[w / 2, 0.012, 0]} s={[0.03, 0.024, d * (rim > 0.01 ? rim : 0)]} m={rimMat ?? k.m.rimHot} />
  </group>
);

/** a row */
export const Cube: React.FC<{ k: Kit; p: V3; s?: number; m?: THREE.Material }> = ({ k, p, s = 0.18, m }) => (
  <Box k={k} p={[p[0], p[1] + s / 2, p[2]]} s={s} m={m ?? k.m.idle} />
);

/** a file: flat paper tile */
export const File: React.FC<{ k: Kit; p: V3; w?: number; d?: number; m?: THREE.Material }> = ({ k, p, w = 0.42, d = 0.3, m }) => (
  <Box k={k} p={[p[0], p[1] + 0.03, p[2]]} s={[w, 0.06, d]} m={m ?? k.m.paper} />
);

/** a client: short pillar with a light cap */
export const Pillar: React.FC<{ k: Kit; p: V3; h?: number; lit?: number; s?: number }> = ({ k, p, h = 0.9, lit = 0, s = 1 }) =>
  (
    <group position={p} scale={s > 0.01 ? [s, s, s] : [1e-4, 1e-4, 1e-4]} visible={s > 0.01}>
      <Box k={k} p={[0, h / 2, 0]} s={[0.42, h, 0.42]} m={k.m.pillar} />
      <Box k={k} p={[0, h + 0.02, 0]} s={[0.44, 0.04, 0.44]} m={lit > 0.3 ? k.m.live : k.m.white} />
    </group>
  );

/** query: the lavender sphere */
export const Query: React.FC<{ k: Kit; p: V3; s?: number }> = ({ k, p, s = 1 }) =>
  <mesh geometry={k.sphere} material={k.m.lav} position={p} scale={s > 0.01 ? [0.2 * s, 0.2 * s, 0.2 * s] : [1e-4, 1e-4, 1e-4]} visible={s > 0.01} />;

/** rod between two points; t trims it from a toward b */
export const Rod: React.FC<{ k: Kit; a: V3; b: V3; m: THREE.Material; r?: number; t?: number }> = ({ k, a, b, m, r = 0.025, t = 1 }) => {
  const tt = Math.max(t, 0.002);
  const bb: V3 = [mix(a[0], b[0], tt), mix(a[1], b[1], tt), mix(a[2], b[2], tt)];
  const dx = bb[0] - a[0], dy = bb[1] - a[1], dz = bb[2] - a[2];
  const len = Math.max(Math.hypot(dx, dy, dz), 1e-4);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / len, dy / len, dz / len));
  const vis = t > 0.001 && len > 0.005;
  return <mesh geometry={k.box} material={m} position={[(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2, (a[2] + bb[2]) / 2]} quaternion={q} scale={vis ? [r, len, r] : [1e-4, 1e-4, 1e-4]} visible={vis} />;
};

/** open glass bin (bucketKit's), floor at y */
export const Bin: React.FC<{ k: Kit; p: V3; inner: number; h: number; hot?: boolean; rise?: number }> = ({ k, p, inner, h, hot = false, rise = 1 }) => {
  const on = rise > 0.01 ? 1 : 0;
  const t = 0.035 * on, w = (inner + 0.07) * on, H = Math.max(h * rise, 0.002) * on;
  inner = inner * on;
  const rim = hot ? k.m.rimHot : k.m.rim;
  return (
    <group position={p}>
      <Box k={k} p={[0, -t / 2, 0]} s={[w + 0.02, t, w + 0.02]} m={k.m.ghost} />
      <Box k={k} p={[0, H / 2, -inner / 2 - t / 2]} s={[w, H, t]} m={k.m.glass} />
      <Box k={k} p={[0, H / 2, inner / 2 + t / 2]} s={[w, H, t]} m={k.m.glass} />
      <Box k={k} p={[-inner / 2 - t / 2, H / 2, 0]} s={[t, H, inner]} m={k.m.glass} />
      <Box k={k} p={[inner / 2 + t / 2, H / 2, 0]} s={[t, H, inner]} m={k.m.glass} />
      <Box k={k} p={[0, H, inner / 2 + t / 2]} s={[w, 0.022, 0.022]} m={rim} />
      <Box k={k} p={[0, H, -inner / 2 - t / 2]} s={[w, 0.022, 0.022]} m={rim} />
      <Box k={k} p={[-inner / 2 - t / 2, H, 0]} s={[0.022, 0.022, w]} m={rim} />
      <Box k={k} p={[inner / 2 + t / 2, H, 0]} s={[0.022, 0.022, w]} m={rim} />
    </group>
  );
};

/** dashed outline on the floor around a w×d area (a boundary: "the table", "outside") */
export const Outline: React.FC<{ k: Kit; p: V3; w: number; d: number; m: THREE.Material; o?: number; dash?: number }> = ({ k, p, w, d, m, o = 1, dash = 0.22 }) => {
  const segs: React.ReactNode[] = [];
  const side = (x0: number, z0: number, x1: number, z1: number, key: string) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.floor(len / (dash * 2));
    for (let i = 0; i < n; i++) {
      const t = (i * 2 + 0.5) / (n * 2);
      const x = mix(x0, x1, t), z = mix(z0, z1, t);
      const horiz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      segs.push(<Box key={key + i} k={k} p={[x, 0.02, z]} s={horiz ? [dash, 0.02, 0.035] : [0.035, 0.02, dash]} m={m} />);
    }
  };
  side(-w / 2, -d / 2, w / 2, -d / 2, "a");
  side(-w / 2, d / 2, w / 2, d / 2, "b");
  side(-w / 2, -d / 2, -w / 2, d / 2, "c");
  side(w / 2, -d / 2, w / 2, d / 2, "d");
  return <group position={p} visible={o > 0.01}>{segs}</group>;
};

// ─── the scene shell ──────────────────────────────────────────────────────
type Projector = ReturnType<typeof useProjector>;
export const Scene3D: React.FC<{
  name: string;
  rig: Rig;
  enter?: SceneTransition;
  exit?: SceneTransition;
  children: React.ReactNode;
  tags?: (project: Projector) => React.ReactNode;
}> = ({ name, rig, enter = "slide", exit = "slide", children, tags }) => {
  const { width, height } = useVideoConfig();
  const project = useProjector(rig);
  const frame = useCurrentFrame();
  const { opacity, transform, filter, whoosh } = useSceneTransition({ enter, exit });
  return (
    <div
      name={name}
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", backgroundColor: LANCE.dark800, opacity, transform, filter, overflow: "hidden" }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", left: 0, top: 0, background: "transparent" }}
      >
        <Lights />
        <group rotation={[rig.tilt, rig.yaw, 0]} position={[rig.x ?? 0, rig.y, rig.z]} scale={[rig.scale ?? 1, rig.scale ?? 1, rig.scale ?? 1]}>
          {children}
        </group>
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{tags ? tags(project) : null}</div>
      <Fuzz opacity={0.2} />
      <WhooshStreaks amount={whoosh} />
    </div>
  );
};

/** projected mono tag; `o` opacity */
export const T: React.FC<{ at: { left: number; top: number }; o?: number; dy?: number; size?: number; color?: string; children: React.ReactNode; align?: "center" | "left" | "right" }> = ({
  at,
  o = 1,
  dy = 0,
  size = 24,
  color = LANCE.dark200,
  children,
  align = "center",
}) =>
  o <= 0.01 ? null : (
    <Tag at={at} dy={dy} size={size} color={color} opacity={o} track="0.12em" align={align}>
      {children}
    </Tag>
  );

export const useF = () => useCurrentFrame();
export { LANCE };
