import * as THREE from "three";
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";

/**
 * Shared machinery for Ep. 02's four explainer scenes.
 *
 * Ep. 01 built two diagram families (PartitionDiagram3D, ThreadPoolDiagram3D)
 * that each re-declared the same lighting rig, the same camera, the same HUD
 * and the same three materials. Ep. 02 has four scenes across two families, so
 * that all lives here once. Same room, same light, same type — a viewer should
 * not be able to tell which file drew a given frame.
 *
 * The one genuinely new thing is `useProjector`.
 *
 * ─── Why labels are DOM, not TextGeometry ────────────────────────────────
 * These diagrams have to name things: q0, p4, "top-k". Ep. 01's scenes never
 * did, which is why it got away with a HUD line in the corner and nothing in
 * the scene. Three.js text would mean loading a typeface into a font loader,
 * losing Aeonik Fono, and rendering type at whatever the canvas resolution is.
 *
 * Instead the camera is fixed and fully known, so the same projection the
 * renderer does can be redone in plain JS: `useProjector` returns world → CSS
 * pixels. Labels are then real DOM text in the real typeface, with the same
 * chromatic fringe as every other caption in the show, sitting exactly on the
 * object they name and following the camera move for free.
 */

export const CAMERA = { z: 17, fov: 32 };

export type Rig = {
  tilt: number;
  yaw: number;
  y: number;
  z: number;
  x?: number;
  scale?: number;
};

/**
 * World-space point -> CSS pixels inside the scene root.
 *
 * Mirrors exactly what <ThreeCanvas camera={{position:[0,0,CAMERA.z], fov}}>
 * plus <group rotation={[tilt,yaw,0]} position={[x,y,z]} scale={s}> does, so a
 * label lands on its mesh at every frame of the camera move with no drift.
 */
export const useProjector = (rig: Rig, size?: { width: number; height: number }) => {
  const vc = useVideoConfig();
  // `size` is for a canvas smaller than the frame (Ep. 04's split screen)
  const width = size?.width ?? vc.width;
  const height = size?.height ?? vc.height;

  // The camera never moves and its projection only depends on the frame size,
  // so it is built once. The rig DOES change every frame, so its matrix is
  // rebuilt per frame — one Matrix4, not a whole camera.
  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(CAMERA.fov, width / height, 0.1, 1000);
    c.position.set(0, 0, CAMERA.z);
    c.updateMatrixWorld();
    c.updateProjectionMatrix();
    return c;
  }, [width, height]);

  return useMemo(() => {
    const group = new THREE.Object3D();
    group.position.set(rig.x ?? 0, rig.y, rig.z);
    group.rotation.set(rig.tilt, rig.yaw, 0);
    const s = rig.scale ?? 1;
    group.scale.set(s, s, s);
    group.updateMatrix();
    const m = group.matrix;

    const v = new THREE.Vector3();
    return (p: [number, number, number]) => {
      v.set(p[0], p[1], p[2]).applyMatrix4(m).project(cam);
      return {
        left: (v.x * 0.5 + 0.5) * width,
        top: (-v.y * 0.5 + 0.5) * height,
        // < 1 means behind the camera; nothing here ever should be, but a
        // label that flips to the far side of the frame is the worst possible
        // failure mode so callers can check it.
        infront: v.z < 1,
      };
    };
  }, [cam, rig.tilt, rig.yaw, rig.y, rig.z, rig.x, rig.scale, width, height]);
};

/** The key/fill/bounce rig from Ep. 01, unchanged. */
export const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.55} color={LANCE.dark100} />
    <directionalLight position={[6, 9, 8]} intensity={1.15} color={LANCE.offwhite} />
    <directionalLight position={[-8, 3, 5]} intensity={0.35} color={LANCE.dark100} />
  </>
);

/** One shared unit cube. Every bar, puck and tile in every scene scales this. */
export const useBox = () => useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

/**
 * The show's diagram materials. `emissive` is always orange300 so a lit object
 * glows the same hue it would reflect — anything else reads as a second light.
 */
export const useMaterials = () =>
  useMemo(() => {
    const make = (color: string, emissiveIntensity: number) =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(LANCE.orange300),
        emissiveIntensity,
      });
    return {
      idle: make(LANCE.dark200, 0),
      dim: make(LANCE.dark500, 0),
      plate: make(LANCE.dark600, 0),
      done: make(LANCE.orange400, 0.14),
      live: make(LANCE.orange300, 0.62),
      cool: make(LANCE.dark100, 0.1),
      ghost: make(LANCE.dark600, 0),
    };
  }, []);

export type MatKey = keyof ReturnType<typeof useMaterials>;

/** Linear 0..1 across the whole scene, eased the way both Ep. 01 rigs ease. */
export const useSceneT = (
  easing: (n: number) => number = Easing.bezier(0.35, 0, 0.18, 1),
) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

/**
 * The playhead marker, identical in construction to Ep. 01's read bracket:
 * a nearly-invisible plane, a bright rail on top, a marker cube above that.
 */
export const Playhead: React.FC<{
  x: number;
  z?: number;
  height?: number;
  depth: number;
  opacity?: number;
}> = ({ x, z = 0, height = 1.2, depth, opacity = 1 }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, height * 0.38, 0]}>
      <boxGeometry args={[0.05, height, depth]} />
      <meshBasicMaterial color={LANCE.orange400} transparent opacity={0.07 * opacity} />
    </mesh>
    <mesh position={[0, height * 0.38 + height / 2 + 0.04, 0]}>
      <boxGeometry args={[0.05, 0.05, depth]} />
      <meshBasicMaterial color={LANCE.orange300} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, height * 0.38 + height / 2 + 0.24, 0]}>
      <boxGeometry args={[0.09, 0.09, 0.09]} />
      <meshBasicMaterial color={LANCE.orange300} transparent opacity={opacity} />
    </mesh>
  </group>
);

// ─── HUD — DO NOT USE WITHOUT ASKING ──────────────────────────────────────
//
// `Kicker`, `Stat`, `Figure` and `hudPad` are UNUSED by every scene and should
// stay that way. The rule, after they had been stripped scene by scene:
//
//   For all animations, do without the subtitle text: it reads as AI
//   generated and usually doesn't add much value.
//
// Scene titles, running counters and verdict lines are all off. The objects
// carry their own labels, the captions carry the words, and the VO carries
// the numbers. They are kept here only so an old scene can be read without
// breaking — do not reach for them for a new one unless Cole asks.
//
// ──────────────────────────────────────────────────────────────────────────
// Ep. 01 dropped its scene titles because the VO said them. Ep. 02 keeps a
// title, because these four scenes come in BEFORE/AFTER pairs and the pairing
// is the whole argument — without the kicker the second scene just looks like
// a different picture rather than the same picture fixed.

export const hudPad = "64px 88px";

export const Kicker: React.FC<{
  children: React.ReactNode;
  tone?: "before" | "after";
  opacity?: number;
}> = ({ children, tone = "before", opacity = 1 }) => (
  <div
    name="Kicker"
    style={{
      fontFamily: AEONIK_FONO,
      fontWeight: 500,
      fontSize: 27,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: tone === "before" ? LANCE.dark200 : LANCE.orange300,
      opacity,
    }}
  >
    {children}
  </div>
);

export const Stat: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <div
    name="Stat"
    style={{
      fontFamily: AEONIK_FONO,
      fontSize: 26,
      color: LANCE.dark200,
      textAlign: "right",
      opacity,
    }}
  >
    {children}
  </div>
);

export const Figure: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: LANCE.orange400, fontWeight: 500 }}>{children}</span>
);

/**
 * A label pinned to a world-space point. `dy` nudges it in CSS pixels so type
 * can sit above or below the mesh it names without moving the mesh.
 */
export const Tag: React.FC<{
  at: { left: number; top: number };
  children: React.ReactNode;
  dy?: number;
  size?: number;
  color?: string;
  opacity?: number;
  weight?: number;
  track?: string;
  align?: "center" | "left" | "right";
}> = ({
  at,
  children,
  dy = 0,
  size = 24,
  color = LANCE.offwhite,
  opacity = 1,
  weight = 500,
  track = "0.08em",
  align = "center",
}) => (
  <div
    style={{
      position: "absolute",
      left: at.left,
      top: at.top + dy,
      transform:
        align === "center"
          ? "translate(-50%, -50%)"
          : align === "left"
            ? "translate(0, -50%)"
            : "translate(-100%, -50%)",
      fontFamily: AEONIK_FONO,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: track,
      whiteSpace: "nowrap",
      color,
      opacity,
      textShadow: chroma(1.3),
      pointerEvents: "none",
    }}
  >
    {children}
  </div>
);

/** Count up to a target, but hold it once reached — never snap back to 0. */
export const counter = (progress: number, total: number) =>
  Math.round(Math.max(0, Math.min(1, progress)) * total).toLocaleString("en-US");
