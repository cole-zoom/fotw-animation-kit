import * as THREE from "three";
import React, { useMemo } from "react";
import { LANCE } from "./lanceTheme";

/**
 * The picture language for everything after the IVF scene: vectors are the
 * same little cubes IvfIndex3D scatters on its field, centroids are the same
 * off-white spheres, and a bucket is an actual bucket — an open glass bin the
 * cubes pour into and stack up in. How full a bin is IS how much data that
 * bucket holds, so "uneven bucket sizes" is something you see, not a chart.
 *
 * Counts are always real counts: a bin holding 48 cubes has 48 meshes in it.
 */

// deterministic jitter — same seed style as IvfIndex3D, so renders repeat
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** A point in a unit disc, fixed per index (area-uniform). */
export const discOffset = (i: number, salt = 0): [number, number] => {
  const a = rand(i * 3.1 + salt) * Math.PI * 2;
  const r = Math.sqrt(rand(i * 7.7 + 99 + salt));
  return [Math.cos(a) * r, Math.sin(a) * r];
};

/**
 * Where the k-th cube sits inside a bin (bin-local, floor at y=0).
 * Fills layer by layer, `cols`×`cols` per layer, like cubes settling.
 */
export const stackPos = (k: number, cols: number, pitch: number): [number, number, number] => {
  const per = cols * cols;
  const layer = Math.floor(k / per);
  const r = k % per;
  const cx = (r % cols) - (cols - 1) / 2;
  const cz = Math.floor(r / cols) - (cols - 1) / 2;
  return [cx * pitch, pitch * (layer + 0.5), cz * pitch];
};

/** Fill height of a bin holding `n` cubes, measured continuously (n / per-layer). */
export const fillHeight = (n: number, cols: number, pitch: number) => (n / (cols * cols)) * pitch;

export const useBinMaterials = () =>
  useMemo(
    () => ({
      glass: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.dark300),
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
      glassLit: new THREE.MeshLambertMaterial({
        color: new THREE.Color(LANCE.orange300),
        emissive: new THREE.Color(LANCE.orange300),
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
      base: new THREE.MeshLambertMaterial({ color: new THREE.Color(LANCE.dark600) }),
      rim: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark200), transparent: true, opacity: 0.7 }),
      rimLit: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange300) }),
      rimDone: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange400) }),
      centroid: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.offwhite) }),
      centroidLit: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.orange300) }),
      spent: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark400) }),
      branch: new THREE.MeshBasicMaterial({ color: new THREE.Color(LANCE.dark300), transparent: true, opacity: 0.55 }),
    }),
    [],
  );

export type BinMats = ReturnType<typeof useBinMaterials>;

/**
 * An open-topped glass bin. `rise` 0..1 grows it up out of the floor; the
 * walls are see-through so the cubes stacked inside always read.
 */
export const Bin: React.FC<{
  box: THREE.BufferGeometry;
  mats: BinMats;
  x: number;
  z?: number;
  y?: number;
  inner: number;
  height: number;
  rise?: number;
  tone?: "idle" | "live" | "done" | "hot";
}> = ({ box, mats, x, z = 0, y = 0, inner, height, rise = 1, tone = "idle" }) => {
  if (rise <= 0.01) return null;
  const t = 0.035;
  const w = inner + t * 2;
  const h = height * rise;
  const glass = tone === "hot" ? mats.glassLit : mats.glass;
  const rim = tone === "live" || tone === "hot" ? mats.rimLit : tone === "done" ? mats.rimDone : mats.rim;
  return (
    <group position={[x, y, z]}>
      <mesh geometry={box} material={mats.base} position={[0, -t / 2, 0]} scale={[w + 0.02, t, w + 0.02]} />
      <mesh geometry={box} material={glass} position={[0, h / 2, -inner / 2 - t / 2]} scale={[w, h, t]} />
      <mesh geometry={box} material={glass} position={[0, h / 2, inner / 2 + t / 2]} scale={[w, h, t]} />
      <mesh geometry={box} material={glass} position={[-inner / 2 - t / 2, h / 2, 0]} scale={[t, h, inner]} />
      <mesh geometry={box} material={glass} position={[inner / 2 + t / 2, h / 2, 0]} scale={[t, h, inner]} />
      {/* rim: four bright edges at the lip, so the bin shape reads at a glance */}
      <mesh geometry={box} material={rim} position={[0, h, inner / 2 + t / 2]} scale={[w + 0.01, 0.022, 0.022]} />
      <mesh geometry={box} material={rim} position={[0, h, -inner / 2 - t / 2]} scale={[w + 0.01, 0.022, 0.022]} />
      <mesh geometry={box} material={rim} position={[-inner / 2 - t / 2, h, 0]} scale={[0.022, 0.022, w]} />
      <mesh geometry={box} material={rim} position={[inner / 2 + t / 2, h, 0]} scale={[0.022, 0.022, w]} />
    </group>
  );
};

/** A thin straight rod between two points — tree branches, drop lines. */
export const Rod: React.FC<{
  box: THREE.BufferGeometry;
  material: THREE.Material;
  a: [number, number, number];
  b: [number, number, number];
  r?: number;
}> = ({ box, material, a, b, r = 0.022 }) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  if (len < 0.005) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / len, dy / len, dz / len));
  return (
    <mesh
      geometry={box}
      material={material}
      position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}
      quaternion={q}
      scale={[r, len, r]}
    />
  );
};

/** Smooth hop from a to b with an arc of `lift` at the midpoint. */
export const hop = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
  lift = 0.6,
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * lift,
  a[2] + (b[2] - a[2]) * t,
];
