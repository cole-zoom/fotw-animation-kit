import * as THREE from "three";
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";
import { LANCE } from "./lanceTheme";
import { Rod } from "./bucketKit";
import { CAMERA, Lights, Tag } from "./diagramKit";
import { Fuzz } from "./retro";
import { WhooshStreaks } from "./WhooshStreaks";

/**
 * Ep. 04's picture language — reads against an object store.
 *
 *   object store   one tall slab on the right with a lavender rim, the same
 *                  thing on the right of both of Cole's diagrams
 *   a read         a small orange300 block (live) sitting where its bytes are
 *   a GET          a thin rod from the reader to the store, plus a puck that
 *                  goes out and comes back: one round trip is one loop
 *   a disk page    a flat plate on the floor, part of one long file strip
 *
 * Same room as every other scene: diagramKit's camera, lights, materials and
 * DOM labels; only the three state colors.
 */

/**
 * ONE object store for every Ep. 04 scene — same size, same place (Cole: "the
 * object store is not consistent"). Scenes don't pass their own x/w/h.
 */
export const STORE = { x: 4.9, w: 1.9, h: 3.9, d: 2.0 };
export const STORE_FACE = STORE.x - STORE.w / 2;

/**
 * Everything flows LEFT → RIGHT in straight lines (Cole: "linear even tho its
 * 3d"), like his two diagrams: things on the left stacked in rows, a GET is a
 * horizontal rod at that row's height into the store's left face.
 * Row 0 is the top row (col 1).
 */
export const ROWS = 10;
export const ROW_PITCH = 0.36;
export const rowY = (i: number) => 0.38 + (ROWS - 1 - i) * ROW_PITCH;
export const LIST_X = -4.0; // where the column list sits

/** The camera every Ep. 04 scene settles on: near-frontal, so rods stay level. */
export const STD_RIG = { tilt: 0.14, yaw: 0, x: -0.55, y: -1.75, z: 4.1 };

export const useReadMaterials = () =>
  useMemo(
    () => ({
      store: new THREE.MeshLambertMaterial({ color: new THREE.Color(LANCE.dark600) }),
      storeFace: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.lavender),
        emissive: new THREE.Color(LANCE.lavender),
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
      lav: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.lavender) }),
      wire: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark300), transparent: true, opacity: 0.5 }),
      wireLit: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange300) }),
      wireDim: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark500), transparent: true, opacity: 0.6 }),
      ghost: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.dark300),
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
      nullCell: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.dark400),
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
      }),
      puck: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange300) }),
      payload: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.offwhite) }),
    }),
    [],
  );

export type ReadMats = ReturnType<typeof useReadMaterials>;

/** The object store: a dark slab, a translucent lavender skin, lavender rim. */
export const ObjectStore: React.FC<{
  box: THREE.BufferGeometry;
  rm: ReadMats;
  rise?: number;
  x?: number;
  z?: number;
  glow?: number;
  w?: number;
  h?: number;
  d?: number;
}> = ({ box, rm, rise = 1, x = STORE.x, z = 0, glow = 0, w = STORE.w, h: fullH = STORE.h, d = STORE.d }) => {
  if (rise <= 0.01) return null;
  const h = fullH * rise;
  const e = 0.035;
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={box} material={rm.store} position={[0, h / 2, 0]} scale={[w * 0.94, h, d * 0.94]} />
      <mesh geometry={box} material={rm.storeFace} position={[0, h / 2, 0]} scale={[w, h, d]} />
      {/* rim on the four vertical edges and the top */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} geometry={box} material={rm.lav} position={[(sx * w) / 2, h / 2, (sz * d) / 2]} scale={[e, h, e]} />
      ))}
      <mesh geometry={box} material={rm.lav} position={[0, h, d / 2]} scale={[w, e, e]} />
      <mesh geometry={box} material={rm.lav} position={[0, h, -d / 2]} scale={[w, e, e]} />
      <mesh geometry={box} material={rm.lav} position={[-w / 2, h, 0]} scale={[e, e, d]} />
      <mesh geometry={box} material={rm.lav} position={[w / 2, h, 0]} scale={[e, e, d]} />
      {glow > 0.01 ? (
        <mesh position={[0, h / 2, d / 2 + 0.02]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={LANCE.lavender} transparent opacity={0.16 * glow} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Box outline from 12 thin rods: a bracket around a group of reads. */
export const Outline: React.FC<{
  box: THREE.BufferGeometry;
  material: THREE.Material;
  c: [number, number, number];
  s: [number, number, number];
  r?: number;
}> = ({ box, material, c, s, r = 0.02 }) => {
  const [cx, cy, cz] = c;
  const [w, h, d] = s;
  const xs = [cx - w / 2, cx + w / 2];
  const ys = [cy - h / 2, cy + h / 2];
  const zs = [cz - d / 2, cz + d / 2];
  const out: React.ReactNode[] = [];
  let k = 0;
  for (const y of ys) for (const z of zs) out.push(<Rod key={k++} box={box} material={material} a={[xs[0], y, z]} b={[xs[1], y, z]} r={r} />);
  for (const x of xs) for (const z of zs) out.push(<Rod key={k++} box={box} material={material} a={[x, ys[0], z]} b={[x, ys[1], z]} r={r} />);
  for (const x of xs) for (const y of ys) out.push(<Rod key={k++} box={box} material={material} a={[x, y, zs[0]]} b={[x, y, zs[1]]} r={r} />);
  return <>{out}</>;
};

const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * A round trip, 0..1: out to the store on the first half, back on the
 * second. `back` is true on the return leg, when the puck carries a payload.
 */
export const roundTrip = (a: [number, number, number], b: [number, number, number], t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
  if (c < 0.5) return { p: lerp3(a, b, ease(c * 2)), back: false };
  return { p: lerp3(b, a, ease((c - 0.5) * 2)), back: true };
};

/**
 * One GET: the rod (drawn while it is in flight, dimmer once done) and the
 * puck making its round trip. `t` is the trip's 0..1; below 0 nothing shows.
 */
export const GetTrip: React.FC<{
  box: THREE.BufferGeometry;
  rm: ReadMats;
  a: [number, number, number];
  b: [number, number, number];
  t: number;
  keep?: boolean;
  size?: number;
}> = ({ box, rm, a, b, t, keep = true, size = 0.13 }) => {
  if (t <= 0) return null;
  const done = t >= 1;
  if (done && !keep) return null;
  const { p, back } = roundTrip(a, b, t);
  return (
    <>
      <Rod box={box} material={done ? rm.wireDim : rm.wireLit} a={a} b={b} r={done ? 0.012 : 0.018} />
      {!done ? (
        <mesh geometry={box} material={back ? rm.payload : rm.puck} position={p} scale={[size, size, size]} />
      ) : null}
    </>
  );
};

/**
 * The full-bleed frame every Ep. 04 scene sits in: opaque dark800 ground,
 * the 3D canvas, a DOM label layer on top, Fuzz, and whoosh streaks.
 */
export const SceneShell: React.FC<{
  name: string;
  rig: { tilt: number; yaw: number; x?: number; y: number; z: number; scale?: number };
  tr: { opacity: number; transform: string; filter?: string; whoosh: number };
  meshes: React.ReactNode;
  children?: React.ReactNode;
  /** extra layers (e.g. split-screen panels) drawn above the main canvas */
  over?: React.ReactNode;
}> = ({ name, rig, tr, meshes, children, over }) => {
  const { width, height } = useVideoConfig();
  return (
    <div
      name={name}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        backgroundColor: LANCE.dark800,
        opacity: tr.opacity,
        transform: tr.transform,
        filter: tr.filter,
        overflow: "hidden",
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", left: 0, top: 0, background: "transparent" }}
      >
        <Lights />
        <group rotation={[rig.tilt, rig.yaw, 0]} position={[rig.x ?? 0, rig.y, rig.z]} scale={rig.scale ?? 1}>
          {meshes}
        </group>
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{children}</div>
      {over}
      <Fuzz opacity={0.2} />
      <WhooshStreaks amount={tr.whoosh} />
    </div>
  );
};

/** One half of a split screen: its own canvas, camera rig and label layer. */
export const Panel: React.FC<{
  top: number;
  height: number;
  rig: { tilt: number; yaw: number; x?: number; y: number; z: number };
  meshes: React.ReactNode;
  children?: React.ReactNode;
  opacity?: number;
  dy?: number;
}> = ({ top, height, rig, meshes, children, opacity = 1, dy = 0 }) => {
  const { width } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top, width, height, overflow: "hidden", opacity, transform: `translateY(${dy}px)`, backgroundColor: LANCE.dark800 }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", left: 0, top: 0, background: "transparent" }}
      >
        <Lights />
        <group rotation={[rig.tilt, rig.yaw, 0]} position={[rig.x ?? 0, rig.y, rig.z]}>
          {meshes}
        </group>
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{children}</div>
    </div>
  );
};

/** The store's name, centered on its front face like Cole's diagrams. */
export const StoreLabel: React.FC<{
  project: (p: [number, number, number]) => { left: number; top: number };
  opacity?: number;
  sub?: string;
}> = ({ project, opacity = 1, sub = "S3 · GCS · Azure" }) => {
  const at = project([STORE.x, STORE.h / 2, STORE.d / 2]);
  return (
    <>
      <Tag at={at} dy={-16} size={26} color={LANCE.lavender} track="0.08em" opacity={opacity}>
        object store
      </Tag>
      <Tag at={at} dy={18} size={18} color={LANCE.dark200} track="0.08em" opacity={opacity}>
        {sub}
      </Tag>
    </>
  );
};
